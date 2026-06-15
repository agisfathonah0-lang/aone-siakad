import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { query } from '../../config/database.js';
import { validate } from '../../middleware/validator.js';
import { authenticate, optionalAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess, sendPaginated } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';

const router = Router();

function schema(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
}

router.get('/', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.q || '';
    const statusFilter = req.query.status as string;

    if (!req.tenant) {
      const { rows: data } = await query(`SELECT * FROM public.berita WHERE is_published = true ORDER BY published_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
      const { rows: countRows } = await query(`SELECT COUNT(*) as total FROM public.berita WHERE is_published = true`);
      return sendPaginated(res, data, page, limit, parseInt(countRows[0].total));
    }

    const s = schema(req);
    let where = 'WHERE 1=1';
    const params: any[] = [];
    let paramIdx = 1;

    if (search) {
      where += ` AND (judul ILIKE $${paramIdx} OR konten ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }
    if (statusFilter) {
      where += ` AND status = $${paramIdx}`;
      params.push(statusFilter);
      paramIdx++;
    }

    const { rows: data } = await query(`SELECT * FROM ${s}.berita ${where} ORDER BY created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`, [...params, limit, offset]);
    const { rows: countRows } = await query(`SELECT COUNT(*) as total FROM ${s}.berita ${where}`, params);

    sendPaginated(res, data, page, limit, parseInt(countRows[0].total));
  } catch (err) { next(err); }
});

router.get('/:id', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.tenant) {
      const { rows } = await query(`SELECT * FROM public.berita WHERE (id = $1 OR slug = $1) AND is_published = true`, [req.params.id]);
      if (rows.length === 0) throw new AppError(404, 'Berita tidak ditemukan');
      return sendSuccess(res, rows[0]);
    }
    const s = schema(req);
    const { rows } = await query(`SELECT * FROM ${s}.berita WHERE id = $1`, [req.params.id]);
    if (rows.length === 0) throw new AppError(404, 'Berita tidak ditemukan');
    sendSuccess(res, rows[0]);
  } catch (err) { next(err); }
});

router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  body('judul').notEmpty().withMessage('Judul berita harus diisi'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { judul, konten, ringkasan, gambar, penulis, status } = req.body;
      const slug = generateSlug(judul);
      const isPublished = status === 'published';
      const publishedAt = isPublished ? new Date().toISOString() : null;
      const { rows } = await query(
        `INSERT INTO ${s}.berita (judul, slug, konten, ringkasan, gambar, penulis, status, is_published, published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [judul, slug, konten || null, ringkasan || null, gambar || null, penulis || null, status || 'draft', isPublished, publishedAt]
      );
      sendSuccess(res, rows[0], 'Berita berhasil ditambahkan');
    } catch (err) { next(err); }
  }
);

router.put('/:id', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { judul, konten, ringkasan, gambar, penulis, status } = req.body;
    const isPublished = status === 'published';
    let publishedAt = null;
    if (isPublished) {
      const { rows: existing } = await query(`SELECT published_at FROM ${s}.berita WHERE id = $1`, [req.params.id]);
      publishedAt = existing[0]?.published_at || new Date().toISOString();
    }
    const { rows } = await query(
      `UPDATE ${s}.berita SET judul=$1, konten=$2, ringkasan=$3, gambar=$4, penulis=$5, status=$6, is_published=$7, published_at=COALESCE($8, published_at), updated_at=NOW() WHERE id=$9 RETURNING *`,
      [judul, konten || null, ringkasan || null, gambar || null, penulis || null, status || 'draft', isPublished, publishedAt, req.params.id]
    );
    if (rows.length === 0) throw new AppError(404, 'Berita tidak ditemukan');
    sendSuccess(res, rows[0], 'Berita berhasil diperbarui');
  } catch (err) { next(err); }
});

router.patch('/:id/publish', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const publish = req.body.publish !== false;
    const { rows } = await query(
      `UPDATE ${s}.berita SET is_published=$1, status=$2, published_at=$3, updated_at=NOW() WHERE id=$4 RETURNING *`,
      [publish, publish ? 'published' : 'draft', publish ? new Date().toISOString() : null, req.params.id]
    );
    if (rows.length === 0) throw new AppError(404, 'Berita tidak ditemukan');
    sendSuccess(res, rows[0], publish ? 'Berita berhasil dipublikasikan' : 'Berita di-unpublish');
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, requireRole(Role.ADMIN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { rowCount } = await query(`DELETE FROM ${s}.berita WHERE id=$1`, [req.params.id]);
    if (rowCount === 0) throw new AppError(404, 'Berita tidak ditemukan');
    sendSuccess(res, null, 'Berita berhasil dihapus');
  } catch (err) { next(err); }
});

export default router;