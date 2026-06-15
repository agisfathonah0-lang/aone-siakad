import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { validate } from '../../middleware/validator.js';
import { query } from '../../config/database.js';
import { Role } from '../../types/enums.js';

const router = Router();

router.get(
  '/',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, priority } = req.query;
      let sql = 'SELECT t.*, tn.name as tenant_name FROM public.tickets t LEFT JOIN public.tenants tn ON tn.id = t.tenant_id WHERE 1=1';
      const params: any[] = [];
      if (status) { sql += ' AND t.status = $' + (params.length + 1); params.push(status); }
      if (priority) { sql += ' AND t.priority = $' + (params.length + 1); params.push(priority); }
      sql += ' ORDER BY t.created_at DESC';
      const { rows } = await query(sql, params);
      sendSuccess(res, rows);
    } catch (err) { next(err); }
  }
);

router.post(
  '/',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  [
    body('title').notEmpty().withMessage('Judul wajib diisi'),
    body('tenant_id').optional().isUUID(),
    body('priority').optional().isIn(['Rendah', 'Sedang', 'Tinggi', 'Kritis']),
    body('category').optional().isIn(['Umum', 'PDDIKTI', 'Infrastruktur', 'Modul Alumni', 'Modul Akademik', 'Modul Keuangan', 'Lainnya']),
    body('description').optional().isString(),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, tenant_id, priority, category, description } = req.body;
      const { rows } = await query(
        `INSERT INTO public.tickets (title, tenant_id, priority, category, description, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [title, tenant_id || null, priority || 'Sedang', category || 'Umum', description || null, req.user?.id || null]
      );
      sendSuccess(res, rows[0], 'Ticket berhasil dibuat', 201);
    } catch (err) { next(err); }
  }
);

router.patch(
  '/:id',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  [
    body('status').optional().isIn(['Terbuka', 'Dalam Proses', 'Selesai', 'Ditutup']),
    body('priority').optional().isIn(['Rendah', 'Sedang', 'Tinggi', 'Kritis']),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, priority } = req.body;
      const sets: string[] = [];
      const params: any[] = [];
      if (status) { sets.push('status = $' + (params.length + 1)); params.push(status); }
      if (priority) { sets.push('priority = $' + (params.length + 1)); params.push(priority); }
      if (sets.length === 0) throw new AppError(400, 'Tidak ada field yang diupdate');
      sets.push('updated_at = NOW()');
      params.push(req.params.id);
      const { rows } = await query(
        `UPDATE public.tickets SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );
      if (rows.length === 0) throw new AppError(404, 'Ticket tidak ditemukan');
      sendSuccess(res, rows[0], 'Ticket berhasil diupdate');
    } catch (err) { next(err); }
  }
);

export default router;
