import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../../config/database.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { checkTagihanLunas } from './pembayaran.routes.js';

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

    const { rows: tenants } = await query('SELECT schema_name FROM public.tenants WHERE is_active = true');
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
            `SELECT tagihan_id FROM ${schema}.ukt_pembayaran WHERE midtrans_order_id = $1`,
            [order_id]
          );
          if (p.length > 0) {
            await checkTagihanLunas(tenant.schema_name, p[0].tagihan_id);
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
