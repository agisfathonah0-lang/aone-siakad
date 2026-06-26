import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import SplashScreen from '../components/ui/SplashScreen';
import {
  LayoutDashboard, Users, UserCheck, Building2, UserCog, BookOpen, CalendarDays,
  ClipboardCheck, Award, ClipboardList, BookTemplate, FileText, ClipboardSignature,
  Printer, ScrollText, Briefcase, GraduationCap, BookMarked, Presentation,
  MessageSquare, Star, Trophy, Receipt, CreditCard, ReceiptText,
  Library, Newspaper, Calendar, Bell, Cctv,
  Palette, DoorOpen, Globe, Database, Bot, AlertTriangle, BarChart3, Settings,
  Wallet, Sparkles, ArrowRight, Check, Menu, X, Quote, ChevronDown, Clock,
  School, Layers,
} from 'lucide-react';

const featureSlugs: Record<string, string> = {
  'Dashboard': 'dashboard',
  'Data Mahasiswa': 'data-mahasiswa',
  'Data Dosen': 'data-dosen',
  'Program Studi': 'program-studi',
  'Manajemen Users': 'manajemen-users',
  'Mata Kuliah': 'mata-kuliah',
  'Jadwal Kuliah': 'jadwal-kuliah',
  'KRS Online': 'krs-online',
  'Nilai & KHS': 'nilai-khs',
  'Absensi': 'absensi',
  'Kurikulum': 'kurikulum',
  'RPS': 'rps',
  'BAP': 'bap',
  'Absensi Dosen': 'absensi-dosen',
  'Cetak Dokumen': 'cetak-dokumen',
  'Transkrip Nilai': 'transkrip-nilai',
  'PKL': 'pkl',
  'Sidang': 'sidang',
  'KKN': 'kkn',
  'Seminar': 'seminar',
  'Perwalian': 'perwalian',
  'EDOM': 'edom',
  'Beasiswa': 'beasiswa',
  'Tagihan': 'tagihan',
  'Pembayaran': 'pembayaran',
  'Riwayat Pembayaran': 'riwayat-pembayaran',
  'Surat': 'surat',
  'Perpustakaan Digital': 'perpustakaan-digital',
  'Akreditasi BAN-PT': 'akreditasi-ban-pt',
  'Berita': 'berita',
  'Kalender Akademik': 'kalender-akademik',
  'Notifikasi': 'notifikasi',
  'CCTV': 'cctv',
  'CMS Landing Page': 'cms-landing-page',
  'PPDB Online': 'ppdb-online',
  'OJS': 'ojs',
  'Integrasi PDDIKTI': 'integrasi-pddikti',
  'Alumni': 'alumni',
  'Integrasi LMS': 'integrasi-lms',
  'Landing Page Builder': 'landing-page-builder',
  'AI Chatbot': 'ai-chatbot',
  'Generate RPS AI': 'generate-rps',
  'Plagiarism Check': 'plagiarism-check',
  'Analytics': 'analytics',
  'Laporan': 'laporan',
  'Pengaturan': 'pengaturan',
};

