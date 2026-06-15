import { Router, Request, Response, NextFunction } from 'express';
import { body, query as queryParam } from 'express-validator';
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

// --- BUKU ---

router.get(
  '/buku',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const s = schema(req);
      const search = (req.query.search as string) || '';
      const kategori = (req.query.kategori as string) || '';

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (search) {
        conditions.push(`(judul ILIKE $${idx} OR penulis ILIKE $${idx} OR isbn ILIKE $${idx})`);
        params.push(`%${search}%`);
        idx++;
      }
      if (kategori) {
        conditions.push(`kategori = $${idx}`);
        params.push(kategori);
        idx++;
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const { rows: countRows } = await query(`SELECT COUNT(*) as total FROM ${s}.buku ${where}`, params);
      const total = parseInt(countRows[0].total, 10);

      const { rows } = await query(
        `SELECT * FROM ${s}.buku ${where} ORDER BY judul LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      );

      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/buku/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(`SELECT * FROM ${s}.buku WHERE id = $1`, [req.params.id]);
      if (rows.length === 0) throw new AppError(404, 'Buku tidak ditemukan');
      sendSuccess(res, rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/buku',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  body('judul').notEmpty().withMessage('Judul wajib diisi'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { judul, penulis, penerbit, isbn, tahun_terbit, edisi, kategori, lokasi, jumlah_total, deskripsi } = req.body;
      const jmlTotal = jumlah_total || 1;

      const { rows } = await query(
        `INSERT INTO ${s}.buku (judul, penulis, penerbit, isbn, tahun_terbit, edisi, kategori, lokasi, jumlah_total, jumlah_tersedia, deskripsi)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [judul, penulis || null, penerbit || null, isbn || null, tahun_terbit || null, edisi || null, kategori || null, lokasi || null, jmlTotal, jmlTotal, deskripsi || null]
      );

      sendSuccess(res, rows[0], 'Buku berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/buku/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { judul, penulis, penerbit, isbn, tahun_terbit, edisi, kategori, lokasi, jumlah_total, jumlah_tersedia, deskripsi } = req.body;

      const { rows: existing } = await query(`SELECT * FROM ${s}.buku WHERE id = $1`, [req.params.id]);
      if (existing.length === 0) throw new AppError(404, 'Buku tidak ditemukan');

      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (judul !== undefined) { fields.push(`judul = $${idx++}`); values.push(judul); }
      if (penulis !== undefined) { fields.push(`penulis = $${idx++}`); values.push(penulis); }
      if (penerbit !== undefined) { fields.push(`penerbit = $${idx++}`); values.push(penerbit); }
      if (isbn !== undefined) { fields.push(`isbn = $${idx++}`); values.push(isbn); }
      if (tahun_terbit !== undefined) { fields.push(`tahun_terbit = $${idx++}`); values.push(tahun_terbit); }
      if (edisi !== undefined) { fields.push(`edisi = $${idx++}`); values.push(edisi); }
      if (kategori !== undefined) { fields.push(`kategori = $${idx++}`); values.push(kategori); }
      if (lokasi !== undefined) { fields.push(`lokasi = $${idx++}`); values.push(lokasi); }
      if (jumlah_total !== undefined) { fields.push(`jumlah_total = $${idx++}`); values.push(jumlah_total); }
      if (jumlah_tersedia !== undefined) { fields.push(`jumlah_tersedia = $${idx++}`); values.push(jumlah_tersedia); }
      if (deskripsi !== undefined) { fields.push(`deskripsi = $${idx++}`); values.push(deskripsi); }
      fields.push(`updated_at = NOW()`);

      if (fields.length > 1) {
        values.push(req.params.id);
        await query(
          `UPDATE ${s}.buku SET ${fields.join(', ')} WHERE id = $${idx}`,
          values
        );
      }

      const { rows } = await query(`SELECT * FROM ${s}.buku WHERE id = $1`, [req.params.id]);
      sendSuccess(res, rows[0], 'Buku berhasil diperbarui');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/buku/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rowCount } = await query(`DELETE FROM ${s}.buku WHERE id = $1`, [req.params.id]);
      if (rowCount === 0) throw new AppError(404, 'Buku tidak ditemukan');
      sendSuccess(res, null, 'Buku berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

// --- ANGGOTA ---

router.get(
  '/anggota',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const s = schema(req);
      const search = (req.query.search as string) || '';

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (search) {
        conditions.push(`(a.kode_anggota ILIKE $${idx} OR m.nama ILIKE $${idx})`);
        params.push(`%${search}%`);
        idx++;
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const { rows: countRows } = await query(
        `SELECT COUNT(*) as total FROM ${s}.anggota_perpustakaan a LEFT JOIN ${s}.mahasiswa m ON m.id = a.mahasiswa_id ${where}`,
        params
      );
      const total = parseInt(countRows[0].total, 10);

      const { rows } = await query(
        `SELECT a.*, m.nim, m.nama as mahasiswa_nama
         FROM ${s}.anggota_perpustakaan a
         LEFT JOIN ${s}.mahasiswa m ON m.id = a.mahasiswa_id
         ${where}
         ORDER BY a.kode_anggota
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      );

      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/anggota',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  body('mahasiswa_id').isUUID().withMessage('Mahasiswa tidak valid'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { mahasiswa_id } = req.body;

      const { rows: mhs } = await query(`SELECT id FROM ${s}.mahasiswa WHERE id = $1`, [mahasiswa_id]);
      if (mhs.length === 0) throw new AppError(404, 'Mahasiswa tidak ditemukan');

      const { rows: exist } = await query(`SELECT id FROM ${s}.anggota_perpustakaan WHERE mahasiswa_id = $1`, [mahasiswa_id]);
      if (exist.length > 0) throw new AppError(409, 'Mahasiswa sudah terdaftar sebagai anggota');

      const now = new Date();
      const yymmdd = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');
      const randomDigits = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      const kode_anggota = `ANG${yymmdd}${randomDigits}`;

      const { rows } = await query(
        `INSERT INTO ${s}.anggota_perpustakaan (mahasiswa_id, kode_anggota) VALUES ($1,$2) RETURNING *`,
        [mahasiswa_id, kode_anggota]
      );

      sendSuccess(res, rows[0], 'Anggota berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/anggota/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { is_active } = req.body;

      const { rows } = await query(
        `UPDATE ${s}.anggota_perpustakaan SET is_active = $1 WHERE id = $2 RETURNING *`,
        [is_active, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Anggota tidak ditemukan');

      sendSuccess(res, rows[0], 'Status anggota diperbarui');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/anggota/:id',
  authenticate,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rowCount } = await query(`DELETE FROM ${s}.anggota_perpustakaan WHERE id = $1`, [req.params.id]);
      if (rowCount === 0) throw new AppError(404, 'Anggota tidak ditemukan');
      sendSuccess(res, null, 'Anggota berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

// --- PEMINJAMAN ---

router.get(
  '/peminjaman',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const s = schema(req);
      const status = (req.query.status as string) || '';
      const search = (req.query.search as string) || '';

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (status) {
        conditions.push(`p.status = $${idx}`);
        params.push(status);
        idx++;
      }
      if (search) {
        conditions.push(`m.nama ILIKE $${idx}`);
        params.push(`%${search}%`);
        idx++;
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const { rows: countRows } = await query(
        `SELECT COUNT(*) as total FROM ${s}.peminjaman_buku p
         LEFT JOIN ${s}.anggota_perpustakaan a ON a.id = p.anggota_id
         LEFT JOIN ${s}.mahasiswa m ON m.id = a.mahasiswa_id
         ${where}`,
        params
      );
      const total = parseInt(countRows[0].total, 10);

      const { rows } = await query(
        `SELECT p.*, b.judul as judul_buku, m.nama as anggota_nama, m.nim
         FROM ${s}.peminjaman_buku p
         LEFT JOIN ${s}.buku b ON b.id = p.buku_id
         LEFT JOIN ${s}.anggota_perpustakaan a ON a.id = p.anggota_id
         LEFT JOIN ${s}.mahasiswa m ON m.id = a.mahasiswa_id
         ${where}
         ORDER BY p.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      );

      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/peminjaman',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  body('buku_id').isUUID().withMessage('Buku tidak valid'),
  body('anggota_id').isUUID().withMessage('Anggota tidak valid'),
  body('tanggal_jatuh_tempo').notEmpty().withMessage('Tanggal jatuh tempo wajib diisi'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { buku_id, anggota_id, tanggal_jatuh_tempo } = req.body;

      const { rows: bukuRows } = await query(`SELECT * FROM ${s}.buku WHERE id = $1`, [buku_id]);
      if (bukuRows.length === 0) throw new AppError(404, 'Buku tidak ditemukan');

      if (bukuRows[0].jumlah_tersedia <= 0) throw new AppError(400, 'Stok buku tidak tersedia');

      const { rows: anggotaRows } = await query(`SELECT * FROM ${s}.anggota_perpustakaan WHERE id = $1`, [anggota_id]);
      if (anggotaRows.length === 0) throw new AppError(404, 'Anggota tidak ditemukan');
      if (!anggotaRows[0].is_active) throw new AppError(400, 'Anggota tidak aktif');

      const { rows } = await query(
        `INSERT INTO ${s}.peminjaman_buku (buku_id, anggota_id, tanggal_jatuh_tempo) VALUES ($1,$2,$3) RETURNING *`,
        [buku_id, anggota_id, tanggal_jatuh_tempo]
      );

      await query(
        `UPDATE ${s}.buku SET jumlah_tersedia = jumlah_tersedia - 1, updated_at = NOW() WHERE id = $1`,
        [buku_id]
      );

      sendSuccess(res, rows[0], 'Peminjaman berhasil dicatat', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/peminjaman/:id/kembali',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const tanggal_kembali = req.body.tanggal_kembali || new Date().toISOString().split('T')[0];

      const { rows: existing } = await query(
        `SELECT * FROM ${s}.peminjaman_buku WHERE id = $1`,
        [req.params.id]
      );
      if (existing.length === 0) throw new AppError(404, 'Peminjaman tidak ditemukan');
      if (existing[0].status === 'dikembalikan') throw new AppError(400, 'Buku sudah dikembalikan');

      const peminjaman = existing[0];
      const tglKembali = new Date(tanggal_kembali);
      const tglJatuhTempo = new Date(peminjaman.tanggal_jatuh_tempo);

      let denda = 0;
      if (tglKembali > tglJatuhTempo) {
        const selisihHari = Math.ceil((tglKembali.getTime() - tglJatuhTempo.getTime()) / (1000 * 60 * 60 * 24));
        denda = selisihHari * 1000;
      }

      const status = denda > 0 ? 'terlambat' : 'dikembalikan';

      const { rows } = await query(
        `UPDATE ${s}.peminjaman_buku SET tanggal_kembali = $1, status = $2, denda = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
        [tanggal_kembali, status, denda, req.params.id]
      );

      await query(
        `UPDATE ${s}.buku SET jumlah_tersedia = jumlah_tersedia + 1, updated_at = NOW() WHERE id = $1`,
        [peminjaman.buku_id]
      );

      sendSuccess(res, rows[0], denda > 0 ? `Buku dikembalikan dengan denda Rp${denda.toLocaleString()}` : 'Buku berhasil dikembalikan');
    } catch (err) {
      next(err);
    }
  }
);

// --- DENDA ---

router.get(
  '/denda/:peminjaman_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT rd.*, p.denda as sisa_denda
         FROM ${s}.riwayat_denda rd
         JOIN ${s}.peminjaman_buku p ON p.id = rd.peminjaman_id
         WHERE rd.peminjaman_id = $1
         ORDER BY rd.created_at DESC`,
        [req.params.peminjaman_id]
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/denda/:peminjaman_id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  body('nominal').isFloat({ min: 0 }).withMessage('Nominal harus angka positif'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nominal, keterangan } = req.body;

      const { rows: peminjaman } = await query(
        `SELECT * FROM ${s}.peminjaman_buku WHERE id = $1`,
        [req.params.peminjaman_id]
      );
      if (peminjaman.length === 0) throw new AppError(404, 'Peminjaman tidak ditemukan');

      const sisaDenda = parseFloat(peminjaman[0].denda) - nominal;
      if (sisaDenda < 0) throw new AppError(400, 'Nominal pembayaran melebihi sisa denda');

      await query(
        `INSERT INTO ${s}.riwayat_denda (peminjaman_id, nominal, keterangan) VALUES ($1,$2,$3)`,
        [req.params.peminjaman_id, nominal, keterangan || null]
      );

      await query(
        `UPDATE ${s}.peminjaman_buku SET denda = $1, updated_at = NOW() WHERE id = $2`,
        [sisaDenda, req.params.peminjaman_id]
      );

      if (sisaDenda === 0) {
        await query(
          `UPDATE ${s}.peminjaman_buku SET status = 'dikembalikan', updated_at = NOW() WHERE id = $1`,
          [req.params.peminjaman_id]
        );
      }

      sendSuccess(res, null, 'Pembayaran denda berhasil dicatat');
    } catch (err) {
      next(err);
    }
  }
);

// --- E-BOOK ---

router.get(
  '/ebook',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const s = schema(req);
      const search = (req.query.search as string) || '';
      const kategori = (req.query.kategori as string) || '';

      const conditions: string[] = ['is_published = true'];
      const params: unknown[] = [];
      let idx = 1;

      if (search) {
        conditions.push(`(judul ILIKE $${idx} OR penulis ILIKE $${idx})`);
        params.push(`%${search}%`);
        idx++;
      }
      if (kategori) {
        conditions.push(`kategori = $${idx}`);
        params.push(kategori);
        idx++;
      }

      const where = `WHERE ${conditions.join(' AND ')}`;

      const { rows: countRows } = await query(`SELECT COUNT(*) as total FROM ${s}.ebook ${where}`, params);
      const total = parseInt(countRows[0].total, 10);

      const { rows } = await query(
        `SELECT * FROM ${s}.ebook ${where} ORDER BY judul LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      );

      sendPaginated(res, rows, total, page, limit);
    } catch (err) { next(err); }
  }
);

router.get(
  '/ebook/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(`SELECT * FROM ${s}.ebook WHERE id = $1`, [req.params.id]);
      if (rows.length === 0) throw new AppError(404, 'E-book tidak ditemukan');
      sendSuccess(res, rows[0]);
    } catch (err) { next(err); }
  }
);

router.post(
  '/ebook',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  body('judul').notEmpty().withMessage('Judul wajib diisi'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { judul, penulis, deskripsi, kategori, file_url, cover_image, tahun_terbit } = req.body;
      const { rows } = await query(
        `INSERT INTO ${s}.ebook (judul, penulis, deskripsi, kategori, file_url, cover_image, tahun_terbit)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [judul, penulis || null, deskripsi || null, kategori || null, file_url || null, cover_image || null, tahun_terbit || null]
      );
      sendSuccess(res, rows[0], 'E-book berhasil ditambahkan', 201);
    } catch (err) { next(err); }
  }
);

router.post(
  '/ebook/:id/download',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `UPDATE ${s}.ebook SET jumlah_download = jumlah_download + 1 WHERE id = $1 RETURNING file_url, judul`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'E-book tidak ditemukan');
      sendSuccess(res, rows[0]);
    } catch (err) { next(err); }
  }
);

