import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../../config/database.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { config } from '../../config/index.js';

const router = Router();

// Resolve tenant from any hostname (subdomain or custom domain)
router.get('/resolve-host', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const host = (req.query.host as string) || req.headers.host || '';
    const cleanHost = host.split(':')[0];

    if (!cleanHost || cleanHost === 'localhost') {
      return sendSuccess(res, { tenant: null });
    }

    // 1. Check custom_domain
    const domainResult = await query(
      `SELECT id, slug, schema_name, name, paket, custom_domain, subscription_end_date FROM public.tenants WHERE custom_domain = $1 AND is_active = true`,
      [cleanHost]
    );
    if (domainResult.rows.length > 0) {
      return sendSuccess(res, { tenant: { id: domainResult.rows[0].id, slug: domainResult.rows[0].slug, name: domainResult.rows[0].name } });
    }

    // 2. Check subdomain as slug (skip www and root domain)
    const parts = cleanHost.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
      const slugResult = await query(
        `SELECT id, slug, schema_name, name FROM public.tenants WHERE slug = $1 AND is_active = true`,
        [parts[0]]
      );
      if (slugResult.rows.length > 0) {
        return sendSuccess(res, { tenant: { id: slugResult.rows[0].id, slug: slugResult.rows[0].slug, name: slugResult.rows[0].name } });
      }
    }

    sendSuccess(res, { tenant: null });
  } catch (err) { next(err); }
});

