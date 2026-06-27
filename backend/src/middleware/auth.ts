import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from './errorHandler.js';
import { JwtPayload } from '../types/index.js';

function getSecret(role: string): string {
  return role.startsWith('vendor_') ? config.jwt.vendorSecret : config.jwt.campusSecret;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError(401, 'Token tidak tersedia');
    }

    const token = header.split(' ')[1];
    let payload: JwtPayload | null = null;

    for (const secret of [config.jwt.campusSecret, config.jwt.vendorSecret]) {
      try {
        payload = jwt.verify(token, secret) as JwtPayload;
        break;
      } catch {
        continue;
      }
    }

    if (!payload) {
      throw new AppError(401, 'Token tidak valid');
    }

    if (payload.type !== 'access') {
      throw new AppError(401, 'Token tidak valid untuk akses ini');
    }

    const allRoles = payload.roles?.filter(Boolean) as string[] | undefined;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role as any,
      roles: allRoles?.length ? (allRoles as any) : [payload.role] as any,
      tenantId: payload.tenantId,
      vendorUserId: payload.vendorUserId,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'Token sudah kedaluwarsa'));
    } else if (err instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Token tidak valid'));
    } else {
      next(err);
    }
  }
}

export function authenticateVendor(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError(401, 'Token tidak tersedia');
    }

    const token = header.split(' ')[1];
    const payload = jwt.verify(token, config.jwt.vendorSecret) as JwtPayload;

    if (payload.type !== 'access' || !payload.role.startsWith('vendor_')) {
      throw new AppError(401, 'Token vendor tidak valid');
    }

    const allRoles = payload.roles?.filter(Boolean) as string[] | undefined;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role as any,
      roles: allRoles?.length ? (allRoles as any) : [payload.role] as any,
      tenantId: null,
      vendorUserId: payload.vendorUserId,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'Token sudah kedaluwarsa'));
    } else {
      next(new AppError(401, 'Token vendor tidak valid'));
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return next();
    }

    const token = header.split(' ')[1];
    let payload: JwtPayload | null = null;

    for (const secret of [config.jwt.campusSecret, config.jwt.vendorSecret]) {
      try {
        payload = jwt.verify(token, secret) as JwtPayload;
        break;
      } catch {
        continue;
      }
    }

    if (payload && payload.type === 'access') {
      const allRoles = payload.roles?.filter(Boolean) as string[] | undefined;
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role as any,
        roles: allRoles?.length ? (allRoles as any) : [payload.role] as any,
        tenantId: payload.tenantId,
        vendorUserId: payload.vendorUserId,
      };
    }

    next();
  } catch {
    next();
  }
}
