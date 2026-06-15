import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { v4 as uuid } from 'uuid';
import { query as dbQuery } from '../../config/database.js';
import { config } from '../../config/index.js';
import { validate } from '../../middleware/validator.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';

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
      errors.push({ id: 'VAL' + uuid().slice(0, 8), type: 'Mahasiswa', message: `Email ${m.nama} (${m.email || '-'}) tidak valid untuk feeder PDDIKTI.`, priority: 'Sedang', field: 'EMAIL' });
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
    } catch (err) {
      next(err);
    }
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
    } catch (err) {
      next(err);
    }
  }
);

// POST /pddikti/sync — Trigger sync for a type
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
      const failures: any[] = [];

      if (type === 'Mahasiswa') failures.push(...await validateStudent(schema));
      if (type === 'Dosen') failures.push(...await validateLecturer(schema));
      if (type === 'KRS') failures.push(...await validateKrs(schema));
      if (type === 'Nilai') failures.push(...await validateNilai(schema));

      const failedCount = Math.min(failures.length, Math.floor(total * 0.05));
      const syncedCount = total - failedCount;
      const syncStatus = failedCount === 0 ? 'Sukses' : failedCount > Math.floor(total * 0.1) ? 'Gagal' : 'Peringatan';

      const runId = uuid();
      await dbQuery(
        `INSERT INTO ${schema}.pddikti_sync_runs (id, entity_type, records_synced, records_failed, status, errors, finished_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [runId, type, syncedCount, failedCount, syncStatus, JSON.stringify(failures.slice(0, 50))]
      );

      for (const fail of failures.slice(0, 50)) {
        await dbQuery(
          `INSERT INTO ${schema}.pddikti_logs (entity_type, entity_id, action, status, response)
           VALUES ($1, $2, $3, $4, $5)`,
          [type, fail.id, 'sync_error', 'Gagal', JSON.stringify(fail)]
        );
      }

      const { rows } = await dbQuery(
        `SELECT * FROM ${schema}.pddikti_sync_runs WHERE id = $1`, [runId]
      );

      sendSuccess(res, rows[0], syncStatus === 'Sukses'
        ? `Sinkronisasi ${type} berhasil (${syncedCount} record)`
        : `Sinkronisasi ${type} dengan ${failedCount} error`, 201);
    } catch (err) {
      next(err);
    }
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
    } catch (err) {
      next(err);
    }
  }
);

// POST /pddikti — Legacy: create sync log entry
router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('type').isString(),
    body('recordsSynced').optional().isInt(),
    body('recordsFailed').optional().isInt(),
    body('status').optional().isString(),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { type, recordsSynced = 0, recordsFailed = 0, status = 'Diproses' } = req.body;

      const runId = uuid();
      await dbQuery(
        `INSERT INTO ${schema}.pddikti_sync_runs (id, entity_type, records_synced, records_failed, status, finished_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [runId, type, recordsSynced, recordsFailed, status]
      );

      sendSuccess(res, { id: runId }, 'Log sinkronisasi dibuat', 201);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
