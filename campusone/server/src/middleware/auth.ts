import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'aone-siakad-demo-secret-2026';
const TOKEN_ALGO = 'sha256';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  nim_nip?: string;
  prodi?: string;
}

interface TokenPayload {
  u: string; // user id
  r: string; // role
  t: number; // issued at
  s: string; // signature
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function signToken(user: AuthenticatedUser): string {
  const header = { alg: 'HS256', typ: 'AONE' };
  const payload = { id: user.id, role: user.role, iat: Date.now() };
  const data = Buffer.from(JSON.stringify(header)).toString('base64url') + '.' + Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac(TOKEN_ALGO, TOKEN_SECRET).update(data).digest('base64url');
  return data + '.' + sig;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const token = auth.slice(7);
  const parts = token.split('.');
  if (parts.length !== 3) {
    res.status(401).json({ error: 'Invalid token format' });
    return;
  }
  const data = parts[0] + '.' + parts[1];
  const expectedSig = crypto.createHmac(TOKEN_ALGO, TOKEN_SECRET).update(data).digest('base64url');
  if (expectedSig.length !== parts[2].length || !crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(parts[2]))) {
    res.status(401).json({ error: 'Invalid token signature' });
    return;
  }
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    req.user = { id: payload.id, role: payload.role, name: '', email: '' };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token payload' });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) { next(); return; }
  const token = auth.slice(7);
  const parts = token.split('.');
  if (parts.length !== 3) { next(); return; }
  const data = parts[0] + '.' + parts[1];
  const expectedSig = crypto.createHmac(TOKEN_ALGO, TOKEN_SECRET).update(data).digest('base64url');
  if (expectedSig.length !== parts[2].length || !crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(parts[2]))) { next(); return; }
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    req.user = { id: payload.id, role: payload.role, name: '', email: '' };
  } catch { /* ignore */ }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden', message: 'Anda tidak memiliki akses ke resource ini' });
      return;
    }
    next();
  };
}
