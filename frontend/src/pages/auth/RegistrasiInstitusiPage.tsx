import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { post } from '../../api/client';
import { Building2, CheckCircle, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function RegistrasiInstitusiPage() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '', slug: '', nama_pt: '',
    adminNama: '', adminEmail: '', adminPassword: '', adminConfirm: '',
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => field === 'slug'
      ? { ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }
      : { ...f, [field]: e.target.value });

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.adminPassword !== form.adminConfirm) {
      setError('Password konfirmasi tidak cocok');
      return;
    }

    setLoading(true);
    try {
      await post('/auth/vendor/register', {
        slug: form.slug, name: form.name, nama_pt: form.nama_pt,
        adminEmail: form.adminEmail, adminPassword: form.adminPassword,
        adminNama: form.adminNama,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
        {isDark && <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-black to-emerald-950/20" />}
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className={`text-xl font-display font-extrabold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Registrasi Berhasil!</h2>
          <p className={`text-sm mb-6 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Institusi <strong>{form.name}</strong> berhasil didaftarkan. Akun akan aktif setelah pembayaran dikonfirmasi oleh tim AONE. Anda akan menerima email notifikasi ke <strong>{form.adminEmail}</strong>.
          </p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen overflow-hidden relative flex items-center justify-center p-4 transition-colors ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
      {isDark && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-black to-emerald-950/20" />
          <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl -top-20 -right-20 animate-float-slow" />
        </>
      )}

      <div className="w-full max-w-md relative z-10">
        <button onClick={toggle} className={`absolute -top-14 right-0 p-2 rounded-xl transition-all ${isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="text-center mb-6">
          <img src="/logo.png" alt="AONE SIAKAD" className="h-10 w-auto mx-auto mb-3" />
          <h1 className={`text-2xl font-display font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Daftarkan <span className="text-emerald-500">Institusi</span>
          </h1>
          <p className={`text-sm mt-1 font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Mulai gunakan AONE SIAKAD untuk kampus Anda</p>
        </div>

        <div className={`rounded-2xl p-6 ${isDark ? 'dark-glassmorphism' : 'bg-white shadow-xl ring-1 ring-slate-200/50'}`}>
          <div className="flex gap-1.5 mb-5">
            {[1, 2].map(s => (
              <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${step >= s ? 'bg-emerald-500' : isDark ? 'bg-zinc-700' : 'bg-slate-200'}`} />
            ))}
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />{error}
              </div>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Nama Institusi *</label>
                  <input value={form.name} onChange={update('name')} required className={`input-field ${isDark ? 'dark' : ''}`} placeholder="Universitas Contoh" />
                </div>
                <div>
                  <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Slug *</label>
                  <input value={form.slug} onChange={update('slug')} required className={`input-field ${isDark ? 'dark' : ''}`} placeholder="universitas-contoh" />
                  <p className={`text-[10px] mt-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Digunakan untuk URL kampus: aone-siakad.com/{form.slug || 'slug'}</p>
                </div>
                <div>
                  <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Nama Perguruan Tinggi *</label>
                  <input value={form.nama_pt} onChange={update('nama_pt')} required className={`input-field ${isDark ? 'dark' : ''}`} placeholder="Universitas Contoh (PT)" />
                </div>
                <button type="button" onClick={() => setStep(2)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm">
                  Selanjutnya
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="border-b border-slate-200 dark:border-zinc-700/50 pb-3 mb-1">
                  <p className={`text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Akun Admin</p>
                  <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Kredensial untuk login pertama ke dashboard kampus</p>
                </div>
                <div>
                  <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Nama Lengkap Admin *</label>
                  <input value={form.adminNama} onChange={update('adminNama')} required className={`input-field ${isDark ? 'dark' : ''}`} placeholder="Admin Utama" />
                </div>
                <div>
                  <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Email Admin *</label>
                  <input type="email" value={form.adminEmail} onChange={update('adminEmail')} required className={`input-field ${isDark ? 'dark' : ''}`} placeholder="admin@kampus.ac.id" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Password *</label>
                    <input type="password" value={form.adminPassword} onChange={update('adminPassword')} required minLength={8} className={`input-field ${isDark ? 'dark' : ''}`} placeholder="Min 8 karakter" />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Konfirmasi *</label>
                    <input type="password" value={form.adminConfirm} onChange={update('adminConfirm')} required minLength={8} className={`input-field ${isDark ? 'dark' : ''}`} placeholder="Ulangi password" />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setStep(1)} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isDark ? 'bg-white/5 text-zinc-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    Kembali
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm">
                    {loading ? 'Memproses...' : 'Daftarkan Institusi'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <div className={`mt-5 text-center ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
          <Link to="/" className="text-xs hover:text-emerald-500 transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft size={13} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
