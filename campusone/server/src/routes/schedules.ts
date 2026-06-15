import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const schedules = db.prepare('SELECT * FROM schedules').all();
  res.json(schedules);
});

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);
  if (!schedule) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(schedule);
});

router.post('/', requireRole('AKADEMIK', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const { id, day, time, course, lecturer, room, class: cls } = req.body;
  if (!day || !time || !course || !lecturer || !room || !cls) {
    res.status(400).json({ error: 'day, time, course, lecturer, room, class are required' }); return;
  }
  const sid = id || `SC${String(Date.now()).slice(-5)}`;
  db.prepare('INSERT INTO schedules (id, day, time, course, lecturer, room, class) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    sid, day, time, course, lecturer, room, cls
  );
  const created = db.prepare('SELECT * FROM schedules WHERE id = ?').get(sid);
  res.status(201).json(created);
});

router.put('/:id', requireRole('AKADEMIK', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id) as any;
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  const { day, time, course, lecturer, room, class: cls } = req.body;
  const fields: string[] = [];
  const values: any[] = [];
  if (day !== undefined) { fields.push('day=?'); values.push(day); }
  if (time !== undefined) { fields.push('time=?'); values.push(time); }
  if (course !== undefined) { fields.push('course=?'); values.push(course); }
  if (lecturer !== undefined) { fields.push('lecturer=?'); values.push(lecturer); }
  if (room !== undefined) { fields.push('room=?'); values.push(room); }
  if (cls !== undefined) { fields.push('class=?'); values.push(cls); }
  if (fields.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }
  values.push(req.params.id);
  db.prepare(`UPDATE schedules SET ${fields.join(',')} WHERE id=?`).run(...values);
  const updated = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', requireRole('AKADEMIK', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  db.prepare('DELETE FROM schedules WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