const defaultLandingConfig = {
  hero: {
    title: 'Platform SIAKAD All-in-One untuk Kampus Indonesia',
    subtitle: 'Satu platform terintegrasi untuk PPDB online, akademik, keuangan, akreditasi 9 standar BAN-PT, dan pelaporan PDDIKTI. Dipercaya 50+ kampus mitra di seluruh Indonesia.',
    badge: 'Platform Akademik Cloud untuk Kampus Anda',
    ctaText: 'Ajukan Demo Gratis',
    ctaLink: '/register',
    secondaryText: 'Pelajari Fitur',
    stats: [
      { value: '50+', label: 'Kampus Mitra' },
      { value: '250rb+', label: 'Mahasiswa Terkelola' },
      { value: '99.99%', label: 'Uptime SLA' },
      { value: '10+', label: 'Tahun Pengalaman' },
    ],
    show: true,
  },
  ppdb: {
    title: 'Modul PPDB Online',
    subtitle: 'Kelola penerimaan mahasiswa baru secara digital — dari pendaftaran, seleksi, pembayaran, hingga daftar ulang dalam satu sistem.',
    badge: 'FITUR PPDB',
    stats: [
      { icon: 'Users', label: 'Kampus Aktif', value: '50+', change: 'Terintegrasi' },
      { icon: 'FileText', label: 'Form Digital', value: '100%', change: 'Paperless' },
      { icon: 'CreditCard', label: 'Pembayaran', value: 'Multi-Gateway', change: 'VA / Kartu' },
    ],
    steps: [
      { title: 'Konfigurasi Gelombang', desc: 'Atur jadwal, kuota, jalur seleksi, dan persyaratan pendaftaran' },
      { title: 'Pendaftaran Online', desc: 'Calon mahasiswa daftar, upload dokumen, dan bayar via portal' },
      { title: 'Seleksi Otomatis', desc: 'Sistem筛选 sesuai kriteria, nilai, dan jalur yang ditentukan' },
      { title: 'Pengumuman & Daftar Ulang', desc: 'Pengumuman real-time, daftar ulang online, terbit NIM otomatis' },
    ],
    show: true,
  },
  prodi: {
    title: 'Program Studi',
    subtitle: 'Dukungan penuh untuk seluruh jenjang dan program studi dengan kurikulum OBE.',
    badge: 'MANAJEMEN PRODI',
    items: [],
    show: false,
  },
  features: {
    title: 'Mengapa AONE SIAKAD?',
    subtitle: 'Platform all-in-one yang mencakup seluruh kebutuhan operasional perguruan tinggi dalam satu ekosistem terintegrasi.',
    badge: 'FITUR PLATFORM',
    items: [
      { icon: 'Server', title: 'Multi-Tenant Architecture', desc: 'Setiap kampus mendapat environment terisolasi dengan database, domain, dan konfigurasi sendiri.', color: 'from-emerald-500/20 to-emerald-600/10' },
      { icon: 'Database', title: 'Sinkronasi PDDIKTI', desc: 'Laporan otomatis real-time ke PDDIKTI. Data mahasiswa, dosen, kurikulum terkirim tanpa perlu repot.', color: 'from-indigo-500/20 to-indigo-600/10' },
      { icon: 'Award', title: 'Akreditasi 9 Standar', desc: 'Dashboard monitor 9 standar BAN-PT dengan rekomendasi otomatis dan tracking progress akreditasi.', color: 'from-amber-500/20 to-amber-600/10' },
      { icon: 'CreditCard', title: 'Multi Payment Gateway', desc: 'Virtual account, cicilan UKT, beasiswa, dan laporan keuangan real-time dalam satu dashboard.', color: 'from-rose-500/20 to-rose-600/10' },
      { icon: 'BookOpen', title: 'LMS Terintegrasi', desc: 'Moodle LMS dengan sinkronasi nilai otomatis ke KHS. Dosen input nilai sekali, langsung masuk raport.', color: 'from-cyan-500/20 to-cyan-600/10' },
      { icon: 'Users', title: 'Portal Mahasiswa SSO', desc: 'KRS online, KHS, transkrip, tagihan UKT, dan tracer study dalam satu portal dengan single sign-on.', color: 'from-violet-500/20 to-violet-600/10' },
      { icon: 'Globe', title: 'OJS & Repository', desc: 'Manajemen jurnal online dengan Open Journal Systems, repository institusi, dan publikasi ilmiah.', color: 'from-orange-500/20 to-orange-600/10' },
      { icon: 'Shield', title: 'Keamanan Enterprise', desc: 'Enkripsi AES-256, backup harian, firewall real-time, dan sertifikat SSL untuk keamanan data kampus.', color: 'from-emerald-500/20 to-emerald-600/10' },
      { icon: 'Cloud', title: 'Cloud Native SaaS', desc: 'Fully-managed cloud infrastructure. Tidak perlu urus server, update, backup — kami urus semuanya.', color: 'from-indigo-500/20 to-indigo-600/10' },
      { icon: 'Headphones', title: 'Dukungan 24/7', desc: 'Account manager dedicated, support WA & email 24 jam, dan tim teknis siap membantu kapan saja.', color: 'from-rose-500/20 to-rose-600/10' },
    ],
    show: true,
  },
  testimonials: {
    title: 'Apa Kata Mereka?',
    subtitle: 'Rektor, dekan, dan dosen dari berbagai kampus mitra berbagi pengalaman menggunakan AONE SIAKAD.',
    badge: 'TESTIMONI',
    items: [
      { name: 'Dr. Ahmad Syukri, M.Ag.', role: 'Rektor UND Jakarta', text: 'AONE SIAKAD meningkatkan skor akreditasi institusi kami menjadi UNGGUL dan mempercepat pelaporan PDDIKTI dari mingguan menjadi real-time.', avatar: 'AS', rating: 5 },
      { name: 'Dr. Nurhayati, M.Pd.', role: 'Wakil Rektor I UND Yogyakarta', text: 'Sebelum menggunakan AONE SIAKAD, penginputan nilai dan absensi sarat kekacauan koordinasi. Sekarang semua portal terintegrasi rapi.', avatar: 'NH', rating: 5 },
      { name: 'Dr. Muhammad Fadli, M.E.I.', role: 'Dekan FEBI UND Surabaya', text: 'Modul Akreditasi 9 Standar sangat mutakhir. Borang evaluasi diri terotomatisasi dari operasional keseharian.', avatar: 'MF', rating: 5 },
      { name: 'Dr. Rina Kartika, M.T.', role: 'Ketua Prodi TI UND Medan', text: 'Integrasi LMS dengan SIAKAD memudahkan dosen dan mahasiswa. Nilai otomatis masuk ke KHS tanpa input ulang.', avatar: 'RK', rating: 4 },
    ],
    show: true,
  },
  faq: {
    title: 'Pertanyaan Umum',
    subtitle: 'Temukan jawaban seputar platform AONE SIAKAD, implementasi, dan dukungan.',
    badge: 'FAQ',
    items: [
      { q: 'Apa itu AONE SIAKAD?', a: 'AONE SIAKAD adalah platform SaaS all-in-one untuk perguruan tinggi Indonesia. Mencakup PPDB online, SIAKAD, keuangan, akreditasi 9 standar BAN-PT, LMS, pelaporan PDDIKTI, dan portal mahasiswa/dosen dalam satu ekosistem terintegrasi.' },
      { q: 'Bagaimana proses implementasinya?', a: 'Implementasi dimulai dengan migrasi data, konfigurasi sistem, pelatihan admin dan dosen, serta pendampingan penuh selama 30 hari oleh tim dedicated kami.' },
      { q: 'Apakah data kampus aman?', a: 'Ya. Setiap kampus memiliki database terisolasi (schema-per-tenant). Data dienkripsi AES-256, backup harian otomatis, firewall real-time, dan tersertifikasi SSL. Tersedia SLA 99.99%.' },
      { q: 'Berapa biaya berlangganan?', a: 'Kami menawarkan paket Flexible, Pro, dan Enterprise. Biaya dimulai dari harga terjangkau dengan skala sesuai jumlah mahasiswa. Hubungi tim kami untuk info harga dan demo gratis.' },
      { q: 'Apakah bisa integrasi dengan sistem yang sudah ada?', a: 'Ya. AONE SIAKAD mendukung import data dari berbagai format (Excel, CSV, SQL) dan memiliki REST API untuk integrasi dengan sistem eksisting kampus.' },
    ],
    show: true,
  },
  cta: {
    title: 'Siap Digitalisasi Kampus?',
    subtitle: 'Dapatkan demo gratis dan konsultasi dengan tim kami. Kami siap membantu transformasi digital kampus Anda.',
    phone: '+62 21 1234 5678',
    email: 'info@aoneproject.id',
    address: 'Jakarta, Indonesia',
    show: true,
  },
  footer: {
    text: '© 2026 AONE Project. All rights reserved.',
    columns: [
      { title: 'Produk', items: ['PPDB Online', 'SIAKAD', 'LMS', 'Akreditasi', 'PDDIKTI'] },
      { title: 'Sumber Daya', items: ['Dokumentasi', 'API Reference', 'Status Sistem', 'Blog', 'FAQ'] },
      { title: 'Kontak', items: ['+62 21 1234 5678', 'info@aoneproject.id', 'Jakarta, Indonesia', 'Senin-Jumat 08:00-17:00'] },
    ],
  },
  ppdbBanner: {
    text: 'Daftarkan kampus Anda sekarang. Gratis demo & konsultasi selama 30 hari.',
    show: true,
  },
};

