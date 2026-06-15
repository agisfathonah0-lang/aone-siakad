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

function hitungNilaiHuruf(nilai: number): string {
  if (nilai >= 85) return 'A';
  if (nilai >= 80) return 'A-';
  if (nilai >= 75) return 'B+';
  if (nilai >= 70) return 'B';
  if (nilai >= 65) return 'B-';
  if (nilai >= 60) return 'C+';
  if (nilai >= 55) return 'C';
  if (nilai >= 45) return 'D';
  return 'E';
}

router.get(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KAPRODI, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const s = schema(req);

      const mahasiswaId = req.query.mahasiswa_id as string;
      const dosenId = req.query.dosen_id as string;
      const status = req.query.status as string;
      const semester = req.query.semester as string;

      let sql = `SELECT s.*, m.nim, m.nama as mahasiswa_nama,
                        pb1.nama as pembimbing_1_nama, pb2.nama as pembimbing_2_nama,
                        pj1.nama as penguji_1_nama, pj2.nama as penguji_2_nama, pj3.nama as penguji_3_nama
                 FROM ${s}.sidang s
                 JOIN ${s}.mahasiswa m ON m.id = s.mahasiswa_id
                 LEFT JOIN ${s}.dosen pb1 ON pb1.id = s.dosen_pembimbing_1
                 LEFT JOIN ${s}.dosen pb2 ON pb2.id = s.dosen_pembimbing_2
                 LEFT JOIN ${s}.dosen pj1 ON pj1.id = s.dosen_penguji_1
                 LEFT JOIN ${s}.dosen pj2 ON pj2.id = s.dosen_penguji_2
                 LEFT JOIN ${s}.dosen pj3 ON pj3.id = s.dosen_penguji_3`;

      const params: unknown[] = [];
      const conditions: string[] = [];

      if (mahasiswaId) { conditions.push(`s.mahasiswa_id = $${params.length + 1}`); params.push(mahasiswaId); }
      if (status) { conditions.push(`s.status = $${params.length + 1}`); params.push(status); }
      if (semester) { conditions.push(`s.semester = $${params.length + 1}`); params.push(semester); }
      if (dosenId) {
        conditions.push(`($$${params.length + 1} IN (s.dosen_pembimbing_1, s.dosen_pembimbing_2, s.dosen_penguji_1, s.dosen_penguji_2, s.dosen_penguji_3))`);
        params.push(dosenId);
      }

      if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;

      const { rows: totalRows } = await query(`SELECT COUNT(*) as count FROM (${sql}) sub`, params);
      const total = parseInt(totalRows[0].count, 10);

      sql += ` ORDER BY s.tanggal DESC NULLS LAST, s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KAPRODI, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT s.*, m.nim, m.nama as mahasiswa_nama,
                pb1.nama as pembimbing_1_nama, pb2.nama as pembimbing_2_nama,
                pj1.nama as penguji_1_nama, pj2.nama as penguji_2_nama, pj3.nama as penguji_3_nama
         FROM ${s}.sidang s
         JOIN ${s}.mahasiswa m ON m.id = s.mahasiswa_id
         LEFT JOIN ${s}.dosen pb1 ON pb1.id = s.dosen_pembimbing_1
         LEFT JOIN ${s}.dosen pb2 ON pb2.id = s.dosen_pembimbing_2
         LEFT JOIN ${s}.dosen pj1 ON pj1.id = s.dosen_penguji_1
         LEFT JOIN ${s}.dosen pj2 ON pj2.id = s.dosen_penguji_2
         LEFT JOIN ${s}.dosen pj3 ON pj3.id = s.dosen_penguji_3
         WHERE s.id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Sidang tidak ditemukan');
      sendSuccess(res, rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KAPRODI),
  [
    body('mahasiswa_id').isUUID().withMessage('Mahasiswa tidak valid'),
    body('judul_skripsi').notEmpty().withMessage('Judul skripsi wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const {
        mahasiswa_id, judul_skripsi, dosen_pembimbing_1, dosen_pembimbing_2,
        dosen_penguji_1, dosen_penguji_2, dosen_penguji_3,
        tanggal, jam_mulai, jam_selesai, ruangan, semester, tahun_akademik, status, catatan,
      } = req.body;

      const { rows } = await query(
        `INSERT INTO ${s}.sidang (mahasiswa_id, judul_skripsi, dosen_pembimbing_1, dosen_pembimbing_2,
          dosen_penguji_1, dosen_penguji_2, dosen_penguji_3, tanggal, jam_mulai, jam_selesai,
          ruangan, semester, tahun_akademik, status, catatan)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING *`,
        [mahasiswa_id, judul_skripsi, dosen_pembimbing_1 || null, dosen_pembimbing_2 || null,
         dosen_penguji_1 || null, dosen_penguji_2 || null, dosen_penguji_3 || null,
         tanggal || null, jam_mulai || null, jam_selesai || null, ruangan || null,
         semester || null, tahun_akademik || null, status || 'dijadwalkan', catatan || null]
      );

      sendSuccess(res, rows[0], 'Sidang berhasil dibuat', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KAPRODI),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows: existing } = await query(`SELECT id FROM ${s}.sidang WHERE id = $1`, [req.params.id]);
      if (existing.length === 0) throw new AppError(404, 'Sidang tidak ditemukan');

      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      const allowedFields = [
        'judul_skripsi', 'dosen_pembimbing_1', 'dosen_pembimbing_2',
        'dosen_penguji_1', 'dosen_penguji_2', 'dosen_penguji_3',
        'tanggal', 'jam_mulai', 'jam_selesai', 'ruangan', 'semester',
        'tahun_akademik', 'status', 'catatan',
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          fields.push(`${field} = $${idx++}`);
          values.push(req.body[field] || null);
        }
      }

      if (fields.length === 0) throw new AppError(400, 'Tidak ada data yang diubah');
      fields.push(`updated_at = NOW()`);
      values.push(req.params.id);

      await query(
        `UPDATE ${s}.sidang SET ${fields.join(', ')} WHERE id = $${idx}`,
        values
      );

      sendSuccess(res, null, 'Sidang diperbarui');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KAPRODI),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(`DELETE FROM ${s}.sidang WHERE id = $1 RETURNING id`, [req.params.id]);
      if (rows.length === 0) throw new AppError(404, 'Sidang tidak ditemukan');
      sendSuccess(res, null, 'Sidang berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id/nilai',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.KAPRODI),
  [
    body('nilai_angka').isFloat({ min: 0, max: 100 }).withMessage('Nilai angka harus 0-100'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows: existing } = await query(`SELECT id FROM ${s}.sidang WHERE id = $1`, [req.params.id]);
      if (existing.length === 0) throw new AppError(404, 'Sidang tidak ditemukan');

      const nilaiAngka = parseFloat(req.body.nilai_angka);
      const nilaiHuruf = hitungNilaiHuruf(nilaiAngka);

      await query(
        `UPDATE ${s}.sidang SET nilai_angka = $1, nilai_huruf = $2, updated_at = NOW() WHERE id = $3`,
        [nilaiAngka, nilaiHuruf, req.params.id]
      );

      sendSuccess(res, { nilai_angka: nilaiAngka, nilai_huruf: nilaiHuruf }, 'Nilai sidang disimpan');
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id/status',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KAPRODI),
  [
    body('status').isIn(['lulus', 'tidak_lulus']).withMessage('Status harus lulus atau tidak_lulus'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows: existing } = await query(`SELECT id FROM ${s}.sidang WHERE id = $1`, [req.params.id]);
      if (existing.length === 0) throw new AppError(404, 'Sidang tidak ditemukan');

      await query(
        `UPDATE ${s}.sidang SET status = $1, updated_at = NOW() WHERE id = $2`,
        [req.body.status, req.params.id]
      );

      sendSuccess(res, null, `Status sidang diubah menjadi ${req.body.status}`);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
