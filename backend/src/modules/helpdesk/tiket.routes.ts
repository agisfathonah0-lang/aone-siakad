import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
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

const staffRoles = [Role.SUPER_ADMIN, Role.ADMIN, Role.AKADEMIK];

// GET /kategori — list semua kategori
router.get('/kategori', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { rows } = await query(`SELECT * FROM ${s}.ticket_kategori WHERE is_active = true ORDER BY urutan`);
    sendSuccess(res, rows);
  } catch (err) { next(err); }
});

// POST /kategori — tambah kategori (staff only)
router.post('/kategori', authenticate, requireRole(...staffRoles),
  body('nama').notEmpty().withMessage('Nama kategori wajib diisi'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nama, deskripsi, icon } = req.body;
      const { rows } = await query(
        `INSERT INTO ${s}.ticket_kategori (nama, deskripsi, icon) VALUES ($1,$2,$3) RETURNING *`,
        [nama, deskripsi || null, icon || null]
      );
      sendSuccess(res, rows[0], 'Kategori berhasil ditambahkan', 201);
    } catch (err) { next(err); }
  }
);

// GET / — list tiket
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const kategoriId = req.query.kategori_id as string;
    const isStaff = staffRoles.includes(req.user?.role as Role);
    const userId = req.user?.id;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (!isStaff) {
      conditions.push(`t.user_id = $${idx++}`);
      params.push(userId);
    }
    if (status) {
      conditions.push(`t.status = $${idx++}`);
      params.push(status);
    }
    if (kategoriId) {
      conditions.push(`t.kategori_id = $${idx++}`);
      params.push(kategoriId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows: countRows } = await query(
      `SELECT COUNT(*) as count FROM ${s}.tiket t ${where}`, params
    );
    const total = parseInt(countRows[0].count, 10);

    const { rows: tiket } = await query(
      `SELECT t.*, u.nama as user_nama, u.email as user_email,
              a.nama as assigned_nama,
              k.nama as kategori_nama, k.icon as kategori_icon
       FROM ${s}.tiket t
       LEFT JOIN ${s}.users u ON u.id = t.user_id
       LEFT JOIN ${s}.users a ON a.id = t.assigned_to
       LEFT JOIN ${s}.ticket_kategori k ON k.id = t.kategori_id
       ${where}
       ORDER BY t.updated_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    sendPaginated(res, tiket, total, page, limit);
  } catch (err) { next(err); }
});

// GET /:id — detail tiket + pesan
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = schema(req);
    const { rows: tiket } = await query(
      `SELECT t.*, u.nama as user_nama, u.email as user_email, u.foto_url as user_foto,
              a.nama as assigned_nama,
              k.nama as kategori_nama, k.icon as kategori_icon
       FROM ${s}.tiket t
       LEFT JOIN ${s}.users u ON u.id = t.user_id
       LEFT JOIN ${s}.users a ON a.id = t.assigned_to
       LEFT JOIN ${s}.ticket_kategori k ON k.id = t.kategori_id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (tiket.length === 0) throw new AppError(404, 'Tiket tidak ditemukan');

    const isStaff = staffRoles.includes(req.user?.role as Role);
    const isOwner = tiket[0].user_id === req.user?.id;
    if (!isStaff && !isOwner) throw new AppError(403, 'Akses ditolak');

    const { rows: pesan } = await query(
      `SELECT p.*, u.nama as user_nama, u.foto_url as user_foto, u.role as user_role
       FROM ${s}.tiket_pesan p
       LEFT JOIN ${s}.users u ON u.id = p.user_id
       WHERE p.tiket_id = $1
       ORDER BY p.created_at`,
      [req.params.id]
    );

    sendSuccess(res, { ...tiket[0], pesan });
  } catch (err) { next(err); }
});

