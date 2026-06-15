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

router.get(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const tahunAkademik = req.query.tahun_akademik as string;
      const isActive = req.query.is_active as string;

      let sql = `SELECT * FROM ${s}.beasiswa`;
      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (tahunAkademik) {
        conditions.push(`tahun_akademik = $${idx++}`);
        params.push(tahunAkademik);
      }
      if (isActive === 'true' || isActive === 'false') {
        conditions.push(`is_active = $${idx++}`);
        params.push(isActive === 'true');
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const countSql = `SELECT COUNT(*) as count FROM (${sql}) sub`;
      const { rows: countRows } = await query(countSql, params);
      const total = parseInt(countRows[0].count, 10);

      sql += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(limit, offset);

      const { rows } = await query(sql, params);
      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT * FROM ${s}.beasiswa WHERE id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Beasiswa tidak ditemukan');

      const beasiswa = rows[0];

      const { rows: penerima } = await query(
        `SELECT bp.*, m.nim, m.nama as mahasiswa_nama
         FROM ${s}.beasiswa_penerima bp
         JOIN ${s}.mahasiswa m ON m.id = bp.mahasiswa_id
         WHERE bp.beasiswa_id = $1
         ORDER BY bp.tanggal_daftar DESC`,
        [req.params.id]
      );

      const { rows: pencairanTotal } = await query(
        `SELECT COALESCE(SUM(nominal), 0) as total_pencairan
         FROM ${s}.beasiswa_pencairan pc
         JOIN ${s}.beasiswa_penerima bp ON bp.id = pc.penerima_id
         WHERE bp.beasiswa_id = $1`,
        [req.params.id]
      );

      sendSuccess(res, {
        ...beasiswa,
        penerima,
        total_pencairan: parseFloat(pencairanTotal[0].total_pencairan),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('nama').notEmpty().withMessage('Nama beasiswa wajib diisi'),
    body('jenis').notEmpty().withMessage('Jenis beasiswa wajib diisi'),
    body('nominal').isNumeric().withMessage('Nominal harus berupa angka'),
    body('tahun_akademik').notEmpty().withMessage('Tahun akademik wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nama, jenis, penyelenggara, nominal, kuota, tahun_akademik, tanggal_mulai, tanggal_selesai, deskripsi, is_active } = req.body;
      const { rows } = await query(
        `INSERT INTO ${s}.beasiswa (nama, jenis, penyelenggara, nominal, kuota, tahun_akademik, tanggal_mulai, tanggal_selesai, deskripsi, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [nama, jenis, penyelenggara || null, nominal, kuota || 0, tahun_akademik, tanggal_mulai || null, tanggal_selesai || null, deskripsi || null, is_active ?? true]
      );
      sendSuccess(res, rows[0], 'Beasiswa berhasil dibuat', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nama, jenis, penyelenggara, nominal, kuota, tahun_akademik, tanggal_mulai, tanggal_selesai, deskripsi, is_active } = req.body;
      const { rows } = await query(
        `UPDATE ${s}.beasiswa SET nama = $1, jenis = $2, penyelenggara = $3, nominal = $4, kuota = $5, tahun_akademik = $6, tanggal_mulai = $7, tanggal_selesai = $8, deskripsi = $9, is_active = $10, updated_at = NOW()
         WHERE id = $11 RETURNING *`,
        [nama, jenis, penyelenggara, nominal, kuota, tahun_akademik, tanggal_mulai, tanggal_selesai, deskripsi, is_active, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Beasiswa tidak ditemukan');
      sendSuccess(res, rows[0], 'Beasiswa berhasil diupdate');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rowCount } = await query(
        `DELETE FROM ${s}.beasiswa WHERE id = $1`,
        [req.params.id]
      );
      if (rowCount === 0) throw new AppError(404, 'Beasiswa tidak ditemukan');
      sendSuccess(res, null, 'Beasiswa berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:id/penerima',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const status = req.query.status as string;
      let sql = `SELECT bp.*, m.nim, m.nama as mahasiswa_nama
                 FROM ${s}.beasiswa_penerima bp
                 JOIN ${s}.mahasiswa m ON m.id = bp.mahasiswa_id
                 WHERE bp.beasiswa_id = $1`;
      const params: unknown[] = [req.params.id];
      if (status) {
        sql += ` AND bp.status = $2`;
        params.push(status);
      }
      sql += ` ORDER BY bp.tanggal_daftar DESC`;
      const { rows } = await query(sql, params);
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/penerima',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.MAHASISWA),
  [
    body('mahasiswa_id').isUUID().withMessage('Mahasiswa tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { mahasiswa_id } = req.body;

      const { rows: bs } = await query(
        `SELECT * FROM ${s}.beasiswa WHERE id = $1`,
        [req.params.id]
      );
      if (bs.length === 0) throw new AppError(404, 'Beasiswa tidak ditemukan');

      const { rows: existing } = await query(
        `SELECT id FROM ${s}.beasiswa_penerima WHERE beasiswa_id = $1 AND mahasiswa_id = $2`,
        [req.params.id, mahasiswa_id]
      );
      if (existing.length > 0) throw new AppError(409, 'Mahasiswa sudah terdaftar sebagai penerima beasiswa ini');

      const { rows } = await query(
        `INSERT INTO ${s}.beasiswa_penerima (beasiswa_id, mahasiswa_id) VALUES ($1, $2) RETURNING *`,
        [req.params.id, mahasiswa_id]
      );
      sendSuccess(res, rows[0], 'Pendaftaran beasiswa berhasil', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/penerima/:id/status',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('status').isIn(['disetujui', 'ditolak']).withMessage('Status harus disetujui atau ditolak'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { status, keterangan } = req.body;
      const { rows } = await query(
        `UPDATE ${s}.beasiswa_penerima SET status = $1, keterangan = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
        [status, keterangan || null, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Penerima tidak ditemukan');
      sendSuccess(res, rows[0], `Pendaftaran ${status === 'disetujui' ? 'disetujui' : 'ditolak'}`);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/penerima/:id/pencairan',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT * FROM ${s}.beasiswa_pencairan WHERE penerima_id = $1 ORDER BY tanggal_cair DESC`,
        [req.params.id]
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/penerima/:id/pencairan',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('nominal').isNumeric().withMessage('Nominal harus berupa angka'),
    body('tanggal_cair').notEmpty().withMessage('Tanggal cair wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nominal, tanggal_cair, keterangan } = req.body;
      const { rows } = await query(
        `INSERT INTO ${s}.beasiswa_pencairan (penerima_id, nominal, tanggal_cair, keterangan) VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.params.id, nominal, tanggal_cair, keterangan || null]
      );
      sendSuccess(res, rows[0], 'Pencairan berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
