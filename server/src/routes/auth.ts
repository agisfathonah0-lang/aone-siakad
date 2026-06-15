import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';
import { signToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email dan password wajib diisi' });
    return;
  }
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password) as any;
  if (!user) {
    res.status(401).json({ error: 'Email atau password salah' });
    return;
  }
  const { password: _, ...safeUser } = user;
  const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role, nim_nip: user.nim_nip, prodi: user.prodi });
  res.json({ user: safeUser, token });
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!user) {
    res.status(404).json({ error: 'User tidak ditemukan' });
    return;
  }
  const { password: _, ...safeUser } = user;
  res.json({ ...safeUser, role: req.user!.role });
});

export default router;
