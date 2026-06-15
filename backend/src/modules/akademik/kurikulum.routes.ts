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
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const programStudiId = req.query.program_studi_id as string;

      let sql = `SELECT k.*, ps.nama as prodi_nama
                 FROM ${s}.kurikulum k
                 LEFT JOIN ${s}.program_studi ps ON ps.id = k.program_studi_id`;

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (programStudiId) {
        conditions.push(`k.program_studi_id = $${idx++}`);
        params.push(programStudiId);
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const countSql = `SELECT COUNT(*) as count FROM (${sql}) sub`;
      const { rows: countRows } = await query(countSql, params);
      const total = parseInt(countRows[0].count, 10);

      sql += ` ORDER BY k.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(limit, offset);

      const { rows } = await query(sql, params);
      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows: kurikulum } = await query(
        `SELECT k.*, ps.nama as prodi_nama
         FROM ${s}.kurikulum k
         LEFT JOIN ${s}.program_studi ps ON ps.id = k.program_studi_id
         WHERE k.id = $1`,
        [req.params.id]
      );
      if (kurikulum.length === 0) throw new AppError(404, 'Kurikulum tidak ditemukan');

      const { rows: mataKuliah } = await query(
        `SELECT km.id, km.semester, km.wajib, mk.kode, mk.nama, mk.sks, mk.jenis
         FROM ${s}.kurikulum_matakuliah km
         JOIN ${s}.mata_kuliah mk ON mk.id = km.mata_kuliah_id
         WHERE km.kurikulum_id = $1
         ORDER BY km.semester, mk.kode`,
        [req.params.id]
      );

      sendSuccess(res, { ...kurikulum[0], mata_kuliah: mataKuliah });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('kode').notEmpty().withMessage('Kode kurikulum wajib diisi'),
    body('nama').notEmpty().withMessage('Nama kurikulum wajib diisi'),
    body('tahun_mulai').isInt({ min: 1900 }).withMessage('Tahun mulai tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { kode, nama, program_studi_id, tahun_mulai, tahun_selesai, total_sks, is_active } = req.body;

      const id = uuid();
      await query(
        `INSERT INTO ${s}.kurikulum (id, kode, nama, program_studi_id, tahun_mulai, tahun_selesai, total_sks, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, kode, nama, program_studi_id || null, tahun_mulai, tahun_selesai || null, total_sks || 0, is_active !== undefined ? is_active : true]
      );

      sendSuccess(res, { id }, 'Kurikulum berhasil ditambahkan', 201);
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
    body('kode').optional().notEmpty().withMessage('Kode kurikulum tidak boleh kosong'),
    body('nama').optional().notEmpty().withMessage('Nama kurikulum tidak boleh kosong'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { kode, nama, program_studi_id, tahun_mulai, tahun_selesai, total_sks, is_active } = req.body;

      const sets: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (kode !== undefined) { sets.push(`kode = $${idx++}`); params.push(kode); }
      if (nama !== undefined) { sets.push(`nama = $${idx++}`); params.push(nama); }
      if (program_studi_id !== undefined) { sets.push(`program_studi_id = $${idx++}`); params.push(program_studi_id); }
      if (tahun_mulai !== undefined) { sets.push(`tahun_mulai = $${idx++}`); params.push(tahun_mulai); }
      if (tahun_selesai !== undefined) { sets.push(`tahun_selesai = $${idx++}`); params.push(tahun_selesai); }
      if (total_sks !== undefined) { sets.push(`total_sks = $${idx++}`); params.push(total_sks); }
      if (is_active !== undefined) { sets.push(`is_active = $${idx++}`); params.push(is_active); }
      sets.push(`updated_at = NOW()`);

      if (sets.length === 1) throw new AppError(400, 'Tidak ada data yang diubah');

      params.push(req.params.id);
      const { rows } = await query(
        `UPDATE ${s}.kurikulum SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id`,
        params
      );
      if (rows.length === 0) throw new AppError(404, 'Kurikulum tidak ditemukan');

      sendSuccess(res, rows[0], 'Kurikulum berhasil diubah');
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
      const { rows } = await query(
        `DELETE FROM ${s}.kurikulum WHERE id = $1 RETURNING id`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Kurikulum tidak ditemukan');
      sendSuccess(res, null, 'Kurikulum berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/mata-kuliah',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('mata_kuliah_id').isUUID().withMessage('Mata kuliah tidak valid'),
    body('semester').isInt({ min: 1 }).withMessage('Semester tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { mata_kuliah_id, semester, wajib } = req.body;

      const { rows: kurikulum } = await query(
        `SELECT id FROM ${s}.kurikulum WHERE id = $1`,
        [req.params.id]
      );
      if (kurikulum.length === 0) throw new AppError(404, 'Kurikulum tidak ditemukan');

      const { rows: existing } = await query(
        `SELECT id FROM ${s}.kurikulum_matakuliah WHERE kurikulum_id = $1 AND mata_kuliah_id = $2`,
        [req.params.id, mata_kuliah_id]
      );
      if (existing.length > 0) throw new AppError(409, 'Mata kuliah sudah ada di kurikulum ini');

      const id = uuid();
      await query(
        `INSERT INTO ${s}.kurikulum_matakuliah (id, kurikulum_id, mata_kuliah_id, semester, wajib)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, req.params.id, mata_kuliah_id, semester, wajib !== undefined ? wajib : true]
      );

      sendSuccess(res, { id }, 'Mata kuliah berhasil ditambahkan ke kurikulum', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:kurikulum_id/mata-kuliah/:mk_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `DELETE FROM ${s}.kurikulum_matakuliah WHERE kurikulum_id = $1 AND mata_kuliah_id = $2 RETURNING id`,
        [req.params.kurikulum_id, req.params.mk_id]
      );
      if (rows.length === 0) throw new AppError(404, 'Mata kuliah tidak ditemukan di kurikulum ini');
      sendSuccess(res, null, 'Mata kuliah berhasil dihapus dari kurikulum');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
