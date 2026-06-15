import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const s = schema(req);

      const { rows: totalRows } = await query(`SELECT COUNT(*) as count FROM ${s}.dosen`);
      const total = parseInt(totalRows[0].count, 10);

      const { rows } = await query(
        `SELECT d.*, u.email, u.no_hp, u.foto_url, u.is_active, u.nidn, u.nik,
                p.nama as prodi_nama
         FROM ${s}.dosen d
         LEFT JOIN ${s}.users u ON u.id = d.user_id
         LEFT JOIN ${s}.program_studi p ON p.id = d.program_studi_id
         ORDER BY d.nama
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:nidn',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT d.*, u.email, u.no_hp, u.foto_url, u.is_active, u.nidn, u.nik, u.tempat_lahir, u.tanggal_lahir, u.jenis_kelamin, u.alamat,
                p.nama as prodi_nama, p.jenjang as prodi_jenjang
         FROM ${s}.dosen d
         LEFT JOIN ${s}.users u ON u.id = d.user_id
         LEFT JOIN ${s}.program_studi p ON p.id = d.program_studi_id
         WHERE d.nidn = $1`,
        [req.params.nidn]
      );
      if (rows.length === 0) throw new AppError(404, 'Dosen tidak ditemukan');
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
  [
    body('nidn').notEmpty().withMessage('NIDN wajib diisi'),
    body('nama').notEmpty().withMessage('Nama wajib diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nidn, nama, email, password, program_studi_id, is_dosen_wali, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_hp } = req.body;

      const { rows: exist } = await query(
        `SELECT id FROM ${s}.dosen WHERE nidn = $1`,
        [nidn]
      );
      if (exist.length > 0) throw new AppError(409, 'NIDN sudah terdaftar');

      const passwordHash = await bcrypt.hash(password, 12);
      const userId = uuid();
      const dosenId = uuid();

      await query(
        `INSERT INTO ${s}.users (id, email, password_hash, role, nama, nidn, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_hp, must_change_password)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [userId, email, passwordHash, 'dosen', nama, nidn, nik || null, tempat_lahir || null, tanggal_lahir || null, jenis_kelamin || null, alamat || null, no_hp || null, true]
      );

      await query(
        `INSERT INTO ${s}.dosen (id, user_id, nidn, nama, program_studi_id, is_dosen_wali)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [dosenId, userId, nidn, nama, program_studi_id || null, is_dosen_wali || false]
      );

      sendSuccess(res, { id: dosenId, nidn, nama }, 'Dosen berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:nidn',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nama, program_studi_id, is_dosen_wali, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_hp } = req.body;

      const { rows: existing } = await query(
        `SELECT id, user_id FROM ${s}.dosen WHERE nidn = $1`,
        [req.params.nidn]
      );
      if (existing.length === 0) throw new AppError(404, 'Dosen tidak ditemukan');

      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (nama !== undefined) { fields.push(`nama = $${idx++}`); values.push(nama); }
      if (program_studi_id !== undefined) { fields.push(`program_studi_id = $${idx++}`); values.push(program_studi_id); }
      if (is_dosen_wali !== undefined) { fields.push(`is_dosen_wali = $${idx++}`); values.push(is_dosen_wali); }

      if (fields.length > 0) {
        values.push(existing[0].id);
        await query(`UPDATE ${s}.dosen SET ${fields.join(', ')} WHERE id = $${idx}`, values);
      }

      sendSuccess(res, null, 'Data dosen diperbarui');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:nidn',
  authenticate,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `DELETE FROM ${s}.dosen WHERE nidn = $1 RETURNING id, user_id`,
        [req.params.nidn]
      );
      if (rows.length === 0) throw new AppError(404, 'Dosen tidak ditemukan');
      await query(`DELETE FROM ${s}.users WHERE id = $1`, [rows[0].user_id]);
      sendSuccess(res, null, 'Dosen berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