const featureCategories = [
  {
    label: 'Dashboard',
    items: [
      { icon: LayoutDashboard, title: 'Dashboard', desc: 'Ringkasan data akademik, statistik real-time, grafik KHS, aktivitas mahasiswa, dan notifikasi penting dalam satu layar.', slug: 'dashboard' },
    ],
  },
  {
    label: 'Manajemen Akademik',
    items: [
      { icon: Users, title: 'Data Mahasiswa', desc: 'Kelola data lengkap mahasiswa, riwayat akademik, dokumen, dan status aktif studi.', slug: 'data-mahasiswa' },
      { icon: UserCheck, title: 'Data Dosen', desc: 'Database dosen dengan riwayat mengajar, penelitian, pengabdian, dan BKD.', slug: 'data-dosen' },
      { icon: Building2, title: 'Program Studi', desc: 'Manajemen prodi, fakultas, jenjang, akreditasi, dan kurikulum.', slug: 'program-studi' },
      { icon: UserCog, title: 'Users & Roles', desc: 'Atur hak akses pengguna dengan role-based permission yang fleksibel.', slug: 'manajemen-users' },
      { icon: BookOpen, title: 'Mata Kuliah', desc: 'Kelola data mata kuliah, silabus, bobot SKS, dan dosen pengampu.', slug: 'mata-kuliah' },
      { icon: CalendarDays, title: 'Jadwal Kuliah', desc: 'Atur jadwal perkuliahan, ruangan, dosen, dengan deteksi bentrok otomatis.', slug: 'jadwal-kuliah' },
      { icon: ClipboardCheck, title: 'KRS Online', desc: 'Pengisian KRS online, validasi prasyarat, approval dosen wali, dan cetak KRS.', slug: 'krs-online' },
      { icon: Award, title: 'Nilai & KHS', desc: 'Input nilai, rekapitulasi IP/IPK, transkrip, dan cetak KHS digital.', slug: 'nilai-khs' },
      { icon: ClipboardList, title: 'Absensi', desc: 'Rekap kehadiran mahasiswa per pertemuan dengan laporan otomatis.', slug: 'absensi' },
      { icon: BookTemplate, title: 'Kurikulum', desc: 'Susun kurikulum, struktur MK per semester, dan pemetaan CPL-CPMK.', slug: 'kurikulum' },
      { icon: FileText, title: 'RPS', desc: 'Buat RPS online, review sejawat, dan cetak RPS terstandar.', slug: 'rps' },
      { icon: ClipboardSignature, title: 'BAP', desc: 'Berita Acara Perkuliahan digital, lengkap dengan materi dan kehadiran.', slug: 'bap' },
      { icon: ClipboardCheck, title: 'Absensi Dosen', desc: 'Monitoring kehadiran dosen mengajar per jadwal.', slug: 'absensi-dosen' },
      { icon: Printer, title: 'Cetak Dokumen', desc: 'Cetak KHS, transkrip, sertifikat, ijazah dengan tanda tangan digital.', slug: 'cetak-dokumen' },
      { icon: ScrollText, title: 'Transkrip Nilai', desc: 'Transkrip akademik lengkap, siap cetak, dan terintegrasi PDDIKTI.', slug: 'transkrip-nilai' },
      { icon: Briefcase, title: 'PKL', desc: 'Kelola Praktik Kerja Lapangan, dari pendaftaran hingga penilaian.', slug: 'pkl' },
      { icon: GraduationCap, title: 'Sidang', desc: 'Jadwal sidang, penguji, nilai sidang, dan kelulusan.', slug: 'sidang' },
      { icon: BookMarked, title: 'KKN', desc: 'Manajemen Kuliah Kerja Nyata, lokasi, kelompok, dan penilaian.', slug: 'kkn' },
      { icon: Presentation, title: 'Seminar', desc: 'Kelola seminar proposal dan hasil, jadwal, dan revisi.', slug: 'seminar' },
    ],
  },
  {
    label: 'Perkuliahan',
    items: [
      { icon: MessageSquare, title: 'Perwalian', desc: 'Dosen wali memantau akademik, approve KRS, dan konsultasi mahasiswa.', slug: 'perwalian' },
      { icon: Star, title: 'EDOM', desc: 'Evaluasi Dosen oleh Mahasiswa, kuesioner online, dan laporan mutu.', slug: 'edom' },
      { icon: Trophy, title: 'Beasiswa', desc: 'Manajemen beasiswa, seleksi penerima, dan monitoring penerima.', slug: 'beasiswa' },
    ],
  },
  {
    label: 'Keuangan',
    items: [
      { icon: Receipt, title: 'Tagihan', desc: 'Atur tagihan SPP, biaya kuliah tunggal, dan komponen biaya lainnya.', slug: 'tagihan' },
      { icon: CreditCard, title: 'Pembayaran', desc: 'Pembayaran online multi-gateway, VA, kartu kredit, dan konfirmasi otomatis.', slug: 'pembayaran' },
      { icon: ReceiptText, title: 'Riwayat Pembayaran', desc: 'Riwayat pembayaran lengkap, histori, dan cetak bukti bayar.', slug: 'riwayat-pembayaran' },
    ],
  },
  {
    label: 'Layanan & Fasilitas',
    items: [
      { icon: FileText, title: 'Surat', desc: 'Ajukan surat keterangan aktif, rekomendasi, izin, dan lainnya secara online.', slug: 'surat' },
      { icon: Library, title: 'Perpustakaan Digital', desc: 'Katalog online, e-book, repositori, dan manajemen peminjaman.', slug: 'perpustakaan-digital' },
      { icon: Award, title: 'Akreditasi', desc: '9 standar BAN-PT, borang akreditasi, dan pemantauan siklus.', slug: 'akreditasi-ban-pt' },
      { icon: Newspaper, title: 'Berita', desc: 'Publikasi berita kampus, pengumuman, dan agenda.', slug: 'berita' },
      { icon: Calendar, title: 'Kalender Akademik', desc: 'Kalender akademik interaktif dengan semua agenda penting.', slug: 'kalender-akademik' },
      { icon: Bell, title: 'Notifikasi', desc: 'Sistem notifikasi real-time untuk pengumuman, tagihan, dan jadwal.', slug: 'notifikasi' },
      { icon: Cctv, title: 'CCTV', desc: 'Monitoring CCTV kampus melalui dashboard terintegrasi.', slug: 'cctv' },
    ],
  },
  {
    label: 'Integrasi & Platform',
    items: [
      { icon: Palette, title: 'CMS Landing Page', desc: 'Kelola konten website kampus dengan CMS terintegrasi.', slug: 'cms-landing-page' },
      { icon: DoorOpen, title: 'PPDB Online', desc: 'Penerimaan mahasiswa baru online, dari pendaftaran hingga daftar ulang.', slug: 'ppdb-online' },
      { icon: BookOpen, title: 'OJS', desc: 'Open Journal System untuk pengelolaan jurnal ilmiah kampus.', slug: 'ojs' },
      { icon: Database, title: 'PDDIKTI', desc: 'Sinkronisasi otomatis data ke PDDIKTI real-time.', slug: 'integrasi-pddikti' },
      { icon: Users, title: 'Alumni', desc: 'Database alumni, tracer study, dan jejaring alumni.', slug: 'alumni' },
      { icon: Globe, title: 'Integrasi LMS', desc: 'Integrasi dengan LMS populer seperti Moodle, Google Classroom.', slug: 'integrasi-lms' },
      { icon: Layers, title: 'Landing Page Builder', desc: 'Buat website kampus sendiri dengan drag & drop builder tanpa coding.', slug: 'landing-page-builder' },
    ],
  },
  {
    label: 'Fitur AI',
    items: [
      { icon: Bot, title: 'AI Chatbot', desc: 'Asisten AI untuk menjawab pertanyaan akademik mahasiswa secara real-time.', slug: 'ai-chatbot' },
      { icon: BookOpen, title: 'Generate RPS', desc: 'Buat RPS otomatis dengan bantuan AI berdasarkan template dan CPMK.', slug: 'generate-rps' },
      { icon: AlertTriangle, title: 'Plagiarism Check', desc: 'Cek plagiarisme dokumen akademik dengan database terintegrasi.', slug: 'plagiarism-check' },
      { icon: BarChart3, title: 'Analytics', desc: 'Analytics akademik, tren nilai, prediksi kelulusan, dan rekomendasi.', slug: 'analytics' },
    ],
  },
  {
    label: 'Laporan & Pengaturan',
    items: [
      { icon: BarChart3, title: 'Laporan', desc: 'Laporan akademik, keuangan, dan akreditasi dengan export PDF/Excel.', slug: 'laporan' },
      { icon: Settings, title: 'Pengaturan', desc: 'Konfigurasi sistem, role, template, dan preferensi kampus.', slug: 'pengaturan' },
    ],
  },
];

