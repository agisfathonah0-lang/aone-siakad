import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../../config/database.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { checkTagihanLunas } from './pembayaran.routes.js';
import { sendEmail, paymentReceiptHtml } from '../../services/email.js';
import { createNotification } from '../../services/notifikasi.js';

const router = Router();

router.get('/config', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
    const { rows } = await query(
      `SELECT key, value FROM public.tenant_settings WHERE tenant_id = $1 AND key IN ('midtrans_client_key', 'midtrans_is_production')`,
      [req.tenant.id]
    );
    const config: Record<string, any> = { clientKey: '', isProduction: false };
    for (const r of rows) {
      if (r.key === 'midtrans_client_key') config.clientKey = r.value;
      if (r.key === 'midtrans_is_production') config.isProduction = r.value === 'true';
    }
    sendSuccess(res, config);
  } catch (err) { next(err); }
});

export async function midtransNotificationHandler(req: Request, res: Response): Promise<void> {
  try {
    const notificationJson = JSON.stringify(req.body);
    console.log('[Midtrans] Notification received:', notificationJson.substring(0, 200));

    const { order_id, transaction_status, transaction_id, status_code } = req.body;

    if (!order_id) {
      sendSuccess(res, null, 'No order_id');
      return;
    }

    if (status_code === '407') {
      sendSuccess(res, null, 'Fraud status ignored');
      return;
    }

    const { rows: tenants } = await query('SELECT schema_name, slug FROM public.tenants WHERE is_active = true');
    let found = false;

    for (const tenant of tenants) {
      const schema = `"${tenant.schema_name}"`;
      const { rows } = await query(
        `SELECT id FROM ${schema}.ukt_pembayaran WHERE midtrans_order_id = $1`,
        [order_id]
      );
      if (rows.length > 0) {
        found = true;

        let mappedStatus = 'pending';
        if (['settlement', 'capture'].includes(transaction_status) && status_code === '200') {
          mappedStatus = 'settlement';
        } else if (['expire', 'deny', 'cancel'].includes(transaction_status)) {
          mappedStatus = transaction_status;
        }

        await query(
          `UPDATE ${schema}.ukt_pembayaran
           SET midtrans_transaction_id = $1, midtrans_status = $2, status = $3,
               paid_at = CASE WHEN $3 = 'settlement' THEN NOW() ELSE paid_at END
           WHERE midtrans_order_id = $4`,
          [transaction_id || null, transaction_status, mappedStatus, order_id]
        );

        if (mappedStatus === 'settlement') {
          const { rows: p } = await query(
            `SELECT id as pembayaran_id, tagihan_id FROM ${schema}.ukt_pembayaran WHERE midtrans_order_id = $1`,
            [order_id]
          );
          if (p.length > 0) {
            await checkTagihanLunas(tenant.schema_name, p[0].tagihan_id);

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
              [p[0].pembayaran_id]
            );

            if (detail.length > 0) {
              const d = detail[0];
              const created = d.paid_at || d.created_at || new Date();
              const dt = new Date(created);
              const receiptNumber = `STR-${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}-${d.id.substring(0, 8).toUpperCase()}`;

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
              });

              await Promise.all([
                sendEmail({
                  to: { email: d.email, name: d.mahasiswa_nama },
                  subject: `Struk Pembayaran - ${d.jenis.replace('_', ' ')} - ${receiptNumber}`,
                  htmlContent: emailHtml,
                }),
                createNotification(
                  tenant.schema_name,
                  d.user_id,
                  'Pembayaran Diterima',
                  `Pembayaran ${d.jenis.replace('_', ' ')} sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(d.nominal))} telah diterima.`,
                  'success',
                  `/kampus/${tenant.slug}/tagihan`
                ),
              ]);
            }
          }
        }

        break;
      }
    }

    if (!found) {
      console.warn('[Midtrans] Order not found in any tenant:', order_id);
    }

    sendSuccess(res, null, 'OK');
  } catch (err) {
    console.error('[Midtrans] Webhook error:', err);
    sendSuccess(res, null, 'OK');
  }
}

router.post('/notification', midtransNotificationHandler);

router.get('/status/:order_id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order_id } = req.params;

    const { rows: tenants } = await query('SELECT schema_name FROM public.tenants WHERE is_active = true');
    for (const tenant of tenants) {
      const schema = `"${tenant.schema_name}"`;
      const { rows } = await query(
        `SELECT * FROM ${schema}.ukt_pembayaran WHERE midtrans_order_id = $1`,
        [order_id]
      );
      if (rows.length > 0) {
        return sendSuccess(res, rows[0]);
      }
    }

    sendSuccess(res, null, 'Pembayaran tidak ditemukan');
  } catch (err) {
    next(err);
  }
});

export default router;
