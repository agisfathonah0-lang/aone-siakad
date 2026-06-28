import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';
import { generateKHS, generateKRS, generateTranskrip, generateSuratKeluar, createDocumentVerification } from './cetak.service.js';

const router = Router();

function schema(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

async function prepareVerification(
  schemaName: string,
  refId: string,
  refType: string,
  content: string
): Promise<{ code?: string; baseUrl: string }> {
  try {
    const { verification_code } = await createDocumentVerification(schemaName, refId, refType, content);
    const { rows } = await query(
      `SELECT website FROM public.tenants WHERE schema_name = $1 LIMIT 1`,
      [schemaName]
    );
    const website = rows[0]?.website || 'https://aone-siakad.my.id';
    const baseUrl = website.startsWith('http') ? website : `https://${website}`;
    return { code: verification_code, baseUrl };
  } catch (err) {
    console.error('[Cetak] Gagal buat verifikasi dokumen:', err);
    return { baseUrl: 'https://aone-siakad.my.id' };
  }
}

router.get(
  '/khs/:mahasiswa_id',
  authenticate,
  requireRole(Role.MAHASISWA, Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const mhsId = req.params.mahasiswa_id;
      const semester = req.query.semester as string;
      const tahunAkademik = req.query.tahun_akademik as string;
      const refId = semester && tahunAkademik ? `khs_${mhsId}_${semester}_${tahunAkademik}` : `khs_${mhsId}`;
      const content = `khs:${mhsId}:${semester || ''}:${tahunAkademik || ''}`;
      const { code, baseUrl } = await prepareVerification(req.tenant!.schemaName, refId, 'khs', content);
      const dicetakOleh = req.user?.email?.split('@')[0] || 'User';
      const pdf = await generateKHS(req.tenant!.schemaName, mhsId, semester, tahunAkademik, dicetakOleh, code, baseUrl);
      const { rows } = await query(`SELECT nim FROM ${s}.mahasiswa WHERE id = $1`, [mhsId]);
      const nim = rows.length > 0 ? rows[0].nim : mhsId;
      const suffix = semester && tahunAkademik ? `_${semester}_${tahunAkademik}` : '';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="KHS_${nim}${suffix}.pdf"`);
      res.end(pdf);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/krs/:mahasiswa_id',
  authenticate,
  requireRole(Role.MAHASISWA, Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const mhsId = req.params.mahasiswa_id;
      const semester = req.query.semester as string;
      const tahunAkademik = req.query.tahun_akademik as string;
      if (!semester || !tahunAkademik) {
        throw new AppError(400, 'Parameter semester dan tahun_akademik wajib diisi');
      }
      const dicetakOleh = req.user?.email?.split('@')[0] || 'User';
      const refId = `krs_${mhsId}_${semester}_${tahunAkademik}`;
      const content = `krs:${mhsId}:${semester}:${tahunAkademik}`;
      const { code: krsCode, baseUrl: krsUrl } = await prepareVerification(req.tenant!.schemaName, refId, 'krs', content);
      const pdf = await generateKRS(req.tenant!.schemaName, mhsId, semester, tahunAkademik, dicetakOleh, krsCode, krsUrl);
      const { rows } = await query(`SELECT nim FROM ${s}.mahasiswa WHERE id = $1`, [mhsId]);
      const nim = rows.length > 0 ? rows[0].nim : mhsId;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="KRS_${nim}_${semester}_${tahunAkademik}.pdf"`);
      res.end(pdf);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/transkrip/:mahasiswa_id',
  authenticate,
  requireRole(Role.MAHASISWA, Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const mhsId = req.params.mahasiswa_id;
      const dicetakOleh = req.user?.email?.split('@')[0] || 'User';
      const refId = `transkrip_${mhsId}`;
      const content = `transkrip:${mhsId}`;
      const { code: transCode, baseUrl: transUrl } = await prepareVerification(req.tenant!.schemaName, refId, 'transkrip', content);
      const pdf = await generateTranskrip(req.tenant!.schemaName, mhsId, dicetakOleh, transCode, transUrl);
      const { rows } = await query(`SELECT nim FROM ${s}.mahasiswa WHERE id = $1`, [mhsId]);
      const nim = rows.length > 0 ? rows[0].nim : mhsId;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Transkrip_${nim}.pdf"`);
      res.end(pdf);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/surat/:surat_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dicetakOleh = req.user?.email?.split('@')[0] || 'User';
      const suratId = req.params.surat_id;
      const { code: suratCode, baseUrl: suratUrl } = await prepareVerification(req.tenant!.schemaName, suratId, 'keluar', `surat:${suratId}`);
      const pdf = await generateSuratKeluar(req.tenant!.schemaName, suratId, dicetakOleh, suratCode, suratUrl);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Surat_${req.params.surat_id.slice(0, 8)}.pdf"`);
      res.end(pdf);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
