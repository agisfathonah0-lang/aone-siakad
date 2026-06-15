import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const students = db.prepare('SELECT * FROM students').all();
  res.json(students);
});

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(student);
});

router.get('/nim/:nim', (req: Request, res: Response) => {
  const db = getDb();
  const student = db.prepare('SELECT * FROM students WHERE nim = ?').get(req.params.nim);
  if (!student) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(student);
});

router.put('/:id', requireRole('AKADEMIK', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const { name, email, prodi, fakultas, semester, ipk, status, phone, address } = req.body;
  db.prepare(`UPDATE students SET name=?, email=?, prodi=?, fakultas=?, semester=?, ipk=?, status=?, phone=?, address=? WHERE id=?`)
    .run(name, email, prodi, fakultas, semester, ipk, status, phone, address, req.params.id);
  res.json({ success: true });
});

export default router;
