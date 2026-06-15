import { Router, Request, Response, NextFunction } from 'express';
import { body, query as queryParam } from 'express-validator';
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
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const s = schema(req);

      const { rows: totalRows } = await query(`SELECT COUNT(*) as count FROM ${s}.mahasiswa`);
      const total = parseInt(totalRows[0].count, 10);

      const { rows } = await query(
        `SELECT m.*, u.email, u.no_hp, u.foto_url, u.is_active,
                p.nama as prodi_nama, p.jenjang as prodi_jenjang
         FROM ${s}.mahasiswa m
         LEFT JOIN ${s}.users u ON u.id = m.user_id
         LEFT JOIN ${s}.program_studi p ON p.id = m.program_studi_id
         ORDER BY m.nim
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
  '/search',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = (req.query.q as string) || '';
      const s = schema(req);

      const { rows } = await query(
        `SELECT m.*, u.email, p.nama as prodi_nama
         FROM ${s}.mahasiswa m
         LEFT JOIN ${s}.users u ON u.id = m.user_id
         LEFT JOIN ${s}.program_studi p ON p.id = m.program_studi_id
         WHERE m.nim ILIKE $1 OR m.nama ILIKE $1
         ORDER BY m.nama LIMIT 20`,
        [`%${q}%`]
      );

      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:nim',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT m.*, u.email, u.no_hp, u.foto_url, u.is_active, u.tempat_lahir, u.tanggal_lahir, u.jenis_kelamin, u.alamat,
                p.nama as prodi_nama, p.jenjang as prodi_jenjang, p.fakultas
         FROM ${s}.mahasiswa m
         LEFT JOIN ${s}.users u ON u.id = m.user_id
         LEFT JOIN ${s}.program_studi p ON p.id = m.program_studi_id
         WHERE m.nim = $1`,
        [req.params.nim]
      );
      if (rows.length === 0) throw new AppError(404, 'Mahasiswa tidak ditemukan');

      const { rows: krsRows } = await query(
        `SELECT COUNT(*) as total_sks, AVG(n.nilai_akhir) as ipk
         FROM ${s}.krs k
         LEFT JOIN ${s}.nilai n ON n.krs_id = k.id
         LEFT JOIN ${s}.jadwal_kuliah j ON j.id = k.jadwal_id
         LEFT JOIN ${s}.mata_kuliah mk ON mk.id = j.mata_kuliah_id
         WHERE k.mahasiswa_id = $1 AND k.status = 'disetujui'`,
        [rows[0].id]
      );

      sendSuccess(res, { ...rows[0], krsRows: krsRows[0] });
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
    body('nim').notEmpty().withMessage('NIM wajib diisi'),
    body('nama').notEmpty().withMessage('Nama wajib diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('program_studi_id').isUUID().withMessage('Program studi tidak valid'),
    body('angkatan').isInt().withMessage('Angkatan harus angka'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nim, nama, email, password, program_studi_id, angkatan, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_hp } = req.body;

      const { rows: exist } = await query(
        `SELECT id FROM ${s}.mahasiswa WHERE nim = $1`,
        [nim]
      );
      if (exist.length > 0) throw new AppError(409, 'NIM sudah terdaftar');

      const passwordHash = await bcrypt.hash(password, 12);
      const userId = uuid();
      const mhsId = uuid();

      await query(
        `INSERT INTO ${s}.users (id, email, password_hash, role, nama, nim, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_hp, must_change_password)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [userId, email, passwordHash, 'mahasiswa', nama, nim, tempat_lahir || null, tanggal_lahir || null, jenis_kelamin || null, alamat || null, no_hp || null, true]
      );

      await query(
        `INSERT INTO ${s}.mahasiswa (id, user_id, nim, nama, program_studi_id, angkatan)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [mhsId, userId, nim, nama, program_studi_id, angkatan]
      );

      sendSuccess(res, { id: mhsId, nim, nama }, 'Mahasiswa berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:nim',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_hp, program_studi_id, angkatan, semester, status, ukt_golongan, ukt_nominal } = req.body;

      const { rows: existing } = await query(
        `SELECT id, user_id FROM ${s}.mahasiswa WHERE nim = $1`,
        [req.params.nim]
      );
      if (existing.length === 0) throw new AppError(404, 'Mahasiswa tidak ditemukan');

      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (nama !== undefined) { fields.push(`nama = $${idx++}`); values.push(nama); }
      if (program_studi_id !== undefined) { fields.push(`program_studi_id = $${idx++}`); values.push(program_studi_id); }
      if (angkatan !== undefined) { fields.push(`angkatan = $${idx++}`); values.push(angkatan); }
      if (semester !== undefined) { fields.push(`semester = $${idx++}`); values.push(semester); }
      if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }
      if (ukt_golongan !== undefined) { fields.push(`ukt_golongan = $${idx++}`); values.push(ukt_golongan); }
      if (ukt_nominal !== undefined) { fields.push(`ukt_nominal = $${idx++}`); values.push(ukt_nominal); }
      fields.push(`updated_at = NOW()`);

      if (fields.length > 1) {
        values.push(existing[0].id);
        await query(
          `UPDATE ${s}.mahasiswa SET ${fields.join(', ')} WHERE id = $${idx}`,
          values
        );
      }

      if (nama !== undefined) {
        await query(
          `UPDATE ${s}.users SET nama = $1 WHERE id = $2`,
          [nama, existing[0].user_id]
        );
      }

      sendSuccess(res, null, 'Data mahasiswa diperbarui');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:nim',
  authenticate,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `DELETE FROM ${s}.mahasiswa WHERE nim = $1 RETURNING id, user_id`,
        [req.params.nim]
      );
      if (rows.length === 0) throw new AppError(404, 'Mahasiswa tidak ditemukan');

      await query(`DELETE FROM ${s}.users WHERE id = $1`, [rows[0].user_id]);
      sendSuccess(res, null, 'Mahasiswa berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
