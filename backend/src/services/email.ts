import { config } from '../config/index.js';

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

interface SendEmailParams {
  to: { email: string; name: string };
  subject: string;
  htmlContent: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const apiKey = config.brevo.apiKey;
  if (!apiKey) {
    console.warn('[Email] BREVO_API_KEY not configured, skipping email');
    return;
  }

  try {
    const res = await fetch(BREVO_API, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: config.brevo.fromName, email: config.brevo.fromEmail },
        to: [params.to],
        subject: params.subject,
        htmlContent: params.htmlContent,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[Email] Brevo error ${res.status}:`, body);
    } else {
      console.log(`[Email] Sent to ${params.to.email}: ${params.subject}`);
    }
  } catch (err) {
    console.error('[Email] Failed to send:', err);
  }
}

export function paymentReceiptHtml(data: {
  receipt_number: string;
  mahasiswa_nama: string;
  nim: string;
  prodi: string;
  tahun_akademik: string;
  semester: string;
  jenis_tagihan: string;
  nominal_tagihan: number;
  nominal_dibayar: number;
  metode: string;
  paid_at: string;
  midtrans_order_id?: string;
  status: string;
}): string {
  const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const tgl = data.paid_at
    ? new Date(data.paid_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 24px;">
  <table align="center" width="100%" style="max-width: 520px; background: white; border-radius: 12px; overflow: hidden;">
    <tr>
      <td style="padding: 32px 24px 16px; text-align: center; background: #22c55e;">
        <h1 style="color: white; margin: 0; font-size: 20px;">STRUK PEMBAYARAN</h1>
        <p style="color: rgba(255,255,255,0.85); font-size: 12px; margin: 4px 0 0;">${data.receipt_number}</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px;">
        <p style="font-size: 14px; font-weight: bold; color: #16a34a; text-align: center; margin: 0 0 20px;">Pembayaran ${data.status === 'settlement' ? 'Berhasil' : data.status}</p>
        <table width="100%" style="font-size: 13px; color: #334155;">
          <tr><td style="padding: 4px 0; color: #64748b;">NIM</td><td style="padding: 4px 0; font-weight: 600; text-align: right;">${data.nim}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Mahasiswa</td><td style="padding: 4px 0; font-weight: 600; text-align: right;">${data.mahasiswa_nama}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Program Studi</td><td style="padding: 4px 0; font-weight: 600; text-align: right;">${data.prodi}</td></tr>
          <tr><td colspan="2" style="border-bottom: 1px dashed #e2e8f0; padding: 0;"></td></tr>
          <tr><td style="padding: 8px 0 4px; color: #64748b;">Tahun Akademik</td><td style="padding: 8px 0 4px; font-weight: 600; text-align: right;">${data.tahun_akademik}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Semester</td><td style="padding: 4px 0; font-weight: 600; text-align: right;">${data.semester}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Jenis Tagihan</td><td style="padding: 4px 0; font-weight: 600; text-align: right;">${data.jenis_tagihan.replace('_', ' ')}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Nominal Tagihan</td><td style="padding: 4px 0; font-weight: 600; text-align: right;">${rupiah(data.nominal_tagihan)}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Nominal Dibayar</td><td style="padding: 4px 0; font-weight: 700; text-align: right; color: #16a34a; font-size: 15px;">${rupiah(data.nominal_dibayar)}</td></tr>
          <tr><td colspan="2" style="border-bottom: 1px dashed #e2e8f0; padding: 0;"></td></tr>
          <tr><td style="padding: 8px 0 4px; color: #64748b;">Metode</td><td style="padding: 8px 0 4px; font-weight: 600; text-align: right;">${data.metode === 'midtrans_snap' ? 'Midtrans' : data.metode}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Tanggal Bayar</td><td style="padding: 4px 0; font-weight: 600; text-align: right;">${tgl}</td></tr>
          ${data.midtrans_order_id ? `<tr><td style="padding: 4px 0; color: #64748b;">Midtrans Order</td><td style="padding: 4px 0; font-weight: 600; text-align: right; font-size: 11px;">${data.midtrans_order_id}</td></tr>` : ''}
          <tr><td style="padding: 4px 0; color: #64748b;">Status</td><td style="padding: 4px 0; font-weight: 600; text-align: right; color: #16a34a;">LUNAS</td></tr>
        </table>
        <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px dashed #e2e8f0; padding-top: 16px;">
          Terima kasih telah melakukan pembayaran tepat waktu.<br>
          <span style="font-family: monospace;">${data.receipt_number}</span>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
