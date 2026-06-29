import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { query } from '../../config/database.js';
import { validate } from '../../middleware/validator.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';

const router = Router();

function s(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

router.get(
  '/status',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { rows } = await query(
        `SELECT id FROM ${schema}.mahasiswa WHERE user_id = $1 AND face_descriptor IS NOT NULL LIMIT 1`,
        [req.user!.id]
      );
      sendSuccess(res, { registered: rows.length > 0, mahasiswa_id: rows.length > 0 ? rows[0].id : null });
    } catch (err) { next(err); }
  }
);

router.post(
  '/register',
  authenticate,
  requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.AKADEMIK, Role.MAHASISWA),
  [
    body('descriptor').isArray().withMessage('Descriptor harus berupa array'),
    body('descriptor').isLength({ min: 128, max: 128 }).withMessage('Descriptor harus 128 angka'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { mahasiswa_id, descriptor } = req.body;
      const user = req.user!;

      let targetMahasiswaId = mahasiswa_id;
      if (!targetMahasiswaId) {
        const { rows } = await query(
          `SELECT id FROM ${schema}.mahasiswa WHERE user_id = $1`,
          [user.id]
        );
        if (rows.length === 0) throw new AppError(404, 'Data mahasiswa tidak ditemukan');
        targetMahasiswaId = rows[0].id;
      }

      const { rows } = await query(
        `UPDATE ${schema}.mahasiswa SET face_descriptor = $1::jsonb, face_descriptor_updated_at = NOW()
         WHERE id = $2 RETURNING id, nama`,
        [JSON.stringify(descriptor), targetMahasiswaId]
      );
      if (rows.length === 0) throw new AppError(404, 'Mahasiswa tidak ditemukan');

      sendSuccess(res, { mahasiswa_id: targetMahasiswaId, nama: rows[0].nama }, 'Wajah berhasil diregistrasi');
    } catch (err) { next(err); }
  }
);

router.post(
  '/verify',
  authenticate,
  [
    body('descriptor').isArray().withMessage('Descriptor harus berupa array'),
    body('jadwal_id').optional().isUUID().withMessage('Jadwal tidak valid'),
    body('pertemuan').optional().isInt({ min: 1 }),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = s(req);
      const { descriptor, jadwal_id, pertemuan } = req.body;

      const { rows: mhs } = await query(
        `SELECT id, nim, nama, face_descriptor FROM ${schema}.mahasiswa WHERE user_id = $1`,
        [req.user!.id]
      );
      if (mhs.length === 0) throw new AppError(404, 'Data mahasiswa tidak ditemukan');
      if (!mhs[0].face_descriptor) throw new AppError(400, 'Wajah belum diregistrasi. Registrasi wajah terlebih dahulu.');

      const stored = mhs[0].face_descriptor;
      const dist = euclideanDistance(descriptor, stored);
      const matched = dist < 0.6;

      let absensi = null;
      if (matched && jadwal_id && pertemuan) {
        const { rows: existing } = await query(
          `SELECT id FROM ${schema}.absensi WHERE jadwal_id = $1 AND mahasiswa_id = $2 AND pertemuan = $3`,
          [jadwal_id, mhs[0].id, pertemuan]
        );
        if (existing.length > 0) {
          await query(
            `UPDATE ${schema}.absensi SET status = 'hadir', metode = 'face', confidence = $1, updated_at = NOW()
             WHERE id = $2`,
            [dist, existing[0].id]
          );
        } else {
          const { rows: inserted } = await query(
            `INSERT INTO ${schema}.absensi (jadwal_id, mahasiswa_id, pertemuan, status, metode, confidence, tanggal)
             VALUES ($1, $2, $3, 'hadir', 'face', $4, CURRENT_DATE)
             RETURNING id`,
            [jadwal_id, mhs[0].id, pertemuan, dist]
          );
          absensi = inserted[0];
        }
        absensi = { status: 'hadir', metode: 'face', confidence: dist };
      }

      sendSuccess(res, {
        matched,
        distance: parseFloat(dist.toFixed(4)),
        mahasiswa: { id: mhs[0].id, nim: mhs[0].nim, nama: mhs[0].nama },
        absensi,
      }, matched ? 'Wajah cocok' : 'Wajah tidak cocok');
    } catch (err) { next(err); }
  }
);

export default router;
