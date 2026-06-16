import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { v4 as uuid } from 'uuid';
import { query as dbQuery } from '../../config/database.js';
import { validate } from '../../middleware/validator.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';
import { syncPddikti, getToken } from './pddikti.service.js';

const router = Router();

function s(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

const ENTITY_TYPES = ['Mahasiswa', 'Dosen', 'KRS', 'Nilai'] as const;

const ENTITY_MAP: Record<string, { table: string; countQuery: string }> = {
  Mahasiswa: { table: 'mahasiswa', countQuery: 'SELECT COUNT(*) as count FROM {s}.mahasiswa WHERE status = $1' },
  Dosen: { table: 'dosen', countQuery: 'SELECT COUNT(*) as count FROM {s}.dosen' },
  KRS: { table: 'krs', countQuery: 'SELECT COUNT(*) as count FROM {s}.krs' },
  Nilai: { table: 'mata_kuliah', countQuery: 'SELECT COUNT(*) as count FROM {s}.mata_kuliah WHERE is_active = true' },
};

async function countRecords(schema: string, type: string): Promise<number> {
  const cfg = ENTITY_MAP[type];
  if (!cfg) return 0;
  const params = type === 'Mahasiswa' ? ['aktif'] : [];
  const { rows } = await dbQuery(cfg.countQuery.replace(/\{s\}/g, schema), params);
  return parseInt(rows[0]?.count || '0', 10);
}

async function validateStudent(schema: string): Promise<any[]> {
  const errors: any[] = [];
  const { rows: students } = await dbQuery(
    `SELECT m.nim, m.nama, u.email FROM ${schema}.mahasiswa m
     LEFT JOIN ${schema}.users u ON u.id = m.user_id`
  );
  students.forEach((m: any) => {
    if (!m.nim || String(m.nim).length < 8) {
      errors.push({ id: 'VAL' + uuid().slice(0, 8), type: 'Mahasiswa', message: `NIM ${m.nama} (${m.nim || '-'}) tidak sesuai format (min 8 digit).`, priority: 'Tinggi', field: 'NIM' });
    }
    if (!m.email || !m.email.includes('@')) {
      errors.push({ id: 'VAL' + uuid().slice(0, 8), type: 'Mahasiswa', message: `Email ${m.nama} (${m.email || '-'}) tidak valid.`, priority: 'Sedang', field: 'EMAIL' });
    }
  });
  return errors;
}

async function validateLecturer(schema: string): Promise<any[]> {
  const errors: any[] = [];
  const { rows: lecturers } = await dbQuery(
    `SELECT d.nidn, d.nama FROM ${schema}.dosen d WHERE d.nidn IS NOT NULL`
  );
  const nidnMap = new Map<string, string[]>();
  lecturers.forEach((l: any) => {
    if (!nidnMap.has(l.nidn)) nidnMap.set(l.nidn, []);
    nidnMap.get(l.nidn)!.push(l.nama);
  });
  nidnMap.forEach((names, nidn) => {
    if (names.length > 1) {
      errors.push({ id: 'VAL' + uuid().slice(0, 8), type: 'Dosen', message: `NIDN ${nidn} digunakan oleh ${names.length} dosen (${names.join(', ')}).`, priority: 'Tinggi', field: 'NIDN' });
    }
  });
  return errors;
}

async function validateKrs(schema: string): Promise<any[]> {
  const errors: any[] = [];
  const { rows: schedules } = await dbQuery(
    `SELECT jk.id FROM ${schema}.jadwal_kuliah jk
     WHERE jk.dosen_id IS NULL OR jk.mata_kuliah_id IS NULL`
  );
  schedules.forEach((s: any) => {
    errors.push({ id: 'VAL' + uuid().slice(0, 8), type: 'KRS', message: `Jadwal ${s.id || '-'} memiliki dosen atau mata kuliah kosong.`, priority: 'Sedang', field: 'KRS' });
  });
  return errors;
}

async function validateNilai(schema: string): Promise<any[]> {
  const errors: any[] = [];
  const { rows: courses } = await dbQuery(
    `SELECT mk.kode, mk.nama, mk.sks FROM ${schema}.mata_kuliah mk WHERE mk.sks < 1 OR mk.sks IS NULL`
  );
  courses.forEach((c: any) => {
    errors.push({ id: 'VAL' + uuid().slice(0, 8), type: 'Nilai', message: `Mata kuliah ${c.nama || c.kode} memiliki bobot SKS ${c.sks || 0} tidak valid.`, priority: 'Tinggi', field: 'SKS' });
  });
  return errors;
}

async function saveSyncRun(schema: string, type: string, synced: number, failed: number, status: string, errors: any[], errorDetail?: string): Promise<any> {
  const runId = uuid();
  await dbQuery(
    `INSERT INTO ${schema}.pddikti_sync_runs (id, entity_type, records_synced, records_failed, status, errors, error_detail, finished_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [runId, type, synced, failed, status, JSON.stringify(errors.slice(0, 50)), errorDetail || null]
  );
  const { rows } = await dbQuery(`SELECT * FROM ${schema}.pddikti_sync_runs WHERE id = $1`, [runId]);
  return rows[0];
}

// GET /pddikti/config
router.get(
  '/config',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { rows } = await dbQuery(`SELECT id, feeder_url, username, database_name, is_active, last_sync_at FROM ${schema}.pddikti_config LIMIT 1`);
      if (rows.length === 0) {
        const { rows: created } = await dbQuery(
          `INSERT INTO ${schema}.pddikti_config (feeder_url, is_active) VALUES ($1, $2) RETURNING id, feeder_url, username, database_name, is_active, last_sync_at`,
          ['http://localhost:8085', false]
        );
        sendSuccess(res, created[0]);
      } else {
        sendSuccess(res, rows[0]);
      }
    } catch (err) { next(err); }
  }
);

// PUT /pddikti/config
router.put(
  '/config',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { feeder_url, username, password, database_name, is_active } = req.body;

      const { rows: existing } = await dbQuery(`SELECT id FROM ${schema}.pddikti_config LIMIT 1`);

      if (existing.length > 0) {
        const setFields: string[] = [];
        const params: any[] = [];
        let idx = 1;
        if (feeder_url !== undefined) { setFields.push(`feeder_url = $${idx++}`); params.push(feeder_url); }
        if (username !== undefined) { setFields.push(`username = $${idx++}`); params.push(username); }
        if (password !== undefined) { setFields.push(`password = $${idx++}`); params.push(password); }
        if (database_name !== undefined) { setFields.push(`database_name = $${idx++}`); params.push(database_name); }
        if (is_active !== undefined) { setFields.push(`is_active = $${idx++}`); params.push(is_active); }
        setFields.push('updated_at = NOW()');
        params.push(existing[0].id);
        const updateStr = `UPDATE ${schema}.pddikti_config SET ${setFields.join(', ')} WHERE id = $${params.length}`;
        await dbQuery(updateStr, params);
      } else {
        await dbQuery(
          `INSERT INTO ${schema}.pddikti_config (feeder_url, username, password, database_name, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [feeder_url || 'http://localhost:8085', username || '', password || '', database_name || '', is_active !== false]
        );
      }

      const { rows } = await dbQuery(`SELECT id, feeder_url, username, database_name, is_active, last_sync_at FROM ${schema}.pddikti_config LIMIT 1`);
      sendSuccess(res, rows[0], 'Konfigurasi PDDIKTI disimpan');
    } catch (err) { next(err); }
  }
);

