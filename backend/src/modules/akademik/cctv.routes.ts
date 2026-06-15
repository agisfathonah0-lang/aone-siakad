import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { query } from '../../config/database.js';

const router = Router();

router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
      const { rows } = await query(
        'SELECT id, name, location, rtsp_url, snapshot_url, status, created_at FROM public.cctv_cameras WHERE tenant_id = $1 ORDER BY created_at DESC',
        [req.tenant.id]
      );
      sendSuccess(res, rows);
    } catch (err) { next(err); }
  }
);

router.get(
  '/:id/snapshot',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
      const { rows } = await query(
        'SELECT snapshot_url FROM public.cctv_cameras WHERE id = $1 AND tenant_id = $2',
        [req.params.id, req.tenant.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Kamera tidak ditemukan');
      if (!rows[0].snapshot_url) throw new AppError(404, 'Snapshot URL tidak tersedia');

      try {
        const img = await fetch(rows[0].snapshot_url, { signal: AbortSignal.timeout(5000) });
        const buffer = Buffer.from(await img.arrayBuffer());
        res.set('Content-Type', img.headers.get('content-type') || 'image/jpeg');
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(buffer);
      } catch {
        throw new AppError(502, 'Gagal mengambil snapshot dari kamera');
      }
    } catch (err) { next(err); }
  }
);

export default router;
