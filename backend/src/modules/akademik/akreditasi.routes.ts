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
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const programStudiId = req.query.program_studi_id as string;
      const isCurrent = req.query.is_current as string;
      const jenis = req.query.jenis as string;

      let sql = `SELECT a.*, ps.nama as prodi_nama, ps.jenjang as prodi_jenjang
                 FROM ${s}.akreditasi_institusi a
                 LEFT JOIN ${s}.program_studi ps ON ps.id = a.program_studi_id`;

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (programStudiId) {
        conditions.push(`a.program_studi_id = $${idx++}`);
        params.push(programStudiId);
      }
      if (isCurrent !== undefined && isCurrent !== '') {
        conditions.push(`a.is_current = $${idx++}`);
        params.push(isCurrent === 'true');
      }
      if (jenis) {
        conditions.push(`a.jenis = $${idx++}`);
        params.push(jenis);
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const countSql = `SELECT COUNT(*) as count FROM (${sql}) sub`;
      const { rows: countRows } = await query(countSql, params);
      const total = parseInt(countRows[0].count, 10);

      sql += ` ORDER BY a.tahun_akreditasi DESC LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(limit, offset);

      const { rows } = await query(sql, params);
      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/standar',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT * FROM ${s}.standar_akreditasi ORDER BY kode`,
        []
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows: akreditasi } = await query(
        `SELECT a.*, ps.nama as prodi_nama, ps.jenjang as prodi_jenjang
         FROM ${s}.akreditasi_institusi a
         LEFT JOIN ${s}.program_studi ps ON ps.id = a.program_studi_id
         WHERE a.id = $1`,
        [req.params.id]
      );
      if (akreditasi.length === 0) throw new AppError(404, 'Akreditasi tidak ditemukan');

      const { rows: dokumen } = await query(
        `SELECT d.*, s.kode as standar_kode, s.nama as standar_nama
         FROM ${s}.dokumen_akreditasi d
         LEFT JOIN ${s}.standar_akreditasi s ON s.id = d.standar_id
         WHERE d.akreditasi_id = $1
         ORDER BY d.created_at`,
        [req.params.id]
      );

      sendSuccess(res, { ...akreditasi[0], dokumen });
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
    body('jenis').notEmpty().withMessage('Jenis akreditasi wajib diisi'),
    body('tahun_akreditasi').isInt({ min: 1900 }).withMessage('Tahun akreditasi tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { program_studi_id, jenis, peringkat, skor, nomor_sk, tanggal_sk, tanggal_kadaluarsa, file_sk, tahun_akreditasi, is_current } = req.body;

      const id = uuid();
      await query(
        `INSERT INTO ${s}.akreditasi_institusi (id, program_studi_id, jenis, peringkat, skor, nomor_sk, tanggal_sk, tanggal_kadaluarsa, file_sk, tahun_akreditasi, is_current)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [id, program_studi_id || null, jenis, peringkat || null, skor || null, nomor_sk || null, tanggal_sk || null, tanggal_kadaluarsa || null, file_sk || null, tahun_akreditasi, is_current !== undefined ? is_current : false]
      );

      sendSuccess(res, { id }, 'Akreditasi berhasil ditambahkan', 201);
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
      const { program_studi_id, jenis, peringkat, skor, nomor_sk, tanggal_sk, tanggal_kadaluarsa, file_sk, tahun_akreditasi, is_current } = req.body;

      const sets: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (program_studi_id !== undefined) { sets.push(`program_studi_id = $${idx++}`); params.push(program_studi_id); }
      if (jenis !== undefined) { sets.push(`jenis = $${idx++}`); params.push(jenis); }
      if (peringkat !== undefined) { sets.push(`peringkat = $${idx++}`); params.push(peringkat); }
      if (skor !== undefined) { sets.push(`skor = $${idx++}`); params.push(skor); }
      if (nomor_sk !== undefined) { sets.push(`nomor_sk = $${idx++}`); params.push(nomor_sk); }
      if (tanggal_sk !== undefined) { sets.push(`tanggal_sk = $${idx++}`); params.push(tanggal_sk); }
      if (tanggal_kadaluarsa !== undefined) { sets.push(`tanggal_kadaluarsa = $${idx++}`); params.push(tanggal_kadaluarsa); }
      if (file_sk !== undefined) { sets.push(`file_sk = $${idx++}`); params.push(file_sk); }
      if (tahun_akreditasi !== undefined) { sets.push(`tahun_akreditasi = $${idx++}`); params.push(tahun_akreditasi); }
      if (is_current !== undefined) { sets.push(`is_current = $${idx++}`); params.push(is_current); }
      sets.push(`updated_at = NOW()`);

      if (sets.length === 1) throw new AppError(400, 'Tidak ada data yang diubah');

      params.push(req.params.id);
      const { rows } = await query(
        `UPDATE ${s}.akreditasi_institusi SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id`,
        params
      );
      if (rows.length === 0) throw new AppError(404, 'Akreditasi tidak ditemukan');

      sendSuccess(res, rows[0], 'Akreditasi berhasil diubah');
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
      const { rows } = await query(
        `DELETE FROM ${s}.akreditasi_institusi WHERE id = $1 RETURNING id`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Akreditasi tidak ditemukan');
      sendSuccess(res, null, 'Akreditasi berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:akreditasi_id/dokumen',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT d.*, s.kode as standar_kode, s.nama as standar_nama
         FROM ${s}.dokumen_akreditasi d
         LEFT JOIN ${s}.standar_akreditasi s ON s.id = d.standar_id
         WHERE d.akreditasi_id = $1
         ORDER BY d.created_at`,
        [req.params.akreditasi_id]
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:akreditasi_id/dokumen',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('nama_dokumen').notEmpty().withMessage('Nama dokumen wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { standar_id, nama_dokumen, file_url, keterangan, status } = req.body;

      const { rows: akreditasi } = await query(
        `SELECT id FROM ${s}.akreditasi_institusi WHERE id = $1`,
        [req.params.akreditasi_id]
      );
      if (akreditasi.length === 0) throw new AppError(404, 'Akreditasi tidak ditemukan');

      const id = uuid();
      await query(
        `INSERT INTO ${s}.dokumen_akreditasi (id, akreditasi_id, standar_id, nama_dokumen, file_url, keterangan, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, req.params.akreditasi_id, standar_id || null, nama_dokumen, file_url || null, keterangan || null, status || 'draft']
      );

      sendSuccess(res, { id }, 'Dokumen berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/dokumen/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { standar_id, nama_dokumen, file_url, keterangan, status } = req.body;

      const sets: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (standar_id !== undefined) { sets.push(`standar_id = $${idx++}`); params.push(standar_id); }
      if (nama_dokumen !== undefined) { sets.push(`nama_dokumen = $${idx++}`); params.push(nama_dokumen); }
      if (file_url !== undefined) { sets.push(`file_url = $${idx++}`); params.push(file_url); }
      if (keterangan !== undefined) { sets.push(`keterangan = $${idx++}`); params.push(keterangan); }
      if (status !== undefined) { sets.push(`status = $${idx++}`); params.push(status); }
      sets.push(`updated_at = NOW()`);

      if (sets.length === 1) throw new AppError(400, 'Tidak ada data yang diubah');

      params.push(req.params.id);
      const { rows } = await query(
        `UPDATE ${s}.dokumen_akreditasi SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id`,
        params
      );
      if (rows.length === 0) throw new AppError(404, 'Dokumen tidak ditemukan');

      sendSuccess(res, rows[0], 'Dokumen berhasil diubah');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/dokumen/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `DELETE FROM ${s}.dokumen_akreditasi WHERE id = $1 RETURNING id`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Dokumen tidak ditemukan');
      sendSuccess(res, null, 'Dokumen berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
