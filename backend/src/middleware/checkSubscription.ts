import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

export function requireActiveSubscription(req: Request, _res: Response, next: NextFunction): void {
  if (!req.tenant) {
    return next(new AppError(400, 'Tenant tidak terdeteksi'));
  }

  if (req.tenant.subscriptionExpired) {
    return next(new AppError(402, 'Masa langganan telah habis. Silakan perpanjang langganan.'));
  }

  next();
}
