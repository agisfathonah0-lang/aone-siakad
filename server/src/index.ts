import express from 'express';
import cors from 'cors';
import { seedDatabase } from './database.js';

import authRoutes from './routes/auth.js';
import campusRoutes from './routes/campuses.js';
import studentRoutes from './routes/students.js';
import lecturerRoutes from './routes/lecturers.js';
import courseRoutes from './routes/courses.js';
import scheduleRoutes from './routes/schedules.js';
import pmbRoutes from './routes/pmb.js';
import invoiceRoutes from './routes/invoices.js';
import pddiktiRoutes from './routes/pddikti.js';
import lmsRoutes from './routes/lms.js';
import ojsRoutes from './routes/ojs.js';
import alumniRoutes from './routes/alumni.js';
import superadminRoutes from './routes/superadmin.js';
import attendanceRoutes from './routes/attendance.js';
import webSettingsRoutes from './routes/web-settings.js';
import firewallRoutes from './routes/firewall.js';
import cctvRoutes from './routes/cctv.js';
import { firewallMiddleware } from './middleware/firewall.js';
import { authMiddleware, optionalAuth } from './middleware/auth.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const NF_PORT = 3003;

const allowedOrigins: (string | RegExp)[] = [
  'http://localhost:3000',
  'http://localhost:4000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4000',
  /^https?:\/\/192\.168\.\d+\.\d+:\d+$/,
  /^https?:\/\/10\.\d+\.\d+\.\d+:\d+$/,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:\d+$/,
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(a => typeof a === 'string' ? a === origin : a.test(origin))) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

seedDatabase();

app.use(firewallMiddleware);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/campuses', optionalAuth, campusRoutes);
app.use('/api/students', authMiddleware, studentRoutes);
app.use('/api/lecturers', authMiddleware, lecturerRoutes);
app.use('/api/courses', authMiddleware, courseRoutes);
app.use('/api/schedules', authMiddleware, scheduleRoutes);
app.use('/api/pmb', optionalAuth, pmbRoutes);
app.use('/api/invoices', authMiddleware, invoiceRoutes);
app.use('/api/pddikti', authMiddleware, pddiktiRoutes);
app.use('/api/lms', authMiddleware, lmsRoutes);
app.use('/api/ojs', authMiddleware, ojsRoutes);
app.use('/api/alumni', authMiddleware, alumniRoutes);
app.use('/api/admin', authMiddleware, superadminRoutes);
app.use('/api/attendance', authMiddleware, attendanceRoutes);
app.use('/api/web-settings', optionalAuth, webSettingsRoutes);
app.use('/api/firewall', authMiddleware, firewallRoutes);
app.use('/api/cctv', authMiddleware, cctvRoutes);

app.listen(PORT, () => {
  console.log(`🚀 AONE SIAKAD API Server running at http://localhost:${PORT}`);
});

// Start Neo Feeder PDDIKTI server on port 3003
import('../neofeeder.js').then(m => m.startNeoFeeder(NF_PORT)).catch((err) => {
  console.log(`[NEO FEEDER] Gagal start: ${err.message}`);
  console.log('[NEO FEEDER] Fallback ke mode simulasi internal');
});
