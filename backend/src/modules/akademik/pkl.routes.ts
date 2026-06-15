import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const mahasiswa_id = req.query.mahasiswa_id as string;
      const status = req.query.status as string;
      const semester = req.query.semester as string;

      let sql = `SELECT p.*, m.nim, m.nama as mahasiswa_nama, d.nama as pembimbing_nama
                 FROM ${s}.pkl p
                 JOIN ${s}.mahasiswa m ON m.id = p.mahasiswa_id
                 LEFT JOIN ${s}.dosen d ON d.id = p.dosen_pembimbing`;
      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (mahasiswa_id) { conditions.push(`p.mahasiswa_id = $${idx++}`); params.push(mahasiswa_id); }
      if (status) { conditions.push(`p.status = $${idx++}`); params.push(status); }
      if (semester) { conditions.push(`p.semester = $${idx++}`); params.push(semester); }

      if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;

      const countSql = `SELECT COUNT(*) as count FROM (${sql}) sub`;
      const { rows: countRows } = await query(countSql, params);
      const total = parseInt(countRows[0].count, 10);

      sql += ` ORDER BY p.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT p.*, m.nim, m.nama as mahasiswa_nama, d.nama as pembimbing_nama
         FROM ${s}.pkl p
         JOIN ${s}.mahasiswa m ON m.id = p.mahasiswa_id
         LEFT JOIN ${s}.dosen d ON d.id = p.dosen_pembimbing
         WHERE p.id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'PKL tidak ditemukan');

      const { rows: logbook } = await query(
        `SELECT * FROM ${s}.pkl_logbook WHERE pkl_id = $1 ORDER BY tanggal DESC`,
        [req.params.id]
      );

      sendSuccess(res, { ...rows[0], logbook });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KAPRODI, Role.MAHASISWA),
  [
    body('mahasiswa_id').isUUID().withMessage('Mahasiswa wajib dipilih'),
    body('perusahaan').notEmpty().withMessage('Perusahaan wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { mahasiswa_id, perusahaan, alamat_perusahaan, bidang, dosen_pembimbing, tanggal_mulai, tanggal_selesai, semester, tahun_akademik, status } = req.body;

      let mhsId = mahasiswa_id;
      if (req.user?.role === Role.MAHASISWA) {
        const { rows: mhs } = await query(
          `SELECT id FROM ${s}.mahasiswa WHERE user_id = $1`,
          [req.user.id]
        );
        if (mhs.length === 0) throw new AppError(404, 'Data mahasiswa tidak ditemukan');
        mhsId = mhs[0].id;
      }

      const { rows } = await query(
        `INSERT INTO ${s}.pkl (mahasiswa_id, perusahaan, alamat_perusahaan, bidang, dosen_pembimbing, tanggal_mulai, tanggal_selesai, semester, tahun_akademik, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [mhsId, perusahaan, alamat_perusahaan || null, bidang || null, dosen_pembimbing || null, tanggal_mulai || null, tanggal_selesai || null, semester || null, tahun_akademik || null, status || 'direncanakan']
      );
      sendSuccess(res, rows[0], 'PKL berhasil dibuat', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KAPRODI, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { perusahaan, alamat_perusahaan, bidang, dosen_pembimbing, tanggal_mulai, tanggal_selesai, semester, tahun_akademik, status, laporan_url } = req.body;
      const { rows } = await query(
        `UPDATE ${s}.pkl SET perusahaan = $1, alamat_perusahaan = $2, bidang = $3, dosen_pembimbing = $4, tanggal_mulai = $5, tanggal_selesai = $6, semester = $7, tahun_akademik = $8, status = $9, laporan_url = $10, updated_at = NOW()
         WHERE id = $11 RETURNING *`,
        [perusahaan, alamat_perusahaan || null, bidang || null, dosen_pembimbing || null, tanggal_mulai || null, tanggal_selesai || null, semester || null, tahun_akademik || null, status || 'direncanakan', laporan_url || null, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'PKL tidak ditemukan');
      sendSuccess(res, rows[0], 'PKL berhasil diupdate');
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
        `DELETE FROM ${s}.pkl WHERE id = $1`,
        [req.params.id]
      );
      if (rowCount === 0) throw new AppError(404, 'PKL tidak ditemukan');
      sendSuccess(res, null, 'PKL berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:pkl_id/logbook',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT * FROM ${s}.pkl_logbook WHERE pkl_id = $1 ORDER BY tanggal DESC`,
        [req.params.pkl_id]
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:pkl_id/logbook',
  authenticate,
  requireRole(Role.MAHASISWA, Role.ADMIN, Role.AKADEMIK),
  [
    body('kegiatan').notEmpty().withMessage('Kegiatan wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { tanggal, kegiatan, dokumentasi_url } = req.body;
      const { rows } = await query(
        `INSERT INTO ${s}.pkl_logbook (pkl_id, tanggal, kegiatan, dokumentasi_url)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.params.pkl_id, tanggal || new Date(), kegiatan, dokumentasi_url || null]
      );
      sendSuccess(res, rows[0], 'Logbook berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/logbook/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { tanggal, kegiatan, dokumentasi_url } = req.body;
      const { rows } = await query(
        `UPDATE ${s}.pkl_logbook SET tanggal = $1, kegiatan = $2, dokumentasi_url = $3 WHERE id = $4 RETURNING *`,
        [tanggal || new Date(), kegiatan, dokumentasi_url || null, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Logbook tidak ditemukan');
      sendSuccess(res, rows[0], 'Logbook berhasil diupdate');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/logbook/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rowCount } = await query(
        `DELETE FROM ${s}.pkl_logbook WHERE id = $1`,
        [req.params.id]
      );
      if (rowCount === 0) throw new AppError(404, 'Logbook tidak ditemukan');
      sendSuccess(res, null, 'Logbook berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/logbook/:id/approve',
  authenticate,
  requireRole(Role.DOSEN, Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { catatan_pembimbing } = req.body;
      const { rows } = await query(
        `UPDATE ${s}.pkl_logbook SET disetujui = true, catatan_pembimbing = $1 WHERE id = $2 RETURNING *`,
        [catatan_pembimbing || null, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Logbook tidak ditemukan');
      sendSuccess(res, rows[0], 'Logbook berhasil disetujui');
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id/nilai',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  [
    body('nilai').isFloat({ min: 0, max: 100 }).withMessage('Nilai harus 0-100'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `UPDATE ${s}.pkl SET nilai = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [req.body.nilai, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'PKL tidak ditemukan');
      sendSuccess(res, rows[0], 'Nilai PKL berhasil disimpan');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
