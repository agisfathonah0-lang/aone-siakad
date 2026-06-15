import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const lecturers = db.prepare('SELECT * FROM lecturers').all();
  res.json(lecturers);
});

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const lecturer = db.prepare('SELECT * FROM lecturers WHERE id = ?').get(req.params.id);
  if (!lecturer) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(lecturer);
});

router.post('/', requireRole('AKADEMIK', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const { id, nip, nidn, name, email, prodi, fakultas, status, teachingLoads } = req.body;
  if (!nip || !name || !email || !prodi || !fakultas) {
    res.status(400).json({ error: 'nip, name, email, prodi, fakultas are required' }); return;
  }
  const lid = id || `L${String(Date.now()).slice(-5)}`;
  db.prepare('INSERT INTO lecturers (id, nip, nidn, name, email, prodi, fakultas, status, teachingLoads) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    lid, nip, nidn || nip, name, email, prodi, fakultas, status || 'Aktif', JSON.stringify(teachingLoads || [])
  );
  const created = db.prepare('SELECT * FROM lecturers WHERE id = ?').get(lid);
  res.status(201).json(created);
});

router.put('/:id', requireRole('AKADEMIK', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM lecturers WHERE id = ?').get(req.params.id) as any;
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  const { nip, nidn, name, email, prodi, fakultas, status, teachingLoads } = req.body;
  const fields: string[] = [];
  const values: any[] = [];
  if (nip !== undefined) { fields.push('nip=?'); values.push(nip); }
  if (nidn !== undefined) { fields.push('nidn=?'); values.push(nidn); }
  if (name !== undefined) { fields.push('name=?'); values.push(name); }
  if (email !== undefined) { fields.push('email=?'); values.push(email); }
  if (prodi !== undefined) { fields.push('prodi=?'); values.push(prodi); }
  if (fakultas !== undefined) { fields.push('fakultas=?'); values.push(fakultas); }
  if (status !== undefined) { fields.push('status=?'); values.push(status); }
  if (teachingLoads !== undefined) { fields.push('teachingLoads=?'); values.push(JSON.stringify(teachingLoads)); }
  if (fields.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }
  values.push(req.params.id);
  db.prepare(`UPDATE lecturers SET ${fields.join(',')} WHERE id=?`).run(...values);
  const updated = db.prepare('SELECT * FROM lecturers WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', requireRole('AKADEMIK', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM lecturers WHERE id = ?').get(req.params.id);
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  db.prepare('DELETE FROM lecturers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
