import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get } from '../api/client';
import useSEO from '../hooks/useSEO';
import SplashScreen from '../components/ui/SplashScreen';
import { Building2, GraduationCap, Users, BookOpen, ArrowRight, ExternalLink, Award, UserCheck, ChevronUp, X, Mail, Phone, MapPin, Calendar, Quote, Sparkles, Play, CheckCircle, Star, Globe, FlaskConical, UsersRound, Library, Monitor, HeartHandshake, MapPinHouse, ChevronRight, QuoteIcon, Flower2, Menu, Camera, Trophy, Zap, Target, Shield, Lightbulb, BrainCircuit } from 'lucide-react';

interface CampusData {
  tenant: {
    id: string; slug: string; name: string; nama_pt: string; singkatan: string;
    logo_url: string; alamat: string; telepon: string; email: string; website: string;
  };
  landingPage: {
    active: boolean; showBerita: boolean; showPPDB: boolean; showProdi: boolean;
    showStruktur: boolean; showPrestasi: boolean; showPromosi: boolean; showPopUp: boolean;
    heroTitle: string; heroSubtitle: string; primaryColor: string;
    seoTitle: string; seoDescription: string;
    heroImages: string[];
    sambutan: { active: boolean; title: string; content: string; nama: string; jabatan: string; image: string };
    prestasi: Array<{ icon: string; title: string; desc: string }>;
    promosi: Array<{ title: string; description: string; image: string; link: string }>;
    strukturOrganisasi: Array<{ id: string; jabatan: string; nama: string; image: string }>;
    popUp: { active: boolean; title: string; content: string; image: string; buttonText: string; buttonLink: string };
    tahunAkademik: string;
  };
  berita: Array<{ id: string; judul: string; ringkasan: string; gambar: string; slug: string; published_at: string }>;
  programStudi: Array<{ id: string; kode: string; nama: string; jenjang: string; fakultas: string; akreditasi: string }>;
  ppdbStats: { totalPendaftar: number };
  stats: { totalDosen: number; totalMahasiswa: number; totalProdi: number; totalPendaftar: number };
}

function hexToRgb(hex: string) {
  const c = hex.replace('#', '');
  return { r: parseInt(c.substring(0, 2), 16), g: parseInt(c.substring(2, 4), 16), b: parseInt(c.substring(4, 6), 16) };
}

function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useReveal();
  return <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>{children}</div>;
}

