import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const campuses = db.prepare('SELECT * FROM campuses').all() as any[];
  const result = campuses.map(c => {
    const webRows = db.prepare('SELECT setting_key, setting_value FROM campus_web_settings WHERE campus_id = ?').all(c.id) as any[];
    const webSettings: Record<string, string> = {};
    webRows.forEach((r: any) => { webSettings[r.setting_key] = r.setting_value; });
    return { ...c, webSettings };
  });
  res.json(result);
});

router.get('/by-subdomain/:subdomain', (req: Request, res: Response) => {
  const db = getDb();
  const campus = db.prepare('SELECT * FROM campuses WHERE subdomain = ?').get(req.params.subdomain) as any;
  if (!campus) { res.status(404).json({ error: 'Not found' }); return; }
  const webRows = db.prepare('SELECT setting_key, setting_value FROM campus_web_settings WHERE campus_id = ?').all(campus.id) as any[];
  const webSettings: Record<string, string> = {};
  webRows.forEach((r: any) => { webSettings[r.setting_key] = r.setting_value; });
  res.json({ ...campus, webSettings });
});

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const campus = db.prepare('SELECT * FROM campuses WHERE id = ?').get(req.params.id) as any;
  if (!campus) { res.status(404).json({ error: 'Not found' }); return; }
  const webRows = db.prepare('SELECT setting_key, setting_value FROM campus_web_settings WHERE campus_id = ?').all(campus.id) as any[];
  const webSettings: Record<string, string> = {};
  webRows.forEach((r: any) => { webSettings[r.setting_key] = r.setting_value; });
  res.json({ ...campus, webSettings });
});

router.put('/:id', requireRole('SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const { name, code, status, package: pkg, expiresAt, students, lecturers, programs, location, logo, subdomain } = req.body;
  const fields: string[] = [];
  const values: any[] = [];
  if (name !== undefined) { fields.push('name=?'); values.push(name); }
  if (code !== undefined) { fields.push('code=?'); values.push(code); }
  if (status !== undefined) { fields.push('status=?'); values.push(status); }
  if (pkg !== undefined) { fields.push('package=?'); values.push(pkg); }
  if (expiresAt !== undefined) { fields.push('expiresAt=?'); values.push(expiresAt); }
  if (students !== undefined) { fields.push('students=?'); values.push(students); }
  if (lecturers !== undefined) { fields.push('lecturers=?'); values.push(lecturers); }
  if (programs !== undefined) { fields.push('programs=?'); values.push(programs); }
  if (location !== undefined) { fields.push('location=?'); values.push(location); }
  if (logo !== undefined) { fields.push('logo=?'); values.push(logo); }
  if (subdomain !== undefined) { fields.push('subdomain=?'); values.push(subdomain); }
  if (fields.length === 0) { res.status(400).json({ error: 'No fields' }); return; }
  values.push(req.params.id);
  db.prepare(`UPDATE campuses SET ${fields.join(',')} WHERE id=?`).run(...values);
  const updated = db.prepare('SELECT * FROM campuses WHERE id=?').get(req.params.id) as any;
  const webRows = db.prepare('SELECT setting_key, setting_value FROM campus_web_settings WHERE campus_id = ?').all(updated.id) as any[];
  const webSettings: Record<string, string> = {};
  webRows.forEach((r: any) => { webSettings[r.setting_key] = r.setting_value; });
  res.json({ success: true, campus: { ...updated, webSettings } });
});

// Per-campus web settings
router.get('/:id/web-settings', (req: Request, res: Response) => {
  const db = getDb();
  const campus = db.prepare('SELECT id FROM campuses WHERE id = ?').get(req.params.id);
  if (!campus) { res.status(404).json({ error: 'Not found' }); return; }
  const rows = db.prepare('SELECT setting_key, setting_value FROM campus_web_settings WHERE campus_id = ?').all(req.params.id) as any[];
  const settings: Record<string, string> = {};
  rows.forEach((r: any) => { settings[r.setting_key] = r.setting_value; });
  res.json(settings);
});

router.put('/:id/web-settings', requireRole('SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const campus = db.prepare('SELECT id FROM campuses WHERE id = ?').get(req.params.id);
  if (!campus) { res.status(404).json({ error: 'Not found' }); return; }
  const updates = req.body as Record<string, string>;
  const now = new Date().toISOString();
  const stmt = db.prepare('UPDATE campus_web_settings SET setting_value = ?, updated_at = ? WHERE campus_id = ? AND setting_key = ?');
  const insertStmt = db.prepare('INSERT OR IGNORE INTO campus_web_settings (campus_id, setting_key, setting_value, updated_at) VALUES (?, ?, ?, ?)');
  Object.entries(updates).forEach(([key, value]) => {
    const result = stmt.run(value, now, req.params.id, key);
    if (result.changes === 0) {
      insertStmt.run(req.params.id, key, value, now);
    }
  });
  const rows = db.prepare('SELECT setting_key, setting_value FROM campus_web_settings WHERE campus_id = ?').all(req.params.id) as any[];
  const settings: Record<string, string> = {};
  rows.forEach((r: any) => { settings[r.setting_key] = r.setting_value; });
  res.json({ success: true, settings });
});

export default router;