router.put(
  '/ebook/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { judul, penulis, deskripsi, kategori, file_url, cover_image, tahun_terbit, is_published } = req.body;
      const { rows: existing } = await query(`SELECT * FROM ${s}.ebook WHERE id = $1`, [req.params.id]);
      if (existing.length === 0) throw new AppError(404, 'E-book tidak ditemukan');

      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (judul !== undefined) { fields.push(`judul = $${idx++}`); values.push(judul); }
      if (penulis !== undefined) { fields.push(`penulis = $${idx++}`); values.push(penulis); }
      if (deskripsi !== undefined) { fields.push(`deskripsi = $${idx++}`); values.push(deskripsi); }
      if (kategori !== undefined) { fields.push(`kategori = $${idx++}`); values.push(kategori); }
      if (file_url !== undefined) { fields.push(`file_url = $${idx++}`); values.push(file_url); }
      if (cover_image !== undefined) { fields.push(`cover_image = $${idx++}`); values.push(cover_image); }
      if (tahun_terbit !== undefined) { fields.push(`tahun_terbit = $${idx++}`); values.push(tahun_terbit); }
      if (is_published !== undefined) { fields.push(`is_published = $${idx++}`); values.push(is_published); }
      fields.push(`updated_at = NOW()`);

      if (fields.length > 1) {
        values.push(req.params.id);
        await query(`UPDATE ${s}.ebook SET ${fields.join(', ')} WHERE id = $${idx}`, values);
      }

      const { rows } = await query(`SELECT * FROM ${s}.ebook WHERE id = $1`, [req.params.id]);
      sendSuccess(res, rows[0], 'E-book berhasil diperbarui');
    } catch (err) { next(err); }
  }
);

