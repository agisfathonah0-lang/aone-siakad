import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { validate } from '../../middleware/validator.js';
import { query } from '../../config/database.js';
import { Role } from '../../types/enums.js';

const router = Router();

router.get('/', authenticate, requireRole(Role.SUPER_ADMIN), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query('SELECT id, email, nama, role, is_active, last_login, created_at FROM public.vendor_users ORDER BY created_at DESC');
    sendSuccess(res, rows);
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireRole(Role.SUPER_ADMIN), [
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('nama').notEmpty().withMessage('Nama wajib diisi'),
  validate,
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, nama } = req.body;
    const { rows: exist } = await query('SELECT id FROM public.vendor_users WHERE email = $1', [email]);
    if (exist.length > 0) throw new AppError(409, 'Email sudah terdaftar');
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO public.vendor_users (email, password_hash, nama, role) VALUES ($1, $2, $3, 'super_admin') RETURNING id, email, nama, role, is_active, created_at`,
      [email, hash, nama]
    );
    sendSuccess(res, rows[0], 'Vendor user berhasil dibuat', 201);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, requireRole(Role.SUPER_ADMIN), [
  body('nama').optional().notEmpty(), body('email').optional().isEmail(), body('password').optional().isLength({ min: 6 }),
  validate,
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sets: string[] = [];
    const params: any[] = [];
    if (req.body.nama) { sets.push('nama = $' + (params.length + 1)); params.push(req.body.nama); }
    if (req.body.email) { sets.push('email = $' + (params.length + 1)); params.push(req.body.email); }
    if (req.body.password) { const hash = await bcrypt.hash(req.body.password, 12); sets.push('password_hash = $' + (params.length + 1)); params.push(hash); }
    if (sets.length === 0) throw new AppError(400, 'Tidak ada field yang diupdate');
    sets.push('updated_at = NOW()');
    params.push(req.params.id);
    const { rows } = await query(`UPDATE public.vendor_users SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING id, email, nama, role, is_active, created_at`, params);
    if (rows.length === 0) throw new AppError(404, 'Vendor user tidak ditemukan');
    sendSuccess(res, rows[0], 'Vendor user berhasil diupdate');
  } catch (err) { next(err); }
});

router.patch('/:id/toggle', authenticate, requireRole(Role.SUPER_ADMIN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query('UPDATE public.vendor_users SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING id, email, nama, is_active', [req.params.id]);
    if (rows.length === 0) throw new AppError(404, 'Vendor user tidak ditemukan');
    sendSuccess(res, rows[0], 'Status vendor user diubah');
  } catch (err) { next(err); }
});

export default router;
