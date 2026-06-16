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

function s(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

router.get(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.KEUANGAN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const schema = s(req);

      const { rows: totalRows } = await query(`SELECT COUNT(*) as count FROM ${schema}.ukt_tagihan`);
      const total = parseInt(totalRows[0].count, 10);

      const { rows } = await query(
        `SELECT t.*, m.nim, m.nama as mahasiswa_nama, m.angkatan,
                p.nama as prodi_nama
         FROM ${schema}.ukt_tagihan t
         LEFT JOIN ${schema}.mahasiswa m ON m.id = t.mahasiswa_id
         LEFT JOIN ${schema}.program_studi p ON p.id = m.program_studi_id
         ORDER BY t.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { rows: mhs } = await query(
        `SELECT id, nim FROM ${schema}.mahasiswa WHERE user_id = $1`,
        [req.user!.id]
      );
      if (mhs.length === 0) throw new AppError(404, 'Data mahasiswa tidak ditemukan');

      const { rows } = await query(
        `SELECT t.*, m.nim, m.nama as mahasiswa_nama, m.angkatan,
                p.nama as prodi_nama
         FROM ${schema}.ukt_tagihan t
         JOIN ${schema}.mahasiswa m ON m.id = t.mahasiswa_id
         LEFT JOIN ${schema}.program_studi p ON p.id = m.program_studi_id
         WHERE m.id = $1
         ORDER BY t.tahun_akademik DESC, t.semester DESC`,
        [mhs[0].id]
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/mahasiswa/:nim',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { rows } = await query(
        `SELECT t.*, m.nim, m.nama as mahasiswa_nama, m.angkatan,
                p.nama as prodi_nama
         FROM ${schema}.ukt_tagihan t
         JOIN ${schema}.mahasiswa m ON m.id = t.mahasiswa_id
         LEFT JOIN ${schema}.program_studi p ON p.id = m.program_studi_id
         WHERE m.nim = $1
         ORDER BY t.tahun_akademik DESC, t.semester DESC`,
        [req.params.nim]
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { rows } = await query(
        `SELECT t.*, m.nim, m.nama as mahasiswa_nama,
                (SELECT COALESCE(SUM(nominal), 0) FROM ${schema}.ukt_pembayaran WHERE tagihan_id = t.id AND status = 'settlement') as total_terbayar
         FROM ${schema}.ukt_tagihan t
         JOIN ${schema}.mahasiswa m ON m.id = t.mahasiswa_id
         WHERE t.id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Tagihan tidak ditemukan');

      const { rows: pembayaran } = await query(
        `SELECT * FROM ${schema}.ukt_pembayaran WHERE tagihan_id = $1 ORDER BY created_at`,
        [req.params.id]
      );

      sendSuccess(res, { ...rows[0], pembayaran });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.KEUANGAN),
  [
    body('mahasiswa_id').isUUID().withMessage('Mahasiswa tidak valid'),
    body('tahun_akademik').notEmpty().withMessage('Tahun akademik wajib diisi'),
    body('semester').notEmpty().withMessage('Semester wajib diisi'),
    body('nominal').isFloat({ min: 0 }).withMessage('Nominal harus angka positif'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { mahasiswa_id, tahun_akademik, semester, nominal, jenis, jumlah_cicilan } = req.body;

      const { rows: exist } = await query(
        `SELECT id FROM ${schema}.ukt_tagihan WHERE mahasiswa_id = $1 AND tahun_akademik = $2 AND semester = $3 AND jenis = $4`,
        [mahasiswa_id, tahun_akademik, semester, jenis || 'ukt_semester']
      );
      if (exist.length > 0) throw new AppError(409, 'Tagihan untuk semester ini sudah ada');

      const { rows } = await query(
        `INSERT INTO ${schema}.ukt_tagihan (id, mahasiswa_id, tahun_akademik, semester, nominal, jenis, jumlah_cicilan)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING id`,
        [mahasiswa_id, tahun_akademik, semester, nominal, jenis || 'ukt_semester', jumlah_cicilan || 0]
      );

      sendSuccess(res, rows[0], 'Tagihan berhasil dibuat', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.KEUANGAN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      for (const key of ['nominal', 'jenis', 'jumlah_cicilan', 'status']) {
        if (req.body[key] !== undefined) {
          fields.push(`${key} = $${idx++}`);
          values.push(req.body[key]);
        }
      }

      if (fields.length === 0) throw new AppError(400, 'Tidak ada data yang diubah');
      values.push(req.params.id);

      const { rows } = await query(
        `UPDATE ${schema}.ukt_tagihan SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id`,
        values
      );
      if (rows.length === 0) throw new AppError(404, 'Tagihan tidak ditemukan');
      sendSuccess(res, rows[0], 'Tagihan diperbarui');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { rows } = await query(
        `DELETE FROM ${schema}.ukt_tagihan WHERE id = $1 RETURNING id`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Tagihan tidak ditemukan');
      sendSuccess(res, null, 'Tagihan berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