const testimonials = [
  { quote: 'AONE SIAKAD membantu kami mengelola administrasi akademik dengan sangat efisien. Implementasinya cepat dan tim support sangat responsif.', name: 'Dr. Ahmad Fauzi, M.Pd.', institution: 'Universitas Pendidikan Indonesia' },
  { quote: 'Setelah migrasi ke AONE SIAKAD, proses PPDB kami menjadi 3x lebih cepat. Dashboard yang intuitif memudahkan tim dalam memantau pendaftaran.', name: 'Rina Wijaya, S.Kom., M.T.', institution: 'Politeknik Negeri Bandung' },
  { quote: 'Fitur integrasi PDDIKTI sangat membantu. Data otomatis tersinkronisasi tanpa perlu input manual berulang kali.', name: 'Prof. Dr. Budi Santoso', institution: 'Universitas Gadjah Mada' },
];

const pricingPlans = [
  { name: 'Basic', price: 'Rp 149rb', period: '/bulan', desc: 'Untuk institusi kecil yang ingin memulai digitalisasi.', features: ['Manajemen Akademik Dasar', '100 Mahasiswa', '3 Admin', 'KRS & KHS Online', 'Cetak Dokumen Dasar', 'Aplikasi Mobile'], popular: false },
  { name: 'Pro', price: 'Rp 599rb', period: '/bulan', desc: 'Solusi lengkap untuk institusi berkembang.', features: ['Semua Fitur Basic', '1.000+ Mahasiswa', '10 Admin', 'Keuangan Terintegrasi', 'Integrasi PDDIKTI', 'Landing Page Builder', 'Dukungan Prioritas 24/7'], popular: true },
  { name: 'Enterprise', price: 'Rp 1.499rb', period: '/bulan', desc: 'Untuk universitas besar dengan kebutuhan kompleks.', features: ['Semua Fitur Pro', 'Unlimited Mahasiswa', 'Admin Tak Terbatas', 'Kustomisasi Modul', 'SLA 99.9%', 'Dedicated Support', 'On-Premise Opsional'], popular: false },
];

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, 25);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref}>{count}{suffix}</div>;
}

