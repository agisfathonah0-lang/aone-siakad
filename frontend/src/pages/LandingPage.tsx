import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Wallet, Library, Star, Award, Printer, Database, Layout,
  Sparkles, ArrowRight, Check, Menu, X, Users, Quote, ChevronDown, Clock
} from 'lucide-react';

const features = [
  { icon: GraduationCap, title: 'Manajemen Akademik', desc: 'KRS online, KHS digital, jadwal kuliah, transkrip nilai, dan monitoring akademik real-time.', color: 'from-emerald-500/20 to-emerald-600/10' },
  { icon: Wallet, title: 'Keuangan Terintegrasi', desc: 'Tagihan SPP, pembayaran online, beasiswa, dan laporan keuangan institusi.', color: 'from-indigo-500/20 to-indigo-600/10' },
  { icon: Library, title: 'Perpustakaan Digital', desc: 'Katalog online, e-book, repositori karya ilmiah, dan manajemen peminjaman.', color: 'from-amber-500/20 to-amber-600/10' },
  { icon: Star, title: 'Evaluasi Dosen', desc: 'Kuesioner online, analisis mutu pengajaran, dan tindak lanjut hasil evaluasi.', color: 'from-rose-500/20 to-rose-600/10' },
  { icon: Award, title: 'Akreditasi BAN-PT', desc: 'Dokumen 9 standar, borang akreditasi, dan pemantauan siklus akreditasi.', color: 'from-purple-500/20 to-purple-600/10' },
  { icon: Printer, title: 'Cetak Dokumen', desc: 'Cetak KHS, transkrip, sertifikat, dan ijazah dengan tanda tangan digital.', color: 'from-cyan-500/20 to-cyan-600/10' },
  { icon: Database, title: 'Integrasi PDDIKTI', desc: 'Sinkronisasi data mahasiswa, dosen, dan prodi ke PDDIKTI secara otomatis.', color: 'from-teal-500/20 to-teal-600/10' },
  { icon: Layout, title: 'Landing Page Builder', desc: 'Buat website kampus sendiri dengan drag & drop builder tanpa coding.', color: 'from-orange-500/20 to-orange-600/10' },
];

const testimonials = [
  { quote: 'AONE SIAKAD membantu kami mengelola administrasi akademik dengan sangat efisien. Implementasinya cepat dan tim support sangat responsif.', name: 'Dr. Ahmad Fauzi, M.Pd.', institution: 'Universitas Pendidikan Indonesia' },
  { quote: 'Setelah migrasi ke AONE SIAKAD, proses PPDB kami menjadi 3x lebih cepat. Dashboard yang intuitif memudahkan tim dalam memantau pendaftaran.', name: 'Rina Wijaya, S.Kom., M.T.', institution: 'Politeknik Negeri Bandung' },
  { quote: 'Fitur integrasi PDDIKTI sangat membantu. Data otomatis tersinkronisasi tanpa perlu input manual berulang kali.', name: 'Prof. Dr. Budi Santoso', institution: 'Universitas Gadjah Mada' },
];

