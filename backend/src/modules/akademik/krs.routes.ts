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
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const mahasiswaId = req.query.mahasiswa_id as string;
      const status = req.query.status as string;

      let sql = `SELECT k.*, j.hari, j.jam_mulai, j.jam_selesai, j.ruangan, j.kelas, j.tahun_akademik,
                        mk.nama as mk_nama, mk.kode as mk_kode, mk.sks,
                        d.nama as dosen_nama,
                        n.nilai_tugas, n.nilai_uts, n.nilai_uas, n.nilai_akhir, n.nilai_huruf
                 FROM ${s}.krs k
                 JOIN ${s}.jadwal_kuliah j ON j.id = k.jadwal_id
                 JOIN ${s}.mata_kuliah mk ON mk.id = j.mata_kuliah_id
                 LEFT JOIN ${s}.dosen d ON d.id = j.dosen_id
                 LEFT JOIN ${s}.nilai n ON n.krs_id = k.id`;

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (mahasiswaId) {
        conditions.push(`k.mahasiswa_id = $${idx++}`);
        params.push(mahasiswaId);
      }
      if (status) {
        conditions.push(`k.status = $${idx++}`);
        params.push(status);
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const countSql = `SELECT COUNT(*) as count FROM (${sql}) sub`;
      const { rows: countRows } = await query(countSql, params);
      const total = parseInt(countRows[0].count, 10);

      sql += ` ORDER BY j.hari, j.jam_mulai LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(limit, offset);

      const { rows } = await query(sql, params);
      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  authenticate,
  requireRole(Role.MAHASISWA, Role.ADMIN, Role.AKADEMIK),
  [
    body('mahasiswa_id').isUUID().withMessage('Mahasiswa tidak valid'),
    body('jadwal_id').isUUID().withMessage('Jadwal tidak valid'),
    body('tahun_akademik').notEmpty().withMessage('Tahun akademik wajib diisi'),
    body('semester').notEmpty().withMessage('Semester wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { mahasiswa_id, jadwal_id, tahun_akademik, semester } = req.body;

      const { rows: conflict } = await query(
        `SELECT id FROM ${s}.krs WHERE mahasiswa_id = $1 AND jadwal_id = $2 AND tahun_akademik = $3 AND semester = $4`,
        [mahasiswa_id, jadwal_id, tahun_akademik, semester]
      );
      if (conflict.length > 0) throw new AppError(409, 'Mahasiswa sudah terdaftar di jadwal ini');

      const { rows: minSetting } = await query(
        `SELECT value FROM public.tenant_settings WHERE tenant_id = $1 AND key = 'min_payment_for_krs'`,
        [req.tenant!.id]
      );
      const minPaymentPct = minSetting.length > 0 ? parseFloat(minSetting[0].value) || 0 : 0;
      if (minPaymentPct > 0) {
        const { rows: tagihanRows } = await query(
          `SELECT t.nominal, COALESCE((SELECT SUM(p.nominal) FROM ${s}.ukt_pembayaran p WHERE p.tagihan_id = t.id AND p.status = 'settlement'), 0) as total_bayar
           FROM ${s}.ukt_tagihan t
           WHERE t.mahasiswa_id = $1 AND t.tahun_akademik = $2 AND t.semester = $3`,
          [mahasiswa_id, tahun_akademik, semester]
        );
        let totalTagihan = 0, totalBayar = 0;
        for (const tr of tagihanRows) { totalTagihan += parseFloat(tr.nominal); totalBayar += parseFloat(tr.total_bayar); }
        if (totalTagihan > 0) {
          const pct = (totalBayar / totalTagihan) * 100;
          if (pct < minPaymentPct) {
            throw new AppError(403, `Belum memenuhi minimal pembayaran ${minPaymentPct}%. Tagihan Rp${Math.round(totalTagihan).toLocaleString('id-ID')}, sudah dibayar Rp${Math.round(totalBayar).toLocaleString('id-ID')}`);
          }
        }
      }

      const { rows } = await query(
        `SELECT COUNT(*) as count FROM ${s}.krs k
         JOIN ${s}.jadwal_kuliah j ON j.id = k.jadwal_id
         WHERE k.mahasiswa_id = $1 AND k.tahun_akademik = $2 AND k.semester = $3 AND k.status IN ('pending', 'disetujui')`,
        [mahasiswa_id, tahun_akademik, semester]
      );

      const { rows: quota } = await query(
        `SELECT kuota FROM ${s}.jadwal_kuliah WHERE id = $1`,
        [jadwal_id]
      );
      if (quota.length > 0) {
        const { rows: enrolled } = await query(
          `SELECT COUNT(*) as count FROM ${s}.krs WHERE jadwal_id = $1 AND status != 'dibatalkan'`,
          [jadwal_id]
        );
        if (parseInt(enrolled[0].count, 10) >= quota[0].kuota) {
          throw new AppError(409, 'Kuota jadwal sudah penuh');
        }
      }

      const krsId = uuid();
      await query(
        `INSERT INTO ${s}.krs (id, mahasiswa_id, jadwal_id, tahun_akademik, semester)
         VALUES ($1, $2, $3, $4, $5)`,
        [krsId, mahasiswa_id, jadwal_id, tahun_akademik, semester]
      );

      await query(
        `INSERT INTO ${s}.nilai (id, krs_id) VALUES (gen_random_uuid(), $1)`,
        [krsId]
      );

      sendSuccess(res, { id: krsId }, 'KRS berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id/approve',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `UPDATE ${s}.krs SET status = 'disetujui', approved_by = $1, approved_at = NOW()
         WHERE id = $2 AND status = 'pending' RETURNING id`,
        [req.user!.id, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'KRS tidak ditemukan atau sudah diproses');
      sendSuccess(res, rows[0], 'KRS disetujui');
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id/reject',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  [
    body('alasan_penolakan').optional().isString().withMessage('Alasan penolakan harus berupa teks'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const alasan = req.body.alasan_penolakan || null;
      const { rows } = await query(
        `UPDATE ${s}.krs SET status = 'ditolak', approved_by = $1, approved_at = NOW(), alasan_penolakan = $2
         WHERE id = $3 AND status = 'pending' RETURNING id`,
        [req.user!.id, alasan, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'KRS tidak ditemukan atau sudah diproses');
      sendSuccess(res, rows[0], 'KRS ditolak');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `UPDATE ${s}.krs SET status = 'dibatalkan' WHERE id = $1 AND status = 'pending' RETURNING id`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'KRS tidak ditemukan atau sudah diproses');
      sendSuccess(res, null, 'KRS dibatalkan');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/me',
  authenticate,
  requireRole(Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT id as mahasiswa_id, nim, nama FROM ${s}.mahasiswa WHERE user_id = $1`,
        [req.user!.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Data mahasiswa tidak ditemukan');
      sendSuccess(res, rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/transcript/:mahasiswa_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT mk.kode, mk.nama as mk_nama, mk.sks, n.nilai_akhir, n.nilai_huruf,
                j.semester, j.tahun_akademik, k.status
         FROM ${s}.krs k
         JOIN ${s}.jadwal_kuliah j ON j.id = k.jadwal_id
         JOIN ${s}.mata_kuliah mk ON mk.id = j.mata_kuliah_id
         LEFT JOIN ${s}.nilai n ON n.krs_id = k.id
         WHERE k.mahasiswa_id = $1 AND k.status = 'disetujui'
         ORDER BY j.tahun_akademik, j.semester`,
        [req.params.mahasiswa_id]
      );

      let totalSks = 0;
      let totalBobot = 0;
      const nilaiMap: Record<string, number> = { A: 4, 'A-': 3.7, 'B+': 3.3, B: 3, 'B-': 2.7, 'C+': 2.3, C: 2, D: 1, E: 0 };

      for (const r of rows) {
        if (r.nilai_huruf && nilaiMap[r.nilai_huruf] !== undefined) {
          totalSks += r.sks;
          totalBobot += nilaiMap[r.nilai_huruf] * r.sks;
        }
      }

      sendSuccess(res, {
        rows,
        ipk: totalSks > 0 ? +(totalBobot / totalSks).toFixed(2) : 0,
        totalSks,
        totalMk: rows.length,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
