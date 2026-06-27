import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { v4 as uuid } from 'uuid';
import { query } from '../../config/database.js';
import { validate } from '../../middleware/validator.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess, sendPaginated } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';

const router = Router();

function schema(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

// List kelas room (user's rooms)
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const { rows: totalRows } = await query(
        `SELECT COUNT(*) as count FROM ${s}.kelas_room_anggota WHERE user_id = $1`,
        [userId]
      );
      const total = parseInt(totalRows[0].count, 10);

      const { rows } = await query(
        `SELECT kr.*, u.nama as dosen_nama,
                COALESCE(kr_aggr.materi_count, 0) as materi_count,
                COALESCE(kr_aggr.tugas_count, 0) as tugas_count,
                COALESCE(kr_aggr.pengumuman_count, 0) as pengumuman_count,
                kr_aggr.last_activity
         FROM ${s}.kelas_room kr
         JOIN ${s}.kelas_room_anggota kra ON kra.kelas_room_id = kr.id AND kra.user_id = $1
         LEFT JOIN ${s}.users u ON u.id = kr.created_by
         LEFT JOIN LATERAL (
           SELECT
             COUNT(DISTINCT km.id) as materi_count,
             COUNT(DISTINCT kt.id) as tugas_count,
             COUNT(DISTINCT kp.id) as pengumuman_count,
             GREATEST(
               COALESCE(MAX(km.created_at), '1970-01-01'),
               COALESCE(MAX(kt.created_at), '1970-01-01'),
               COALESCE(MAX(kp.created_at), '1970-01-01')
             ) as last_activity
           FROM ${s}.kelas_materi km
           FULL JOIN ${s}.kelas_tugas kt ON kt.kelas_room_id = kr.id
           FULL JOIN ${s}.kelas_pengumuman kp ON kp.kelas_room_id = kr.id
           WHERE km.kelas_room_id = kr.id OR kt.kelas_room_id = kr.id OR kp.kelas_room_id = kr.id
         ) kr_aggr ON true
         ORDER BY kr_aggr.last_activity DESC NULLS LAST, kr.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      sendPaginated(res, rows, total, page, limit);
    } catch (err) { next(err); }
  }
);

// Create room
router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  [body('nama').notEmpty().withMessage('Nama kelas wajib diisi'), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const userId = req.user!.id;
      const { nama, deskripsi, jadwal_id, semester, tahun_akademik } = req.body;
      const roomId = uuid();
      const kodeEnroll = Math.random().toString(36).substring(2, 8).toUpperCase();

      await query(
        `INSERT INTO ${s}.kelas_room (id, jadwal_id, nama, deskripsi, kode_enroll, semester, tahun_akademik, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [roomId, jadwal_id || null, nama, deskripsi || null, kodeEnroll, semester || null, tahun_akademik || null, userId]
      );

      await query(
        `INSERT INTO ${s}.kelas_room_anggota (kelas_room_id, user_id, role) VALUES ($1, $2, 'dosen')`,
        [roomId, userId]
      );

      sendSuccess(res, { id: roomId, kode_enroll: kodeEnroll }, 'Kelas berhasil dibuat', 201);
    } catch (err) { next(err); }
  }
);

// Enroll via kode
router.post(
  '/enroll',
  authenticate,
  [body('kode').notEmpty().withMessage('Kode enroll wajib diisi'), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const userId = req.user!.id;

      const { rows: rooms } = await query(
        `SELECT id FROM ${s}.kelas_room WHERE kode_enroll = $1`,
        [req.body.kode]
      );
      if (rooms.length === 0) throw new AppError(404, 'Kode enroll tidak valid');

      const roomId = rooms[0].id;

      const { rows: exist } = await query(
        `SELECT id FROM ${s}.kelas_room_anggota WHERE kelas_room_id = $1 AND user_id = $2`,
        [roomId, userId]
      );
      if (exist.length > 0) throw new AppError(409, 'Anda sudah terdaftar di kelas ini');

      await query(
        `INSERT INTO ${s}.kelas_room_anggota (kelas_room_id, user_id, role) VALUES ($1, $2, 'mahasiswa')`,
        [roomId, userId]
      );

      sendSuccess(res, { id: roomId }, 'Berhasil bergabung ke kelas');
    } catch (err) { next(err); }
  }
);

