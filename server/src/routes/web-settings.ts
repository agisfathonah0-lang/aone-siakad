import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT setting_key, setting_value, updated_at FROM web_settings ORDER BY id').all() as any[];
  const settings: Record<string, string> = {};
  rows.forEach((r: any) => { settings[r.setting_key] = r.setting_value; });
  res.json(settings);
});

router.put('/', requireRole('SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const updates = req.body as Record<string, string>;
  const now = new Date().toISOString();
  const stmt = db.prepare('UPDATE web_settings SET setting_value = ?, updated_at = ? WHERE setting_key = ?');
  const insertStmt = db.prepare('INSERT OR IGNORE INTO web_settings (id, setting_key, setting_value, updated_at) VALUES (?, ?, ?, ?)');
  Object.entries(updates).forEach(([key, value]) => {
    const result = stmt.run(value, now, key);
    if (result.changes === 0) {
      insertStmt.run('WS' + Date.now().toString().slice(-4), key, value, now);
    }
  });
  const rows = db.prepare('SELECT setting_key, setting_value FROM web_settings ORDER BY id').all() as any[];
  const settings: Record<string, string> = {};
  rows.forEach((r: any) => { settings[r.setting_key] = r.setting_value; });
  res.json({ success: true, settings });
});

export default router;
