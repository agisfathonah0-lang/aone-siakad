import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/logs', (_req: Request, res: Response) => {
  const db = getDb();
  const { type, severity, limit } = _req.query;
  let query = 'SELECT * FROM firewall_logs WHERE 1=1';
  const params: any[] = [];
  if (type) { query += ' AND type = ?'; params.push(type); }
  if (severity) { query += ' AND severity = ?'; params.push(severity); }
  query += ' ORDER BY timestamp DESC';
  if (limit) query += ' LIMIT ?';
  const rows = db.prepare(query).all(...params, ...(limit ? [Number(limit)] : []));
  res.json(rows);
});

router.get('/stats', (_req: Request, res: Response) => {
  const db = getDb();
  const totalAttacks = db.prepare('SELECT COUNT(*) as c FROM firewall_logs').get() as any;
  const blockedToday = db.prepare("SELECT COUNT(*) as c FROM firewall_logs WHERE date(timestamp) = date('now') AND status = 'BLOCKED'").get() as any;
  const mitigatedToday = db.prepare("SELECT COUNT(*) as c FROM firewall_logs WHERE date(timestamp) = date('now') AND status = 'MITIGATED'").get() as any;
  const activeBlocks = db.prepare("SELECT COUNT(*) as c FROM blocked_ips WHERE status = 'ACTIVE'").get() as any;
  const byType = db.prepare('SELECT type, COUNT(*) as count FROM firewall_logs GROUP BY type ORDER BY count DESC').all();
  const bySeverity = db.prepare('SELECT severity, COUNT(*) as count FROM firewall_logs GROUP BY severity ORDER BY CASE severity WHEN \'CRITICAL\' THEN 0 WHEN \'HIGH\' THEN 1 WHEN \'MEDIUM\' THEN 2 WHEN \'LOW\' THEN 3 END').all();
  const recentLogs = db.prepare('SELECT * FROM firewall_logs ORDER BY timestamp DESC LIMIT 5').all();
  res.json({
    totalAttacks: totalAttacks.c,
    blockedToday: blockedToday.c,
    mitigatedToday: mitigatedToday.c,
    activeBlocks: activeBlocks.c,
    byType,
    bySeverity,
    recentLogs,
  });
});

router.get('/blocked-ips', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM blocked_ips WHERE status = 'ACTIVE' ORDER BY blockedAt DESC").all();
  res.json(rows);
});

router.post('/block-ip', requireRole('SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const { ip, reason, expiresAt } = req.body;
  if (!ip) { res.status(400).json({ error: 'IP wajib diisi' }); return; }
  const id = 'BIP' + Date.now().toString().slice(-4);
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  try {
    db.prepare('INSERT INTO blocked_ips (id, ip, reason, blockedAt, blockedBy, expiresAt, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, ip, reason || 'Manual block by admin', now, 'Super Admin', expiresAt || null, 'ACTIVE');
    res.json({ success: true, message: `IP ${ip} berhasil diblokir`, id });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      res.status(400).json({ error: 'IP sudah diblokir' });
    } else { throw e; }
  }
});

router.post('/unblock-ip', requireRole('SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const { ip } = req.body;
  if (!ip) { res.status(400).json({ error: 'IP wajib diisi' }); return; }
  db.prepare("UPDATE blocked_ips SET status = 'EXPIRED' WHERE ip = ?").run(ip);
  res.json({ success: true, message: `IP ${ip} berhasil dibuka` });
});

export default router;