// POST /pddikti/test-connection
router.post(
  '/test-connection',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { rows } = await dbQuery(`SELECT feeder_url, username, password, database_name FROM ${schema}.pddikti_config LIMIT 1`);
      if (rows.length === 0) throw new AppError(400, 'Konfigurasi belum ada');

      const token = await getToken(rows[0]);
      sendSuccess(res, { success: true, message: 'Koneksi berhasil' });
    } catch (err: any) {
      sendSuccess(res, { success: false, message: err.message });
    }
  }
);

// GET /pddikti — List sync runs
router.get(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { rows } = await dbQuery(
        `SELECT * FROM ${schema}.pddikti_sync_runs ORDER BY started_at DESC`
      );
      sendSuccess(res, rows);
    } catch (err) { next(err); }
  }
);

// GET /pddikti/validate — Validation errors before sync
router.get(
  '/validate',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const errors = [
        ...await validateStudent(schema),
        ...await validateLecturer(schema),
        ...await validateKrs(schema),
        ...await validateNilai(schema),
      ];
      sendSuccess(res, errors);
    } catch (err) { next(err); }
  }
);

// POST /pddikti/sync — Real sync via Neo Feeder
router.post(
  '/sync',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('type').isIn(ENTITY_TYPES).withMessage('Tipe sinkronisasi tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { type } = req.body;
      const total = await countRecords(schema, type);

      let synced = 0;
      let failed = 0;
      let status = 'Diproses';
      let errors: any[] = [];
      let errorDetail: string | undefined;

      // Pre-validation
      const validationErrors: any[] = [];
      if (type === 'Mahasiswa') validationErrors.push(...await validateStudent(schema));
      if (type === 'Dosen') validationErrors.push(...await validateLecturer(schema));
      if (type === 'KRS') validationErrors.push(...await validateKrs(schema));
      if (type === 'Nilai') validationErrors.push(...await validateNilai(schema));

      try {
        const result = await syncPddikti(schema, type);
        synced = result.synced;
        failed = result.failed;
        errors = result.errors;
        status = failed === 0 ? 'Sukses' : 'Peringatan';
      } catch (err: any) {
        failed = total;
        status = 'Gagal';
        errorDetail = err.message;
        errors = validationErrors;
      }

      const run = await saveSyncRun(schema, type, synced, failed, status, [...validationErrors, ...errors], errorDetail);

      sendSuccess(res, run, status === 'Sukses'
        ? `Sinkronisasi ${type} berhasil (${synced}/${total} record)`
        : `Sinkronisasi ${type} gagal: ${errorDetail || `${failed} error`}`, 201);
    } catch (err) { next(err); }
  }
);

