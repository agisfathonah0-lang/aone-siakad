import { Router, Request, Response, NextFunction } from 'express';
import { body, query as q } from 'express-validator';
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

router.get(
  '/kuisioner',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT * FROM ${s}.edom_kuisioner ORDER BY urutan, created_at`
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/kuisioner',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('pertanyaan').notEmpty().withMessage('Pertanyaan wajib diisi'),
    body('aspek').notEmpty().withMessage('Aspek wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { pertanyaan, aspek, is_active, urutan } = req.body;
      const { rows } = await query(
        `INSERT INTO ${s}.edom_kuisioner (id, pertanyaan, aspek, is_active, urutan)
         VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
        [pertanyaan, aspek, is_active !== false, urutan || 0]
      );
      sendSuccess(res, rows[0], 'Pertanyaan berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/kuisioner/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      for (const key of ['pertanyaan', 'aspek', 'is_active', 'urutan']) {
        if (req.body[key] !== undefined) {
          fields.push(`${key} = $${idx++}`);
          values.push(req.body[key]);
        }
      }

      if (fields.length === 0) throw new AppError(400, 'Tidak ada data yang diubah');
      values.push(req.params.id);

      const { rows } = await query(
        `UPDATE ${s}.edom_kuisioner SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );

      if (rows.length === 0) throw new AppError(404, 'Pertanyaan tidak ditemukan');
      sendSuccess(res, rows[0], 'Pertanyaan diperbarui');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/kuisioner/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `DELETE FROM ${s}.edom_kuisioner WHERE id = $1 RETURNING id`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Pertanyaan tidak ditemukan');
      sendSuccess(res, null, 'Pertanyaan berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/periode',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT * FROM ${s}.edom_periode ORDER BY tanggal_mulai DESC`
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/periode',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('nama').notEmpty().withMessage('Nama periode wajib diisi'),
    body('semester').notEmpty().withMessage('Semester wajib diisi'),
    body('tahun_akademik').notEmpty().withMessage('Tahun akademik wajib diisi'),
    body('tanggal_mulai').isISO8601().withMessage('Tanggal mulai tidak valid'),
    body('tanggal_selesai').isISO8601().withMessage('Tanggal selesai tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nama, semester, tahun_akademik, tanggal_mulai, tanggal_selesai, is_active } = req.body;

      const { rows } = await query(
        `INSERT INTO ${s}.edom_periode (id, nama, semester, tahun_akademik, tanggal_mulai, tanggal_selesai, is_active)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING *`,
        [nama, semester, tahun_akademik, tanggal_mulai, tanggal_selesai, is_active || false]
      );

      sendSuccess(res, rows[0], 'Periode berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/periode/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      for (const key of ['nama', 'semester', 'tahun_akademik', 'tanggal_mulai', 'tanggal_selesai', 'is_active']) {
        if (req.body[key] !== undefined) {
          fields.push(`${key} = $${idx++}`);
          values.push(req.body[key]);
        }
      }

      if (fields.length === 0) throw new AppError(400, 'Tidak ada data yang diubah');
      values.push(req.params.id);

      const { rows } = await query(
        `UPDATE ${s}.edom_periode SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );

      if (rows.length === 0) throw new AppError(404, 'Periode tidak ditemukan');
      sendSuccess(res, rows[0], 'Periode diperbarui');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/periode/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `DELETE FROM ${s}.edom_periode WHERE id = $1 RETURNING id`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Periode tidak ditemukan');
      sendSuccess(res, null, 'Periode berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/periode/:id/aktifkan',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const periodeId = req.params.id;

      await query(`UPDATE ${s}.edom_periode SET is_active = false WHERE is_active = true`);

      const { rows } = await query(
        `UPDATE ${s}.edom_periode SET is_active = true WHERE id = $1 RETURNING *`,
        [periodeId]
      );

      if (rows.length === 0) throw new AppError(404, 'Periode tidak ditemukan');
      sendSuccess(res, rows[0], 'Periode berhasil diaktifkan');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/jadwal/:periode_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT ej.*, j.hari, j.jam_mulai, j.jam_selesai, j.ruangan, j.kelas,
                mk.nama as mk_nama, mk.kode as mk_kode, mk.sks,
                d.nama as dosen_nama, d.nidn as dosen_nidn
         FROM ${s}.edom_jadwal ej
         JOIN ${s}.jadwal_kuliah j ON j.id = ej.jadwal_id
         LEFT JOIN ${s}.mata_kuliah mk ON mk.id = j.mata_kuliah_id
         LEFT JOIN ${s}.dosen d ON d.id = j.dosen_id
         WHERE ej.periode_id = $1
         ORDER BY j.hari, j.jam_mulai`,
        [req.params.periode_id]
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/jadwal',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('periode_id').isUUID().withMessage('Periode tidak valid'),
    body('jadwal_id').isUUID().withMessage('Jadwal tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { periode_id, jadwal_id } = req.body;

      const { rows } = await query(
        `INSERT INTO ${s}.edom_jadwal (id, periode_id, jadwal_id)
         VALUES (gen_random_uuid(), $1, $2) RETURNING *`,
        [periode_id, jadwal_id]
      );

      sendSuccess(res, rows[0], 'Jadwal berhasil ditambahkan ke periode', 201);
    } catch (err: any) {
      if (err.code === '23505') {
        return next(new AppError(409, 'Jadwal sudah terdaftar di periode ini'));
      }
      next(err);
    }
  }
);

router.delete(
  '/jadwal/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `DELETE FROM ${s}.edom_jadwal WHERE id = $1 RETURNING id`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Jadwal tidak ditemukan');
      sendSuccess(res, null, 'Jadwal berhasil dihapus dari periode');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/jawaban/:edom_jadwal_id/:mahasiswa_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { edom_jadwal_id, mahasiswa_id } = req.params;

      const { rows } = await query(
        `SELECT ej.id as edom_jadwal_id, jb.kuisioner_id, jb.nilai, jb.saran
         FROM ${s}.edom_jadwal ej
         LEFT JOIN ${s}.edom_jawaban jb ON jb.edom_jadwal_id = ej.id AND jb.mahasiswa_id = $2
         WHERE ej.id = $1`,
        [edom_jadwal_id, mahasiswa_id]
      );

      const jawaban = rows.filter(r => r.kuisioner_id);
      const saran = rows.length > 0 ? rows[0].saran : null;

      sendSuccess(res, { jawaban, saran });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/jawaban',
  authenticate,
  requireRole(Role.MAHASISWA),
  [
    body('edom_jadwal_id').isUUID().withMessage('EDOM jadwal tidak valid'),
    body('jawaban').isArray({ min: 1 }).withMessage('Jawaban wajib diisi'),
    body('jawaban.*.kuisioner_id').isUUID().withMessage('Kuisioner ID tidak valid'),
    body('jawaban.*.nilai').isInt({ min: 1, max: 5 }).withMessage('Nilai harus 1-5'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { edom_jadwal_id, jawaban, saran } = req.body;
      const { rows: mhs } = await query(
        `SELECT id FROM ${s}.mahasiswa WHERE user_id = $1`,
        [req.user!.id]
      );
      if (mhs.length === 0) throw new AppError(400, 'Data mahasiswa tidak ditemukan');
      const mahasiswaId = mhs[0].id;

      const { rows: periode } = await query(
        `SELECT p.is_active, p.tanggal_mulai, p.tanggal_selesai
         FROM ${s}.edom_jadwal ej
         JOIN ${s}.edom_periode p ON p.id = ej.periode_id
         WHERE ej.id = $1`,
        [edom_jadwal_id]
      );

      if (periode.length === 0) throw new AppError(404, 'Jadwal EDOM tidak ditemukan');
      if (!periode[0].is_active) throw new AppError(400, 'Periode EDOM tidak aktif');
      if (new Date() < new Date(periode[0].tanggal_mulai)) throw new AppError(400, 'Periode EDOM belum dimulai');
      if (new Date() > new Date(periode[0].tanggal_selesai)) throw new AppError(400, 'Periode EDOM sudah berakhir');

      const { rows: existing } = await query(
        `SELECT id FROM ${s}.edom_jawaban
         WHERE edom_jadwal_id = $1 AND mahasiswa_id = $2
         LIMIT 1`,
        [edom_jadwal_id, mahasiswaId]
      );

      if (existing.length > 0) throw new AppError(409, 'Anda sudah mengisi EDOM untuk jadwal ini');

      for (const j of jawaban) {
        await query(
          `INSERT INTO ${s}.edom_jawaban (id, edom_jadwal_id, kuisioner_id, mahasiswa_id, nilai, saran)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
          [edom_jadwal_id, j.kuisioner_id, mahasiswaId, j.nilai, saran || null]
        );
      }

      sendSuccess(res, null, 'EDOM berhasil disimpan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/rekap/dosen/:dosen_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const dosenId = req.params.dosen_id;
      const periodeId = req.query.periode_id as string;

      let sql = `
        SELECT k.aspek, AVG(jb.nilai)::NUMERIC(5,2) as rata_rata,
               COUNT(*) as total_jawaban, COUNT(DISTINCT jb.mahasiswa_id) as total_responden
        FROM ${s}.edom_jawaban jb
        JOIN ${s}.edom_kuisioner k ON k.id = jb.kuisioner_id
        JOIN ${s}.edom_jadwal ej ON ej.id = jb.edom_jadwal_id
        JOIN ${s}.jadwal_kuliah j ON j.id = ej.jadwal_id
        WHERE j.dosen_id = $1`;
      const params: unknown[] = [dosenId];

      if (periodeId) {
        sql += ` AND ej.periode_id = $2`;
        params.push(periodeId);
      }

      sql += ` GROUP BY k.aspek ORDER BY k.aspek`;

      const { rows } = await query(sql, params);
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/rekap/jadwal/:jadwal_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT k.aspek, AVG(jb.nilai)::NUMERIC(5,2) as rata_rata,
                COUNT(*) as total_jawaban, COUNT(DISTINCT jb.mahasiswa_id) as total_responden
         FROM ${s}.edom_jawaban jb
         JOIN ${s}.edom_kuisioner k ON k.id = jb.kuisioner_id
         JOIN ${s}.edom_jadwal ej ON ej.id = jb.edom_jadwal_id
         WHERE ej.jadwal_id = $1
         GROUP BY k.aspek
         ORDER BY k.aspek`,
        [req.params.jadwal_id]
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/rekap/ringkasan/:periode_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);

      const { rows: perAspek } = await query(
        `SELECT k.aspek, AVG(jb.nilai)::NUMERIC(5,2) as rata_rata,
                COUNT(*) as total_jawaban, COUNT(DISTINCT jb.mahasiswa_id) as total_responden
         FROM ${s}.edom_jawaban jb
         JOIN ${s}.edom_kuisioner k ON k.id = jb.kuisioner_id
         JOIN ${s}.edom_jadwal ej ON ej.id = jb.edom_jadwal_id
         WHERE ej.periode_id = $1
         GROUP BY k.aspek
         ORDER BY k.aspek`,
        [req.params.periode_id]
      );

      const { rows: overall } = await query(
        `SELECT AVG(jb.nilai)::NUMERIC(5,2) as rata_rata_keseluruhan,
                COUNT(DISTINCT jb.mahasiswa_id) as total_responden,
                COUNT(DISTINCT ej.jadwal_id) as total_jadwal_terisi,
                COUNT(jb.id) as total_jawaban
         FROM ${s}.edom_jawaban jb
         JOIN ${s}.edom_jadwal ej ON ej.id = jb.edom_jadwal_id
         WHERE ej.periode_id = $1`,
        [req.params.periode_id]
      );

      sendSuccess(res, {
        per_aspek: perAspek,
        ringkasan: overall[0],
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
