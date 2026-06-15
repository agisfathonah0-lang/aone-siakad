import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, BookOpen, ArrowRight, Sparkles, CheckCircle, Award, Users, MapPin, Phone, Mail, Globe, ChevronRight, Star, Clock, Wifi, Target, Eye, Heart, Image, Layers, Quote, Calendar, Trophy, Building2, ScrollText, Microscope, Lightbulb, Play } from 'lucide-react';
import { api } from '../api';

interface CampusLandingPageProps {
  campusId: string;
  isDark: boolean;
  onLoginClick: () => void;
  onRegisterPmb: (campusId: string) => void;
  onBackToAone: () => void;
}

export default function CampusLandingPage({ campusId, isDark, onLoginClick, onRegisterPmb, onBackToAone }: CampusLandingPageProps) {
  const [s, setS] = useState<Record<string, string>>({});
  const [campus, setCampus] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    api.getCampus(campusId).then(data => {
      setCampus(data);
      if (data?.webSettings) setS(data.webSettings);
    }).catch(() => {});
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [campusId]);

  const pc = s.primary_color || '#059669';
  const navSections = ['Beranda', 'Profil', 'Program Studi', 'PPDB', 'Galeri', 'Kontak'];

  if (!campus) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-white/50">Memuat portal kampus...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-black text-white overflow-x-hidden">
      {/* TOP BAR */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {campus.logo ? (
              <img src={campus.logo} alt="" className="w-8 h-8 object-contain rounded-lg" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: pc }}>
                {campus.name?.charAt(0) || '?'}
              </div>
            )}
            <span className="font-display font-bold tracking-tight text-sm">{s.institution_name || campus.name}</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navSections.map(item => (
              <a key={item} href={`#section-${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 text-xs text-white/70 hover:text-white transition font-medium">{item}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={onLoginClick}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition">Login Kampus</button>
            <button onClick={() => onRegisterPmb(campusId)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg hover:scale-105 transition-all flex items-center gap-1.5"
              style={{ backgroundColor: pc }}>
              Daftar PMB <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section id="section-beranda" className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #000 0%, ${pc}22 50%, #000 100%)` }} />
        <div className="absolute top-20 right-20 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ backgroundColor: `${pc}15` }} />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                {campus.logo ? (
                  <img src={campus.logo} alt="" className="w-16 h-16 object-contain rounded-2xl shadow-2xl" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl" style={{ backgroundColor: pc }}>
                    {campus.name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${pc}20`, color: pc, border: `1px solid ${pc}30` }}>
                    <Sparkles className="w-3.5 h-3.5" /> {s.accreditation || 'Terakreditasi BAN-PT'}
                  </div>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight leading-tight">
                {s.hero_title || `Selamat Datang di ${campus.name}`}
              </h1>
              <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-xl">
                {s.hero_subtitle || 'Kampus digital modern dengan kurikulum berbasis industri 4.0 dan akreditasi unggul.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => onRegisterPmb(campusId)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:scale-105 transition-all flex items-center gap-2" style={{ backgroundColor: pc }}>
                  Daftar PMB Online <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#section-profil" className="px-6 py-3 rounded-xl text-sm font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center gap-2">
                  Tentang Kami <ChevronRight className="w-4 h-4" />
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-4">
                {[
                  { icon: Users, value: `${(campus.students || 0).toLocaleString()}`, label: 'Mahasiswa' },
                  { icon: BookOpen, value: `${campus.programs || 0}`, label: 'Program Studi' },
                  { icon: Award, value: s.accreditation || 'Unggul', label: 'Akreditasi' },
                  { icon: MapPin, value: campus.location || '', label: 'Lokasi' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/50">
                    <stat.icon className="w-4 h-4" style={{ color: pc }} />
                    <span>{stat.value} <span className="text-white/30">{stat.label}</span></span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl blur-3xl" style={{ backgroundColor: `${pc}15` }} />
                <div className="relative bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-3xl border border-white/5 p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white/60">Informasi Akademik</span>
                    <div className="flex items-center gap-1 text-xs" style={{ color: pc }}><Wifi className="w-3 h-3" /> Online</div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Akreditasi', value: s.accreditation || 'UNGGUL', color: pc },
                      { label: 'Program Studi', value: `${campus.programs || 0}`, color: pc },
                      { label: 'Dosen Tetap', value: `${(campus.lecturers || 0).toLocaleString()}`, color: pc },
                      { label: 'Rasio Dosen:Mhs', value: '1:28', color: pc },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-white/50">{item.label}</span>
                        <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-black text-emerald-400">{(campus.students || 0).toLocaleString()}</div>
                        <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Mahasiswa Aktif</div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-xs text-white/40"><Clock className="w-3 h-3" /> Tahun Akademik 2026/2027 — Semester Ganjil</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEJARAH, VISI, MISI */}
      <section id="section-profil" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-sm font-bold font-mono tracking-widest uppercase" style={{ color: pc }}>PROFIL KAMPUS</span>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">Tentang {s.institution_name || campus.name}</h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <ScrollText className="w-6 h-6" style={{ color: pc }} />
                <h3 className="text-xl font-bold font-display">Sejarah Singkat</h3>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                {s.sejarah || `${s.institution_name || campus.name} didirikan pada tahun 2008 sebagai bagian dari pengembangan pendidikan tinggi di Indonesia. Berawal dari sebuah akademi kecil, kini telah berkembang menjadi universitas terkemuka dengan ${campus.programs || 5} program studi dan lebih dari ${(campus.students || 0).toLocaleString()} mahasiswa aktif.`}
              </p>
              <p className="text-sm text-white/40 leading-relaxed">
                {s.sejarah_2 || 'Dengan komitmen pada kualitas pendidikan dan pengembangan sumber daya manusia, kampus ini terus berinovasi dalam metode pembelajaran, penelitian, dan pengabdian kepada masyarakat.'}
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6" style={{ color: pc }} />
                  <h3 className="text-xl font-bold font-display">Visi</h3>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-sm text-white/70 leading-relaxed italic">
                    "{s.visi || `Menjadi perguruan tinggi unggulan di tingkat nasional pada tahun 2030 yang menghasilkan lulusan berdaya saing global, berkarakter, dan berwawasan teknologi.`}"
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-6 h-6" style={{ color: pc }} />
                  <h3 className="text-xl font-bold font-display">Misi</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    s.misi_1 || 'Menyelenggarakan pendidikan tinggi berkualitas yang relevan dengan kebutuhan industri dan masyarakat.',
                    s.misi_2 || 'Melaksanakan penelitian inovatif yang berkontribusi pada pengembangan ilmu pengetahuan dan teknologi.',
                    s.misi_3 || 'Menyelenggarakan pengabdian kepada masyarakat berbasis pemberdayaan dan kemitraan.',
                    s.misi_4 || 'Mengembangkan tata kelola institusi yang transparan, akuntabel, dan berbasis teknologi digital.',
                  ].map((m, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: pc }} />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PROGRAM STUDI */}
      <section id="section-program-studi" className="py-24 relative">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #000 0%, ${pc}08 50%, #000 100%)` }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-sm font-bold font-mono tracking-widest uppercase" style={{ color: pc }}>PROGRAM STUDI</span>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">Pilih Program Studi Impian Anda</h2>
            <p className="text-base text-white/50">Program studi unggulan dengan kurikulum berbasis Kerangka Kualifikasi Nasional Indonesia (KKNI) dan akreditasi BAN-PT.</p>
          </motion.div>
          <CampusPrograms campus={campus} pc={pc} />
        </div>
      </section>

      {/* PPDB BANNER */}
      <section id="section-ppdb" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${pc} 0%, #000 80%)` }} />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                <GraduationCap className="w-4 h-4" /> PPDB 2026/2027
              </div>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight">{s.ppdb_banner_title || 'Penerimaan Mahasiswa Baru'}</h2>
              <p className="text-lg text-white/70 leading-relaxed">{s.ppdb_banner_subtitle || 'Daftar sekarang dan dapatkan berbagai kemudahan biaya pendidikan.'}</p>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {[
                  { icon: Clock, label: 'Pendaftaran', value: '1 Juni - 31 Agustus 2026' },
                  { icon: Award, label: 'Beasiswa', value: '50% - 100%' },
                  { icon: Users, label: 'Kuota', value: `${Math.floor((campus.students || 1000) * 0.15).toLocaleString()} Mahasiswa Baru` },
                  { icon: Star, label: 'Akreditasi', value: s.accreditation || 'Unggul' },
                ].map((info, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <info.icon className="w-4 h-4 text-white mb-1" />
                    <p className="text-[10px] text-white/50 font-medium">{info.label}</p>
                    <p className="text-xs font-bold text-white mt-0.5">{info.value}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => onRegisterPmb(campusId)}
                className="px-8 py-4 bg-white rounded-xl text-base font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                style={{ color: pc }}>
                Daftar Sekarang <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="hidden lg:block space-y-6">
              <div className="relative rounded-3xl overflow-hidden border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=600&q=80"
                  alt="Kampus"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="font-bold text-lg text-white">{s.institution_name || campus.name}</h4>
                  <p className="text-xs text-white/60">{campus.location || ''}</p>
                </div>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
                <h3 className="text-xl font-bold font-display mb-6 text-center">BROSUR PPDB {new Date().getFullYear()}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-center">
                      <div className="text-lg font-black text-emerald-400">{(campus.students || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-white/40">Mahasiswa Aktif</div>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-center">
                      <div className="text-lg font-black text-indigo-400">{campus.programs || 0}</div>
                      <div className="text-[10px] text-white/40">Program Studi</div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {[
                      'Biaya UKT Terjangkau',
                      'Fasilitas Laboratorium Digital',
                      'Beasiswa Prestasi 50%-100%',
                      'Kampus Terintegrasi AONE SIAKAD',
                      'Dosen Berkualitas & Berpengalaman',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-white/60"><CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: pc }} />{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-center">
                  <button onClick={() => onRegisterPmb(campusId)} className="text-sm font-bold" style={{ color: pc }}>Download Brosur Lengkap →</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BROSUR DIGITAL */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-sm font-bold font-mono tracking-widest uppercase" style={{ color: pc }}>INFORMASI LENGKAP</span>
              <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">{s.brochure_title || `Info ${s.institution_name || campus.name}`}</h2>
              <p className="text-base text-white/50 leading-relaxed">{s.brochure_desc || 'Informasi lengkap tentang program studi, biaya, fasilitas, dan jalur pendaftaran.'}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Building2, label: 'Fasilitas Kampus', value: 'Lab Komputer, Perpustakaan Digital, Masjid, Auditorium' },
                  { icon: Users, label: 'Tenaga Pengajar', value: `${campus.lecturers || 0} Dosen Tetap, ${Math.floor((campus.lecturers || 0) * 0.6)} Sertifikasi` },
                  { icon: Layers, label: 'Jenjang Pendidikan', value: 'S1, D3, dan Program Profesi' },
                  { icon: Globe, label: 'Kerjasama', value: 'Industri, Pemerintah, LN' },
                ].map((info, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <info.icon className="w-5 h-5" style={{ color: pc }} />
                    <p className="text-xs font-bold mt-1">{info.label}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{info.value}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => onRegisterPmb(campusId)}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:scale-105 transition-all" style={{ backgroundColor: pc }}>
                Daftar Sekarang
              </button>
            </div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Star, title: s.accreditation || 'Akreditasi UNGGUL', desc: 'Penilaian BAN-PT dengan nilai tertinggi.' },
                  { icon: Users, title: `${(campus.students || 0).toLocaleString()} Mahasiswa Aktif`, desc: 'Komunitas akademik yang dinamis dan inovatif.' },
                  { icon: Award, title: `${campus.programs || 0} Program Studi`, desc: 'Program S1 dan D3 dengan kurikulum industri.' },
                  { icon: MapPin, title: campus.location || 'Lokasi Strategis', desc: 'Akses mudah dari pusat kota dan transportasi umum.' },
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${pc}20` }}>
                      <item.icon className="w-5 h-5" style={{ color: pc }} />
                    </div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-white/40 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* GALERI KEGIATAN */}
      <section id="section-galeri" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #000 0%, ${pc}08 50%, #000 100%)` }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-sm font-bold font-mono tracking-widest uppercase" style={{ color: pc }}>GALERI KEGIATAN</span>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">Momen & Aktivitas Kampus</h2>
            <p className="text-base text-white/50">Berbagai kegiatan akademik, penelitian, dan pengabdian masyarakat.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: GraduationCap, title: 'Wisuda Sarjana 2026', desc: 'acara wisuda ke-18 bagi 1.200 lulusan', color: 'from-emerald-500/20 to-emerald-600/10' },
              { icon: Microscope, title: 'Penelitian Dosen', desc: 'Hak cipta 15 penelitian terapan nasional', color: 'from-indigo-500/20 to-indigo-600/10' },
              { icon: Heart, title: 'Bakti Sosial', desc: 'Pengabdian masyarakat di 5 desa binaan', color: 'from-rose-500/20 to-rose-600/10' },
              { icon: Trophy, title: 'Prestasi Mahasiswa', desc: 'Juara umum lomba karya tulis ilmiah nasional', color: 'from-amber-500/20 to-amber-600/10' },
              { icon: Lightbulb, title: 'Seminar & Workshop', desc: 'Pelatihan technopreneurship untuk mahasiswa', color: 'from-cyan-500/20 to-cyan-600/10' },
              { icon: Globe, title: 'Kerjasama Internasional', desc: 'MoU dengan 5 universitas luar negeri', color: 'from-violet-500/20 to-violet-600/10' },
              { icon: Building2, title: 'Gedung Baru', desc: 'Pembukaan kampus 2 seluas 5 hektar', color: 'from-orange-500/20 to-orange-600/10' },
              { icon: Users, title: 'Orientasi Mahasiswa Baru', desc: 'PKKMB 2026 dengan 2.500 peserta', color: 'from-emerald-500/20 to-emerald-600/10' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group relative p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all overflow-hidden">
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${item.color}`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-3">
                    <item.icon className="w-6 h-6" style={{ color: pc }} />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* KONTAK */}
      <section id="section-kontak" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <span className="text-sm font-bold font-mono tracking-widest uppercase" style={{ color: pc }}>KONTAK</span>
              <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">Hubungi Kami</h2>
              <p className="text-base text-white/50">Silakan hubungi kami untuk informasi lebih lanjut tentang pendaftaran, akademik, atau kerjasama.</p>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: 'Alamat', value: `${campus.location || '-'}, Indonesia` },
                  { icon: Phone, label: 'Telepon', value: s.phone || '+62 21 1234 5678' },
                  { icon: Mail, label: 'Email', value: s.email || `info@${campus.subdomain || campus.code}.aone-project.id` },
                  { icon: Globe, label: 'Web', value: `${campus.subdomain || ''}.aone-project.id` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${pc}20` }}>
                      <item.icon className="w-5 h-5" style={{ color: pc }} />
                    </div>
                    <div>
                      <p className="text-xs text-white/30">{item.label}</p>
                      <p className="text-sm font-bold">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="p-8 rounded-3xl bg-gradient-to-br from-zinc-800/30 to-zinc-900/30 border border-white/5">
              <h3 className="text-xl font-bold font-display mb-6">Formulir Pertanyaan</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div><input type="text" placeholder="Nama Lengkap" className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-emerald-500/50" /></div>
                  <div><input type="email" placeholder="Email" className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-emerald-500/50" /></div>
                </div>
                <div><input type="text" placeholder="Subjek" className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-emerald-500/50" /></div>
                <div><textarea rows={4} placeholder="Pesan" className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-emerald-500/50" /></div>
                <button type="submit" className="px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:scale-105 transition-all" style={{ backgroundColor: pc }}>
                  Kirim Pesan
                </button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              {campus.logo ? (
                <img src={campus.logo} alt="" className="w-8 h-8 object-contain rounded-lg" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: pc }}>
                  {campus.name?.charAt(0) || '?'}
                </div>
              )}
              <span className="font-bold">{s.institution_name || campus.name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/40">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {campus.location || '-'}</span>
              <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {campus.subdomain || ''}.aone-project.id</span>
            </div>
          </div>
          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
            <span>{s.footer_text || `© ${s.institution_name || campus.name}. All rights reserved.`}</span>
            <div className="flex items-center gap-4">
              <button onClick={onBackToAone} className="hover:text-emerald-400 transition text-xs">AONE SIAKAD Platform</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CampusPrograms({ campus, pc }: { campus: any; pc: string }) {
  const prodis = [
    { name: 'Teknik Informatika', accreditation: 'UNGGUL', duration: '4 Tahun', fee: 7500000 },
    { name: 'Sistem Informasi', accreditation: 'UNGGUL', duration: '4 Tahun', fee: 7500000 },
    { name: 'Ekonomi Syariah', accreditation: 'A', duration: '4 Tahun', fee: 5500000 },
    { name: 'Hukum Keluarga Islam', accreditation: 'B', duration: '4 Tahun', fee: 5000000 },
    { name: 'Pendidikan Guru MI', accreditation: 'A', duration: '4 Tahun', fee: 5000000 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {prodis.slice(0, campus.programs || prodis.length).map((p, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition group">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-base">{p.name}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${pc}20`, color: pc }}>{p.accreditation}</span>
          </div>
          <p className="text-xs text-white/40 mb-4">{p.duration} • Rp {p.fee.toLocaleString('id-ID')}/Smt</p>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <GraduationCap className="w-3 h-3" /> Prodi Unggulan
          </div>
        </motion.div>
      ))}
    </div>
  );
}
