import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../../config/database.js';
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

router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    if (!req.user) throw new AppError(401, 'Belum login');
    const { rows } = await query(
      `SELECT * FROM ${s}.notifikasi WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    const { rows: unreadCount } = await query(
      `SELECT COUNT(*) as c FROM ${s}.notifikasi WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );
    sendSuccess(res, { rows, unread: parseInt(unreadCount[0].c) });
  } catch (err) { next(err); }
});

router.patch('/:id/read', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    if (!req.user) throw new AppError(401, 'Belum login');
    const { rows } = await query(
      `UPDATE ${s}.notifikasi SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id, is_read`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) throw new AppError(404, 'Notifikasi tidak ditemukan');
    sendSuccess(res, rows[0]);
  } catch (err) { next(err); }
});

router.patch('/read-all', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    if (!req.user) throw new AppError(401, 'Belum login');
    await query(`UPDATE ${s}.notifikasi SET is_read = true WHERE user_id = $1 AND is_read = false`, [req.user.id]);
    sendSuccess(res, null, 'Semua notifikasi telah dibaca');
  } catch (err) { next(err); }
});

export default router;
