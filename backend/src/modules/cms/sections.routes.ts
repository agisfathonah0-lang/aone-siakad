import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { query } from '../../config/database.js';
import { validate } from '../../middleware/validator.js';
import { authenticate } from '../../middleware/auth.js';
import { optionalAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';

const router = Router();

function s(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

router.get(
  '/public',
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { rows } = await query(
        `SELECT key, title, content FROM ${schema}.cms_sections WHERE is_published = true ORDER BY key`
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/',
  authenticate,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { rows } = await query(
        `SELECT * FROM ${schema}.cms_sections ORDER BY key`
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:key',
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { rows } = await query(
        `SELECT * FROM ${schema}.cms_sections WHERE key = $1`,
        [req.params.key]
      );
      if (rows.length === 0) throw new AppError(404, 'Section tidak ditemukan');
      sendSuccess(res, rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:key',
  authenticate,
  requireRole(Role.ADMIN),
  [
    body('title').optional().notEmpty(),
    body('content').optional().isObject(),
    body('is_published').optional().isBoolean(),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { key } = req.params;
      const { title, content, is_published } = req.body;

      const { rows: exist } = await query(
        `SELECT id FROM ${schema}.cms_sections WHERE key = $1`,
        [key]
      );

      if (exist.length === 0) {
        await query(
          `INSERT INTO ${schema}.cms_sections (id, key, title, content, is_published)
           VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
          [key, title || key, JSON.stringify(content || {}), is_published ?? true]
        );
        sendSuccess(res, { key }, 'Section berhasil dibuat', 201);
      } else {
        const fields: string[] = [];
        const values: unknown[] = [];
        let idx = 1;

        if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
        if (content !== undefined) { fields.push(`content = $${idx++}`); values.push(JSON.stringify(content)); }
        if (is_published !== undefined) { fields.push(`is_published = $${idx++}`); values.push(is_published); }

        if (fields.length > 0) {
          fields.push('updated_at = NOW()');
          values.push(key);
          await query(
            `UPDATE ${schema}.cms_sections SET ${fields.join(', ')} WHERE key = $${idx}`,
            values
          );
        }
        sendSuccess(res, { key }, 'Section diperbarui');
      }
    } catch (err) {
      next(err);
    }
  }
);

export default router;
