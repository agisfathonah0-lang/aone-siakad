import { authenticate, optionalAuth } from './auth.js';
import { requireTenantAccess } from './requireTenantAccess.js';
import { requireActiveSubscription } from './checkSubscription.js';
import { Request, Response, NextFunction } from 'express';

export function campusGuard(req: Request, res: Response, next: NextFunction): void {
  // Public endpoints skip auth but still need tenant + subscription
  if (req.path.endsWith('/register')) {
    optionalAuth(req, res, () => {
      requireTenantAccess(req, res, () => {
        requireActiveSubscription(req, res, next);
      });
    });
    return;
  }

  authenticate(req, res, (err) => {
    if (err) return next(err);
    requireTenantAccess(req, res, (err) => {
      if (err) return next(err);
      requireActiveSubscription(req, res, next);
    });
  });
}
