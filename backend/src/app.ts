import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { query } from './config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { resolveTenant } from './middleware/resolveTenant.js';
import { authenticate } from './middleware/auth.js';
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
import midtransRoutes, { midtransNotificationHandler } from './modules/keuangan/midtrans.routes.js';
import cmsRoutes from './modules/cms/sections.routes.js';
import ppdbRoutes from './modules/ppdb/pendaftaran.routes.js';
import ppdbConfigRoutes from './modules/akademik/ppdb-config.routes.js';
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
import campusCctvRoutes from './modules/akademik/cctv.routes.js';
import chatRoutes from './modules/akademik/chat.routes.js';
import kelasRoomRoutes from './modules/akademik/kelas-room.routes.js';
import verifyRoutes from './modules/akademik/verify.routes.js';
import publicRoutes from './modules/public/public.routes.js';
import vendorLandingRoutes from './modules/vendor/landing.routes.js';
import vendorPlansRoutes from './modules/vendor/plans.routes.js';
import vendorUsersRoutes from './modules/vendor/vendor-users.routes.js';
import vendorAuditRoutes from './modules/vendor/audit.routes.js';
import vendorMonitorRoutes from './modules/vendor/monitor.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (config.env !== 'test') {
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
}

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  skip: (req) => !!(req.path === '/api/v1/health' || req.path.startsWith('/api/v1/public/') || /\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2?|ttf|eot)$/.test(req.path)),
  handler: (req, res) => {
    if (req.accepts('html')) {
      res.status(429).send(`<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Terlalu Banyak Request</title><style>*{margin:0;padding:0;box-sizing:border-box}body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow:hidden}.orb{position:fixed;width:600px;height:600px;border-radius:50%;filter:blur(120px);opacity:.15;pointer-events:none}.orb-1{top:-200px;right:-200px;background:#10b981;animation:drift 8s ease-in-out infinite}.orb-2{bottom:-200px;left:-200px;background:#6366f1;animation:drift 10s ease-in-out infinite reverse}.card{position:relative;z-index:10;text-align:center;padding:48px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:24px;backdrop-filter:blur(20px);max-width:420px;margin:24px}.icon{margin:0 auto 24px;width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,rgba(239,68,68,.2),rgba(239,68,68,.1));display:flex;align-items:center;justify-content:center;animation:pulse 2s ease-in-out infinite}.icon svg{width:32px;height:32px;color:#ef4444}h1{color:#fff;font-size:24px;font-weight:800;letter-spacing:-.5px;margin-bottom:8px}p{color:rgba(255,255,255,.4);font-size:14px;line-height:1.6;margin-bottom:24px}.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.08);border-radius:12px;text-decoration:none;font-size:13px;font-weight:600;transition:all .2s}.btn:hover{background:rgba(255,255,255,.1);color:#fff}@keyframes drift{0%,100%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(30px,-30px) rotate(5deg)}66%{transform:translate(-20px,20px) rotate(-3deg)}}@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.05);opacity:.7}}</style></head><body><div class="orb orb-1"></div><div class="orb orb-2"></div><div class="card"><div class="icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg></div><h1>Terlalu Banyak Request</h1><p>Mohon tunggu beberapa saat sebelum mencoba lagi.</p><a href="javascript:history.back()" class="btn"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"/></svg>Kembali</a></div></body></html>`);
    } else {
      res.status(429).json({ success: false, message: 'Terlalu banyak request' });
    }
  },
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
app.use(`${config.apiPrefix}/upload`, uploadRoutes);

app.use(`${config.apiPrefix}/ai`, authenticate, aiRoutes);

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
  ['/campus/ppdb-config', ppdbConfigRoutes],
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
  ['/campus/cctv', campusCctvRoutes],
  ['/chat', chatRoutes],
  ['/akademik/kelas-room', kelasRoomRoutes],
];

app.post(`${config.apiPrefix}/keuangan/midtrans/notification`, express.json(), midtransNotificationHandler);
app.use(`${config.apiPrefix}/verify`, verifyRoutes);

featureRoutes.forEach(([path, router]) => {
  app.use(`${config.apiPrefix}${path}`, campusGuard, router);
});

if (config.env === 'production') {
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));

  const indexHtmlPath = path.join(frontendDist, 'index.html');
  let indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const { rows: tenants } = await query(
        `SELECT slug, name, updated_at FROM public.tenants WHERE is_active = true ORDER BY name ASC`,
        []
      );
      const proto = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers.host || 'aone-siakad.my.id';
      const baseUrl = `${proto}://${host}`;
      const urls: string[] = [];
      urls.push(`  <url><loc>${baseUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`);
      urls.push(`  <url><loc>${baseUrl}/testimoni</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
      urls.push(`  <url><loc>${baseUrl}/harga</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`);
      const featureSlugs = ['manajemen-akademik','keuangan-terintegrasi','perpustakaan-digital','evaluasi-dosen','akreditasi-ban-pt','cetak-dokumen','integrasi-pddikti','landing-page-builder'];
      for (const slug of featureSlugs) {
        urls.push(`  <url><loc>${baseUrl}/fitur/${slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
      }
      for (const t of tenants) {
        const lastmod = t.updated_at ? new Date(t.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        urls.push(`  <url><loc>${baseUrl}/kampus/${t.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
      }
      res.header('Content-Type', 'application/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
    } catch { res.status(500).send('Gagal generate sitemap'); }
  });

  app.get('/robots.txt', (req, res) => {
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host || 'aone-siakad.my.id';
    const baseUrl = `${proto}://${host}`;
    res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  app.get('*', async (req, res) => {
    const match = req.path.match(/^\/kampus\/([^/]+)/);
    let title = 'AONE SIAKAD - Sistem Informasi Akademik Terintegrasi';
    let desc = 'Sistem Informasi Akademik terintegrasi untuk institusi pendidikan di Indonesia. Kelola akademik, keuangan, perpustakaan, PPDB, dan akreditasi dalam satu platform.';
    let ogImage = '/logo.png';

    if (match) {
      try {
        const { rows } = await query(
          `SELECT ts.value->>'seoTitle' as seo_title, ts.value->>'seoDescription' as seo_desc, t.name, t.nama_pt, t.logo_url
           FROM public.tenants t LEFT JOIN public.tenant_settings ts ON ts.tenant_id = t.id AND ts.setting_key = 'landing_page'
           WHERE t.slug = $1 AND t.is_active = true LIMIT 1`,
          [match[1]]
        );
        if (rows.length > 0) {
          const r = rows[0];
          title = r.seo_title || r.nama_pt || r.name || title;
          desc = r.seo_desc || `${r.nama_pt || r.name} - Sistem Informasi Akademik terintegrasi.`;
          if (r.logo_url) ogImage = r.logo_url;
        }
      } catch {}
    }

    const seoMeta = `
    <title>${title}</title>
    <meta name="description" content="${desc.substring(0, 200)}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc.substring(0, 200)}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:type" content="website">
    <meta name="robots" content="index, follow">
`;
    const html = indexHtml.replace('<!--SEO_INJECT-->', seoMeta);

    res.send(html);
  });
}

app.use(errorHandler);

export default app;
