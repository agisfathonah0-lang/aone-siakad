import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { query } from '../../config/database.js';
import { Role } from '../../types/enums.js';

const router = Router();

const AUDIT_KEY = 'vendor_audit_logs';

router.get('/', authenticate, requireRole(Role.SUPER_ADMIN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query('SELECT setting_value FROM public.web_settings WHERE setting_key = $1', [AUDIT_KEY]);
    let logs: any[] = rows.length > 0 ? (typeof rows[0].setting_value === 'string' ? JSON.parse(rows[0].setting_value) : rows[0].setting_value) : [];
    if (!Array.isArray(logs)) logs = [];
    const { action, actor, limit } = req.query;
    if (action) logs = logs.filter((l: any) => l.action?.toLowerCase().includes((action as string).toLowerCase()));
    if (actor) logs = logs.filter((l: any) => l.actor?.toLowerCase().includes((actor as string).toLowerCase()));
    logs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const max = limit ? parseInt(limit as string) : 50;
    sendSuccess(res, logs.slice(0, max));
  } catch (err) { next(err); }
});

export async function addAuditLog(action: string, actor: string, detail?: string) {
  try {
    const { rows } = await query('SELECT setting_value FROM public.web_settings WHERE setting_key = $1', [AUDIT_KEY]);
    let logs = rows.length > 0 ? (typeof rows[0].setting_value === 'string' ? JSON.parse(rows[0].setting_value) : rows[0].setting_value) : [];
    if (!Array.isArray(logs)) logs = [];
    logs.unshift({ id: crypto.randomUUID(), action, actor, detail: detail || '', createdAt: new Date().toISOString() });
    if (logs.length > 500) logs = logs.slice(0, 500);
    await query(
      `INSERT INTO public.web_settings (setting_key, setting_value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = NOW()`,
      [AUDIT_KEY, JSON.stringify(logs)]
    );
  } catch {}
}

export default router;
