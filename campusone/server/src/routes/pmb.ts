import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';
import { v4 as uuidv4 } from 'uuid';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const applicants = db.prepare('SELECT * FROM pmb_applicants ORDER BY applicantNumber DESC').all();
  res.json(applicants);
});

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const applicant = db.prepare('SELECT * FROM pmb_applicants WHERE id = ?').get(req.params.id);
  if (!applicant) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(applicant);
});

router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const { name, email, phone, selectionPath, firstChoice, secondChoice, school } = req.body;
  if (!name || !email || !phone) {
    res.status(400).json({ error: 'Nama, email, dan nomor HP wajib diisi' });
    return;
  }
  const id = 'PMB-' + Date.now().toString().slice(-6);
  const appNumber = 'PMB26' + Math.floor(1000 + Math.random() * 9000);
  db.prepare(`INSERT INTO pmb_applicants (id, applicantNumber, name, email, phone, selectionPath, firstChoice, secondChoice, status, pembayaranStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Registrasi', 'Belum Bayar')`)
    .run(id, appNumber, name, email, phone, selectionPath || 'Jalur Mandiri', firstChoice || 'Teknik Informatika', secondChoice || 'Sistem Informasi');
  res.status(201).json({ id, applicantNumber: appNumber, name, email });
});

router.put('/:id', requireRole('AKADEMIK', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const { status, score, wawancaraNote, pembayaranStatus } = req.body;
  const updates: string[] = [];
  const values: any[] = [];
  if (status !== undefined) { updates.push('status=?'); values.push(status); }
  if (score !== undefined) { updates.push('score=?'); values.push(score); }
  if (wawancaraNote !== undefined) { updates.push('wawancaraNote=?'); values.push(wawancaraNote); }
  if (pembayaranStatus !== undefined) { updates.push('pembayaranStatus=?'); values.push(pembayaranStatus); }
  if (updates.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }
  values.push(req.params.id);
  db.prepare(`UPDATE pmb_applicants SET ${updates.join(', ')} WHERE id=?`).run(...values);
  res.json({ success: true });
});

export default router;
