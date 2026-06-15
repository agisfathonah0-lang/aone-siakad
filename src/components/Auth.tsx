import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Shield, BookOpen, CreditCard, Award, GraduationCap, UserCheck, Lock, Mail, KeyRound, AlertCircle, Sparkles, Server, Check } from 'lucide-react';
import { UserRole } from '../types';
import { api } from '../api';

interface AuthProps {
  onLoginSuccess: (user: { id?: string; name: string; email: string; role: UserRole; nim_nip?: string; prodi?: string }) => void;
  isDark: boolean;
  onBackToLanding?: () => void;
}

export default function Auth({ onLoginSuccess, isDark, onBackToLanding }: AuthProps) {
  const [step, setStep] = useState<'LOGIN' | 'FORGOT' | 'RESET' | 'MFA' | 'ROLE_SELECT'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState<UserRole | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Demo accounts
  const demoAccounts = [
{ name: 'Super Admin', email: 'super_admin@aone-project.id', pass: 'admin123', role: 'SUPER_ADMIN' as UserRole, desc: 'Akses penuh ke semua penyewa, sistem, & infrastruktur', icon: Server },
  { name: 'Admin Akademik', email: 'akademik@aone-project.id', pass: 'admin123', role: 'AKADEMIK' as UserRole, desc: 'Kelola data mahasiswa, dosen, kurikulum, & jadwal', icon: BookOpen },
  { name: 'Admin Keuangan', email: 'keuangan@aone-project.id', pass: 'admin123', role: 'KEUANGAN' as UserRole, desc: 'Kelola billing UKT, beasiswa, & laporan pendapatan', icon: CreditCard },
  { name: 'Dosen Utama', email: 'dosen@aone-project.id', pass: 'admin123', role: 'DOSEN' as UserRole, desc: 'Akses jadwal, presensi, input nilai, & Kelola LMS', icon: Award },
  { name: 'Mahasiswa', email: 'mahasiswa@aone-project.id', pass: 'admin123', role: 'MAHASISWA' as UserRole, desc: 'KRS Online, KHS, Transkrip Akademik, & portal LMS', icon: GraduationCap }
  ];

  const handleDemoClick = (account: typeof demoAccounts[0]) => {
    setEmail(account.email);
    setPassword(account.pass);
    setSelectedRoleForLogin(account.role);
    setErrorMessage('');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Silakan lengkapi alamat email Anda.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage('Kode verifikasi reset sandi telah dikirim ke email Anda.');
      setStep('RESET');
      setErrorMessage('');
    }, 1200);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage('Sandi baru tidak boleh kosong.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage('Kata sandi berhasil diatur ulang. Silakan masuk kembali.');
      setStep('LOGIN');
      setErrorMessage('');
    }, 1200);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Email dan password wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const result = await api.login(email, password);
      api.setToken(result.token);
      setSelectedRoleForLogin(result.user.role as UserRole);
      setStep('MFA');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login gagal. Periksa email dan password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = mfaCode.join('');
    if (code.length < 6) {
      setErrorMessage('Harap masukkan 6 digit kode keamanan Google Authenticator.');
      return;
    }
    try {
      const user = await api.getMe();
      onLoginSuccess({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        nim_nip: user.nim_nip || undefined,
        prodi: user.prodi || undefined,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat profil pengguna.');
    }
  };

  const handleMfaChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newCode = [...mfaCode];
    newCode[index] = val;
    setMfaCode(newCode);

    // Auto focus next input
    if (val !== '' && index < 5) {
      const nextInput = document.getElementById(`mfa-${index + 1}`);
      nextInput?.focus();
    }
  };

  const autoFillCode = () => {
    setMfaCode(['8', '4', '2', '9', '1', '0']);
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Decorative Branding Section */}
      <div className={`flex-1 flex flex-col justify-between p-8 md:p-16 relative overflow-hidden bg-gradient-to-br ${isDark ? 'from-primary-900/50 via-zinc-900 to-black border-r border-zinc-800' : 'from-primary-900 via-primary-800 to-indigo-900 text-white'}`}>
        
        {/* Abstract background graphics */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-emerald-500 rounded-xl shadow-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-display font-bold tracking-wider text-xl">AONE SIAKAD</span>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-300'}`}>by AONE PROJECT</p>
          </div>
        </div>

        <div className="my-auto py-12 relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 ${isDark ? 'bg-zinc-800 text-emerald-400' : 'bg-emerald-500/20 text-emerald-300'}`}>
              <Sparkles className="w-3.5 h-3.5" />
              SaaS Terdaftar di Kemenristek & PDDIKTI RI
            </div>
            <h1 className="font-display font-bold text-3xl md:text-5xl leading-tight mb-4 tracking-tight">
              Satu Sistem Mandiri untuk Seluruh Ekosistem Kampus.
            </h1>
            <p className={`text-base leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-200'}`}>
              Platform ERP komprehensif bagi rektorat, administrasi akademik, billing keuangan, dosen, mahasiswa, hingga ikatan alumni dalam satu single-tenant arsitektur cloud.
            </p>
          </motion.div>

          {/* Testimonial Box */}
          <div className={`mt-12 p-5 rounded-2xl border ${isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white/10 border-white/10 backdrop-blur-md'}`}>
            <p className="text-sm italic">
              "AONE SIAKAD meningkatkan skor akreditasi institusi kami menjadi UNGGUL dan mempercepat pelaporan PDDIKTI dari mingguan menjadi real-time sekali klik."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold">
                UN
              </div>
              <div>
                <h4 className="text-xs font-semibold font-display">Dr. Ir. H. Hermawan, M.T.</h4>
                <p className="text-[10px] text-slate-300">Rektor Universitas Nusantara Digital (Klien AONE PROJECT)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs relative z-10 flex gap-6 text-slate-400 dark:text-zinc-500">
          <span>&copy; 2026 AONE PROJECT</span>
          <a href="#" className="hover:underline">Syarat & Ketentuan</a>
          <a href="#" className="hover:underline">Kebijakan Privasi</a>
        </div>
      </div>

      {/* Auth Card Interactive Section */}
      <div className="w-full md:w-[540px] flex flex-col justify-center p-6 md:p-12 relative z-10 shadow-2xl overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline mb-6 cursor-pointer"
            >
              &larr; Kembali ke Landing Page Portal
            </button>
          )}
          
          <AnimatePresence mode="wait">
            
            {/* LOGIN STATE */}
            {step === 'LOGIN' && (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-display tracking-tight">Selamat Datang Kembali</h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">
                    Masuk ke platform ERP terintegrasi universitas Anda.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg text-xs flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-xs flex gap-2 items-start">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 text-slate-500 dark:text-zinc-400">Alamat Email Kampus</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-emerald-500 text-white' : 'bg-white border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'}`}
                        placeholder="contoh: akademik@aone-project.id"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400">Kata Sandi</label>
                      <button
                        type="button"
                        onClick={() => { setStep('FORGOT'); setErrorMessage(''); }}
                        className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        Lupa Sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-emerald-500 text-white' : 'bg-white border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'}`}
                        placeholder="Masukkan kata sandi"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md active:translate-y-px transition duration-150 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Memproses Authentifikasi...' : 'Masuk Sistem'}
                  </button>
                </form>

                {/* Switch to PMB portal helper */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Calon Mahasiswa Baru?{' '}
                    <button
                      onClick={() => {
                        onLoginSuccess({
                          name: 'Calon Mahasiswa Baru',
                          email: 'applicant@gmail.com',
                          role: 'PMB_APPLICANT'
                        });
                      }}
                      className="text-emerald-500 font-bold hover:underline"
                    >
                      Buka Portal PMB &rarr;
                    </button>
                  </p>
                </div>

                {/* Demonstration Emulator Options */}
                <div className="pt-6 border-t border-slate-200/60 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 mb-3">
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Presentasi Penjualan & Demo Persona:</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-4 leading-relaxed">
                    Klik salah satu akun demo di bawah ini untuk mengisi formulir otomatis, lalu klik <strong>Masuk Sistem</strong> untuk memproses OTP demo.
                  </p>
                  
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {demoAccounts.map((account) => {
                      const Icon = account.icon;
                      const isSelected = email.toLowerCase() === account.email.toLowerCase();
                      return (
                        <button
                          key={account.role}
                          type="button"
                          onClick={() => handleDemoClick(account)}
                          className={`w-full text-left p-3 rounded-xl border transition flex items-center gap-3 ${isSelected ? 'border-emerald-600 bg-emerald-50/10 dark:bg-zinc-800/80 dark:border-emerald-500' : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800/40'}`}
                        >
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold">{account.name}</h4>
                              <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500">{account.email}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">{account.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* FORGOT PASSWORD */}
            {step === 'FORGOT' && (
              <motion.div
                key="forgot-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-display tracking-tight">Lupa Kata Sandi?</h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">
                    Masukkan email institusi kampus Anda. Kami akan mengirimkan 6 digit kode keamanan untuk mengatur ulang sandi.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg text-xs flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 text-slate-500 dark:text-zinc-400">Email Kampus</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-emerald-500 text-white' : 'bg-white border-slate-200 focus:border-emerald-600'}`}
                        placeholder="contoh: dosen@aone-project.id"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
                  >
                    {isSubmitting ? 'Mengirim Kode Keamanan...' : 'Kirim Kode Verifikasi'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('LOGIN'); setErrorMessage(''); }}
                    className="w-full py-2 bg-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white text-xs font-semibold text-center hover:underline"
                  >
                    Kembali ke Login
                  </button>
                </form>
              </motion.div>
            )}

            {/* RESET PASSWORD */}
            {step === 'RESET' && (
              <motion.div
                key="reset-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-display tracking-tight">Atur Ulang Sandi</h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 text-emerald-600 font-medium">
                    Kode verifikasi telah berhasil terkirim. Silakan atur kata sandi baru.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg text-xs flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 text-slate-500 dark:text-zinc-400">6 Digit OTP Verifikasi</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-emerald-500 text-white' : 'bg-white border-slate-200'}`}
                        placeholder="Masukkan Pin OTP"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 text-slate-500 dark:text-zinc-400">Kata Sandi Baru</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-emerald-500' : 'bg-white border-slate-200'}`}
                        placeholder="Sandi baru Anda minimal 8 karakter"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
                  >
                    Simpan Sandi Baru
                  </button>
                </form>
              </motion.div>
            )}

            {/* TWO FACTOR AUTHENTICATION (MFA) */}
            {step === 'MFA' && (
              <motion.div
                key="mfa-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-zinc-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold font-display tracking-tight">Verifikasi Dua Langkah</h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Untuk alasan keamanan akun di luar jaringan internal kampus, silakan masukkan 6 digit kode dari <strong>Google Authenticator</strong> Anda.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg text-xs flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleMfaSubmit} className="space-y-6">
                  <div className="flex justify-between gap-3">
                    {mfaCode.map((digit, i) => (
                      <input
                        key={i}
                        id={`mfa-${i}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleMfaChange(i, e.target.value)}
                        className={`w-12 h-14 text-center rounded-2xl border text-xl font-bold font-mono outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40 ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200'}`}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md transition"
                    >
                      {isSubmitting ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
                    </button>

                    <button
                      type="button"
                      onClick={autoFillCode}
                      className="text-xs text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold self-center hover:underline"
                    >
                      Gunakan OTP Demo Otomatis (842910)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setStep('LOGIN'); setErrorMessage(''); }}
                    className="w-full py-2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-semibold text-center hover:underline"
                  >
                    Kembali ke Login
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
