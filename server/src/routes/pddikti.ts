import { Router, Request, Response } from 'express';
import { getDb } from '../database.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

const NEO_FEEDER_TABLES: Record<string, string> = {
  Mahasiswa: 'students',
  Dosen: 'lecturers',
  KRS: 'schedules',
  Nilai: 'courses',
};

function validateStudent(db: any): any[] {
  const errors: any[] = [];
  const students = db.prepare('SELECT * FROM students').all() as any[];
  students.forEach(s => {
    if (!s.nim || s.nim.length < 8) errors.push({ id: 'VAL' + Date.now().toString().slice(-4) + Math.random().toString(36).slice(2, 4), type: 'Mahasiswa', message: `NIM ${s.name} (${s.nim || '-'}) tidak sesuai format (min 8 digit).`, priority: 'Tinggi', field: 'NIM' });
    if (!s.email || !s.email.includes('@')) errors.push({ id: 'VAL' + Date.now().toString().slice(-4) + Math.random().toString(36).slice(2, 4), type: 'Mahasiswa', message: `Email ${s.name} (${s.email || '-'}) tidak valid untuk feeder PDDIKTI.`, priority: 'Sedang', field: 'EMAIL' });
  });
  return errors;
}

function validateLecturer(db: any): any[] {
  const errors: any[] = [];
  const lecturers = db.prepare('SELECT * FROM lecturers').all() as any[];
  const nidnMap = new Map<string, string[]>();
  lecturers.forEach(l => {
    if (!nidnMap.has(l.nidn)) nidnMap.set(l.nidn, []);
    nidnMap.get(l.nidn)!.push(l.name);
  });
  nidnMap.forEach((names, nidn) => {
    if (names.length > 1) errors.push({ id: 'VAL' + Date.now().toString().slice(-4) + Math.random().toString(36).slice(2, 4), type: 'Dosen', message: `NIDN ${nidn} digunakan oleh ${names.length} dosen (${names.join(', ')}).`, priority: 'Tinggi', field: 'NIDN' });
  });
  return errors;
}

function validateKrs(db: any): any[] {
  const errors: any[] = [];
  const schedules = db.prepare('SELECT * FROM schedules').all() as any[];
  schedules.forEach(s => {
    if (!s.lecturer || !s.course) errors.push({ id: 'VAL' + Date.now().toString().slice(-4) + Math.random().toString(36).slice(2, 4), type: 'KRS', message: `Jadwal ${s.id || '-'} memiliki dosen atau mata kuliah kosong.`, priority: 'Sedang', field: 'KRS' });
  });
  return errors;
}

function validateNilai(db: any): any[] {
  const errors: any[] = [];
  const courses = db.prepare('SELECT * FROM courses').all() as any[];
  courses.forEach(c => {
    if (!c.sks || c.sks < 1) errors.push({ id: 'VAL' + Date.now().toString().slice(-4) + Math.random().toString(36).slice(2, 4), type: 'Nilai', message: `Mata kuliah ${c.name || c.code} memiliki bobot SKS ${c.sks || 0} tidak valid.`, priority: 'Tinggi', field: 'SKS' });
  });
  return errors;
}

function countRecords(db: any, type: string): number {
  const table = NEO_FEEDER_TABLES[type];
  if (!table) return 0;
  const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as any;
  return row?.count || 0;
}

// GET /api/pddikti/validate — validation errors
router.get('/validate', (_req: Request, res: Response) => {
  const db = getDb();
  const errors = [
    ...validateStudent(db),
    ...validateLecturer(db),
    ...validateKrs(db),
    ...validateNilai(db),
  ];
  res.json(errors);
});

// GET /api/pddikti — sync logs
router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const logs = db.prepare('SELECT * FROM sync_logs ORDER BY timestamp DESC').all();
  res.json(logs);
});

// POST /api/pddikti/sync — trigger Neo Feeder sync for a type
router.post('/sync', requireRole('AKADEMIK', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const { type } = req.body;
  const validTypes = ['Mahasiswa', 'Dosen', 'KRS', 'Nilai'];
  if (!validTypes.includes(type)) {
    res.status(400).json({ error: 'Tipe sinkronisasi tidak valid' });
    return;
  }

  const total = countRecords(db, type);
  const failures: any[] = [];

  // Validate based on type
  if (type === 'Mahasiswa') failures.push(...validateStudent(db));
  if (type === 'Dosen') failures.push(...validateLecturer(db));
  if (type === 'KRS') failures.push(...validateKrs(db));
  if (type === 'Nilai') failures.push(...validateNilai(db));

  // Simulate sync — some records may fail randomly
  const failedCount = Math.min(failures.length, Math.floor(total * 0.05));
  const syncedCount = total - failedCount;

  const status = failedCount === 0 ? 'Sukses' : failedCount > Math.floor(total * 0.1) ? 'Gagal' : 'Peringatan';

  const id = 'LOG' + Date.now().toString().slice(-6);
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  db.prepare('INSERT INTO sync_logs VALUES (?, ?, ?, ?, ?, ?)').run(id, timestamp, type, syncedCount, failedCount, status);

  res.status(201).json({ id, timestamp, type, recordsSynced: syncedCount, recordsFailed: failedCount, status });
});

// POST /api/pddikti — legacy create sync log
router.post('/', requireRole('AKADEMIK', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  const db = getDb();
  const { type, recordsSynced, recordsFailed, status } = req.body;
  const id = 'LOG' + Date.now().toString().slice(-6);
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  db.prepare('INSERT INTO sync_logs VALUES (?, ?, ?, ?, ?, ?)').run(id, timestamp, type, recordsSynced, recordsFailed, status);
  res.status(201).json({ id, timestamp });
});

// GET /api/pddikti/stats — sync statistics
router.get('/stats', (_req: Request, res: Response) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as count FROM sync_logs').get() as any;
  const sukses = db.prepare("SELECT COUNT(*) as count FROM sync_logs WHERE status='Sukses'").get() as any;
  const gagal = db.prepare("SELECT COUNT(*) as count FROM sync_logs WHERE status='Gagal'").get() as any;
  const peringatan = db.prepare("SELECT COUNT(*) as count FROM sync_logs WHERE status='Peringatan'").get() as any;
  const totalFailed = db.prepare('SELECT SUM(recordsFailed) as sum FROM sync_logs').get() as any;
  const totalSynced = db.prepare('SELECT SUM(recordsSynced) as sum FROM sync_logs').get() as any;
  const ratio = totalSynced?.sum && totalFailed?.sum
    ? ((totalSynced.sum / (totalSynced.sum + totalFailed.sum)) * 100).toFixed(1)
    : '100.0';

  const counts: Record<string, number> = {};
  validTypes.forEach(t => { counts[t] = countRecords(db, t); });

  res.json({
    totalLogs: total?.count || 0,
    sukses: sukses?.count || 0,
    gagal: gagal?.count || 0,
    peringatan: peringatan?.count || 0,
    ratio: ratio + '%',
    totalSynced: totalSynced?.sum || 0,
    totalFailed: totalFailed?.sum || 0,
    recordCounts: counts,
  });
});

const validTypes = ['Mahasiswa', 'Dosen', 'KRS', 'Nilai'];

export default router;
