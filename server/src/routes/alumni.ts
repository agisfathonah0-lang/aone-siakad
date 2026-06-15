import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const surveys = db.prepare('SELECT * FROM alumni_surveys').all();
  res.json(surveys);
});

router.get('/stats', (_req: Request, res: Response) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as count FROM alumni_surveys').get() as any;
  const avgSalary = db.prepare('SELECT AVG(monthlySalary) as avg FROM alumni_surveys').get() as any;
  const avgTime = db.prepare('SELECT AVG(timeToGetJob) as avg FROM alumni_surveys').get() as any;
  const relevance = db.prepare('SELECT relevance, COUNT(*) as count FROM alumni_surveys GROUP BY relevance').all();
  res.json({ total: total.count, avgSalary: Math.round(avgSalary.avg), avgTime: Math.round(avgTime.avg * 10) / 10, relevance });
});

export default router;
