import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../api/client';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import { Building2, Users, DollarSign, Headset, Plus, ArrowRight, Ticket, Activity, Package, Loader2 } from 'lucide-react';

interface Tenant {
  id: string;
  slug: string;
  name: string;
  nama_pt: string;
  paket: string;
  is_active: boolean;
  subscription_end_date: string | null;
  created_at: string;
  _studentCount: number;
}

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  tenant_name: string;
  created_at: string;
}

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalStudents: number;
  totalVendorUsers: number;
  recentTenants: Tenant[];
}

export default function VendorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTenants, setRecentTenants] = useState<Tenant[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      get<any>('/vendor/dashboard/stats').then((d: any) => {
        setStats(d);
        if (Array.isArray(d.recentTenants)) setRecentTenants(d.recentTenants);
      }),
      get<any>('/vendor/tickets').then((d: any) => {
        const arr = Array.isArray(d) ? d : [];
        setRecentTickets(arr.slice(0, 5));
      }),
      get<any>('/vendor/tenants').then((d: any) => {
        if (Array.isArray(d) && d.length > 0) {
          const byPlan: Record<string, number> = { basic: 0, pro: 0, enterprise: 0 };
          d.forEach((t: Tenant) => { if (byPlan[t.paket] !== undefined) byPlan[t.paket]++; });
        }
      }),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;

  const paketCount: Record<string, number> = { basic: 0, pro: 0, enterprise: 0 };
  if (stats?.recentTenants) {
    stats.recentTenants.forEach((t: Tenant) => { if (paketCount[t.paket] !== undefined) paketCount[t.paket]++; });
  }

  const activeTickets = recentTickets.filter(t => t.status === 'Terbuka' || t.status === 'Dalam Proses').length;

  const statsConfig = [
    { title: 'Total Institusi', value: stats?.totalTenants ?? 0, icon: <Building2 size={18} />, color: 'primary' as const },
    { title: 'Total Mahasiswa Aktif', value: stats?.totalStudents ?? 0, icon: <Users size={18} />, color: 'accent' as const },
    { title: 'Pendapatan Bulanan', value: `Rp ${((stats?.totalTenants ?? 0) * 250000).toLocaleString('id-ID')}`, icon: <DollarSign size={18} />, color: 'amber' as const },
    { title: 'Tiket Aktif', value: activeTickets, icon: <Headset size={18} />, color: 'rose' as const },
  ];

  const quickActions = [
    { label: 'Tambah Institusi Baru', desc: 'Buat kampus baru dengan domain sendiri', icon: Plus, href: '/vendor/tenants', color: 'from-emerald-500 to-emerald-600' },
    { label: 'Kelola Paket', desc: 'Atur langganan dan pricing plan', icon: Package, href: '/vendor/plans', color: 'from-blue-500 to-blue-600' },
    { label: 'Lihat Tiket', desc: 'Tiket dukungan dan laporan masalah', icon: Ticket, href: '/vendor/tickets', color: 'from-violet-500 to-violet-600' },
    { label: 'Monitor Sistem', desc: 'Pantau performa server dan resource', icon: Activity, href: '/vendor/monitor', color: 'from-amber-500 to-amber-600' },
  ];

  const subColors: Record<string, string> = {
    basic: 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300',
    pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const subLabels: Record<string, string> = { basic: 'Basic', pro: 'Pro', enterprise: 'Enterprise' };

  const ticketStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Terbuka': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      'Dalam Proses': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'Selesai': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Ditutup': 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-400',
    };
    return map[status] || 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-400';
  };

  const ticketPriorityBadge = (priority: string) => {
    const map: Record<string, string> = {
      'Rendah': 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-400',
      'Sedang': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Tinggi': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'Kritis': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return map[priority] || 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Vendor Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Panel manajemen platform AONE SIAKAD</p>
        </div>
        <Link to="/vendor/tenants" className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
          <Plus size={14} /> Tambah Institusi
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} icon={s.icon} color={s.color} />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((a) => (
          <Link key={a.href} to={a.href} className="group bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-lg mb-3 text-white`}>
              <a.icon size={18} />
            </div>
            <p className="text-sm font-bold dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{a.label}</p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">{a.desc}</p>
            <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
              Buka <ArrowRight size={10} />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold dark:text-white">Institusi Terbaru</h2>
              <Link to="/vendor/tenants" className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
                Lihat Semua <ArrowRight size={12} />
              </Link>
            </div>
            {recentTenants.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-zinc-500 py-8 text-center">Belum ada institusi terdaftar</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-zinc-800/30">
                      <th className="text-left px-3 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Nama</th>
                      <th className="text-left px-3 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Slug</th>
                      <th className="text-left px-3 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Paket</th>
                      <th className="text-left px-3 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Status</th>
                      <th className="text-left px-3 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 dark:divide-zinc-800/20">
                    {recentTenants.map((t) => {
                      const subExpired = t.subscription_end_date && new Date(t.subscription_end_date) < new Date();
                      const subExpiring = t.subscription_end_date && !subExpired && new Date(t.subscription_end_date).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;
                      const subActive = t.subscription_end_date && !subExpired && !subExpiring;
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                          <td className="px-3 py-3">
                            <Link to={`/vendor/tenants/${t.id}`} className="font-semibold text-xs dark:text-white hover:text-indigo-500 transition-colors">{t.name}</Link>
                          </td>
                          <td className="px-3 py-3 text-[11px] text-slate-400 font-mono">{t.slug}</td>
                          <td className="px-3 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${subColors[t.paket] || 'bg-slate-100 text-slate-600'}`}>{subLabels[t.paket] || t.paket}</span>
                          </td>
                          <td className="px-3 py-3">
                            {t.is_active ? (
                              subExpired ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Expired</span>
                              ) : subExpiring ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Akan Expired</span>
                              ) : subActive ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Aktif</span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Aktif</span>
                              )
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400">Nonaktif</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-[11px] text-slate-400">{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <Package size={15} className="text-indigo-500" />
              <h2 className="text-sm font-bold dark:text-white">Distribusi Paket</h2>
            </div>
            {stats?.recentTenants && stats.recentTenants.length > 0 ? (
              <div className="space-y-3">
                {Object.entries(paketCount).map(([key, count]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/30">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${key === 'basic' ? 'bg-slate-400' : key === 'pro' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                      <span className="text-xs font-semibold dark:text-white capitalize">{key}</span>
                    </div>
                    <span className="text-sm font-bold dark:text-white">{count}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Total</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{Object.values(paketCount).reduce((a, b) => a + b, 0)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-zinc-500 py-6 text-center">Data paket tidak tersedia</p>
            )}
          </Card>

          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ticket size={15} className="text-indigo-500" />
                <h2 className="text-sm font-bold dark:text-white">Tiket Terbaru</h2>
              </div>
              <Link to="/vendor/tickets" className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
                Lihat Semua <ArrowRight size={12} />
              </Link>
            </div>
            {recentTickets.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-zinc-500 py-6 text-center">Belum ada tiket</p>
            ) : (
              <div className="space-y-2">
                {recentTickets.map((t) => (
                  <Link key={t.id} to="/vendor/tickets" className="block p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/30 hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold dark:text-white line-clamp-1">{t.title}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ticketStatusBadge(t.status)}`}>{t.status}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ticketPriorityBadge(t.priority)}`}>{t.priority}</span>
                      <span className="text-[10px] text-slate-400 ml-auto">{new Date(t.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