function useReveal(ref: React.RefObject<HTMLElement | null>, cls = 'section-visible') {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add(cls); observer.disconnect(); }
    }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, cls]);
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [promoSlots, setPromoSlots] = useState(10);
  const [taglineIdx, setTaglineIdx] = useState(0);
  const fiturRef = useRef<HTMLElement>(null);
  const testimoniRef = useRef<HTMLElement>(null);
  const hargaRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const demoRef = useRef<HTMLElement>(null);
  useReveal(fiturRef);
  useReveal(testimoniRef);
  useReveal(hargaRef);
  useReveal(ctaRef);
  useReveal(demoRef);

  const taglines = ['Modern', 'Terintegrasi', 'All-in-One', 'Digital'];

  useEffect(() => {
    const id = setInterval(() => setTaglineIdx(p => (p + 1) % taglines.length), 2500);
    return () => clearInterval(id);
  }, []);

  useSEO(
    'AONE SIAKAD - Sistem Informasi Akademik Terintegrasi',
    'Sistem Informasi Akademik terintegrasi untuk institusi pendidikan di Indonesia. Kelola akademik, keuangan, perpustakaan, PPDB, dan akreditasi dalam satu platform.',
    '/logo.jpg'
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromoSlots(prev => Math.max(prev - (Math.random() > 0.9 ? 1 : 0), 0));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen duration={1500} onDone={() => setShowSplash(false)} />}
      <div className="min-h-screen font-sans bg-white text-slate-900 overflow-x-hidden" style={{ display: showSplash ? 'none' : undefined }}>
      <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-indigo-600 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-white/90">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Promo Launch! Diskon <strong>50%</strong> untuk 10 institusi pertama</span>
          </div>
          <button onClick={() => navigate('/register')} className="w-full sm:w-auto px-5 py-2 bg-white text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap">
            Daftar Sekarang <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-white">
              <img src="/logo.jpg" alt="AONE" className="h-8 w-auto" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800">AONE SIAKAD</span>
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            <a href="#hero" className="px-4 py-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors font-medium">Beranda</a>
            <Link to="/fitur/manajemen-akademik" className="px-4 py-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors font-medium">Fitur</Link>
            <Link to="/testimoni" className="px-4 py-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors font-medium">Testimonial</Link>
            <Link to="/harga" className="px-4 py-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors font-medium">Harga</Link>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/register')} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-105">
              Demo Gratis
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 text-slate-700">
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <section id="hero" className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
        {/* Tech grid background */}
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '20px 20px' }} />

        {/* Animated tech orbs */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[180px] animate-pulse-glow" style={{ animationDelay: '4s' }} />

        {/* Rotating tech rings */}
        <div className="absolute top-1/3 right-1/4 w-64 h-64 border border-emerald-500/20 rounded-full animate-rotate-line" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 border border-teal-500/15 rounded-full animate-rotate-line" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 border border-indigo-500/15 rounded-full animate-rotate-line" style={{ animationDuration: '25s' }} />

        {/* Floating tech particles */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-emerald-400/60 rounded-full shadow-[0_0_6px_2px_rgba(52,211,153,0.3)] animate-drift" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-teal-400/50 rounded-full shadow-[0_0_8px_3px_rgba(45,212,191,0.25)] animate-drift" style={{ animationDelay: '2s', animationDuration: '15s' }} />
        <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-indigo-400/50 rounded-full shadow-[0_0_6px_2px_rgba(129,140,248,0.3)] animate-drift" style={{ animationDelay: '4s', animationDuration: '10s' }} />
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-emerald-500/40 rounded-full shadow-[0_0_10px_4px_rgba(16,185,129,0.2)] animate-drift" style={{ animationDelay: '1s', animationDuration: '18s' }} />
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-teal-300/50 rounded-full shadow-[0_0_6px_2px_rgba(94,234,212,0.3)] animate-drift" style={{ animationDelay: '3s', animationDuration: '14s' }} />

        {/* Glowing accent lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold mb-6 animate-fade-up">
              <Sparkles size={12} /> Platform SIAKAD No.1 di Indonesia
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-white leading-[1.05] mb-4">
              SIAKAD{' '}
              <span className="relative inline-block">
                <span className="text-emerald-400">{taglines[taglineIdx]}</span>
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-emerald-400/30 rounded-full" />
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mb-8 animate-fade-up-delay-1">
              Kelola akademik, keuangan, perpustakaan, PPDB, dan akreditasi dalam satu platform terintegrasi. 
              Dipercaya 100+ institusi pendidikan di Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 animate-fade-up-delay-2">
              <button onClick={() => navigate('/register')} className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all inline-flex items-center justify-center gap-2">
                Demo Gratis <ArrowRight size={16} />
              </button>
              <a href="#fitur" className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-white/10 hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2 backdrop-blur-sm">
                Lihat Fitur
              </a>
            </div>
            <div className="flex items-center gap-6 mt-8 text-xs text-slate-400 animate-fade-up-delay-3">
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Gratis 14 hari</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> No CC required</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Support 24/7</span>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" ref={fiturRef} className="py-24 relative bg-white section-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-emerald-600 text-sm font-bold font-mono tracking-widest uppercase">Fitur Lengkap</span>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-slate-900">Semua Kebutuhan Akademik dalam Satu Platform</h2>
            <p className="text-lg text-slate-500">{featureCategories.flatMap(c => c.items).length}+ modul terintegrasi untuk mendukung seluruh operasional perguruan tinggi.</p>
          </div>

          {featureCategories.map((cat, ci) => (
            <div key={cat.label} className="mb-12 last:mb-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 rounded-full bg-emerald-500" />
                <h3 className="text-xl font-bold font-display text-slate-900">{cat.label}</h3>
                <span className="text-xs text-slate-400 font-medium">({cat.items.length} modul)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cat.items.map((f, i) => (
                  <Link
                    key={f.title}
                    to={`/fitur/${featureSlugs[f.title]}`}
                    className="group relative p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-fade-up"
                    style={{ animationDelay: `${(ci * cat.items.length + i) * 0.03}s`, animationFillMode: 'both' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                        <f.icon className="w-4.5 h-4.5 text-emerald-600" style={{ width: 18, height: 18 }} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 mb-0.5">{f.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{f.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Screenshots */}
      <section ref={demoRef} className="py-24 relative bg-slate-50 section-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-emerald-600 text-sm font-bold font-mono tracking-widest uppercase">Demo Dashboard</span>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-slate-900">Lihat Tampilan Dashboard SIAKAD</h2>
            <p className="text-lg text-slate-500">Interface modern, responsif, dan mudah digunakan di semua perangkat.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="group relative animate-fade-up" style={{ animationFillMode: 'both' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative rounded-2xl border border-slate-200 overflow-hidden shadow-xl bg-white">
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img src="/images/ss.png" alt="Dashboard SIAKAD - Overview" className="w-full h-full object-cover object-top" />
                </div>
                <div className="p-4 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-900">Dashboard Overview</p>
                  <p className="text-xs text-slate-500 mt-0.5">Ringkasan statistik, grafik, dan aktivitas real-time</p>
                </div>
              </div>
            </div>
            <div className="group relative animate-fade-up" style={{ animationFillMode: 'both', animationDelay: '0.15s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative rounded-2xl border border-slate-200 overflow-hidden shadow-xl bg-white">
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img src="/images/ss2.png" alt="Dashboard SIAKAD - Akademik" className="w-full h-full object-cover object-top" />
                </div>
                <div className="p-4 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-900">Manajemen Akademik</p>
                  <p className="text-xs text-slate-500 mt-0.5">Data mahasiswa, dosen, jadwal, dan KHS terintegrasi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="promo" className="py-24 relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-indigo-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" /> Promo Spesial Launch!
          </div>
          <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white mb-4">
            Diskon 50% untuk 10 Institusi Pertama
          </h2>
          <p className="text-xl text-emerald-100/80 max-w-2xl mx-auto mb-8">
            Dapatkan potongan harga spesial untuk tahun pertama berlangganan AONE SIAKAD. Promo terbatas!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Clock className="w-5 h-5 text-emerald-200" />
              <span className="text-white font-semibold">Sisa <span className="text-2xl font-black font-display text-emerald-200">{promoSlots}</span> slot</span>
            </div>
          </div>
          <button onClick={() => navigate('/register')} className="px-10 py-4 bg-white text-emerald-700 rounded-2xl text-lg font-bold shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 transition-all inline-flex items-center gap-2">
            Daftar Sekarang <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section id="testimonial" ref={testimoniRef} className="py-24 relative bg-slate-50 section-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-emerald-600 text-sm font-bold font-mono tracking-widest uppercase">Testimonial</span>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-slate-900">Apa Kata Mereka?</h2>
            <p className="text-lg text-slate-500">Ribuan institusi telah merasakan manfaat AONE SIAKAD dalam transformasi digital kampus.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 animate-fade-up" style={{ animationDelay: `${i * 0.15}s`, animationFillMode: 'both' }}>
                <Quote className="w-8 h-8 text-emerald-400/30 mb-4" />
                <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.name}</p>
                    <p className="text-[10px] text-slate-400">{t.institution}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/testimoni" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
              Lihat Semua Testimoni <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section id="harga" ref={hargaRef} className="py-24 relative bg-white section-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-emerald-600 text-sm font-bold font-mono tracking-widest uppercase">Harga</span>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-slate-900">Pilihan Paket Fleksibel</h2>
            <p className="text-lg text-slate-500">Mulai dari gratis untuk institusi kecil hingga enterprise untuk universitas besar.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`relative rounded-2xl border-2 p-8 transition-all duration-300 hover:-translate-y-1 animate-fade-up ${plan.popular ? 'border-emerald-500 bg-white shadow-xl shadow-emerald-500/10 scale-105 md:scale-110' : 'border-slate-200 bg-white hover:shadow-lg'}`} style={{ animationDelay: `${i * 0.12}s`, animationFillMode: 'both' }}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold rounded-full shadow-lg">
                    Paling Populer
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold font-display text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black font-display text-slate-900">{plan.price}</span>
                    <span className="text-sm text-slate-400">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-3">{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                  <button onClick={() => navigate('/register')} className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${plan.popular ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    Mulai Gratis
                  </button>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/harga" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
              Lihat Detail Harga & FAQ <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section ref={ctaRef} className="py-20 relative overflow-hidden bg-gradient-to-r from-emerald-600 to-indigo-700 section-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-white mb-4">
            Siap Digitalisasi Kampus?
          </h2>
          <p className="text-xl text-emerald-100/80 max-w-2xl mx-auto mb-8">
            Konsultasi gratis dengan tim kami dan dapatkan demo eksklusif untuk institusi Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="px-8 py-4 bg-white text-emerald-700 rounded-2xl text-base font-bold shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2">
              Ajukan Demo Gratis <ArrowRight className="w-5 h-5" />
            </button>
            <Link to="/fitur/data-mahasiswa" className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl text-base font-semibold hover:bg-white/20 transition inline-flex items-center gap-2">
              Pelajari Fitur
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1 rounded-xl bg-slate-900">
                  <img src="/logo.jpg" alt="AONE" className="h-8 w-auto brightness-0 invert" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">AONE SIAKAD</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">Platform SIAKAD all-in-one untuk universitas Indonesia. Dipercaya 100+ kampus mitra di seluruh Indonesia.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-300 mb-4">Akademik</h4>
              <ul className="space-y-2">
                {featureCategories[1].items.slice(0, 7).map((f) => (
                  <li key={f.title}><Link to={`/fitur/${featureSlugs[f.title]}`} className="text-sm text-slate-400 hover:text-emerald-400 transition">{f.title}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-300 mb-4">Layanan</h4>
              <ul className="space-y-2">
                {featureCategories[4].items.slice(0, 6).map((f) => (
                  <li key={f.title}><Link to={`/fitur/${featureSlugs[f.title]}`} className="text-sm text-slate-400 hover:text-emerald-400 transition">{f.title}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-300 mb-4">Tautan</h4>
              <ul className="space-y-2">
                <li><Link to="/testimoni" className="text-sm text-slate-400 hover:text-emerald-400 transition">Testimoni</Link></li>
                <li><Link to="/harga" className="text-sm text-slate-400 hover:text-emerald-400 transition">Harga</Link></li>
                <li><Link to="/fitur/data-mahasiswa" className="text-sm text-slate-400 hover:text-emerald-400 transition">Fitur</Link></li>
                <li><Link to="/login?tenant=demo" className="text-sm text-slate-400 hover:text-emerald-400 transition">Demo</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <span>&copy; 2026 AONE Project. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
