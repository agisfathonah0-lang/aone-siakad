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

const PLANS_KEY = 'subscription_plans';

router.get('/', authenticate, requireRole(Role.SUPER_ADMIN), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query('SELECT setting_value FROM public.web_settings WHERE setting_key = $1', [PLANS_KEY]);
    const plans = rows.length > 0 ? (typeof rows[0].setting_value === 'string' ? JSON.parse(rows[0].setting_value) : rows[0].setting_value) : [];
    sendSuccess(res, Array.isArray(plans) ? plans : []);
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireRole(Role.SUPER_ADMIN), [
  body('name').notEmpty(), body('price').notEmpty(), body('maxStudents').isInt({ min: 1 }), body('maxTenants').isInt({ min: 1 }),
  body('features').optional().isArray(), body('color').optional().isString(), body('popular').optional().isBoolean(),
  validate,
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query('SELECT setting_value FROM public.web_settings WHERE setting_key = $1', [PLANS_KEY]);
    let plans = rows.length > 0 ? (typeof rows[0].setting_value === 'string' ? JSON.parse(rows[0].setting_value) : rows[0].setting_value) : [];
    if (!Array.isArray(plans)) plans = [];
    const newPlan = { id: crypto.randomUUID(), ...req.body, features: req.body.features || [], createdAt: new Date().toISOString() };
    plans.push(newPlan);
    await query(
      `INSERT INTO public.web_settings (setting_key, setting_value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = NOW()`,
      [PLANS_KEY, JSON.stringify(plans)]
    );
    sendSuccess(res, newPlan, 'Plan berhasil dibuat', 201);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, requireRole(Role.SUPER_ADMIN), [
  body('name').optional().notEmpty(), body('price').optional().notEmpty(), body('maxStudents').optional().isInt({ min: 1 }), body('maxTenants').optional().isInt({ min: 1 }),
  body('features').optional().isArray(), body('color').optional().isString(), body('popular').optional().isBoolean(),
  validate,
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query('SELECT setting_value FROM public.web_settings WHERE setting_key = $1', [PLANS_KEY]);
    let plans = rows.length > 0 ? (typeof rows[0].setting_value === 'string' ? JSON.parse(rows[0].setting_value) : rows[0].setting_value) : [];
    if (!Array.isArray(plans)) throw new AppError(404, 'Belum ada data plan');
    const idx = plans.findIndex((p: any) => p.id === req.params.id);
    if (idx === -1) throw new AppError(404, 'Plan tidak ditemukan');
    plans[idx] = { ...plans[idx], ...req.body, updatedAt: new Date().toISOString() };
    await query(
      `INSERT INTO public.web_settings (setting_key, setting_value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = NOW()`,
      [PLANS_KEY, JSON.stringify(plans)]
    );
    sendSuccess(res, plans[idx], 'Plan berhasil diupdate');
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, requireRole(Role.SUPER_ADMIN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query('SELECT setting_value FROM public.web_settings WHERE setting_key = $1', [PLANS_KEY]);
    let plans = rows.length > 0 ? (typeof rows[0].setting_value === 'string' ? JSON.parse(rows[0].setting_value) : rows[0].setting_value) : [];
    if (!Array.isArray(plans)) throw new AppError(404, 'Belum ada data plan');
    const filtered = plans.filter((p: any) => p.id !== req.params.id);
    if (filtered.length === plans.length) throw new AppError(404, 'Plan tidak ditemukan');
    await query(
      `INSERT INTO public.web_settings (setting_key, setting_value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = NOW()`,
      [PLANS_KEY, JSON.stringify(filtered)]
    );
    sendSuccess(res, null, 'Plan berhasil dihapus');
  } catch (err) { next(err); }
});

export default router;
