import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { v4 as uuid } from 'uuid';
import { query } from '../../config/database.js';
import { validate } from '../../middleware/validator.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role, StatusPembayaran } from '../../types/enums.js';
import { getSnap } from '../../services/midtrans.js';

const router = Router();

function s(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const tagihanId = req.query.tagihan_id as string;
      const mahasiswaId = req.query.mahasiswa_id as string;

      let sql = `SELECT p.*, t.tahun_akademik, t.semester, t.nominal as tagihan_nominal, t.jenis,
                        m.nim, m.nama as mahasiswa_nama
                 FROM ${schema}.ukt_pembayaran p
                 JOIN ${schema}.ukt_tagihan t ON t.id = p.tagihan_id
                 JOIN ${schema}.mahasiswa m ON m.id = p.mahasiswa_id`;

      const params: unknown[] = [];
      const conditions: string[] = [];

      if (tagihanId) { conditions.push(`p.tagihan_id = $${params.length + 1}`); params.push(tagihanId); }
      if (mahasiswaId) { conditions.push(`p.mahasiswa_id = $${params.length + 1}`); params.push(mahasiswaId); }

      if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;
      sql += ` ORDER BY p.created_at DESC`;

      const { rows } = await query(sql, params);
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/midtrans-snap',
  authenticate,
  requireRole(Role.MAHASISWA, Role.ADMIN, Role.KEUANGAN),
  [
    body('tagihan_id').isUUID().withMessage('Tagihan tidak valid'),
    body('nominal').isFloat({ min: 1000 }).withMessage('Nominal minimal Rp1.000'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { tagihan_id, nominal, cicilan_ke } = req.body;
      const userId = req.user!.id;

      const { rows: tagihan } = await query(
        `SELECT t.*, m.nim, m.nama FROM ${schema}.ukt_tagihan t
         JOIN ${schema}.mahasiswa m ON m.id = t.mahasiswa_id
         WHERE t.id = $1`,
        [tagihan_id]
      );
      if (tagihan.length === 0) throw new AppError(404, 'Tagihan tidak ditemukan');

      const orderId = `UKT-${tagihan[0].nim}-${Date.now()}`;
      const pembayaranId = uuid();

      await query(
        `INSERT INTO ${schema}.ukt_pembayaran (id, tagihan_id, mahasiswa_id, cicilan_ke, nominal, metode, midtrans_order_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [pembayaranId, tagihan_id, tagihan[0].mahasiswa_id, cicilan_ke || null, nominal, 'midtrans_snap', orderId, StatusPembayaran.PENDING]
      );

      const midtransSnap = await getSnap(req.tenant!.id);
      const transaction = await midtransSnap.createTransaction({
        transaction_details: {
          order_id: orderId,
          gross_amount: nominal,
        },
        customer_details: {
          first_name: tagihan[0].nama,
          email: req.user!.email,
        },
        credit_card: { secure: true },
      });

      sendSuccess(res, {
        pembayaran_id: pembayaranId,
        order_id: orderId,
        token: transaction.token,
        redirect_url: transaction.redirect_url,
      }, 'Transaksi Midtrans berhasil dibuat');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/manual',
  authenticate,
  requireRole(Role.ADMIN, Role.KEUANGAN),
  [
    body('tagihan_id').isUUID().withMessage('Tagihan tidak valid'),
    body('nominal').isFloat({ min: 0 }).withMessage('Nominal harus angka positif'),
    body('metode').notEmpty().withMessage('Metode pembayaran wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { tagihan_id, nominal, cicilan_ke, metode } = req.body;

      const { rows: tagihan } = await query(
        `SELECT * FROM ${schema}.ukt_tagihan WHERE id = $1`,
        [tagihan_id]
      );
      if (tagihan.length === 0) throw new AppError(404, 'Tagihan tidak ditemukan');

      const { rows } = await query(
        `INSERT INTO ${schema}.ukt_pembayaran (id, tagihan_id, mahasiswa_id, cicilan_ke, nominal, metode, status, paid_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
        [tagihan_id, tagihan[0].mahasiswa_id, cicilan_ke || null, nominal, metode, StatusPembayaran.SETTLEMENT]
      );

      await checkTagihanLunas(schema, tagihan_id);

      sendSuccess(res, rows[0], 'Pembayaran manual dicatat', 201);
    } catch (err) {
      next(err);
    }
  }
);

async function checkTagihanLunas(schema: string, tagihanId: string): Promise<void> {
  const { rows } = await query(
    `SELECT t.nominal, COALESCE(SUM(p.nominal), 0) as total_bayar
     FROM ${schema}.ukt_tagihan t
     LEFT JOIN ${schema}.ukt_pembayaran p ON p.tagihan_id = t.id AND p.status = 'settlement'
     WHERE t.id = $1
     GROUP BY t.id, t.nominal`,
    [tagihanId]
  );

  if (rows.length > 0 && parseFloat(rows[0].total_bayar) >= parseFloat(rows[0].nominal)) {
    await query(
      `UPDATE ${schema}.ukt_tagihan SET status = 'lunas', updated_at = NOW() WHERE id = $1`,
      [tagihanId]
    );
  }
}

export { checkTagihanLunas };
export default router;