const pricingPlans = [
  { name: 'Basic', price: 'Gratis', period: 'selamanya', desc: 'Untuk institusi kecil yang ingin memulai digitalisasi.', features: ['Manajemen Akademik Dasar', '50 Mahasiswa', '1 Admin', 'KRS & KHS Online', 'Cetak Dokumen Dasar'], popular: false },
  { name: 'Pro', price: 'Rp 299rb', period: '/bulan', desc: 'Solusi lengkap untuk institusi berkembang.', features: ['Semua Fitur Basic', '500+ Mahasiswa', '5 Admin', 'Keuangan Terintegrasi', 'Integrasi PDDIKTI', 'Landing Page Builder', 'Dukungan Prioritas'], popular: true },
  { name: 'Enterprise', price: 'Hubungi', period: 'kami', desc: 'Untuk universitas besar dengan kebutuhan kompleks.', features: ['Semua Fitur Pro', 'Unlimited Mahasiswa', 'Admin Tak Terbatas', 'Kustomisasi Modul', 'SLA 99.9%', 'Dedicated Support', 'On-Premise Opsional'], popular: false },
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

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [promoSlots, setPromoSlots] = useState(10);

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
    <div className="min-h-screen font-sans bg-white text-slate-900 overflow-x-hidden">
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-emerald-500/25">A</div>
            <span className="font-display font-extrabold tracking-tight text-lg text-slate-900">AONE<span className="text-emerald-600">SIAKAD</span></span>
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            {['Beranda', 'Fitur', 'Testimonial', 'Harga'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="px-4 py-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors font-medium">{item}</a>
            ))}
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
        {mobileMenu && (
          <div className="lg:hidden bg-white border-t border-slate-200 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {['Beranda', 'Fitur', 'Testimonial', 'Harga'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenu(false)} className="block px-4 py-3 text-slate-700 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 text-sm font-medium">{item}</a>
              ))}
              <button onClick={() => navigate('/register')} className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold">Demo Gratis</button>
            </div>
          </div>
        )}
      </header>

      <section id="beranda" className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-indigo-50">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium animate-float">
                <Sparkles className="w-4 h-4" /> Solusi Akademik All-in-One
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight leading-none text-slate-900">
                Sistem Informasi Akademik Terpadu
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
                Platform SIAKAD modern untuk universitas, institut, politeknik, dan sekolah tinggi. Kelola akademik, keuangan, PPDB, dan akreditasi dalam satu sistem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/register')} className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl text-base font-bold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all flex items-center justify-center gap-2">
                  Demo Gratis <ArrowRight className="w-5 h-5" />
                </button>
                <a href="#fitur" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-base font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-2 shadow-sm">
                  Pelajari Lebih Lanjut
                </a>
              </div>
              <div className="flex items-center gap-8 pt-8 border-t border-slate-200">
                <div>
                  <div className="text-3xl font-extrabold font-display text-emerald-600"><Counter target={100} suffix="+" /></div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Institusi</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold font-display text-emerald-600"><Counter target={50} suffix=".000+" /></div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Mahasiswa</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold font-display text-emerald-600"><Counter target={10} suffix=".000+" /></div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Dosen</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-indigo-400/20 rounded-3xl blur-3xl" />
                <div className="relative bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-2xl shadow-emerald-500/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">Akses Cepat</span>
                    <span className="text-[10px] text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded-full">ONLINE 24/7</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: GraduationCap, label: 'Mahasiswa', desc: 'KRS, KHS, Transkrip', color: 'text-emerald-600' },
                      { icon: Users, label: 'Dosen', desc: 'Absensi, Nilai, Bimbingan', color: 'text-indigo-600' },
                      { icon: Star, label: 'PPDB', desc: 'Daftar, Cek Hasil', color: 'text-amber-600' },
                      { icon: Award, label: 'Akreditasi', desc: '9 Standar BAN-PT', color: 'text-rose-600' },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition cursor-pointer" onClick={() => navigate('/register')}>
                        <item.icon className={`w-5 h-5 mb-2 ${item.color}`} />
                        <div className="text-sm font-bold text-slate-800">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-emerald-700">Promo PPDB 2026/2027</span>
                      <GraduationCap className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-[11px] text-emerald-600/70 mb-2">Demo gratis & konsultasi selama 30 hari</div>
                    <button onClick={() => navigate('/register')} className="w-full py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all">
                      Daftar Sekarang
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="py-24 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-emerald-600 text-sm font-bold font-mono tracking-widest uppercase">Fitur Lengkap</span>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-slate-900">Semua Kebutuhan Akademik dalam Satu Platform</h2>
            <p className="text-lg text-slate-500">Dari manajemen akademik hingga akreditasi, AONE SIAKAD menyediakan modul lengkap untuk institusi Anda.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${f.color}`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                    <f.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
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

      <section id="testimonial" className="py-24 relative bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-emerald-600 text-sm font-bold font-mono tracking-widest uppercase">Testimonial</span>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-slate-900">Apa Kata Mereka?</h2>
            <p className="text-lg text-slate-500">Ribuan institusi telah merasakan manfaat AONE SIAKAD dalam transformasi digital kampus.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
                <Quote className="w-8 h-8 text-emerald-400/30 mb-4" />
                <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">"{t.quote}"</p>
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
        </div>
      </section>

      <section id="harga" className="py-24 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-emerald-600 text-sm font-bold font-mono tracking-widest uppercase">Harga</span>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-slate-900">Pilihan Paket Fleksibel</h2>
            <p className="text-lg text-slate-500">Mulai dari gratis untuk institusi kecil hingga enterprise untuk universitas besar.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`relative rounded-2xl border-2 p-8 transition-all duration-300 hover:-translate-y-1 ${plan.popular ? 'border-emerald-500 bg-white shadow-xl shadow-emerald-500/10 scale-105 md:scale-110' : 'border-slate-200 bg-white hover:shadow-lg'}`}>
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
                  {plan.name === 'Enterprise' ? 'Hubungi Sales' : 'Mulai Gratis'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden bg-gradient-to-r from-emerald-600 to-indigo-700">
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
            <a href="#fitur" className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl text-base font-semibold hover:bg-white/20 transition inline-flex items-center gap-2">
              Pelajari Fitur
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-white">A</div>
                <span className="font-bold text-lg">AONE SIAKAD</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">Platform SIAKAD all-in-one untuk universitas Indonesia. Dipercaya 100+ kampus mitra di seluruh Indonesia.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-300 mb-4">Produk</h4>
              <ul className="space-y-2">
                {['Fitur', 'Harga', 'Integrasi', 'API'].map(item => (
                  <li key={item}><a href={`#${item.toLowerCase()}`} className="text-sm text-slate-400 hover:text-emerald-400 transition">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-300 mb-4">Perusahaan</h4>
              <ul className="space-y-2">
                {['Tentang', 'Blog', 'Karir', 'Kontak'].map(item => (
                  <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-emerald-400 transition">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-300 mb-4">Dukungan</h4>
              <ul className="space-y-2">
                {['Dokumentasi', 'FAQ', 'Status Layanan', 'Community'].map(item => (
                  <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-emerald-400 transition">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <span>© 2026 AONE Project. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-emerald-400 transition">Twitter</a>
              <a href="#" className="hover:text-emerald-400 transition">LinkedIn</a>
              <a href="#" className="hover:text-emerald-400 transition">Instagram</a>
              <a href="#" className="hover:text-emerald-400 transition">YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
