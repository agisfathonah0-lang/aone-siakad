import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, GraduationCap, Shield, CreditCard, Sparkles, UserCheck, 
  ArrowRight, Phone, Mail, MapPin, Calculator, Send, CheckCircle2, 
  Award, RefreshCw, BarChart2, Star, Users, BrainCircuit, Landmark, 
  Database, Server, Lock, Activity, ChevronRight, HelpCircle, FileText, Check, X
} from 'lucide-react';

interface SaaSMarketingSectionProps {
  isDark: boolean;
  onSelectDeveloperDemo: (role: any) => void;
  onLoginClick: () => void;
  onSwitchToCampus: () => void;
}

export default function SaaSMarketingSection({ 
  isDark, 
  onSelectDeveloperDemo, 
  onLoginClick, 
  onSwitchToCampus 
}: SaaSMarketingSectionProps) {
  // Tabs inside modules explorer
  const [activeModule, setActiveModule] = useState<string>('SIAKAD');
  
  // Interactive SaaS Pricing Calculator States
  const [studentCount, setStudentCount] = useState<number>(3500);
  const [selectedPlan, setSelectedPlan] = useState<'STANDARD' | 'GROWTH' | 'ENTERPRISE'>('GROWTH');
  const [annualBilling, setAnnualBilling] = useState<boolean>(true);

  // Proposal Form States
  const [campName, setCampName] = useState<string>('');
  const [picName, setPicName] = useState<string>('');
  const [picEmail, setPicEmail] = useState<string>('');
  const [picPhone, setPicPhone] = useState<string>('');
  const [cloudDeploy, setCloudDeploy] = useState<string>('GCP_INDONESIA');
  const [selectedMods, setSelectedMods] = useState<string[]>(['SIAKAD', 'KEUANGAN', 'PDDIKTI']);
  const [proposalSubmitted, setProposalSubmitted] = useState<boolean>(false);
  const [proposalLoading, setProposalLoading] = useState<boolean>(false);
  const [proposalData, setProposalData] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Core SLA Statistics Simulation
  const stats = [
    { label: 'Uptime SLA Jaringan', value: '99.99%', desc: 'Cloud multi-zone Kubernetes automatic failovers' },
    { label: 'Sinkronisasi Feeder', value: '< 2 Detik', desc: 'Sesuai REST API Kemendikbudristek terbaru' },
    { label: 'Efisiensi Birokrasi Kampus', value: '85%+', desc: 'Berdasarkan audit operasional mitra kami' },
    { label: 'Migrasi Database Sikad Lama', value: '7 Hari', desc: 'Proses ETL terotomasi dengan integrasi skema' }
  ];

  // Pricing calculations
  // Price per student per month
  const planRates = {
    STANDARD: 3500, // Rp 3.500 per mahasiswa / bulan
    GROWTH: 5500,   // Rp 5.500 per mahasiswa / bulan
    ENTERPRISE: 8000 // Rp 8.000 per mahasiswa / bulan
  };

  const calculateSaaSPrice = () => {
    const monthlyRate = planRates[selectedPlan];
    let totalPrice = studentCount * monthlyRate;
    
    // Apply annual discount (20% off)
    if (annualBilling) {
      totalPrice = totalPrice * 12 * 0.8;
    } else {
      totalPrice = totalPrice;
    }

    return Math.round(totalPrice);
  };

  const getSavingsVsCustomIT = () => {
    // Estimasi biaya pembangunan & pemeliharaan server sendiri per tahun
    // Server: ~Rp 120jt, Programmer 2 org: ~Rp 192jt, Lisensi database: ~Rp 50jt
    const customCost = 362000000;
    const saasCost = annualBilling ? calculateSaaSPrice() : calculateSaaSPrice() * 12;
    const savings = customCost - saasCost;
    return savings > 0 ? savings : 120000000;
  };

  // Modules List Data
  const modulesList = [
    { 
      id: 'SIAKAD', 
      title: 'Portal Akademik & KRS Cerdas', 
      desc: 'Sistem KRS Online anti-down dengan pembatasan IPS otomatis, cetak pasfoto KHS, IPK, transkrip nilai digital berstandar PIN, kurikulum MBKM, dan jadwal kuliah berbasis bentrok deteksi.',
      badge: 'Modul Inti'
    },
    { 
      id: 'KEUANGAN', 
      title: 'Sistem Keuangan Multi Virtual Account', 
      desc: 'Integrasi API multi-bank (Mandiri, BSI, BNI, BRI) otomatis melahirkan kode VA tagihan UKT mahasiswa secara instan dengan rekonsiliasi realtime bypass verifikasi manual.',
      badge: 'Gerbang Finansial'
    },
    { 
      id: 'PDDIKTI', 
      title: 'Automated PDDIKTI Feeder Sync', 
      desc: 'Kirim dan sinkronisasikan laporan mahasiswa, dosen, krs, dan nilai secara aman ke database Neo-Feeder Kemendikbudristek tanpa perlu ekspor file XML/CSV semi-manual.',
      badge: 'Akurasi 100%'
    },
    { 
      id: 'AKREDITASI', 
      title: 'Dokumentasi Akreditasi 9 Standar', 
      desc: 'Lahirkan borang akreditasi institusi dan prodi BAN-PT instan secara tersinkronisasi murni dari kegiatan dosen & mahasiswa sehari-hari tanpa kepanikan persiapan visitasi.',
      badge: 'Penjaminan Mutu'
    },
    { 
      id: 'LMS', 
      title: 'LMS & Forum Kuliah Terintegrasi', 
      desc: 'Ruang interaksi e-learning, absensi otomatis, pengumpulan tugas kuliah interaktif dengan sistem skor dan pre-grading, sinkronisasi portofolio nilai dosen langsung.',
      badge: 'Pembelajaran Hybrid'
    },
    { 
      id: 'ALUMNI', 
      title: 'Tracer Study & Alumni Tracking (IKU 1)', 
      desc: 'Formulir tracer study terstandar BAN-PT dengan analisis keterserapan pasar kerja alumni, pelacakan rerata gaji, masa tunggu kerja, serta visual grafik karir interaktif.',
      badge: 'Mitra Industri'
    }
  ];

  const handleToggleMod = (modId: string) => {
    if (selectedMods.includes(modId)) {
      if (selectedMods.length > 1) {
        setSelectedMods(selectedMods.filter(m => m !== modId));
      }
    } else {
      setSelectedMods([...selectedMods, modId]);
    }
  };

  // B2B proposal request generator
  const handleRequestProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName || !picName || !picEmail || !picPhone) {
      setFormError('Mohon lengkapi seluruh formulir profil perguruan tinggi.');
      setTimeout(() => setFormError(null), 5000);
      return;
    }

    setFormError(null);
    setProposalLoading(true);

    setTimeout(() => {
      // Create dynamically generated setup timeline & cost estimate roadmap
      const estimatedSetupWeeks = Math.max(2, Math.round(selectedMods.length * 1.2));
      const annualCost = calculateSaaSPrice() * (annualBilling ? 1 : 12);
      const generatedCode = 'PROP-' + Date.now().toString().slice(-4) + '-' + campName.replace(/\s+/g, '').slice(0, 4).toUpperCase();
      
      const proposal = {
        code: generatedCode,
        university: campName,
        consultant: 'Sistem Automasi Proposal AONE SIAKAD',
        activeStudents: studentCount,
        selectedTier: selectedPlan,
        setupTime: `${estimatedSetupWeeks} Pekan Kerja`,
        monthlyCost: selectedPlan === 'STANDARD' ? studentCount * 3500 : selectedPlan === 'GROWTH' ? studentCount * 5500 : studentCount * 8000,
        annualCostWithDiscount: annualCost,
        allocatedStorage: selectedPlan === 'STANDARD' ? '100 GB SSD' : selectedPlan === 'GROWTH' ? '500 GB SSD Premium' : '3 TB Dedicated Cloud Storage',
        cloudServer: cloudDeploy === 'GCP_INDONESIA' ? 'Google Cloud Indonesia (Jakarta Region)' : cloudDeploy === 'AWS_SINGAPORE' ? 'Amazon Web Services (Singapore)' : 'Sovereign Cloud (Telkom Sigma Indonesia)',
        components: [...selectedMods],
        phases: [
          { name: 'Fokus 1: Ekstraksi & ETL Database Lama Kampus Anda', duration: '5 - 7 hari kerja', desc: 'Tim migrasi kami menyaring data mentah dari SIAKAD lama untuk diselaraskan dengan skema database modern AONE SIAKAD.' },
          { name: 'Fokus 2: Provisioning Cloud Server & Letak Ssl Domisili', duration: '3 hari kerja', desc: 'Instalasi Kubernetes Node khusus berstandar keamanan ISO 27001 dan aktivasi SSL Subdomain resmi kampus.' },
          { name: 'Fokus 3: Sinkronisasi Sandbox Bank Virtual Account', duration: '5 hari kerja', desc: 'Pembuatan endpoint callback multi-bank pilihan rektorat untuk verifikasi instan UKT.' },
          { name: 'Fokus 4: Pelatihan Teknis & Go-Live Feeder PDDIKTI', duration: '4 hari kerja', desc: 'Pendampingan admin akademik, dosen wali, dan simulasi penyerahan portofolio nilai ke LLDIKTI.' }
        ]
      };

      setProposalData(proposal);
      setProposalLoading(false);
      setProposalSubmitted(true);
    }, 1500);
  };

  return (
    <div className="space-y-16 py-8">
      {/* SaaS Hero Section */}
      <section id="saas-hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* SaaS Hero Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide ${
              isDark 
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Satu-Satunya SaaS ERP Terlengkap Untuk Standarisasi BAN-PT IKU
            </div>

            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-slate-900 dark:text-white tracking-tight leading-none">
              SIAKAD & ERP <br />
              <span className="text-emerald-500">Pendidikan Tinggi</span><br />
              Modern Sekelas Dunia.
            </h1>

            <p className="text-sm md:text-base text-slate-500 dark:text-zinc-400 leading-relaxed max-w-xl">
              AONE SIAKAD menghadirkan masa depan digitalisasi universitas Indonesia secara instan. 
              Satu platform ERP SaaS terpadu yang memangkas biaya server lokal, mempercepat sinkronisasi PDDIKTI, 
              mengotomasi pembayaran VA Bank, dan menyiapkan kelengkapan 9 Standar Akreditasi Unggul secara seamless.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a 
                href="#saas-kalkulator"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 transition-all duration-250 cursor-pointer"
              >
                Simulasi Kemitraan & Proposal
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onSwitchToCampus}
                className={`px-6 py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all duration-200 ${
                  isDark 
                    ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-850' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                Masuk Halaman Kampus UND
              </button>
            </div>

            {/* Quick Demo Impersonation Portal for Campus Decision Makers */}
            <div className={`p-5 rounded-2xl border ${
              isDark ? 'bg-zinc-900/60 border-zinc-900' : 'bg-white border-slate-200'
            } max-w-xl space-y-3`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-extrabold">SANDBOX INSTAN DIREKTORAT</span>
              </div>
              <p className="text-xs text-slate-450 dark:text-zinc-400">
                Pilih salah satu akun demo di bawah untuk menguji keunggulan dashboard multi-role AONE SIAKAD secara live berkas:
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Multi-tenant control' },
                  { role: 'AKADEMIK', label: 'Admin Akademik', desc: 'Verifikasi & KRS' },
                  { role: 'DOSEN', label: 'Dosen Wali', desc: 'Bimbingan, KHS' },
                  { role: 'KEUANGAN', label: 'Keuangan', desc: 'VA, Slip Transfer' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectDeveloperDemo(item.role)}
                    className={`p-2 rounded-xl text-center text-xs border transition hover:border-emerald-500 hover:bg-emerald-500/5 ${
                      isDark ? 'bg-zinc-950 border-zinc-850 text-white' : 'bg-slate-50 border-slate-150'
                    }`}
                  >
                    <span className="font-extrabold block text-[11px] leading-tight text-slate-800 dark:text-zinc-100">{item.label}</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 block">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* SaaS Hero Visual mockups */}
          <div className="lg:col-span-5">
            <div className={`p-6 rounded-3xl border shadow-2xl relative overflow-hidden ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-205'
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full" />
              
              <div className="border-b border-indigo-500/10 pb-4 mb-4 flex justify-between items-center text-xs">
                <span className="font-mono text-[9px] bg-indigo-500/10 text-indigo-500 px-2.5 py-0.5 rounded-full font-bold">MONITORING CLOUD CORE</span>
                <span className="text-emerald-500 flex items-center gap-1 font-bold">
                  <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  SISTEM AKTIF
                </span>
              </div>

              <div className="space-y-4">
                {/* Simulated Server Card */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-zinc-200">
                    <span>Kecepatan API Callback Multi-VA</span>
                    <span className="text-emerald-500">1.2s (Optimal)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[95%]" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-zinc-200">
                    <span>Akurasi Skema Feeder PDDIKTI</span>
                    <span className="text-emerald-500">100% (Sinkron)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                </div>

                <div className="p-4 bg-indigo-500/10 border border-indigo-500/15 rounded-xl space-y-1.5">
                  <h4 className="text-[11px] font-bold text-indigo-500 uppercase font-mono">MITRA TERINTEGRASI KEMENRISTEKDIKTI</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 italic font-medium">
                    "AONE SIAKAD meluruskan birokrasi perguruan tinggi swasta Indonesia agar mampu melompati batas akreditasi institusi dalam waktu sekejap murni secara SaaS"
                  </p>
                </div>
              </div>

              {/* Multi-tenant database stats */}
              <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-zinc-800 text-xs">
                <div>
                  <h5 className="text-[10px] text-slate-400 uppercase font-extrabold">Data Center</h5>
                  <p className="font-extrabold mt-0.5">Google Cloud (Jkt)</p>
                </div>
                <div>
                  <h5 className="text-[10px] text-slate-400 uppercase font-extrabold">Keamanan Enkripsi</h5>
                  <p className="font-extrabold text-emerald-500 mt-0.5">AES 256 Layer</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SLA stats banner */}
      <section className="bg-slate-150 dark:bg-zinc-900 border-t border-b border-slate-200 dark:border-zinc-850 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">{s.label}</span>
                <span className="text-2xl md:text-3xl font-extrabold text-emerald-600 block font-mono">{s.value}</span>
                <span className="text-slate-400 text-xs mt-1 block leading-tight">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules bento explorer */}
      <section id="saas-fitur" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-emerald-500 text-xs font-bold font-mono tracking-widest uppercase">EKSPLORASI MODUL</span>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">Ekosistem 10+ Modul ERP Siap-Pakai</h2>
          <p className="text-sm text-slate-550 dark:text-zinc-400">
            Hindari integrasi tumpang tindih antar vendor SI. AONE SIAKAD melengkapi seluruh fungsionalitas perguruan tinggi dalam satu standar platform database.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel tabs list */}
          <div className="lg:col-span-5 space-y-2">
            {modulesList.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={`w-full p-4 rounded-xl border text-left transition ${
                  activeModule === m.id
                    ? 'border-emerald-500 bg-emerald-500/5 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-900/50 text-slate-600 dark:text-zinc-400'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold font-display">{m.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    activeModule === m.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-550'
                  }`}>
                    {m.badge}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Right panel blueprint preview */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {modulesList.map((m) => {
                if (m.id !== activeModule) return null;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`p-6 rounded-3xl border h-full flex flex-col justify-between ${
                      isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl shrink-0">
                          {m.id === 'SIAKAD' && <GraduationCap className="w-6 h-6" />}
                          {m.id === 'KEUANGAN' && <CreditCard className="w-6 h-6" />}
                          {m.id === 'PDDIKTI' && <RefreshCw className="w-6 h-6" />}
                          {m.id === 'AKREDITASI' && <Award className="w-6 h-6" />}
                          {m.id === 'LMS' && <BrainCircuit className="w-6 h-6" />}
                          {m.id === 'ALUMNI' && <Users className="w-6 h-6" />}
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-550 uppercase font-bold font-mono">{m.badge}</span>
                          <h3 className="font-bold text-lg font-display text-slate-900 dark:text-white leading-tight">{m.title}</h3>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                        {m.desc}
                      </p>

                      {/* Interactive UI Workflow Blueprint representation */}
                      <div className={`p-5 rounded-2xl border space-y-4 ${
                        isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-emerald-500 font-extrabold uppercase font-mono tracking-wider">SIKLUS ALUR LAYANAN & ESTIMASI PROSEDUR</span>
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {m.id === 'SIAKAD' && (
                            <>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Mahasiswa Mengajukan KRS Online melalui portal Akademik.</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Sistem memvalidasi batasan nilai IPS, bentrok jadwal, & kuota kelas otomatis.</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Hasil bimbingan divalidasi langsung oleh Dosen Wali Kelas secara kolektif.</span>
                              </div>
                            </>
                          )}
                          {m.id === 'KEUANGAN' && (
                            <>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">SIAKAD menerbitkan invoice Virtual Account secara otomatis bagi setiap mahasiswa.</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Pembayaran VA Bank terintegrasi via callback instan tanpa perlu unggah berkas manual.</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Rekonsiliasi keuangan kas rujukan secara real-time tersinkron ke pembukuan yayasan.</span>
                              </div>
                            </>
                          )}
                          {m.id === 'PDDIKTI' && (
                            <>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Sistem mengurasi skema dan memvalidasi integritas data kelayakan pelaporan.</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Pengiriman terenkripsi langsung ke server Neo Feeder Kemdikbudristek RI.</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Sertifikasi sinkronisasi 100% tuntas dalam hitungan detik bersertifikat resmi.</span>
                              </div>
                            </>
                          )}
                          {m.id === 'AKREDITASI' && (
                            <>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Pengumpulan data Tri Dharma Perguruan Tinggi, modul riset, & pengabdian instan.</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Penyusunan Lembar Evaluasi Diri (LED) & Laporan Evaluasi Kinerja otomatis.</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Pemetaan kesiapan akreditasi 9 standar BAN-PT secara digital proaktif.</span>
                              </div>
                            </>
                          )}
                          {m.id === 'LMS' && (
                            <>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Penyusunan modul Rencana Pembelajaran Semester (RPS) secara interaktif.</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Interaksi perkuliahan daring, forum diskusi materi, quiz, dan absensi QR code.</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Portofolio penilaian mahasiswa dari LMS terintegrasi langsung ke instrumen SIAKAD.</span>
                              </div>
                            </>
                          )}
                          {m.id === 'ALUMNI' && (
                            <>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Penyebaran kuesioner tracer study terstandar BAN-PT bagi lulusan secara berkala.</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Analisis otomatis serapan pasar kerja alumni, rerata waktu tunggu, & tingkat gaji.</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Rekapitulasi visual pencapaian Indikator Kinerja Utama (IKU-1) rektorat.</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs mt-6">
                      <span className="text-slate-400">Kompatibilitas Standard:</span>
                      <span className="font-bold text-slate-705 dark:text-zinc-200">Kemenristekdikti RI Neo-Feeder SEVIMA Integrator</span>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* Comparison table */}
      <section id="saas-banding" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-emerald-500 text-xs font-bold font-mono tracking-widest uppercase">SANGGAHAN KOMPETITOR</span>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">Mengapa Kami Selangkah Lebih Maju</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Perbandingan objektif parameter esensial SIAKAD antara sistem lama buatan sendiri, kompetitor besar eksis, dan infrastruktur modern AONE SIAKAD.
          </p>
        </div>

        <div className={`border rounded-3xl overflow-hidden shadow-xl ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
        }`}>
          <table className="w-full text-left text-xs text-slate-500 dark:text-zinc-400">
            <thead className={`text-[10px] font-bold uppercase tracking-wider ${
              isDark ? 'bg-zinc-950 text-zinc-450 border-b border-zinc-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'
            }`}>
              <tr>
                <th className="p-4 md:p-5">FITUR & KRITERIA UTAMA</th>
                <th className="p-4 md:p-5">SI KAMPUS LAMA / DIY</th>
                <th className="p-4 md:p-5">COMPETITOR UTAMA RAksasa</th>
                <th className="p-4 md:p-5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">AONE SIAKAD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
              {[
                { 
                  criteria: 'Setup Layanan Subdomain Kampus', 
                  old: 'Berbulan-bulan, beli VPS sendiri', 
                  comp: '10 - 15 hari persetujuan manual', 
                  our: 'Instan 1-Hari Teraktivasi SSL',
                  highlight: true 
                },
                { 
                  criteria: 'Prosedur Sinkronisasi PDDIKTI', 
                  old: 'Manual ekspor CSV, rawan bentrok data', 
                  comp: 'REST API, verifikasi manual bertahap', 
                  our: 'Automasi callback Feeder Neo-SLA < 2s',
                  highlight: true 
                },
                { 
                  criteria: 'Integrasi Callback VA Multi-Bank', 
                  old: 'Konfigurasi manual sirkuit rekening mandiri', 
                  comp: 'Ekstra biaya administrasi & setup mahal', 
                  our: 'Pre-integrated API tanpa biaya awal setup bank',
                  highlight: true 
                },
                { 
                  criteria: 'Sistem Borang Akreditasi 9 Standar', 
                  old: 'Draf manual di Word berserakan, panik visitasi', 
                  comp: 'Hanya rekap XLS laporan dasar', 
                  our: 'Dashboard evaluasi mandiri terkompilasi langsung',
                  highlight: true 
                },
                { 
                  criteria: 'Keandalan Uptime & Sinyal KRS', 
                  old: 'Server down massal saat ribuan mhs login KRS', 
                  comp: 'Stabil namun sering flicker di puncak semester', 
                  our: 'Automatic Horizontal Pod Scaling di Multi-zone Cluster',
                  highlight: true 
                }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/40 transition-colors">
                  <td className="p-4 font-bold text-slate-800 dark:text-zinc-200">{row.criteria}</td>
                  <td className="p-4 text-slate-400 font-medium">❌ {row.old}</td>
                  <td className="p-4 text-slate-400 font-medium font-semibold">⚠️ {row.comp}</td>
                  <td className="p-4 font-extrabold bg-emerald-500/5 text-slate-900 dark:text-zinc-100 border-l border-r border-emerald-500/10">
                    ✅ {row.our}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ROI Pricing and Investment calculator */}
      <section id="saas-kalkulator" className="py-16 bg-slate-100 dark:bg-zinc-950 border-t border-b border-slate-205 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* ROI Left side slider config */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-emerald-500 text-xs font-bold font-mono tracking-widest uppercase">KALKULATOR INVESTASI SISTEM</span>
              <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">Sesuaikan Kapasitas Mahasiswa Aktif Anda</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                Platform SaaS dirancang adaptif mengikuti skala institusi Anda. Tidak ada minimum kontrak berisiko tinggi. 
                Sesuaikan slider jumlah mahasiswa aktif kampus Anda untuk melihat simulasi proposal biaya operasional dan proyeksi penghematan operasional IT tahunan.
              </p>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs uppercase font-extrabold text-slate-400">Total Mahasiswa Aktif</label>
                  <span className="text-lg font-black text-emerald-500 font-mono">{studentCount.toLocaleString('id-ID')} Mahasiswa</span>
                </div>
                
                <input
                  id="students-slider"
                  type="range"
                  min="0"
                  max="15000"
                  step="250"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>0 (Rintisan / Sekolah Tinggi)</span>
                  <span>7,500 (Institut)</span>
                  <span>15,000+ (Universitas Raya)</span>
                </div>
              </div>

              {/* Annual switch toggle */}
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                isDark ? 'bg-zinc-900 border-zinc-850' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h4 className="text-xs font-bold font-display">Pilih Siklus Tagihan</h4>
                  <p className="text-[10px] text-slate-450 dark:text-zinc-400 mt-0.5">Dapatkan diskon potongan 20% khusus untuk pembayaran tahunan instan.</p>
                </div>
                <button
                  id="btn-billing-billing-tab"
                  onClick={() => setAnnualBilling(!annualBilling)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wide uppercase transition ${
                    annualBilling ? 'bg-indigo-600 text-white' : 'border border-slate-300 dark:border-zinc-700 text-slate-400'
                  }`}
                >
                  {annualBilling ? 'Tahunan (-20%)' : 'Bulanan'}
                </button>
              </div>

            </div>

            {/* ROI Right dynamic value calculation card */}
            <div className="lg:col-span-7">
              <div className={`p-6 md:p-8 rounded-3xl border shadow-lg ${
                isDark ? 'bg-zinc-900 border-zinc-850' : 'bg-white border-slate-205'
              } grid grid-cols-1 md:grid-cols-2 gap-8`}>
                         {/* Plan Selection Tiers */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-450 mb-2">Pilih Tingkatan Plan ERP</h3>
                  
                  {[
                    { key: 'STANDARD', name: 'Standard SaaS', priceDesc: 'Rp 3.500 / mhs / bulan', features: ['Portal Akademik', 'KRS Online', 'Keuangan VA Dasar'] },
                    { key: 'GROWTH', name: 'Professional Growth', priceDesc: 'Rp 5.500 / mhs / bulan', features: ['Core SIAKAD', 'Multi VA Callback', 'PDDIKTI Feeder Auto', 'LMS Moodle'] },
                    { key: 'ENTERPRISE', name: 'Elite Enterprise Corporation', priceDesc: 'Rp 8.000 / mhs / bulan', features: ['Semua Modul Terbuka', 'Akreditasi 9 Standar', 'Custom Website & SSL Domain', 'Dedicated Cluster Pod'] }
                  ].map((plan) => (
                    <button
                      key={plan.key}
                      onClick={() => setSelectedPlan(plan.key as any)}
                      className={`w-full p-4 rounded-xl border text-left transition flex flex-col justify-between gap-2.5 ${
                        selectedPlan === plan.key
                          ? 'border-emerald-500 bg-emerald-550/5 text-slate-900 dark:text-white'
                          : 'border-slate-205 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/40 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      <div className="w-full">
                        <div className="flex justify-between items-center w-full">
                          <span className="font-black text-[12px] font-display">{plan.name}</span>
                          {selectedPlan === plan.key ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-550 shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-zinc-700 shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold font-mono mt-0.5 block">{plan.priceDesc}</span>
                      </div>
                      
                      {/* Render features list */}
                      <div className="w-full pt-2 border-t border-dashed border-slate-200 dark:border-zinc-800 space-y-1">
                        {plan.features.map((feat, fidx) => (
                          <div key={fidx} className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400">
                            <span className="text-emerald-500 font-bold font-mono">✓</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Final calculated values presentation card */}
                <div className={`p-6 rounded-2xl bg-slate-950 text-white flex flex-col justify-between border ${
                  isDark ? 'border-zinc-805' : 'border-slate-800'
                }`}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">PREDIKSI TAGIHAN OPERASIONAL</span>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Rencana Plan SaaS</p>
                      <h4 className="font-bold text-sm text-slate-100 mt-1">{selectedPlan === 'STANDARD' ? 'Standard Core' : selectedPlan === 'GROWTH' ? 'Professional Growth' : 'Elite Enterprise Corporation'}</h4>
                    </div>

                    {/* Active features list container */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-850">
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Fitur Utama Aktif:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedPlan === 'STANDARD' && ['Portal Akademik', 'KRS Online', 'Keuangan VA Dasar'].map((f, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-full text-[9px] text-zinc-350 font-medium">✓ {f}</span>
                        ))}
                        {selectedPlan === 'GROWTH' && ['Core SIAKAD', 'Multi VA Callback', 'PDDIKTI Feeder Auto', 'LMS Moodle'].map((f, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-full text-[9px] text-zinc-350 font-medium">✓ {f}</span>
                        ))}
                        {selectedPlan === 'ENTERPRISE' && ['Semua Modul Terbuka', 'Akreditasi 9 Standar', 'Custom Website & SSL Domain', 'Dedicated Cluster Pod'].map((f, i) => (
                          <span key={i} className="px-2 py-0.5 bg-emerald-950/50 border border-emerald-900/40 rounded-full text-[9px] text-emerald-300 font-bold">★ {f}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-850 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Jumlah Mahasiswa terdaftar</span>
                        <span className="font-bold">{studentCount} Person</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fasilitas SLA Cloud</span>
                        <span className="font-bold">99.99% Uptime SLA</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rerata Penghematan Server</span>
                        <span className="font-bold text-emerald-400">Rp {getSavingsVsCustomIT().toLocaleString('id-ID')} /Th</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-850 space-y-3">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">Total Investasi Kampus ({annualBilling ? '1 Tahun' : '1 Bulan'}):</p>
                      <h3 className="text-2xl font-black font-mono text-emerald-400 mt-1.5">
                        Rp {calculateSaaSPrice().toLocaleString('id-ID')}
                      </h3>
                      <p className="text-[9px] text-slate-500 mt-0.5">{annualBilling ? '*Termasuk diskon 20% onboarding tahunan' : '*Dikenakan tagihan rutin bulanan'}</p>
                    </div>

                    <a
                      href="#request-proposal-form"
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold text-center block transition cursor-pointer"
                    >
                      Klaim Proposal Draf Rektorat
                    </a>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Dynamic proposal compiler Lead capture */}
      <section id="request-proposal-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-emerald-500 text-xs font-bold font-mono tracking-widest uppercase">PROPOSAL INSTAN WIZARD</span>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">Ajukan Proposal Resmi & Dokumen Roadmap</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Dapatkan draf blueprint implementasi modul ERP, timeline migrasi, deskripsi fungsional, dan nominal penawaran harga pimpinan rujukan Rektorat secara realtime.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!proposalSubmitted ? (
            <motion.div
              key="lead-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: -15 }}
              className={`p-6 md:p-10 rounded-3xl border shadow-xl ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-205'
              }`}
            >
              <form onSubmit={handleRequestProposal} className="space-y-6 text-xs">
                {formError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/15 text-rose-500 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in duration-150">
                    <span>{formError}</span>
                    <button type="button" onClick={() => setFormError(null)} className="font-extrabold uppercase text-[10px]">TUTUP [X]</button>
                  </div>
                )}
                {formSuccess && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in duration-150">
                    <span>{formSuccess}</span>
                    <button type="button" onClick={() => setFormSuccess(null)} className="font-extrabold uppercase text-[10px]">TUTUP [X]</button>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-450 font-bold uppercase tracking-wider mb-1.5">Nama Perguruan Tinggi (Universitas/Institut/ST) <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={campName}
                      onChange={(e) => setCampName(e.target.value)}
                      placeholder="contoh: Universitas Bhakti Indonesia"
                      className={`w-full p-3 rounded-xl border outline-none ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-450 font-bold uppercase tracking-wider mb-1.5">Nama Penghubung PIC (Nama & Gelar Akademis) <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={picName}
                      onChange={(e) => setPicName(e.target.value)}
                      placeholder="contoh: Dr. Rahmat Hidayat, M.Si"
                      className={`w-full p-3 rounded-xl border outline-none ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-450 font-bold uppercase tracking-wider mb-1.5">Email PIC / Institusi Kampus <span className="text-rose-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={picEmail}
                      onChange={(e) => setPicEmail(e.target.value)}
                      placeholder="contoh: rektorat@bhakti.ac.id"
                      className={`w-full p-3 rounded-xl border outline-none ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-450 font-bold uppercase tracking-wider mb-1.5">Nomor Telepon Seluler (WhatsApp Aktif) <span className="text-rose-500">*</span></label>
                    <input
                      type="tel"
                      required
                      value={picPhone}
                      onChange={(e) => setPicPhone(e.target.value)}
                      placeholder="contoh: 081299238801"
                      className={`w-full p-3 rounded-xl border outline-none ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                </div>

                {/* Cloud deploy selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-indigo-500/10">
                  <div>
                    <label className="block text-slate-450 font-bold uppercase tracking-wider mb-1.5">Model Deployment Server</label>
                    <select
                      value={cloudDeploy}
                      onChange={(e) => setCloudDeploy(e.target.value)}
                      className={`w-full p-3 rounded-xl border outline-none ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-slate-200'
                      }`}
                    >
                      <option value="GCP_INDONESIA">Host Google Cloud Indonesia (Optimasi Terdekat)</option>
                      <option value="AWS_SINGAPORE">Host Amazon Web Services (Singapore Multi-region)</option>
                      <option value="LOCAL_SOVEREIGN">Host Sovereign Cloud Sigma RI (Sesuai Regulasi Data Kominfo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-450 font-bold uppercase tracking-wider mb-1.5 flex justify-between">
                      <span>Pilih Modul Prioritas</span>
                      <span className="text-[10px] text-emerald-500 font-bold">Multi-select</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {['SIAKAD', 'KEUANGAN', 'PDDIKTI', 'AKREDITASI', 'LMS', 'ALUMNI'].map((modId) => (
                        <button
                          key={modId}
                          type="button"
                          onClick={() => handleToggleMod(modId)}
                          className={`px-3 py-1.5 rounded-lg border font-bold transition flex items-center gap-1 text-[11px] ${
                            selectedMods.includes(modId)
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-400'
                          }`}
                        >
                          {selectedMods.includes(modId) ? '✓' : '+'} {modId}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={proposalLoading}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-extrabold shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 transition"
                >
                  {proposalLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      Mengkalkulasi parameter ROI & Pembuatan Draf Kemitraan...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Lahirkan Dokumen Digital Proposal Swasta & Roadmap Integrasi
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="proposal-output"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 md:p-8 rounded-3xl border shadow-2xl space-y-6 ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-205'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-indigo-505/10 text-xs">
                <div>
                  <span className="font-mono text-[9px] bg-emerald-500/20 text-emerald-400 px-3 py-0.5 rounded-full font-bold uppercase">PERSYARATAN PROPOSAL SAH RESMI</span>
                  <h3 className="font-bold text-lg font-display text-slate-900 dark:text-white mt-1">Draf Proposal Kemitraan: {proposalData?.code}</h3>
                  <p className="text-slate-400">Ditujukan kepada: <b>{proposalData?.university} (u.p. {picName})</b></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Siklus Anggaran</p>
                  <p className="text-base font-extrabold text-emerald-600 font-mono">Rp {proposalData?.annualCostWithDiscount.toLocaleString('id-ID')} /Th</p>
                </div>
              </div>

              {/* Dynamic recommendation matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-850">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase uppercase">Server Terpilih</span>
                  <p className="font-extrabold text-slate-800 dark:text-zinc-200 mt-1">{proposalData?.cloudServer}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-850">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Kapasitas Hosting Database</span>
                  <p className="font-extrabold text-slate-800 dark:text-zinc-200 mt-1">{proposalData?.allocatedStorage}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-850">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Estimasi Setup Migrasi</span>
                  <p className="font-extrabold text-emerald-500 mt-1">{proposalData?.setupTime}</p>
                </div>
              </div>

              {/* Roadmap Phases Timeline list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-450">Timeline Tahapan Implementasi Data & Onboarding:</h4>
                
                <div className="space-y-3">
                  {proposalData?.phases.map((ph: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-indigo-50/20 dark:bg-zinc-950 rounded-xl border border-indigo-500/5 flex gap-3 text-xs">
                      <div className="w-6 h-6 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center font-bold font-mono">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex justify-between items-baseline flex-wrap gap-2">
                          <h5 className="font-extrabold text-slate-800 dark:text-zinc-200">{ph.name}</h5>
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{ph.duration}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{ph.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/15 rounded-2xl flex gap-3 text-xs leading-relaxed max-w-2xl text-slate-600 dark:text-zinc-350">
                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p>
                  <b>SIAP DIMIGRASIKAN</b>: Proposal digital ini telah terdaftar di antrean PIC Onboarding wilayah LLDIKTI. 
                  Sesuai rincian di atas, tim spesialis integrasi data kami akan menghubungi Anda via WhatsApp di nomor <b>{picPhone}</b> dalam 1x24 jam untuk melakukan penjadwalan demo call interaktif.
                </p>
              </div>

              {formSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in duration-150 max-w-2xl">
                  <span>{formSuccess}</span>
                  <button type="button" onClick={() => setFormSuccess(null)} className="font-extrabold uppercase text-[10px]">TUTUP [X]</button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-sm">
                <button
                  onClick={() => {
                    setFormSuccess('Sistem premium aktif: Berhasil menyusun proposal SLA Kemitraan resmi format PDF, silahkan periksa hasil download berkas Anda!');
                    setTimeout(() => setFormSuccess(null), 6000);
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center block transition cursor-pointer"
                >
                  Unduh Dokumen PDF Resmi
                </button>
                <button
                  onClick={() => { setProposalSubmitted(false); setCampName(''); setPicName(''); setPicEmail(''); setPicPhone(''); }}
                  className={`px-4 py-3 rounded-xl text-xs font-bold border transition ${
                    isDark ? 'bg-zinc-850 border-zinc-800 hover:bg-zinc-800' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Ajukan Universitas Lain
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Accordion FAQ Section */}
      <section id="saas-faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-emerald-500 text-xs font-bold font-mono tracking-widest uppercase">FAQ KEMITRAAN</span>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">Tanya & Jawab Seputar AONE SIAKAD</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Klarifikasi atas kendala teknis penunjang integrasi ERP, lisensi database, dan penyesuaian regulasi Feeder Kemenristekdilkti.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Apakah tim internal kampus kami harus mengelola server cloud secara mandiri?',
              a: '100% Tidak. AONE SIAKAD merupakan platform Fully-managed Software-as-a-Service (SaaS). Kami menangani seluruh kebutuhan hosting server, skalabilitas, domain SSL, instalasi Kubernetes cluster, replikasi cadangan database harian, hingga peningkatan fitur yang diperbarui secara otomatis tanpa biaya pemeliharaan tambahan.'
            },
            {
              q: 'Bagaimana keamanan perlindungan data pribadi (PDP) mahasiswa kami terjamin?',
              a: 'Aplikasi didesain mengadopsi standar enkripsi data AES-256 tingkat perbankan saat rest dan TLS 1.3 saat in-transit. Setiap tenant perguruan tinggi mendapatkan kontainer database logic-isolated terpisah untuk mencegah risiko kebocoran data silang.'
            },
            {
              q: 'Berapa lama proses migrasi dari database SIAKAD lama perguruan tinggi kami?',
              a: 'Rerata proses migrasi data (profil mahasiswa, riwayat ipk krs, master dosen) berjalan 7 hingga 14 hari penuh. Tim integrasi kami akan menyiapkan skrip ETL migrasi khusus untuk mengeksplorasi tabel database lama Anda (MySQL, Postgres, SQL Server, dsb) secara teliti.'
            },
            {
              q: 'Apakah callback Virtual Account Bank langsung masuk ke rekening rektorat kami?',
              a: 'Tentu saja. Rekening bank rujukan Anda dihubungkan langsung via API perbankan nasional pilihan Anda (BSI, Mandiri, BNI, BRI dsb). Platform tidak bertindak sebagai escrow atau pemotong komisi dana kuliah; 100% uang kuliah mahasiswa langsung disetorkan sekejap ke rekening resmi yayasan/rektorat kampus.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border transition overflow-hidden text-xs ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
              }`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left font-bold flex justify-between items-center text-slate-800 dark:text-zinc-100"
              >
                <span>{item.q}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-950/20"
                  >
                    <p className="p-5 text-slate-400 leading-relaxed">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Promoted Client success quotes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 rounded-3xl border text-center space-y-6 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-emerald-500/5 border-emerald-500/10'
        }`}>
          <h3 className="font-bold text-sm uppercase tracking-wider text-emerald-500 font-mono">MITRA REKTORAT BERBAGI PRESTASI</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans text-left">
            <div className="space-y-3 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-150 dark:border-zinc-850">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
              </div>
              <p className="italic text-slate-400 leading-relaxed">
                "Sebelum berlabuh ke AONE SIAKAD ERP, penginputan nilai dan absensi di kampus kami sarat kekacauan koordinasi. Sejak bermitra dengan model SaaS ini, semua portal dosen terintegrasi rapi dan sinkronisasi PDDIKTI selesai tanpa draf manual."
              </p>
              <div>
                <h5 className="font-extrabold text-slate-800 dark:text-zinc-200">Prof. Dr. Ir. H. Mulyono</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Rektor Universitas Bina Nusantara Digital</p>
              </div>
            </div>

            <div className="space-y-3 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-150 dark:border-zinc-850">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
              </div>
              <p className="italic text-slate-400 leading-relaxed">
                "Modul Akreditasi 9 Standar AONE SIAKAD sangat mutakhir. Borang evaluasi diri diringkas murni secara terotomatisasi dari operasional keseharian. Berhasil membawa prodi kami melompati akreditasi Baik Sekali dalam visitasi perdana."
              </p>
              <div>
                <h5 className="font-extrabold text-slate-800 dark:text-zinc-200">Dr. Hj. Siti Aminah, M.Pd</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">LPM Perguruan Tinggi STKIP Permata Hati</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