router.delete(
  '/ebook/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rowCount } = await query(`DELETE FROM ${s}.ebook WHERE id = $1`, [req.params.id]);
      if (rowCount === 0) throw new AppError(404, 'E-book tidak ditemukan');
      sendSuccess(res, null, 'E-book berhasil dihapus');
    } catch (err) { next(err); }
  }
);

// --- REPOSITORI KARYA ILMIAH ---

router.get(
  '/repositori',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const s = schema(req);
      const search = (req.query.search as string) || '';
      const jenis = (req.query.jenis as string) || '';

      const conditions: string[] = ["status = 'published'"];
      const params: unknown[] = [];
      let idx = 1;

      if (search) {
        conditions.push(`(judul ILIKE $${idx} OR penulis ILIKE $${idx})`);
        params.push(`%${search}%`);
        idx++;
      }
      if (jenis) {
        conditions.push(`jenis = $${idx}`);
        params.push(jenis);
        idx++;
      }

      const where = `WHERE ${conditions.join(' AND ')}`;

      const { rows: countRows } = await query(
        `SELECT COUNT(*) as total FROM ${s}.repositori_karya ${where}`, params
      );
      const total = parseInt(countRows[0].total, 10);

      const { rows } = await query(
        `SELECT r.*, p.nama as prodi_nama
         FROM ${s}.repositori_karya r
         LEFT JOIN ${s}.program_studi p ON p.id = r.prodi_id
         ${where}
         ORDER BY r.tahun DESC, r.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      );

      sendPaginated(res, rows, total, page, limit);
    } catch (err) { next(err); }
  }
);

router.get(
  '/repositori/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT r.*, p.nama as prodi_nama FROM ${s}.repositori_karya r
         LEFT JOIN ${s}.program_studi p ON p.id = r.prodi_id
         WHERE r.id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Karya tidak ditemukan');
      sendSuccess(res, rows[0]);
    } catch (err) { next(err); }
  }
);

router.post(
  '/repositori',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  body('judul').notEmpty().withMessage('Judul wajib diisi'),
  body('penulis').notEmpty().withMessage('Penulis wajib diisi'),
  body('jenis').notEmpty().withMessage('Jenis wajib diisi'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { judul, penulis, nim, pembimbing, jenis, prodi_id, tahun, abstrak, file_url } = req.body;
      const { rows } = await query(
        `INSERT INTO ${s}.repositori_karya (judul, penulis, nim, pembimbing, jenis, prodi_id, tahun, abstrak, file_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [judul, penulis, nim || null, pembimbing || null, jenis, prodi_id || null, tahun || null, abstrak || null, file_url || null]
      );
      sendSuccess(res, rows[0], 'Karya berhasil ditambahkan', 201);
    } catch (err) { next(err); }
  }
);

