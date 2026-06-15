import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, BookOpen, Shield, CreditCard, Sparkles, UserCheck, 
  ArrowRight, Phone, Mail, MapPin, Calculator, Send, CheckCircle, 
  Award, RefreshCw, BarChart2, Star, Users, BrainCircuit
} from 'lucide-react';
import { PMBApplicant, User } from '../types';
import { api } from '../api';
import { useToast } from './Toast';
import SaaSMarketingSection from './SaaSMarketingSection';

interface LandingPageProps {
  onLoginClick: () => void;
  onSelectDeveloperDemo: (role: any) => void;
  onRegisterPmbSuccess: (candidate: PMBApplicant) => void;
  isDark: boolean;
}

export default function LandingPage({ onLoginClick, onSelectDeveloperDemo, onRegisterPmbSuccess, isDark }: LandingPageProps) {
  const { toast } = useToast();
  // Toggle between B2B SaaS Promotion vs B2C Campus Demo
  const [promoMode, setPromoMode] = useState<'SAAS' | 'CAMPUS'>('SAAS');
  // Navigation active state
  const [activeTab, setActiveTab] = useState<'home' | 'prodi' | 'simulasi' | 'pmb'>('home');

  // Interactive Calculator states
  const [selectedProdi, setSelectedProdi] = useState<string>('Teknik Informatika');
  const [parentIncome, setParentIncome] = useState<number>(4500000);
  const [scholarshipType, setScholarshipType] = useState<'NONE' | 'ACADEMIC' | 'CHAMPION' | 'FULL_REKTOR'>('NONE');

  // Public PMB Form states
  const [fullName, setFullName] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [schoolOrig, setSchoolOrig] = useState<string>('');
  const [selPath, setSelPath] = useState<string>('Jalur Mandiri');
  const [prodiChoice1, setProdiChoice1] = useState<string>('Teknik Informatika');
  const [prodiChoice2, setProdiChoice2] = useState<string>('Sistem Informasi');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [regSuccess, setRegSuccess] = useState<boolean>(false);
  const [generatedApplicant, setGeneratedApplicant] = useState<PMBApplicant | null>(null);

  // Web settings from API
  const [webSettings, setWebSettings] = useState<Record<string, string>>({});
  const [campusLogo, setCampusLogo] = useState<string>('');

  useEffect(() => {
    api.getWebSettings().then(setWebSettings).catch(() => {});
    api.getCampuses().then(campuses => {
      if (campuses.length > 0) setCampusLogo(campuses[0].logo || '');
    }).catch(() => {});
  }, []);

  // Constants
  const prodis = [
    { name: 'Teknik Informatika', accreditation: 'UNGGUL', duration: '4 Tahun / 8 Semesters', baseFee: 7500000, desc: 'Fokus pada pengembangan software, system architecture, kecerdasan buatan, cloud computing, dan NoSQL database.' },
    { name: 'Sistem Informasi', accreditation: 'UNGGUL', duration: '4 Tahun / 8 Semesters', baseFee: 7500000, desc: 'Menghubungkan bisnis dengan teknologi informasi. Mempelajari rekayasa proses bisnis, analisis data, dan ERP enterprise.' },
    { name: 'Ekonomi Syariah', accreditation: 'A', duration: '4 Tahun / 8 Semesters', baseFee: 5500000, desc: 'Mempelajari sistem ekonomi berbasis hukum Islam, analisis pasar syariah, perbankan islam, dan zakat/wakaf digital.' },
    { name: 'Hukum Keluarga Islam', accreditation: 'B', duration: '4 Tahun / 8 Semesters', baseFee: 5000000, desc: 'Kualifikasi hukum perkawinan Islam, hukum pidana islam, peradilan agama, dan mediasi sengketa sosial.' },
    { name: 'Pendidikan Guru Madrasah Ibtidaiyah', accreditation: 'A', duration: '4 Tahun / 8 Semesters', baseFee: 5000000, desc: 'Calon pendidik tingkat MI/SD yang mengintegrasikan sains modern dengan nilai karakter akhlak Islamiah mulia.' }
  ];

  // Calculate customized tuition fee (UKT)
  const getCalculatedUkt = () => {
    const selected = prodis.find(p => p.name === selectedProdi) || prodis[0];
    let ukt = selected.baseFee;

    // Adjust based on parents income range
    if (parentIncome < 2000000) {
      ukt = ukt * 0.4; // 60% discount for low income
    } else if (parentIncome < 4000000) {
      ukt = ukt * 0.7; // 30% discount
    } else if (parentIncome > 10000000) {
      ukt = ukt * 1.2; // Extra contribution scale
    }

    // Apply scholarship discount
    if (scholarshipType === 'ACADEMIC') {
      ukt = ukt * 0.5; // 50% discount
    } else if (scholarshipType === 'CHAMPION') {
      ukt = ukt * 0.25; // 75% discount
    } else if (scholarshipType === 'FULL_REKTOR') {
      ukt = 0; // 100% Free
    }

    return Math.round(ukt);
  };

  const handlePmbSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !emailAddress || !phoneNumber) {
      toast('Harap isi semua kolom formulir wajib yang bertanda bintang (*).', 'warning');
      return;
    }

    setIsRegistering(true);
    
    try {
      const result = await api.createPMBApplicant({
        name: fullName,
        email: emailAddress.toLowerCase(),
        phone: phoneNumber,
        selectionPath: selPath,
        firstChoice: prodiChoice1,
        secondChoice: prodiChoice2,
        school: schoolOrig,
      });
      
      const newApplicant: PMBApplicant = {
        id: result.id,
        applicantNumber: result.applicantNumber,
        name: result.name,
        email: result.email,
        phone: phoneNumber,
        selectionPath: selPath,
        firstChoice: prodiChoice1,
        secondChoice: prodiChoice2,
        status: 'Registrasi',
        pembayaranStatus: 'Belum Bayar',
        score: undefined
      };

      setGeneratedApplicant(newApplicant);
      setRegSuccess(true);
    } catch (err: any) {
      toast('Gagal mendaftarkan: ' + (err.message || 'Terjadi kesalahan'), 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleEnterSandboxPortal = () => {
    if (generatedApplicant) {
      onRegisterPmbSuccess(generatedApplicant);
    }
  };

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-800'} transition-colors duration-200`}>
      
      {/* PERSISTENT MODE SWITCHER BANNER */}
      <div className={`w-full py-2.5 px-4 text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-3 border-b text-center tracking-wide shadow-sm transition-all duration-300 ${
        isDark 
          ? 'bg-zinc-900 border-zinc-800 text-zinc-200' 
          : 'bg-emerald-50 border-emerald-100 text-emerald-800'
      }`}>
        <div className="flex items-center gap-2 animate-fade-in">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>
            {promoMode === 'SAAS' 
              ? 'Anda sedang melihat HALAMAN PROMOSI B2B SAAS AONE SIAKAD - Solusi ERP untuk Kampus Swasta/Negeri.' 
              : 'Anda sedang melihat PORTAL DEMO MAHASISWA & PMB UNIVERSITAS NUSANTARA DIGITAL (UND).'}
          </span>
        </div>
        <button
          id="btn-switch-landing-mode"
          onClick={() => {
            const nextMode = promoMode === 'SAAS' ? 'CAMPUS' : 'SAAS';
            setPromoMode(nextMode);
          }}
          className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 ${
            isDark 
              ? 'bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700 hover:border-zinc-650' 
              : 'bg-white hover:bg-slate-100 text-emerald-700 border border-emerald-250'
          }`}
        >
          {promoMode === 'SAAS' ? 'Masuk Portal Mahasiswa UND ➔' : 'Lihat Solusi Promosi SaaS ERP ➔'}
        </button>
      </div>

      {promoMode === 'SAAS' ? (
        <>
          {/* Header Navigation Bar for SaaS Mode */}
          <header className={`sticky top-0 z-40 backdrop-blur-md ${isDark ? 'bg-zinc-950/80 border-b border-zinc-900' : 'bg-white/80 border-b border-slate-200'} transition-all`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
              
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center font-black text-white text-lg tracking-tight shadow-md shadow-emerald-600/20">
                  C1
                </div>
                <div>
                  <span className="font-display font-extrabold tracking-tight text-base">AONE SIAKAD</span>
                  <p className="text-[9px] text-emerald-500 font-mono tracking-widest leading-none mt-0.5">SIAKAD & AKREDITASI MODERN</p>
                </div>
              </div>

              <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-zinc-400">
                <a href="#saas-hero" className="px-3 py-2 hover:text-emerald-500 transition-colors">Utama</a>
                <a href="#saas-fitur" className="px-3 py-2 hover:text-emerald-500 transition-colors">Fitur Modul</a>
                <a href="#saas-banding" className="px-3 py-2 hover:text-emerald-500 transition-colors">Perbandingan</a>
                <a href="#saas-kalkulator" className="px-3 py-2 hover:text-emerald-500 transition-colors">Kalkulator ROI</a>
                <a href="#saas-faq" className="px-3 py-2 hover:text-emerald-500 transition-colors">Pertanyaan</a>
              </nav>

              <div className="flex items-center gap-3">
                <button
                  onClick={onLoginClick}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition duration-150 shadow-md shadow-emerald-600/10 flex items-center gap-1.5 animate-pulse"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Mencoba Sandbox ERP
                </button>
              </div>

            </div>
          </header>

          <SaaSMarketingSection
            isDark={isDark}
            onSelectDeveloperDemo={onSelectDeveloperDemo}
            onLoginClick={onLoginClick}
            onSwitchToCampus={() => setPromoMode('CAMPUS')}
          />

          {/* Footer copyright for SaaS */}
          <footer className={`py-12 ${isDark ? 'bg-zinc-950 border-t border-zinc-900' : 'bg-white border-t border-slate-200'} text-xs text-slate-400 text-center transition`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm">C</div>
                <span className="font-bold text-slate-800 dark:text-zinc-300">AONE SIAKAD PLATFORM</span>
              </div>
              <p className="max-w-md mx-auto leading-relaxed">
                Dipercaya oleh puluhan PTS/PTN nasional tingkat kementerian. <br />Sinkronisasi otomatis basis Neo-Feeder PDDIKTI & Akreditasi 9 Standar BAN-PT.
              </p>
              <p className="text-[10px] text-slate-500 font-mono">SaaS Engine v2.4.0-stable | &copy; 2026 AONE PROJECT. All rights reserved.</p>
            </div>
          </footer>
        </>
      ) : (
        <>
          {/* Header Navigation Bar */}
          <header className={`sticky top-0 z-40 backdrop-blur-md ${isDark ? 'bg-zinc-950/80 border-b border-zinc-900' : 'bg-white/80 border-b border-slate-200'} transition-all`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center font-bold text-white text-lg tracking-tight shadow-lg shadow-emerald-600/30 overflow-hidden"
            >
              {campusLogo ? (
                <img src={campusLogo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-white font-bold text-lg">U</span>
              )}
            </motion.div>
            <div>
              <span className="font-display font-extrabold tracking-tight text-base bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">{webSettings.institution_name || 'UNIVERSITAS NUSANTARA DIGITAL'}</span>
              <p className="text-[10px] text-emerald-500 font-mono tracking-widest leading-none mt-0.5">AONE SIAKAD PLATFORM</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => { setActiveTab('home'); const el = document.getElementById('section-hero'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'home' ? (isDark ? 'bg-zinc-900 text-emerald-400' : 'bg-slate-100 text-emerald-600') : 'hover:opacity-80'}`}
            >
              Beranda
            </button>
            <button 
              onClick={() => { setActiveTab('prodi'); const el = document.getElementById('section-prodi'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'prodi' ? (isDark ? 'bg-zinc-900 text-emerald-400' : 'bg-slate-100 text-emerald-600') : 'hover:opacity-80'}`}
            >
              Program Studi
            </button>
            <button 
              onClick={() => { setActiveTab('simulasi'); const el = document.getElementById('section-simulasi'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'simulasi' ? (isDark ? 'bg-zinc-900 text-emerald-400' : 'bg-slate-100 text-emerald-600') : 'hover:opacity-80'}`}
            >
              Simulasi UKT
            </button>
            <button 
              onClick={() => { setActiveTab('pmb'); const el = document.getElementById('section-pmb'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'pmb' ? (isDark ? 'bg-zinc-900 text-emerald-400' : 'bg-slate-100 text-emerald-600') : 'hover:opacity-80'}`}
            >
              Pendaftaran PMB
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onLoginClick}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition duration-150 shadow-md shadow-emerald-600/10 flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Portal ERP Kampus
            </button>
          </div>

        </div>
      </header>

      {/* Sticky PPDB Banner - Promo Penerimaan Mahasiswa Baru */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="sticky top-18 z-30 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
          <motion.div
            animate={{ x: [0, 100, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ x: [0, -80, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl"
          />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
              >
                <GraduationCap className="w-5 h-5 text-white" />
              </motion.div>
              <div className="text-white">
                <h3 className="font-extrabold text-sm font-display tracking-tight leading-tight">
                  {webSettings.ppdb_banner_title || 'PPDB 2026/2027 Telah Dibuka!'}
                </h3>
                <p className="text-[10px] text-white/80 font-medium">
                  {webSettings.ppdb_banner_subtitle || 'Segera daftar — kuota terbatas! Early Bird diskon 50% UKT.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="hidden sm:flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5"
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-green-300"
                />
                <span className="text-[10px] font-bold text-white font-mono">1,240+ Mendaftar</span>
              </motion.div>
              <button
                onClick={() => { const el = document.getElementById('section-pmb'); el?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-4 py-2 bg-white text-emerald-600 rounded-xl text-[11px] font-extrabold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-1.5"
              >
                Daftar Sekarang
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section id="section-hero" className="relative py-16 md:py-24 overflow-hidden border-b border-slate-200 dark:border-zinc-900">
        {/* Animated decorative background elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-3xl -z-10"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -30, 0],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-3xl -z-10"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.03, 0.07, 0.03],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/3 w-[200px] h-[200px] bg-purple-600/5 rounded-full blur-3xl -z-10"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide ${isDark ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/40' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                 Penerimaan Mahasiswa Baru Sektor Digital 2026 Dibuka!
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-slate-900 dark:text-white tracking-tight leading-none">
                {webSettings.hero_title || 'Transformasi <span className="text-emerald-500">Pendidikan Tinggi</span> Terintegrasi Modern.'}
              </h1>

              <p className="text-base sm:text-lg text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                {webSettings.hero_subtitle || ('Selamat datang di ' + (webSettings.institution_name || 'Universitas Nusantara Digital') + '. Universitas pertama di Indonesia yang mengadopsi solusi sistem manajemen terpadu AONE SIAKAD, memberikan transparansi penuh untuk administrasi akademik, portal penjaminan mutu BAN-PT, single sign-on mahasiswa, pelaporan PDDIKTI kilat, dan layanan OJS.')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-3">
                <button
                  onClick={() => { const el = document.getElementById('section-pmb'); el?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition duration-200"
                >
                  Daftar Online PMB 2026
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { const el = document.getElementById('section-simulasi'); el?.scrollIntoView({ behavior: 'smooth' }); }}
                  className={`px-6 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition duration-200 ${isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-850' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                >
                  <Calculator className="w-4 h-4 text-emerald-500" />
                  Simulasi Beasiswa & UKT
                </button>
              </div>

              {/* Trust parameters */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200/60 dark:border-zinc-900 max-w-xl">
                {[
                  { value: 'UNGGUL', label: 'Akreditasi BAN-PT', color: 'text-emerald-500' },
                  { value: '99.4%', label: 'Sinkronisasi PDDIKTI', color: 'text-indigo-500' },
                  { value: '100%', label: 'Lulus Langsung Kerja', color: 'text-cyan-500' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <motion.h4
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      className={`text-2xl font-extrabold ${stat.color} dark:${stat.color}`}
                    >
                      {stat.value}
                    </motion.h4>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

            </div>

            {/* Hero Right Visuals */}
            <div className="lg:col-span-5 relative">
              {/* Animated floating decorative icons */}
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center backdrop-blur-sm z-10"
              >
                <GraduationCap className="w-6 h-6 text-emerald-500" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-3 -left-3 w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center backdrop-blur-sm z-10"
              >
                <Award className="w-5 h-5 text-indigo-500" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute top-1/2 -right-2 w-8 h-8 bg-cyan-500/10 rounded-full flex items-center justify-center backdrop-blur-sm z-10"
              >
                <Star className="w-4 h-4 text-cyan-500" />
              </motion.div>

              <div className={`p-6 rounded-3xl border shadow-xl ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'} space-y-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-8 -left-8 w-16 h-16 border-2 border-emerald-500/10 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-6 -right-6 w-12 h-12 border-2 border-indigo-500/10 rounded-full"
                />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-mono tracking-wider text-slate-400 font-bold uppercase">UND STATUS ADMISI</span>
                  </div>
                  <span className={`text-[10px] uppercase font-mono font-bold text-emerald-500`}>Semester Ganjil 2026/2027</span>
                </div>

                <div className="space-y-4">
                  {/* Status PMB tracking widget */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Kuota Penerimaan Angkatan</span>
                      <span className="text-emerald-500">76% Terpenuhi</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-zinc-850 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[76%]" />
                    </div>
                    <p className="text-[10px] text-slate-400">Total Pendaftar Terverifikasi: 1,240 Calon Mahasiswa</p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-4 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Presentasi Cepat ERP & Akun Demo</h4>
                    <p className="text-xs text-slate-400">Pilih salah satu demo persona untuk instan tes lingkungan AONE SIAKAD:</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectDeveloperDemo('SUPER_ADMIN')}
                        className={`p-2 rounded-xl text-left text-xs transition border hover:border-emerald-500 ${isDark ? 'bg-zinc-850 border-zinc-800' : 'bg-white border-slate-200'}`}
                      >
                        <span className="font-bold block text-slate-800 dark:text-zinc-100">Super Admin</span>
                        <span className="text-[9px] text-slate-400">Infrastruktur Multi-tenant</span>
                      </button>
                      <button
                        onClick={() => onSelectDeveloperDemo('AKADEMIK')}
                        className={`p-2 rounded-xl text-left text-xs transition border hover:border-emerald-500 ${isDark ? 'bg-zinc-850 border-zinc-800' : 'bg-white border-slate-200'}`}
                      >
                        <span className="font-bold block text-slate-800 dark:text-zinc-100">Akademik Kampus</span>
                        <span className="text-[9px] text-slate-400">Verifikasi KRS, Kurikulum</span>
                      </button>
                      <button
                        onClick={() => onSelectDeveloperDemo('MAHASISWA')}
                        className={`p-2 rounded-xl text-left text-xs transition border hover:border-emerald-500 ${isDark ? 'bg-zinc-850 border-zinc-800' : 'bg-white border-slate-200'}`}
                      >
                        <span className="font-bold block text-slate-800 dark:text-zinc-100">Mahasiswa</span>
                        <span className="text-[9px] text-slate-400">KRS, KHS, Pembayaran UKT</span>
                      </button>
                      <button
                        onClick={() => onSelectDeveloperDemo('PMB_APPLICANT')}
                        className={`p-2 rounded-xl text-left text-xs transition border hover:border-emerald-500 ${isDark ? 'bg-zinc-850 border-zinc-800' : 'bg-white border-slate-200'}`}
                      >
                        <span className="font-bold block text-slate-800 dark:text-zinc-100">Calon Pendaftar</span>
                        <span className="text-[9px] text-slate-400">Sertifikat SK, Tahapan PMB</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Program Studi (Prodi) List section */}
      <section id="section-prodi" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-zinc-900">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-emerald-500 text-xs font-bold font-mono tracking-widest uppercase">PROGRAM UNGGULAN</span>
          <h2 className="text-3xl font-bold font-display tracking-tight">Kualifikasi Akademik Kelas Dunia</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Rancangan kurikulum adaptif industri berlandaskan pengajaran teknologi mutakhir untuk karir global yang sukses.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prodis.map((p, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              key={idx}
              className={`p-6 rounded-2xl border transition hover:shadow-md hover:-translate-y-1 hover:border-emerald-500/30 duration-200 ${isDark ? 'bg-zinc-900 border-zinc-900' : 'bg-white border-slate-200'} flex flex-col justify-between`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${p.accreditation === 'UNGGUL' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'}`}>
                    AKREDITASI: {p.accreditation}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">{p.name}</h3>
                  <p className="text-[11px] font-mono text-emerald-500 font-semibold mt-0.5">{p.duration}</p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Estimasi UKT Awal:</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">Rp {p.baseFee.toLocaleString('id-ID')}/Smt</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Tuition Fees (UKT) Calculator section */}
      <section id="section-simulasi" className="py-16 bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Calculator Left Description */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5 space-y-6"
            >
              <span className="text-emerald-500 text-xs font-bold font-mono tracking-widest uppercase">SIMULASI BIAYA & BEASISWA</span>
              <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">Dapatkan Subsidi Beasiswa Langsung Berdasarkan Kondisi Anda</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                Kami berkomitmen menciptakan inklusivitas pendidikan digital. AONE SIAKAD menyinkronisasikan 
                biaya Uang Kuliah Tunggal (UKT) otomatis sesuai kemampuan ekonomi pendaftar atau status prestasi akademik. 
                Sesuaikan formulir simulasi interaktif di samping untuk melihat perkiraan kontribusi real-time Anda.
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-emerald-500/10 text-emerald-500 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Kalkulasi Subsidi Otomatis</h4>
                    <p className="text-[11px] text-slate-400">Besaran ukt disesuaikan proporsional berdasarkan data finansial secara transparan.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-emerald-500/10 text-emerald-500 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Diskon Beasiswa Jalur Prestasi</h4>
                    <p className="text-[11px] text-slate-400">Tersedia potongan nominal 50% hingga 100% bebas biaya kuliah bagi berprestasi.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Calculator Right Form and Live Result */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-7"
            >
              <div className={`p-6 md:p-8 rounded-3xl border shadow-md ${isDark ? 'bg-zinc-900 border-zinc-900' : 'bg-white border-slate-200'} grid grid-cols-1 md:grid-cols-2 gap-8`}>
                
                {/* Simulator inputs */}
                <div className="space-y-5">
                  <h3 className="font-semibold text-sm border-b pb-2 tracking-tight">Pengaturan Parameter</h3>
                  
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Pilih Program Studi</label>
                    <select
                      value={selectedProdi}
                      onChange={(e) => setSelectedProdi(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:border-emerald-500 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}
                    >
                      {prodis.map((p, idx) => (
                        <option key={idx} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pendapatan Orang Tua/Wali</label>
                      <span className="text-xs font-bold text-emerald-500">Rp {parentIncome.toLocaleString('id-ID')}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1000000" 
                      max="20000000" 
                      step="500000"
                      value={parentIncome}
                      onChange={(e) => setParentIncome(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                      <span>Rp 1 Juta</span>
                      <span>Rp 10 Juta</span>
                      <span>Rp 20 Juta+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Kategori Jalur Beasiswa</label>
                    <div className="space-y-1.5">
                      {[
                        { key: 'NONE', label: 'Reguler (Tanpa Beasiswa)' },
                        { key: 'ACADEMIC', label: 'Beasiswa Akademis Rapor (Diskon 50%)' },
                        { key: 'CHAMPION', label: 'Beasiswa Non-Akademik / Seni (Diskon 75%)' },
                        { key: 'FULL_REKTOR', label: 'Beasiswa Penuh Rektor (Gratis 100%)' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setScholarshipType(item.key as any)}
                          className={`w-full p-2 text-left rounded-lg text-xs font-semibold border transition flex justify-between items-center ${scholarshipType === item.key ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500 dark:text-emerald-400' : 'border-slate-200 dark:border-zinc-800'}`}
                        >
                          <span>{item.label}</span>
                          {scholarshipType === item.key && <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Simulated Output display */}
                <div className={`p-6 rounded-2xl bg-slate-950 text-white flex flex-col justify-between border ${isDark ? 'border-zinc-800' : 'border-slate-800'}`}>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">PROPOSAL SIMULASI SELESAI</span>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Jurusan Impian</p>
                      <h4 className="font-bold text-sm text-slate-100">{selectedProdi}</h4>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Biaya Kuliah Normal</span>
                        <span>Rp {(prodis.find(p => p.name === selectedProdi)?.baseFee || 7500000).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Penyesuaian Subsidi</span>
                        <span className="text-emerald-400">
                          {parentIncome < 2000000 ? '- 60%' : parentIncome < 4000000 ? '- 30%' : parentIncome > 10000000 ? '+ 20%' : 'Normal'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Diskon Beasiswa</span>
                        <span className="text-emerald-400">
                          {scholarshipType === 'ACADEMIC' ? '- 50%' : scholarshipType === 'CHAMPION' ? '- 75%' : scholarshipType === 'FULL_REKTOR' ? '- 100% (FULL)' : '0%'}
                        </span>
                      </div>
                    </div>

                  </div>

                  <div className="pt-6 border-t border-slate-800 space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Simulasi UKT Anda per Semester:</p>
                      <h3 className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                        Rp {getCalculatedUkt().toLocaleString('id-ID')}
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        const el = document.getElementById('section-pmb');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      Gunakan Beasiswa Ini Dalam Pendaftaran
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* PMB Direct Admission Application section */}
      <section id="section-pmb" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto space-y-2 mb-12"
        >
          <span className="text-emerald-500 text-xs font-bold font-mono tracking-widest uppercase">FORM PENDAFTARAN</span>
          <h2 className="text-3xl font-bold font-display tracking-tight">Formulir Pendaftaran Mahasiswa Baru 2026</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Isi formulir pendaftaran administratif di bawah ini. Selesaikan registrasi untuk mendapatkan Akun Seleksi dan SK Kelulusan Anda secara real-time.</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {!regSuccess ? (
              <motion.div
                key="form-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: -15 }}
                className={`p-6 md:p-10 rounded-3xl border shadow-lg ${isDark ? 'bg-zinc-900 border-zinc-900' : 'bg-white border-slate-200'}`}
              >
                <form onSubmit={handlePmbSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 text-slate-500 dark:text-zinc-400">Nama Lengkap Sesuai KTP/Ijazah <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none transition ${isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500' : 'bg-white border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'}`}
                        placeholder="contoh: Bayu Nugroho"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 text-slate-500 dark:text-zinc-400">Alamat Email Aktif <span className="text-rose-500">*</span></label>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none transition ${isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500' : 'bg-white border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'}`}
                        placeholder="contoh: bayu.nugroho@gmail.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 text-slate-500 dark:text-zinc-400">Nomor Handphone (WhatsApp) <span className="text-rose-500">*</span></label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none transition ${isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500' : 'bg-white border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'}`}
                        placeholder="contoh: 0812XXXXXXXX"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 text-slate-500 dark:text-zinc-400">Asal Sekolah Menengah (SMA/SMK/MA)</label>
                      <input
                        type="text"
                        value={schoolOrig}
                        onChange={(e) => setSchoolOrig(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none transition ${isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500' : 'bg-white border-slate-200 focus:border-emerald-600'}`}
                        placeholder="contoh: MAN 1 Jakarta"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 text-slate-500 dark:text-zinc-400">Jalur Pendaftaran</label>
                      <select
                        value={selPath}
                        onChange={(e) => setSelPath(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:border-emerald-500 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'}`}
                      >
                        <option value="Jalur Mandiri">Jalur Mandiri</option>
                        <option value="Jalur Reguler">Jalur Reguler</option>
                        <option value="Jalur Beasiswa Berprestasi">Jalur Beasiswa Rapor Akademis</option>
                        <option value="Beasiswa Juara Olahraga">Beasiswa Non-Akademik / Seni</option>
                        <option value="Beasiswa Penuh Rektor">Beasiswa Penuh Rektor (100%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 text-slate-500 dark:text-zinc-400">Pilihan Prodi 1</label>
                      <select
                        value={prodiChoice1}
                        onChange={(e) => setProdiChoice1(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:border-emerald-500 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'}`}
                      >
                        {prodis.map((p, idx) => (
                          <option key={idx} value={p.name} disabled={p.name === prodiChoice2}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 text-slate-500 dark:text-zinc-400">Pilihan Prodi 2</label>
                      <select
                        value={prodiChoice2}
                        onChange={(e) => setProdiChoice2(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:border-emerald-500 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'}`}
                      >
                        {prodis.map((p, idx) => (
                          <option key={idx} value={p.name} disabled={p.name === prodiChoice1}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
                    >
                      {isRegistering ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Memproses Pendaftaran Seleksi ERP...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Kirim Formulir Pendaftaran & Buat Akun Seleksi
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 leading-relaxed max-w-lg mx-auto">
                      Dengan mengirimkan formulir ini, Anda menyetujui bahwa data kualifikasi akan diperiksa dan disaring oleh panitia admisi Universitas Nusantara Digital menggunakan dashboard AONE SIAKAD.
                    </p>
                  </div>

                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 md:p-10 rounded-3xl border shadow-xl ${isDark ? 'bg-zinc-900 border-zinc-900' : 'bg-white border-slate-200'} text-center space-y-6 max-w-2xl mx-auto`}
              >
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">Pendaftaran Berhasil Disubmit Terkirim!</h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">
                    Sistem AONE SIAKAD otomatis melahirkan berkas pendaftaran calon mahasiswa baru atas nama:
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border text-left max-w-sm mx-auto space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">No. Registrasi:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{generatedApplicant?.applicantNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nama Pendaftar:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{generatedApplicant?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jalur Direkrut:</span>
                    <span className="font-bold text-emerald-500">{generatedApplicant?.selectionPath}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pilihan 1 Smt 1:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{generatedApplicant?.firstChoice}</span>
                  </div>
                </div>

                <div className="bg-emerald-500/5 hover:bg-emerald-500/10 transition p-4 rounded-xl border border-emerald-500/20 max-w-xl mx-auto text-xs text-slate-500 dark:text-zinc-300 leading-relaxed">
                  📢 <strong>PRESENTASI SANDBOX LIVE</strong>: Akun Anda telah langsung dimasukkan ke database sistem. 
                  Sekarang Anda dapat membuka portal pendaftar untuk melengkapi berkas, melakukan simulasi ujian potensi akademik, wawancara, 
                  hingga mengunduh berkas kelulusan final dengan NIM resmi terpapar!
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-sm mx-auto">
                  <button
                    onClick={handleEnterSandboxPortal}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    Buka Portal PMB Anda
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setRegSuccess(false); setFullName(''); setEmailAddress(''); setPhoneNumber(''); }}
                    className={`px-4 py-3 rounded-xl text-xs font-bold border transition duration-150 ${isDark ? 'bg-zinc-850 border-zinc-800 hover:bg-zinc-800' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                  >
                    Daftarkan Lainnya
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer copyright */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className={`py-12 ${isDark ? 'bg-zinc-950 border-t border-zinc-900' : 'bg-white border-t border-slate-200'} text-xs text-slate-400 text-center transition`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
              className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm overflow-hidden"
            >
              {campusLogo ? (
                <img src={campusLogo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-white font-bold text-xs">U</span>
              )}
            </motion.div>
            <span className="font-bold text-slate-800 dark:text-zinc-300">{webSettings.institution_name || 'UNIVERSITAS NUSANTARA DIGITAL'}</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed">
            {webSettings.footer_text || 'Platform AONE SIAKAD dikembangkan oleh AONE PROJECT. <br />Integrasi data PDDIKTI, E-Journal OJS, LMS Moodle Terstandarisasi BAN-PT.'}
          </p>
          <p className="text-[10px] text-slate-500 font-mono">v2.4.0-stable | &copy; 2026 AONE PROJECT. All rights reserved.</p>
        </div>
      </motion.footer>
        </>
      )}
    </div>
  );
}
