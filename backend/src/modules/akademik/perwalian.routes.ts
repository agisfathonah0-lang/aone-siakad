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

router.get('/bimbingan', authenticate, requireRole(Role.DOSEN, Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    if (!req.user) throw new AppError(401, 'Belum login');

    if (req.user.role === Role.DOSEN) {
      const { rows: dosen } = await query(
        `SELECT id FROM ${s}.dosen WHERE user_id = $1`,
        [req.user.id]
      );
      if (dosen.length === 0) throw new AppError(404, 'Data dosen tidak ditemukan');

      const { rows: mahasiswa } = await query(
        `SELECT m.id, m.nim, m.nama, m.angkatan, m.semester, m.status, p.nama as prodi_nama
         FROM ${s}.mahasiswa m
         LEFT JOIN ${s}.program_studi p ON p.id = m.program_studi_id
         WHERE m.dosen_wali_id = $1
         ORDER BY m.nama`,
        [dosen[0].id]
      );
      sendSuccess(res, mahasiswa);
    } else {
      const q = req.query.q as string || '';
      let where = '';
      const params: any[] = [];
      if (q) { where = 'WHERE (m.nama ILIKE $1 OR m.nim ILIKE $1)'; params.push(`%${q}%`); }
      const { rows } = await query(
        `SELECT m.id, m.nim, m.nama, m.angkatan, m.semester, m.status, m.dosen_wali_id,
                p.nama as prodi_nama, d.nama as dosen_wali_nama
         FROM ${s}.mahasiswa m
         LEFT JOIN ${s}.program_studi p ON p.id = m.program_studi_id
         LEFT JOIN ${s}.dosen d ON d.id = m.dosen_wali_id
         ${where}
         ORDER BY m.nama`,
        params
      );
      sendSuccess(res, rows);
    }
  } catch (err) { next(err); }
});

router.put('/:mahasiswa_id/dosen-wali', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { dosen_wali_id } = req.body;
    const { rows } = await query(
      `UPDATE ${s}.mahasiswa SET dosen_wali_id = $1 WHERE id = $2 RETURNING id, nim, nama, dosen_wali_id`,
      [dosen_wali_id || null, req.params.mahasiswa_id]
    );
    if (rows.length === 0) throw new AppError(404, 'Mahasiswa tidak ditemukan');
    sendSuccess(res, rows[0], 'Dosen wali berhasil ditetapkan');
  } catch (err) { next(err); }
});

router.post('/log', authenticate, requireRole(Role.DOSEN, Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { mahasiswa_id, catatan, tanggal } = req.body;
    if (!mahasiswa_id || !catatan) throw new AppError(400, 'mahasiswa_id dan catatan wajib diisi');
    const { rows } = await query(
      `INSERT INTO ${s}.perwalian_log (mahasiswa_id, catatan, tanggal) VALUES ($1, $2, $3) RETURNING *`,
      [mahasiswa_id, catatan, tanggal || new Date().toISOString().slice(0, 10)]
    );
    sendSuccess(res, rows[0], 'Catatan berhasil ditambahkan', 201);
  } catch (err) { next(err); }
});

router.get('/log/:mahasiswa_id', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { rows } = await query(
      `SELECT l.*, d.nama as dosen_nama FROM ${s}.perwalian_log l
       LEFT JOIN ${s}.dosen d ON d.id = l.dosen_id
       WHERE l.mahasiswa_id = $1 ORDER BY l.tanggal DESC`,
      [req.params.mahasiswa_id]
    );
    sendSuccess(res, rows);
  } catch (err) { next(err); }
});

export default router;