// GET /pddikti/stats — Sync statistics
router.get(
  '/stats',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);

      const [totalR, suksesR, gagalR, peringatanR, totalFailedR, totalSyncedR] = await Promise.all([
        dbQuery(`SELECT COUNT(*) as count FROM ${schema}.pddikti_sync_runs`),
        dbQuery(`SELECT COUNT(*) as count FROM ${schema}.pddikti_sync_runs WHERE status = 'Sukses'`),
        dbQuery(`SELECT COUNT(*) as count FROM ${schema}.pddikti_sync_runs WHERE status = 'Gagal'`),
        dbQuery(`SELECT COUNT(*) as count FROM ${schema}.pddikti_sync_runs WHERE status = 'Peringatan'`),
        dbQuery(`SELECT COALESCE(SUM(records_failed), 0) as sum FROM ${schema}.pddikti_sync_runs`),
        dbQuery(`SELECT COALESCE(SUM(records_synced), 0) as sum FROM ${schema}.pddikti_sync_runs`),
      ]);

      const total = parseInt(totalR.rows[0].count, 10);
      const totalSynced = parseInt(totalSyncedR.rows[0].sum, 10);
      const totalFailed = parseInt(totalFailedR.rows[0].sum, 10);
      const ratio = totalSynced + totalFailed > 0
        ? ((totalSynced / (totalSynced + totalFailed)) * 100).toFixed(1)
        : '100.0';

      const recordCounts: Record<string, number> = {};
      for (const t of ENTITY_TYPES) {
        recordCounts[t] = await countRecords(schema, t);
      }

      sendSuccess(res, {
        totalLogs: total,
        sukses: parseInt(suksesR.rows[0].count, 10),
        gagal: parseInt(gagalR.rows[0].count, 10),
        peringatan: parseInt(peringatanR.rows[0].count, 10),
        ratio: ratio + '%',
        totalSynced,
        totalFailed,
        recordCounts,
      });
    } catch (err) { next(err); }
  }
);

export default router;
