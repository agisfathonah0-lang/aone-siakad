import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { query } from '../../config/database.js';
import { validate } from '../../middleware/validator.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';

const router = Router();

function schema(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

router.get('/', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const tahun = req.query.tahun as string;
    let where = '';
    const params: any[] = [];
    if (tahun) { params.push(`${tahun}-01-01`); params.push(`${tahun}-12-31`); where = 'WHERE tanggal_mulai BETWEEN $1 AND $2'; }
    const { rows } = await query(`SELECT * FROM ${s}.kalender_akademik ${where} ORDER BY tanggal_mulai`, params);
    sendSuccess(res, rows);
  } catch (err) { next(err); }
});

router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  body('judul').notEmpty().withMessage('Judul harus diisi'),
  body('tanggal_mulai').notEmpty().withMessage('Tanggal mulai harus diisi'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { judul, tanggal_mulai, tanggal_selesai, tipe, deskripsi, warna } = req.body;
      const { rows } = await query(
        `INSERT INTO ${s}.kalender_akademik (judul, tanggal_mulai, tanggal_selesai, tipe, deskripsi, warna)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [judul, tanggal_mulai, tanggal_selesai || null, tipe || 'umum', deskripsi || null, warna || '#6366f1']
      );
      sendSuccess(res, rows[0], 'Acara berhasil ditambahkan');
    } catch (err) { next(err); }
  }
);

router.put('/:id', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { judul, tanggal_mulai, tanggal_selesai, tipe, deskripsi, warna } = req.body;
    const { rows } = await query(
      `UPDATE ${s}.kalender_akademik SET judul=$1, tanggal_mulai=$2, tanggal_selesai=$3, tipe=$4, deskripsi=$5, warna=$6, updated_at=NOW() WHERE id=$7 RETURNING *`,
      [judul, tanggal_mulai, tanggal_selesai, tipe, deskripsi, warna, req.params.id]
    );
    if (rows.length === 0) throw new AppError(404, 'Acara tidak ditemukan');
    sendSuccess(res, rows[0], 'Acara berhasil diperbarui');
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, requireRole(Role.ADMIN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { rowCount } = await query(`DELETE FROM ${s}.kalender_akademik WHERE id=$1`, [req.params.id]);
    if (rowCount === 0) throw new AppError(404, 'Acara tidak ditemukan');
    sendSuccess(res, null, 'Acara berhasil dihapus');
  } catch (err) { next(err); }
});

export default router;
