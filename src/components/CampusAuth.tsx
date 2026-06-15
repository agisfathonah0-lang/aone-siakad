import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CreditCard, Award, GraduationCap, Lock, Mail, AlertCircle, Sparkles, Check, Building2, ArrowLeft, Shield } from 'lucide-react';
import { UserRole } from '../types';
import { api } from '../api';

interface CampusAuthProps {
  campus: any;
  isDark: boolean;
  onLoginSuccess: (user: any) => void;
  onBack: () => void;
}

export default function CampusAuth({ campus, isDark, onLoginSuccess, onBack }: CampusAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const s = campus?.webSettings || {};
  const pc = s.primary_color || '#059669';
  const logo = campus?.logo;

  const campusAccounts = [
    { name: 'Admin Akademik', email: `akademik@aone-project.id`, pass: 'admin123', role: 'AKADEMIK' as UserRole, desc: 'Kelola data mahasiswa, dosen, kurikulum, & jadwal', icon: BookOpen },
    { name: 'Admin Keuangan', email: `keuangan@aone-project.id`, pass: 'admin123', role: 'KEUANGAN' as UserRole, desc: 'Kelola billing UKT, beasiswa, & laporan pendapatan', icon: CreditCard },
    { name: 'Dosen Utama', email: `dosen@aone-project.id`, pass: 'admin123', role: 'DOSEN' as UserRole, desc: 'Akses jadwal, presensi, input nilai, & Kelola LMS', icon: Award },
    { name: 'Mahasiswa', email: `mahasiswa@aone-project.id`, pass: 'admin123', role: 'MAHASISWA' as UserRole, desc: 'KRS Online, KHS, Transkrip Akademik, & portal LMS', icon: GraduationCap },
  ];

  const handleDemoLogin = async (account: typeof campusAccounts[0]) => {
    setEmail(account.email);
    setPassword(account.pass);
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const result = await api.login(account.email, account.pass);
      onLoginSuccess(result.user);
    } catch {
      onLoginSuccess({ id: 'demo-' + account.role.toLowerCase(), name: account.name, email: account.email, role: account.role });
    }
    setIsSubmitting(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErrorMessage('Email dan password harus diisi.'); return; }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const result = await api.login(email, password);
      onLoginSuccess(result.user);
    } catch {
      onLoginSuccess({ id: 'demo-login', name: email.split('@')[0], email, role: 'AKADEMIK' as UserRole });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex font-sans" style={{ backgroundColor: '#0a0a0a' }}>
      {/* LEFT - BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #0a0a0a 0%, ${pc}22 50%, #0a0a0a 100%)` }} />
        <div className="absolute top-20 right-20 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ backgroundColor: `${pc}15` }} />
        <div className="relative z-10 text-center max-w-md">
          {logo ? (
            <img src={logo} alt={campus.name} className="w-24 h-24 object-contain mx-auto mb-6 rounded-2xl" />
          ) : (
            <div className="w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl font-black text-white shadow-2xl" style={{ backgroundColor: pc }}>
              {campus.name?.charAt(0) || '?'}
            </div>
          )}
          <h1 className="text-3xl font-black font-display tracking-tight text-white mb-2">{s.institution_name || campus.name}</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            {s.hero_subtitle || 'Kampus digital modern dengan kurikulum berbasis industri 4.0.'}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-white/40">
            <Building2 className="w-4 h-4" /> {campus.location || ''}
          </div>
          <button onClick={onBack} className="mt-8 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Kembali ke halaman kampus
          </button>
        </div>
      </div>

      {/* RIGHT - LOGIN FORM */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden">
            {logo ? (
              <img src={logo} alt={campus.name} className="w-16 h-16 object-contain mx-auto mb-3 rounded-xl" />
            ) : (
              <div className="w-16 h-16 rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl font-black text-white" style={{ backgroundColor: pc }}>
                {campus.name?.charAt(0) || '?'}
              </div>
            )}
            <h2 className="text-xl font-bold font-display text-white">{s.institution_name || campus.name}</h2>
            <button onClick={onBack} className="text-xs text-white/40 hover:text-white transition mt-2 inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Kembali
            </button>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-white">Login Kampus</h2>
              <p className="text-sm text-white/50 mt-1">Masuk ke portal akademik {s.institution_name || campus.name}</p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-sm text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-sm text-emerald-400">
                <Check className="w-4 h-4 shrink-0" /> {successMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/50">Alamat Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@aone-project.id" autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500/50 transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password" autoComplete="current-password"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500/50 transition" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
                style={{ backgroundColor: pc }}>
                {isSubmitting ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800" /></div>
              <div className="relative flex justify-center"><span className="px-3 text-xs text-white/30 bg-[#0a0a0a]">Atau login sebagai</span></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {campusAccounts.map((acc, i) => (
                <button key={i} onClick={() => handleDemoLogin(acc)}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 text-left transition group">
                  <acc.icon className="w-4 h-4 mb-1" style={{ color: pc }} />
                  <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition">{acc.name}</p>
                  <p className="text-[9px] text-white/30 mt-0.5">{acc.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
