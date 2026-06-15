import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { config } from '../config/index.js';
import { query } from '../config/database.js';
import { JwtPayload } from '../types/index.js';

function getSecret(role: string): string {
  return role.startsWith('vendor_') ? config.jwt.vendorSecret : config.jwt.campusSecret;
}

export function signAccessToken(payload: {
  sub: string;
  email: string;
  role: string;
  tenantId: string | null;
  vendorUserId?: string;
}): string {
  const opts: SignOptions = { expiresIn: config.jwt.accessExpires as any };
  return jwt.sign(
    { ...payload, type: 'access' } as JwtPayload,
    getSecret(payload.role),
    opts
  );
}

export function signRefreshToken(payload: {
  sub: string;
  email: string;
  role: string;
  tenantId: string | null;
  vendorUserId?: string;
}): string {
  const opts: SignOptions = { expiresIn: config.jwt.refreshExpires as any };
  return jwt.sign(
    { ...payload, type: 'refresh' } as JwtPayload,
    getSecret(payload.role),
    opts
  );
}

export async function storeRefreshToken(
  userId: string,
  token: string,
  tenantId: string | null
): Promise<void> {
  const tokenHash = await bcrypt.hash(token, 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await query(
    `INSERT INTO public.refresh_tokens (id, user_id, tenant_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [uuid(), userId, tenantId, tokenHash, expiresAt]
  );
}

export async function verifyRefreshToken(
  userId: string,
  token: string
): Promise<boolean> {
  const { rows } = await query(
    `SELECT token_hash FROM public.refresh_tokens
     WHERE user_id = $1 AND revoked = false AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  if (rows.length === 0) return false;
  return bcrypt.compare(token, rows[0].token_hash);
}

export async function revokeRefreshTokens(userId: string): Promise<void> {
  await query(
    'UPDATE public.refresh_tokens SET revoked = true WHERE user_id = $1',
    [userId]
  );
}

export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
