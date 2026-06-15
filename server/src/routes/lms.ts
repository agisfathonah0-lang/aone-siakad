import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const courses = db.prepare('SELECT * FROM lms_courses').all();
  res.json(courses);
});

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const course = db.prepare('SELECT * FROM lms_courses WHERE id = ?').get(req.params.id);
  if (!course) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(course);
});

export default router;
