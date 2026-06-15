import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { query } from '../../config/database.js';
import { validate } from '../../middleware/validator.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess, sendPaginated } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';

const router = Router();

function schema(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

router.get(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KAPRODI, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const dosenId = req.query.dosen_id as string;
      const status = req.query.status as string;
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;
      const user = req.user!;

      let sql = `SELECT a.*, d.nama as dosen_nama, d.nidn
                 FROM ${s}.absensi_dosen a
                 LEFT JOIN ${s}.dosen d ON d.id = a.dosen_id`;
      const countSql = `SELECT COUNT(*) as total FROM ${s}.absensi_dosen a`;
      const params: unknown[] = [];
      const countParams: unknown[] = [];
      const conditions: string[] = [];
      const countConditions: string[] = [];

      if (user.role === Role.DOSEN) {
        conditions.push(`a.dosen_id = $${params.length + 1}`);
        params.push(user.id);
        countConditions.push(`a.dosen_id = $${countParams.length + 1}`);
        countParams.push(user.id);
      } else if (dosenId) {
        conditions.push(`a.dosen_id = $${params.length + 1}`);
        params.push(dosenId);
        countConditions.push(`a.dosen_id = $${countParams.length + 1}`);
        countParams.push(dosenId);
      }

      if (status) {
        conditions.push(`a.status = $${params.length + 1}`);
        params.push(status);
        countConditions.push(`a.status = $${countParams.length + 1}`);
        countParams.push(status);
      }
      if (startDate) {
        conditions.push(`a.tanggal >= $${params.length + 1}`);
        params.push(startDate);
        countConditions.push(`a.tanggal >= $${countParams.length + 1}`);
        countParams.push(startDate);
      }
      if (endDate) {
        conditions.push(`a.tanggal <= $${params.length + 1}`);
        params.push(endDate);
        countConditions.push(`a.tanggal <= $${countParams.length + 1}`);
        countParams.push(endDate);
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      sql += ` ORDER BY a.tanggal DESC, a.jam_masuk DESC NULLS LAST`;
      sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      let total = 0;
      let countWhere = '';
      if (countConditions.length > 0) {
        countWhere = ` WHERE ${countConditions.join(' AND ')}`;
      }
      const countResult = await query(countSql + countWhere, countParams);
      total = parseInt(countResult.rows[0].total);

      const { rows } = await query(sql, params);
      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/today',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KAPRODI, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const user = req.user!;

      const dosenId = user.role === Role.DOSEN
        ? user.id
        : (req.query.dosen_id as string);

      if (!dosenId) {
        throw new AppError(400, 'Parameter dosen_id diperlukan');
      }

      const { rows } = await query(
        `SELECT a.*, d.nama as dosen_nama, d.nidn
         FROM ${s}.absensi_dosen a
         LEFT JOIN ${s}.dosen d ON d.id = a.dosen_id
         WHERE a.dosen_id = $1 AND a.tanggal = CURRENT_DATE`,
        [dosenId]
      );

      sendSuccess(res, rows[0] || null);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  [
    body('dosen_id').isUUID().withMessage('Dosen tidak valid'),
    body('status').isIn(['hadir', 'izin', 'sakit', 'tugas', 'alpha']).withMessage('Status tidak valid'),
    body('jam_masuk').optional({ values: 'null' }).matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage('Format jam_masuk tidak valid (HH:MM)'),
    body('jam_keluar').optional({ values: 'null' }).matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage('Format jam_keluar tidak valid (HH:MM)'),
    body('tanggal').optional({ values: 'null' }).isISO8601().withMessage('Format tanggal tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { dosen_id, status, jam_masuk, jam_keluar, keterangan, lokasi, tanggal } = req.body;

      const tanggalVal = tanggal || new Date().toISOString().slice(0, 10);

      const { rows: exist } = await query(
        `SELECT id FROM ${s}.absensi_dosen WHERE dosen_id = $1 AND tanggal = $2`,
        [dosen_id, tanggalVal]
      );

      if (exist.length > 0) {
        const { rows: updated } = await query(
          `UPDATE ${s}.absensi_dosen SET status = $1, jam_masuk = COALESCE($2, jam_masuk), jam_keluar = COALESCE($3, jam_keluar), keterangan = COALESCE($4, keterangan), lokasi = COALESCE($5, lokasi), updated_at = NOW()
           WHERE id = $6 RETURNING id`,
          [status, jam_masuk || null, jam_keluar || null, keterangan || null, lokasi || null, exist[0].id]
        );
        sendSuccess(res, updated[0], 'Absensi diperbarui');
      } else {
        const { rows: inserted } = await query(
          `INSERT INTO ${s}.absensi_dosen (id, dosen_id, tanggal, jam_masuk, jam_keluar, status, keterangan, lokasi)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [dosen_id, tanggalVal, jam_masuk || null, jam_keluar || null, status, keterangan || null, lokasi || null]
        );
        sendSuccess(res, inserted[0], 'Absensi dicatat', 201);
      }
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('status').optional().isIn(['hadir', 'izin', 'sakit', 'tugas', 'alpha']).withMessage('Status tidak valid'),
    body('jam_masuk').optional({ values: 'null' }).matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage('Format jam_masuk tidak valid'),
    body('jam_keluar').optional({ values: 'null' }).matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage('Format jam_keluar tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { id } = req.params;
      const { status, jam_masuk, jam_keluar, keterangan, lokasi } = req.body;

      const fields: string[] = [];
      const params: unknown[] = [];
      let paramIdx = 1;

      if (status !== undefined) { fields.push(`status = $${paramIdx++}`); params.push(status); }
      if (jam_masuk !== undefined) { fields.push(`jam_masuk = $${paramIdx++}`); params.push(jam_masuk || null); }
      if (jam_keluar !== undefined) { fields.push(`jam_keluar = $${paramIdx++}`); params.push(jam_keluar || null); }
      if (keterangan !== undefined) { fields.push(`keterangan = $${paramIdx++}`); params.push(keterangan); }
      if (lokasi !== undefined) { fields.push(`lokasi = $${paramIdx++}`); params.push(lokasi); }

      if (fields.length === 0) {
        throw new AppError(400, 'Tidak ada data yang diubah');
      }

      fields.push(`updated_at = NOW()`);
      params.push(id);

      const { rows } = await query(
        `UPDATE ${s}.absensi_dosen SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING id`,
        params
      );

      if (rows.length === 0) {
        throw new AppError(404, 'Absensi tidak ditemukan');
      }

      sendSuccess(res, rows[0], 'Absensi diperbarui');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { id } = req.params;

      const { rowCount } = await query(
        `DELETE FROM ${s}.absensi_dosen WHERE id = $1`,
        [id]
      );

      if (rowCount === 0) {
        throw new AppError(404, 'Absensi tidak ditemukan');
      }

      sendSuccess(res, null, 'Absensi dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/rekap/:dosen_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KAPRODI, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { dosen_id } = req.params;
      const user = req.user!;

      if (user.role === Role.DOSEN && user.id !== dosen_id) {
        throw new AppError(403, 'Anda hanya dapat melihat rekap sendiri');
      }

      const bulan = parseInt(req.query.bulan as string) || (new Date().getMonth() + 1);
      const tahun = parseInt(req.query.tahun as string) || new Date().getFullYear();

      const { rows } = await query(
        `SELECT
           d.id, d.nama, d.nidn,
           COUNT(a.id) as total_absensi,
           COALESCE(SUM(CASE WHEN a.status = 'hadir' THEN 1 ELSE 0 END), 0) as hadir,
           COALESCE(SUM(CASE WHEN a.status = 'sakit' THEN 1 ELSE 0 END), 0) as sakit,
           COALESCE(SUM(CASE WHEN a.status = 'izin' THEN 1 ELSE 0 END), 0) as izin,
           COALESCE(SUM(CASE WHEN a.status = 'tugas' THEN 1 ELSE 0 END), 0) as tugas,
           COALESCE(SUM(CASE WHEN a.status = 'alpha' THEN 1 ELSE 0 END), 0) as alpha
         FROM ${s}.dosen d
         LEFT JOIN ${s}.absensi_dosen a ON a.dosen_id = d.id
           AND EXTRACT(MONTH FROM a.tanggal) = $2
           AND EXTRACT(YEAR FROM a.tanggal) = $3
         WHERE d.id = $1
         GROUP BY d.id, d.nama, d.nidn`,
        [dosen_id, bulan, tahun]
      );

      if (rows.length === 0) {
        throw new AppError(404, 'Dosen tidak ditemukan');
      }

      const r = rows[0];
      const total_hari_kerja = 26;
      const persentase = total_hari_kerja > 0
        ? Math.round((parseInt(r.hadir) / total_hari_kerja) * 100)
        : 0;

      sendSuccess(res, { ...r, persentase, total_hari_kerja });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/rekap',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KAPRODI),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const bulan = parseInt(req.query.bulan as string) || (new Date().getMonth() + 1);
      const tahun = parseInt(req.query.tahun as string) || new Date().getFullYear();

      const { rows } = await query(
        `SELECT
           d.id, d.nama, d.nidn,
           COUNT(a.id) as total_absensi,
           COALESCE(SUM(CASE WHEN a.status = 'hadir' THEN 1 ELSE 0 END), 0) as hadir,
           COALESCE(SUM(CASE WHEN a.status = 'sakit' THEN 1 ELSE 0 END), 0) as sakit,
           COALESCE(SUM(CASE WHEN a.status = 'izin' THEN 1 ELSE 0 END), 0) as izin,
           COALESCE(SUM(CASE WHEN a.status = 'tugas' THEN 1 ELSE 0 END), 0) as tugas,
           COALESCE(SUM(CASE WHEN a.status = 'alpha' THEN 1 ELSE 0 END), 0) as alpha
         FROM ${s}.dosen d
         LEFT JOIN ${s}.absensi_dosen a ON a.dosen_id = d.id
           AND EXTRACT(MONTH FROM a.tanggal) = $1
           AND EXTRACT(YEAR FROM a.tanggal) = $2
         GROUP BY d.id, d.nama, d.nidn
         ORDER BY d.nama`,
        [bulan, tahun]
      );

      const total_hari_kerja = 26;
      const result = rows.map((r: any) => ({
        ...r,
        persentase: total_hari_kerja > 0
          ? Math.round((parseInt(r.hadir) / total_hari_kerja) * 100)
          : 0,
        total_hari_kerja,
      }));

      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
