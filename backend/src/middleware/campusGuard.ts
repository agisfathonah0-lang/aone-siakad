import { authenticate } from './auth.js';
import { requireTenantAccess } from './requireTenantAccess.js';
import { requireActiveSubscription } from './checkSubscription.js';
import { Request, Response, NextFunction } from 'express';

export function campusGuard(req: Request, res: Response, next: NextFunction): void {
  authenticate(req, res, (err) => {
    if (err) return next(err);
    requireTenantAccess(req, res, (err) => {
      if (err) return next(err);
      requireActiveSubscription(req, res, next);
    });
  });
}
