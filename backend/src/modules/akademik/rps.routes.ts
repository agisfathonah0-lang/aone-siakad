import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { v4 as uuid } from 'uuid';
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
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const jadwalId = req.query.jadwal_id as string;
      const pertemuan = req.query.pertemuan as string;

      let sql = `SELECT r.*, j.hari, j.jam_mulai, j.jam_selesai, j.kelas, j.tahun_akademik,
                        mk.nama as mk_nama, mk.kode as mk_kode,
                        d.nama as dosen_nama
                 FROM ${s}.rps r
                 JOIN ${s}.jadwal_kuliah j ON j.id = r.jadwal_id
                 JOIN ${s}.mata_kuliah mk ON mk.id = j.mata_kuliah_id
                 LEFT JOIN ${s}.dosen d ON d.id = j.dosen_id`;

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (jadwalId) {
        conditions.push(`r.jadwal_id = $${idx++}`);
        params.push(jadwalId);
      }
      if (pertemuan) {
        conditions.push(`r.pertemuan = $${idx++}`);
        params.push(parseInt(pertemuan, 10));
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const countSql = `SELECT COUNT(*) as count FROM (${sql}) sub`;
      const { rows: countRows } = await query(countSql, params);
      const total = parseInt(countRows[0].count, 10);

      sql += ` ORDER BY r.pertemuan LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(limit, offset);

      const { rows } = await query(sql, params);
      sendPaginated(res, rows, total, page, limit);
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
    body('jadwal_id').isUUID().withMessage('Jadwal tidak valid'),
    body('pertemuan').isInt({ min: 1 }).withMessage('Pertemuan tidak valid'),
    body('materi').notEmpty().withMessage('Materi wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { jadwal_id, pertemuan, materi, capaian_pembelajaran, metode, durasi_menit } = req.body;

      const { rows: existing } = await query(
        `SELECT id FROM ${s}.rps WHERE jadwal_id = $1 AND pertemuan = $2`,
        [jadwal_id, pertemuan]
      );
      if (existing.length > 0) throw new AppError(409, 'RPS untuk pertemuan ini sudah ada');

      const id = uuid();
      await query(
        `INSERT INTO ${s}.rps (id, jadwal_id, pertemuan, materi, capaian_pembelajaran, metode, durasi_menit)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, jadwal_id, pertemuan, materi, capaian_pembelajaran || null, metode || null, durasi_menit || 100]
      );

      sendSuccess(res, { id }, 'RPS berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  [
    body('materi').optional().notEmpty().withMessage('Materi tidak boleh kosong'),
    body('pertemuan').optional().isInt({ min: 1 }).withMessage('Pertemuan tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { pertemuan, materi, capaian_pembelajaran, metode, durasi_menit } = req.body;

      const sets: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (pertemuan !== undefined) { sets.push(`pertemuan = $${idx++}`); params.push(pertemuan); }
      if (materi !== undefined) { sets.push(`materi = $${idx++}`); params.push(materi); }
      if (capaian_pembelajaran !== undefined) { sets.push(`capaian_pembelajaran = $${idx++}`); params.push(capaian_pembelajaran); }
      if (metode !== undefined) { sets.push(`metode = $${idx++}`); params.push(metode); }
      if (durasi_menit !== undefined) { sets.push(`durasi_menit = $${idx++}`); params.push(durasi_menit); }
      sets.push(`updated_at = NOW()`);

      if (sets.length === 1) throw new AppError(400, 'Tidak ada data yang diubah');

      params.push(req.params.id);
      const { rows } = await query(
        `UPDATE ${s}.rps SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id`,
        params
      );
      if (rows.length === 0) throw new AppError(404, 'RPS tidak ditemukan');

      sendSuccess(res, rows[0], 'RPS berhasil diubah');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `DELETE FROM ${s}.rps WHERE id = $1 RETURNING id`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'RPS tidak ditemukan');
      sendSuccess(res, null, 'RPS berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
