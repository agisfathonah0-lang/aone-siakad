import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { get } from '../api/client';
import useSEO from '../hooks/useSEO';
import SplashScreen from '../components/ui/SplashScreen';
import { GraduationCap, BookOpen, Shield, CreditCard, Sparkles, UserCheck, ArrowRight, Phone, Mail, MapPin, Calculator, Send, CheckCircle, Award, RefreshCw, BarChart2, Star, Users, BrainCircuit, Sun, Moon, Target, Globe, Zap, ShieldCheck, Trophy, Camera, Heart, Lightbulb, PlayCircle, ChevronRight, Menu, X, Building2, ChevronUp } from 'lucide-react';

interface CampusData {
  tenant: { id: string; slug: string; name: string; nama_pt: string; singkatan: string; logo_url: string; alamat: string; telepon: string; email: string; website: string; };
  landingPage: {
    active: boolean; showBerita: boolean; showPPDB: boolean; showProdi: boolean;
    showStruktur: boolean; showPrestasi: boolean; showPromosi: boolean; showPopUp: boolean;
    heroTitle: string; heroSubtitle: string; primaryColor: string;
    seoTitle: string; seoDescription: string; heroImages: string[];
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
  const [isDark, setIsDark] = useState(false);
  const [promoMode] = useState<'SAAS' | 'CAMPUS'>('CAMPUS');
  const [showPromo, setShowPromo] = useState(true);
  const [selectedProdi, setSelectedProdi] = useState('Teknik Informatika');
  const [parentIncome, setParentIncome] = useState(4500000);
  const [scholarshipType, setScholarshipType] = useState<'NONE' | 'ACADEMIC' | 'CHAMPION' | 'FULL_REKTOR'>('NONE');

  useSEO(data?.landingPage.seoTitle || data?.tenant.name || '', data?.landingPage.seoDescription || '', data?.tenant.logo_url || '/logo.jpg');

  useEffect(() => {
    setLoading(true);
    get<CampusData>(`/public/kampus/${slug}`)
      .then(d => { setData(d); localStorage.setItem('aone_tenant_slug', slug); })
      .catch((err: any) => setError(err.response?.data?.message || 'Kampus tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!data || !data.landingPage.showPopUp || !data.landingPage.popUp.active) return;
    if (localStorage.getItem(`popup_${slug}_seen`) === 'true') return;
    const t = setTimeout(() => setShowPopup(true), 1500);
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

  const scrollTo = (id: string) => { setMobileOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };

  if (loading || !splashDone) return (
    <SplashScreen logo={data?.tenant.logo_url || '/logo.jpg'} nama={data?.tenant.nama_pt || 'Memuat...'} duration={3000} onDone={() => setSplashDone(true)} />
  );

  if (error || !data) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center"><Building2 className="w-12 h-12 text-zinc-300 mx-auto mb-3" /><p className="text-zinc-400 text-sm">{error || 'Kampus tidak ditemukan'}</p></div>
    </div>
  );

  const { tenant, landingPage, berita, programStudi, stats } = data;
  const c = landingPage.primaryColor || '#059669';
  const heroImgs = landingPage.heroImages?.filter(Boolean) || [];

  const prodis = programStudi.length > 0 ? programStudi.map(p => ({
    name: p.nama, accreditation: p.akreditasi || 'B', duration: '4 Tahun / 8 Semesters', baseFee: 7500000,
    desc: `Program studi ${p.nama} dengan kurikulum berbasis industri dan teknologi terkini.`
  })) : [
    { name: 'Teknik Informatika', accreditation: 'UNGGUL', duration: '4 Tahun / 8 Semesters', baseFee: 7500000, desc: 'Fokus pada pengembangan software, system architecture, kecerdasan buatan, cloud computing, dan NoSQL database.' },
    { name: 'Sistem Informasi', accreditation: 'UNGGUL', duration: '4 Tahun / 8 Semesters', baseFee: 7500000, desc: 'Menghubungkan bisnis dengan teknologi informasi. Mempelajari rekayasa proses bisnis, analisis data, dan ERP enterprise.' },
    { name: 'Ekonomi Syariah', accreditation: 'A', duration: '4 Tahun / 8 Semesters', baseFee: 5500000, desc: 'Mempelajari sistem ekonomi berbasis hukum Islam, analisis pasar syariah, perbankan islam, dan zakat/wakaf digital.' },
    { name: 'Hukum Keluarga Islam', accreditation: 'B', duration: '4 Tahun / 8 Semesters', baseFee: 5000000, desc: 'Kualifikasi hukum perkawinan Islam, hukum pidana islam, peradilan agama, dan mediasi sengketa sosial.' },
    { name: 'Pendidikan Guru Madrasah Ibtidaiyah', accreditation: 'A', duration: '4 Tahun / 8 Semesters', baseFee: 5000000, desc: 'Calon pendidik tingkat MI/SD yang mengintegrasikan sains modern dengan nilai karakter akhlak Islamiah mulia.' }
  ];

  const getUkt = () => {
    const selected = prodis.find(p => p.name === selectedProdi) || prodis[0];
    let ukt = selected.baseFee;
    if (parentIncome < 2000000) ukt *= 0.4;
    else if (parentIncome < 4000000) ukt *= 0.7;
    else if (parentIncome > 10000000) ukt *= 1.2;
    if (scholarshipType === 'ACADEMIC') ukt *= 0.5;
    else if (scholarshipType === 'CHAMPION') ukt *= 0.25;
    else if (scholarshipType === 'FULL_REKTOR') ukt = 0;
    return Math.round(ukt);
  };

  const achievements = [
    { title: 'Peringkat 1 Nasional Keamanan Siber', year: '2025', category: 'Teknologi', icon: ShieldCheck, color: 'text-emerald-500' },
    { title: 'Akreditasi Internasional ABET', year: '2024', category: 'Kualitas', icon: Globe, color: 'text-indigo-500' },
    { title: 'Hibah Penelitian Ristekdikti Rp 5M', year: '2025', category: 'Riset', icon: Target, color: 'text-amber-500' },
    { title: 'Best Digital Campus Architecture', year: '2023', category: 'Desain', icon: Award, color: 'text-rose-500' }
  ];

  const activities = [
    { title: 'Global Tech Summit 2025', desc: 'Mahasiswa IAI Maarif mempresentasikan inovasi AI di Singapura.', tag: 'Kegiatan Luar Negeri', image: '/images/hero_campus_banner_1780546916454.png' },
    { title: 'Hackathon Internal Campus', desc: 'Pesta coding 48 jam nonstop membangun solusi Smart City.', tag: 'Kompetisi', image: '/images/iai_maarif_hero_banner_1781705558661.jpg' },
    { title: 'Praktek Lapangan Cloud', desc: 'Sertifikasi langsung dengan partner industri global.', tag: 'Akademik', image: '/images/iai_maarif_students_cutout_1781705580430.jpg' }
  ];

  if (promoMode === 'SAAS') {
    return <div className="min-h-screen flex items-center justify-center text-2xl font-black">SAAS Mode — Coming Soon</div>;
  }

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-800'} transition-colors duration-500`}>
      {/* Back to top */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 ${showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`} style={{ backgroundColor: c }}>
        <ChevronUp size={20} />
      </button>

      {/* ═══ HEADER ═══ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isDark ? 'bg-[#0f172a]/80 border-b border-white/5' : 'bg-white/80 border-b border-slate-200'} backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/10 rotate-3 p-1.5 border overflow-hidden relative" style={{ borderColor: `${c}30` }}>
                <span className="font-black text-lg" style={{ color: c }}>{tenant.singkatan?.charAt(0) || 'K'}</span>
                {tenant.logo_url ? <img src={tenant.logo_url} alt="" className="absolute inset-0 w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : null}
              </div>
            <div className="hidden sm:block">
              <span className="font-black tracking-tight text-xl leading-none uppercase">{tenant.singkatan || tenant.nama_pt}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: c }}>{tenant.nama_pt?.replace(tenant.singkatan || '', '').trim() || 'Sarolangun'}</span>
                <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: c }} />
              </div>
            </div>
          </motion.div>

          <nav className="hidden lg:flex items-center gap-8">
            {['Beranda', 'Visi Misi', 'Program Studi', 'Keunggulan', 'Berita', 'PMB 2026'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors"
                onClick={(e) => { e.preventDefault(); scrollTo(item.toLowerCase().replace(' ', '-')); }}>{item}</a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsDark(!isDark)} className={`p-3 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-emerald-600'}`}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href={`/login?tenant=${slug}`} className="hidden sm:flex px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 items-center gap-2.5 text-white" style={{ backgroundColor: c, boxShadow: `0 4px 16px ${c}40` }}>
              <UserCheck size={16} /> Portal Akademik
            </a>
            <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden p-3 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className={`lg:hidden border-t overflow-hidden ${isDark ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="px-6 py-8 flex flex-col gap-6">
                {['Beranda', 'Visi Misi', 'Program Studi', 'Keunggulan', 'Berita', 'PMB 2026'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={(e) => { e.preventDefault(); scrollTo(item.toLowerCase().replace(' ', '-')); setMobileOpen(false); }}
                    className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors">{item}</a>
                ))}
                <a href={`/login?tenant=${slug}`} onClick={() => setMobileOpen(false)}
                  className="w-full mt-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2.5 text-white" style={{ backgroundColor: c }}>
                  <UserCheck size={16} /> Portal Akademik
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-20">
        {/* ═══ HERO ═══ */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-slate-950">
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-slate-950" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />

          {heroImgs.length > 0 ? (
            heroImgs.map((img, i) => (
              <div key={i} className={`absolute inset-0 transition-all duration-1000 ${i === heroIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
                <img src={img} className="w-full h-full object-cover grayscale-[25%] brightness-[45%]" alt="" />
              </div>
            ))
          ) : (
            <div className="absolute inset-0 opacity-20" style={{ backgroundColor: c }} />
          )}

          <div className="relative z-30 max-w-7xl mx-auto px-6 pt-20 lg:pt-24 pb-32 lg:pb-40 w-full">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: 'easeOut' }} className="max-w-4xl">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl mb-8">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-400">Penerimaan Mahasiswa Baru {landingPage.tahunAkademik}</span>
              </div>
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
                {(() => {
                  const words = (landingPage.heroTitle || tenant.nama_pt).split(' ');
                  const mid = Math.max(1, words.length - 1);
                  return (<>{words.slice(0, mid).join(' ')} <br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">{words.slice(mid).join(' ')}</span></>);
                })()}
              </h1>
              <p className="text-lg md:text-2xl text-slate-300/90 max-w-2xl font-medium leading-relaxed tracking-tight mt-6">
                {landingPage.heroSubtitle || `${tenant.nama_pt} — Kampus Islami dan berwawasan Ahlusunnah yang berkomitmen mencetak generasi unggul, berkarakter, dan siap bersaing di era global.`}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-start gap-5 pt-12">
                {landingPage.showPPDB && (
                  <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}
                    className="group px-12 py-6 rounded-full font-black uppercase tracking-[0.15em] text-xs shadow-xl flex items-center gap-3 transition-all" style={{ backgroundColor: c, boxShadow: `0 20px 50px ${c}40` }}>
                    <Link to={`/kampus/${slug}/ppdb`} className="flex items-center gap-3 text-white no-underline">
                      Daftar Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                )}
                <motion.a whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}
                  className="px-12 py-6 bg-white/5 hover:bg-white/10 backdrop-blur-2xl border border-white/20 text-white rounded-full font-black uppercase tracking-[0.15em] text-xs transition-all flex items-center gap-3 shadow-2xl cursor-pointer"
                  onClick={() => scrollTo('program-studi')}>
                  <PlayCircle className="w-5 h-5 text-emerald-400" /> Virtual Tour
                </motion.a>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 w-full z-30">
            <div className="max-w-7xl mx-auto px-6">
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t ${isDark ? 'border-white/10' : 'border-slate-200'} backdrop-blur-xl bg-slate-950/20`}>
                {[
                  { label: 'Mahasiswa Aktif', val: stats.totalMahasiswa > 0 ? `${stats.totalMahasiswa}+` : '12,500+' },
                  { label: 'Alumni Global', val: '45k+' },
                  { label: 'Partner Industri', val: '150+' },
                  { label: 'Akreditasi', val: 'UNGGUL' }
                ].map((stat, i) => (
                  <div key={i} className="text-center md:text-left">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1`}>{stat.label}</p>
                    <p className="text-2xl font-black text-white">{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SAMBUTAN REKTOR ═══ */}
        <section className="py-32 relative overflow-hidden" style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="p-10 md:p-16 rounded-[4rem] flex flex-col md:flex-row items-center gap-16 relative overflow-hidden" style={{ backgroundColor: `${c}08`, borderColor: `${c}15`, borderWidth: 1 }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: `${c}08` }} />
              <div className="relative z-10 w-full max-w-[280px] shrink-0">
                <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl border-4 rotate-[-2deg]" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#ffffff' }}>
                  <img src={landingPage.sambutan.image || '/images/suprapno.png'} className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700" alt="Sambutan Rektor" />
                </div>
                <div className="absolute -bottom-4 -right-4 p-4 rounded-2xl shadow-xl border" style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1" style={{ color: c }}>{landingPage.sambutan.jabatan || 'Rektor'}</p>
                  <p className="text-sm font-black whitespace-nowrap" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{landingPage.sambutan.nama || tenant.nama_pt}</p>
                </div>
              </div>
              <div className="space-y-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-widest" style={{ backgroundColor: c }}>
                  <Trophy size={12} /> Sambutan Rektor
                </div>
                <div className="space-y-4">
                  <p className="text-3xl md:text-4xl font-black tracking-tighter leading-tight" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                    "{landingPage.sambutan.title || 'Menyiapkan Generasi Unggul dengan Integritas Islami.'}"
                  </p>
                  <div className="h-1 w-20 rounded-full" style={{ backgroundColor: c }} />
                </div>
                <p className="text-lg font-medium leading-relaxed italic" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  {landingPage.sambutan.content || `"Selamat datang di ${tenant.nama_pt}. Kami berkomitmen untuk memberikan pendidikan terbaik yang mengintegrasikan nilai-nilai luhur Islam dengan kemajuan teknologi modern."`}
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${c}12`, color: c }}>
                    <BookOpen size={24} />
                  </div>
                  <p className="text-sm font-bold max-w-[200px]" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Bertekad memajukan pendidikan di Jambi dan Nasional.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ VISI & MISI ═══ */}
        <section id="visi-misi" className={`py-40 relative overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] -translate-x-1/2" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="relative group flex justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} className="relative z-10 w-full max-w-lg">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[100px] transition-all duration-700" style={{ backgroundColor: `${c}20` }} />
                  <div className="relative z-10 w-full aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl">
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${c}30, #14b8a630)` }} />
                    {heroImgs[0] ? <img src={heroImgs[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /> : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${c}10` }}><Building2 size={64} className="opacity-30" style={{ color: c }} /></div>
                    )}
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                  className="absolute -bottom-10 right-0 lg:-right-5 z-20 p-6 rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-white/10 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${c}12`, color: c }}><Trophy size={24} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prestasi Akademik</p>
                      <p className="text-xl font-black">Akreditasi Unggul</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="space-y-16">
                <div className="space-y-6">
                  <div className="inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: `${c}12`, color: c }}>VISI & MISI</div>
                  <h2 className={`text-6xl md:text-7xl font-black tracking-tighter leading-[0.85] ${isDark ? 'text-white' : ''}`}>
                    Unggul Islami <br /><span className="text-slate-400">& Modern.</span>
                  </h2>
                  <p className={`text-xl font-medium leading-relaxed max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {tenant.nama_pt} berkomitmen mencetak sarjana yang berakhlakul karimah, mandiri, dan kompetitif secara nasional.
                  </p>
                </div>
                <div className="space-y-8">
                  <div className="p-8 rounded-[3rem] border" style={{ backgroundColor: `${c}06`, borderColor: `${c}12` }}>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: c }}>Visi Institusi</h3>
                    <p className={`text-lg md:text-xl font-medium italic leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      "Terwujudnya Program Pendidikan Tinggi yang Unggul, Islami, dan Modern di Provinsi Jambi pada tahun 2030."
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {["Menyelenggarakan pendidikan tinggi yang berkualitas.", "Melaksanakan penelitian berbasis pemberdayaan masyarakat.", "Mengembangkan tata kelola institusi yang transparan.", "Integrasi nilai-nilai keislaman dalam disiplin ilmu."].map((misi, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: `${c}10` }}>
                          <CheckCircle className="w-4 h-4" style={{ color: c }} />
                        </div>
                        <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{misi}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SUCCESS STORIES ═══ */}
        <section className={`py-40 relative overflow-hidden ${isDark ? 'bg-zinc-950/40' : 'bg-slate-50'}`}>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7">
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                  <div className="absolute -inset-10 rounded-full blur-[100px] animate-pulse" style={{ backgroundColor: `${c}20` }} />
                  <div className="relative group">
                    <div className="absolute -inset-1 rounded-[4.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" style={{ background: `linear-gradient(to right, ${c}, #14b8a6)` }} />
                    <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl border border-white/10">
                      {heroImgs[1] ? <img src={heroImgs[1]} alt="" className="w-full h-[500px] object-cover" /> : (
                        <img src="/images/iai_maarif_graduation_v2_1781705737607.jpg" alt="" className="w-full h-[500px] object-cover" />
                      )}
                    </div>
                  </div>
                  <div className="absolute top-10 -left-10 z-20 px-6 py-4 backdrop-blur-xl rounded-3xl border shadow-2xl" style={{ backgroundColor: isDark ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.8)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }}>
                    <p className="text-3xl font-black" style={{ color: c }}>92%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lulus Tepat Waktu</p>
                  </div>
                </motion.div>
              </div>
              <div className="lg:col-span-5 space-y-10">
                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: c }}>IAI MAARIF SUCCESS</span>
                  <h2 className={`text-5xl font-black tracking-tighter leading-tight ${isDark ? 'text-white' : ''}`}>Wujudkan Sukses <br />Dimulai Dari Sini.</h2>
                  <p className={`text-lg font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Lulusan {tenant.singkatan || tenant.nama_pt} telah berkontribusi nyata di berbagai instansi pemerintahan, pendidikan, dan sektor swasta nasional.
                  </p>
                </motion.div>
                <div className="space-y-6">
                  {[
                    { t: 'Ready for Future', d: 'Bekal kompetensi yang relevan dengan zaman.' },
                    { t: 'Islamic Character', d: 'Karakter lulusan yang beretika dan berintegritas.' },
                    { t: 'Professional Network', d: 'Akses ke jejaring alumni yang tersebar luas.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1" style={{ backgroundColor: `${c}10` }}><CheckCircle size={14} style={{ color: c }} /></div>
                      <div>
                        <p className={`font-black text-sm uppercase tracking-wide ${isDark ? 'text-white' : ''}`}>{item.t}</p>
                        <p className="text-xs text-slate-500 font-medium">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ STRUKTUR ORGANISASI ═══ */}
        <section id="struktur" className={`py-32 ${isDark ? 'bg-zinc-950/20 shadow-inner' : 'bg-slate-50'}`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <span className="text-[10px] font-black font-mono tracking-widest uppercase" style={{ color: c }}>KEPEMIMPINAN</span>
              <h2 className={`text-5xl font-black tracking-tighter leading-none ${isDark ? 'text-white' : ''}`}>Struktur Organisasi</h2>
              <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Dikelola oleh para pakar industri dan akademisi terkemuka di bidangnya.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(landingPage.strukturOrganisasi?.length > 0 ? landingPage.strukturOrganisasi : [
                { id: '1', jabatan: 'Rektorat', nama: 'Dr. Suprapno, M.Pd', image: '' },
                { id: '2', jabatan: 'Dewan Pakar', nama: 'Dr. Siti Aminah, M.IT', image: '' },
                { id: '3', jabatan: 'Operasional', nama: 'H. Ahmad Muzakir, M.Sy', image: '' }
              ]).map((leader, i) => (
                <div key={leader.id || i} className={`p-10 rounded-[3rem] text-center border transition-all ${isDark ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="w-24 h-24 rounded-[2rem] mx-auto mb-8 shadow-xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${c}, #14b8a6)`, boxShadow: `0 8px 24px ${c}30` }}>
                    <UserCheck size={40} />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: c }}>{leader.jabatan}</h3>
                  <p className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : ''}`}>{leader.nama}</p>
                  <p className="text-sm font-medium mt-1 text-slate-400">Rektor IAI Maarif Sarolangun</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ BERITA ═══ */}
        <section id="berita" className={`py-32 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row items-end justify-between mb-16 gap-4">
              <div className="max-w-2xl text-center sm:text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 block" style={{ color: c }}>IAI MAARIF UPDATES</span>
                <h2 className={`text-5xl font-black tracking-tighter leading-none ${isDark ? 'text-white' : ''}`}>Berita & Artikel Terkini</h2>
              </div>
              <button className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:bg-emerald-500 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-emerald-500 hover:text-white'}`}>Lihat Semua Berita</button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(berita.length > 0 ? berita : [
                { id: '1', judul: 'IAI Maarif Resmikan Cloud Research Center Baru', ringkasan: 'Peresmian pusat riset cloud computing yang didukung oleh mitra industri teknologi global.', slug: '', gambar: '', published_at: new Date().toISOString() },
                { id: '2', judul: 'Kunjungan Delegasi Microsoft ke Kampus IAI Maarif', ringkasan: 'Microsoft menjajaki kerjasama pengembangan AI dan data sains dengan IAI Maarif Sarolangun.', slug: '', gambar: '', published_at: new Date().toISOString() },
                { id: '3', judul: 'Prestasi Mahasiswa: Juara 1 Cyber Competition 2026', ringkasan: 'Tim mahasiswa IAI Maarif berhasil meraih juara 1 kompetisi keamanan siber nasional.', slug: '', gambar: '', published_at: new Date().toISOString() }
              ]).map((news: any, i) => (
                <div key={news.id || i} className="group cursor-pointer">
                  <div className={`h-64 rounded-[3rem] overflow-hidden mb-6 relative ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <div className="absolute top-6 left-6 z-10 px-3 py-1 rounded-full bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest">
                      {['TEKNOLOGI', 'PARTNERSHIP', 'PRESTASI'][i] || 'BERITA'}
                    </div>
                    <div className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100" style={{ background: `linear-gradient(135deg, ${c}30, #14b8a630)` }} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                    {new Date(news.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <h3 className={`text-2xl font-black tracking-tight leading-tight group-hover:text-emerald-500 transition-colors mb-4 ${isDark ? 'text-white' : ''}`}>{news.judul}</h3>
                  <p className={`text-sm font-medium leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{news.ringkasan}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ ACHIEVEMENTS ═══ */}
        <section className={`py-24 ${isDark ? 'bg-zinc-950/20' : 'bg-slate-50'} transition-all relative overflow-hidden`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4 text-center md:text-left">
              <div className="max-w-2xl">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 block" style={{ color: c }}>REKOR PRESTASI</span>
                <h2 className={`text-4xl md:text-6xl font-black tracking-tighter leading-none mb-6 ${isDark ? 'text-white' : ''}`}>Membangun Budaya<br />Keunggulan Global.</h2>
                <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{tenant.singkatan || tenant.nama_pt} secara konsisten meraih penghargaan internasional di berbagai bidang inovasi dan riset akademik.</p>
              </div>
              <div className="flex gap-2 pb-2">
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} style={{ color: c }}><Trophy size={32} /></div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((item, i) => (
                <motion.div key={i} whileHover={{ y: -10 }}
                  className={`p-8 rounded-[2.5rem] border transition-all duration-300 ${isDark ? 'bg-zinc-900/50 border-white/5 hover:bg-zinc-900' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl shadow-slate-200/50'}`}>
                  <div className={`w-12 h-12 rounded-2xl ${item.color.replace('text', 'bg')}/10 flex items-center justify-center mb-6`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{item.category} • {item.year}</span>
                  <h3 className={`text-xl font-black tracking-tight leading-snug ${isDark ? 'text-white' : ''}`}>{item.title}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ GALLERY BENTO ═══ */}
        <section id="gallery" className={`py-24 ${isDark ? 'bg-zinc-950/20' : 'bg-slate-50'}`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6" style={{ backgroundColor: `${c}10`, color: c }}>
                <Camera size={14} /> Eksplorasi Kehidupan Kampus
              </span>
              <h2 className={`text-5xl font-black tracking-tighter leading-none mb-6 ${isDark ? 'text-white' : ''}`}>Momen yang Tak Terlupakan.</h2>
              <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bukan sekadar kuliah, di {tenant.singkatan || tenant.nama_pt} kami membangun ekosistem di mana setiap momen adalah peluang untuk tumbuh dan berkolaborasi.</p>
            </div>
            <div className="grid md:grid-cols-12 gap-6 md:h-[1000px]">
              <div className="md:col-span-8 md:row-span-2 relative group overflow-hidden rounded-[3rem]">
                <img src="/images/iai_maarif_graduation_v2_1781705737607.jpg" alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <div className="absolute bottom-12 left-12 right-12 text-white">
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block" style={{ backgroundColor: c }}>Momen Puncak</span>
                  <h3 className="text-4xl font-black tracking-tight leading-none mb-4">Wisuda Angkatan {new Date().getFullYear()}</h3>
                  <p className="text-slate-300 max-w-xl font-medium">Merayakan keberhasilan ribuan lulusan yang siap menaklukkan tantangan global di industri teknologi dan bisnis modern.</p>
                </div>
              </div>
              <div className="md:col-span-4 relative group overflow-hidden rounded-[3rem]">
                <img src="/images/iai_maarif_students_v2_1781705752850.jpg" alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                <div className="absolute bottom-8 left-8 text-white"><p className="font-black tracking-tight text-xl">Kolaborasi Riset</p></div>
              </div>
              <div className="md:col-span-4 relative group overflow-hidden rounded-[3rem]">
                <img src="/images/iai_maarif_graduation_1781705508165.jpg" alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                <div className="absolute bottom-8 left-8 text-white"><p className="font-black tracking-tight text-xl">Mahasiswa Unggul</p></div>
              </div>
              <div className="md:col-span-12 grid md:grid-cols-3 gap-6">
                {activities.map((act, i) => (
                  <div key={i} className={`p-8 rounded-[3rem] border transition-all flex flex-col justify-between group overflow-hidden relative ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <img src={act.image} alt="" className="absolute inset-0 w-full h-full object-cover z-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity" />
                    <div className="relative z-10 space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: c }}>{act.tag}</span>
                      <h4 className={`text-2xl font-black tracking-tight leading-none group-hover:text-emerald-500 transition-colors ${isDark ? 'text-white' : ''}`}>{act.title}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{act.desc}</p>
                    </div>
                    <div className="relative z-10 mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-500 transition-colors">Selengkapnya <ChevronRight size={12} /></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PROGRAM STUDI ═══ */}
        <section id="program-studi" className={`py-32 max-w-7xl mx-auto px-6`}>
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <span className="text-[10px] font-black font-mono tracking-widest uppercase" style={{ color: c }}>PROGRAM AKADEMIK</span>
            <h2 className={`text-5xl font-black tracking-tighter leading-none ${isDark ? 'text-white' : ''}`}>Menembus Batas<br />Inovasi Pendidikan</h2>
            <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kurikulum kami dirancang untuk membekali Anda dengan kompetensi global yang dicari di era digital visioner.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {prodis.map((p, idx) => (
              <motion.div key={idx} whileHover={{ y: -10 }}
                className={`p-8 rounded-[3.5rem] border transition-all duration-500 backdrop-blur-xl ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20' : 'bg-white border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-2xl shadow-slate-200/40 hover:border-emerald-500/20'}`}>
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: `${c}10`, color: c, borderColor: `${c}15` }}>
                      <BookOpen size={24} />
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${p.accreditation === 'UNGGUL' ? 'text-white shadow-lg' : 'text-slate-500'}`}
                      style={p.accreditation === 'UNGGUL' ? { backgroundColor: c, boxShadow: `0 4px 16px ${c}40` } : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                      AKREDITASI: {p.accreditation}
                    </span>
                  </div>
                  <div>
                    <h3 className={`font-black text-2xl tracking-tight leading-tight mb-2 ${isDark ? 'text-white' : ''}`}>{p.name}</h3>
                    <div className="flex items-center gap-2">
                      <Zap size={12} style={{ color: c }} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.duration}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{p.desc}</p>
                </div>
                <div className={`pt-8 mt-8 border-t ${isDark ? 'border-white/5' : 'border-slate-100'} flex items-center justify-between`}>
                  <span className="w-full py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer" style={{ backgroundColor: `${c}08`, color: c }}>
                    Detail Program <ChevronRight size={16} />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ UKT CALCULATOR ═══ */}
        <section id="keunggulan" className={`py-32 ${isDark ? 'bg-[#0f172a] border-y border-white/5' : 'bg-slate-100 border-y border-slate-200'}`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5 space-y-8">
                <span className="text-[10px] font-black font-mono tracking-widest uppercase" style={{ color: c }}>FINANCIAL INTELLIGENCE</span>
                <h2 className={`text-5xl font-black tracking-tighter leading-[0.95] ${isDark ? 'text-white' : 'text-slate-900'}`}>Pendidikan Inklusif<br />Melalui Kecerdasan Data.</h2>
                <p className={`text-lg font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Platform kami secara dinamis mengkalkulasikan kontribusi biaya pendidikan yang paling proporsional bagi Anda, didukung oleh beasiswa prestasi berbasis performa.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: `${c}10`, color: c, borderColor: `${c}15` }}><Heart size={20} /></div>
                    <h4 className={`text-sm font-black tracking-tight ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>Keadilan Ekonomi</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Subsidi otomatis disinkronkan langsung dengan kualifikasi ekonomi pendaftar.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: `${c}10`, color: c, borderColor: `${c}15` }}><Award size={20} /></div>
                    <h4 className={`text-sm font-black tracking-tight ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>Aspirasi Tanpa Batas</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Tersedia potongan hingga 100% biaya kuliah bagi talenta dengan prestasi luar biasa.</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="p-[2px] rounded-[3.5rem] shadow-2xl" style={{ background: `linear-gradient(135deg, ${c}, #14b8a6, #6366f1)` }}>
                  <div className={`p-8 md:p-12 rounded-[3.2rem] ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`}>
                    <div className="flex flex-col md:flex-row gap-12">
                      <div className="flex-1 space-y-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-2 h-6 rounded-full" style={{ backgroundColor: c }} />
                          <h3 className={`font-black text-xl tracking-tight leading-none uppercase ${isDark ? 'text-white' : ''}`}>Simulasi Biaya</h3>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Target Fakultas</label>
                          <select value={selectedProdi} onChange={e => setSelectedProdi(e.target.value)}
                            className={`w-full p-4 rounded-2xl border text-xs font-bold outline-none transition-all focus:ring-4 focus:ring-emerald-500/10 ${isDark ? 'bg-zinc-950 border-white/5 focus:border-emerald-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-emerald-500'}`}>
                            {prodis.map((p, idx) => <option key={idx} value={p.name}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none">Ekonomi Wali</label>
                            <span className="text-sm font-black" style={{ color: c }}>Rp {parentIncome.toLocaleString('id-ID')}</span>
                          </div>
                          <input type="range" min="1000000" max="20000000" step="500000" value={parentIncome} onChange={e => setParentIncome(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Program Beasiswa</label>
                          <div className="grid grid-cols-1 gap-2">
                            {[{ key: 'NONE', label: 'Reguler' }, { key: 'ACADEMIC', label: 'Akademik (50%)' }, { key: 'FULL_REKTOR', label: 'Full Rektor (100%)' }].map((item) => (
                              <button key={item.key} type="button" onClick={() => setScholarshipType(item.key as any)}
                                className={`p-3 text-left rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex justify-between items-center ${scholarshipType === item.key ? 'text-white shadow-lg' : 'text-slate-400'}`}
                                style={scholarshipType === item.key ? { backgroundColor: c, borderColor: c } : { borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                                <span>{item.label}</span>
                                {scholarshipType === item.key && <CheckCircle size={14} className="text-white" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className={`p-8 rounded-[3rem] text-white flex flex-col justify-between border shadow-2xl md:w-72`} style={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="space-y-6">
                          <Lightbulb size={32} style={{ color: c }} />
                          <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 leading-none">Estimasi Final</p>
                            <h4 className="text-xl font-black text-white leading-tight">Uang Kuliah Tunggal Utama</h4>
                          </div>
                          <div className="h-px w-full bg-white/5" />
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500"><span>SUBSIDI</span><span style={{ color: c }}>AKTIF</span></div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                              <span>BEASISWA</span>
                              <span style={{ color: c }}>-{scholarshipType === 'FULL_REKTOR' ? '100' : scholarshipType === 'ACADEMIC' ? '50' : '0'}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-8">
                          <h3 className="text-2xl font-black tracking-tighter mb-4" style={{ color: c }}>
                            Rp {getUkt().toLocaleString('id-ID')}
                            <span className="text-[10px] text-slate-500 ml-1 font-bold">/SMT</span>
                          </h3>
                          <span onClick={() => scrollTo('pmb-2026')} className="w-full py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all block text-center cursor-pointer" style={{ backgroundColor: c }}>Ambil Beasiswa</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PPDB POSTER ═══ */}
        <section id="pmb-2026" className={`py-32 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <span className="text-[10px] font-black font-mono tracking-widest uppercase" style={{ color: c }}>OFFICIAL CAMPAIGN</span>
              <h2 className={`text-5xl md:text-6xl font-black tracking-tighter leading-none ${isDark ? 'text-white' : ''}`}>Gerbang Masa Depan<br />Telah Dibuka.</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative group rounded-[3.5rem] overflow-hidden shadow-2xl border-transparent">
                <img src={heroImgs[0] || '/images/ppdb_poster_design_1780546934546.png'} alt="" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className={`text-4xl font-black leading-tight ${isDark ? 'text-white' : ''}`}>Mulai Karir Global Anda di {tenant.singkatan || tenant.nama_pt}.</h3>
                  <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Brosur resmi penerimaan mahasiswa baru tahun akademik {landingPage.tahunAkademik} telah dirilis. Kami mengundang talenta terbaik nusantara untuk bergabung bersama kami.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-3xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <Zap size={24} style={{ color: c }} className="mb-3" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Jalur Khusus</p>
                    <p className="font-bold text-lg">One Day Service</p>
                  </div>
                  <div className={`p-6 rounded-3xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <Target size={24} className="mb-3 text-indigo-500" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Seleksi</p>
                    <p className="font-bold text-lg">Computer Based Test</p>
                  </div>
                </div>
                <Link to={`/kampus/${slug}/ppdb`}
                  className="w-full py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 text-white shadow-xl" style={{ backgroundColor: c, boxShadow: `0 20px 50px ${c}40` }}>
                  Download Katalog Lengkap (PDF) <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section id="pmb" className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-950" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: c }} />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 block" style={{ color: c }}>PENERIMAAN MAHASISWA BARU</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9]">Your Journey<br />Starts Today.</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
              {landingPage.showPPDB && (
                <Link to={`/kampus/${slug}/ppdb`} className="group px-12 py-6 rounded-full font-black uppercase tracking-[0.15em] text-xs text-white shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: c, boxShadow: `0 20px 50px ${c}40` }}>
                  Daftar Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <a href={`/login?tenant=${slug}`} className="px-12 py-6 rounded-full border-2 border-white/20 text-white/80 font-black uppercase tracking-[0.15em] text-xs hover:bg-white hover:text-slate-900 transition-all">Portal Akademik</a>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className={`py-12 ${isDark ? 'bg-zinc-950 border-t border-zinc-900' : 'bg-white border-t border-slate-200'} text-xs text-slate-400 text-center transition`}>
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm" style={{ backgroundColor: c }}>{tenant.singkatan?.charAt(0) || 'K'}</div>
            <span className={`font-bold ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>{tenant.singkatan || tenant.nama_pt}</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed text-slate-400">
            Sistem ERP single-tenant dioptimasi oleh platform aone-siakad Indonesia. <br />Integrasi data PDDIKTI, E-Journal OJS, LMS Moodle Terstandarisasi BAN-PT.
          </p>
          <p className="text-[10px] text-slate-500 font-mono">v2.4.0-stable | &copy; 2026 aone-siakad. All rights reserved.</p>
        </div>
      </footer>

      {/* ═══ PROMO POPUP ═══ */}
      <AnimatePresence>
        {showPromo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative max-w-lg w-full rounded-[3.5rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] transition-all ${isDark ? 'bg-zinc-900 border border-white/10' : 'bg-white'}`}>
              <button onClick={() => setShowPromo(false)}
                className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/20">
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <div className="relative h-64 overflow-hidden">
                <img src="/images/iai_maarif_students_v2_1781705752850.jpg" alt="" className="absolute inset-0 w-full h-full object-cover brightness-75 scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-8">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg text-white" style={{ backgroundColor: c, boxShadow: `0 4px 16px ${c}40` }}>Limited Offer</span>
                </div>
              </div>
              <div className="p-8 md:p-10 space-y-6">
                <div className="space-y-2">
                  <h3 className={`text-3xl font-black tracking-tighter leading-none ${isDark ? 'text-white' : ''}`}>Beasiswa Jalur Prestasi Mandiri 2026.</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">Dapatkan potongan UKT hingga 100% untuk 100 pendaftar pertama gelombang ini. Bebas biaya pendaftaran dan seleksi berkas.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <span onClick={() => { setShowPromo(false); scrollTo('pmb-2026'); }}
                    className="w-full py-4 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-xl transition-all active:scale-95 text-center block cursor-pointer text-white" style={{ backgroundColor: c, boxShadow: `0 20px 50px ${c}40` }}>
                    Klaim Beasiswa Sekarang
                  </span>
                  <button onClick={() => setShowPromo(false)}
                    className={`w-full py-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-emerald-500' : 'bg-slate-100 text-slate-500 hover:text-emerald-500'}`}>
                    Nanti Saja
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:#10b981;cursor:pointer;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.15)}`}</style>
    </div>
  );
}
