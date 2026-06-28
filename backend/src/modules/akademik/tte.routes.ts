import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { Role } from '../../types/enums.js';
import { sendSuccess } from '../../middleware/response.js';
import * as tteService from '../../services/tte.service.js';

const router = Router();

router.post('/keys/generate', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tteService.ensureUserKeys(req);
    sendSuccess(res, { id: result.id, public_key: result.publicKey.substring(0, 60) + '...' });
  } catch (err) { next(err); }
});

router.get('/keys', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keys = await tteService.getUserKeys(req);
    sendSuccess(res, keys);
  } catch (err) { next(err); }
});

router.post('/sign', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tteService.signDocument(req, req.body);
    sendSuccess(res, result, 'Dokumen berhasil ditandatangani');
  } catch (err) { next(err); }
});

router.post('/verify', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tteService.verifyDocument(req, req.body);
    sendSuccess(res, result);
  } catch (err) { next(err); }
});

router.get('/signatures/:documentType/:documentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sigs = await tteService.getSignaturesForDocument(req, req.params.documentId, req.params.documentType);
    sendSuccess(res, sigs);
  } catch (err) { next(err); }
});

router.post('/revoke/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tteService.revokeSignature(req, req.params.id, req.body.alasan);
    sendSuccess(res, result, 'Tanda tangan berhasil dicabut');
  } catch (err) { next(err); }
});

export default router;
