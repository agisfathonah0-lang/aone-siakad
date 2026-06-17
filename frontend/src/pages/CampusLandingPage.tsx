import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get } from '../api/client';
import useSEO from '../hooks/useSEO';
import SplashScreen from '../components/ui/SplashScreen';
import { Building2, GraduationCap, Users, BookOpen, ArrowRight, ExternalLink, Loader2, Award, UserCheck, ChevronLeft, ChevronRight, X, Mail, Phone, MapPin, Calendar, Target, Eye, Quote, School, Trophy, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-black flex items-center justify-center">
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
    <div className="min-h-screen bg-black text-white">
      <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-indigo-600 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-3 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90">
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Pendaftaran Mahasiswa Baru {landingPage.tahunAkademik} — Daftar Sekarang!</span>
          </div>
          <Link to={`/kampus/${slug}/ppdb`} className="w-full sm:w-auto px-4 py-1.5 bg-white text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-all shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap">
            Daftar Sekarang <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tenant.logo_url && <img src={tenant.logo_url} alt="" className="w-6 h-6 rounded object-cover" />}
            <span className="font-display font-bold text-sm">{tenant.singkatan || tenant.nama_pt}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <a href={`/login?tenant=${slug}`} className="hover:text-emerald-400 transition-colors">Login</a>
            <Link to={`/kampus/${slug}/ppdb`} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] transition-all">Daftar</Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {heroImages.length > 0 && (
          <>
            {heroImages.map((img, i) => (
              <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
              </div>
            ))}
            {heroImages.length > 1 && (
              <>
                <button onClick={prevHero} className="absolute left-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><ChevronLeft size={20} /></button>
                <button onClick={nextHero} className="absolute right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><ChevronRight size={20} /></button>
                <div className="absolute bottom-6 z-20 flex items-center gap-2">
                  {heroImages.map((_, i) => (
                    <button key={i} onClick={() => setHeroIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === heroIdx ? 'w-6' : ''}`} style={{ backgroundColor: i === heroIdx ? color : 'rgba(255,255,255,0.3)' }} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
        {heroImages.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-black to-emerald-950/10" />
        )}
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl -top-40 -right-40" style={{ backgroundColor: color }} />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 w-full">
          {tenant.logo_url && <img src={tenant.logo_url} alt={tenant.name} className="w-16 h-16 rounded-2xl mx-auto mb-4 object-cover shadow-lg ring-1 ring-white/10" />}
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight mb-3">{landingPage.heroTitle}</h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto">{landingPage.heroSubtitle}</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <a href={`/login?tenant=${slug}`} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center gap-2" style={{ backgroundColor: color }}>
              Portal Akademik <ArrowRight size={14} />
            </a>
            {landingPage.showPPDB && (
              <Link to={`/kampus/${slug}/ppdb`} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white/5 text-zinc-300 hover:bg-white/10 transition-all border border-white/10">
                PPDB Online
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-zinc-900/80 backdrop-blur-xl p-4 text-center border border-white/5">
            <GraduationCap className="w-5 h-5 mx-auto mb-2" style={{ color }} />
            <p className="text-2xl font-bold font-display">{stats.totalProdi}</p>
            <p className="text-[10px] text-zinc-500 font-medium">Program Studi</p>
          </div>
          <div className="rounded-2xl bg-zinc-900/80 backdrop-blur-xl p-4 text-center border border-white/5">
            <Users className="w-5 h-5 mx-auto mb-2" style={{ color }} />
            <p className="text-2xl font-bold font-display">{stats.totalDosen}</p>
            <p className="text-[10px] text-zinc-500 font-medium">Tenaga Pendidik</p>
          </div>
          <div className="rounded-2xl bg-zinc-900/80 backdrop-blur-xl p-4 text-center border border-white/5">
            <UserCheck className="w-5 h-5 mx-auto mb-2" style={{ color }} />
            <p className="text-2xl font-bold font-display">{stats.totalMahasiswa}</p>
            <p className="text-[10px] text-zinc-500 font-medium">Mahasiswa Aktif</p>
          </div>
          <div className="rounded-2xl bg-zinc-900/80 backdrop-blur-xl p-4 text-center border border-white/5">
            <Award className="w-5 h-5 mx-auto mb-2" style={{ color }} />
            <p className="text-2xl font-bold font-display">{stats.totalPendaftar}</p>
            <p className="text-[10px] text-zinc-500 font-medium">Pendaftar PPDB</p>
          </div>
        </div>
      </section>

      {sambutan.active && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-white/5 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
            {(sambutan.image || tenant.logo_url) && (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shrink-0 ring-2 ring-white/10">
                <img src={sambutan.image || tenant.logo_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <Quote className="w-5 h-5 mb-2 opacity-40" style={{ color }} />
              <p className="text-sm text-zinc-300 leading-relaxed italic">{sambutan.content || `${landingPage.heroTitle} — ${landingPage.heroSubtitle}`}</p>
              <div className="mt-3">
                <p className="text-sm font-bold">{sambutan.nama}</p>
                <p className="text-[10px] text-zinc-500">{sambutan.jabatan}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {landingPage.showPrestasi && prestasi.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-lg font-display font-bold tracking-tight mb-4">Prestasi & Akreditasi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {prestasi.map((p, i) => {
              const Icon = iconMap[p.icon] || Award;
              return (
                <div key={i} className="rounded-xl bg-zinc-900/50 border border-white/5 p-4 flex items-center gap-3 hover:bg-zinc-900/80 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {landingPage.showProdi && programStudi.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-lg font-display font-bold tracking-tight mb-4">Program Studi</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {programStudi.map(p => (
              <div key={p.id} className="rounded-xl bg-zinc-900/50 border border-white/5 p-4 hover:bg-zinc-900/80 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${color}20`, color }}>{p.jenjang}</span>
                  {p.akreditasi && <span className="text-[10px] text-zinc-500">{p.akreditasi}</span>}
                </div>
                <p className="font-semibold text-sm mt-2">{p.nama}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{p.fakultas}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {landingPage.showPromosi && promosi.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-lg font-display font-bold tracking-tight mb-4">Promosi</h2>
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-2">
              {promosi.map((p, i) => (
                <div key={i} className="min-w-[280px] md:min-w-[320px] snap-start rounded-xl bg-zinc-900/50 border border-white/5 overflow-hidden hover:bg-zinc-900/80 transition-colors shrink-0">
                  {p.image && <img src={p.image} alt={p.title} className="w-full h-36 object-cover" />}
                  <div className="p-4">
                    <p className="text-sm font-bold">{p.title}</p>
                    {p.description && <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{p.description}</p>}
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold mt-2 hover:underline" style={{ color }}>
                        Selengkapnya <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {landingPage.showStruktur && strukturOrganisasi.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-lg font-display font-bold tracking-tight mb-4">Struktur Organisasi</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {strukturOrganisasi.map((s) => (
              <div key={s.id} className="rounded-xl bg-zinc-900/50 border border-white/5 p-4 text-center hover:bg-zinc-900/80 transition-colors">
                <div className="w-14 h-14 rounded-full mx-auto mb-2 overflow-hidden ring-2 ring-white/10 bg-zinc-800 flex items-center justify-center">
                  {s.image ? <img src={s.image} alt={s.nama} className="w-full h-full object-cover" /> : <Users size={20} className="text-zinc-500" />}
                </div>
                <p className="text-xs font-bold">{s.nama}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{s.jabatan}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {landingPage.showBerita && berita.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-lg font-display font-bold tracking-tight mb-4">Berita Terkini</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {berita.map(b => (
              <div key={b.id} className="rounded-xl bg-zinc-900/50 border border-white/5 overflow-hidden hover:bg-zinc-900/80 transition-colors">
                {b.gambar && <img src={b.gambar} alt="" className="w-full h-36 object-cover" />}
                <div className="p-3.5">
                  <p className="font-semibold text-sm line-clamp-2">{b.judul}</p>
                  {b.ringkasan && <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{b.ringkasan}</p>}
                  {b.published_at && <p className="text-[10px] text-zinc-600 mt-2">{new Date(b.published_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {landingPage.showPPDB && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-indigo-600 p-6 md:p-8 border border-emerald-400/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <GraduationCap size={18} className="text-emerald-200" />
                  <span className="text-sm font-bold text-white">PPDB {landingPage.tahunAkademik}</span>
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold tracking-tight text-white">Pendaftaran Mahasiswa Baru {tenant.nama_pt}</h2>
                  <p className="text-xs text-emerald-100/80 mt-1">Daftar sekarang dan dapatkan promo spesial untuk pendaftaran awal</p>
                </div>
              </div>
              <Link to={`/kampus/${slug}/ppdb`} className="px-6 py-3 bg-white text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap">
                Daftar PPDB <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {tenant.logo_url && <img src={tenant.logo_url} alt="" className="w-5 h-5 rounded object-cover" />}
                <span className="font-display font-bold text-sm">{tenant.singkatan || tenant.nama_pt}</span>
              </div>
              <p className="text-[10px] text-zinc-600 leading-relaxed max-w-xs">Sistem Informasi Akademik Terpadu {tenant.nama_pt}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Kontak</p>
              <div className="space-y-1.5">
                {tenant.telepon && <p className="text-[11px] text-zinc-500 flex items-center gap-1.5"><Phone size={10} /> {tenant.telepon}</p>}
                {tenant.email && <p className="text-[11px] text-zinc-500 flex items-center gap-1.5"><Mail size={10} /> {tenant.email}</p>}
                {tenant.alamat && <p className="text-[11px] text-zinc-500 flex items-start gap-1.5"><MapPin size={10} className="mt-0.5" /> {tenant.alamat}</p>}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Akses Cepat</p>
              <div className="space-y-1">
                <a href={`/login?tenant=${slug}`} className="block text-[11px] text-zinc-500 hover:text-emerald-400 transition-colors">Portal Akademik</a>
                <Link to={`/kampus/${slug}/ppdb`} className="block text-[11px] text-zinc-500 hover:text-emerald-400 transition-colors">PPDB Online</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-[10px] text-zinc-600">{tenant.nama_pt} — Powered by AONE SIAKAD</p>
          </div>
        </div>
      </footer>

      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setShowPopup(false); localStorage.setItem(`popup_${slug}_seen`, 'true'); }}>
          <div className="max-w-md w-full rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
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
    </div>
  );
}
