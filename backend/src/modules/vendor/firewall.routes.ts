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
  '/logs',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, severity, limit } = req.query;
      let sql = 'SELECT * FROM public.firewall_logs WHERE 1=1';
      const params: any[] = [];
      if (type) { sql += ' AND type = $' + (params.length + 1); params.push(type); }
      if (severity) { sql += ' AND severity = $' + (params.length + 1); params.push(severity); }
      sql += ' ORDER BY timestamp DESC';
      if (limit) sql += ' LIMIT ' + parseInt(limit as string);
      const { rows } = await query(sql, params);
      sendSuccess(res, rows);
    } catch (err) { next(err); }
  }
);

router.get(
  '/stats',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [{ rows: totalAttacks }, { rows: blockedToday }, { rows: activeBlocks }] = await Promise.all([
        query('SELECT COUNT(*) as c FROM public.firewall_logs'),
        query("SELECT COUNT(*) as c FROM public.firewall_logs WHERE timestamp >= CURRENT_DATE AND status = 'BLOCKED'"),
        query("SELECT COUNT(*) as c FROM public.blocked_ips WHERE status = 'ACTIVE'"),
      ]);
      const { rows: byType } = await query('SELECT type, COUNT(*) as count FROM public.firewall_logs GROUP BY type ORDER BY count DESC');
      const { rows: bySeverity } = await query(`SELECT severity, COUNT(*) as count FROM public.firewall_logs GROUP BY severity ORDER BY CASE severity WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 END`);
      const { rows: recentLogs } = await query('SELECT * FROM public.firewall_logs ORDER BY timestamp DESC LIMIT 5');
      sendSuccess(res, {
        totalAttacks: parseInt(totalAttacks[0].c),
        blockedToday: parseInt(blockedToday[0].c),
        activeBlocks: parseInt(activeBlocks[0].c),
        byType,
        bySeverity,
        recentLogs,
      });
    } catch (err) { next(err); }
  }
);

router.get(
  '/blocked-ips',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = await query("SELECT * FROM public.blocked_ips WHERE status = 'ACTIVE' ORDER BY blocked_at DESC");
      sendSuccess(res, rows);
    } catch (err) { next(err); }
  }
);

router.post(
  '/block-ip',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  [body('ip').notEmpty().withMessage('IP wajib diisi'), body('reason').optional().isString(), body('expires_at').optional().isString(), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ip, reason, expires_at } = req.body;
      await query(
        `INSERT INTO public.blocked_ips (ip, reason, blocked_by, expires_at) VALUES ($1, $2, $3, $4)`,
        [ip, reason || 'Manual block by admin', req.user?.email || 'Super Admin', expires_at || null]
      );
      sendSuccess(res, null, `IP ${ip} berhasil diblokir`);
    } catch (err: any) {
      if (err.message?.includes('unique') || err.message?.includes('duplicate')) {
        next(new AppError(400, 'IP sudah diblokir'));
      } else { next(err); }
    }
  }
);

router.post(
  '/unblock-ip',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  [body('ip').notEmpty().withMessage('IP wajib diisi'), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ip } = req.body;
      await query("UPDATE public.blocked_ips SET status = 'EXPIRED' WHERE ip = $1", [ip]);
      sendSuccess(res, null, `IP ${ip} berhasil dibuka`);
    } catch (err) { next(err); }
  }
);

export default router;