// POST / — buat tiket baru
router.post('/', authenticate,
  body('kategori_id').notEmpty().withMessage('Kategori wajib dipilih'),
  body('subjek').notEmpty().withMessage('Subjek wajib diisi'),
  body('deskripsi').notEmpty().withMessage('Deskripsi wajib diisi'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { kategori_id, subjek, deskripsi, prioritas, lampiran } = req.body;

      // Generate no_tiket: TK-{YYMMDD}-{random 4 digit}
      const date = new Date();
      const yymmdd = `${date.getFullYear().toString().slice(2)}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}`;
      const rand = Math.floor(1000 + Math.random() * 9000);
      const noTiket = `TK-${yymmdd}-${rand}`;

      const { rows } = await query(
        `INSERT INTO ${s}.tiket (no_tiket, user_id, kategori_id, subjek, deskripsi, prioritas, lampiran)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [noTiket, req.user!.id, kategori_id, subjek, deskripsi, prioritas || 'normal', lampiran || null]
      );

      sendSuccess(res, rows[0], 'Tiket berhasil dibuat', 201);
    } catch (err) { next(err); }
  }
);

// PUT /:id/status — ubah status (staff)
router.put('/:id/status', authenticate, requireRole(...staffRoles),
  body('status').isIn(['terbuka', 'diproses', 'menunggu', 'selesai', 'ditolak']).withMessage('Status tidak valid'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { status, catatan } = req.body;
      const closedAt = status === 'selesai' || status === 'ditolak' ? 'NOW()' : null;

      const { rows } = await query(
        `UPDATE ${s}.tiket SET status = $1, updated_at = NOW()${closedAt ? ', closed_at = NOW()' : ''}
         WHERE id = $2 RETURNING *`,
        [status, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Tiket tidak ditemukan');

      // Auto-add system message
      if (catatan) {
        await query(
          `INSERT INTO ${s}.tiket_pesan (tiket_id, user_id, pesan, is_internal)
           VALUES ($1, $2, $3, true)`,
          [req.params.id, req.user!.id, `Status diubah ke "${status}". Catatan: ${catatan}`]
        );
      } else {
        await query(
          `INSERT INTO ${s}.tiket_pesan (tiket_id, user_id, pesan, is_internal)
           VALUES ($1, $2, $3, true)`,
          [req.params.id, req.user!.id, `Status diubah ke "${status}"`]
        );
      }

      sendSuccess(res, rows[0], 'Status tiket diperbarui');
    } catch (err) { next(err); }
  }
);

// PUT /:id/assign — tugaskan ke staff
router.put('/:id/assign', authenticate, requireRole(...staffRoles),
  body('assigned_to').isUUID().withMessage('Staff tidak valid'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `UPDATE ${s}.tiket SET assigned_to = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [req.body.assigned_to, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Tiket tidak ditemukan');

      await query(
        `INSERT INTO ${s}.tiket_pesan (tiket_id, user_id, pesan, is_internal)
         VALUES ($1, $2, $3, true)`,
        [req.params.id, req.user!.id, `Tiket ditugaskan ke staff`]
      );

      sendSuccess(res, rows[0], 'Tiket berhasil ditugaskan');
    } catch (err) { next(err); }
  }
);

// POST /:id/pesan — tambah pesan ke tiket
router.post('/:id/pesan', authenticate,
  body('pesan').notEmpty().withMessage('Pesan wajib diisi'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { pesan, lampiran, is_internal } = req.body;

      // Verify access
      const { rows: tiket } = await query(
        `SELECT * FROM ${s}.tiket WHERE id = $1`, [req.params.id]
      );
      if (tiket.length === 0) throw new AppError(404, 'Tiket tidak ditemukan');

      const isStaff = staffRoles.includes(req.user?.role as Role);
      const isOwner = tiket[0].user_id === req.user?.id;
      if (!isStaff && !isOwner) throw new AppError(403, 'Akses ditolak');
      // Non-staff cannot send internal messages
      if (!isStaff && is_internal) throw new AppError(403, 'Tidak dapat mengirim pesan internal');

      const { rows } = await query(
        `INSERT INTO ${s}.tiket_pesan (tiket_id, user_id, pesan, lampiran, is_internal)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.params.id, req.user!.id, pesan, lampiran || null, is_internal || false]
      );

      // Re-open if ticket was closed
      if (tiket[0].status === 'selesai' || tiket[0].status === 'ditolak') {
        await query(
          `UPDATE ${s}.tiket SET status = 'diproses', updated_at = NOW(), closed_at = NULL WHERE id = $1`,
          [req.params.id]
        );
      }

      sendSuccess(res, rows[0], 'Pesan berhasil dikirim', 201);
    } catch (err) { next(err); }
  }
);

export default router;
