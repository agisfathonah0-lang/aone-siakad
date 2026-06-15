import { useState, useEffect } from 'react';
import { get } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, DollarSign, GraduationCap, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      get<any>('/akademik/mahasiswa?limit=1').catch(() => ({ pagination: { total: 0 } })),
      get<any>('/akademik/dosen?limit=1').catch(() => ({ pagination: { total: 0 } })),
      get<any>('/akademik/mata-kuliah?limit=1').catch(() => ({ pagination: { total: 0 } })),
      get<any>('/keuangan/tagihan?limit=1').catch(() => ({ pagination: { total: 0 } })),
      get<any>('/alumni/stats').catch(() => ({ total: 0 })),
    ]).then(([mhs, dsn, mk, tag, alm]) => {
      setStats({
        mahasiswa: mhs.pagination?.total || 0,
        dosen: dsn.pagination?.total || 0,
        matakuliah: mk.pagination?.total || 0,
        tagihan: tag.pagination?.total || 0,
        alumni: alm.total || 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Mahasiswa', value: stats?.mahasiswa ?? '...', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', gradient: 'from-indigo-500/10 to-indigo-600/5' },
    { label: 'Dosen', value: stats?.dosen ?? '...', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', gradient: 'from-emerald-500/10 to-emerald-600/5' },
    { label: 'Mata Kuliah', value: stats?.matakuliah ?? '...', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', gradient: 'from-amber-500/10 to-amber-600/5' },
    { label: 'Tagihan', value: stats?.tagihan ?? '...', icon: DollarSign, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', gradient: 'from-rose-500/10 to-rose-600/5' },
    { label: 'Alumni', value: stats?.alumni ?? '...', icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', gradient: 'from-purple-500/10 to-purple-600/5' },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Dashboard</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Selamat datang kembali, {user?.nama}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="relative overflow-hidden bg-white dark:bg-zinc-900/50 rounded-xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br opacity-30 dark:opacity-20 blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.color} mb-3`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-extrabold dark:text-white">{card.value}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}