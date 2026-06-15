import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { resolveTenant } from './middleware/resolveTenant.js';
import { campusGuard } from './middleware/campusGuard.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendSuccess } from './middleware/response.js';

import authRoutes from './modules/auth/auth.routes.js';
import vendorRoutes from './modules/vendor/provisioning.routes.js';
import vendorDashboardRoutes from './modules/vendor/dashboard.routes.js';
import vendorTicketsRoutes from './modules/vendor/tickets.routes.js';
import vendorSettingsRoutes from './modules/vendor/settings.routes.js';
import vendorFirewallRoutes from './modules/vendor/firewall.routes.js';
import vendorCctvRoutes from './modules/vendor/cctv.routes.js';
import prodiRoutes from './modules/akademik/prodi.routes.js';
import usersRoutes from './modules/akademik/users.routes.js';
import campusSettingsRoutes from './modules/akademik/settings.routes.js';
import laporanRoutes from './modules/akademik/laporan.routes.js';
import perwalianRoutes from './modules/akademik/perwalian.routes.js';
import kalenderRoutes from './modules/akademik/kalender.routes.js';
import notifikasiRoutes from './modules/akademik/notifikasi.routes.js';
import mahasiswaRoutes from './modules/akademik/mahasiswa.routes.js';
import dosenRoutes from './modules/akademik/dosen.routes.js';
import mataKuliahRoutes from './modules/akademik/mata-kuliah.routes.js';
import jadwalRoutes from './modules/akademik/jadwal.routes.js';
import krsRoutes from './modules/akademik/krs.routes.js';
import absensiRoutes from './modules/akademik/absensi.routes.js';
import nilaiRoutes from './modules/akademik/nilai.routes.js';
import kurikulumRoutes from './modules/akademik/kurikulum.routes.js';
import rpsRoutes from './modules/akademik/rps.routes.js';
import bapRoutes from './modules/akademik/bap.routes.js';
import absensiDosenRoutes from './modules/akademik/absensi-dosen.routes.js';
import tagihanRoutes from './modules/keuangan/tagihan.routes.js';
import pembayaranRoutes from './modules/keuangan/pembayaran.routes.js';
import midtransRoutes from './modules/keuangan/midtrans.routes.js';
import cmsRoutes from './modules/cms/sections.routes.js';
import ppdbRoutes from './modules/ppdb/pendaftaran.routes.js';
import ojsRoutes from './modules/ojs/ojs.routes.js';
import pddiktiRoutes from './modules/pddikti/pddikti.routes.js';
import alumniRoutes from './modules/alumni/alumni.routes.js';
import beritaRoutes from './modules/akademik/berita.routes.js';
import lmsRoutes from './modules/akademik/lms.routes.js';
import cetakRoutes from './modules/akademik/cetak.routes.js';
import edomRoutes from './modules/akademik/edom.routes.js';
import beasiswaRoutes from './modules/akademik/beasiswa.routes.js';
import akreditasiRoutes from './modules/akademik/akreditasi.routes.js';
import landingPageRoutes from './modules/akademik/landing-page.routes.js';
import perpustakaanRoutes from './modules/akademik/perpustakaan.routes.js';
import suratRoutes from './modules/akademik/surat.routes.js';
import pklRoutes from './modules/akademik/pkl.routes.js';
import sidangRoutes from './modules/akademik/sidang.routes.js';
import kknRoutes from './modules/akademik/kkn.routes.js';
import seminarRoutes from './modules/akademik/seminar.routes.js';
import publicRoutes from './modules/public/public.routes.js';
import vendorLandingRoutes from './modules/vendor/landing.routes.js';
import vendorPlansRoutes from './modules/vendor/plans.routes.js';
import vendorUsersRoutes from './modules/vendor/vendor-users.routes.js';
import vendorAuditRoutes from './modules/vendor/audit.routes.js';
import vendorMonitorRoutes from './modules/vendor/monitor.routes.js';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (config.env !== 'test') {
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
}

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Terlalu banyak request, coba lagi nanti' },
}));

app.use(resolveTenant);

app.get(`${config.apiPrefix}/health`, (_req, res) => {
  sendSuccess(res, {
    status: 'ok',
    service: 'aone-siakad-api',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/vendor`, vendorRoutes);
app.use(`${config.apiPrefix}/vendor/dashboard`, vendorDashboardRoutes);
app.use(`${config.apiPrefix}/vendor/tickets`, vendorTicketsRoutes);
app.use(`${config.apiPrefix}/vendor/settings`, vendorSettingsRoutes);
app.use(`${config.apiPrefix}/vendor/firewall`, vendorFirewallRoutes);
app.use(`${config.apiPrefix}/vendor/cctv`, vendorCctvRoutes);
app.use(`${config.apiPrefix}/public`, publicRoutes);
app.use(`${config.apiPrefix}/vendor/landing-pages`, vendorLandingRoutes);
app.use(`${config.apiPrefix}/vendor/plans`, vendorPlansRoutes);
app.use(`${config.apiPrefix}/vendor/users`, vendorUsersRoutes);
app.use(`${config.apiPrefix}/vendor/audit`, vendorAuditRoutes);
app.use(`${config.apiPrefix}/vendor/monitor`, vendorMonitorRoutes);

const featureRoutes: [string, any][] = [
  ['/akademik/prodi', prodiRoutes],
  ['/akademik/users', usersRoutes],
  ['/akademik/settings', campusSettingsRoutes],
  ['/akademik/laporan', laporanRoutes],
  ['/akademik/perwalian', perwalianRoutes],
  ['/akademik/kalender', kalenderRoutes],
  ['/akademik/notifikasi', notifikasiRoutes],
  ['/akademik/mahasiswa', mahasiswaRoutes],
  ['/akademik/dosen', dosenRoutes],
  ['/akademik/mata-kuliah', mataKuliahRoutes],
  ['/akademik/jadwal', jadwalRoutes],
  ['/akademik/krs', krsRoutes],
  ['/akademik/absensi', absensiRoutes],
  ['/akademik/nilai', nilaiRoutes],
  ['/akademik/kurikulum', kurikulumRoutes],
  ['/akademik/rps', rpsRoutes],
  ['/akademik/bap', bapRoutes],
  ['/akademik/absensi-dosen', absensiDosenRoutes],
  ['/akademik/berita', beritaRoutes],
  ['/akademik/cetak', cetakRoutes],
  ['/akademik/edom', edomRoutes],
  ['/akademik/akreditasi', akreditasiRoutes],
  ['/akademik/beasiswa', beasiswaRoutes],
  ['/keuangan/tagihan', tagihanRoutes],
  ['/keuangan/pembayaran', pembayaranRoutes],
  ['/keuangan/midtrans', midtransRoutes],
  ['/cms', cmsRoutes],
  ['/ppdb', ppdbRoutes],
  ['/ojs', ojsRoutes],
  ['/pddikti', pddiktiRoutes],
  ['/alumni', alumniRoutes],
  ['/campus/landing-page', landingPageRoutes],
  ['/akademik/perpustakaan', perpustakaanRoutes],
  ['/akademik/lms', lmsRoutes],
  ['/akademik/surat', suratRoutes],
  ['/akademik/pkl', pklRoutes],
  ['/akademik/sidang', sidangRoutes],
  ['/akademik/kkn', kknRoutes],
  ['/akademik/seminar', seminarRoutes],
];

featureRoutes.forEach(([path, router]) => {
  app.use(`${config.apiPrefix}${path}`, campusGuard, router);
});

if (config.env === 'production') {
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(errorHandler);

export default app;
