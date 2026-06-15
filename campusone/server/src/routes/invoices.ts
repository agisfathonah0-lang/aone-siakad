import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const invoices = db.prepare('SELECT * FROM invoices').all();
  res.json(invoices);
});

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  if (!invoice) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(invoice);
});

router.put('/:id', requireRole('KEUANGAN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const { status, payments } = req.body;
  if (status) db.prepare('UPDATE invoices SET status=? WHERE id=?').run(status, req.params.id);
  if (payments) db.prepare('UPDATE invoices SET payments=? WHERE id=?').run(JSON.stringify(payments), req.params.id);
  res.json({ success: true });
});

export default router;
