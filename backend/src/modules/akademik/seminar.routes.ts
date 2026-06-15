import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { v4 as uuid } from 'uuid';
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
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.KAPRODI),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const { mahasiswa_id, dosen_id, jenis, status, semester, tahun_akademik } = req.query;

      let sql = `SELECT s.*,
                        m.nama as mahasiswa_nama, m.nim,
                        pb1.nama as pembimbing_1_nama,
                        pb2.nama as pembimbing_2_nama,
                        pj1.nama as penguji_1_nama,
                        pj2.nama as penguji_2_nama
                 FROM ${s}.seminar s
                 JOIN ${s}.mahasiswa m ON m.id = s.mahasiswa_id
                 LEFT JOIN ${s}.dosen pb1 ON pb1.id = s.dosen_pembimbing_1
                 LEFT JOIN ${s}.dosen pb2 ON pb2.id = s.dosen_pembimbing_2
                 LEFT JOIN ${s}.dosen pj1 ON pj1.id = s.dosen_penguji_1
                 LEFT JOIN ${s}.dosen pj2 ON pj2.id = s.dosen_penguji_2`;

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (mahasiswa_id) {
        conditions.push(`s.mahasiswa_id = $${idx++}`);
        params.push(mahasiswa_id);
      }
      if (jenis) {
        conditions.push(`s.jenis = $${idx++}`);
        params.push(jenis);
      }
      if (status) {
        conditions.push(`s.status = $${idx++}`);
        params.push(status);
      }
      if (semester) {
        conditions.push(`s.semester = $${idx++}`);
        params.push(semester);
      }
      if (tahun_akademik) {
        conditions.push(`s.tahun_akademik = $${idx++}`);
        params.push(tahun_akademik);
      }
      if (dosen_id) {
        conditions.push(`(s.dosen_pembimbing_1 = $${idx} OR s.dosen_pembimbing_2 = $${idx} OR s.dosen_penguji_1 = $${idx} OR s.dosen_penguji_2 = $${idx})`);
        params.push(dosen_id);
        idx++;
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const countSql = `SELECT COUNT(*) as count FROM (${sql}) sub`;
      const { rows: countRows } = await query(countSql, params);
      const total = parseInt(countRows[0].count, 10);

      sql += ` ORDER BY s.tanggal DESC NULLS LAST LIMIT $${idx++} OFFSET $${idx++}`;
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
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.KAPRODI),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows: seminar } = await query(
        `SELECT s.*,
                m.nama as mahasiswa_nama, m.nim,
                pb1.nama as pembimbing_1_nama,
                pb2.nama as pembimbing_2_nama,
                pj1.nama as penguji_1_nama,
                pj2.nama as penguji_2_nama
         FROM ${s}.seminar s
         JOIN ${s}.mahasiswa m ON m.id = s.mahasiswa_id
         LEFT JOIN ${s}.dosen pb1 ON pb1.id = s.dosen_pembimbing_1
         LEFT JOIN ${s}.dosen pb2 ON pb2.id = s.dosen_pembimbing_2
         LEFT JOIN ${s}.dosen pj1 ON pj1.id = s.dosen_penguji_1
         LEFT JOIN ${s}.dosen pj2 ON pj2.id = s.dosen_penguji_2
         WHERE s.id = $1`,
        [req.params.id]
      );
      if (seminar.length === 0) throw new AppError(404, 'Seminar tidak ditemukan');

      const { rows: peserta } = await query(
        `SELECT sp.*, m.nama as mahasiswa_nama, m.nim, d.nama as dosen_nama
         FROM ${s}.seminar_peserta sp
         LEFT JOIN ${s}.mahasiswa m ON m.id = sp.mahasiswa_id
         LEFT JOIN ${s}.dosen d ON d.id = sp.dosen_id
         WHERE sp.seminar_id = $1
         ORDER BY sp.created_at`,
        [req.params.id]
      );

      sendSuccess(res, { ...seminar[0], peserta });
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
    body('judul').notEmpty().withMessage('Judul wajib diisi'),
    body('jenis').isIn(['seminar_proposal', 'seminar_hasil', 'seminar_umum']).withMessage('Jenis seminar tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { mahasiswa_id, judul, jenis, dosen_pembimbing_1, dosen_pembimbing_2, dosen_penguji_1, dosen_penguji_2, tanggal, jam_mulai, jam_selesai, ruangan, semester, tahun_akademik, status, catatan } = req.body;

      const id = uuid();
      await query(
        `INSERT INTO ${s}.seminar (id, mahasiswa_id, judul, jenis, dosen_pembimbing_1, dosen_pembimbing_2, dosen_penguji_1, dosen_penguji_2, tanggal, jam_mulai, jam_selesai, ruangan, semester, tahun_akademik, status, catatan)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [id, mahasiswa_id, judul, jenis, dosen_pembimbing_1 || null, dosen_pembimbing_2 || null, dosen_penguji_1 || null, dosen_penguji_2 || null, tanggal || null, jam_mulai || null, jam_selesai || null, ruangan || null, semester || null, tahun_akademik || null, status || 'dijadwalkan', catatan || null]
      );

      sendSuccess(res, { id }, 'Seminar berhasil ditambahkan', 201);
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
      const { mahasiswa_id, judul, jenis, dosen_pembimbing_1, dosen_pembimbing_2, dosen_penguji_1, dosen_penguji_2, tanggal, jam_mulai, jam_selesai, ruangan, semester, tahun_akademik, status, catatan } = req.body;

      const sets: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (mahasiswa_id !== undefined) { sets.push(`mahasiswa_id = $${idx++}`); params.push(mahasiswa_id); }
      if (judul !== undefined) { sets.push(`judul = $${idx++}`); params.push(judul); }
      if (jenis !== undefined) { sets.push(`jenis = $${idx++}`); params.push(jenis); }
      if (dosen_pembimbing_1 !== undefined) { sets.push(`dosen_pembimbing_1 = $${idx++}`); params.push(dosen_pembimbing_1); }
      if (dosen_pembimbing_2 !== undefined) { sets.push(`dosen_pembimbing_2 = $${idx++}`); params.push(dosen_pembimbing_2); }
      if (dosen_penguji_1 !== undefined) { sets.push(`dosen_penguji_1 = $${idx++}`); params.push(dosen_penguji_1); }
      if (dosen_penguji_2 !== undefined) { sets.push(`dosen_penguji_2 = $${idx++}`); params.push(dosen_penguji_2); }
      if (tanggal !== undefined) { sets.push(`tanggal = $${idx++}`); params.push(tanggal); }
      if (jam_mulai !== undefined) { sets.push(`jam_mulai = $${idx++}`); params.push(jam_mulai); }
      if (jam_selesai !== undefined) { sets.push(`jam_selesai = $${idx++}`); params.push(jam_selesai); }
      if (ruangan !== undefined) { sets.push(`ruangan = $${idx++}`); params.push(ruangan); }
      if (semester !== undefined) { sets.push(`semester = $${idx++}`); params.push(semester); }
      if (tahun_akademik !== undefined) { sets.push(`tahun_akademik = $${idx++}`); params.push(tahun_akademik); }
      if (status !== undefined) { sets.push(`status = $${idx++}`); params.push(status); }
      if (catatan !== undefined) { sets.push(`catatan = $${idx++}`); params.push(catatan); }
      sets.push(`updated_at = NOW()`);

      if (sets.length === 1) throw new AppError(400, 'Tidak ada data yang diubah');

      params.push(req.params.id);
      const { rows } = await query(
        `UPDATE ${s}.seminar SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id`,
        params
      );
      if (rows.length === 0) throw new AppError(404, 'Seminar tidak ditemukan');

      sendSuccess(res, rows[0], 'Seminar berhasil diubah');
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
      const { rows } = await query(
        `DELETE FROM ${s}.seminar WHERE id = $1 RETURNING id`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Seminar tidak ditemukan');
      sendSuccess(res, null, 'Seminar berhasil dihapus');
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
    body('nilai').isFloat({ min: 0, max: 100 }).withMessage('Nilai harus 0-100'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nilai, catatan } = req.body;

      const { rows } = await query(
        `UPDATE ${s}.seminar SET nilai = $1, catatan = COALESCE($2, catatan), updated_at = NOW() WHERE id = $3 RETURNING id`,
        [nilai, catatan || null, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Seminar tidak ditemukan');

      sendSuccess(res, rows[0], 'Nilai seminar berhasil disimpan');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/peserta',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KAPRODI),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { mahasiswa_id, dosen_id } = req.body;

      if (!mahasiswa_id && !dosen_id) {
        throw new AppError(400, 'Mahasiswa atau Dosen harus diisi');
      }

      const id = uuid();
      await query(
        `INSERT INTO ${s}.seminar_peserta (id, seminar_id, mahasiswa_id, dosen_id) VALUES ($1, $2, $3, $4)`,
        [id, req.params.id, mahasiswa_id || null, dosen_id || null]
      );

      sendSuccess(res, { id }, 'Peserta berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id/peserta/:peserta_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KAPRODI),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `DELETE FROM ${s}.seminar_peserta WHERE id = $1 AND seminar_id = $2 RETURNING id`,
        [req.params.peserta_id, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Peserta tidak ditemukan');
      sendSuccess(res, null, 'Peserta berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
