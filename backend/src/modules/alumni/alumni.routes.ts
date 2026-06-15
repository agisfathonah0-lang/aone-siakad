import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { query as dbQuery } from '../../config/database.js';
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

// GET /alumni — List tracer studies (admin)
router.get(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { rows } = await dbQuery(
        `SELECT t.*, u.nama, u.email, u.nim
         FROM ${schema}.alumni_tracer t
         LEFT JOIN ${schema}.users u ON u.id = t.user_id
         ORDER BY t.created_at DESC`
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

// GET /alumni/stats — Tracer statistics
router.get(
  '/stats',
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);

      const [totalR, avgGajiR, avgTungguR, kesesuaianR] = await Promise.all([
        dbQuery(`SELECT COUNT(*) as count FROM ${schema}.alumni_tracer`),
        dbQuery(`SELECT COALESCE(AVG(gaji), 0) as avg FROM ${schema}.alumni_tracer`),
        dbQuery(`SELECT COALESCE(AVG(masa_tunggu), 0) as avg FROM ${schema}.alumni_tracer`),
        dbQuery(`SELECT kesesuaian, COUNT(*) as count FROM ${schema}.alumni_tracer GROUP BY kesesuaian ORDER BY count DESC`),
      ]);

      sendSuccess(res, {
        total: parseInt(totalR.rows[0].count, 10),
        avgGaji: Math.round(parseFloat(avgGajiR.rows[0].avg)),
        avgMasaTunggu: Math.round(parseFloat(avgTungguR.rows[0].avg) * 10) / 10,
        kesesuaian: kesesuaianR.rows,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /alumni/my — Current user's tracer
router.get(
  '/my',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { rows } = await dbQuery(
        `SELECT * FROM ${schema}.alumni_tracer WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [req.user?.id || '']
      );
      sendSuccess(res, rows[0] || null);
    } catch (err) {
      next(err);
    }
  }
);

// POST /alumni/tracer — Submit tracer study (alumni)
router.post(
  '/tracer',
  authenticate,
  requireRole(Role.ALUMNI, Role.MAHASISWA),
  [
    body('tahun_lulus').isInt({ min: 2000, max: 2100 }).withMessage('Tahun lulus tidak valid'),
    body('institusi').optional().isString(),
    body('pekerjaan').optional().isString(),
    body('gaji').optional().isFloat({ min: 0 }),
    body('masa_tunggu').optional().isFloat({ min: 0 }),
    body('kesesuaian').optional().isIn(['Sangat Sesuai', 'Sesuai', 'Cukup Sesuai', 'Kurang Sesuai', 'Tidak Sesuai']),
    body('kepuasan').optional().isInt({ min: 1, max: 5 }),
    body('saran').optional().isString(),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { tahun_lulus, institusi, pekerjaan, gaji, masa_tunggu, kesesuaian, kepuasan, saran } = req.body;

      await dbQuery(
        `INSERT INTO ${schema}.alumni_tracer (user_id, tahun_lulus, institusi, pekerjaan, gaji, masa_tunggu, kesesuaian, kepuasan, saran)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [req.user?.id, tahun_lulus, institusi || null, pekerjaan || null, gaji || null, masa_tunggu || null, kesesuaian || null, kepuasan || null, saran || null]
      );

      sendSuccess(res, null, 'Tracer study berhasil dikirim', 201);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
