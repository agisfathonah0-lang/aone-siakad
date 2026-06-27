import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import bcrypt from 'bcryptjs';
import { query } from '../../config/database.js';
import { config } from '../../config/index.js';
import { validate } from '../../middleware/validator.js';
import { authenticate } from '../../middleware/auth.js';
import { sendSuccess, sendError } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { createTenant } from '../../services/provisioning.js';
import {
  signAccessToken,
  signRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshTokens,
  verifyToken,
} from '../../services/token.js';

const router = Router();

// ─── Public Institution Registration ───
router.post(
  '/vendor/register',
  [
    body('slug').matches(/^[a-z0-9-]+$/).withMessage('Slug hanya boleh huruf kecil, angka, dan strip'),
    body('name').notEmpty().withMessage('Nama institusi wajib diisi'),
    body('nama_pt').notEmpty().withMessage('Nama PT wajib diisi'),
    body('adminEmail').isEmail().withMessage('Email admin tidak valid'),
    body('adminPassword').isLength({ min: 8 }).withMessage('Password admin minimal 8 karakter'),
    body('adminNama').notEmpty().withMessage('Nama admin wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenant = await createTenant({ ...req.body, isActive: false });
      sendSuccess(res, tenant, 'Registrasi berhasil, silakan login', 201);
    } catch (err: any) {
      next(new AppError(400, err.message));
    }
  }
);

// ─── Vendor Login ───
router.post(
  '/vendor/login',
  [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const { rows } = await query(
        'SELECT id, email, password_hash, nama, role FROM public.vendor_users WHERE email = $1 AND is_active = true',
        [email]
      );

      if (rows.length === 0) {
        throw new AppError(401, 'Email atau password salah');
      }

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        throw new AppError(401, 'Email atau password salah');
      }

      await query('UPDATE public.vendor_users SET last_login = NOW() WHERE id = $1', [user.id]);

      const accessToken = signAccessToken({
        sub: user.id,
        email: user.email,
        role: 'vendor_' + user.role,
        tenantId: null,
        vendorUserId: user.id,
      });

      const refreshToken = signRefreshToken({
        sub: user.id,
        email: user.email,
        role: 'vendor_' + user.role,
        tenantId: null,
        vendorUserId: user.id,
      });

      await storeRefreshToken(user.id, refreshToken, null);

      sendSuccess(res, {
        user: { id: user.id, email: user.email, nama: user.nama, role: 'vendor_' + user.role },
        accessToken,
        refreshToken,
      }, 'Login berhasil');
    } catch (err) {
      next(err);
    }
  }
);

// ─── Campus Login ───
router.post(
  '/campus/login',
  [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('tenantSlug').notEmpty().withMessage('Tenant slug wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, tenantSlug } = req.body;

      const { rows: tenantRows } = await query(
        'SELECT id, schema_name FROM public.tenants WHERE slug = $1 AND is_active = true',
        [tenantSlug]
      );

      if (tenantRows.length === 0) {
        throw new AppError(404, 'Kampus tidak ditemukan');
      }

      const tenant = tenantRows[0];
      const { rows: userRows } = await query(
        `SELECT id, email, password_hash, nama, role, roles FROM "${tenant.schema_name}".users
         WHERE email = $1 AND is_active = true`,
        [email]
      );

      if (userRows.length === 0) {
        throw new AppError(401, 'Email atau password salah');
      }

      const user = userRows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        throw new AppError(401, 'Email atau password salah');
      }

      const userRoles = user.roles?.filter(Boolean)?.length ? user.roles : [user.role];

      await query(
        `UPDATE "${tenant.schema_name}".users SET last_login = NOW() WHERE id = $1`,
        [user.id]
      );

      const accessToken = signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        roles: userRoles,
        tenantId: tenant.id,
      });

      const refreshToken = signRefreshToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        roles: userRoles,
        tenantId: tenant.id,
      });

      await storeRefreshToken(user.id, refreshToken, tenant.id);

      sendSuccess(res, {
        user: { id: user.id, email: user.email, nama: user.nama, role: user.role, roles: userRoles },
        tenant: { id: tenant.id, slug: tenantSlug },
        accessToken,
        refreshToken,
      }, 'Login berhasil');
    } catch (err) {
      next(err);
    }
  }
);

// ─── Refresh Token ───
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token wajib diisi'),
    validate,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      let payload;
      try {
        payload = verifyToken(refreshToken, config.jwt.campusSecret);
      } catch {
        payload = verifyToken(refreshToken, config.jwt.vendorSecret);
      }

      if (payload.type !== 'refresh') {
        throw new AppError(401, 'Token tidak valid');
      }

      const isValid = await verifyRefreshToken(payload.sub, refreshToken);
      if (!isValid) {
        throw new AppError(401, 'Refresh token tidak valid atau sudah digunakan');
      }

      await revokeRefreshTokens(payload.sub);

      const newAccessToken = signAccessToken({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
        vendorUserId: payload.vendorUserId,
      });

      const newRefreshToken = signRefreshToken({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
        vendorUserId: payload.vendorUserId,
      });

      await storeRefreshToken(payload.sub, newRefreshToken, payload.tenantId);

      sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
      next(err);
    }
  }
);