function Blob({ color = '#10b981', className = '' }: { color?: string; className?: string }) {
  return <div className={`absolute rounded-full blur-[120px] opacity-20 ${className}`} style={{ backgroundColor: color }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-emerald-500 text-[10px] font-black font-mono tracking-[0.3em] uppercase">{children}</span>;
}

export default function CampusLandingPageWrapper() {
  const { slug } = useParams();
  return <CampusLandingPage slug={slug!} />;
}

function CampusLandingPage({ slug }: { slug: string }) {
  const [data, setData] = useState<CampusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroIdx, setHeroIdx] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useSEO(data?.landingPage.seoTitle || data?.tenant.name || 'Kampus', data?.landingPage.seoDescription || '', data?.tenant.logo_url || '/logo.jpg');

  useEffect(() => {
    setLoading(true);
    get<CampusData>(`/public/kampus/${slug}`)
      .then(d => { setData(d); localStorage.setItem('aone_tenant_slug', slug); })
      .catch((err: any) => setError(err.response?.data?.message || 'Kampus tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!data || !data.landingPage.showPopUp || !data.landingPage.popUp.active) return;
    const seen = localStorage.getItem(`popup_${slug}_seen`);
    if (seen === 'true') return;
    const t = setTimeout(() => setShowPopup(true), 1000);
    return () => clearTimeout(t);
  }, [data, slug]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nextHero = useCallback(() => {
    const imgs = data?.landingPage.heroImages?.filter(Boolean) || [];
    if (imgs.length < 2) return;
    setHeroIdx(p => (p + 1) % imgs.length);
  }, [data]);

  useEffect(() => {
    const imgs = data?.landingPage.heroImages?.filter(Boolean) || [];
    if (imgs.length < 2) return;
    const id = setInterval(nextHero, 5000);
    return () => clearInterval(id);
  }, [data, nextHero]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading || !splashDone) return (
    <SplashScreen logo={data?.tenant.logo_url || '/logo.jpg'} nama={data?.tenant.nama_pt || 'Memuat...'} duration={3000} onDone={() => setSplashDone(true)} />
  );

  if (error || !data) return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
      <div className="text-center">
        <Building2 className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
        <p className="text-zinc-400 text-sm">{error || 'Kampus tidak ditemukan'}</p>
      </div>
    </div>
  );

  const { tenant, landingPage, berita, programStudi, stats } = data;
  const c = landingPage.primaryColor || '#006d36';
  const heroImgs = landingPage.heroImages?.filter(Boolean) || [];
  const { popUp } = landingPage;

  const sambutan = landingPage.sambutan?.active ? landingPage.sambutan : {
    active: true, title: 'Sambutan',
    content: `${tenant.nama_pt} berkomitmen menciptakan lingkungan akademik yang inovatif, inklusif, dan berdaya saing global. Dengan tenaga pengajar profesional dan kurikulum berbasis Outcome-Based Education, kami siap mencetak lulusan yang kompeten dan berkarakter.`,
    nama: `Rektor ${tenant.nama_pt}`, jabatan: 'Rektor', image: ''
  };

  const prestasi = landingPage.prestasi?.length > 0 ? landingPage.prestasi : [
    { icon: 'Award', title: 'Akreditasi Unggul', desc: 'Terakreditasi BAN-PT dengan peringkat UNGGUL di seluruh program studi.' },
    { icon: 'Users', title: 'Dosen Profesional', desc: 'Tenaga pengajar tersertifikasi dan berpengalaman di bidangnya.' },
    { icon: 'BookOpen', title: 'Kurikulum OBE', desc: 'Kurikulum berbasis Outcome-Based Education yang relevan dengan industri.' },
    { icon: 'GraduationCap', title: 'Alumni Berprestasi', desc: 'Alumni tersebar di perusahaan ternama dan institusi pemerintah.' },
  ];

  const promosi = landingPage.promosi?.length > 0 ? landingPage.promosi : [
    { title: 'Beasiswa Prestasi', description: 'Dapatkan beasiswa penuh untuk mahasiswa berprestasi akademik dan non-akademik.', image: '', link: '#' },
    { title: 'Pertukaran Mahasiswa', description: 'Program pertukaran mahasiswa ke universitas mitra di luar negeri.', image: '', link: '#' },
    { title: 'Kampus Mengajar', description: 'Ikuti program kampus mengajar dan dapatkan pengalaman berharga.', image: '', link: '#' },
  ];

  const struktur = landingPage.strukturOrganisasi?.length > 0 ? landingPage.strukturOrganisasi : [
    { id: '1', jabatan: 'Rektor', nama: `Rektor ${tenant.nama_pt}`, image: '' },
    { id: '2', jabatan: 'Wakil Rektor I', nama: 'Wakil Rektor Bidang Akademik', image: '' },
    { id: '3', jabatan: 'Wakil Rektor II', nama: 'Wakil Rektor Bidang Keuangan', image: '' },
    { id: '4', jabatan: 'Wakil Rektor III', nama: 'Wakil Rektor Bidang Kemahasiswaan', image: '' },
  ];

  const testimoni = [
    { nama: 'Ahmad Fauzi', prodi: 'Teknik Informatika', tahun: '2021', quote: `Kuliah di ${tenant.singkatan || tenant.nama_pt} memberikan pengalaman luar biasa. Dosen-dosennya sangat kompeten dan fasilitasnya mendukung penuh proses belajar.` },
    { nama: 'Siti Nurhaliza', prodi: 'Manajemen', tahun: '2022', quote: 'Alhamdulillah, saya mendapatkan beasiswa penuh dan lulus dengan predikat cumlaude. Kampus ini benar-benar peduli dengan prestasi mahasiswa.' },
    { nama: 'Rudi Hermawan', prodi: 'Hukum', tahun: '2020', quote: 'Jaringan alumni yang kuat membantu saya mendapatkan pekerjaan di firma hukum terkemuka segera setelah lulus. Terima kasih kampusku.' },
  ];

  const fasilitas = [
    { icon: Library, title: 'Perpustakaan Digital', desc: 'Akses ke ribuan jurnal nasional dan internasional, e-book, dan database ilmiah.' },
    { icon: Monitor, title: 'Lab Komputer', desc: 'Laboratorium komputer modern dengan spesifikasi tinggi untuk praktikum dan riset.' },
    { icon: FlaskConical, title: 'Lab Sains', desc: 'Laboratorium sains terpadu untuk penelitian biologi, kimia, dan fisika.' },
    { icon: UsersRound, title: 'Ruang Kolaborasi', desc: 'Ruang diskusi dan co-working yang nyaman untuk kerja kelompok dan proyek.' },
    { icon: HeartHandshake, title: 'Biro Karir', desc: 'Pusat pengembangan karir dan penempatan kerja bagi mahasiswa dan alumni.' },
    { icon: MapPinHouse, title: 'Kampus Hijau', desc: 'Lingkungan kampus yang asri, hijau, dan nyaman untuk kegiatan akademik.' },
  ];

  const keunggulan = [
    { icon: BookOpen, title: 'Kurikulum Terkini', desc: 'Kurikulum berbasis KKNI dan OBE yang disusun bersama praktisi industri untuk menjamin relevansi dengan dunia kerja.' },
    { icon: Users, title: 'Pengajar Berkualitas', desc: 'Dosen tersertifikasi dengan latar belakang pendidikan terbaik dan pengalaman di bidangnya masing-masing.' },
    { icon: Globe, title: 'Jaringan Luas', desc: 'Kerjasama dengan berbagai universitas dan industri di dalam maupun luar negeri untuk magang dan riset.' },
    { icon: HeartHandshake, title: 'Beasiswa', desc: 'Berbagai program beasiswa prestasi dan kebutuhan bagi mahasiswa berprestasi dan kurang mampu.' },
  ];

  const nav = [
    { id: 'visi-misi', label: 'Visi Misi' },
    { id: 'program-studi', label: 'Program' },
    { id: 'fasilitas', label: 'Fasilitas' },
    { id: 'berita', label: 'Berita' },
    ...(landingPage.showPPDB ? [{ id: 'ppdb', label: 'PPDB' }] : []),
  ];

  const iconNames: Record<string, any> = { Award, Users, BookOpen, GraduationCap, Star, Globe, Trophy, Shield, Target };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#1e293b] font-sans antialiased overflow-x-hidden">
      {/* Back to top */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 ${showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        style={{ backgroundColor: c }}>
        <ChevronUp size={20} />
      </button>

      {/* Header */}
      <header className="w-full top-0 sticky z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg overflow-hidden" style={{ backgroundColor: c }}>
              {tenant.logo_url ? <img src={tenant.logo_url} alt="" className="w-full h-full object-cover" /> : tenant.singkatan?.charAt(0) || 'K'}
            </div>
            <div className="hidden sm:block">
              <span className="font-black tracking-tight text-lg leading-none">{tenant.singkatan || tenant.nama_pt}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">{tenant.nama_pt}</span>
                <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: c }} />
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            {nav.map(n => (
              <a key={n.id} href={`#${n.id}`} onClick={e => { e.preventDefault(); scrollTo(n.id); }}
                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-colors">{n.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a href={`/login?tenant=${slug}`}
              className="hidden sm:flex px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 items-center gap-2 text-white" style={{ backgroundColor: c, boxShadow: `0 4px 16px ${c}40` }}>
              <UserCheck className="w-4 h-4" /> Portal
            </a>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-3 rounded-2xl border border-slate-200 text-slate-400">
              <Menu size={20} />
            </button>
          </div>
        </div>

        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="px-6 pb-6 flex flex-col gap-4 border-t border-slate-100 pt-4">
            {nav.map(n => (
              <a key={n.id} href={`#${n.id}`} onClick={e => { e.preventDefault(); scrollTo(n.id); }}
                className="text-xs font-black uppercase tracking-widest text-slate-400 py-2">{n.label}</a>
            ))}
            <a href={`/login?tenant=${slug}`}
              className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-white text-center shadow-lg" style={{ backgroundColor: c }}>
              Portal Akademik
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ═══ HERO ═══ */}
        <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-slate-950">
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-slate-950" />
          <Blob color="#10b981" className="top-1/4 -left-20 w-96 h-96 animate-pulse" />
          <Blob color="#6366f1" className="bottom-1/4 -right-20 w-96 h-96 animate-pulse" />

          {heroImgs.length > 0 ? (
            heroImgs.map((img, i) => (
              <div key={i} className={`absolute inset-0 transition-all duration-1000 ${i === heroIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
                <img src={img} alt="" className="w-full h-full object-cover brightness-[35%] grayscale-[20%]" />
              </div>
            ))
          ) : (
            <div className={`absolute inset-0 opacity-20`} style={{ backgroundColor: c }} />
          )}

          <div className="relative z-30 max-w-7xl mx-auto px-6 pt-32 lg:pt-40 pb-48 lg:pb-64 w-full">
            <FadeIn>
              <div className="max-w-4xl">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl mb-8">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-400">Penerimaan Mahasiswa Baru {landingPage.tahunAkademik}</span>
                </div>

                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
                  {(() => {
                    const words = (landingPage.heroTitle || tenant.nama_pt).split(' ');
                    const mid = Math.max(1, words.length - 1);
                    return (<>{words.slice(0, mid).join(' ')} <br className="hidden sm:block" /><span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">{words.slice(mid).join(' ')}</span></>);
                  })()}
                </h1>

                <p className="text-lg md:text-2xl text-slate-300/90 max-w-2xl font-medium leading-relaxed tracking-tight mt-6">
                  {landingPage.heroSubtitle || `Membangun intelejensia dan karakter masa depan dengan kurikulum islami modern dan ekosistem digital.`}
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-5 pt-12">
                  {landingPage.showPPDB && (
                    <Link to={`/kampus/${slug}/ppdb`}
                      className="group px-10 py-5 rounded-full font-black uppercase tracking-[0.15em] text-xs text-white shadow-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: c, boxShadow: `0 20px 50px ${c}40` }}>
                      Daftar Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                  <a href="#visi-misi" onClick={e => { e.preventDefault(); scrollTo('visi-misi'); }}
                    className="px-10 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-2xl border border-white/20 text-white rounded-full font-black uppercase tracking-[0.15em] text-xs transition-all flex items-center gap-3 shadow-2xl">
                    <Play className="w-5 h-5 text-emerald-400" /> Jelajahi
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Stats strip */}
          <div className="absolute bottom-0 left-0 w-full z-30">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t border-white/10 backdrop-blur-xl bg-slate-950/20">
                {[
                  { label: 'Mahasiswa Aktif', val: stats.totalMahasiswa + '+' },
                  { label: 'Program Studi', val: stats.totalProdi },
                  { label: 'Tenaga Pendidik', val: stats.totalDosen },
                  { label: 'Pendaftar PPDB', val: stats.totalPendaftar },
                ].map((s, i) => (
                  <div key={i} className="text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                    <p className="text-2xl md:text-3xl font-black text-white">{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ VISI MISI ═══ */}
        <section id="visi-misi" className="py-32 md:py-40 relative overflow-hidden bg-white">
          <Blob color="#10b981" className="top-1/2 left-0 w-[500px] h-[500px] -translate-x-1/2" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <FadeIn>
                  <div className="relative z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[100px]" style={{ backgroundColor: `${c}15` }} />
                    <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20" />
                      {heroImgs[0] ? <img src={heroImgs[0]} alt="" className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${c}10` }}>
                          <Building2 size={64} className="opacity-30" style={{ color: c }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-8 -right-4 z-20 p-5 rounded-2xl bg-white shadow-2xl border border-slate-100 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c}12`, color: c }}>
                        <Trophy size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prestasi</p>
                        <p className="text-sm font-black">Akreditasi Unggul</p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>

              <FadeIn>
                <div className="space-y-10">
                  <div className="space-y-5">
                    <SectionLabel>Visi & Misi</SectionLabel>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85]">
                      Unggul Islami <br />
                      <span className="text-slate-300">& Modern.</span>
                    </h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
                      {tenant.nama_pt} berkomitmen mencetak lulusan yang berakhlakul karimah, mandiri, dan kompetitif secara nasional.
                    </p>
                  </div>
                  <div className="p-8 rounded-[2.5rem] border" style={{ backgroundColor: `${c}06`, borderColor: `${c}15` }}>
                    <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: c }}>Visi Institusi</p>
                    <p className="text-lg md:text-xl font-medium italic leading-relaxed text-slate-600">
                      "Terwujudnya Program Pendidikan Tinggi yang Unggul, Islami, dan Modern di Provinsi Jambi pada tahun 2030."
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Menyelenggarakan pendidikan tinggi yang berkualitas dan berdaya saing.",
                      "Melaksanakan penelitian berbasis pemberdayaan masyarakat.",
                      "Mengembangkan tata kelola institusi yang transparan dan akuntabel.",
                      "Mengintegrasikan nilai-nilai keislaman dalam setiap disiplin ilmu."
                    ].map((m, i) => (
                      <div key={i} className="flex items-center gap-3 group">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: `${c}10` }}>
                          <CheckCircle size={14} style={{ color: c }} />
                        </div>
                        <p className="text-sm font-semibold text-slate-500">{m}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ═══ WHY CHOOSE US ═══ */}
        <section className="py-32 relative overflow-hidden bg-slate-50">
          <Blob color="#10b981" className="top-1/2 right-0 w-[400px] h-[400px] translate-x-1/2" />
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center max-w-3xl mx-auto mb-20">
              <SectionLabel>Keunggulan</SectionLabel>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mt-4">Mengapa Memilih Kami?</h2>
              <p className="text-lg text-slate-500 font-medium mt-4">Kami berkomitmen memberikan yang terbaik untuk setiap mahasiswa</p>
            </FadeIn>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {keunggulan.map((item, i) => {
                const Icon = item.icon;
                return (
                  <FadeIn key={i}>
                    <div className="group p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors" style={{ backgroundColor: `${c}10`, color: c }}>
                        <Icon size={24} />
                      </div>
                      <h3 className="font-black text-lg tracking-tight mb-3">{item.title}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ PROGRAM STUDI ═══ */}
        {landingPage.showProdi && programStudi.length > 0 && (
          <section id="program-studi" className="py-32 max-w-7xl mx-auto px-6">
            <FadeIn className="text-center max-w-3xl mx-auto mb-20">
              <SectionLabel>Program Akademik</SectionLabel>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mt-4">Menembus Batas <br />Inovasi Pendidikan</h2>
              <p className="text-lg text-slate-500 font-medium mt-4">Kurikulum kami dirancang untuk membekali Anda dengan kompetensi global yang dicari di era digital.</p>
            </FadeIn>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programStudi.map((p, i) => (
                <FadeIn key={p.id}>
                  <div className="group p-8 rounded-[3rem] border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${c}10`, color: c }}>
                        <BookOpen size={22} />
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${p.akreditasi === 'Unggul' || p.akreditasi === 'A' ? 'text-white' : 'bg-slate-100 text-slate-500'} shadow-lg`} style={p.akreditasi === 'Unggul' || p.akreditasi === 'A' ? { backgroundColor: c } : {}}>
                        {p.akreditasi || 'AKREDITASI'}
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{p.jenjang}</p>
                    <h3 className="font-black text-xl tracking-tight mb-2">{p.nama}</h3>
                    {p.fakultas && <p className="text-xs text-slate-400 font-medium">{p.fakultas}</p>}
                    <div className="pt-6 mt-6 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest" style={{ color: c }}>
                        Detail Program <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </section>
        )}

        {/* ═══ PRESTASI / ACHIEVEMENTS ═══ */}
        <section className="py-24 bg-white relative overflow-hidden">
          <Blob color="#10b981" className="top-0 right-0 w-[400px] h-[400px] translate-x-1/3 -translate-y-1/3" />
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
              <div className="max-w-2xl">
                <SectionLabel>Rekor Prestasi</SectionLabel>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mt-4">Membangun Budaya <br />Keunggulan Global.</h2>
                <p className="text-slate-500 text-lg font-medium mt-3">{tenant.singkatan || tenant.nama_pt} secara konsisten meraih penghargaan di berbagai bidang inovasi dan riset akademik.</p>
              </div>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {prestasi.map((p, i) => {
                const Icon = iconNames[p.icon] || Award;
                return (
                  <FadeIn key={i}>
                    <div className="group p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${c}10`, color: c }}>
                        <Icon size={22} />
                      </div>
                      <h3 className="text-xl font-black tracking-tight leading-snug mb-3">{p.title}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{p.desc}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ FASILITAS ═══ */}
        <section id="fasilitas" className="py-32 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center max-w-3xl mx-auto mb-20">
              <SectionLabel>Fasilitas</SectionLabel>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mt-4">Sarana & Prasarana</h2>
              <p className="text-lg text-slate-500 font-medium mt-4">Fasilitas modern yang mendukung proses belajar mengajar dan pengembangan diri mahasiswa</p>
            </FadeIn>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fasilitas.map((f, i) => (
                <FadeIn key={i}>
                  <div className="group p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex gap-5 items-start">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${c}10`, color: c }}>
                      <f.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-base tracking-tight mb-2">{f.title}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONI ═══ */}
        <section className="py-32 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center max-w-3xl mx-auto mb-20">
              <SectionLabel>Testimoni</SectionLabel>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mt-4">Apa Kata Alumni</h2>
              <p className="text-lg text-slate-500 font-medium mt-4">Cerita sukses dan pengalaman dari para alumni</p>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-6">
              {testimoni.map((t, i) => (
                <FadeIn key={i}>
                  <div className="group p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
                    <QuoteIcon size={24} className="mb-4 opacity-30" style={{ color: c }} />
                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic flex-1">"{t.quote}"</p>
                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <p className="font-black text-sm">{t.nama}</p>
                      <p className="text-xs text-slate-400 font-medium">{t.prodi} · Lulus {t.tahun}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ STRUKTUR ORGANISASI ═══ */}
        {landingPage.showStruktur && struktur.length > 0 && (
          <section className="py-32 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
              <FadeIn className="text-center max-w-3xl mx-auto mb-20">
                <SectionLabel>Kepemimpinan</SectionLabel>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mt-4">Struktur Organisasi</h2>
                <p className="text-lg text-slate-500 font-medium mt-4">Dikelola oleh para pakar dan akademisi terkemuka di bidangnya.</p>
              </FadeIn>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {struktur.map((s) => (
                  <FadeIn key={s.id}>
                    <div className="group p-8 rounded-[3rem] border border-slate-100 bg-white shadow-sm text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                      <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg text-white" style={{ background: `linear-gradient(135deg, ${c}, #14b8a6)` }}>
                        {s.image ? <img src={s.image} alt="" className="w-full h-full object-cover rounded-2xl" /> : <UserCheck size={32} />}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: c }}>{s.jabatan}</p>
                      <p className="font-black text-lg tracking-tight mb-1">{s.nama}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ PROMOSI ═══ */}
        {landingPage.showPromosi && promosi.length > 0 && (
          <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <FadeIn className="text-center max-w-3xl mx-auto mb-20">
                <SectionLabel>Program</SectionLabel>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mt-4">Informasi & Promosi</h2>
                <p className="text-lg text-slate-500 font-medium mt-4">Kegiatan dan program terbaru</p>
              </FadeIn>
              <div className="grid md:grid-cols-3 gap-6">
                {promosi.map((p, i) => (
                  <FadeIn key={i}>
                    <div className="group rounded-[2.5rem] overflow-hidden border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                      {p.image && (
                        <div className="h-48 overflow-hidden">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="font-black text-base tracking-tight mb-2">{p.title}</h3>
                        {p.description && <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">{p.description}</p>}
                        {p.link && (
                          <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest mt-4" style={{ color: c }}>
                            Selengkapnya <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ BERITA ═══ */}
        {landingPage.showBerita && berita.length > 0 && (
          <section id="berita" className="py-32 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
              <FadeIn className="flex flex-col sm:flex-row items-end justify-between mb-16 gap-4">
                <div className="max-w-2xl">
                  <SectionLabel>Berita Terkini</SectionLabel>
                  <h2 className="text-5xl font-black tracking-tighter leading-none mt-4">Berita & Artikel</h2>
                </div>
              </FadeIn>
              <div className="grid md:grid-cols-3 gap-6">
                {berita.map(b => (
                  <FadeIn key={b.id}>
                    <div className="group cursor-pointer">
                      <div className="h-56 rounded-[3rem] overflow-hidden mb-5 bg-slate-100 relative">
                        <div className="absolute top-5 left-5 z-10 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-sm">
                          {new Date(b.published_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="absolute inset-0 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${c}20, #14b8a620)`, opacity: 0 }} />
                        {b.gambar && <img src={b.gambar} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                      </div>
                      <h3 className="text-xl font-black tracking-tight leading-tight group-hover:text-emerald-500 transition-colors mb-3">{b.judul}</h3>
                      {b.ringkasan && <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">{b.ringkasan}</p>}
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ CTA PPDB ═══ */}
        {landingPage.showPPDB && (
          <section id="ppdb" className="py-32 relative overflow-hidden bg-slate-900">
            <Blob color="#10b981" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]" />
            <FadeIn>
              <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <SectionLabel>Penerimaan Mahasiswa Baru</SectionLabel>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9] mt-6">Your Journey <br />Starts Today.</h2>
                <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto mt-6 mb-10">
                  Daftar sekarang dan mulai perjalanan akademikmu bersama {tenant.nama_pt}. Raih masa depan cerah bersama kami.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to={`/kampus/${slug}/ppdb`}
                    className="group px-10 py-5 rounded-full font-black uppercase tracking-[0.15em] text-xs text-white shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: c, boxShadow: `0 20px 50px ${c}40` }}>
                    Daftar PPDB {landingPage.tahunAkademik} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a href={`/login?tenant=${slug}`}
                    className="px-10 py-5 rounded-full border-2 border-white/20 text-white/80 font-black uppercase tracking-[0.15em] text-xs hover:bg-white hover:text-slate-900 transition-all">
                    Portal Akademik
                  </a>
                </div>
              </div>
            </FadeIn>
          </section>
        )}
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-10 pb-10 border-b border-slate-100">
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-lg" style={{ backgroundColor: c }}>
                  {tenant.logo_url ? <img src={tenant.logo_url} alt="" className="w-full h-full object-cover rounded-2xl" /> : tenant.singkatan?.charAt(0) || 'K'}
                </div>
                <div>
                  <span className="font-black tracking-tight">{tenant.singkatan || tenant.nama_pt}</span>
                  <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">{tenant.nama_pt}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Perguruan tinggi yang berkomitmen mencetak generasi unggul, berkarakter, dan siap bersaing di era global.</p>
            </div>
            <div className="grid grid-cols-3 gap-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Kontak</p>
                <div className="space-y-3">
                  {tenant.telepon && <p className="text-sm text-slate-500 flex items-center gap-2"><Phone size={12} /> {tenant.telepon}</p>}
                  {tenant.email && <p className="text-sm text-slate-500 flex items-center gap-2"><Mail size={12} /> {tenant.email}</p>}
                  {tenant.alamat && <p className="text-sm text-slate-500 flex items-start gap-2"><MapPin size={12} className="mt-0.5 shrink-0" /> {tenant.alamat}</p>}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Akses</p>
                <div className="space-y-2.5">
                  <a href={`/login?tenant=${slug}`} className="block text-sm text-slate-500 hover:text-emerald-500 transition-colors font-medium">Portal Akademik</a>
                  <Link to={`/kampus/${slug}/ppdb`} className="block text-sm text-slate-500 hover:text-emerald-500 transition-colors font-medium">PPDB Online</Link>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Navigasi</p>
                <div className="space-y-2.5">
                  {nav.map(n => (
                    <a key={n.id} href={`#${n.id}`} onClick={e => { e.preventDefault(); scrollTo(n.id); }}
                      className="block text-sm text-slate-500 hover:text-emerald-500 transition-colors font-medium">{n.label}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} {tenant.nama_pt}. All rights reserved.</p>
            <p className="text-xs text-slate-400">Powered by <span className="font-bold" style={{ color: c }}>AONE SIAKAD</span></p>
          </div>
        </div>
      </footer>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm" onClick={() => { setShowPopup(false); localStorage.setItem(`popup_${slug}_seen`, 'true'); }}>
          <div className="max-w-lg w-full rounded-[3.5rem] overflow-hidden shadow-2xl bg-white" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowPopup(false); localStorage.setItem(`popup_${slug}_seen`, 'true'); }}
              className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-md flex items-center justify-center text-white transition-all">
              <X size={16} />
            </button>
            {popUp.image && <div className="h-56 overflow-hidden"><img src={popUp.image} alt="" className="w-full h-full object-cover" /></div>}
            <div className="p-8 space-y-4">
              {popUp.title && <h3 className="text-2xl font-black tracking-tight">{popUp.title}</h3>}
              {popUp.content && <p className="text-sm text-slate-500 font-medium leading-relaxed">{popUp.content}</p>}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => { setShowPopup(false); localStorage.setItem(`popup_${slug}_seen`, 'true'); }}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">{popUp.buttonText || 'Tutup'}</button>
                {popUp.buttonLink && (
                  <a href={popUp.buttonLink} target="_blank" rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all" style={{ backgroundColor: c }}>Detail</a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`html{scroll-behavior:smooth}`}</style>
    </div>
  );
}
