import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Shield, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function VendorLoginPage() {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, true);
      navigate('/vendor');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen overflow-hidden relative flex items-center justify-center p-4 transition-colors ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
      {isDark && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-black to-emerald-950/20" />
          <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl -top-20 -right-20 animate-float-slow" />
        </>
      )}

      <div className="w-full max-w-sm relative z-10">
        <button onClick={toggle} className={`absolute -top-14 right-0 p-2 rounded-xl transition-all ${isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="AONE" className="h-10 w-auto mx-auto mb-3" />
          <h1 className={`text-2xl font-display font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            AONE <span className="text-emerald-500">SIAKAD</span>
            <span className="text-slate-400 mx-1">/</span>
            Vendor<span className="text-emerald-500">Panel</span>
          </h1>
          <p className={`text-sm mt-1.5 font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Manajemen platform SaaS AONE SIAKAD</p>
        </div>

        <form onSubmit={handleSubmit} className={`rounded-2xl p-6 space-y-4 ${isDark ? 'dark-glassmorphism' : 'bg-white shadow-xl ring-1 ring-slate-200/50'}`}>
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Email Vendor</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400 ${isDark ? 'bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20' : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'}`}
              placeholder="Masukkan email vendor" />
          </div>

          <div>
            <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400 ${isDark ? 'bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20' : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'}`}
              placeholder="Masukkan password" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20">
            <LogIn size={16} />
            {loading ? 'Memproses...' : 'Masuk ke Vendor Panel'}
          </button>

   
        </form>

        <div className={`mt-6 text-center ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
        </div>
      </div>
    </div>
  );
}