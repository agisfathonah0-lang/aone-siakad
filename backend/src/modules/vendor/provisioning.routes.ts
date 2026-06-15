import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middleware/validator.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { createTenant, deleteTenant } from '../../services/provisioning.js';
import { query } from '../../config/database.js';
import { Role } from '../../types/enums.js';
import { addAuditLog } from './audit.routes.js';

const router = Router();

router.get(
  '/tenants',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = await query('SELECT id, slug, name, nama_pt, singkatan, paket, is_active, logo_url, alamat, telepon, email, website, custom_domain, subscription_end_date, created_at FROM public.tenants ORDER BY created_at DESC');
      const result = await Promise.all(rows.map(async (t: any) => {
        try {
          const [{ rows: mhs }] = await Promise.all([query(`SELECT COUNT(*) as c FROM "${t.schema_name}".mahasiswa`)]);
          return { ...t, _studentCount: parseInt(mhs[0].c) };
        } catch { return { ...t, _studentCount: 0 }; }
      }));
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }
);

router.get(
  '/tenants/:id',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = await query('SELECT * FROM public.tenants WHERE id = $1', [req.params.id]);
      if (rows.length === 0) throw new AppError(404, 'Tenant tidak ditemukan');
      const t = rows[0];
      let stats = { studentCount: 0, lecturerCount: 0, userCount: 0, prodiCount: 0 };
      try {
        const s = `"${t.schema_name}"`;
        const [{ rows: mhs }, { rows: dosen }, { rows: users }, { rows: prodi }] = await Promise.all([
          query(`SELECT COUNT(*) as c FROM ${s}.mahasiswa`),
          query(`SELECT COUNT(*) as c FROM ${s}.dosen`),
          query(`SELECT COUNT(*) as c FROM ${s}.users`),
          query(`SELECT COUNT(*) as c FROM ${s}.program_studi`),
        ]);
        stats = { studentCount: parseInt(mhs[0].c), lecturerCount: parseInt(dosen[0].c), userCount: parseInt(users[0].c), prodiCount: parseInt(prodi[0].c) };
      } catch {}
      sendSuccess(res, { ...t, stats });
    } catch (err) { next(err); }
  }
);

router.post(
  '/tenants',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  [
    body('slug').matches(/^[a-z0-9-]+$/).withMessage('Slug hanya boleh huruf kecil, angka, dan strip'),
    body('name').notEmpty().withMessage('Nama tenant wajib diisi'),
    body('nama_pt').notEmpty().withMessage('Nama PT wajib diisi'),
    body('adminEmail').isEmail().withMessage('Email admin tidak valid'),
    body('adminPassword').isLength({ min: 8 }).withMessage('Password admin minimal 8 karakter'),
    body('adminNama').notEmpty().withMessage('Nama admin wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenant = await createTenant(req.body);
      addAuditLog('Tenant Created', req.user?.email || 'system', `Tenant "${req.body.name}" (${req.body.slug}) created`);
      sendSuccess(res, tenant, 'Tenant berhasil dibuat', 201);
    } catch (err: any) {
      next(new AppError(400, err.message));
    }
  }
);

router.put(
  '/tenants/:id',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  [
    body('name').optional().notEmpty(),
    body('nama_pt').optional().notEmpty(),
    body('slug').optional().matches(/^[a-z0-9-]+$/).withMessage('Slug hanya boleh huruf kecil, angka, dan strip'),
    body('singkatan').optional(),
    body('paket').optional().isIn(['basic', 'pro', 'enterprise']),
    body('is_active').optional().isBoolean(),
    body('alamat').optional(),
    body('telepon').optional(),
    body('email').optional().isEmail(),
    body('website').optional(),
    body('logo_url').optional(),
    body('custom_domain').optional(),
    body('subscription_end_date').optional().isString(),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fields = ['name', 'nama_pt', 'slug', 'singkatan', 'paket', 'is_active', 'alamat', 'telepon', 'email', 'website', 'logo_url', 'custom_domain', 'subscription_end_date'];

      if (req.body.slug !== undefined) {
        const { rows: existing } = await query(
          'SELECT id FROM public.tenants WHERE slug = $1 AND id != $2',
          [req.body.slug, req.params.id]
        );
        if (existing.length > 0) throw new AppError(400, `Slug "${req.body.slug}" sudah digunakan tenant lain`);
      }
      const sets: string[] = [];
      const params: any[] = [];
      fields.forEach(f => {
        if (req.body[f] !== undefined) {
          sets.push(`${f} = $${params.length + 1}`);
          params.push(req.body[f]);
        }
      });
      if (sets.length === 0) throw new AppError(400, 'Tidak ada field yang diupdate');
      sets.push('updated_at = NOW()');
      params.push(req.params.id);
      const { rows } = await query(`UPDATE public.tenants SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
      if (rows.length === 0) throw new AppError(404, 'Tenant tidak ditemukan');
      addAuditLog('Tenant Updated', req.user?.email || 'system', `Tenant "${rows[0].name}" updated`);
      sendSuccess(res, rows[0], 'Tenant berhasil diupdate');
    } catch (err) { next(err); }
  }
);

router.patch(
  '/tenants/:id/toggle',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = await query('UPDATE public.tenants SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING id, slug, is_active', [req.params.id]);
      if (rows.length === 0) throw new AppError(404, 'Tenant tidak ditemukan');
      addAuditLog('Tenant Toggled', req.user?.email || 'system', `Tenant "${rows[0].slug}" ${rows[0].is_active ? 'activated' : 'deactivated'}`);
      sendSuccess(res, rows[0], 'Status tenant diubah');
    } catch (err) { next(err); }
  }
);

router.delete(
  '/tenants/:id',
  authenticate,
  requireRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = await query('SELECT name, slug FROM public.tenants WHERE id = $1', [req.params.id]);
      if (rows.length === 0) throw new AppError(404, 'Tenant tidak ditemukan');
      await deleteTenant(req.params.id);
      addAuditLog('Tenant Deleted', req.user?.email || 'system', `Tenant "${rows[0].name}" (${rows[0].slug}) deleted permanently`);
      sendSuccess(res, null, 'Tenant berhasil dihapus');
    } catch (err: any) {
      next(new AppError(400, err.message || 'Gagal menghapus tenant'));
    }
  }
);

export default router;
