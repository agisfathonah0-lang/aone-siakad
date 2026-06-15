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
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const jadwalId = req.query.jadwal_id as string;

      let sql = `SELECT b.*, j.hari, j.jam_mulai, j.jam_selesai, j.kelas, j.tahun_akademik,
                        mk.nama as mk_nama, mk.kode as mk_kode,
                        d.nama as dosen_nama
                 FROM ${s}.bap b
                 JOIN ${s}.jadwal_kuliah j ON j.id = b.jadwal_id
                 JOIN ${s}.mata_kuliah mk ON mk.id = j.mata_kuliah_id
                 LEFT JOIN ${s}.dosen d ON d.id = j.dosen_id`;

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (jadwalId) {
        conditions.push(`b.jadwal_id = $${idx++}`);
        params.push(jadwalId);
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const countSql = `SELECT COUNT(*) as count FROM (${sql}) sub`;
      const { rows: countRows } = await query(countSql, params);
      const total = parseInt(countRows[0].count, 10);

      sql += ` ORDER BY b.pertemuan LIMIT $${idx++} OFFSET $${idx++}`;
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
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  [
    body('jadwal_id').isUUID().withMessage('Jadwal tidak valid'),
    body('pertemuan').isInt({ min: 1 }).withMessage('Pertemuan tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { jadwal_id, pertemuan, tanggal, materi, jumlah_mahasiswa_hadir, jumlah_mahasiswa_terdaftar, catatan, dosen_pengganti } = req.body;

      const { rows: existing } = await query(
        `SELECT id FROM ${s}.bap WHERE jadwal_id = $1 AND pertemuan = $2`,
        [jadwal_id, pertemuan]
      );
      if (existing.length > 0) throw new AppError(409, 'BAP untuk pertemuan ini sudah ada');

      const id = uuid();
      await query(
        `INSERT INTO ${s}.bap (id, jadwal_id, pertemuan, tanggal, materi, jumlah_mahasiswa_hadir, jumlah_mahasiswa_terdaftar, catatan, dosen_pengganti)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, jadwal_id, pertemuan, tanggal || new Date().toISOString().split('T')[0], materi || null, jumlah_mahasiswa_hadir || 0, jumlah_mahasiswa_terdaftar || 0, catatan || null, dosen_pengganti || null]
      );

      sendSuccess(res, { id }, 'BAP berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  [
    body('pertemuan').optional().isInt({ min: 1 }).withMessage('Pertemuan tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { pertemuan, tanggal, materi, jumlah_mahasiswa_hadir, jumlah_mahasiswa_terdaftar, catatan, dosen_pengganti } = req.body;

      const sets: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (pertemuan !== undefined) { sets.push(`pertemuan = $${idx++}`); params.push(pertemuan); }
      if (tanggal !== undefined) { sets.push(`tanggal = $${idx++}`); params.push(tanggal); }
      if (materi !== undefined) { sets.push(`materi = $${idx++}`); params.push(materi); }
      if (jumlah_mahasiswa_hadir !== undefined) { sets.push(`jumlah_mahasiswa_hadir = $${idx++}`); params.push(jumlah_mahasiswa_hadir); }
      if (jumlah_mahasiswa_terdaftar !== undefined) { sets.push(`jumlah_mahasiswa_terdaftar = $${idx++}`); params.push(jumlah_mahasiswa_terdaftar); }
      if (catatan !== undefined) { sets.push(`catatan = $${idx++}`); params.push(catatan); }
      if (dosen_pengganti !== undefined) { sets.push(`dosen_pengganti = $${idx++}`); params.push(dosen_pengganti); }
      sets.push(`updated_at = NOW()`);

      if (sets.length === 1) throw new AppError(400, 'Tidak ada data yang diubah');

      params.push(req.params.id);
      const { rows } = await query(
        `UPDATE ${s}.bap SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id`,
        params
      );
      if (rows.length === 0) throw new AppError(404, 'BAP tidak ditemukan');

      sendSuccess(res, rows[0], 'BAP berhasil diubah');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `DELETE FROM ${s}.bap WHERE id = $1 RETURNING id`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'BAP tidak ditemukan');
      sendSuccess(res, null, 'BAP berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
