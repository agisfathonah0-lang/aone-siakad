import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, DollarSign, GraduationCap, Loader2, UserPlus, Plus, FileSpreadsheet, Printer, CalendarPlus, Library, BellRing, TrendingUp, ArrowRight, Sparkles, School, UserCheck, BookMarked } from 'lucide-react';

const quickActions = [
  { label: 'Tambah Mahasiswa', icon: UserPlus, path: '/mahasiswa', color: 'from-emerald-500 to-emerald-600' },
  { label: 'Input Nilai', icon: FileSpreadsheet, path: '/nilai', color: 'from-indigo-500 to-indigo-600' },
  { label: 'Buat Jadwal', icon: CalendarPlus, path: '/jadwal', color: 'from-amber-500 to-amber-600' },
  { label: 'Cetak KHS', icon: Printer, path: '/cetak-pdf', color: 'from-rose-500 to-rose-600' },
];

const gradientMap: Record<string, string> = {
  Mahasiswa: 'from-indigo-500/20 via-indigo-500/5 to-transparent',
  Dosen: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
  'Mata Kuliah': 'from-amber-500/20 via-amber-500/5 to-transparent',
  Tagihan: 'from-rose-500/20 via-rose-500/5 to-transparent',
  Alumni: 'from-purple-500/20 via-purple-500/5 to-transparent',
  Prodi: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Selamat Pagi');
    else if (h < 15) setGreeting('Selamat Siang');
    else if (h < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  useEffect(() => {
    Promise.all([
      get<any>('/akademik/mahasiswa?limit=1').catch(() => ({ pagination: { total: 0 } })),
      get<any>('/akademik/dosen?limit=1').catch(() => ({ pagination: { total: 0 } })),
      get<any>('/akademik/mata-kuliah?limit=1').catch(() => ({ pagination: { total: 0 } })),
      get<any>('/keuangan/tagihan?limit=1').catch(() => ({ pagination: { total: 0 } })),
      get<any>('/alumni/stats').catch(() => ({ total: 0 })),
      get<any>('/akademik/prodi?limit=1').catch(() => ({ pagination: { total: 0 } })),
    ]).then(([mhs, dsn, mk, tag, alm, prodi]) => {
      setStats({
        mahasiswa: mhs.pagination?.total || 0,
        dosen: dsn.pagination?.total || 0,
        matakuliah: mk.pagination?.total || 0,
        tagihan: tag.pagination?.total || 0,
        alumni: alm.total || 0,
        prodi: prodi.pagination?.total || 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Memuat dashboard...</p>
      </div>
    </div>
  );

  const statCards = [
    { label: 'Mahasiswa', value: stats?.mahasiswa ?? 0, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', ring: 'ring-indigo-500/10' },
    { label: 'Dosen', value: stats?.dosen ?? 0, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', ring: 'ring-emerald-500/10' },
    { label: 'Prodi', value: stats?.prodi ?? 0, icon: School, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', ring: 'ring-cyan-500/10' },
    { label: 'Mata Kuliah', value: stats?.matakuliah ?? 0, icon: BookMarked, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', ring: 'ring-amber-500/10' },
    { label: 'Tagihan', value: stats?.tagihan ?? 0, icon: DollarSign, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', ring: 'ring-rose-500/10' },
    { label: 'Alumni', value: stats?.alumni ?? 0, icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', ring: 'ring-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold font-display tracking-tight dark:text-white">{greeting},</h1>
            <span className="text-2xl font-bold font-display text-emerald-500">{user?.nama?.split(' ')[0]}</span>
          </div>
          <p className="text-sm text-slate-400 dark:text-zinc-500">Berikut ringkasan data kampus hari ini</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500">
          <BellRing size={14} />
          <span>{new Date().toLocaleDateString('id', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="relative group bg-white dark:bg-zinc-900/50 rounded-2xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" onClick={() => navigate(`/${card.label.toLowerCase().replace(/\s+/g, '-')}`)}>
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradientMap[card.label] || 'from-slate-500/5'} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center ${card.color} mb-2.5`}>
                <card.icon size={17} />
              </div>
              <p className="text-2xl font-extrabold dark:text-white">{card.value}</p>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 font-medium">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-500" />
            <h2 className="text-sm font-bold font-display dark:text-white">Aksi Cepat</h2>
          </div>
          <span className="text-[10px] text-slate-400">Shortcut</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button key={action.label} onClick={() => navigate(action.path)}
              className="group relative overflow-hidden rounded-xl p-3 text-white text-left transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${action.color.replace('from-', '').split(' to-')[0]}, ${action.color.replace('from-', '').split(' to-')[1]})` }}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
              <action.icon size={18} className="mb-2 opacity-90" />
              <p className="text-xs font-bold">{action.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-emerald-500" />
            <h2 className="text-sm font-bold font-display dark:text-white">Ringkasan Akademik</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Mahasiswa Aktif', value: stats?.mahasiswa ?? 0, total: (stats?.mahasiswa + stats?.alumni) || 1, color: 'bg-indigo-500' },
              { label: 'Dosen Aktif', value: stats?.dosen ?? 0, total: stats?.dosen || 1, color: 'bg-emerald-500' },
              { label: 'Total Mata Kuliah', value: stats?.matakuliah ?? 0, total: stats?.matakuliah || 1, color: 'bg-amber-500' },
              { label: 'Program Studi', value: stats?.prodi ?? 0, total: stats?.prodi || 1, color: 'bg-cyan-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-zinc-400">{item.label}</span>
                  <span className="font-bold dark:text-white">{item.value}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${item.color}`} style={{ width: `${Math.min((item.value / Math.max(item.total, 1)) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/laporan')} className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
            Lihat Laporan Lengkap <ArrowRight size={13} />
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
          <div className="flex items-center gap-2 mb-4">
            <Library size={15} className="text-emerald-500" />
            <h2 className="text-sm font-bold font-display dark:text-white">Modul Terintegrasi</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Perpustakaan', path: '/perpustakaan', icon: Library, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { label: 'PPDB', path: '/ppdb', icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
              { label: 'Keuangan', path: '/tagihan', icon: DollarSign, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
              { label: 'EDOM', path: '/edom', icon: BellRing, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Akreditasi', path: '/akreditasi', icon: BookOpen, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
              { label: 'Integrasi LMS', path: '/integrasi-lms', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            ].map((mod) => (
              <button key={mod.label} onClick={() => navigate(mod.path)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all text-left">
                <div className={`w-8 h-8 rounded-lg ${mod.bg} flex items-center justify-center ${mod.color}`}>
                  <mod.icon size={15} />
                </div>
                <span className="text-xs font-semibold dark:text-white">{mod.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
