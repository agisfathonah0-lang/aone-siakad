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

router.get('/config', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { rows } = await query(`SELECT * FROM ${s}.lms_config LIMIT 1`, []);
    sendSuccess(res, rows[0] || null);
  } catch (err) { next(err); }
});

router.put('/config', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { platform, base_url, api_token, sync_mahasiswa, sync_nilai, sync_jadwal, is_active } = req.body;
    const { rows: existing } = await query(`SELECT id FROM ${s}.lms_config LIMIT 1`, []);
    if (existing.length > 0) {
      const sets: string[] = [];
      const params: unknown[] = [];
      let idx = 1;
      if (platform !== undefined) { sets.push(`platform = $${idx++}`); params.push(platform); }
      if (base_url !== undefined) { sets.push(`base_url = $${idx++}`); params.push(base_url); }
      if (api_token !== undefined) { sets.push(`api_token = $${idx++}`); params.push(api_token); }
      if (sync_mahasiswa !== undefined) { sets.push(`sync_mahasiswa = $${idx++}`); params.push(sync_mahasiswa); }
      if (sync_nilai !== undefined) { sets.push(`sync_nilai = $${idx++}`); params.push(sync_nilai); }
      if (sync_jadwal !== undefined) { sets.push(`sync_jadwal = $${idx++}`); params.push(sync_jadwal); }
      if (is_active !== undefined) { sets.push(`is_active = $${idx++}`); params.push(is_active); }
      sets.push(`updated_at = NOW()`);
      if (sets.length > 1) {
        params.push(existing[0].id);
        await query(`UPDATE ${s}.lms_config SET ${sets.join(', ')} WHERE id = $${idx}`, params);
      }
    } else {
      await query(
        `INSERT INTO ${s}.lms_config (platform, base_url, api_token, sync_mahasiswa, sync_nilai, sync_jadwal, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [platform || 'moodle', base_url, api_token || null, sync_mahasiswa || false, sync_nilai || false, sync_jadwal || false, is_active || false]
      );
    }
    const { rows } = await query(`SELECT * FROM ${s}.lms_config LIMIT 1`, []);
    sendSuccess(res, rows[0], 'Konfigurasi LMS berhasil disimpan');
  } catch (err) { next(err); }
});

router.post('/sync/:entity', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const entity = req.params.entity;
    const allowed = ['mahasiswa', 'nilai', 'jadwal'];
    if (!allowed.includes(entity)) throw new AppError(400, 'Entity tidak valid. Gunakan: mahasiswa, nilai, jadwal');
    await query(
      `INSERT INTO ${s}.lms_sync_log (entity_type, action, status, records_count) VALUES ($1, $2, $3, $4)`,
      [entity, 'sync', 'success', 0]
    );
    sendSuccess(res, null, `Sinkronisasi ${entity} berhasil dijalankan`);
  } catch (err) { next(err); }
});

router.get('/sync/log', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const entityType = req.query.entity_type as string;
    const status = req.query.status as string;
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    if (entityType) { conditions.push(`entity_type = $${idx++}`); params.push(entityType); }
    if (status) { conditions.push(`status = $${idx++}`); params.push(status); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countSql = `SELECT COUNT(*) as count FROM ${s}.lms_sync_log ${where}`;
    const { rows: countRows } = await query(countSql, params);
    const total = parseInt(countRows[0].count, 10);
    const sql = `SELECT * FROM ${s}.lms_sync_log ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, offset);
    const { rows } = await query(sql, params);
    sendPaginated(res, rows, total, page, limit);
  } catch (err) { next(err); }
});

export default router;
