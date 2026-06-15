import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';

const router = Router();

router.get('/', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
    const { rows } = await query(
      'SELECT key, value FROM public.tenant_settings WHERE tenant_id = $1 ORDER BY key',
      [req.tenant.id]
    );
    const settings: Record<string, any> = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    sendSuccess(res, settings);
  } catch (err) { next(err); }
});

router.put('/:key', authenticate, requireRole(Role.ADMIN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
    const { value } = req.body;
    const { rows } = await query(
      `INSERT INTO public.tenant_settings (tenant_id, key, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (tenant_id, key)
       DO UPDATE SET value = $3, updated_at = NOW()
       RETURNING *`,
      [req.tenant.id, req.params.key, JSON.stringify(value)]
    );
    sendSuccess(res, { key: rows[0].key, value: rows[0].value }, 'Pengaturan berhasil disimpan');
  } catch (err) { next(err); }
});

export default router;
