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
      const { rows } = await query(
        'SELECT id, slug, name, nama_pt, paket, is_active, logo_url FROM public.tenants ORDER BY created_at DESC'
      );
      const result = await Promise.all(rows.map(async (t: any) => {
        const { rows: s } = await query('SELECT value FROM public.tenant_settings WHERE tenant_id = $1 AND key = $2', [t.id, 'landing_page']);
        let landingPage: Record<string, any> = { active: false, seoTitle: t.name };
        if (s.length > 0) {
          try { landingPage = typeof s[0].value === 'string' ? JSON.parse(s[0].value) : s[0].value; } catch { /* */ }
        }
        return { ...t, landingPage };
      }));
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }
);

router.put(
  '/:id',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  [
    body('landingPage').isObject().withMessage('landingPage wajib berupa object'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = await query('SELECT id FROM public.tenants WHERE id = $1', [req.params.id]);
      if (rows.length === 0) throw new AppError(404, 'Tenant tidak ditemukan');

      await query(
        `INSERT INTO public.tenant_settings (tenant_id, key, value, updated_at)
         VALUES ($1, 'landing_page', $2, NOW())
         ON CONFLICT (tenant_id, key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [req.params.id, JSON.stringify(req.body.landingPage)]
      );

      const { rows: s } = await query('SELECT value FROM public.tenant_settings WHERE tenant_id = $1 AND key = $2', [req.params.id, 'landing_page']);
      sendSuccess(res, { landingPage: s[0]?.value || {} }, 'Landing page berhasil diupdate');
    } catch (err) { next(err); }
  }
);

export default router;
