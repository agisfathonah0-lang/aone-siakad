import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { query } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess, sendError } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { validate } from '../../middleware/validator.js';
import { Role } from '../../types/enums.js';

const router = Router();

router.get('/', authenticate, requireRole(Role.ADMIN, Role.AKADEMIK), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');

    const { rows } = await query('SELECT value FROM public.tenant_settings WHERE tenant_id = $1 AND key = $2', [req.tenant.id, 'landing_page']);

    const defaults = {
      active: false,
      seoTitle: req.tenant.name,
      seoDescription: `Portal Akademik ${req.tenant.name}`,
      heroTitle: `Selamat Datang di ${req.tenant.name}`,
      heroSubtitle: `Sistem Informasi Akademik Terpadu`,
      showBerita: true,
      showPPDB: true,
      showProdi: true,
      showStruktur: true,
      showPrestasi: true,
      showPromosi: true,
      showPopUp: false,
      primaryColor: '#10b981',
      heroImages: [],
      sambutan: { active: false, title: 'Sambutan', content: '', nama: '', jabatan: '', image: '' },
      prestasi: [
        { icon: 'Award', title: 'Akreditasi Institusi', desc: 'Terakreditasi BAN-PT' },
        { icon: 'Users', title: 'Dosen Profesional', desc: 'Tenaga pengajar berkualitas' },
        { icon: 'BookOpen', title: 'Kurikulum OBE', desc: 'Berbasis Outcome-Based Education' },
      ],
      promosi: [],
      strukturOrganisasi: [],
      popUp: { active: false, title: '', content: '', image: '', buttonText: 'Tutup', buttonLink: '' },
      tahunAkademik: '2025/2026',
    };

    let landingPage = defaults;
    if (rows.length > 0) {
      try {
        const saved = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
        landingPage = { ...defaults, ...saved };
      } catch { /* use defaults */ }
    }

    const landingPageUrl = `${req.tenant.slug}.aone-siakad.com`;

    sendSuccess(res, { landingPage, landingPageUrl });
  } catch (err) { next(err); }
});

router.put('/', authenticate, requireRole(Role.ADMIN), [
  body('landingPage').isObject().withMessage('Data landing page wajib dikirim'),
  validate,
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');

    await query(
      `INSERT INTO public.tenant_settings (tenant_id, key, value, updated_at)
       VALUES ($1, 'landing_page', $2, NOW())
       ON CONFLICT (tenant_id, key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [req.tenant.id, JSON.stringify(req.body.landingPage)]
    );

    sendSuccess(res, null, 'Landing page berhasil disimpan');
  } catch (err) { next(err); }
});

export default router;
