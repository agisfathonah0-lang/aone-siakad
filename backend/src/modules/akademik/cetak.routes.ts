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
      await createDocumentVerification(req.tenant!.schemaName, refId, 'khs', content).catch(() => {});
      const pdf = await generateKHS(req.tenant!.schemaName, mhsId, semester, tahunAkademik);
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
      const refId = `krs_${mhsId}_${semester}_${tahunAkademik}`;
      const content = `krs:${mhsId}:${semester}:${tahunAkademik}`;
      await createDocumentVerification(req.tenant!.schemaName, refId, 'krs', content).catch(() => {});
      const pdf = await generateKRS(req.tenant!.schemaName, mhsId, semester, tahunAkademik);
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
      const refId = `transkrip_${mhsId}`;
      const content = `transkrip:${mhsId}`;
      await createDocumentVerification(req.tenant!.schemaName, refId, 'transkrip', content).catch(() => {});
      const pdf = await generateTranskrip(req.tenant!.schemaName, mhsId);
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
      const pdf = await generateSuratKeluar(req.tenant!.schemaName, req.params.surat_id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Surat_${req.params.surat_id.slice(0, 8)}.pdf"`);
      res.end(pdf);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
