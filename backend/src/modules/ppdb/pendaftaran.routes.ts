import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { query } from '../../config/database.js';
import { validate } from '../../middleware/validator.js';
import { authenticate } from '../../middleware/auth.js';
import { optionalAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess, sendPaginated } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role, StatusPendaftaran, StatusPembayaran } from '../../types/enums.js';
import { snap } from '../../config/midtrans.js';

const router = Router();

function s(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

function generateNoDaftar(kodePt: string, tahun: number, urutan: number): string {
  return `${kodePt}${tahun}${String(urutan).padStart(5, '0')}`;
}

router.get(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const status = req.query.status as string;
      const schema = s(req);

      let where = '';
      const params: unknown[] = [];
      if (status) { where = ' WHERE p.status = $1'; params.push(status); }

      const { rows: totalRows } = await query(
        `SELECT COUNT(*) as count FROM ${schema}.ppdb_pendaftar p${where}`,
        params
      );
      const total = parseInt(totalRows[0].count, 10);

      const { rows } = await query(
        `SELECT p.*, u.id as user_id, u.email,
                ps.nama as prodi_nama, ps.jenjang
         FROM ${schema}.ppdb_pendaftar p
         LEFT JOIN ${schema}.users u ON u.id = p.user_id
         LEFT JOIN ${schema}.program_studi ps ON ps.id = p.program_studi_id
         ${where}
         ORDER BY p.created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/register',
  optionalAuth,
  [
    body('nama').notEmpty().withMessage('Nama wajib diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('no_hp').notEmpty().withMessage('No HP wajib diisi'),
    body('program_studi_id').isUUID().withMessage('Program studi tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { nama, email, password, no_hp, program_studi_id, jalur_pendaftaran, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, ...extraFields } = req.body;

      const { rows: exist } = await query(
        `SELECT id FROM ${schema}.users WHERE email = $1`,
        [email]
      );
      if (exist.length > 0) throw new AppError(409, 'Email sudah terdaftar');

      const { rows: count } = await query(
        `SELECT COUNT(*) as total FROM ${schema}.ppdb_pendaftar`
      );
      const noDaftar = generateNoDaftar('DEMO', new Date().getFullYear(), parseInt(count[0].total, 10) + 1);

      const passwordHash = await bcrypt.hash(password, 12);
      const userId = uuid();
      const pendaftarId = uuid();

      await query(
        `INSERT INTO ${schema}.users (id, email, password_hash, role, nama, no_hp, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [userId, email, passwordHash, 'calon_mahasiswa', nama, no_hp, tempat_lahir || null, tanggal_lahir || null, jenis_kelamin || null, alamat || null]
      );

      const dataPendaftar = { asal_sekolah: extraFields.asal_sekolah || null, ...extraFields };

      await query(
        `INSERT INTO ${schema}.ppdb_pendaftar (id, user_id, nomor_daftar, nama, program_studi_id, jalur_pendaftaran, data_pendaftar)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [pendaftarId, userId, noDaftar, nama, program_studi_id, jalur_pendaftaran || 'umum', JSON.stringify(dataPendaftar)]
      );

      sendSuccess(res, {
        id: pendaftarId,
        nomor_daftar: noDaftar,
        nama,
      }, 'Pendaftaran berhasil, silakan login', 201);
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
        `SELECT p.*, u.email, u.no_hp, u.tempat_lahir, u.tanggal_lahir, u.jenis_kelamin, u.alamat,
                ps.nama as prodi_nama, ps.jenjang
         FROM ${schema}.ppdb_pendaftar p
         LEFT JOIN ${schema}.users u ON u.id = p.user_id
         LEFT JOIN ${schema}.program_studi ps ON ps.id = p.program_studi_id
         WHERE p.id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Pendaftar tidak ditemukan');
      sendSuccess(res, rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id/status',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('status').isIn(['verifikasi', 'diterima', 'ditolak', 'daftar_ulang']).withMessage('Status tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { status } = req.body;

      const { rows } = await query(
        `UPDATE ${schema}.ppdb_pendaftar SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, nomor_daftar, status`,
        [status, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Pendaftar tidak ditemukan');

      if (status === 'diterima') {
        const pendaftar = rows[0];
        const { rows: detail } = await query(
          `SELECT p.*, u.email, u.no_hp, u.tempat_lahir, u.tanggal_lahir, u.jenis_kelamin, u.alamat
           FROM ${schema}.ppdb_pendaftar p
           LEFT JOIN ${schema}.users u ON u.id = p.user_id
           WHERE p.id = $1`,
          [pendaftar.id]
        );

        if (detail.length > 0) {
          const d = detail[0];
          const nim = `${new Date().getFullYear()}${String(Math.floor(Math.random() * 90000) + 10000)}`;

          await query(
            `INSERT INTO ${schema}.mahasiswa (id, user_id, nim, nama, program_studi_id)
             VALUES (gen_random_uuid(), $1, $2, $3, $4) ON CONFLICT DO NOTHING`,
            [d.user_id, nim, d.nama, d.program_studi_id]
          );

          await query(
            `UPDATE ${schema}.users SET role = 'mahasiswa', nim = $1 WHERE id = $2`,
            [nim, d.user_id]
          );
        }
      }

      sendSuccess(res, rows[0], `Status diubah menjadi ${status}`);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/payment',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { biaya_pendaftaran } = req.body;

      const { rows: pendaftar } = await query(
        `SELECT p.*, u.email FROM ${schema}.ppdb_pendaftar p
         LEFT JOIN ${schema}.users u ON u.id = p.user_id
         WHERE p.id = $1`,
        [req.params.id]
      );
      if (pendaftar.length === 0) throw new AppError(404, 'Pendaftar tidak ditemukan');

      const nominal = biaya_pendaftaran || 300000;
      const orderId = `PPDB-${pendaftar[0].nomor_daftar}-${Date.now()}`;

      const transaction = await snap.createTransaction({
        transaction_details: {
          order_id: orderId,
          gross_amount: nominal,
        },
        customer_details: {
          first_name: pendaftar[0].nama,
          email: pendaftar[0].email,
        },
      });

      sendSuccess(res, {
        order_id: orderId,
        nominal,
        token: transaction.token,
        redirect_url: transaction.redirect_url,
      }, 'Pembayaran PPDB berhasil dibuat');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/upload-dokumen',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { dokumen } = req.body;

      if (!Array.isArray(dokumen)) throw new AppError(400, 'Format dokumen tidak valid');

      const { rows: pendaftar } = await query(
        `SELECT dokumen FROM ${schema}.ppdb_pendaftar WHERE id = $1`,
        [req.params.id]
      );
      if (pendaftar.length === 0) throw new AppError(404, 'Pendaftar tidak ditemukan');

      const existing = pendaftar[0].dokumen || [];
      const merged = [...existing, ...dokumen];

      await query(
        `UPDATE ${schema}.ppdb_pendaftar SET dokumen = $1, updated_at = NOW() WHERE id = $2`,
        [JSON.stringify(merged), req.params.id]
      );

      sendSuccess(res, null, 'Dokumen berhasil diupload');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
