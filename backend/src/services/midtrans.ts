import Midtrans from 'midtrans-client';
import { query } from '../config/database.js';

export async function getSnap(tenantId: string) {
  const { rows } = await query(
    `SELECT key, value FROM public.tenant_settings
     WHERE tenant_id = $1 AND key IN ('midtrans_server_key', 'midtrans_client_key', 'midtrans_is_production')`,
    [tenantId]
  );
  const cfg: Record<string, string> = {};
  rows.forEach((r: any) => { cfg[r.key] = r.value; });

  const serverKey = cfg['midtrans_server_key'] || process.env.MIDTRANS_SERVER_KEY || '';
  const clientKey = cfg['midtrans_client_key'] || process.env.MIDTRANS_CLIENT_KEY || '';

  if (!serverKey || !clientKey) {
    throw new Error('Midtrans belum dikonfigurasi. Atur Server Key & Client Key di Pengaturan Kampus.');
  }

  return new Midtrans.Snap({
    isProduction: cfg['midtrans_is_production'] === 'true' || process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey,
    clientKey,
  });
}