// ─── Get Current User ───
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Belum login');
    }

    if (req.user.role.startsWith('vendor_')) {
      const { rows } = await query(
        'SELECT id, email, nama, role FROM public.vendor_users WHERE id = $1',
        [req.user.id]
      );
      if (rows.length === 0) throw new AppError(404, 'User tidak ditemukan');
      const user = rows[0];
      user.role = `vendor_${user.role}`;
      sendSuccess(res, user);
      return;
    }

    if (req.user.tenantId) {
      const { rows: tenantRows } = await query(
        'SELECT schema_name, slug, nama_pt, logo_url FROM public.tenants WHERE id = $1',
        [req.user.tenantId]
      );
      if (tenantRows.length === 0) throw new AppError(404, 'Tenant tidak ditemukan');

      const { rows } = await query(
        `SELECT id, email, nama, role, roles FROM "${tenantRows[0].schema_name}".users WHERE id = $1`,
        [req.user.id]
      );
      if (rows.length === 0) throw new AppError(404, 'User tidak ditemukan');
      const u = rows[0];
      u.roles = u.roles?.filter(Boolean)?.length ? u.roles : [u.role];
      sendSuccess(res, { ...u, tenantSlug: tenantRows[0].slug, nama_pt: tenantRows[0].nama_pt, logo_url: tenantRows[0].logo_url });
      return;
    }

    throw new AppError(401, 'User context tidak valid');
  } catch (err) {
    next(err);
  }
});

// ─── Update Profile ───
router.put('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.tenantId) {
      throw new AppError(401, 'User context tidak valid');
    }

    const { nama, email, no_hp, foto_url } = req.body;
    const { rows: tRows } = await query('SELECT schema_name FROM public.tenants WHERE id = $1', [req.user.tenantId]);
    if (!tRows.length) throw new AppError(404, 'Tenant tidak ditemukan');
    const s = tRows[0].schema_name;

    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (nama !== undefined) { updates.push(`nama = $${idx++}`); params.push(nama); }
    if (email !== undefined) { updates.push(`email = $${idx++}`); params.push(email); }
    if (no_hp !== undefined) { updates.push(`no_hp = $${idx++}`); params.push(no_hp); }
    if (foto_url !== undefined) { updates.push(`foto_url = $${idx++}`); params.push(foto_url); }

    if (updates.length === 0) {
      throw new AppError(400, 'Tidak ada data yang diupdate');
    }

    updates.push(`updated_at = NOW()`);
    params.push(req.user.id);

    await query(
      `UPDATE "${s}".users SET ${updates.join(', ')} WHERE id = $${idx}`,
      params
    );

    const { rows } = await query(
      `SELECT id, email, nama, role, roles, no_hp, foto_url FROM "${s}".users WHERE id = $1`,
      [req.user.id]
    );

    sendSuccess(res, rows[0], 'Profil berhasil diupdate');
  } catch (err) {
    next(err);
  }
});

// ─── Change Password ───
router.put('/me/password', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.tenantId) {
      throw new AppError(401, 'User context tidak valid');
    }

    const { password_lama, password_baru } = req.body;
    if (!password_lama || !password_baru) {
      throw new AppError(400, 'Password lama dan baru wajib diisi');
    }
    if (password_baru.length < 6) {
      throw new AppError(400, 'Password baru minimal 6 karakter');
    }

    const { rows: tRows } = await query('SELECT schema_name FROM public.tenants WHERE id = $1', [req.user.tenantId]);
    if (!tRows.length) throw new AppError(404, 'Tenant tidak ditemukan');
    const s = tRows[0].schema_name;

    const { rows } = await query(
      `SELECT password_hash FROM "${s}".users WHERE id = $1`,
      [req.user.id]
    );
    if (!rows.length) throw new AppError(404, 'User tidak ditemukan');

    const valid = await bcrypt.compare(password_lama, rows[0].password_hash);
    if (!valid) {
      throw new AppError(400, 'Password lama salah');
    }

    const hash = await bcrypt.hash(password_baru, 12);
    await query(
      `UPDATE "${s}".users SET password_hash = $1, must_change_password = false, updated_at = NOW() WHERE id = $2`,
      [hash, req.user.id]
    );

    sendSuccess(res, null, 'Password berhasil diubah');
  } catch (err) {
    next(err);
  }
});

// ─── Logout ───
router.post('/logout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      await revokeRefreshTokens(req.user.id);
    }
    sendSuccess(res, null, 'Logout berhasil');
  } catch (err) {
    next(err);
  }
});

export default router;
