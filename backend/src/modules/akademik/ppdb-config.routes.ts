import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';

const router = Router();

const DEFAULT_STEPS = [
  {
    title: 'Data Pribadi',
    fields: [
      { key: 'nama', label: 'Nama Lengkap', type: 'text', required: true, placeholder: 'Masukkan nama lengkap', order: 1 },
      { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'contoh@email.com', order: 2 },
      { key: 'no_hp', label: 'No. HP', type: 'tel', required: true, placeholder: '08xxxxxxxxxx', order: 3 },
      { key: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', required: false, placeholder: '', order: 4 },
      { key: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', required: false, placeholder: '', order: 5 },
      { key: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', required: false, options: [{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }], order: 6 },
      { key: 'alamat', label: 'Alamat', type: 'textarea', required: false, placeholder: '', order: 7 },
      { key: 'asal_sekolah', label: 'Asal Sekolah', type: 'text', required: false, placeholder: 'Nama SMA/SMK sederajat', order: 8 },
    ],
  },
  {
    title: 'Pilihan Program Studi',
    fields: [
      { key: 'program_studi_id', label: 'Program Studi', type: 'prodi', required: true, order: 1 },
    ],
  },
];

const DEFAULT_APPEARANCE = {
  bannerImage: '',
  formColor: '#22c55e',
  accentColor: '#6366f1',
  showTimeline: true,
  customCSS: '',
};

router.get(
  '/',
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
      const { rows } = await query(
        'SELECT value FROM public.tenant_settings WHERE tenant_id = $1 AND key = $2',
        [req.tenant.id, 'ppdb_form_config']
      );
      if (rows.length > 0) {
        return sendSuccess(_res, rows[0].value);
      }
      sendSuccess(_res, { steps: DEFAULT_STEPS, appearance: DEFAULT_APPEARANCE });
    } catch (err) { next(err); }
  }
);

router.put(
  '/',
  authenticate,
  requireRole(Role.ADMIN),
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
      const { steps, appearance } = req.body;
      if (!steps || !Array.isArray(steps)) throw new AppError(400, 'Format config tidak valid');

      await query(
        `INSERT INTO public.tenant_settings (tenant_id, key, value, updated_at)
         VALUES ($1, 'ppdb_form_config', $2, NOW())
         ON CONFLICT (tenant_id, key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [req.tenant.id, JSON.stringify({ steps, appearance: appearance || DEFAULT_APPEARANCE })]
      );

      sendSuccess(_res, { steps, appearance: appearance || DEFAULT_APPEARANCE }, 'Konfigurasi PPDB disimpan');
    } catch (err) { next(err); }
  }
);

export default router;
