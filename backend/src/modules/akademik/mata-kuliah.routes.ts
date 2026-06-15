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
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;
      const s = schema(req);

      const { rows: totalRows } = await query(`SELECT COUNT(*) as count FROM ${s}.mata_kuliah`);
      const total = parseInt(totalRows[0].count, 10);

      const { rows } = await query(
        `SELECT mk.*, p.nama as prodi_nama
         FROM ${s}.mata_kuliah mk
         LEFT JOIN ${s}.program_studi p ON p.id = mk.program_studi_id
         ORDER BY mk.kode
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
  '/:kode',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT mk.*, p.nama as prodi_nama, p.jenjang
         FROM ${s}.mata_kuliah mk
         LEFT JOIN ${s}.program_studi p ON p.id = mk.program_studi_id
         WHERE mk.kode = $1`,
        [req.params.kode]
      );
      if (rows.length === 0) throw new AppError(404, 'Mata kuliah tidak ditemukan');
      sendSuccess(res, rows[0]);
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
    body('kode').notEmpty().withMessage('Kode MK wajib diisi'),
    body('nama').notEmpty().withMessage('Nama MK wajib diisi'),
    body('sks').isInt({ min: 1, max: 24 }).withMessage('SKS harus 1-24'),
    body('semester').isInt({ min: 1, max: 14 }).withMessage('Semester harus 1-14'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { kode, nama, sks, semester, program_studi_id } = req.body;

      const { rows: exist } = await query(
        `SELECT id FROM ${s}.mata_kuliah WHERE kode = $1`,
        [kode]
      );
      if (exist.length > 0) throw new AppError(409, 'Kode MK sudah terdaftar');

      const { rows } = await query(
        `INSERT INTO ${s}.mata_kuliah (id, kode, nama, sks, semester, program_studi_id)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING id, kode, nama`,
        [kode, nama, sks, semester, program_studi_id || null]
      );

      sendSuccess(res, rows[0], 'Mata kuliah berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:kode',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nama, sks, semester, program_studi_id, is_active } = req.body;

      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (nama !== undefined) { fields.push(`nama = $${idx++}`); values.push(nama); }
      if (sks !== undefined) { fields.push(`sks = $${idx++}`); values.push(sks); }
      if (semester !== undefined) { fields.push(`semester = $${idx++}`); values.push(semester); }
      if (program_studi_id !== undefined) { fields.push(`program_studi_id = $${idx++}`); values.push(program_studi_id); }
      if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }

      if (fields.length === 0) throw new AppError(400, 'Tidak ada data yang diubah');

      values.push(req.params.kode);
      const { rows } = await query(
        `UPDATE ${s}.mata_kuliah SET ${fields.join(', ')} WHERE kode = $${idx} RETURNING id, kode, nama`,
        values
      );

      if (rows.length === 0) throw new AppError(404, 'Mata kuliah tidak ditemukan');
      sendSuccess(res, rows[0], 'Mata kuliah diperbarui');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:kode',
  authenticate,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `DELETE FROM ${s}.mata_kuliah WHERE kode = $1 RETURNING kode`,
        [req.params.kode]
      );
      if (rows.length === 0) throw new AppError(404, 'Mata kuliah tidak ditemukan');
      sendSuccess(res, null, 'Mata kuliah berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
