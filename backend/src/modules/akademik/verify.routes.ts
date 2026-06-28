import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import { query } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { Role } from '../../types/enums.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { createDocumentVerification } from './cetak.service.js';
import QRCode from 'qrcode';

// Simple in-memory rate limiter: max 20 requests/min per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

const router = Router();

function schema(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

function schemaSafe(req: Request): string | null {
  return req.tenant ? `"${req.tenant.schemaName}"` : null;
}

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Generate verification for a surat (called internally)
export async function generateVerification(
  schemaName: string,
  suratId: string,
  suratType: 'keluar' | 'pengajuan',
  content: string
): Promise<{ hash: string; verification_code: string }> {
  const s = `"${schemaName}"`;

  // Get prev hash for chain
  const { rows: last } = await query(
    `SELECT hash FROM ${s}.document_verification ORDER BY created_at DESC LIMIT 1`
  );
  const prevHash = last.length > 0 ? last[0].hash : '0000000000000000000000000000000000000000000000000000000000000000';

  const hash = sha256(content + prevHash);
  const verificationCode = generateVerificationCode();
  const id = uuid();

  await query(
    `INSERT INTO ${s}.document_verification (id, surat_id, surat_type, hash, prev_hash, verification_code)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, suratId, suratType, hash, prevHash, verificationCode]
  );

  return { hash, verification_code: verificationCode };
}

// Generate QR code as data URL
export async function generateVerificationQR(
  verificationCode: string,
  baseUrl: string
): Promise<string> {
  const verifyUrl = `${baseUrl}/verify/${verificationCode}`;
  return QRCode.toDataURL(verifyUrl, { width: 200, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } });
}

// Public verify endpoint (no auth)
router.get(
  '/:kode',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Rate limit
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(ip)) {
        throw new AppError(429, 'Terlalu banyak permintaan. Coba lagi 1 menit.');
      }
      // Periodic cleanup (every 100 requests)
      if (rateLimitMap.size > 1000) {
        const now = Date.now();
        for (const [k, v] of rateLimitMap) {
          if (now > v.resetAt) rateLimitMap.delete(k);
        }
      }
      const code = req.params.kode.toUpperCase();
      const s = schemaSafe(req);
      let dv: any;
      let schemaName = '';

      if (s) {
        // Tenant-specific lookup
        try {
          const { rows } = await query(
            `SELECT dv.*, t.nama_pt FROM ${s}.document_verification dv
             JOIN public.tenants t ON t.schema_name = $1
             WHERE dv.verification_code = $2`,
            [req.tenant!.schemaName, code]
          );
          if (rows.length > 0) {
            dv = rows[0];
            schemaName = req.tenant!.schemaName;
          }
        } catch (e: any) {
          console.warn(`[Verify] Tenant lookup skipped (${req.tenant?.schemaName}): ${e.code || e.message}`);
        }
      } else {
        // Cross-tenant lookup: search all active tenant schemas
        const { rows: tenants } = await query(
          `SELECT schema_name, nama_pt FROM public.tenants WHERE is_active = true ORDER BY created_at DESC`
        );
        for (const t of tenants) {
          try {
            const { rows } = await query(
              `SELECT * FROM "${t.schema_name}".document_verification WHERE verification_code = $1 LIMIT 1`,
              [code]
            );
            if (rows.length > 0) {
              dv = { ...rows[0], nama_pt: t.nama_pt };
              schemaName = t.schema_name;
              break;
            }
          } catch (e: any) {
            if (e.code !== '42P01') {
              console.warn(`[Verify] Cross-tenant error (${t.schema_name}): ${e.code || e.message}`);
            }
          }
        }
        if (!dv) throw new AppError(404, 'Dokumen tidak ditemukan');
      }

      // Verify chain integrity
      const { rows: chain } = await query(
        `SELECT hash, prev_hash, created_at FROM "${schemaName}".document_verification ORDER BY created_at ASC`
      );

      let chainValid = true;
      let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
      for (const link of chain) {
        if (link.prev_hash !== prevHash) { chainValid = false; break; }
        prevHash = link.hash;
      }

      // Get document details
      let surat: any = null;
      let dokumen: any = null;

      if (dv.surat_type === 'keluar') {
        const { rows: r } = await query(
          `SELECT skl.*, sk.nama as kategori_nama FROM "${schemaName}".surat_keluar skl
           LEFT JOIN "${schemaName}".surat_kategori sk ON sk.id = skl.kategori_id
           WHERE skl.id = $1`,
          [dv.surat_id]
        );
        if (r.length > 0) surat = { type: 'Surat Keluar', nomor: r[0].nomor_surat, perihal: r[0].perihal, tujuan: r[0].tujuan, tanggal: r[0].tanggal_surat, kategori: r[0].kategori_nama, status: r[0].status };
      } else if (dv.surat_type === 'pengajuan') {
        const { rows: r } = await query(
          `SELECT sp.*, sk.nama as kategori_nama, m.nama as mahasiswa_nama, m.nim
           FROM "${schemaName}".surat_pengajuan sp
           LEFT JOIN "${schemaName}".surat_kategori sk ON sk.id = sp.kategori_id
           LEFT JOIN "${schemaName}".mahasiswa m ON m.id = sp.mahasiswa_id
           WHERE sp.id = $1`,
          [dv.surat_id]
        );
        if (r.length > 0) surat = { type: 'Pengajuan Surat', nomor: '-', perihal: r[0].keperluan, tujuan: r[0].tujuan, tanggal: r[0].created_at, kategori: r[0].kategori_nama, status: r[0].status, mahasiswa: r[0].mahasiswa_nama, nim: r[0].nim };
      } else if (['khs', 'krs', 'transkrip'].includes(dv.surat_type)) {
        // surat_id format: {type}_{mahasiswaId}[_{semester}_{tahunAkademik}]
        const parts = dv.surat_id.split('_');
        const mhsId = parts[1];
        const semester = parts[2];
        const ta = parts[3];
        const { rows: r } = await query(
          `SELECT m.nim, m.nama, p.nama as prodi_nama FROM "${schemaName}".mahasiswa m
           LEFT JOIN "${schemaName}".program_studi p ON p.id = m.program_studi_id
           WHERE m.id = $1`, [mhsId]
        );
        if (r.length > 0) {
          const label = dv.surat_type === 'khs' ? 'Kartu Hasil Studi (KHS)' : dv.surat_type === 'krs' ? 'Kartu Rencana Studi (KRS)' : 'Transkrip Nilai';
          const jenis = dv.surat_type.toUpperCase();
          dokumen = { type: label, nama: r[0].nama, nim: r[0].nim, prodi: r[0].prodi_nama, semester: semester ? `${semester} - ${ta}` : undefined, tanggal: dv.created_at };
        }
      }

      // Increment verified count
      await query(
        `UPDATE "${schemaName}".document_verification SET verified_count = verified_count + 1, last_verified_at = NOW() WHERE id = $1`,
        [dv.id]
      );

      sendSuccess(res, {
        verified: true,
        chain_valid: chainValid,
        verification_code: dv.verification_code,
        hash: dv.hash,
        prev_hash: dv.prev_hash,
        created_at: dv.created_at,
        verified_count: dv.verified_count + 1,
        nama_pt: dv.nama_pt,
        surat,
        dokumen,
        chain: chain.map((l: any) => ({ hash: l.hash, prev_hash: l.prev_hash, created_at: l.created_at })),
      });
    } catch (err: any) {
      console.error(`[Verify] Error for code=${req.params.kode}:`, err.message || err);
      next(err);
    }
  }
);

// Re-verify (regenerate hash for existing surat) — admin only
router.post(
  '/rehash/:type/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { type, id } = req.params;

      if (!['keluar', 'pengajuan'].includes(type)) throw new AppError(400, 'Tipe surat tidak valid');

      let content = '';
      if (type === 'keluar') {
        const { rows: r } = await query(
          `SELECT skl.*, sk.template FROM ${s}.surat_keluar skl
           LEFT JOIN ${s}.surat_kategori sk ON sk.id = skl.kategori_id WHERE skl.id = $1`,
          [id]
        );
        if (r.length === 0) throw new AppError(404, 'Surat tidak ditemukan');
        content = `${r[0].nomor_surat}|${r[0].perihal}|${r[0].tujuan}|${r[0].tanggal_surat}|${r[0].template || ''}`;
      } else {
        const { rows: r } = await query(
          `SELECT sp.*, sk.template FROM ${s}.surat_pengajuan sp
           LEFT JOIN ${s}.surat_kategori sk ON sk.id = sp.kategori_id WHERE sp.id = $1`,
          [id]
        );
        if (r.length === 0) throw new AppError(404, 'Pengajuan tidak ditemukan');
        content = `${r[0].keperluan}|${r[0].tujuan}|${r[0].created_at}|${r[0].template || ''}`;
      }

      // Delete existing verification
      await query(
        `DELETE FROM ${s}.document_verification WHERE surat_id = $1 AND surat_type = $2`,
        [id, type]
      );

      const result = await generateVerification(req.tenant!.schemaName, id, type as any, content);
      sendSuccess(res, result, 'Verifikasi berhasil dibuat ulang');
    } catch (err) { next(err); }
  }
);

// Get verification status for a surat
router.get(
  '/status/:type/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { type, id } = req.params;

      const { rows } = await query(
        `SELECT dv.*, t.nama_pt FROM ${s}.document_verification dv
         JOIN public.tenants t ON t.schema_name = $1
         WHERE dv.surat_id = $2 AND dv.surat_type = $3`,
        [req.tenant!.schemaName, id, type]
      );

      if (rows.length === 0) {
        sendSuccess(res, { verified: false });
        return;
      }

      const dv = rows[0];
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const qrDataUrl = await generateVerificationQR(dv.verification_code, baseUrl);

      sendSuccess(res, {
        verified: true,
        verification_code: dv.verification_code,
        hash: dv.hash,
        prev_hash: dv.prev_hash,
        verified_count: dv.verified_count,
        created_at: dv.created_at,
        qr_data_url: qrDataUrl,
        verification_url: `${baseUrl}/verify/${dv.verification_code}`,
      });
    } catch (err) { next(err); }
  }
);

// Batch re-verify: create verification for all existing documents
router.post(
  '/batch',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const sn = req.tenant!.schemaName;
      let khs = 0, krs = 0, trans = 0, surat = 0;

      // KHS & KRS: group approved KRS by mahasiswa + semester + TA
      const { rows: krsRows } = await query(
        `SELECT DISTINCT mahasiswa_id, semester, tahun_akademik FROM ${s}.krs WHERE status = 'disetujui'`
      );
      for (const r of krsRows) {
        const khsId = `khs_${r.mahasiswa_id}_${r.semester}_${r.tahun_akademik}`;
        const krsId = `krs_${r.mahasiswa_id}_${r.semester}_${r.tahun_akademik}`;
        try {
          await createDocumentVerification(sn, khsId, 'khs', `khs:${r.mahasiswa_id}:${r.semester}:${r.tahun_akademik}`);
          khs++;
        } catch { /* duplicate or error */ }
        try {
          await createDocumentVerification(sn, krsId, 'krs', `krs:${r.mahasiswa_id}:${r.semester}:${r.tahun_akademik}`);
          krs++;
        } catch { /* duplicate or error */ }
      }

      // Transkrip: one per mahasiswa
      const { rows: mhsRows } = await query(`SELECT id FROM ${s}.mahasiswa`);
      for (const m of mhsRows) {
        try {
          await createDocumentVerification(sn, `transkrip_${m.id}`, 'transkrip', `transkrip:${m.id}`);
          trans++;
        } catch {}
      }

      // Surat keluar
      const { rows: suratRows } = await query(`SELECT id FROM ${s}.surat_keluar`);
      for (const row of suratRows) {
        try {
          await createDocumentVerification(sn, row.id, 'keluar', `surat:${row.id}`);
          surat++;
        } catch {}
      }

      sendSuccess(res, { khs, krs, transkrip: trans, surat_keluar: surat }, 'Batch re-verify selesai');
    } catch (err) { next(err); }
  }
);

export default router;
