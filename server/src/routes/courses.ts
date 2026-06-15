import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const courses = db.prepare('SELECT * FROM courses').all();
  res.json(courses);
});

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!course) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(course);
});

router.post('/', requireRole('AKADEMIK', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const { id, code, name, sks, semester, type, description } = req.body;
  if (!code || !name || !sks || semester === undefined) {
    res.status(400).json({ error: 'code, name, sks, semester are required' }); return;
  }
  const cid = id || `MK${String(Date.now()).slice(-5)}`;
  db.prepare('INSERT INTO courses (id, code, name, sks, semester, type, description) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    cid, code, name, sks, semester, type || 'Wajib', description || ''
  );
  const created = db.prepare('SELECT * FROM courses WHERE id = ?').get(cid);
  res.status(201).json(created);
});

router.put('/:id', requireRole('AKADEMIK', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id) as any;
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  const { code, name, sks, semester, type, description } = req.body;
  const fields: string[] = [];
  const values: any[] = [];
  if (code !== undefined) { fields.push('code=?'); values.push(code); }
  if (name !== undefined) { fields.push('name=?'); values.push(name); }
  if (sks !== undefined) { fields.push('sks=?'); values.push(sks); }
  if (semester !== undefined) { fields.push('semester=?'); values.push(semester); }
  if (type !== undefined) { fields.push('type=?'); values.push(type); }
  if (description !== undefined) { fields.push('description=?'); values.push(description); }
  if (fields.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }
  values.push(req.params.id);
  db.prepare(`UPDATE courses SET ${fields.join(',')} WHERE id=?`).run(...values);
  const updated = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', requireRole('AKADEMIK', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
