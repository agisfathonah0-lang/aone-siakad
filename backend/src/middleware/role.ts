import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/enums.js';
import { AppError } from './errorHandler.js';

const roleHierarchy: Record<string, number> = {
  [Role.SUPER_ADMIN]: 100,
  [Role.ADMIN]: 80,
  [Role.REKTOR]: 75,
  [Role.DEKAN]: 70,
  [Role.KEUANGAN]: 60,
  [Role.AKADEMIK]: 60,
  [Role.KAPRODI]: 50,
  [Role.DOSEN]: 40,
  [Role.PUSTAKAWAN]: 30,
  [Role.MAHASISWA]: 20,
  [Role.CALON_MAHASISWA]: 10,
  [Role.ALUMNI]: 10,
};

function mapRole(role: string): Role {
  const base = role.replace(/^vendor_/, '');
  return base as Role;
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, 'Harus login terlebih dahulu');
    }

    const allRoles = (req.user.roles?.length ? req.user.roles : [req.user.role]).map(r => mapRole(r as string));

    if (allRoles.includes(Role.SUPER_ADMIN)) {
      return next();
    }

    const hasRole = allRoles.some(r => roles.includes(r));
    if (hasRole) {
      return next();
    }

    const maxUserLevel = Math.max(...allRoles.map(r => roleHierarchy[r] ?? 0));
    const requiredLevel = Math.max(...roles.map((r) => roleHierarchy[r] ?? 0));

    if (maxUserLevel >= requiredLevel) {
      return next();
    }

    throw new AppError(403, 'Anda tidak memiliki akses ke resource ini');
  };
}
