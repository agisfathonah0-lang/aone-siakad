import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

export function requireTenantAccess(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role.startsWith('vendor_')) {
    return next(new AppError(403, 'Akun vendor tidak memiliki akses ke halaman kampus'));
  }

  if (!req.tenant) {
    return next(new AppError(400, 'Tenant tidak terdeteksi'));
  }

  if (req.user?.tenantId !== req.tenant.id) {
    return next(new AppError(403, 'Anda tidak memiliki akses ke data kampus ini'));
  }

  next();
}
