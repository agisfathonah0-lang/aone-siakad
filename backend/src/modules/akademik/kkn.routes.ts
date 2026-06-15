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

router.get('/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const mahasiswa_id = req.query.mahasiswa_id as string;
      const status = req.query.status as string;
      const semester = req.query.semester as string;

      let sql = `SELECT k.*, m.nim, m.nama as mahasiswa_nama, d.nama as pembimbing_nama
                 FROM ${s}.kkn k
                 LEFT JOIN ${s}.mahasiswa m ON m.id = k.mahasiswa_id
                 LEFT JOIN ${s}.dosen d ON d.id = k.dosen_pembimbing`;
      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (mahasiswa_id) {
        conditions.push(`k.mahasiswa_id = $${idx++}`);
        params.push(mahasiswa_id);
      }
      if (status) {
        conditions.push(`k.status = $${idx++}`);
        params.push(status);
      }
      if (semester) {
        conditions.push(`k.semester = $${idx++}`);
        params.push(semester);
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const countSql = `SELECT COUNT(*) as count FROM (${sql}) sub`;
      const { rows: countRows } = await query(countSql, params);
      const total = parseInt(countRows[0].count, 10);

      sql += ` ORDER BY k.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(limit, offset);

      const { rows } = await query(sql, params);
      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT k.*, m.nim, m.nama as mahasiswa_nama, d.nama as pembimbing_nama
         FROM ${s}.kkn k
         LEFT JOIN ${s}.mahasiswa m ON m.id = k.mahasiswa_id
         LEFT JOIN ${s}.dosen d ON d.id = k.dosen_pembimbing
         WHERE k.id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'KKN tidak ditemukan');

      const { rows: logbook } = await query(
        `SELECT * FROM ${s}.kkn_logbook WHERE kkn_id = $1 ORDER BY tanggal DESC`,
        [req.params.id]
      );

      sendSuccess(res, { ...rows[0], logbook });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('mahasiswa_id').isUUID().withMessage('Mahasiswa tidak valid'),
    body('lokasi').notEmpty().withMessage('Lokasi wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { mahasiswa_id, lokasi, kelompok, dosen_pembimbing, tema, tanggal_mulai, tanggal_selesai, semester, tahun_akademik, status } = req.body;
      const { rows } = await query(
        `INSERT INTO ${s}.kkn (mahasiswa_id, lokasi, kelompok, dosen_pembimbing, tema, tanggal_mulai, tanggal_selesai, semester, tahun_akademik, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [mahasiswa_id, lokasi, kelompok || null, dosen_pembimbing || null, tema || null, tanggal_mulai || null, tanggal_selesai || null, semester || null, tahun_akademik || null, status || 'direncanakan']
      );
      sendSuccess(res, rows[0], 'KKN berhasil dibuat', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { mahasiswa_id, lokasi, kelompok, dosen_pembimbing, tema, tanggal_mulai, tanggal_selesai, semester, tahun_akademik, status, laporan_url } = req.body;
      const { rows } = await query(
        `UPDATE ${s}.kkn SET mahasiswa_id = $1, lokasi = $2, kelompok = $3, dosen_pembimbing = $4, tema = $5, tanggal_mulai = $6, tanggal_selesai = $7, semester = $8, tahun_akademik = $9, status = $10, laporan_url = $11, updated_at = NOW()
         WHERE id = $12 RETURNING *`,
        [mahasiswa_id, lokasi, kelompok || null, dosen_pembimbing || null, tema || null, tanggal_mulai || null, tanggal_selesai || null, semester || null, tahun_akademik || null, status, laporan_url || null, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'KKN tidak ditemukan');
      sendSuccess(res, rows[0], 'KKN berhasil diupdate');
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rowCount } = await query(
        `DELETE FROM ${s}.kkn WHERE id = $1`,
        [req.params.id]
      );
      if (rowCount === 0) throw new AppError(404, 'KKN tidak ditemukan');
      sendSuccess(res, null, 'KKN berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id/nilai',
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
        `UPDATE ${s}.kkn SET nilai = $1, status = 'selesai', updated_at = NOW() WHERE id = $2 RETURNING *`,
        [req.body.nilai, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'KKN tidak ditemukan');
      sendSuccess(res, rows[0], 'Nilai KKN berhasil diinput');
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:kkn_id/logbook',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT * FROM ${s}.kkn_logbook WHERE kkn_id = $1 ORDER BY tanggal DESC`,
        [req.params.kkn_id]
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/:kkn_id/logbook',
  authenticate,
  requireRole(Role.MAHASISWA),
  [
    body('kegiatan').notEmpty().withMessage('Kegiatan wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { kegiatan, dokumentasi_url } = req.body;

      const { rows: kkn } = await query(
        `SELECT id FROM ${s}.kkn WHERE id = $1`,
        [req.params.kkn_id]
      );
      if (kkn.length === 0) throw new AppError(404, 'KKN tidak ditemukan');

      const { rows } = await query(
        `INSERT INTO ${s}.kkn_logbook (kkn_id, kegiatan, dokumentasi_url)
         VALUES ($1, $2, $3) RETURNING *`,
        [req.params.kkn_id, kegiatan, dokumentasi_url || null]
      );
      sendSuccess(res, rows[0], 'Logbook berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/logbook/:id',
  authenticate,
  requireRole(Role.MAHASISWA, Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { kegiatan, dokumentasi_url } = req.body;
      const { rows } = await query(
        `UPDATE ${s}.kkn_logbook SET kegiatan = $1, dokumentasi_url = $2 WHERE id = $3 RETURNING *`,
        [kegiatan, dokumentasi_url || null, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Logbook tidak ditemukan');
      sendSuccess(res, rows[0], 'Logbook berhasil diupdate');
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/logbook/:id',
  authenticate,
  requireRole(Role.MAHASISWA, Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rowCount } = await query(
        `DELETE FROM ${s}.kkn_logbook WHERE id = $1`,
        [req.params.id]
      );
      if (rowCount === 0) throw new AppError(404, 'Logbook tidak ditemukan');
      sendSuccess(res, null, 'Logbook berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.put('/logbook/:id/approve',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { catatan_pembimbing } = req.body;
      const { rows } = await query(
        `UPDATE ${s}.kkn_logbook SET disetujui = true, catatan_pembimbing = $1 WHERE id = $2 RETURNING *`,
        [catatan_pembimbing || null, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Logbook tidak ditemukan');
      sendSuccess(res, rows[0], 'Logbook berhasil disetujui');
    } catch (err) {
      next(err);
    }
  }
);

router.get('/kelompok',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT kk.*, d.nama as pembimbing_nama,
                (SELECT COUNT(*) FROM ${s}.kkn_anggota_kelompok WHERE kelompok_id = kk.id) as jumlah_anggota
         FROM ${s}.kkn_kelompok kk
         LEFT JOIN ${s}.dosen d ON d.id = kk.dosen_pembimbing
         ORDER BY kk.nama ASC`
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/kelompok',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('nama').notEmpty().withMessage('Nama kelompok wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nama, lokasi, dosen_pembimbing } = req.body;
      const { rows } = await query(
        `INSERT INTO ${s}.kkn_kelompok (nama, lokasi, dosen_pembimbing) VALUES ($1, $2, $3) RETURNING *`,
        [nama, lokasi || null, dosen_pembimbing || null]
      );
      sendSuccess(res, rows[0], 'Kelompok berhasil dibuat', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/kelompok/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nama, lokasi, dosen_pembimbing } = req.body;
      const { rows } = await query(
        `UPDATE ${s}.kkn_kelompok SET nama = $1, lokasi = $2, dosen_pembimbing = $3 WHERE id = $4 RETURNING *`,
        [nama, lokasi || null, dosen_pembimbing || null, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Kelompok tidak ditemukan');
      sendSuccess(res, rows[0], 'Kelompok berhasil diupdate');
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/kelompok/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rowCount } = await query(
        `DELETE FROM ${s}.kkn_kelompok WHERE id = $1`,
        [req.params.id]
      );
      if (rowCount === 0) throw new AppError(404, 'Kelompok tidak ditemukan');
      sendSuccess(res, null, 'Kelompok berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.post('/kelompok/:id/anggota',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('mahasiswa_id').isUUID().withMessage('Mahasiswa tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `INSERT INTO ${s}.kkn_anggota_kelompok (kelompok_id, mahasiswa_id) VALUES ($1, $2) RETURNING *`,
        [req.params.id, req.body.mahasiswa_id]
      );
      sendSuccess(res, rows[0], 'Anggota berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/kelompok/:id/anggota/:mahasiswa_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rowCount } = await query(
        `DELETE FROM ${s}.kkn_anggota_kelompok WHERE kelompok_id = $1 AND mahasiswa_id = $2`,
        [req.params.id, req.params.mahasiswa_id]
      );
      if (rowCount === 0) throw new AppError(404, 'Anggota tidak ditemukan');
      sendSuccess(res, null, 'Anggota berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