// Room detail
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT kr.*, u.nama as dosen_nama, u.email as dosen_email
         FROM ${s}.kelas_room kr
         LEFT JOIN ${s}.users u ON u.id = kr.created_by
         WHERE kr.id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Kelas tidak ditemukan');

      const { rows: anggota } = await query(
        `SELECT kra.*, u.nama, u.email, u.foto_url
         FROM ${s}.kelas_room_anggota kra
         JOIN ${s}.users u ON u.id = kra.user_id
         WHERE kra.kelas_room_id = $1
         ORDER BY kra.role, u.nama`,
        [req.params.id]
      );

      sendSuccess(res, { ...rows[0], anggota });
    } catch (err) { next(err); }
  }
);

// ===== MATERI =====

router.get(
  '/:id/materi',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT km.*, u.nama as created_by_nama
         FROM ${s}.kelas_materi km
         LEFT JOIN ${s}.users u ON u.id = km.created_by
         WHERE km.kelas_room_id = $1
         ORDER BY km.created_at DESC`,
        [req.params.id]
      );
      sendSuccess(res, rows);
    } catch (err) { next(err); }
  }
);

router.post(
  '/:id/materi',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  [body('judul').notEmpty().withMessage('Judul materi wajib diisi'), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const userId = req.user!.id;
      const mid = uuid();
      const { judul, deskripsi, file_url, file_nama, file_size, tipe, link_url } = req.body;

      await query(
        `INSERT INTO ${s}.kelas_materi (id, kelas_room_id, judul, deskripsi, file_url, file_nama, file_size, tipe, link_url, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [mid, req.params.id, judul, deskripsi || null, file_url || null, file_nama || null, file_size || null, tipe || 'file', link_url || null, userId]
      );

      sendSuccess(res, { id: mid }, 'Materi berhasil ditambahkan', 201);
    } catch (err) { next(err); }
  }
);

router.delete(
  '/:roomId/materi/:materiId',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      await query(`DELETE FROM ${s}.kelas_materi WHERE id = $1 AND kelas_room_id = $2`, [req.params.materiId, req.params.roomId]);
      sendSuccess(res, null, 'Materi berhasil dihapus');
    } catch (err) { next(err); }
  }
);

// ===== TUGAS =====

router.get(
  '/:id/tugas',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const userId = req.user!.id;
      const role = req.user!.role;

      const { rows } = await query(
        `SELECT kt.*, u.nama as created_by_nama,
                COALESCE(sub.nilai, 0) as nilai_saya,
                CASE WHEN sub.id IS NOT NULL THEN true ELSE false END as sudah_submit,
                sub.submitted_at as submit_at,
                sub.feedback as feedback,
                (SELECT COUNT(*) FROM ${s}.kelas_tugas_submit WHERE kelas_tugas_id = kt.id) as total_submit
         FROM ${s}.kelas_tugas kt
         LEFT JOIN ${s}.users u ON u.id = kt.created_by
         LEFT JOIN ${s}.kelas_tugas_submit sub ON sub.kelas_tugas_id = kt.id AND sub.user_id = $2
         WHERE kt.kelas_room_id = $1
         ORDER BY kt.created_at DESC`,
        [req.params.id, userId]
      );

      // If dosen, include all submissions
      let result = rows;
      if (role === 'dosen') {
        for (const tugas of result) {
          const { rows: submissions } = await query(
            `SELECT kts.*, u.nama, u.email, u.foto_url
             FROM ${s}.kelas_tugas_submit kts
             JOIN ${s}.users u ON u.id = kts.user_id
             WHERE kts.kelas_tugas_id = $1
             ORDER BY kts.submitted_at DESC`,
            [tugas.id]
          );
          tugas.submissions = submissions;
        }
      }

      sendSuccess(res, result);
    } catch (err) { next(err); }
  }
);