router.get('/vendor-landing-page', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query("SELECT setting_value FROM public.web_settings WHERE setting_key = 'landing_page'");
    let config = defaultLandingConfig;
    if (rows.length > 0) {
      try {
        const saved = JSON.parse(rows[0].setting_value);
        config = { ...defaultLandingConfig, ...saved };
      } catch { /* use defaults */ }
    }
    sendSuccess(res, config);
  } catch (err) { next(err); }
});

router.get('/kampus/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const { rows: tenantRows } = await query(
      'SELECT id, slug, name, nama_pt, singkatan, logo_url, alamat, telepon, email, website, paket, is_active, schema_name FROM public.tenants WHERE slug = $1 AND is_active = true',
      [slug]
    );
    if (tenantRows.length === 0) throw new AppError(404, 'Kampus tidak ditemukan');

    const t = tenantRows[0];
    const s = `"${t.schema_name}"`;

    const [{ rows: settingsRows }, { rows: beritaRows }, { rows: prodiRows }, { rows: ppdbRows }, { rows: dosenRows }, { rows: mahasiswaRows }] = await Promise.all([
      query('SELECT key, value FROM public.tenant_settings WHERE tenant_id = $1', [t.id]),
      query(`SELECT id, judul, ringkasan, gambar, slug, published_at FROM ${s}.berita WHERE is_published = true ORDER BY published_at DESC LIMIT 6`),
      query(`SELECT id, kode, nama, jenjang, fakultas, akreditasi FROM ${s}.program_studi ORDER BY nama`),
      query(`SELECT COUNT(*) as total FROM ${s}.ppdb_pendaftar`).catch(() => ({ rows: [{ total: 0 }] })),
      query(`SELECT COUNT(*) as total FROM ${s}.dosen`).catch(() => ({ rows: [{ total: 0 }] })),
      query(`SELECT COUNT(*) as total FROM ${s}.mahasiswa`).catch(() => ({ rows: [{ total: 0 }] })),
    ]);

    const settings: Record<string, any> = {};
    settingsRows.forEach((r: any) => { settings[r.key] = r.value; });

    const defaultLanding: Record<string, any> = {
      active: false, showBerita: true, showPPDB: true, showProdi: true, showStruktur: true, showPrestasi: true, showPromosi: true, showPopUp: false,
      heroTitle: `Selamat Datang di ${t.name}`,
      heroSubtitle: `Sistem Informasi Akademik Terpadu ${t.nama_pt}`,
      primaryColor: '#10b981',
      seoTitle: t.name,
      seoDescription: `${t.nama_pt} - ${t.name}`,
      heroImages: [],
      sambutan: { active: false, title: 'Sambutan', content: '', nama: '', jabatan: '', image: '' },
      prestasi: [
        { icon: 'Award', title: 'Akreditasi Institusi', desc: 'Terakreditasi BAN-PT' },
        { icon: 'Users', title: 'Dosen Profesional', desc: 'Tenaga pengajar berkualitas' },
        { icon: 'BookOpen', title: 'Kurikulum OBE', desc: 'Berbasis Outcome-Based Education' },
      ],
      promosi: [],
      strukturOrganisasi: [],
      popUp: { active: false, title: '', content: '', image: '', buttonText: 'Tutup', buttonLink: '' },
      tahunAkademik: '2025/2026',
    };

    let landingPage = defaultLanding;
    if (settings.landing_page) {
      try {
        const lp = typeof settings.landing_page === 'string' ? JSON.parse(settings.landing_page) : settings.landing_page;
        landingPage = { ...defaultLanding, ...lp };
        ['prestasi', 'promosi', 'strukturOrganisasi'].forEach(k => {
          if (lp[k]) landingPage[k] = lp[k];
        });
      } catch { /* use defaults */ }
    }

    if (!landingPage.active) throw new AppError(404, 'Landing page kampus tidak aktif');

    sendSuccess(res, {
      tenant: { id: t.id, slug: t.slug, name: t.name, nama_pt: t.nama_pt, singkatan: t.singkatan, logo_url: t.logo_url, alamat: t.alamat, telepon: t.telepon, email: t.email, website: t.website },
      landingPage,
      berita: beritaRows,
      programStudi: prodiRows,
      ppdbStats: { totalPendaftar: parseInt(ppdbRows[0]?.total || '0') },
      stats: {
        totalDosen: parseInt(dosenRows[0]?.total || '0'),
        totalMahasiswa: parseInt(mahasiswaRows[0]?.total || '0'),
        totalProdi: prodiRows.length,
        totalPendaftar: parseInt(ppdbRows[0]?.total || '0'),
      },
    });
  } catch (err) { next(err); }
});

export default router;
