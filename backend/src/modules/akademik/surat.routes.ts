import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
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

async function generateNomorSurat(req: Request, kode: string, table: string = 'surat_keluar'): Promise<string> {
  const s = schema(req);
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();

  const { rows: tRows } = await query(
    'SELECT singkatan, nama_pt FROM public.tenants WHERE id = $1',
    [req.tenant!.id]
  );
  const prefix = (tRows[0]?.singkatan || tRows[0]?.nama_pt || 'UNIV').replace(/\s+/g, '-').toUpperCase();

  const { rows } = await query(
    `SELECT COUNT(*)::int as count FROM ${s}.${table}
     WHERE EXTRACT(YEAR FROM created_at) = $1`,
    [yyyy]
  );
  const nextNum = (rows[0].count + 1).toString().padStart(4, '0');
  return `${nextNum}/${prefix}/${kode}/${mm}/${yyyy}`;
}

function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || '');
  }
  return result;
}

const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

router.get(
  '/kategori',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT * FROM ${s}.surat_kategori ORDER BY nama ASC`
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/kategori',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('nama').notEmpty().withMessage('Nama kategori wajib diisi'),
    body('kode').notEmpty().withMessage('Kode kategori wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nama, kode, deskripsi, template } = req.body;
      const { rows } = await query(
        `INSERT INTO ${s}.surat_kategori (nama, kode, deskripsi, template)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [nama, kode, deskripsi || null, template || null]
      );
      sendSuccess(res, rows[0], 'Kategori berhasil dibuat', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/kategori/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nama, kode, deskripsi, template } = req.body;
      const { rows } = await query(
        `UPDATE ${s}.surat_kategori SET nama = $1, kode = $2, deskripsi = $3, template = $4 WHERE id = $5 RETURNING *`,
        [nama, kode, deskripsi || null, template || null, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Kategori tidak ditemukan');
      sendSuccess(res, rows[0], 'Kategori berhasil diupdate');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/kategori/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rowCount } = await query(
        `DELETE FROM ${s}.surat_kategori WHERE id = $1`,
        [req.params.id]
      );
      if (rowCount === 0) throw new AppError(404, 'Kategori tidak ditemukan');
      sendSuccess(res, null, 'Kategori berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/masuk',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const status = req.query.status as string;
      const search = req.query.search as string;

      let sql = `SELECT sm.*, sk.nama as kategori_nama, sk.kode as kategori_kode
                 FROM ${s}.surat_masuk sm
                 LEFT JOIN ${s}.surat_kategori sk ON sk.id = sm.kategori_id`;
      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (status) {
        conditions.push(`sm.status = $${idx++}`);
        params.push(status);
      }
      if (search) {
        conditions.push(`(sm.perihal ILIKE $${idx} OR sm.asal ILIKE $${idx} OR sm.nomor_surat ILIKE $${idx})`);
        params.push(`%${search}%`);
        idx++;
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const countSql = `SELECT COUNT(*) as count FROM (${sql}) sub`;
      const { rows: countRows } = await query(countSql, params);
      const total = parseInt(countRows[0].count, 10);

      sql += ` ORDER BY sm.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(limit, offset);

      const { rows } = await query(sql, params);
      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/masuk/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT sm.*, sk.nama as kategori_nama, sk.kode as kategori_kode
         FROM ${s}.surat_masuk sm
         LEFT JOIN ${s}.surat_kategori sk ON sk.id = sm.kategori_id
         WHERE sm.id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Surat masuk tidak ditemukan');

      const { rows: disposisi } = await query(
        `SELECT * FROM ${s}.surat_disposisi WHERE surat_masuk_id = $1 ORDER BY created_at DESC`,
        [req.params.id]
      );

      sendSuccess(res, { ...rows[0], disposisi });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/masuk',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('nomor_surat').notEmpty().withMessage('Nomor surat wajib diisi'),
    body('asal').notEmpty().withMessage('Asal surat wajib diisi'),
    body('perihal').notEmpty().withMessage('Perihal wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nomor_surat, tanggal_surat, tanggal_terima, asal, perihal, lampiran, penerima, kategori_id, file_url, status, catatan } = req.body;
      const { rows } = await query(
        `INSERT INTO ${s}.surat_masuk (nomor_surat, tanggal_surat, tanggal_terima, asal, perihal, lampiran, penerima, kategori_id, file_url, status, catatan, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [nomor_surat, tanggal_surat || new Date(), tanggal_terima || new Date(), asal, perihal, lampiran || null, penerima || null, kategori_id || null, file_url || null, status || 'diterima', catatan || null, req.user?.id]
      );
      sendSuccess(res, rows[0], 'Surat masuk berhasil dicatat', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/masuk/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nomor_surat, tanggal_surat, tanggal_terima, asal, perihal, lampiran, penerima, kategori_id, file_url, status, catatan } = req.body;
      const { rows } = await query(
        `UPDATE ${s}.surat_masuk SET nomor_surat = $1, tanggal_surat = $2, tanggal_terima = $3, asal = $4, perihal = $5, lampiran = $6, penerima = $7, kategori_id = $8, file_url = $9, status = $10, catatan = $11, updated_at = NOW()
         WHERE id = $12 RETURNING *`,
        [nomor_surat, tanggal_surat, tanggal_terima, asal, perihal, lampiran, penerima, kategori_id, file_url, status, catatan, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Surat masuk tidak ditemukan');
      sendSuccess(res, rows[0], 'Surat masuk berhasil diupdate');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/masuk/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rowCount } = await query(
        `DELETE FROM ${s}.surat_masuk WHERE id = $1`,
        [req.params.id]
      );
      if (rowCount === 0) throw new AppError(404, 'Surat masuk tidak ditemukan');
      sendSuccess(res, null, 'Surat masuk berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/keluar',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const status = req.query.status as string;
      const search = req.query.search as string;

      let sql = `SELECT skl.*, sk.nama as kategori_nama, sk.kode as kategori_kode
                 FROM ${s}.surat_keluar skl
                 LEFT JOIN ${s}.surat_kategori sk ON sk.id = skl.kategori_id`;
      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (status) {
        conditions.push(`skl.status = $${idx++}`);
        params.push(status);
      }
      if (search) {
        conditions.push(`(skl.perihal ILIKE $${idx} OR skl.tujuan ILIKE $${idx} OR skl.nomor_surat ILIKE $${idx})`);
        params.push(`%${search}%`);
        idx++;
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const countSql = `SELECT COUNT(*) as count FROM (${sql}) sub`;
      const { rows: countRows } = await query(countSql, params);
      const total = parseInt(countRows[0].count, 10);

      sql += ` ORDER BY skl.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(limit, offset);

      const { rows } = await query(sql, params);
      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/keluar/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT skl.*, sk.nama as kategori_nama, sk.kode as kategori_kode
         FROM ${s}.surat_keluar skl
         LEFT JOIN ${s}.surat_kategori sk ON sk.id = skl.kategori_id
         WHERE skl.id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Surat keluar tidak ditemukan');
      sendSuccess(res, rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/keluar/:id/cetak',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT skl.*, sk.nama as kategori_nama, sk.kode as kategori_kode, sk.template
         FROM ${s}.surat_keluar skl
         LEFT JOIN ${s}.surat_kategori sk ON sk.id = skl.kategori_id
         WHERE skl.id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Surat keluar tidak ditemukan');

      const { rows: tRows } = await query(
        'SELECT nama_pt, alamat, telepon, email, website, logo_url FROM public.tenants WHERE id = $1',
        [req.tenant!.id]
      );
      const t = tRows[0] || {};

      const d = rows[0].tanggal_surat ? new Date(rows[0].tanggal_surat) : new Date();
      const vars: Record<string, string> = {
        nomor_surat: rows[0].nomor_surat || '',
        tanggal: d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
        hari: days[d.getDay()],
        bulan: months[d.getMonth()],
        tahun: String(d.getFullYear()),
        perihal: rows[0].perihal || '',
        tujuan: rows[0].tujuan || '',
        lampiran: rows[0].lampiran || '-',
        pengirim: rows[0].pengirim || '',
        penandatangan: rows[0].penandatangan || '',
        nama_pt: t.nama_pt || '',
        alamat: t.alamat || '',
        telepon: t.telepon || '',
        email: t.email || '',
        website: t.website || '',
        logo_url: t.logo_url || '',
      };

      const rendered = rows[0].template ? renderTemplate(rows[0].template, vars) : '';

      sendSuccess(res, { ...rows[0], rendered_content: rendered, tenant: t });
    } catch (err) { next(err); }
  }
);

router.get(
  '/pengajuan/:id/cetak',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT sp.*, sk.nama as kategori_nama, sk.kode as kategori_kode, sk.template,
                m.nim, m.nama as mahasiswa_nama, p.nama as prodi_nama, p.jenjang
         FROM ${s}.surat_pengajuan sp
         LEFT JOIN ${s}.surat_kategori sk ON sk.id = sp.kategori_id
         LEFT JOIN ${s}.mahasiswa m ON m.id = sp.mahasiswa_id
         LEFT JOIN ${s}.program_studi p ON p.id = m.program_studi_id
         WHERE sp.id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Pengajuan surat tidak ditemukan');

      const { rows: tRows } = await query(
        'SELECT nama_pt, alamat, telepon, email, website, logo_url FROM public.tenants WHERE id = $1',
        [req.tenant!.id]
      );
      const t = tRows[0] || {};

      const d = new Date();
      const vars: Record<string, string> = {
        nomor_surat: rows[0].nomor_surat || '',
        tanggal: d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
        hari: days[d.getDay()],
        bulan: months[d.getMonth()],
        tahun: String(d.getFullYear()),
        nama_mahasiswa: rows[0].mahasiswa_nama || '',
        nim: rows[0].nim || '',
        prodi: rows[0].prodi_nama || '',
        jenjang: rows[0].jenjang || '',
        semester: req.query.semester as string || '',
        tahun_akademik: req.query.tahun_akademik as string || '',
        keperluan: rows[0].keperluan || '',
        tujuan: rows[0].tujuan || '',
        nama_pt: t.nama_pt || '',
        alamat: t.alamat || '',
        telepon: t.telepon || '',
        email: t.email || '',
        website: t.website || '',
        logo_url: t.logo_url || '',
      };

      const rendered = rows[0].template ? renderTemplate(rows[0].template, vars) : '';

      sendSuccess(res, { ...rows[0], rendered_content: rendered, tenant: t });
    } catch (err) { next(err); }
  }
);

router.post(
  '/keluar',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('tujuan').notEmpty().withMessage('Tujuan surat wajib diisi'),
    body('perihal').notEmpty().withMessage('Perihal wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nomor_surat, tanggal_surat, tujuan, perihal, lampiran, kategori_id, file_url, status, pengirim, penandatangan, catatan } = req.body;
      const { rows } = await query(
        `INSERT INTO ${s}.surat_keluar (nomor_surat, tanggal_surat, tujuan, perihal, lampiran, kategori_id, file_url, status, pengirim, penandatangan, catatan, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [nomor_surat, tanggal_surat || new Date(), tujuan, perihal, lampiran || null, kategori_id || null, file_url || null, status || 'draft', pengirim || null, penandatangan || null, catatan || null, req.user?.id]
      );
      sendSuccess(res, rows[0], 'Surat keluar berhasil dibuat', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/keluar/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { nomor_surat, tanggal_surat, tujuan, perihal, lampiran, kategori_id, file_url, status, pengirim, penandatangan, catatan } = req.body;
      const { rows } = await query(
        `UPDATE ${s}.surat_keluar SET nomor_surat = $1, tanggal_surat = $2, tujuan = $3, perihal = $4, lampiran = $5, kategori_id = $6, file_url = $7, status = $8, pengirim = $9, penandatangan = $10, catatan = $11, updated_at = NOW()
         WHERE id = $12 RETURNING *`,
        [nomor_surat, tanggal_surat, tujuan, perihal, lampiran, kategori_id, file_url, status, pengirim, penandatangan, catatan, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Surat keluar tidak ditemukan');
      sendSuccess(res, rows[0], 'Surat keluar berhasil diupdate');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/keluar/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rowCount } = await query(
        `DELETE FROM ${s}.surat_keluar WHERE id = $1`,
        [req.params.id]
      );
      if (rowCount === 0) throw new AppError(404, 'Surat keluar tidak ditemukan');
      sendSuccess(res, null, 'Surat keluar berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/masuk/:surat_masuk_id/disposisi',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT * FROM ${s}.surat_disposisi WHERE surat_masuk_id = $1 ORDER BY created_at DESC`,
        [req.params.surat_masuk_id]
      );
      sendSuccess(res, rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/masuk/:surat_masuk_id/disposisi',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('dari_jabatan').notEmpty().withMessage('Jabatan asal wajib diisi'),
    body('ke_jabatan').notEmpty().withMessage('Jabatan tujuan wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { dari_jabatan, ke_jabatan, instruksi, catatan, batas_waktu, status } = req.body;

      const { rows: surat } = await query(
        `SELECT id FROM ${s}.surat_masuk WHERE id = $1`,
        [req.params.surat_masuk_id]
      );
      if (surat.length === 0) throw new AppError(404, 'Surat masuk tidak ditemukan');

      const { rows } = await query(
        `INSERT INTO ${s}.surat_disposisi (surat_masuk_id, dari_jabatan, ke_jabatan, instruksi, catatan, batas_waktu, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [req.params.surat_masuk_id, dari_jabatan, ke_jabatan, instruksi || null, catatan || null, batas_waktu || null, status || 'diteruskan', req.user?.id]
      );

      await query(
        `UPDATE ${s}.surat_masuk SET status = 'didisposisikan', updated_at = NOW() WHERE id = $1`,
        [req.params.surat_masuk_id]
      );

      sendSuccess(res, rows[0], 'Disposisi berhasil dibuat', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/disposisi/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { dari_jabatan, ke_jabatan, instruksi, catatan, batas_waktu, status } = req.body;
      const { rows } = await query(
        `UPDATE ${s}.surat_disposisi SET dari_jabatan = $1, ke_jabatan = $2, instruksi = $3, catatan = $4, batas_waktu = $5, status = $6, updated_at = NOW()
         WHERE id = $7 RETURNING *`,
        [dari_jabatan, ke_jabatan, instruksi, catatan, batas_waktu, status, req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Disposisi tidak ditemukan');

      if (status === 'selesai') {
        const disposisi = rows[0];
        const { rows: remaining } = await query(
          `SELECT id FROM ${s}.surat_disposisi WHERE surat_masuk_id = $1 AND status != 'selesai'`,
          [disposisi.surat_masuk_id]
        );
        if (remaining.length === 0) {
          await query(
            `UPDATE ${s}.surat_masuk SET status = 'selesai', updated_at = NOW() WHERE id = $1`,
            [disposisi.surat_masuk_id]
          );
        }
      }

      sendSuccess(res, rows[0], 'Disposisi berhasil diupdate');
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/disposisi/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rowCount } = await query(
        `DELETE FROM ${s}.surat_disposisi WHERE id = $1`,
        [req.params.id]
      );
      if (rowCount === 0) throw new AppError(404, 'Disposisi tidak ditemukan');
      sendSuccess(res, null, 'Disposisi berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/pengajuan',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const status = req.query.status as string;
      const mahasiswa_id = req.query.mahasiswa_id as string;

      let sql = `SELECT sp.*, sk.nama as kategori_nama, sk.kode as kategori_kode, m.nim, m.nama as mahasiswa_nama
                 FROM ${s}.surat_pengajuan sp
                 LEFT JOIN ${s}.surat_kategori sk ON sk.id = sp.kategori_id
                 LEFT JOIN ${s}.mahasiswa m ON m.id = sp.mahasiswa_id`;
      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (status) {
        conditions.push(`sp.status = $${idx++}`);
        params.push(status);
      }
      if (mahasiswa_id) {
        conditions.push(`sp.mahasiswa_id = $${idx++}`);
        params.push(mahasiswa_id);
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      const countSql = `SELECT COUNT(*) as count FROM (${sql}) sub`;
      const { rows: countRows } = await query(countSql, params);
      const total = parseInt(countRows[0].count, 10);

      sql += ` ORDER BY sp.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(limit, offset);

      const { rows } = await query(sql, params);
      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/pengajuan/:id',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.MAHASISWA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { rows } = await query(
        `SELECT sp.*, sk.nama as kategori_nama, sk.kode as kategori_kode, m.nim, m.nama as mahasiswa_nama
         FROM ${s}.surat_pengajuan sp
         LEFT JOIN ${s}.surat_kategori sk ON sk.id = sp.kategori_id
         LEFT JOIN ${s}.mahasiswa m ON m.id = sp.mahasiswa_id
         WHERE sp.id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Pengajuan surat tidak ditemukan');
      sendSuccess(res, rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/pengajuan',
  authenticate,
  requireRole(Role.MAHASISWA),
  [
    body('kategori_id').isUUID().withMessage('Kategori surat tidak valid'),
    body('keperluan').notEmpty().withMessage('Keperluan wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { kategori_id, keperluan, tujuan, file_url } = req.body;

      const { rows: mhs } = await query(
        `SELECT id FROM ${s}.mahasiswa WHERE user_id = $1`,
        [req.user?.id]
      );
      if (mhs.length === 0) throw new AppError(404, 'Data mahasiswa tidak ditemukan');

      const { rows } = await query(
        `INSERT INTO ${s}.surat_pengajuan (mahasiswa_id, kategori_id, keperluan, tujuan, file_url)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [mhs[0].id, kategori_id, keperluan, tujuan || null, file_url || null]
      );
      sendSuccess(res, rows[0], 'Pengajuan surat berhasil dikirim', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/pengajuan/:id/status',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK),
  [
    body('status').isIn(['diproses', 'selesai', 'ditolak']).withMessage('Status harus diproses, selesai, atau ditolak'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);
      const { status, catatan_penolakan } = req.body;

      const { rows: pengajuan } = await query(
        `SELECT * FROM ${s}.surat_pengajuan WHERE id = $1`,
        [req.params.id]
      );
      if (pengajuan.length === 0) throw new AppError(404, 'Pengajuan surat tidak ditemukan');

      if (status === 'selesai') {
        const { rows: kategori } = await query(
          `SELECT kode FROM ${s}.surat_kategori WHERE id = $1`,
          [pengajuan[0].kategori_id]
        );
        const kode = kategori.length > 0 ? kategori[0].kode : 'LAIN';
        const nomor_surat = await generateNomorSurat(req, kode, 'surat_pengajuan');

        const { rows } = await query(
          `UPDATE ${s}.surat_pengajuan SET status = $1, nomor_surat = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
          [status, nomor_surat, req.params.id]
        );
        sendSuccess(res, rows[0], 'Pengajuan surat selesai diproses');
      } else {
        const { rows } = await query(
          `UPDATE ${s}.surat_pengajuan SET status = $1, catatan_penolakan = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
          [status, catatan_penolakan || null, req.params.id]
        );
        sendSuccess(res, rows[0], `Pengajuan surat ${status === 'diproses' ? 'sedang diproses' : 'ditolak'}`);
      }
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/pengajuan/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = schema(req);

      const { rows: pengajuan } = await query(
        `SELECT * FROM ${s}.surat_pengajuan WHERE id = $1`,
        [req.params.id]
      );
      if (pengajuan.length === 0) throw new AppError(404, 'Pengajuan surat tidak ditemukan');
      if (pengajuan[0].status !== 'diajukan') throw new AppError(400, 'Hanya pengajuan dengan status diajukan yang dapat dihapus');

      if (req.user?.role === Role.MAHASISWA) {
        const { rows: mhs } = await query(
          `SELECT id FROM ${s}.mahasiswa WHERE user_id = $1`,
          [req.user.id]
        );
        if (mhs.length === 0 || mhs[0].id !== pengajuan[0].mahasiswa_id) {
          throw new AppError(403, 'Anda tidak berhak menghapus pengajuan ini');
        }
      }

      const { rowCount } = await query(
        `DELETE FROM ${s}.surat_pengajuan WHERE id = $1`,
        [req.params.id]
      );
      if (rowCount === 0) throw new AppError(404, 'Pengajuan surat tidak ditemukan');
      sendSuccess(res, null, 'Pengajuan surat berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