router.post(
  '/:id/tugas',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  [body('judul').notEmpty().withMessage('Judul tugas wajib diisi'), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const userId = req.user!.id;
      const tid = uuid();
      const { judul, deskripsi, file_url, file_nama, deadline, bobot } = req.body;

      await query(
        `INSERT INTO ${s}.kelas_tugas (id, kelas_room_id, judul, deskripsi, file_url, file_nama, deadline, bobot, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [tid, req.params.id, judul, deskripsi || null, file_url || null, file_nama || null, deadline || null, bobot || 0, userId]
      );

      sendSuccess(res, { id: tid }, 'Tugas berhasil ditambahkan', 201);
    } catch (err) { next(err); }
  }
);

// Submit tugas
router.post(
  '/tugas/:tugasId/submit',
  authenticate,
  [body('file_url').notEmpty().withMessage('File wajib diupload'), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const userId = req.user!.id;
      const { file_url, file_nama, file_size, catatan } = req.body;

      const { rows: exist } = await query(
        `SELECT id FROM ${s}.kelas_tugas_submit WHERE kelas_tugas_id = $1 AND user_id = $2`,
        [req.params.tugasId, userId]
      );
      if (exist.length > 0) {
        await query(
          `UPDATE ${s}.kelas_tugas_submit SET file_url = $1, file_nama = $2, file_size = $3, catatan = $4, submitted_at = NOW(), dinilai_at = NULL, nilai = NULL, feedback = NULL
           WHERE kelas_tugas_id = $5 AND user_id = $6`,
          [file_url, file_nama || null, file_size || null, catatan || null, req.params.tugasId, userId]
        );
      } else {
        await query(
          `INSERT INTO ${s}.kelas_tugas_submit (kelas_tugas_id, user_id, file_url, file_nama, file_size, catatan)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [req.params.tugasId, userId, file_url, file_nama || null, file_size || null, catatan || null]
        );
      }

      sendSuccess(res, null, 'Tugas berhasil dikumpulkan');
    } catch (err) { next(err); }
  }
);

// Nilai tugas
router.put(
  '/tugas/:tugasId/nilai/:userId',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  [body('nilai').isNumeric().withMessage('Nilai harus angka'), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nilai, feedback } = req.body;

      await query(
        `UPDATE ${s}.kelas_tugas_submit SET nilai = $1, feedback = $2, dinilai_at = NOW()
         WHERE kelas_tugas_id = $3 AND user_id = $4`,
        [nilai, feedback || null, req.params.tugasId, req.params.userId]
      );

      sendSuccess(res, null, 'Nilai berhasil disimpan');
    } catch (err) { next(err); }
  }
);

// ===== PENGUMUMAN =====

router.get(
  '/:id/pengumuman',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT kp.*, u.nama as created_by_nama, u.foto_url as created_by_foto
         FROM ${s}.kelas_pengumuman kp
         LEFT JOIN ${s}.users u ON u.id = kp.created_by
         WHERE kp.kelas_room_id = $1
         ORDER BY kp.created_at DESC`,
        [req.params.id]
      );
      sendSuccess(res, rows);
    } catch (err) { next(err); }
  }
);

router.post(
  '/:id/pengumuman',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN),
  [body('judul').notEmpty().withMessage('Judul wajib diisi'), body('konten').notEmpty().withMessage('Konten wajib diisi'), validate],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const userId = req.user!.id;
      const pid = uuid();
      const { judul, konten, file_url, file_nama } = req.body;

      await query(
        `INSERT INTO ${s}.kelas_pengumuman (id, kelas_room_id, judul, konten, file_url, file_nama, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [pid, req.params.id, judul, konten, file_url || null, file_nama || null, userId]
      );

      sendSuccess(res, { id: pid }, 'Pengumuman berhasil diposting', 201);
    } catch (err) { next(err); }
  }
);

export default router;
