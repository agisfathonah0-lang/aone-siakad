import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get } from '../api/client';
import useSEO from '../hooks/useSEO';
import SplashScreen from '../components/ui/SplashScreen';
import { Building2, GraduationCap, Users, BookOpen, ArrowRight, ExternalLink, Loader2, Award, UserCheck, ChevronLeft, ChevronRight, X, Mail, Phone, MapPin, Calendar, Target, Eye, Quote, School, Trophy, Sparkles, ChevronDown, Play, CheckCircle, Star, Layers, Shield, TrendingUp } from 'lucide-react';

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

const iconMap: Record<string, any> = { Award, Users, BookOpen, GraduationCap, Target, Eye, Trophy, School };

function StatCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || counted.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        const duration = 1500;
        const steps = 30;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= value) { setCount(value); clearInterval(timer); return; }
          setCount(Math.floor(current));
        }, duration / steps);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {children}
    </div>
  );
}

function FloatingParticles({ count = 20 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 6 + 4,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full bg-white/10" style={{
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          animation: `drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}
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
  const [promoIdx, setPromoIdx] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useSEO(
    data?.landingPage.seoTitle || data?.tenant.name || 'Kampus',
    data?.landingPage.seoDescription || `${data?.tenant.nama_pt || 'Kampus'} - Sistem Informasi Akademik terintegrasi.`,
    data?.tenant.logo_url || '/logo.jpg'
  );

  useEffect(() => {
    setLoading(true);
    get<CampusData>(`/public/kampus/${slug}`)
      .then(d => {
        setData(d);
        localStorage.setItem('aone_tenant_slug', slug);
      })
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

  const nextHero = useCallback(() => {
    if (!data) return;
    const imgs = data.landingPage.heroImages?.filter(Boolean) || [];
    if (imgs.length < 2) return;
    setHeroIdx(p => (p + 1) % imgs.length);
  }, [data]);

  const prevHero = useCallback(() => {
    if (!data) return;
    const imgs = data.landingPage.heroImages?.filter(Boolean) || [];
    if (imgs.length < 2) return;
    setHeroIdx(p => (p - 1 + imgs.length) % imgs.length);
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
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-400 text-sm">{error || 'Kampus tidak ditemukan'}</p>
      </div>
    </div>
  );

  const { tenant, landingPage, berita, programStudi, stats } = data;
  const color = landingPage.primaryColor || '#10b981';
  const heroImages = landingPage.heroImages?.filter(Boolean) || [];
  const { popUp, promosi, prestasi, strukturOrganisasi, sambutan } = landingPage;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.06),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\'/%3E%3Cpath d=\'M20 0v40M0 20h40\' stroke=\'%23fff\' stroke-width=\'0.5\'/%3E%3C/svg%3E")' }} />
      </div>

      <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-4 py-3 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90">
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Pendaftaran Mahasiswa Baru {landingPage.tahunAkademik} — Daftar Sekarang!</span>
          </div>
          <Link to={`/kampus/${slug}/ppdb`} className="w-full sm:w-auto px-4 py-1.5 bg-white text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-all shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap animate-pulse">
            Daftar Sekarang <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <nav className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {tenant.logo_url && <img src={tenant.logo_url} alt="" className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/10" />}
            <span className="font-display font-bold text-sm tracking-tight">{tenant.singkatan || tenant.nama_pt}</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={`/login?tenant=${slug}`} className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5">Login</a>
            <Link to={`/kampus/${slug}/ppdb`} className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-lg" style={{ backgroundColor: color }}>Daftar</Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <FloatingParticles count={30} />
        {heroImages.length > 0 && (
          <>
            {heroImages.map((img, i) => (
              <div key={i} className={`absolute inset-0 transition-all duration-1000 ${i === heroIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-[#0a0a0f]/60 to-[#0a0a0f]/90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
              </div>
            ))}
            {heroImages.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {heroImages.map((_, i) => (
                  <button key={i} onClick={() => setHeroIdx(i)} className={`h-1.5 rounded-full transition-all cursor-pointer ${i === heroIdx ? 'w-8' : 'w-1.5 bg-white/30 hover:bg-white/50'}`} style={{ backgroundColor: i === heroIdx ? color : undefined }} />
                ))}
              </div>
            )}
          </>
        )}
        {heroImages.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-[#0a0a0f] to-emerald-950/10" />
        )}
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-10 blur-[100px] -top-40 -right-40" style={{ backgroundColor: color }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-8 blur-[100px] -bottom-40 -left-40" style={{ backgroundColor: '#6366f1' }} />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 w-full pt-20 pb-32">
          {tenant.logo_url && (
            <div className="mb-6 animate-fade-in">
              <img src={tenant.logo_url} alt={tenant.name} className="w-20 h-20 rounded-2xl mx-auto object-cover shadow-2xl ring-1 ring-white/10" />
            </div>
          )}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight mb-4 leading-tight">
            {landingPage.heroTitle.split(' ').map((word, i) => (
              <span key={i}>
                {i === landingPage.heroTitle.split(' ').length - 1 ? (
                  <span className="bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">{word}</span>
                ) : <span>{word} </span>}
              </span>
            ))}
          </h1>
          <p className="text-zinc-400 text-sm md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">{landingPage.heroSubtitle}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href={`/login?tenant=${slug}`} className="group px-6 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95" style={{ backgroundColor: color }}>
              Portal Akademik <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
            {landingPage.showPPDB && (
              <Link to={`/kampus/${slug}/ppdb`} className="px-6 py-3 rounded-xl text-sm font-bold bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all border border-white/10 flex items-center gap-2">
                <Play size={14} /> PPDB Online
              </Link>
            )}
          </div>
          <div className="mt-12 animate-bounce">
            <ChevronDown size={20} className="text-zinc-500 mx-auto" />
          </div>
        </div>
      </section>

      <section className="relative -mt-16 z-20 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: GraduationCap, label: 'Program Studi', value: stats.totalProdi, suffix: '' },
              { icon: Users, label: 'Tenaga Pendidik', value: stats.totalDosen, suffix: '' },
              { icon: UserCheck, label: 'Mahasiswa Aktif', value: stats.totalMahasiswa, suffix: '+', color: true },
              { icon: Award, label: 'Pendaftar PPDB', value: stats.totalPendaftar, suffix: '' },
            ].map((s, i) => (
              <div key={i} className="group rounded-2xl bg-[#0a0a0f]/80 backdrop-blur-xl p-5 text-center border border-white/[0.06] hover:border-white/[0.12] transition-all hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all group-hover:scale-110" style={{ backgroundColor: s.color ? `${color}20` : 'rgba(255,255,255,0.04)' }}>
                  <s.icon size={18} style={{ color: s.color ? color : undefined }} className={s.color ? '' : 'text-zinc-400'} />
                </div>
                <p className="text-2xl md:text-3xl font-bold font-display tracking-tight"><StatCounter value={s.value} suffix={s.suffix} /></p>
                <p className="text-[11px] text-zinc-500 font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {sambutan.active && (
        <RevealSection>
          <section className="max-w-6xl mx-auto px-4 pb-20">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-indigo-500/5" />
              <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
                {(sambutan.image || tenant.logo_url) && (
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shrink-0 ring-2 ring-white/10 shadow-xl">
                    <img src={sambutan.image || tenant.logo_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 text-center md:text-left">
                  <Quote className="w-5 h-5 mb-2 opacity-30" style={{ color }} />
                  <p className="text-sm text-zinc-300 leading-relaxed italic">{sambutan.content || `${landingPage.heroTitle} — ${landingPage.heroSubtitle}`}</p>
                  <div className="mt-4 flex items-center gap-3 justify-center md:justify-start">
                    <div className="w-8 h-px" style={{ backgroundColor: color }} />
                    <div>
                      <p className="text-sm font-bold">{sambutan.nama || tenant.nama_pt}</p>
                      <p className="text-[11px] text-zinc-500">{sambutan.jabatan || 'Pimpinan'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealSection>
      )}

      {landingPage.showPrestasi && prestasi.length > 0 && (
        <RevealSection>
          <section className="max-w-6xl mx-auto px-4 pb-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Prestasi & Akreditasi</h2>
              <p className="text-sm text-zinc-500 mt-2">Komitmen kami terhadap kualitas pendidikan</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {prestasi.map((p, i) => {
                const Icon = iconMap[p.icon] || Award;
                return (
                  <div key={i} className="group rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 hover:bg-white/[0.06] transition-all hover:-translate-y-0.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:scale-110 group-hover:rotate-3" style={{ backgroundColor: `${color}15` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="text-[12px] text-zinc-500 mt-1 leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </RevealSection>
      )}

      {landingPage.showProdi && programStudi.length > 0 && (
        <RevealSection>
          <section className="max-w-6xl mx-auto px-4 pb-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Program Studi</h2>
              <p className="text-sm text-zinc-500 mt-2">Pilihan program studi berkualitas</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {programStudi.map(p => (
                <div key={p.id} className="group rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 hover:bg-white/[0.06] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md" style={{ backgroundColor: `${color}15`, color }}>{p.jenjang}</span>
                    {p.akreditasi && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                        <CheckCircle size={11} /> {p.akreditasi}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-sm">{p.nama}</p>
                  {p.fakultas && <p className="text-[11px] text-zinc-500 mt-1">{p.fakultas}</p>}
                </div>
              ))}
            </div>
          </section>
        </RevealSection>
      )}

      {landingPage.showPromosi && promosi.length > 0 && (
        <RevealSection>
          <section className="max-w-6xl mx-auto px-4 pb-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Informasi & Promosi</h2>
              <p className="text-sm text-zinc-500 mt-2">Kegiatan dan program terbaru</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promosi.map((p, i) => (
                <div key={i} className="group rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:bg-white/[0.06] transition-all hover:-translate-y-0.5">
                  {p.image && (
                    <div className="relative overflow-hidden h-44">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm font-bold">{p.title}</p>
                    {p.description && <p className="text-[12px] text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">{p.description}</p>}
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold mt-3 hover:underline" style={{ color }}>
                        Selengkapnya <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </RevealSection>
      )}

      {landingPage.showStruktur && strukturOrganisasi.length > 0 && (
        <RevealSection>
          <section className="max-w-6xl mx-auto px-4 pb-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Struktur Organisasi</h2>
              <p className="text-sm text-zinc-500 mt-2">Tim kepemimpinan kami</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {strukturOrganisasi.map((s) => (
                <div key={s.id} className="group rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 text-center hover:bg-white/[0.06] transition-all hover:-translate-y-0.5">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden ring-2 ring-white/10 bg-zinc-800 flex items-center justify-center transition-all group-hover:ring-emerald-500/30">
                    {s.image ? <img src={s.image} alt={s.nama} className="w-full h-full object-cover" /> : <Users size={22} className="text-zinc-500" />}
                  </div>
                  <p className="text-xs font-bold">{s.nama}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">{s.jabatan}</p>
                </div>
              ))}
            </div>
          </section>
        </RevealSection>
      )}

      {landingPage.showBerita && berita.length > 0 && (
        <RevealSection>
          <section className="max-w-6xl mx-auto px-4 pb-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Berita Terkini</h2>
              <p className="text-sm text-zinc-500 mt-2">Informasi dan kegiatan terbaru di kampus</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {berita.map(b => (
                <div key={b.id} className="group rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:bg-white/[0.06] transition-all hover:-translate-y-0.5">
                  {b.gambar && (
                    <div className="relative overflow-hidden h-44">
                      <img src={b.gambar} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-semibold text-sm line-clamp-2">{b.judul}</p>
                    {b.ringkasan && <p className="text-[12px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">{b.ringkasan}</p>}
                    {b.published_at && (
                      <div className="flex items-center gap-1.5 mt-3 text-[10px] text-zinc-600">
                        <Calendar size={10} />
                        {new Date(b.published_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </RevealSection>
      )}

      {landingPage.showPPDB && (
        <RevealSection>
          <section className="max-w-6xl mx-auto px-4 pb-20">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-indigo-600" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
              <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
                    <GraduationCap size={18} className="text-emerald-200" />
                    <span className="text-sm font-bold text-white/90">PPDB {landingPage.tahunAkademik}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white">Pendaftaran Mahasiswa Baru</h2>
                  <p className="text-sm text-emerald-100/80 mt-1 max-w-md">{tenant.nama_pt}</p>
                </div>
                <Link to={`/kampus/${slug}/ppdb`} className="group px-8 py-3 bg-white text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-all shadow-xl flex items-center gap-2 whitespace-nowrap">
                  Daftar Sekarang <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        </RevealSection>
      )}

      <footer className="border-t border-white/[0.06] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                {tenant.logo_url && <img src={tenant.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10" />}
                <span className="font-display font-bold text-base">{tenant.singkatan || tenant.nama_pt}</span>
              </div>
              <p className="text-[12px] text-zinc-600 leading-relaxed max-w-sm">Sistem Informasi Akademik Terpadu {tenant.nama_pt}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 mb-3 uppercase tracking-widest">Kontak</p>
              <div className="space-y-2">
                {tenant.telepon && <p className="text-[12px] text-zinc-500 flex items-center gap-2"><Phone size={11} className="shrink-0" /> {tenant.telepon}</p>}
                {tenant.email && <p className="text-[12px] text-zinc-500 flex items-center gap-2"><Mail size={11} className="shrink-0" /> {tenant.email}</p>}
                {tenant.alamat && <p className="text-[12px] text-zinc-500 flex items-start gap-2"><MapPin size={11} className="shrink-0 mt-0.5" /> {tenant.alamat}</p>}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 mb-3 uppercase tracking-widest">Akses Cepat</p>
              <div className="space-y-2">
                <a href={`/login?tenant=${slug}`} className="block text-[12px] text-zinc-500 hover:text-emerald-400 transition-colors">Portal Akademik</a>
                <Link to={`/kampus/${slug}/ppdb`} className="block text-[12px] text-zinc-500 hover:text-emerald-400 transition-colors">PPDB Online</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-zinc-600">{tenant.nama_pt} — Powered by <span className="text-zinc-400">AONE SIAKAD</span></p>
          </div>
        </div>
      </footer>

      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0a0f]/80 backdrop-blur-sm" onClick={() => { setShowPopup(false); localStorage.setItem(`popup_${slug}_seen`, 'true'); }}>
          <div className="max-w-md w-full rounded-2xl bg-[#0a0a0f] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowPopup(false); localStorage.setItem(`popup_${slug}_seen`, 'true'); }} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors z-10">
              <X size={14} />
            </button>
            {popUp.image && <img src={popUp.image} alt="" className="w-full h-44 object-cover" />}
            <div className="p-5">
              {popUp.title && <h3 className="text-base font-bold font-display mb-2">{popUp.title}</h3>}
              {popUp.content && <p className="text-xs text-zinc-400 leading-relaxed">{popUp.content}</p>}
              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => { setShowPopup(false); localStorage.setItem(`popup_${slug}_seen`, 'true'); }} className="px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors">
                  {popUp.buttonText || 'Tutup'}
                </button>
                {popUp.buttonLink && (
                  <a href={popUp.buttonLink} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all" style={{ backgroundColor: color }}>
                    Detail
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes drift { 0%,100%{transform:translate(0,0)} 33%{transform:translate(15px,-15px)} 66%{transform:translate(-10px,10px)} }
        @keyframes fade-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .animate-fade-in { animation: fade-in 0.6s ease-out }

      `}</style>
    </div>
  );
}
