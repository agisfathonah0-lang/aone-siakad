import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get } from '../api/client';
import useSEO from '../hooks/useSEO';
import SplashScreen from '../components/ui/SplashScreen';
import { Building2, GraduationCap, Users, BookOpen, ArrowRight, ExternalLink, Loader2, Award, UserCheck, ChevronLeft, ChevronRight, X, Mail, Phone, MapPin, Calendar, Target, Eye, Quote, School, Trophy, Sparkles, Play, CheckCircle, Star, ArrowLeft, Search, Globe, FlaskConical, UsersRound, Library, ChevronUp } from 'lucide-react';

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

function hexToRgb(hex: string) {
  const c = hex.replace('#', '');
  return { r: parseInt(c.substring(0, 2), 16), g: parseInt(c.substring(2, 4), 16), b: parseInt(c.substring(4, 6), 16) };
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
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
    active: true, title: 'Sambutan', content: `${tenant.nama_pt} berkomitmen menciptakan lingkungan akademik yang inovatif, inklusif, dan berdaya saing global.`, nama: `Rektor ${tenant.nama_pt}`, jabatan: 'Rektor', image: ''
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

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#121c2a] font-sans antialiased overflow-x-hidden">
      <header className="w-full top-0 sticky z-50 bg-[#f8f9ff]/80 backdrop-blur-md border-b border-[#bdcabc]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2.5">
            {tenant.logo_url && <img src={tenant.logo_url} alt="" className="w-7 h-7 md:w-8 md:h-8 rounded-lg object-cover ring-1 ring-white/30" />}
            <span className="font-bold text-sm md:text-base" style={{ color: c }}>{tenant.singkatan || tenant.nama_pt}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#programs" className="text-sm font-semibold transition-colors" style={{ color: c }}>Programs</a>
            <a href="#experience" className="text-sm text-[#6e7a6e] hover:transition-colors" style={{ '--hover-color': c } as React.CSSProperties} onMouseOver={e => (e.target as HTMLElement).style.color = c} onMouseOut={e => (e.target as HTMLElement).style.color = '#6e7a6e'}>Experience</a>
            <a href="#news" className="text-sm text-[#6e7a6e] hover:transition-colors" style={{ '--hover-color': c } as React.CSSProperties} onMouseOver={e => (e.target as HTMLElement).style.color = c} onMouseOut={e => (e.target as HTMLElement).style.color = '#6e7a6e'}>News</a>
            {landingPage.showPPDB && <a href="#ppdb" className="text-sm text-[#6e7a6e] transition-colors" style={{ '--hover-color': c } as React.CSSProperties} onMouseOver={e => (e.target as HTMLElement).style.color = c} onMouseOut={e => (e.target as HTMLElement).style.color = '#6e7a6e'}>Admissions</a>}
          </nav>
          <div className="flex items-center gap-3">
            <a href={`/login?tenant=${slug}`} className="text-sm font-medium text-[#6e7a6e] hover:transition-colors" style={{ '--hover-color': c } as React.CSSProperties} onMouseOver={e => (e.target as HTMLElement).style.color = c} onMouseOut={e => (e.target as HTMLElement).style.color = '#6e7a6e'}>Login</a>
            {landingPage.showPPDB && (
              <Link to={`/kampus/${slug}/ppdb`} className="text-sm font-bold text-white px-5 py-2 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md" style={{ backgroundColor: c }}>
                Apply Now
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#eff4ff]">
          <div className="absolute inset-0 z-0">
            {heroImages.length > 0 ? (
              heroImages.map((img, i) => (
                <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#f8f9ff] via-[#f8f9ff]/90 to-transparent" />
            {heroImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroImages.map((_, i) => (
                  <button key={i} onClick={() => setHeroIdx(i)} className="h-2 rounded-full transition-all cursor-pointer" style={{ width: i === heroIdx ? 24 : 8, backgroundColor: i === heroIdx ? c : 'rgba(0,0,0,0.15)' }} />
                ))}
              </div>
            )}
          </div>
          <div className="max-w-6xl mx-auto px-4 md:px-8 w-full relative z-10 py-20 md:py-0" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ backgroundColor: `${c}15`, color: c }}>
                <Sparkles size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">Pendaftaran {landingPage.tahunAkademik}</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
                {(() => {
                  const words = (landingPage.heroTitle || `Selamat Datang di ${tenant.nama_pt}`).split(' ');
                  const mid = words.length > 1 ? words.length - 1 : 0;
                  return (
                    <>
                      {words.slice(0, mid).join(' ')}<br />
                      <span className="italic" style={{ color: c }}>{words.slice(mid).join(' ')}</span>
                    </>
                  );
                })()}
              </h1>
              <p className="text-base md:text-lg text-[#6e7a6e] max-w-lg mb-8 leading-relaxed">
                {landingPage.heroSubtitle || `Join ${tenant.nama_pt} and shape your future.`}
              </p>
              <div className="flex flex-wrap gap-3">
                {landingPage.showPPDB && (
                  <Link to={`/kampus/${slug}/ppdb`} className="group px-8 py-3.5 rounded-lg text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2" style={{ backgroundColor: c, boxShadow: `0 8px 24px ${c}30` }}>
                    Mulai Pendaftaran <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                <a href="#programs" className="px-6 py-3.5 rounded-lg text-sm font-bold border-2 transition-all flex items-center gap-2" style={{ borderColor: `${c}30`, color: c }}>
                  <Play size={16} /> Jelajahi
                </a>
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4 relative" style={{ height: 500 }}>
              {heroImages.length > 0 ? (
                <>
                  <div className="pt-10 transform hover:-translate-y-2 transition-transform duration-500">
                    <img src={heroImages[0]} alt="" className="w-full h-full object-cover rounded-xl shadow-2xl" style={{ border: '4px solid rgba(255,255,255,0.5)' }} />
                  </div>
                  <div className="pb-10 transform hover:translate-y-2 transition-transform duration-500">
                    <img src={heroImages[heroImages.length > 1 ? 1 : 0]} alt="" className="w-full h-full object-cover rounded-xl shadow-2xl" style={{ border: '4px solid rgba(255,255,255,0.5)' }} />
                  </div>
                </>
              ) : (
                <div className="col-span-2 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${c}08` }}>
                  <Building2 size={48} className="opacity-20" style={{ color: c }} />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 max-w-6xl mx-auto px-4 md:px-8 -mt-10 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: GraduationCap, label: 'Program Studi', value: stats.totalProdi },
              { icon: Users, label: 'Tenaga Pendidik', value: stats.totalDosen },
              { icon: UserCheck, label: 'Mahasiswa Aktif', value: stats.totalMahasiswa + '+' },
              { icon: Award, label: 'Pendaftar PPDB', value: stats.totalPendaftar },
            ].map((s, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-[#d9e3f6] text-center hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${c}12` }}>
                  <s.icon size={18} style={{ color: c }} />
                </div>
                <p className="text-2xl font-bold tracking-tight" style={{ color: c }}>{s.value}</p>
                <p className="text-xs text-[#6e7a6e] font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {(sambutan.active || landingPage.showPrestasi) && (
          <section className="py-16 md:py-24 bg-white overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: '#121c2a' }}>Tentang {tenant.singkatan || tenant.nama_pt}</h2>
                <p className="text-[#6e7a6e] mt-2 max-w-md mx-auto">Komitmen kami terhadap pendidikan berkualitas</p>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                {sambutan.active && (
                  <div className="min-w-[340px] md:min-w-[400px] bg-[#f8f9ff] p-8 rounded-xl shadow-sm border border-[#d9e3f6] flex flex-col gap-6 hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${c}15` }}>
                      <Quote size={22} style={{ color: c }} />
                    </div>
                    <p className="text-base leading-relaxed text-[#6e7a6e] italic">{sambutan.content || `${landingPage.heroTitle}`}</p>
                    <div className="mt-auto pt-6 border-t border-[#d9e3f6] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-200">
                        {(sambutan.image || tenant.logo_url) && <img src={sambutan.image || tenant.logo_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#121c2a' }}>{sambutan.nama || tenant.nama_pt}</p>
                        <p className="text-xs text-[#6e7a6e]">{sambutan.jabatan || 'Pimpinan'}</p>
                      </div>
                    </div>
                  </div>
                )}
                {prestasi.map((p, i) => {
                  const Icon = iconMap[p.icon] || Award;
                  return (
                    <div key={i} className="min-w-[280px] bg-[#f8f9ff] p-8 rounded-xl shadow-sm border border-[#d9e3f6] flex flex-col gap-4 hover:-translate-y-2 transition-transform duration-300">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${c}12` }}>
                        <Icon size={22} style={{ color: c }} />
                      </div>
                      <p className="text-base font-bold">{p.title}</p>
                      <p className="text-sm text-[#6e7a6e] leading-relaxed">{p.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {landingPage.showProdi && programStudi.length > 0 && (
          <section id="programs" className="py-16 md:py-24 bg-[#f8f9ff]">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Program Studi</h2>
                <p className="text-[#6e7a6e] mt-2">Pilihan program studi berkualitas untuk masa depanmu</p>
              </div>
              <div className="grid md:grid-cols-12 gap-4 md:gap-6">
                {programStudi.slice(0, 1).map(p => (
                  <div key={p.id} className="md:col-span-7 h-72 md:h-96 relative rounded-xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121c2a]/90 via-[#121c2a]/40 to-transparent p-6 md:p-10 flex flex-col justify-end">
                      <span className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${c}` }}>{p.jenjang}</span>
                      <h3 className="text-white text-xl md:text-2xl font-bold mb-3">{p.nama}</h3>
                      <div className="flex items-center gap-3">
                        {p.akreditasi && <span className="flex items-center gap-1 text-xs text-white/80"><CheckCircle size={12} /> {p.akreditasi}</span>}
                        {p.fakultas && <span className="text-xs text-white/60">{p.fakultas}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="md:col-span-5 grid grid-cols-1 gap-4 md:gap-6">
                  {programStudi.slice(1, 3).map(p => (
                    <div key={p.id} className="h-36 md:h-44 relative rounded-xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-50" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121c2a]/90 via-[#121c2a]/30 to-transparent p-5 flex flex-col justify-end">
                        <span className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: `${c}` }}>{p.jenjang}</span>
                        <h3 className="text-white text-sm md:text-base font-bold">{p.nama}</h3>
                        {p.akreditasi && <span className="flex items-center gap-1 text-[11px] text-white/70 mt-1"><CheckCircle size={10} /> {p.akreditasi}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {programStudi.slice(3).map(p => (
                  <div key={p.id} className="md:col-span-3 bg-white p-5 rounded-xl shadow-sm border border-[#d9e3f6] hover:-translate-y-1 transition-all">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded inline-block mb-2" style={{ backgroundColor: `${c}12`, color: c }}>{p.jenjang}</span>
                    <p className="text-sm font-bold mb-1">{p.nama}</p>
                    {p.fakultas && <p className="text-xs text-[#6e7a6e]">{p.fakultas}</p>}
                    {p.akreditasi && <span className="text-[10px] flex items-center gap-1 mt-2" style={{ color: c }}><CheckCircle size={10} /> {p.akreditasi}</span>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {landingPage.showPromosi && promosi.length > 0 && (
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Informasi & Promosi</h2>
                <p className="text-[#6e7a6e] mt-2">Kegiatan dan program terbaru</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                {promosi.map((p, i) => (
                  <div key={i} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-[#d9e3f6] hover:-translate-y-1 transition-all">
                    {p.image && (
                      <div className="relative h-44 overflow-hidden">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-sm font-bold">{p.title}</p>
                      {p.description && <p className="text-xs text-[#6e7a6e] mt-1.5 leading-relaxed line-clamp-2">{p.description}</p>}
                      {p.link && (
                        <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold mt-3 hover:underline" style={{ color: c }}>
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
          <section className="py-16 md:py-24 bg-[#f8f9ff]">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Struktur Organisasi</h2>
                <p className="text-[#6e7a6e] mt-2">Tim kepemimpinan kami</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {strukturOrganisasi.map((s) => (
                  <div key={s.id} className="bg-white rounded-xl p-5 text-center shadow-sm border border-[#d9e3f6] hover:-translate-y-1 transition-all">
                    <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden ring-2 ring-[#d9e3f6] bg-zinc-100 flex items-center justify-center">
                      {s.image ? <img src={s.image} alt={s.nama} className="w-full h-full object-cover" /> : <Users size={20} className="text-zinc-300" />}
                    </div>
                    <p className="text-xs font-bold">{s.nama}</p>
                    <p className="text-[10px] text-[#6e7a6e] mt-1">{s.jabatan}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {landingPage.showBerita && berita.length > 0 && (
          <section id="news" className="py-16 md:py-24 bg-white">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Berita Terkini</h2>
                <p className="text-[#6e7a6e] mt-2">Informasi dan kegiatan terbaru</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {berita.map(b => (
                  <div key={b.id} className="bg-[#f8f9ff] rounded-xl overflow-hidden shadow-sm border border-[#d9e3f6] hover:-translate-y-1 transition-all">
                    {b.gambar && (
                      <div className="relative h-44 overflow-hidden">
                        <img src={b.gambar} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-5">
                      <p className="font-bold text-sm line-clamp-2">{b.judul}</p>
                      {b.ringkasan && <p className="text-xs text-[#6e7a6e] mt-1.5 line-clamp-2 leading-relaxed">{b.ringkasan}</p>}
                      {b.published_at && (
                        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-[#6e7a6e]">
                          <Calendar size={10} />
                          {new Date(b.published_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {landingPage.showPPDB && (
          <section id="ppdb" className="py-16 md:py-24 relative overflow-hidden" style={{ backgroundColor: '#121c2a' }}>
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M30 0v60M0 30h60' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")` }} />
            <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Your Journey Starts Today.</h2>
              <p className="text-[#bdcabc] text-base md:text-lg max-w-xl mx-auto mb-10">Daftar sekarang dan mulai perjalanan akademikmu bersama {tenant.nama_pt}.</p>
              <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                <Link to={`/kampus/${slug}/ppdb`} className="px-10 py-4 rounded-lg text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg" style={{ backgroundColor: c }}>
                  Daftar PPDB {landingPage.tahunAkademik}
                </Link>
                <a href={`/login?tenant=${slug}`} className="px-10 py-4 border-2 border-white/30 text-white rounded-lg text-sm font-bold hover:bg-white hover:transition-all">
                  Portal Akademik
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-white border-t border-[#d9e3f6]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-2.5">
                {tenant.logo_url && <img src={tenant.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                <span className="font-bold text-base" style={{ color: c }}>{tenant.singkatan || tenant.nama_pt}</span>
              </div>
              <p className="text-sm text-[#6e7a6e] max-w-xs">{tenant.nama_pt} — Empowering Future Leaders.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6e7a6e] mb-3">Kontak</p>
                <div className="space-y-2">
                  {tenant.telepon && <p className="text-sm text-[#6e7a6e] flex items-center gap-2"><Phone size={12} /> {tenant.telepon}</p>}
                  {tenant.email && <p className="text-sm text-[#6e7a6e] flex items-center gap-2"><Mail size={12} /> {tenant.email}</p>}
                  {tenant.alamat && <p className="text-sm text-[#6e7a6e] flex items-start gap-2"><MapPin size={12} className="mt-1 shrink-0" /> {tenant.alamat}</p>}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6e7a6e] mb-3">Akses</p>
                <div className="space-y-2">
                  <a href={`/login?tenant=${slug}`} className="block text-sm text-[#6e7a6e] hover:underline transition-all" style={{ '--hover-color': c } as React.CSSProperties} onMouseOver={e => (e.target as HTMLElement).style.color = c} onMouseOut={e => (e.target as HTMLElement).style.color = '#6e7a6e'}>Portal Akademik</a>
                  <Link to={`/kampus/${slug}/ppdb`} className="block text-sm text-[#6e7a6e] hover:underline transition-all" style={{ '--hover-color': c } as React.CSSProperties} onMouseOver={e => (e.target as HTMLElement).style.color = c} onMouseOut={e => (e.target as HTMLElement).style.color = '#6e7a6e'}>PPDB Online</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#d9e3f6] mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#6e7a6e]">© {new Date().getFullYear()} {tenant.nama_pt}. All rights reserved.</p>
            <p className="text-xs text-[#6e7a6e]">Powered by <span className="font-medium" style={{ color: c }}>AONE SIAKAD</span></p>
          </div>
        </div>
      </footer>

      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => { setShowPopup(false); localStorage.setItem(`popup_${slug}_seen`, 'true'); }}>
          <div className="max-w-md w-full rounded-2xl bg-white border border-[#d9e3f6] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowPopup(false); localStorage.setItem(`popup_${slug}_seen`, 'true'); }} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/10 hover:bg-black/20 transition-colors z-10">
              <X size={14} />
            </button>
            {popUp.image && <img src={popUp.image} alt="" className="w-full h-44 object-cover" />}
            <div className="p-5">
              {popUp.title && <h3 className="text-base font-bold mb-2">{popUp.title}</h3>}
              {popUp.content && <p className="text-sm text-[#6e7a6e] leading-relaxed">{popUp.content}</p>}
              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => { setShowPopup(false); localStorage.setItem(`popup_${slug}_seen`, 'true'); }} className="px-3 py-1.5 text-xs text-[#6e7a6e] hover:transition-colors">
                  {popUp.buttonText || 'Tutup'}
                </button>
                {popUp.buttonLink && (
                  <a href={popUp.buttonLink} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all" style={{ backgroundColor: c }}>
                    Detail
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
        @keyframes fade-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
