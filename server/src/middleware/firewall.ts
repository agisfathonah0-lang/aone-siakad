import { Request, Response, NextFunction } from 'express';
import { getDb } from '../database.js';

const SQL_INJECTION = /\b(UNION\b.*\bSELECT|SELECT\b.*\bFROM|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|DROP\s+TABLE|ALTER\s+TABLE|CREATE\s+TABLE|EXEC\b|OR\s+1=1|OR\s+'1'='1'|OR\s+"1"="1"|'\s*OR\s+'|--\s|;\s*$)/i;
const XSS = /(<script|<\/script>|onerror\s*=|onload\s*=|onclick\s*=|onmouseover\s*=|javascript\s*:|alert\s*\(|prompt\s*\(|confirm\s*\()/i;
const PATH_TRAVERSAL = /(\.\.\/|\.\.\\)/i;
const NOSQL_INJECTION = /\$(ne|gt|lt|gte|lte|regex|where|nin|in|exists|eq)\s*[:=]/i;

interface RateEntry {
  count: number;
  resetAt: number;
}

const rateMap = new Map<string, RateEntry>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 100;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (entry.resetAt < now) rateMap.delete(key);
  }
}, 30_000);

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0].trim();
  const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
  return ip === '::1' || ip === '::ffff:127.0.0.1' ? '127.0.0.1' : ip;
}

function scanValue(value: string, type: string): string | null {
  if (typeof value !== 'string') return null;
  if (SQL_INJECTION.test(value)) return 'SQL_INJECTION';
  if (XSS.test(value)) return 'XSS';
  if (PATH_TRAVERSAL.test(value)) return 'MALICIOUS';
  if (NOSQL_INJECTION.test(value)) return 'MALICIOUS';
  return null;
}

function scanObject(obj: any, type: string): string[] {
  const results: string[] = [];
  if (!obj || typeof obj !== 'object') return results;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      const found = scanValue(val, type);
      if (found) results.push(`${found} di ${type}.${key}`);
      const keyFound = scanValue(key, type);
      if (keyFound) results.push(`${keyFound} di ${type} key`);
    } else if (typeof val === 'object' && val !== null) {
      results.push(...scanObject(val, type));
    }
  }
  return results;
}

function isFirewallRoute(path: string): boolean {
  return path.startsWith('/api/firewall') || path === '/api/health';
}

export function firewallMiddleware(req: Request, res: Response, next: NextFunction): void {
  const ip = getClientIp(req);
  const path = req.path;
  const now = Date.now();

  try {
    const db = getDb();

    // 1. Check blocked IPs (applies to ALL routes including firewall)
    const blocked = db.prepare("SELECT * FROM blocked_ips WHERE ip = ? AND status = 'ACTIVE'").get(ip) as any;
    if (blocked) {
      console.log(`[FIREWALL] BLOCKED IP ${ip} mencoba akses ${path} — ditolak`);
      res.status(403).json({
        error: 'Akses ditolak',
        message: 'IP Anda diblokir karena aktivitas mencurigakan',
        blockedAt: blocked.blockedAt,
      });
      return;
    }

    // 2. Rate limiting (applies to ALL routes)
    const nowSec = Math.floor(now / 60_000);
    const rateKey = `${ip}:${nowSec}`;
    const rateEntry = rateMap.get(rateKey);
    if (rateEntry) {
      rateEntry.count++;
      if (rateEntry.count > RATE_LIMIT_MAX) {
        const id = 'FL' + Date.now().toString().slice(-6);
        db.prepare('INSERT INTO firewall_logs (id, timestamp, sourceIp, type, severity, path, userAgent, status, action, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(id, new Date().toISOString().replace('T', ' ').slice(0, 19), ip, 'DDoS', 'CRITICAL', path, req.headers['user-agent'] || '', 'MITIGATED', 'RATE_LIMIT', `Rate limit exceeded - ${rateEntry.count} req/min`);
        console.log(`[FIREWALL] RATE LIMIT ${ip} — ${rateEntry.count} req/menit ke ${path}`);
        res.status(429).json({ error: 'Too Many Requests', message: 'Rate limit terlampaui. Coba lagi nanti.' });
        return;
      }
    } else {
      rateMap.set(rateKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    }

    // 3. Skip content scan for firewall & health routes
    if (isFirewallRoute(path)) {
      next();
      return;
    }

    // 4. Scan query parameters
    const queryFindings = scanObject(req.query, 'query');
    
    // 5. Scan request body
    const bodyFindings = scanObject(req.body, 'body');

    // 6. Scan URL path
    const pathFinding = scanValue(req.originalUrl, 'path');

    const allFindings = [...queryFindings, ...bodyFindings];
    if (pathFinding) allFindings.push(pathFinding);

    if (allFindings.length > 0) {
      const attackType = allFindings[0].split(' ')[0];
      const severity = attackType === 'SQL_INJECTION' ? 'HIGH' : attackType === 'XSS' ? 'MEDIUM' : 'LOW';
      const action = attackType === 'SQL_INJECTION' || attackType === 'MALICIOUS' ? 'BLOCK' : 'CHALLENGE';
      const status = action === 'BLOCK' ? 'BLOCKED' : 'MITIGATED';
      const id = 'FL' + Date.now().toString().slice(-6);

      db.prepare('INSERT INTO firewall_logs (id, timestamp, sourceIp, type, severity, path, userAgent, status, action, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(id, new Date().toISOString().replace('T', ' ').slice(0, 19), ip, attackType, severity, path, req.headers['user-agent'] || '', status, action, allFindings.join('; '));

      console.log(`[FIREWALL] ${status} ${attackType} dari ${ip} ke ${path} — ${allFindings.join(', ')}`);

      if (action === 'BLOCK') {
        res.status(403).json({
          error: 'Permintaan diblokir',
          message: `Deteksi ${attackType.replace('_', ' ')}. Permintaan ditolak untuk keamanan.`,
        });
        return;
      }
    }
  } catch (err) {
    console.error('[FIREWALL] Error:', err);
  }

  next();
}
