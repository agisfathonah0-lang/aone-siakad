import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';

const router = Router();

function schema(req: Request): string {
  if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
  return `"${req.tenant.schemaName}"`;
}

// GET /chat/grup — daftar grup untuk user
router.get('/grup', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    if (!req.user) throw new AppError(401, 'Belum login');
    const { rows } = await query(
      `SELECT g.*, gm.last_read_at,
        (SELECT COUNT(*)::int FROM ${s}.chat_messages m WHERE m.grup_id = g.id) as total_messages,
        (SELECT COUNT(*)::int FROM ${s}.chat_messages m WHERE m.grup_id = g.id AND m.created_at > gm.last_read_at) as unread
       FROM ${s}.chat_grup_kelas g
       JOIN ${s}.chat_grup_members gm ON gm.grup_id = g.id AND gm.user_id = $1
       ORDER BY g.created_at DESC`,
      [req.user.id]
    );
    sendSuccess(res, rows);
  } catch (err) { next(err); }
});

// POST /chat/grup — buat grup baru (dosen/admin)
router.post('/grup', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    if (!req.user) throw new AppError(401, 'Belum login');
    const { nama, deskripsi, kode_mk, anggota } = req.body;
    if (!nama || !anggota?.length) throw new AppError(400, 'Nama grup dan anggota wajib diisi');
    const { rows } = await query(
      `INSERT INTO ${s}.chat_grup_kelas (nama, deskripsi, kode_mk, created_by) VALUES ($1,$2,$3,$4) RETURNING *`,
      [nama, deskripsi || null, kode_mk || null, req.user.id]
    );
    const grup = rows[0];
    const members = [...new Set([...anggota, req.user.id])];
    for (const uid of members) {
      await query(
        `INSERT INTO ${s}.chat_grup_members (grup_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [grup.id, uid]
      );
    }
    sendSuccess(res, grup, 'Grup berhasil dibuat');
  } catch (err) { next(err); }
});

// POST /chat/grup/:id/join — bergabung ke grup
router.post('/grup/:id/join', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    if (!req.user) throw new AppError(401, 'Belum login');
    await query(
      `INSERT INTO ${s}.chat_grup_members (grup_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [req.params.id, req.user.id]
    );
    sendSuccess(res, null, 'Bergabung ke grup');
  } catch (err) { next(err); }
});

// GET /chat/grup/:id/members — daftar anggota grup
router.get('/grup/:id/members', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    if (!req.user) throw new AppError(401, 'Belum login');
    const { rows } = await query(
      `SELECT u.id, u.nama, u.email FROM ${s}.chat_grup_members gm
       JOIN ${s}.users u ON u.id = gm.user_id
       WHERE gm.grup_id = $1 ORDER BY gm.joined_at`,
      [req.params.id]
    );
    sendSuccess(res, rows);
  } catch (err) { next(err); }
});

// GET /chat/grup/:id/messages — pesan dalam grup
router.get('/grup/:id/messages', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    if (!req.user) throw new AppError(401, 'Belum login');
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const { rows } = await query(
      `SELECT m.*, u.nama as user_nama, u.email as user_email
       FROM ${s}.chat_messages m
       JOIN ${s}.users u ON u.id = m.user_id
       WHERE m.grup_id = $1
       ORDER BY m.created_at DESC LIMIT $2 OFFSET $3`,
      [req.params.id, limit, offset]
    );
    sendSuccess(res, rows.reverse());
  } catch (err) { next(err); }
});

// POST /chat/grup/:id/messages — kirim pesan
router.post('/grup/:id/messages', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    if (!req.user) throw new AppError(401, 'Belum login');
    const { pesan } = req.body;
    if (!pesan?.trim()) throw new AppError(400, 'Pesan tidak boleh kosong');
    const { rows } = await query(
      `INSERT INTO ${s}.chat_messages (grup_id, user_id, pesan) VALUES ($1,$2,$3) RETURNING *`,
      [req.params.id, req.user.id, pesan]
    );
    sendSuccess(res, rows[0]);
  } catch (err) { next(err); }
});

// POST /chat/grup/:id/read — tandai baca
router.post('/grup/:id/read', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    if (!req.user) throw new AppError(401, 'Belum login');
    await query(
      `UPDATE ${s}.chat_grup_members SET last_read_at = NOW() WHERE grup_id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    sendSuccess(res, null, 'Dibaca');
  } catch (err) { next(err); }
});

export default router;
