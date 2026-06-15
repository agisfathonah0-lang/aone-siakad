import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
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

router.get('/', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const s = schema(req);
    const q = req.query.q || '';

    let where = '';
    const params: any[] = [];
    if (q) {
      where = 'WHERE (email ILIKE $1 OR nama ILIKE $1 OR COALESCE(nip,\'\') ILIKE $1 OR COALESCE(nim,\'\') ILIKE $1)';
      params.push(`%${q}%`);
    }

    const { rows: data } = await query(
      `SELECT id, email, role, nama, nip, nim, nidn, nik, is_active, must_change_password, last_login, created_at, updated_at FROM ${s}.users ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    const { rows: countRows } = await query(`SELECT COUNT(*) as total FROM ${s}.users ${where}`, params);

    sendPaginated(res, data, page, limit, parseInt(countRows[0].total));
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, requireRole(Role.ADMIN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { rows } = await query(`SELECT id, email, role, nama, nip, nim, nidn, nik, is_active, must_change_password, last_login, created_at FROM ${s}.users WHERE id = $1`, [req.params.id]);
    if (rows.length === 0) throw new AppError(404, 'User tidak ditemukan');
    sendSuccess(res, rows[0]);
  } catch (err) { next(err); }
});

router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN),
  [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('nama').notEmpty().withMessage('Nama wajib diisi'),
    body('role').isIn(['admin', 'akademik', 'keuangan', 'dosen', 'mahasiswa', 'alumni']).withMessage('Role tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { email, password, nama, role } = req.body;
      const password_hash = await bcrypt.hash(password, 12);
      const { rows } = await query(
        `INSERT INTO ${s}.users (email, password_hash, nama, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role, nama, nip, nim, nidn, nik, is_active, must_change_password, last_login, created_at, updated_at`,
        [email, password_hash, nama, role]
      );
      sendSuccess(res, rows[0], 'User berhasil dibuat');
    } catch (err) { next(err); }
  }
);

router.put(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { role, nama, is_active } = req.body;
      const updates: string[] = [];
      const params: any[] = [];

      if (role !== undefined) { updates.push(`role = $${params.length + 1}`); params.push(role); }
      if (nama !== undefined) { updates.push(`nama = $${params.length + 1}`); params.push(nama); }
      if (is_active !== undefined) { updates.push(`is_active = $${params.length + 1}`); params.push(is_active); }

      if (updates.length === 0) throw new AppError(400, 'Tidak ada data yang diubah');

      params.push(req.params.id);
      const { rows } = await query(
        `UPDATE ${s}.users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING id, email, role, nama, nip, nim, is_active`,
        params
      );
      if (rows.length === 0) throw new AppError(404, 'User tidak ditemukan');
      sendSuccess(res, rows[0], 'User berhasil diperbarui');
    } catch (err) { next(err); }
  }
);

router.post('/:id/reset-password', authenticate, requireRole(Role.ADMIN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const password = await bcrypt.hash('123456', 12);
    const { rowCount } = await query(
      `UPDATE ${s}.users SET password_hash = $1, must_change_password = true, updated_at = NOW() WHERE id = $2`,
      [password, req.params.id]
    );
    if (rowCount === 0) throw new AppError(404, 'User tidak ditemukan');
    sendSuccess(res, null, 'Password berhasil direset ke 123456');
  } catch (err) { next(err); }
});

router.patch('/:id/toggle', authenticate, requireRole(Role.ADMIN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { rows } = await query(
      `UPDATE ${s}.users SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING id, email, is_active`,
      [req.params.id]
    );
    if (rows.length === 0) throw new AppError(404, 'User tidak ditemukan');
    sendSuccess(res, rows[0], rows[0].is_active ? 'User diaktifkan' : 'User dinonaktifkan');
  } catch (err) { next(err); }
});

export default router;
