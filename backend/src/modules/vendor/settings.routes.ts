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
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = await query('SELECT setting_key, setting_value, updated_at FROM public.web_settings ORDER BY setting_key');
      const settings: Record<string, string> = {};
      rows.forEach((r: any) => { settings[r.setting_key] = r.setting_value; });
      sendSuccess(res, settings);
    } catch (err) { next(err); }
  }
);

router.put(
  '/',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updates = req.body as Record<string, string>;
      for (const [key, value] of Object.entries(updates)) {
        await query(
          `INSERT INTO public.web_settings (setting_key, setting_value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = NOW()`,
          [key, value]
        );
      }
      const { rows } = await query('SELECT setting_key, setting_value FROM public.web_settings ORDER BY setting_key');
      const settings: Record<string, string> = {};
      rows.forEach((r: any) => { settings[r.setting_key] = r.setting_value; });
      sendSuccess(res, settings, 'Pengaturan berhasil disimpan');
    } catch (err) { next(err); }
  }
);

router.get(
  '/tenant/:id',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = await query('SELECT key, value FROM public.tenant_settings WHERE tenant_id = $1', [req.params.id]);
      const settings: Record<string, any> = {};
      rows.forEach((r: any) => { settings[r.key] = r.value; });
      sendSuccess(res, settings);
    } catch (err) { next(err); }
  }
);

router.put(
  '/tenant/:id',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updates = req.body as Record<string, any>;
      for (const [key, value] of Object.entries(updates)) {
        await query(
          `INSERT INTO public.tenant_settings (tenant_id, key, value, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (tenant_id, key) DO UPDATE SET value = $3, updated_at = NOW()`,
          [req.params.id, key, JSON.stringify(value)]
        );
      }
      const { rows } = await query('SELECT key, value FROM public.tenant_settings WHERE tenant_id = $1', [req.params.id]);
      const settings: Record<string, any> = {};
      rows.forEach((r: any) => { settings[r.key] = r.value; });
      sendSuccess(res, settings, 'Pengaturan tenant berhasil disimpan');
    } catch (err) { next(err); }
  }
);

export default router;
