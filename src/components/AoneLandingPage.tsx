import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Building2, GraduationCap, Users, Award, Shield, CheckCircle, Sparkles, ArrowRight, Server, Database, CreditCard, BookOpen, BarChart3, Globe, Phone, Mail, MapPin, Star, ChevronRight, Play, Menu, X, Wifi, Lock, Cpu, Heart, Gift, Rocket, Clock, Quote, Headphones, Layers, Target, Eye, Smartphone, Cloud, Zap, Sliders, Trello, PieChart, HelpCircle, ChevronDown } from 'lucide-react';
import { api } from '../api';

interface AoneLandingPageProps {
  isDark: boolean;
  onLoginClick: () => void;
  onExploreCampus: (campusId?: string) => void;
}

export default function AoneLandingPage({ isDark, onLoginClick, onExploreCampus }: AoneLandingPageProps) {
  const [s, setS] = useState<Record<string, string>>({});
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    api.getWebSettings().then(setS).catch(() => {});
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pc = s.primary_color || '#059669';

  const testimonials = [
    { name: 'Dr. Ahmad Syukri, M.Ag.', role: 'Rektor UND Jakarta', quote: 'AONE SIAKAD meningkatkan skor akreditasi institusi kami menjadi UNGGUL dan mempercepat pelaporan PDDIKTI dari mingguan menjadi real-time.', avatar: 'AS', rating: 5 },
    { name: 'Dr. Nurhayati, M.Pd.', role: 'Wakil Rektor I UND Yogyakarta', quote: 'Sebelum menggunakan AONE SIAKAD, penginputan nilai dan absensi sarat kekacauan koordinasi. Sekarang semua portal terintegrasi rapi.', avatar: 'NH', rating: 5 },
    { name: 'Dr. Muhammad Fadli, M.E.I.', role: 'Dekan FEBI UND Surabaya', quote: 'Modul Akreditasi 9 Standar sangat mutakhir. Borang evaluasi diri terotomatisasi dari operasional keseharian. Membawa prodi kami ke Akreditasi Unggul.', avatar: 'MF', rating: 5 },
    { name: 'Dr. Rina Kartika, M.T.', role: 'Ketua Prodi TI UND Medan', quote: 'Integrasi Moodle LMS dengan SIAKAD memudahkan dosen dan mahasiswa. Nilai otomatis masuk ke KHS tanpa input ulang.', avatar: 'RK', rating: 4 },
  ];

  const faqs = [
    { q: 'Apa itu AONE SIAKAD?', a: 'AONE SIAKAD adalah platform ERP pendidikan tinggi all-in-one yang mencakup SIAKAD, PMB, keuangan, PDDIKTI, akreditasi 9 standar, LMS, OJS, dan alumni tracer study dalam satu sistem terintegrasi.' },
    { q: 'Apakah perlu server sendiri?', a: 'Tidak. AONE SIAKAD merupakan platform SaaS (Software-as-a-Service). Kami menangani hosting, skalabilitas, domain SSL, backup harian, dan pembaruan fitur otomatis tanpa biaya tambahan.' },
    { q: 'Berapa lama implementasinya?', a: 'Implementasi rata-rata 2-4 minggu tergantung kompleksitas data kampus. Tim migrasi kami akan membantu ekstraksi dan transformasi data dari sistem lama Anda.' },
    { q: 'Apakah data aman?', a: 'Ya. Setiap kampus mendapat database terisolasi sendiri. Kami menggunakan enkripsi AES-256, backup harian otomatis, dan sertifikat SSL. Infrastruktur kami telah tersertifikasi ISO 27001.' },
    { q: 'Apakah bisa integrasi dengan sistem lama?', a: 'Bisa. Kami menyediakan REST API dan tim migrasi khusus untuk menangani integrasi dengan SIAKAD lama, sistem keuangan, atau LMS yang sudah ada.' },
  ];

  const pricingPlans = [
    { name: 'SaaS Standard', price: 'Rp 2,5jt', period: '/bulan', students: '3.000', storage: '50 GB', support: 'Email & WA', highlighted: false, features: ['SIAKAD Modul Dasar', 'PMB Online', 'Keuangan Dasar', 'PDDIKTI Sync', '1 Database Instance'] },
    { name: 'SaaS Pro', price: 'Rp 5jt', period: '/bulan', students: '10.000', storage: '100 GB', support: 'Prioritas 24/7', highlighted: true, features: ['Semua Standard +', 'Akreditasi 9 Standar', 'LMS Terintegrasi', 'Multi Payment Gateway', '3 Database Instance', 'Account Manager'] },
    { name: 'Enterprise', price: 'Custom', period: '', students: 'Unlimited', storage: 'Unlimited', support: 'Dedicated Team', highlighted: false, features: ['Semua Pro +', 'Dedicated Server', 'Full SSO & LDAP', 'On-Premise Opsional', 'SLA 99.99%', 'Prioritas Pengembangan Fitur'] },
  ];

  const compareRows = [
    { label: 'Integrasi PDDIKTI', others: 'Manual / Export-Import', sevima: 'Batch Parsial', aone: 'Real-time Otomatis' },
    { label: 'Akreditasi 9 Standar', others: 'Spreadsheet Manual', sevima: 'Modul Tambahan Rp 20jt/th', aone: 'Dashboard Otomatis' },
    { label: 'Portal Mahasiswa', others: 'Terpisah-pisah', sevima: 'Terpisah per Modul', aone: 'Satu Pintu SSO' },
    { label: 'Manajemen Keuangan', others: 'Belum Terintegrasi', sevima: 'Modul Terpisah', aone: 'Multi VA & Cicilan' },
    { label: 'LMS Integration', others: 'Standalone', sevima: 'Rp 30jt/th Tambahan', aone: 'Nilai Otomatis' },
    { label: 'OJS Journal', others: 'Instal Manual', sevima: 'Tidak Ada', aone: 'Terintegrasi + Proxy' },
    { label: 'Alumni Tracer Study', others: 'Google Form', sevima: 'Belum Tersedia', aone: 'Survey Built-in' },
    { label: 'Multi Kampus Manajemen', others: 'Tidak Ada', sevima: 'Single Tenant per Kampus', aone: 'Multi Tenant Terpadu' },
    { label: 'Branding & Web Kustom', others: 'Developer Mahal', sevima: 'Template Terbatas', aone: 'Per Campus Dashboard' },
    { label: 'Hosting & Maintenance', others: 'Ditangani Sendiri', sevima: 'Termasuk Biaya SaaS', aone: 'Fully-Managed SaaS' },
    { label: 'Lisensi Pengguna', others: 'Per User Rp 50-100rb', sevima: 'Per Mahasiswa Rp 25rb/th', aone: 'GRATIS Unlimited' },
    { label: 'Biaya Implementasi', others: 'Rp 50-200jt', sevima: 'Rp 75-150jt', aone: 'GRATIS' },
  ];

  const featureScores = [
    { name: 'PDDIKTI Otomatis', aone: 98, sevima: 55, others: 30 },
    { name: 'Akreditasi', aone: 95, sevima: 40, others: 25 },
    { name: 'Harga Terjangkau', aone: 100, sevima: 45, others: 60 },
    { name: 'Multi Tenant', aone: 95, sevima: 30, others: 10 },
    { name: 'Fitur Lengkap', aone: 90, sevima: 65, others: 40 },
    { name: 'Integrasi LMS', aone: 92, sevima: 50, others: 35 },
  ];

  return (
    <div className="min-h-screen font-sans bg-black text-white overflow-x-hidden">
      {/* NAVBAR */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-emerald-500/25">A</div>
            <div>
              <span className="font-display font-extrabold tracking-tight text-lg text-white">AONE<span className="text-emerald-400">Project</span></span>
              <p className="text-[9px] text-emerald-400/80 font-mono tracking-widest leading-none mt-0.5">AONE SIAKAD PLATFORM</p>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            {['Fitur', 'Harga', 'Testimoni', 'FAQ', 'Kampus'].map(item => (
              <a key={item} href={`#section-${item.toLowerCase()}`} className="px-4 py-2 text-sm text-white/70 hover:text-emerald-400 transition-colors font-medium">{item}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={onLoginClick} className="hidden sm:inline-flex px-5 py-2.5 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 text-white rounded-xl text-sm font-semibold transition items-center gap-2">Login Admin</button>
            <a href="#section-harga" className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-105 flex items-center gap-2">
              Mulai Sekarang <ArrowRight className="w-4 h-4" />
            </a>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 text-white">
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="lg:hidden bg-zinc-900/95 backdrop-blur-xl border-t border-white/5">
            <div className="px-4 py-4 space-y-2">
              {['Fitur', 'Harga', 'Testimoni', 'FAQ', 'Kampus'].map(item => (
                <a key={item} href={`#section-${item.toLowerCase()}`} onClick={() => setMobileMenu(false)} className="block px-4 py-3 text-white/70 hover:text-emerald-400 rounded-xl hover:bg-white/5 text-sm font-medium">{item}</a>
              ))}
              <button onClick={onLoginClick} className="w-full px-4 py-3 bg-white/10 text-white rounded-xl text-sm font-semibold mt-2">Login Admin</button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-emerald-950" />
        <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50 animate-ping" />
        <div className="absolute top-1/4 right-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-lg shadow-indigo-400/50 animate-ping" style={{ animationDelay: '1s' }} />
        {[...Array(20)].map((_, i) => (
          <motion.div key={i} animate={{ y: [0, -30, 0], opacity: [0, 0.5, 0] }} transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
            className="absolute w-1 h-1 bg-white/20 rounded-full" style={{ left: `${10 + i * 4}%`, top: `${20 + (i % 5) * 15}%` }} />
        ))}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                <Sparkles className="w-4 h-4" /> {s.hero_badge || 'SaaS Terdaftar di PDDIKTI & Kemenristek RI'}
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight leading-none">
                {s.hero_title || 'Transformasi Digital Kampus Anda'}
              </h1>
              <p className="text-lg text-white/60 leading-relaxed max-w-xl">
                {s.hero_subtitle || 'Satu platform SIAKAD all-in-one untuk seluruh kebutuhan akademik, keuangan, akreditasi, dan pelaporan kampus Anda.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#section-harga" className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl text-base font-bold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all flex items-center justify-center gap-2">
                  Lihat Paket Harga <Rocket className="w-5 h-5" />
                </a>
                <a href="#section-fitur" className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-base font-semibold hover:bg-white/10 transition flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" /> Lihat Demo
                </a>
              </div>
              <div className="flex items-center gap-6 pt-8 border-t border-white/5 max-w-lg">
                {[
                  { v: s.stats_campus || '50+', l: 'Kampus Mitra' },
                  { v: s.stats_students || '250rb+', l: 'Mahasiswa Terkelola' },
                  { v: s.stats_uptime || '99.99%', l: 'Uptime SLA' },
                  { v: s.stats_years || '10+', l: 'Tahun Pengalaman' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                    <div className="text-2xl font-extrabold text-emerald-400">{stat.v}</div>
                    <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-1">{stat.l}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl border border-white/5 p-8 space-y-6 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-zinc-900 flex items-center justify-center text-xs font-bold">{(i + 1) * 2}</div>
                      ))}
                    </div>
                    <div className="text-sm text-white/60">+50 Kampus Aktif</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'PDDIKTI Sync', value: '100%', color: 'emerald' },
                      { label: 'Akreditasi', value: 'UNGGUL', color: 'indigo' },
                      { label: 'UKT Online', value: '24/7', color: 'emerald' },
                      { label: 'SLA Server', value: '99.99%', color: 'amber' },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="text-2xl font-black text-emerald-400">{item.value}</div>
                        <div className="text-[10px] text-white/40 font-medium mt-1">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-emerald-400">Sistem sedang online</span>
                      <Wifi className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div animate={{ width: ['0%', '100%'] }} transition={{ duration: 2, repeat: Infinity }} className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '76%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/30 mt-1"><span>Server Load</span><span>76%</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="section-fitur" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-emerald-400 text-sm font-bold font-mono tracking-widest uppercase">FITUR UNGGULAN</span>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight">{s.about_title || 'Mengapa AONE SIAKAD?'}</h2>
            <p className="text-lg text-white/50">{s.about_desc || 'Platform all-in-one yang mencakup seluruh kebutuhan operasional perguruan tinggi.'}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Server, title: 'Multi-Tenant Architecture', desc: 'Setiap kampus mendapat environment terisolasi dengan database, domain, dan konfigurasi sendiri.', color: 'from-emerald-500/20 to-emerald-600/10' },
              { icon: Database, title: 'Sinkronasi PDDIKTI', desc: 'Laporan otomatis real-time ke PDDIKTI. Data mahasiswa, dosen, kurikulum terkirim tanpa perlu repot.', color: 'from-indigo-500/20 to-indigo-600/10' },
              { icon: Award, title: 'Akreditasi 9 Standar', desc: 'Dashboard monitor 9 standar BAN-PT dengan rekomendasi otomatis dan tracking progress akreditasi.', color: 'from-amber-500/20 to-amber-600/10' },
              { icon: CreditCard, title: 'Multi Payment Gateway', desc: 'Virtual account, cicilan UKT, beasiswa, dan laporan keuangan real-time dalam satu dashboard.', color: 'from-rose-500/20 to-rose-600/10' },
              { icon: BookOpen, title: 'LMS Terintegrasi', desc: 'Moodle LMS dengan sinkronasi nilai otomatis ke KHS. Dosen input nilai sekali, langsung masuk raport.', color: 'from-cyan-500/20 to-cyan-600/10' },
              { icon: Users, title: 'Portal Mahasiswa SSO', desc: 'KRS online, KHS, transkrip, tagihan UKT, dan tracer study dalam satu portal dengan single sign-on.', color: 'from-violet-500/20 to-violet-600/10' },
              { icon: Globe, title: 'OJS & Repository', desc: 'Manajemen jurnal online dengan Open Journal Systems, repository institusi, dan publikasi ilmiah.', color: 'from-orange-500/20 to-orange-600/10' },
              { icon: Smartphone, title: 'Mobile Responsive', desc: 'Akses dari mana saja via smartphone, tablet, atau desktop. Seluruh fitur responsif dan mobile-friendly.', color: 'from-emerald-500/20 to-emerald-600/10' },
              { icon: Shield, title: 'Keamanan Enterprise', desc: 'Enkripsi AES-256, backup harian, firewall real-time, dan sertifikat SSL untuk keamanan data kampus.', color: 'from-emerald-500/20 to-emerald-600/10' },
              { icon: Cloud, title: 'Cloud Native SaaS', desc: 'Fully-managed cloud infrastructure. Tidak perlu urus server, update, backup — kami urus semuanya.', color: 'from-indigo-500/20 to-indigo-600/10' },
              { icon: Zap, title: 'Real-time Analytics', desc: 'Dashboard analitik real-time untuk rektorat, fakultas, dan prodi. Data selalu terkini.', color: 'from-amber-500/20 to-amber-600/10' },
              { icon: Headphones, title: 'Dukungan 24/7', desc: 'Account manager dedicated, support WA & email 24 jam, dan tim teknis siap membantu kapan saja.', color: 'from-rose-500/20 to-rose-600/10' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1">
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${f.color}`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-white/5 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold font-display mb-2">{f.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PERBANDINGAN */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-black to-emerald-950/30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-emerald-400 text-sm font-bold font-mono tracking-widest uppercase">PERBANDINGAN</span>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight">AONE SIAKAD vs Lainnya</h2>
            <p className="text-lg text-white/50">Lihat perbandingan objektif antara AONE SIAKAD dengan sistem lain atau pengembangan internal.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="overflow-hidden rounded-3xl border border-white/5">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-white/50">Aspek</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-orange-400/70">Sevima</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-rose-400/70">Sistem Lain / Internal</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/5">AONE SIAKAD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {compareRows.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition">
                    <td className="p-5 text-sm font-semibold text-white/70">{row.label}</td>
                    <td className="p-5 text-sm text-orange-400/60"><X className="w-4 h-4 inline mr-1" />{row.sevima}</td>
                    <td className="p-5 text-sm text-rose-400/60"><X className="w-4 h-4 inline mr-1" />{row.others}</td>
                    <td className="p-5 text-sm text-emerald-400 bg-emerald-500/5"><CheckCircle className="w-4 h-4 inline mr-1" />{row.aone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* SCORE VISUAL BARS */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-16 max-w-4xl mx-auto">
            <h3 className="text-center text-sm font-bold font-mono tracking-widest uppercase text-white/40 mb-10">Skor Komparasi Fitur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {featureScores.map((f, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60 font-medium">{f.name}</span>
                    <span className="flex gap-3 text-[11px] font-bold">
                      <span className="text-emerald-400">{f.aone}%</span>
                      <span className="text-orange-400/60">Sevima {f.sevima}%</span>
                      <span className="text-rose-400/40">Lain {f.others}%</span>
                    </span>
                  </div>
                  <div className="h-5 bg-white/5 rounded-full overflow-hidden flex">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${f.aone}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${f.sevima}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }} className="h-full bg-orange-500/60 rounded-full" />
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${f.others}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }} className="h-full bg-rose-500/30" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/10 text-center">
            <p className="text-sm text-white/60">Biaya implementasi AONE SIAKAD <span className="text-emerald-400 font-bold">GRATIS</span> — berbeda dengan Sevima dan sistem lain yang memungut biaya migrasi Rp 75-200 juta.</p>
          </div>
        </div>
      </section>

      {/* PROMO & PRICING */}
      <section id="section-harga" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-emerald-400 text-sm font-bold font-mono tracking-widest uppercase">PAKET HARGA</span>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight">{s.promo_title || 'Pilih Paket Sesuai Kebutuhan'}</h2>
            <p className="text-lg text-white/50">{s.promo_desc || 'Semua paket sudah termasuk implementasi GRATIS dan dukungan teknis penuh.'}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-3xl border ${plan.highlighted ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30 scale-105' : 'bg-gradient-to-br from-white/[0.04] to-white/[0.02] border-white/10'}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-xs font-bold text-white shadow-lg">Paling Populer</div>
                )}
                <h3 className="text-xl font-bold font-display mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-emerald-400">{plan.price}</span>
                  {plan.period && <span className="text-white/40 text-sm">{plan.period}</span>}
                </div>
                <div className="space-y-2 text-sm text-white/50 mb-6">
                  <p>Mahasiswa: <b className="text-white/80">{plan.students}</b></p>
                  <p>Storage: <b className="text-white/80">{plan.storage}</b></p>
                  <p>Support: <b className="text-white/80">{plan.support}</b></p>
                </div>
                <ul className="space-y-2 mb-8">
                  {plan.features.map((ft, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-white/70"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />{ft}</li>
                  ))}
                </ul>
                <a href="#section-kampus" className={`block w-full py-3 rounded-xl text-sm font-bold text-center transition hover:scale-105 ${plan.highlighted ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  Konsultasi Sekarang
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="section-testimoni" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #000 0%, ${pc}08 50%, #000 100%)` }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-emerald-400 text-sm font-bold font-mono tracking-widest uppercase">TESTIMONI</span>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight">Apa Kata Mereka?</h2>
            <p className="text-lg text-white/50">Rektor, dekan, dan dosen dari berbagai kampus mitra berbagi pengalaman menggunakan AONE SIAKAD.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition">
                <Quote className="w-8 h-8 text-emerald-400/30 mb-4" />
                <p className="text-sm text-white/70 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-[10px] text-white/40">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-3 h-3 ${j < t.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="section-faq" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 space-y-4">
            <span className="text-emerald-400 text-sm font-bold font-mono tracking-widest uppercase">FAQ</span>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight">Pertanyaan Umum</h2>
            <p className="text-lg text-white/50">Temukan jawaban atas pertanyaan yang sering diajukan tentang AONE SIAKAD.</p>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-white/5 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-5 text-left flex items-center justify-between hover:bg-white/[0.02] transition">
                  <span className="text-sm font-bold text-white/80">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CAMPUS LIST */}
      <section id="section-kampus" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-emerald-400 text-sm font-bold font-mono tracking-widest uppercase">KAMPUS MITRA</span>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight">Jelajahi Portal Kampus</h2>
            <p className="text-lg text-white/50">Klik kampus di bawah untuk melihat portal PPDB, brosur digital, dan informasi lengkap.</p>
          </motion.div>
          <CampusGrid isDark={isDark} onExploreCampus={onExploreCampus} />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${pc} 0%, #000 80%)` }} />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="space-y-8">
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight">{s.cta_title || 'Siap Bertransformasi?'}</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">{s.cta_desc || 'Bergabunglah dengan 50+ universitas yang telah mempercayakan sistem akademiknya kepada AONE SIAKAD.'}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={onLoginClick} className="px-8 py-4 bg-white rounded-2xl text-base font-bold shadow-xl hover:scale-105 transition-all" style={{ color: pc }}>Login Admin <ArrowRight className="w-5 h-5 inline" /></button>
              <a href="mailto:hello@aoneproject.id" className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-base font-semibold hover:bg-white/10 transition flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" /> hello@aoneproject.id
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-white/40">
              <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> +62 21 1234 5678</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Jakarta, Indonesia</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> ISO 27001 Certified</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-white">A</div>
                <span className="font-bold text-lg">AONE Project</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">Platform SIAKAD all-in-one untuk universitas Indonesia. Dipercaya 50+ kampus mitra di seluruh Indonesia.</p>
            </div>
            {[
              { title: 'Produk', items: ['SIAKAD', 'PMB Online', 'LMS Moodle', 'PDDIKTI Sync', 'Akreditasi 9 Standar'] },
              { title: 'Perusahaan', items: ['Tentang Kami', 'Tim Pengembang', 'Karir', 'Blog', 'Kontak'] },
              { title: 'Dukungan', items: ['Dokumentasi', 'API Reference', 'Status Server', 'FAQ', 'Live Chat'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-sm font-bold text-white/60 mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.items.map((item, j) => (
                    <li key={j}><a href="#" className="text-sm text-white/40 hover:text-emerald-400 transition">{item}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
            <span>{s.footer_text || '© 2026 AONE Project. All rights reserved.'}</span>
            <div className="flex items-center gap-4">
              <Globe className="w-4 h-4" /><span>aone-project.id</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CampusGrid({ isDark, onExploreCampus }: { isDark: boolean; onExploreCampus: (id?: string) => void }) {
  const [campuses, setCampuses] = useState<any[]>([]);
  useEffect(() => { api.getCampuses().then(setCampuses).catch(() => {}); }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campuses.slice(0, 6).map((c, i) => (
        <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
          className="group p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer"
          onClick={() => onExploreCampus(c.id)}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-white/5 flex items-center justify-center text-lg font-bold text-emerald-400">
              {c.name?.charAt(0) || '?'}
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{c.status}</span>
          </div>
          <h3 className="text-lg font-bold font-display mb-1">{c.name}</h3>
          <p className="text-sm text-white/40 mb-4">{c.location} — {c.package}</p>
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-sm text-white/40">
              <GraduationCap className="w-4 h-4" /> {c.students?.toLocaleString() || 0} Mahasiswa
            </div>
            <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              Kunjungi <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
