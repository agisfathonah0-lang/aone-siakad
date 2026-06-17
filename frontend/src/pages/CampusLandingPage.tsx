import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get } from '../api/client';
import useSEO from '../hooks/useSEO';
import SplashScreen from '../components/ui/SplashScreen';
import { Building2, GraduationCap, Users, BookOpen, ArrowRight, ExternalLink, Award, UserCheck, ChevronUp, X, Mail, Phone, MapPin, Calendar, Quote, Sparkles, Play, CheckCircle, Star, Globe, FlaskConical, UsersRound, Library, Monitor, HeartHandshake, MapPinHouse, ChevronRight, QuoteIcon, Flower2, Menu } from 'lucide-react';

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

const iconMap: Record<string, any> = { Award, Users, BookOpen, GraduationCap, Target: Star, Eye: Globe, Trophy: Award, School: Building2 };

function hexToRgb(hex: string) {
  const c = hex.replace('#', '');
  return { r: parseInt(c.substring(0, 2), 16), g: parseInt(c.substring(2, 4), 16), b: parseInt(c.substring(4, 6), 16) };
}

function SectionDivider({ bg = '#ffffff' }: { bg?: string }) {
  return (
    <div className="relative h-16 md:h-24 -mb-1" style={{ backgroundColor: bg }}>
      <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 96" preserveAspectRatio="none" fill="#faf7f2">
        <path d="M0 48c240 64 480-64 720 0s480-64 720 0v48H0V48z" opacity="0.4" />
        <path d="M0 64c240-48 480 48 720 0s480 48 720 0v32H0V64z" />
      </svg>
    </div>
  );
}

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  );
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
  const [mobileNav, setMobileNav] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);

  useSEO(
    data?.landingPage.seoTitle || data?.tenant.name || 'Kampus',
    data?.landingPage.seoDescription || `${data?.tenant.nama_pt || 'Kampus'} - Sistem Informasi Akademik terintegrasi.`,
    data?.tenant.logo_url || '/logo.jpg'
  );

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
    const timer = setTimeout(() => setShowPopup(true), 1000);
    return () => clearTimeout(timer);
  }, [data, slug]);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nextHero = useCallback(() => {
    if (!data) return;
    const imgs = data.landingPage.heroImages?.filter(Boolean) || [];
    if (imgs.length < 2) return;
    setHeroIdx(p => (p + 1) % imgs.length);
  }, [data]);

  useEffect(() => {
    const imgs = data?.landingPage.heroImages?.filter(Boolean) || [];
    if (imgs.length < 2) return;
    const id = setInterval(nextHero, 5000);
    return () => clearInterval(id);
  }, [data, nextHero]);

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
  const rgb = hexToRgb(c);
  const heroImages = landingPage.heroImages?.filter(Boolean) || [];
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

  const strukturOrganisasi = landingPage.strukturOrganisasi?.length > 0 ? landingPage.strukturOrganisasi : [
    { id: '1', jabatan: 'Rektor', nama: `Rektor ${tenant.nama_pt}`, image: '' },
    { id: '2', jabatan: 'Wakil Rektor I', nama: 'Wakil Rektor Bidang Akademik', image: '' },
    { id: '3', jabatan: 'Wakil Rektor II', nama: 'Wakil Rektor Bidang Keuangan', image: '' },
    { id: '4', jabatan: 'Wakil Rektor III', nama: 'Wakil Rektor Bidang Kemahasiswaan', image: '' },
  ];

  const testimoni = [
    { nama: 'Ahmad Fauzi', program: 'S1 Teknik Informatika', tahun: '2021', quote: `Kuliah di ${tenant.singkatan || tenant.nama_pt} memberikan pengalaman luar biasa. Dosen-dosennya sangat kompeten dan fasilitasnya mendukung penuh proses belajar.` },
    { nama: 'Siti Nurhaliza', program: 'S1 Manajemen', tahun: '2022', quote: 'Alhamdulillah, saya mendapatkan beasiswa penuh dan lulus dengan predikat cumlaude. Kampus ini benar-benar peduli dengan prestasi mahasiswa.' },
    { nama: 'Rudi Hermawan', program: 'S1 Hukum', tahun: '2020', quote: 'Jaringan alumni yang kuat membantu saya mendapatkan pekerjaan di firma hukum terkemuka segera setelah lulus. Terima kasih kampusku.' },
  ];

  const fasilitas = [
    { icon: Library, title: 'Perpustakaan Digital', desc: 'Akses ke ribuan jurnal nasional dan internasional, e-book, dan database ilmiah.' },
    { icon: Monitor, title: 'Lab Komputer', desc: 'Laboratorium komputer modern dengan spesifikasi tinggi untuk praktikum dan riset.' },
    { icon: FlaskConical, title: 'Lab Sains', desc: 'Laboratorium sains terpadu untuk penelitian biologi, kimia, dan fisika.' },
    { icon: UsersRound, title: 'Ruang Kolaborasi', desc: 'Ruang diskusi dan co-working yang nyaman untuk kerja kelompok dan proyek.' },
    { icon: HeartHandshake, title: 'Biro Karir', desc: 'Pusat pengembangan karir dan penempatan kerja bagi mahasiswa dan alumni.' },
    { icon: MapPinHouse, title: 'Kampus Hijau', desc: 'Lingkungan kampus yang asri, hijau, dan nyaman untuk kegiatan akademik.' },
  ];

  const navLinks = [
    { href: '#tentang', label: 'Tentang' },
    { href: '#programs', label: 'Program' },
    { href: '#fasilitas', label: 'Fasilitas' },
    { href: '#berita', label: 'Berita' },
    ...(landingPage.showPPDB ? [{ href: '#ppdb', label: 'PPDB' }] : []),
  ];

  const scrollTo = (id: string) => {
    setMobileNav(false);
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const jenjangWarna: Record<string, string> = { S1: '#059669', D3: '#2563eb', D4: '#7c3aed', S2: '#d97706', Profesi: '#dc2626' };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#1e293b] font-sans antialiased overflow-x-hidden">
      {/* Back to top */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 ${showBackTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        style={{ backgroundColor: c }}>
        <ChevronUp size={20} />
      </button>

      {/* Header */}
      <header className="w-full top-0 sticky z-50 bg-[#faf7f2]/85 backdrop-blur-lg border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl overflow-hidden ring-1 ring-[#e2e8f0] flex items-center justify-center bg-white" style={{ borderColor: `${c}40` }}>
              {tenant.logo_url ? <img src={tenant.logo_url} alt="" className="w-full h-full object-cover" /> : <Building2 size={18} style={{ color: c }} />}
            </div>
            <span className="font-bold text-sm md:text-base" style={{ color: c }}>{tenant.singkatan || tenant.nama_pt}</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={e => { e.preventDefault(); scrollTo(l.href); }}
                className="text-sm font-medium text-[#64748b] hover:text-[#1e293b] transition-colors">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a href={`/login?tenant=${slug}`}
              className="hidden md:inline text-sm font-medium text-[#64748b] hover:text-[#1e293b] transition-colors">Login</a>
            {landingPage.showPPDB && (
              <Link to={`/kampus/${slug}/ppdb`}
                className="text-sm font-bold text-white px-5 py-2 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md" style={{ backgroundColor: c }}>
                Daftar
              </Link>
            )}
            <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden p-2 rounded-lg hover:bg-[#e2e8f0] transition-colors">
              <Menu size={20} className="text-[#64748b]" />
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileNav ? 'max-h-80' : 'max-h-0'}`}>
          <div className="px-4 pb-4 flex flex-col gap-2 border-t border-[#e2e8f0] pt-3 bg-[#faf7f2]">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={e => { e.preventDefault(); scrollTo(l.href); }}
                className="text-sm font-medium text-[#64748b] py-2 px-3 rounded-lg hover:bg-[#e2e8f0] transition-colors">{l.label}</a>
            ))}
            <a href={`/login?tenant=${slug}`}
              className="text-sm font-medium text-[#64748b] py-2 px-3 rounded-lg hover:bg-[#e2e8f0] transition-colors">Login</a>
          </div>
        </div>
      </header>

      <main>
        {/* ── HERO ── */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#f1f5e9]">
          <div className="absolute inset-0 z-0">
            {heroImages.length > 0 ? (
              heroImages.map((img, i) => (
                <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-50/60 to-emerald-100/40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#faf7f2] via-[#faf7f2]/80 to-transparent" />
            {heroImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroImages.map((_, i) => (
                  <button key={i} onClick={() => setHeroIdx(i)}
                    className="h-2 rounded-full transition-all cursor-pointer" style={{ width: i === heroIdx ? 24 : 8, backgroundColor: i === heroIdx ? c : 'rgba(0,0,0,0.12)' }} />
                ))}
              </div>
            )}
          </div>
          <div className="max-w-6xl mx-auto px-4 md:px-8 w-full relative z-10 py-20 md:py-0" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${c}10`, color: c }}>
                <Sparkles size={14} />
                Pendaftaran {landingPage.tahunAkademik}
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight text-[#1e293b]">
                {(() => {
                  const words = (landingPage.heroTitle || `Selamat Datang di ${tenant.nama_pt}`).split(' ');
                  const mid = words.length > 1 ? words.length - 1 : 0;
                  return (<>{words.slice(0, mid).join(' ')}<br /><span className="italic" style={{ color: c }}>{words.slice(mid).join(' ')}</span></>);
                })()}
              </h1>
              <p className="text-base md:text-lg text-[#64748b] max-w-lg mb-8 leading-relaxed">
                {landingPage.heroSubtitle || `Bergabunglah dengan ${tenant.nama_pt} dan wujudkan masa depanmu bersama ribuan mahasiswa lainnya.`}
              </p>
              <div className="flex flex-wrap gap-3">
                {landingPage.showPPDB && (
                  <Link to={`/kampus/${slug}/ppdb`} className="group px-8 py-3.5 rounded-lg text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2" style={{ backgroundColor: c, boxShadow: `0 8px 28px ${c}35` }}>
                    Mulai Pendaftaran <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                <a href="#programs" onClick={e => { e.preventDefault(); scrollTo('#programs'); }}
                  className="px-6 py-3.5 rounded-lg text-sm font-bold border-2 transition-all flex items-center gap-2" style={{ borderColor: `${c}30`, color: c }}>
                  <Play size={16} /> Jelajahi
                </a>
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4 relative" style={{ height: 500 }}>
              {heroImages.length > 0 ? (
                <>
                  <div className="pt-10 transform hover:-translate-y-2 transition-transform duration-500">
                    <img src={heroImages[0]} alt="" className="w-full aspect-[3/4] object-cover rounded-xl shadow-2xl" style={{ border: '4px solid rgba(255,255,255,0.5)' }} />
                  </div>
                  <div className="pb-10 transform hover:translate-y-2 transition-transform duration-500">
                    <img src={heroImages[heroImages.length > 1 ? 1 : 0]} alt="" className="w-full aspect-[3/4] object-cover rounded-xl shadow-2xl" style={{ border: '4px solid rgba(255,255,255,0.5)' }} />
                  </div>
                </>
              ) : (
                <div className="col-span-2 flex items-center justify-center rounded-xl bg-emerald-50/60">
                  <Building2 size={48} className="opacity-20 text-emerald-700" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="py-16 md:py-20 max-w-6xl mx-auto px-4 md:px-8 -mt-10 relative z-20">
          <RevealSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { icon: GraduationCap, label: 'Program Studi', value: stats.totalProdi },
                { icon: Users, label: 'Tenaga Pendidik', value: stats.totalDosen },
                { icon: UserCheck, label: 'Mahasiswa Aktif', value: stats.totalMahasiswa + '+' },
                { icon: Award, label: 'Pendaftar PPDB', value: stats.totalPendaftar },
              ].map((s, i) => (
                <div key={i} className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-[#e2e8f0] text-center hover:-translate-y-1 transition-all hover:shadow-md">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${c}10` }}>
                    <s.icon size={18} style={{ color: c }} />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: c }}>{s.value}</p>
                  <p className="text-xs text-[#64748b] font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </RevealSection>
        </section>

        <SectionDivider bg="#ffffff" />

        {/* ── TENTANG + PRESTASI ── */}
        {(sambutan.active || landingPage.showPrestasi) && (
          <section id="tentang" className="py-16 md:py-24 bg-white overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <RevealSection>
                <div className="text-center mb-12">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">Tentang Kami</span>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1e293b] mt-3">{tenant.singkatan || tenant.nama_pt}</h2>
                  <p className="text-[#64748b] mt-3 max-w-lg mx-auto">Komitmen kami terhadap pendidikan berkualitas</p>
                </div>
              </RevealSection>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
                {sambutan.active && (
                  <RevealSection className="snap-start shrink-0">
                    <div className="w-[340px] md:w-[420px] bg-[#faf7f2] p-8 rounded-2xl border border-[#e2e8f0] flex flex-col gap-6 hover:-translate-y-2 transition-transform duration-300">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${c}12` }}>
                        <Quote size={22} style={{ color: c }} />
                      </div>
                      <p className="text-base leading-relaxed text-[#64748b] italic">{sambutan.content}</p>
                      <div className="mt-auto pt-6 border-t border-[#e2e8f0] flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-200 ring-2 ring-[#e2e8f0]">
                          {(sambutan.image || tenant.logo_url) && <img src={sambutan.image || tenant.logo_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1e293b]">{sambutan.nama || tenant.nama_pt}</p>
                          <p className="text-xs text-[#64748b]">{sambutan.jabatan}</p>
                        </div>
                      </div>
                    </div>
                  </RevealSection>
                )}
                {prestasi.map((p, i) => {
                  const Icon = iconMap[p.icon] || Award;
                  return (
                    <RevealSection key={i} className="snap-start shrink-0">
                      <div className="w-[280px] bg-[#faf7f2] p-8 rounded-2xl border border-[#e2e8f0] flex flex-col gap-4 hover:-translate-y-2 transition-transform duration-300 h-full">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${c}10` }}>
                          <Icon size={22} style={{ color: c }} />
                        </div>
                        <p className="text-base font-bold text-[#1e293b]">{p.title}</p>
                        <p className="text-sm text-[#64748b] leading-relaxed">{p.desc}</p>
                      </div>
                    </RevealSection>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <SectionDivider />

        {/* ── WHY CHOOSE US ── */}
        <section className="py-16 md:py-24 bg-[#faf7f2]">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <RevealSection>
              <div className="text-center mb-12">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">Mengapa Memilih Kami</span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1e293b] mt-3">Keunggulan {tenant.singkatan || tenant.nama_pt}</h2>
              </div>
            </RevealSection>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: BookOpen, title: 'Kurikulum Terkini', desc: 'Kurikulum berbasis KKNI dan OBE yang disusun bersama praktisi industri untuk menjamin relevansi dengan dunia kerja.' },
                { icon: Users, title: 'Pengajar Berkualitas', desc: 'Dosen tersertifikasi dengan latar belakang pendidikan terbaik dan pengalaman di bidangnya masing-masing.' },
                { icon: Globe, title: 'Jaringan Luas', desc: 'Kerjasama dengan berbagai universitas dan industri di dalam maupun luar negeri untuk magang dan riset.' },
                { icon: Award, title: 'Akreditasi Unggul', desc: 'Seluruh program studi telah terakreditasi BAN-PT dengan peringkat minimal B.' },
                { icon: HeartHandshake, title: 'Beasiswa', desc: 'Berbagai program beasiswa prestasi dan kebutuhan bagi mahasiswa berprestasi dan kurang mampu.' },
                { icon: Star, title: 'Alumni Sukses', desc: 'Ribuan alumni telah berkarir di perusahaan multinasional, pemerintah, dan wirausaha sukses.' },
              ].map((item, i) => (
                <RevealSection key={i}>
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#e2e8f0] hover:-translate-y-1 transition-all hover:shadow-md h-full">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${c}10` }}>
                      <item.icon size={22} style={{ color: c }} />
                    </div>
                    <p className="font-bold text-[#1e293b] mb-2">{item.title}</p>
                    <p className="text-sm text-[#64748b] leading-relaxed">{item.desc}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider bg="#ffffff" />

        {/* ── PROGRAM STUDI ── */}
        {landingPage.showProdi && programStudi.length > 0 && (
          <section id="programs" className="py-16 md:py-24 bg-white">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <RevealSection>
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">Akademik</span>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1e293b] mt-3">Program Studi</h2>
                  <p className="text-[#64748b] mt-3">Pilihan program studi berkualitas yang siap mengantarkanmu menuju kesuksesan</p>
                </div>
              </RevealSection>
              <RevealSection>
                <div className="grid md:grid-cols-12 gap-4 md:gap-6">
                  {programStudi.length > 0 && (
                    <div className="md:col-span-7 h-72 md:h-96 relative rounded-2xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-50" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/40 to-transparent p-6 md:p-10 flex flex-col justify-end">
                        <span className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${c}` }}>{programStudi[0].jenjang}</span>
                        <h3 className="text-white text-xl md:text-2xl font-bold mb-3">{programStudi[0].nama}</h3>
                        <div className="flex items-center gap-3">
                          {programStudi[0].akreditasi && <span className="flex items-center gap-1 text-xs text-white bg-emerald-600/60 px-2 py-0.5 rounded-full"><CheckCircle size={12} /> {programStudi[0].akreditasi}</span>}
                          {programStudi[0].fakultas && <span className="text-xs text-white/60">{programStudi[0].fakultas}</span>}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="md:col-span-5 grid grid-cols-1 gap-4 md:gap-6">
                    {programStudi.slice(1, 3).map(p => (
                      <div key={p.id} className="h-36 md:h-[184px] relative rounded-2xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-50" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/30 to-transparent p-5 flex flex-col justify-end">
                          <span className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: `${c}` }}>{p.jenjang}</span>
                          <h3 className="text-white text-sm md:text-base font-bold">{p.nama}</h3>
                          {p.akreditasi && <span className="flex items-center gap-1 text-[11px] text-white/70 mt-1"><CheckCircle size={10} /> {p.akreditasi}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {programStudi.slice(3).map(p => (
                    <div key={p.id} className="md:col-span-3 bg-white p-5 rounded-2xl shadow-sm border border-[#e2e8f0] hover:-translate-y-1 transition-all hover:shadow-md">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded inline-block mb-2" style={{ backgroundColor: `${c}10`, color: c }}>{p.jenjang}</span>
                      <p className="text-sm font-bold text-[#1e293b] mb-1">{p.nama}</p>
                      {p.fakultas && <p className="text-xs text-[#64748b]">{p.fakultas}</p>}
                      <div className="flex items-center gap-2 mt-3">
                        {p.akreditasi && <span className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700"><CheckCircle size={9} /> {p.akreditasi}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </RevealSection>
            </div>
          </section>
        )}

        <SectionDivider />

        {/* ── FASILITAS ── */}
        <section id="fasilitas" className="py-16 md:py-24 bg-[#faf7f2]">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <RevealSection>
              <div className="text-center mb-12">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">Fasilitas</span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1e293b] mt-3">Sarana & Prasarana</h2>
                <p className="text-[#64748b] mt-3 max-w-lg mx-auto">Fasilitas modern yang mendukung proses belajar mengajar dan pengembangan diri mahasiswa</p>
              </div>
            </RevealSection>
            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              {fasilitas.map((f, i) => (
                <RevealSection key={i}>
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#e2e8f0] hover:-translate-y-1 transition-all hover:shadow-md flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${c}10` }}>
                      <f.icon size={22} style={{ color: c }} />
                    </div>
                    <div>
                      <p className="font-bold text-[#1e293b] mb-1">{f.title}</p>
                      <p className="text-sm text-[#64748b] leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider bg="#ffffff" />

        {/* ── TESTIMONI ── */}
        <section className="py-16 md:py-24 bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <RevealSection>
              <div className="text-center mb-12">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">Testimoni</span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1e293b] mt-3">Apa Kata Alumni</h2>
                <p className="text-[#64748b] mt-3">Cerita sukses dan pengalaman dari para alumni</p>
              </div>
            </RevealSection>
            <div className="grid md:grid-cols-3 gap-6">
              {testimoni.map((t, i) => (
                <RevealSection key={i}>
                  <div className="bg-[#faf7f2] p-6 md:p-8 rounded-2xl border border-[#e2e8f0] h-full flex flex-col hover:-translate-y-1 transition-all">
                    <QuoteIcon size={24} className="mb-4 opacity-30" style={{ color: c }} />
                    <p className="text-sm text-[#64748b] leading-relaxed italic flex-1">"{t.quote}"</p>
                    <div className="mt-6 pt-5 border-t border-[#e2e8f0]">
                      <p className="text-sm font-bold text-[#1e293b]">{t.nama}</p>
                      <p className="text-xs text-[#64748b]">{t.program} · Lulus {t.tahun}</p>
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ── PROMOSI ── */}
        {landingPage.showPromosi && promosi.length > 0 && (
          <section className="py-16 md:py-24 bg-[#faf7f2]">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <RevealSection>
                <div className="text-center mb-12">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">Program</span>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1e293b] mt-3">Informasi & Promosi</h2>
                  <p className="text-[#64748b] mt-3">Kegiatan dan program terbaru</p>
                </div>
              </RevealSection>
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                {promosi.map((p, i) => (
                  <RevealSection key={i}>
                    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-[#e2e8f0] hover:-translate-y-1 transition-all hover:shadow-md">
                      {p.image && (
                        <div className="relative h-44 overflow-hidden">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      )}
                      <div className="p-5">
                        <p className="text-sm font-bold text-[#1e293b]">{p.title}</p>
                        {p.description && <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed line-clamp-2">{p.description}</p>}
                        {p.link && (
                          <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold mt-3 hover:underline" style={{ color: c }}>
                            Selengkapnya <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </div>
          </section>
        )}

        <SectionDivider bg="#ffffff" />

        {/* ── STRUKTUR ORGANISASI ── */}
        {landingPage.showStruktur && strukturOrganisasi.length > 0 && (
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <RevealSection>
                <div className="text-center mb-12">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">Pimpinan</span>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1e293b] mt-3">Struktur Organisasi</h2>
                  <p className="text-[#64748b] mt-3">Tim kepemimpinan kami</p>
                </div>
              </RevealSection>
              <RevealSection>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {strukturOrganisasi.map((s) => (
                    <div key={s.id} className="bg-[#faf7f2] rounded-2xl p-5 text-center border border-[#e2e8f0] hover:-translate-y-1 transition-all hover:shadow-md">
                      <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden ring-2 ring-[#e2e8f0] bg-white flex items-center justify-center">
                        {s.image ? <img src={s.image} alt={s.nama} className="w-full h-full object-cover" /> : <Users size={22} className="text-[#94a3b8]" />}
                      </div>
                      <p className="text-xs font-bold text-[#1e293b]">{s.nama}</p>
                      <p className="text-[10px] text-[#64748b] mt-1">{s.jabatan}</p>
                    </div>
                  ))}
                </div>
              </RevealSection>
            </div>
          </section>
        )}

        <SectionDivider />

        {/* ── BERITA ── */}
        {landingPage.showBerita && berita.length > 0 && (
          <section id="berita" className="py-16 md:py-24 bg-[#faf7f2]">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <RevealSection>
                <div className="text-center mb-12">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">Berita</span>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1e293b] mt-3">Berita Terkini</h2>
                  <p className="text-[#64748b] mt-3">Informasi dan kegiatan terbaru</p>
                </div>
              </RevealSection>
              <div className="grid md:grid-cols-3 gap-6">
                {berita.map(b => (
                  <RevealSection key={b.id}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#e2e8f0] hover:-translate-y-1 transition-all hover:shadow-md">
                      {b.gambar && (
                        <div className="relative h-44 overflow-hidden">
                          <img src={b.gambar} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      )}
                      <div className="p-5">
                        <p className="font-bold text-sm text-[#1e293b] line-clamp-2">{b.judul}</p>
                        {b.ringkasan && <p className="text-xs text-[#64748b] mt-1.5 line-clamp-2 leading-relaxed">{b.ringkasan}</p>}
                        {b.published_at && (
                          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-[#64748b]">
                            <Calendar size={10} />
                            {new Date(b.published_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </div>
          </section>
        )}

        <SectionDivider bg="#ffffff" />

        {/* ── CTA PPDB ── */}
        {landingPage.showPPDB && (
          <section id="ppdb" className="py-16 md:py-24 relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M30 0v60M0 30h60' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")` }} />
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: c, filter: 'blur(80px)', transform: 'translate(-30%, -30%)' }} />
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: c, filter: 'blur(80px)', transform: 'translate(30%, 30%)' }} />
            <RevealSection>
              <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Your Journey Starts Today.</h2>
                <p className="text-[#94a3b8] text-base md:text-lg max-w-xl mx-auto mb-10">Daftar sekarang dan mulai perjalanan akademikmu bersama {tenant.nama_pt}. Raih masa depan cerah bersama kami.</p>
                <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                  <Link to={`/kampus/${slug}/ppdb`}
                    className="group px-10 py-4 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2" style={{ backgroundColor: c }}>
                    Daftar PPDB {landingPage.tahunAkademik} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a href={`/login?tenant=${slug}`}
                    className="px-10 py-4 border-2 border-white/20 text-white/80 rounded-xl text-sm font-bold hover:bg-white hover:text-[#0f172a] transition-all">
                    Portal Akademik
                  </a>
                </div>
              </div>
            </RevealSection>
          </section>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-[#e2e8f0] flex items-center justify-center bg-white">
                  {tenant.logo_url ? <img src={tenant.logo_url} alt="" className="w-full h-full object-cover" /> : <Building2 size={18} style={{ color: c }} />}
                </div>
                <span className="font-bold text-base" style={{ color: c }}>{tenant.singkatan || tenant.nama_pt}</span>
              </div>
              <p className="text-sm text-[#64748b] leading-relaxed">{tenant.nama_pt} — perguruan tinggi yang berkomitmen mencetak generasi unggul, berkarakter, dan siap bersaing di era global.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-4">Kontak</p>
                <div className="space-y-3">
                  {tenant.telepon && <p className="text-sm text-[#64748b] flex items-center gap-2"><Phone size={12} /> {tenant.telepon}</p>}
                  {tenant.email && <p className="text-sm text-[#64748b] flex items-center gap-2"><Mail size={12} /> {tenant.email}</p>}
                  {tenant.alamat && <p className="text-sm text-[#64748b] flex items-start gap-2"><MapPin size={12} className="mt-0.5 shrink-0" /> {tenant.alamat}</p>}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-4">Akses</p>
                <div className="space-y-2.5">
                  <a href={`/login?tenant=${slug}`} className="block text-sm text-[#64748b] hover:text-[#1e293b] transition-colors">Portal Akademik</a>
                  <Link to={`/kampus/${slug}/ppdb`} className="block text-sm text-[#64748b] hover:text-[#1e293b] transition-colors">PPDB Online</Link>
                  <a href="#programs" onClick={e => { e.preventDefault(); scrollTo('#programs'); }} className="block text-sm text-[#64748b] hover:text-[#1e293b] transition-colors">Program Studi</a>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-4">Navigasi</p>
                <div className="space-y-2.5">
                  <a href="#tentang" onClick={e => { e.preventDefault(); scrollTo('#tentang'); }} className="block text-sm text-[#64748b] hover:text-[#1e293b] transition-colors">Tentang</a>
                  <a href="#fasilitas" onClick={e => { e.preventDefault(); scrollTo('#fasilitas'); }} className="block text-sm text-[#64748b] hover:text-[#1e293b] transition-colors">Fasilitas</a>
                  <a href="#berita" onClick={e => { e.preventDefault(); scrollTo('#berita'); }} className="block text-sm text-[#64748b] hover:text-[#1e293b] transition-colors">Berita</a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#e2e8f0] mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#64748b]">© {new Date().getFullYear()} {tenant.nama_pt}. All rights reserved.</p>
            <p className="text-xs text-[#64748b]">Powered by <span className="font-medium" style={{ color: c }}>AONE SIAKAD</span></p>
          </div>
        </div>
      </footer>

      {/* ── POPUP ── */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => { setShowPopup(false); localStorage.setItem(`popup_${slug}_seen`, 'true'); }}>
          <div className="max-w-md w-full rounded-2xl bg-white border border-[#e2e8f0] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowPopup(false); localStorage.setItem(`popup_${slug}_seen`, 'true'); }}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/10 hover:bg-black/20 transition-colors z-10">
              <X size={14} />
            </button>
            {popUp.image && <img src={popUp.image} alt="" className="w-full h-44 object-cover" />}
            <div className="p-6">
              {popUp.title && <h3 className="text-base font-bold text-[#1e293b] mb-2">{popUp.title}</h3>}
              {popUp.content && <p className="text-sm text-[#64748b] leading-relaxed">{popUp.content}</p>}
              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => { setShowPopup(false); localStorage.setItem(`popup_${slug}_seen`, 'true'); }}
                  className="px-3 py-1.5 text-xs text-[#64748b] hover:text-[#1e293b] transition-colors">{popUp.buttonText || 'Tutup'}</button>
                {popUp.buttonLink && (
                  <a href={popUp.buttonLink} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all" style={{ backgroundColor: c }}>Detail</a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
