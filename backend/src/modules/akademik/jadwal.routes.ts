import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { query } from '../../config/database.js';
import { validate } from '../../middleware/validator.js';
import { validateZod } from '../../middleware/validateZod.js';
import { jadwalCreateSchema } from '../../validation/schemas.js';
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const s = schema(req);
      const q = (req.query.q as string) || '';
      const programStudiId = (req.query.program_studi_id as string) || '';

      const conditions: string[] = [];
      const params: any[] = [];

      if (q) {
        conditions.push(`(mk.nama ILIKE $${params.length + 1} OR d.nama ILIKE $${params.length + 1} OR j.ruangan ILIKE $${params.length + 1} OR j.kelas ILIKE $${params.length + 1})`);
        params.push(`%${q}%`);
      }
      if (programStudiId) {
        conditions.push(`mk.program_studi_id = $${params.length + 1}`);
        params.push(programStudiId);
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const { rows: totalRows } = await query(
        `SELECT COUNT(*) as count FROM ${s}.jadwal_kuliah j
         LEFT JOIN ${s}.mata_kuliah mk ON mk.id = j.mata_kuliah_id
         LEFT JOIN ${s}.dosen d ON d.id = j.dosen_id
         LEFT JOIN ${s}.program_studi p ON p.id = mk.program_studi_id
         ${where}`, params
      );
      const total = parseInt(totalRows[0].count, 10);

      const { rows } = await query(
        `SELECT j.*, mk.nama as mk_nama, mk.kode as mk_kode, mk.sks,
                d.nama as dosen_nama, d.nidn as dosen_nidn,
                p.nama as prodi_nama
         FROM ${s}.jadwal_kuliah j
         LEFT JOIN ${s}.mata_kuliah mk ON mk.id = j.mata_kuliah_id
         LEFT JOIN ${s}.dosen d ON d.id = j.dosen_id
         LEFT JOIN ${s}.program_studi p ON p.id = mk.program_studi_id
         ${where}
         ORDER BY j.hari, j.jam_mulai
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT j.*, mk.nama as mk_nama, mk.kode as mk_kode, mk.sks,
                d.nama as dosen_nama, d.nidn as dosen_nidn,
                p.nama as prodi_nama
         FROM ${s}.jadwal_kuliah j
         LEFT JOIN ${s}.mata_kuliah mk ON mk.id = j.mata_kuliah_id
         LEFT JOIN ${s}.dosen d ON d.id = j.dosen_id
         LEFT JOIN ${s}.program_studi p ON p.id = mk.program_studi_id
         WHERE j.id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Jadwal tidak ditemukan');
      sendSuccess(res, rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  validateZod(jadwalCreateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { mata_kuliah_id, dosen_id, hari, jam_mulai, jam_selesai, ruangan, kelas, kuota, tahun_akademik, semester } = req.body;

      const { rows } = await query(
        `INSERT INTO ${s}.jadwal_kuliah (id, mata_kuliah_id, dosen_id, hari, jam_mulai, jam_selesai, ruangan, kelas, kuota, tahun_akademik, semester)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [mata_kuliah_id, dosen_id, hari, jam_mulai, jam_selesai, ruangan || null, kelas || null, kuota || 40, tahun_akademik, semester]
      );

      sendSuccess(res, rows[0], 'Jadwal berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      for (const key of ['mata_kuliah_id', 'dosen_id', 'hari', 'jam_mulai', 'jam_selesai', 'ruangan', 'kelas', 'kuota', 'tahun_akademik', 'semester', 'is_active']) {
        if (req.body[key] !== undefined) {
          fields.push(`${key} = $${idx++}`);
          values.push(req.body[key]);
        }
      }

      if (fields.length === 0) throw new AppError(400, 'Tidak ada data yang diubah');
      values.push(req.params.id);

      const { rows } = await query(
        `UPDATE ${s}.jadwal_kuliah SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id`,
        values
      );

      if (rows.length === 0) throw new AppError(404, 'Jadwal tidak ditemukan');
      sendSuccess(res, rows[0], 'Jadwal diperbarui');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `DELETE FROM ${s}.jadwal_kuliah WHERE id = $1 RETURNING id`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Jadwal tidak ditemukan');
      sendSuccess(res, null, 'Jadwal berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
