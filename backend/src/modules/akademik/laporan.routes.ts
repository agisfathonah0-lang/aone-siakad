import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';

const router = Router();

function schema(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

router.get('/mahasiswa', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { rows } = await query(
      `SELECT p.nama as prodi, p.jenjang, COUNT(m.id) as total,
              COUNT(CASE WHEN m.status = 'aktif' THEN 1 END) as aktif,
              COUNT(CASE WHEN m.status = 'cuti' THEN 1 END) as cuti,
              COUNT(CASE WHEN m.status = 'lulus' THEN 1 END) as lulus,
              COUNT(CASE WHEN m.status = 'keluar' THEN 1 END) as keluar
       FROM ${s}.mahasiswa m
       JOIN ${s}.program_studi p ON p.id = m.program_studi_id
       GROUP BY p.nama, p.jenjang
       ORDER BY p.nama`
    );
    sendSuccess(res, rows);
  } catch (err) { next(err); }
});

router.get('/keuangan', authenticate, requireRole(Role.ADMIN, Role.KEUANGAN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { rows } = await query(
      `SELECT t.jenis, t.tahun_akademik, t.semester,
              COUNT(t.id) as total_tagihan,
              SUM(t.nominal) as total_nominal,
              COUNT(CASE WHEN t.status = 'lunas' THEN 1 END) as lunas,
              COUNT(CASE WHEN t.status = 'belum_bayar' THEN 1 END) as belum_bayar,
              COUNT(CASE WHEN t.status = 'sebagian' THEN 1 END) as sebagian
       FROM ${s}.ukt_tagihan t
       GROUP BY t.jenis, t.tahun_akademik, t.semester
       ORDER BY t.tahun_akademik, t.semester`
    );
    sendSuccess(res, rows);
  } catch (err) { next(err); }
});

router.get('/nilai', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const tahun = req.query.tahun_akademik as string;
    const semester = req.query.semester as string;

    let where = '';
    const params: any[] = [];
    if (tahun) { params.push(tahun); where += ` AND j.tahun_akademik = $${params.length}`; }
    if (semester) { params.push(semester); where += ` AND j.semester = $${params.length}`; }

    const { rows } = await query(
      `SELECT mk.kode, mk.nama as mk_nama, mk.sks, p.nama as prodi,
              COUNT(n.id) as total_nilai,
              ROUND(AVG(n.nilai_akhir), 2) as rata_rata,
              COUNT(CASE WHEN n.nilai_huruf IN ('A','A-','B+','B') THEN 1 END) as diatas_b,
              COUNT(CASE WHEN n.nilai_huruf IN ('C+','C','D','E') THEN 1 END) as dibawah_c
       FROM ${s}.nilai n
       JOIN ${s}.krs k ON k.id = n.krs_id
       JOIN ${s}.jadwal_kuliah j ON j.id = k.jadwal_id
       JOIN ${s}.mata_kuliah mk ON mk.id = j.mata_kuliah_id
       JOIN ${s}.mahasiswa m ON m.id = k.mahasiswa_id
       JOIN ${s}.program_studi p ON p.id = m.program_studi_id
       WHERE 1=1 ${where}
       GROUP BY mk.kode, mk.nama, mk.sks, p.nama
       ORDER BY rata_rata DESC`,
      params
    );
    sendSuccess(res, rows);
  } catch (err) { next(err); }
});

router.get('/alumni', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { rows } = await query(
      `SELECT EXTRACT(YEAR FROM a.tahun_lulus) as tahun, p.nama as prodi,
              COUNT(a.id) as total,
              ROUND(AVG(a.masa_tunggu)) as rata_masa_tunggu,
              ROUND(AVG(a.gaji)) as rata_gaji
       FROM ${s}.alumni_tracer a
       JOIN ${s}.program_studi p ON p.id = a.program_studi_id
       GROUP BY tahun, p.nama
       ORDER BY tahun DESC`
    );
    sendSuccess(res, rows);
  } catch (err) { next(err); }
});

router.get('/absensi', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { rows } = await query(
      `SELECT mk.kode, mk.nama as mk_nama, COUNT(a.id) as total_pertemuan,
              SUM(CASE WHEN a.status = 'hadir' THEN 1 ELSE 0 END) as hadir,
              SUM(CASE WHEN a.status = 'izin' THEN 1 ELSE 0 END) as izin,
              SUM(CASE WHEN a.status = 'sakit' THEN 1 ELSE 0 END) as sakit,
              SUM(CASE WHEN a.status = 'alpha' THEN 1 ELSE 0 END) as alpha
       FROM ${s}.absensi a
       JOIN ${s}.jadwal_kuliah j ON j.id = a.jadwal_id
       JOIN ${s}.mata_kuliah mk ON mk.id = j.mata_kuliah_id
       GROUP BY mk.kode, mk.nama
       ORDER BY mk.nama`
    );
    sendSuccess(res, rows);
  } catch (err) { next(err); }
});

export default router;
