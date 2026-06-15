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
      const { rows } = await query(
        'SELECT c.*, t.name as tenant_name FROM public.cctv_cameras c LEFT JOIN public.tenants t ON t.id = c.tenant_id ORDER BY c.created_at DESC'
      );
      sendSuccess(res, rows);
    } catch (err) { next(err); }
  }
);

router.post(
  '/',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  [
    body('name').notEmpty().withMessage('Nama kamera wajib diisi'),
    body('location').notEmpty().withMessage('Lokasi wajib diisi'),
    body('rtsp_url').optional().isString(),
    body('tenant_id').optional().isUUID(),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, location, rtsp_url, tenant_id } = req.body;
      const { rows } = await query(
        `INSERT INTO public.cctv_cameras (name, location, rtsp_url, tenant_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, location, rtsp_url || '', tenant_id || null]
      );
      sendSuccess(res, rows[0], 'Kamera berhasil ditambahkan', 201);
    } catch (err) { next(err); }
  }
);

router.put(
  '/:id',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  [
    body('name').optional().notEmpty(),
    body('location').optional().notEmpty(),
    body('rtsp_url').optional(),
    body('status').optional().isIn(['Aktif', 'Nonaktif']),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, location, rtsp_url, status } = req.body;
      const sets: string[] = [];
      const params: any[] = [];
      if (name !== undefined) { sets.push('name = $' + (params.length + 1)); params.push(name); }
      if (location !== undefined) { sets.push('location = $' + (params.length + 1)); params.push(location); }
      if (rtsp_url !== undefined) { sets.push('rtsp_url = $' + (params.length + 1)); params.push(rtsp_url); }
      if (status !== undefined) { sets.push('status = $' + (params.length + 1)); params.push(status); }
      if (sets.length === 0) throw new AppError(400, 'Tidak ada field yang diupdate');
      params.push(req.params.id);
      const { rows } = await query(
        `UPDATE public.cctv_cameras SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );
      if (rows.length === 0) throw new AppError(404, 'Kamera tidak ditemukan');
      sendSuccess(res, rows[0], 'Kamera berhasil diupdate');
    } catch (err) { next(err); }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rowCount } = await query('DELETE FROM public.cctv_cameras WHERE id = $1', [req.params.id]);
      if (rowCount === 0) throw new AppError(404, 'Kamera tidak ditemukan');
      sendSuccess(res, null, 'Kamera berhasil dihapus');
    } catch (err) { next(err); }
  }
);

export default router;
