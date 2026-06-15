import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/tickets', requireRole('SUPER_ADMIN'), (_req: Request, res: Response) => {
  const db = getDb();
  const tickets = db.prepare('SELECT * FROM tickets').all();
  res.json(tickets);
});

router.get('/audit-logs', requireRole('SUPER_ADMIN'), (_req: Request, res: Response) => {
  const db = getDb();
  const logs = db.prepare("SELECT * FROM sync_logs WHERE type IN ('Mahasiswa', 'Dosen', 'KRS', 'Nilai') ORDER BY timestamp DESC LIMIT 20").all();
  res.json(logs);
});

router.get('/campus-stats', requireRole('SUPER_ADMIN'), (_req: Request, res: Response) => {
  const db = getDb();
  const campuses = db.prepare('SELECT * FROM campuses').all() as any[];
  const result = campuses.map(c => {
    const studentCount = (db.prepare('SELECT COUNT(*) as count FROM students WHERE prodi LIKE ?').all('%' + c.code + '%') as any[])[0]?.count || 0;
    const lecturerCount = (db.prepare('SELECT COUNT(*) as count FROM lecturers WHERE email LIKE ?').all('%@' + c.code + '%') as any[])[0]?.count || 0;
    const userCount = (db.prepare('SELECT COUNT(*) as count FROM users WHERE email LIKE ?').all('%@' + c.code + '%') as any[])[0]?.count || 0;
    const webRows = db.prepare('SELECT setting_key, setting_value FROM campus_web_settings WHERE campus_id = ?').all(c.id) as any[];
    const webSettings: Record<string, string> = {};
    webRows.forEach((r: any) => { webSettings[r.setting_key] = r.setting_value; });
    return {
      ...c,
      webSettings,
      _studentCount: studentCount,
      _lecturerCount: lecturerCount,
      _userCount: userCount,
      webUrl: c.subdomain ? `http://${c.subdomain}.localhost:3000` : null,
    };
  });
  res.json(result);
});

export default router;
