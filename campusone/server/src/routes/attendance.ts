import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { nip, date, status } = req.query;
  let query = 'SELECT * FROM lecturer_attendance WHERE 1=1';
  const params: any[] = [];
  if (nip) { query += ' AND lecturerNip = ?'; params.push(nip); }
  if (date) { query += ' AND date = ?'; params.push(date); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  query += ' ORDER BY date DESC, checkIn DESC';
  const records = db.prepare(query).all(...params);
  res.json(records);
});

router.get('/summary', (_req: Request, res: Response) => {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const totalToday = db.prepare('SELECT COUNT(*) as count FROM lecturer_attendance WHERE date = ?').get(today) as any;
  const hadirToday = db.prepare("SELECT COUNT(*) as count FROM lecturer_attendance WHERE date = ? AND status = 'HADIR'").get(today) as any;
  const izinToday = db.prepare("SELECT COUNT(*) as count FROM lecturer_attendance WHERE date = ? AND status = 'IZIN'").get(today) as any;
  const sakitToday = db.prepare("SELECT COUNT(*) as count FROM lecturer_attendance WHERE date = ? AND status = 'SAKIT'").get(today) as any;
  const belumToday = db.prepare("SELECT COUNT(*) as count FROM lecturer_attendance WHERE date = ? AND status = 'BELUM_ABSEN'").get(today) as any;
  const totalDosen = db.prepare('SELECT COUNT(*) as count FROM lecturers').get() as any;
  const avgCheckIn = db.prepare("SELECT time(checkIn) as avgIn FROM lecturer_attendance WHERE status = 'HADIR' AND checkIn IS NOT NULL").all() as any[];

  res.json({
    total: totalDosen.count,
    today: totalToday.count,
    hadir: hadirToday.count,
    izin: izinToday.count,
    sakit: sakitToday.count,
    belumAbsen: belumToday.count,
    persentase: totalToday.count > 0 ? Math.round((hadirToday.count / totalDosen.count) * 100) : 0,
  });
});

router.get('/rekap', (req: Request, res: Response) => {
  const db = getDb();
  const { month } = req.query;
  const monthStr = month as string || new Date().toISOString().slice(0, 7);
  const records = db.prepare(`
    SELECT lecturerNip, lecturerName,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'HADIR' THEN 1 ELSE 0 END) as hadir,
      SUM(CASE WHEN status = 'IZIN' THEN 1 ELSE 0 END) as izin,
      SUM(CASE WHEN status = 'SAKIT' THEN 1 ELSE 0 END) as sakit,
      SUM(CASE WHEN status = 'ALFA' OR status = 'BELUM_ABSEN' THEN 1 ELSE 0 END) as alfa
    FROM lecturer_attendance
    WHERE date LIKE ?
    GROUP BY lecturerNip
    ORDER BY hadir DESC
  `).all(`${monthStr}%`);
  res.json(records);
});

router.post('/checkin', requireRole('DOSEN'), (req: Request, res: Response) => {
  const db = getDb();
  const { nip, name, course, class: cls } = req.body;
  if (!nip || !name) { res.status(400).json({ error: 'NIP dan nama wajib diisi' }); return; }
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toTimeString().slice(0, 5);

  const existing = db.prepare('SELECT * FROM lecturer_attendance WHERE lecturerNip = ? AND date = ?').get(nip, today) as any;
  if (existing) {
    if (existing.checkIn) {
      res.status(400).json({ error: 'Anda sudah melakukan check-in hari ini', data: existing });
      return;
    }
    db.prepare('UPDATE lecturer_attendance SET checkIn = ?, status = ?, course = ?, class = ? WHERE id = ?')
      .run(now, 'HADIR', course || null, cls || null, existing.id);
    res.json({ success: true, message: `Check-in berhasil pukul ${now}`, id: existing.id });
    return;
  }

  const id = 'ATT' + Date.now().toString().slice(-6);
  db.prepare('INSERT INTO lecturer_attendance (id, lecturerNip, lecturerName, date, checkIn, status, course, class) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, nip, name, today, now, 'HADIR', course || null, cls || null);
  res.json({ success: true, message: `Check-in berhasil pukul ${now}`, id });
});

router.post('/checkout', requireRole('DOSEN'), (req: Request, res: Response) => {
  const db = getDb();
  const { nip } = req.body;
  if (!nip) { res.status(400).json({ error: 'NIP wajib diisi' }); return; }
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toTimeString().slice(0, 5);
  const existing = db.prepare('SELECT * FROM lecturer_attendance WHERE lecturerNip = ? AND date = ?').get(nip, today) as any;
  if (!existing) { res.status(400).json({ error: 'Belum melakukan check-in hari ini' }); return; }
  if (existing.checkOut) { res.status(400).json({ error: 'Sudah melakukan check-out hari ini' }); return; }
  db.prepare('UPDATE lecturer_attendance SET checkOut = ? WHERE id = ?').run(now, existing.id);
  res.json({ success: true, message: `Check-out berhasil pukul ${now}` });
});

router.put('/:id', requireRole('AKADEMIK', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const { status, note, checkIn, checkOut } = req.body;
  const updates: string[] = [];
  const values: any[] = [];
  if (status) { updates.push('status=?'); values.push(status); }
  if (note !== undefined) { updates.push('note=?'); values.push(note); }
  if (checkIn) { updates.push('checkIn=?'); values.push(checkIn); }
  if (checkOut) { updates.push('checkOut=?'); values.push(checkOut); }
  if (updates.length === 0) { res.status(400).json({ error: 'No fields' }); return; }
  values.push(req.params.id);
  db.prepare(`UPDATE lecturer_attendance SET ${updates.join(',')} WHERE id=?`).run(...values);
  res.json({ success: true });
});

export default router;
