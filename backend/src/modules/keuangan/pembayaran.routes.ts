import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { v4 as uuid } from 'uuid';
import { query } from '../../config/database.js';
import { validate } from '../../middleware/validator.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess, sendPaginated } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role, StatusPembayaran } from '../../types/enums.js';
import { getSnap } from '../../services/midtrans.js';
import { sendEmail, paymentReceiptHtml } from '../../services/email.js';
import { createNotification } from '../../services/notifikasi.js';

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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const tagihanId = req.query.tagihan_id as string;
      const mahasiswaId = req.query.mahasiswa_id as string;

      const baseFrom = `FROM ${schema}.ukt_pembayaran p
                        JOIN ${schema}.ukt_tagihan t ON t.id = p.tagihan_id
                        JOIN ${schema}.mahasiswa m ON m.id = p.mahasiswa_id`;

      const params: unknown[] = [];
      const conditions: string[] = [];

      if (tagihanId) { conditions.push(`p.tagihan_id = $${params.length + 1}`); params.push(tagihanId); }
      if (mahasiswaId) { conditions.push(`p.mahasiswa_id = $${params.length + 1}`); params.push(mahasiswaId); }

      const where = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

      const { rows: totalRows } = await query(`SELECT COUNT(*) as count ${baseFrom}${where}`, params);
      const total = parseInt(totalRows[0].count, 10);

      const { rows } = await query(
        `SELECT p.*, t.tahun_akademik, t.semester, t.nominal as tagihan_nominal, t.jenis,
                m.nim, m.nama as mahasiswa_nama
         ${baseFrom}${where}
         ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
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
  requireRole(Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const userId = req.user!.id;
      const { rows: mhs } = await query(
        `SELECT id FROM ${schema}.mahasiswa WHERE user_id = $1`, [userId]
      );
      if (mhs.length === 0) throw new AppError(404, 'Mahasiswa tidak ditemukan');

      const { rows: totalRows } = await query(
        `SELECT COUNT(*) as count FROM ${schema}.ukt_pembayaran WHERE mahasiswa_id = $1`,
        [mhs[0].id]
      );
      const total = parseInt(totalRows[0].count, 10);

      const { rows } = await query(
        `SELECT p.*, t.tahun_akademik, t.semester, t.nominal as tagihan_nominal, t.jenis,
                m.nim, m.nama as mahasiswa_nama
         FROM ${schema}.ukt_pembayaran p
         JOIN ${schema}.ukt_tagihan t ON t.id = p.tagihan_id
         JOIN ${schema}.mahasiswa m ON m.id = p.mahasiswa_id
         WHERE p.mahasiswa_id = $1
         ORDER BY p.created_at DESC
         LIMIT $2 OFFSET $3`,
        [mhs[0].id, limit, offset]
      );

      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:id/struk',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { id } = req.params;

      const { rows } = await query(
        `SELECT p.*, t.tahun_akademik, t.semester, t.nominal as tagihan_nominal, t.jenis, t.status as tagihan_status,
                m.nim, m.nama as mahasiswa_nama, m.angkatan,
                COALESCE(p2.nama, '-') as prodi_nama, COALESCE(p2.jenjang, '-') as prodi_jenjang
         FROM ${schema}.ukt_pembayaran p
         JOIN ${schema}.ukt_tagihan t ON t.id = p.tagihan_id
         JOIN ${schema}.mahasiswa m ON m.id = p.mahasiswa_id
         LEFT JOIN ${schema}.program_studi p2 ON p2.id = m.program_studi_id
         WHERE p.id = $1`,
        [id]
      );

      if (rows.length === 0) throw new AppError(404, 'Pembayaran tidak ditemukan');

      const { rows: tenant } = await query(
        'SELECT nama_pt, name, logo_url FROM public.tenants WHERE id = $1',
        [req.tenant?.id]
      );
      const tenantName = tenant.length > 0 ? (tenant[0].nama_pt || tenant[0].name) : 'AONE SIAKAD';
      const logoUrl = tenant.length > 0 ? tenant[0].logo_url : null;

      const r = rows[0];
      const created = r.created_at || r.paid_at || new Date();
      const d = new Date(created);
      const receiptNumber = `STR-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${r.id.substring(0, 8).toUpperCase()}`;

      sendSuccess(res, {
        receipt_number: receiptNumber,
        pembayaran_id: r.id,
        tagihan_id: r.tagihan_id,
        nim: r.nim,
        mahasiswa_nama: r.mahasiswa_nama,
        prodi: `${r.prodi_jenjang} ${r.prodi_nama}`,
        angkatan: r.angkatan,
        tahun_akademik: r.tahun_akademik,
        semester: r.semester,
        jenis_tagihan: r.jenis,
        nominal_tagihan: parseFloat(r.tagihan_nominal),
        nominal_dibayar: parseFloat(r.nominal),
        cicilan_ke: r.cicilan_ke,
        metode: r.metode,
        status: r.status,
        paid_at: r.paid_at,
        created_at: r.created_at,
        midtrans_order_id: r.midtrans_order_id,
        midtrans_transaction_id: r.midtrans_transaction_id,
        tagihan_status: r.tagihan_status,
        tenant_name: tenantName,
        logo_url: logoUrl,
      });
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
        snap_token: transaction.token,
        redirect_url: transaction.redirect_url,
      }, 'Transaksi Midtrans berhasil dibuat');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/midtrans-snap-callback',
  authenticate,
  requireRole(Role.MAHASISWA, Role.ADMIN, Role.KEUANGAN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { pembayaran_id, transaction_id, transaction_status, order_id } = req.body;

      const { rows } = await query(
        `SELECT id, tagihan_id FROM ${schema}.ukt_pembayaran WHERE id = $1 AND midtrans_order_id = $2`,
        [pembayaran_id, order_id]
      );
      if (rows.length === 0) throw new AppError(404, 'Pembayaran tidak ditemukan');

      await query(
        `UPDATE ${schema}.ukt_pembayaran
         SET midtrans_transaction_id = $1, midtrans_status = $2, status = 'settlement', paid_at = NOW()
         WHERE id = $3`,
        [transaction_id || null, transaction_status || 'settlement', pembayaran_id]
      );

      await checkTagihanLunas(schema, rows[0].tagihan_id);

      const { rows: detail } = await query(
        `SELECT p.*, t.tahun_akademik, t.semester, t.nominal as tagihan_nominal, t.jenis,
                m.nim, m.nama as mahasiswa_nama, m.angkatan,
                COALESCE(p2.nama, '-') as prodi_nama, COALESCE(p2.jenjang, '-') as prodi_jenjang,
                u.email, u.id as user_id
         FROM ${schema}.ukt_pembayaran p
         JOIN ${schema}.ukt_tagihan t ON t.id = p.tagihan_id
         JOIN ${schema}.mahasiswa m ON m.id = p.mahasiswa_id
         LEFT JOIN ${schema}.program_studi p2 ON p2.id = m.program_studi_id
         JOIN ${schema}.users u ON u.id = m.user_id
         WHERE p.id = $1`,
        [pembayaran_id]
      );

      if (detail.length > 0) {
        const d = detail[0];
        const created = d.paid_at || d.created_at || new Date();
        const dt = new Date(created);
        const receiptNumber = `STR-${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}-${d.id.substring(0, 8).toUpperCase()}`;

        const { rows: tenant } = await query(
          'SELECT nama_pt, name, logo_url FROM public.tenants WHERE id = $1',
          [req.tenant?.id]
        );
        const tenantName = tenant.length > 0 ? (tenant[0].nama_pt || tenant[0].name) : 'AONE SIAKAD';
        const logoUrl = tenant.length > 0 ? tenant[0].logo_url : null;

        const emailHtml = paymentReceiptHtml({
          receipt_number: receiptNumber,
          mahasiswa_nama: d.mahasiswa_nama,
          nim: d.nim,
          prodi: `${d.prodi_jenjang} ${d.prodi_nama}`,
          tahun_akademik: d.tahun_akademik,
          semester: d.semester,
          jenis_tagihan: d.jenis,
          nominal_tagihan: parseFloat(d.tagihan_nominal),
          nominal_dibayar: parseFloat(d.nominal),
          metode: d.metode,
          paid_at: d.paid_at,
          midtrans_order_id: d.midtrans_order_id,
          status: d.status,
          tenant_name: tenantName,
          logo_url: logoUrl,
        });

        Promise.all([
          sendEmail({
            to: { email: d.email, name: d.mahasiswa_nama },
            subject: `Struk Pembayaran - ${d.jenis.replace('_', ' ')} - ${receiptNumber}`,
            htmlContent: emailHtml,
          }),
          createNotification(
            schema.replace(/"/g, ''),
            d.user_id,
            'Pembayaran Diterima',
            `Pembayaran ${d.jenis.replace('_', ' ')} sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(d.nominal))} telah diterima.`,
            'success',
            `/kampus/${req.tenant?.slug || ''}/tagihan`
          ),
        ]).catch(() => {});
      }

      sendSuccess(res, null, 'Pembayaran berhasil dikonfirmasi');
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

  if (rows.length > 0) {
    const totalBayar = parseFloat(rows[0].total_bayar);
    const nominal = parseFloat(rows[0].nominal);
    if (totalBayar >= nominal) {
      await query(
        `UPDATE ${schema}.ukt_tagihan SET status = 'lunas', updated_at = NOW() WHERE id = $1`,
        [tagihanId]
      );
    } else if (totalBayar > 0) {
      await query(
        `UPDATE ${schema}.ukt_tagihan SET status = 'sebagian', updated_at = NOW() WHERE id = $1`,
        [tagihanId]
      );
    }
  }
}

export { checkTagihanLunas };
export default router;
