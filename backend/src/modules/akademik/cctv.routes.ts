import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import { authenticate } from '../../middleware/auth.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { query } from '../../config/database.js';
import { isFfmpegAvailable, startStream, stopStream, getStreamStatus, getStreamFilePath } from './stream.service.js';

const router = Router();

// Camera list
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
      const ffmpeg = isFfmpegAvailable();
      sendSuccess(res, rows.map((r: any) => ({ ...r, stream_supported: ffmpeg })));
    } catch (err) { next(err); }
  }
);

// Snapshot proxy
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

// Start stream
router.post(
  '/:id/stream/start',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.tenant) throw new AppError(400, 'Tenant tidak terdeteksi');
      if (!isFfmpegAvailable()) throw new AppError(400, 'FFmpeg tidak tersedia di server');

      const { rows } = await query(
        'SELECT id, rtsp_url FROM public.cctv_cameras WHERE id = $1 AND tenant_id = $2',
        [req.params.id, req.tenant.id]
      );
      if (rows.length === 0) throw new AppError(404, 'Kamera tidak ditemukan');
      if (!rows[0].rtsp_url) throw new AppError(400, 'RTSP URL tidak tersedia');

      const streamUrl = await startStream(req.params.id, rows[0].rtsp_url);
      sendSuccess(res, { stream_url: streamUrl }, 'Stream dimulai');
    } catch (err) { next(err); }
  }
);

// Stop stream
router.post(
  '/:id/stream/stop',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await stopStream(req.params.id);
      sendSuccess(res, null, 'Stream dihentikan');
    } catch (err) { next(err); }
  }
);

// Stream status
router.get(
  '/:id/stream/status',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = getStreamStatus(req.params.id);
      sendSuccess(res, status);
    } catch (err) { next(err); }
  }
);

// Serve HLS files (no auth — files are ephemeral and random)
router.get(
  '/stream/:cameraId/:file',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filePath = getStreamFilePath(req.params.cameraId, req.params.file);
      if (!filePath) throw new AppError(404, 'File tidak ditemukan');

      const ext = path.extname(req.params.file).toLowerCase();
      const mime: Record<string, string> = {
        '.m3u8': 'application/vnd.apple.mpegurl',
        '.ts': 'video/mp2t',
      };
      res.set('Content-Type', mime[ext] || 'application/octet-stream');
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(filePath);
    } catch (err) { next(err); }
  }
);

export default router;
