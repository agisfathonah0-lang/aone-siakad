import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { query } from '../../config/database.js';
import { validate } from '../../middleware/validator.js';
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

router.get('/', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const s = schema(req);
    const search = req.query.q || '';

    let where = '';
    const params: any[] = [];
    if (search) {
      where = 'WHERE (nama ILIKE $1 OR kode ILIKE $1)';
      params.push(`%${search}%`);
    }

    const { rows: data } = await query(`SELECT * FROM ${s}.program_studi ${where} ORDER BY nama LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
    const { rows: countRows } = await query(`SELECT COUNT(*) as total FROM ${s}.program_studi ${where}`, params);

    sendPaginated(res, data, page, limit, parseInt(countRows[0].total));
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { rows } = await query(`SELECT * FROM ${s}.program_studi WHERE id = $1`, [req.params.id]);
    if (rows.length === 0) throw new AppError(404, 'Program studi tidak ditemukan');
    sendSuccess(res, rows[0]);
  } catch (err) { next(err); }
});

router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  body('kode').notEmpty().withMessage('Kode prodi harus diisi'),
  body('nama').notEmpty().withMessage('Nama prodi harus diisi'),
  body('jenjang').notEmpty().withMessage('Jenjang harus diisi'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { kode, nama, jenjang, fakultas, akreditasi } = req.body;
      const { rows } = await query(
        `INSERT INTO ${s}.program_studi (kode, nama, jenjang, fakultas, akreditasi) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [kode, nama, jenjang, fakultas || null, akreditasi || null]
      );
      sendSuccess(res, rows[0], 'Program studi berhasil ditambahkan');
    } catch (err) { next(err); }
  }
);

router.put(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { kode, nama, jenjang, fakultas, akreditasi } = req.body;
      const { rows } = await query(
        `UPDATE ${s}.program_studi SET kode=$1, nama=$2, jenjang=$3, fakultas=$4, akreditasi=$5 WHERE id=$6 RETURNING *`,
        [kode, nama, jenjang, fakultas || null, akreditasi || null, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Program studi tidak ditemukan');
      sendSuccess(res, rows[0], 'Program studi berhasil diperbarui');
    } catch (err) { next(err); }
  }
);

router.delete('/:id', authenticate, requireRole(Role.ADMIN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { rowCount } = await query(`DELETE FROM ${s}.program_studi WHERE id=$1`, [req.params.id]);
    if (rowCount === 0) throw new AppError(404, 'Program studi tidak ditemukan');
    sendSuccess(res, null, 'Program studi berhasil dihapus');
  } catch (err) { next(err); }
});

export default router;
