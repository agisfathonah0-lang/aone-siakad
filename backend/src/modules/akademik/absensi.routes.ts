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

function schema(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

router.get(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const jadwalId = req.query.jadwal_id as string;
      const mahasiswaId = req.query.mahasiswa_id as string;

      let sql = `SELECT a.*, m.nim, m.nama as mahasiswa_nama
                 FROM ${s}.absensi a
                 LEFT JOIN ${s}.mahasiswa m ON m.id = a.mahasiswa_id`;
      const params: unknown[] = [];
      const conditions: string[] = [];

      if (jadwalId) { conditions.push(`a.jadwal_id = $${params.length + 1}`); params.push(jadwalId); }
      if (mahasiswaId) { conditions.push(`a.mahasiswa_id = $${params.length + 1}`); params.push(mahasiswaId); }

      if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;
      sql += ` ORDER BY a.pertemuan`;

      const { rows } = await query(sql, params);
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  [
    body('jadwal_id').isUUID().withMessage('Jadwal tidak valid'),
    body('mahasiswa_id').isUUID().withMessage('Mahasiswa tidak valid'),
    body('pertemuan').isInt({ min: 1 }).withMessage('Pertemuan harus angka positif'),
    body('status').isIn(['hadir', 'izin', 'sakit', 'alfa']).withMessage('Status tidak valid'),
    body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { jadwal_id, mahasiswa_id, pertemuan, status, tanggal } = req.body;

      const { rows: exist } = await query(
        `SELECT id FROM ${s}.absensi WHERE jadwal_id = $1 AND mahasiswa_id = $2 AND pertemuan = $3`,
        [jadwal_id, mahasiswa_id, pertemuan]
      );

      if (exist.length > 0) {
        const { rows } = await query(
          `UPDATE ${s}.absensi SET status = $1, tanggal = $2 WHERE id = $3 RETURNING id`,
          [status, tanggal, exist[0].id]
        );
        sendSuccess(res, rows[0], 'Absensi diperbarui');
      } else {
        const { rows } = await query(
          `INSERT INTO ${s}.absensi (id, jadwal_id, mahasiswa_id, pertemuan, status, tanggal)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING id`,
          [jadwal_id, mahasiswa_id, pertemuan, status, tanggal]
        );
        sendSuccess(res, rows[0], 'Absensi dicatat', 201);
      }
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/batch',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  [
    body('jadwal_id').isUUID().withMessage('Jadwal tidak valid'),
    body('pertemuan').isInt({ min: 1 }).withMessage('Pertemuan harus angka positif'),
    body('tanggal').isISO8601().withMessage('Tanggal tidak valid'),
    body('data').isArray({ min: 1 }).withMessage('Data absensi wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { jadwal_id, pertemuan, tanggal, data } = req.body;

      for (const item of data) {
        const { rows: exist } = await query(
          `SELECT id FROM ${s}.absensi WHERE jadwal_id = $1 AND mahasiswa_id = $2 AND pertemuan = $3`,
          [jadwal_id, item.mahasiswa_id, pertemuan]
        );

        if (exist.length > 0) {
          await query(
            `UPDATE ${s}.absensi SET status = $1 WHERE id = $2`,
            [item.status, exist[0].id]
          );
        } else {
          await query(
            `INSERT INTO ${s}.absensi (id, jadwal_id, mahasiswa_id, pertemuan, status, tanggal)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
            [jadwal_id, item.mahasiswa_id, pertemuan, item.status, tanggal]
          );
        }
      }

      sendSuccess(res, null, `${data.length} absensi dicatat`);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/rekap/:jadwal_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT m.id, m.nim, m.nama,
                COUNT(a.id) as total_hadir,
                SUM(CASE WHEN a.status = 'hadir' THEN 1 ELSE 0 END) as hadir,
                SUM(CASE WHEN a.status = 'sakit' THEN 1 ELSE 0 END) as sakit,
                SUM(CASE WHEN a.status = 'izin' THEN 1 ELSE 0 END) as izin,
                SUM(CASE WHEN a.status = 'alfa' THEN 1 ELSE 0 END) as alfa
         FROM ${s}.krs k
         JOIN ${s}.mahasiswa m ON m.id = k.mahasiswa_id
         LEFT JOIN ${s}.absensi a ON a.mahasiswa_id = m.id AND a.jadwal_id = $1
         WHERE k.jadwal_id = $1 AND k.status = 'disetujui'
         GROUP BY m.id, m.nim, m.nama
         ORDER BY m.nim`,
        [req.params.jadwal_id]
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
