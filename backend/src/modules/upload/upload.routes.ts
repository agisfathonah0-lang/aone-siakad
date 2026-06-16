import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { uploadFile } from '../../config/storage.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { AppError } from '../../middleware/errorHandler.js';
import { sendSuccess } from '../../middleware/response.js';
import { Role } from '../../types/enums.js';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
  'application/zip', 'application/x-rar-compressed',
];

const MAX_SIZE = 20 * 1024 * 1024;

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipe file ${file.mimetype} tidak diizinkan`));
    }
  },
});

const router = Router();

router.post(
  '/',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KEUANGAN, Role.DOSEN, Role.MAHASISWA, Role.ALUMNI, Role.PUSTAKAWAN),
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError(400, 'File wajib diupload');
      }

      const ext = path.extname(req.file.originalname);
      const key = `uploads/${uuid()}${ext}`;

      const url = await uploadFile(req.file.buffer, key, req.file.mimetype);

      sendSuccess(res, { url, key, name: req.file.originalname, size: req.file.size, mime: req.file.mimetype }, 'File berhasil diupload');
    } catch (err) {
      if (err instanceof multer.MulterError) {
        return next(new AppError(400, `Upload error: ${err.message}`));
      }
      next(err);
    }
  },
);

router.post(
  '/multiple',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KEUANGAN, Role.DOSEN, Role.MAHASISWA, Role.ALUMNI, Role.PUSTAKAWAN),
  upload.array('files', 10),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new AppError(400, 'Minimal 1 file wajib diupload');
      }

      const results = await Promise.all(
        files.map(async (file) => {
          const ext = path.extname(file.originalname);
          const key = `uploads/${uuid()}${ext}`;
          const url = await uploadFile(file.buffer, key, file.mimetype);
          return { url, key, name: file.originalname, size: file.size, mime: file.mimetype };
        }),
      );

      sendSuccess(res, { files: results }, `${results.length} file berhasil diupload`);
    } catch (err) {
      if (err instanceof multer.MulterError) {
        return next(new AppError(400, `Upload error: ${err.message}`));
      }
      next(err);
    }
  },
);

router.post(
  '/image',
  authenticate,
  requireRole(Role.ADMIN, Role.AKADEMIK, Role.KEUANGAN, Role.DOSEN, Role.MAHASISWA, Role.ALUMNI, Role.PUSTAKAWAN),
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError(400, 'Gambar wajib diupload');
      }

      if (!req.file.mimetype.startsWith('image/')) {
        throw new AppError(400, 'File harus berupa gambar');
      }

      const ext = path.extname(req.file.originalname);
      const key = `images/${uuid()}${ext}`;

      const url = await uploadFile(req.file.buffer, key, req.file.mimetype);

      sendSuccess(res, { url, key, name: req.file.originalname, size: req.file.size }, 'Gambar berhasil diupload');
    } catch (err) {
      if (err instanceof multer.MulterError) {
        return next(new AppError(400, `Upload error: ${err.message}`));
      }
      next(err);
    }
  },
);

export default router;