router.put(
  '/repositori/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { judul, penulis, nim, pembimbing, jenis, prodi_id, tahun, abstrak, file_url, status } = req.body;
      const { rows: existing } = await query(`SELECT * FROM ${s}.repositori_karya WHERE id = $1`, [req.params.id]);
      if (existing.length === 0) throw new AppError(404, 'Karya tidak ditemukan');

      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (judul !== undefined) { fields.push(`judul = $${idx++}`); values.push(judul); }
      if (penulis !== undefined) { fields.push(`penulis = $${idx++}`); values.push(penulis); }
      if (nim !== undefined) { fields.push(`nim = $${idx++}`); values.push(nim); }
      if (pembimbing !== undefined) { fields.push(`pembimbing = $${idx++}`); values.push(pembimbing); }
      if (jenis !== undefined) { fields.push(`jenis = $${idx++}`); values.push(jenis); }
      if (prodi_id !== undefined) { fields.push(`prodi_id = $${idx++}`); values.push(prodi_id); }
      if (tahun !== undefined) { fields.push(`tahun = $${idx++}`); values.push(tahun); }
      if (abstrak !== undefined) { fields.push(`abstrak = $${idx++}`); values.push(abstrak); }
      if (file_url !== undefined) { fields.push(`file_url = $${idx++}`); values.push(file_url); }
      if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }
      fields.push(`updated_at = NOW()`);

      if (fields.length > 1) {
        values.push(req.params.id);
        await query(`UPDATE ${s}.repositori_karya SET ${fields.join(', ')} WHERE id = $${idx}`, values);
      }

      const { rows } = await query(`SELECT * FROM ${s}.repositori_karya WHERE id = $1`, [req.params.id]);
      sendSuccess(res, rows[0], 'Karya berhasil diperbarui');
    } catch (err) { next(err); }
  }
);

router.delete(
  '/repositori/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rowCount } = await query(`DELETE FROM ${s}.repositori_karya WHERE id = $1`, [req.params.id]);
      if (rowCount === 0) throw new AppError(404, 'Karya tidak ditemukan');
      sendSuccess(res, null, 'Karya berhasil dihapus');
    } catch (err) { next(err); }
  }
);

export default router;
