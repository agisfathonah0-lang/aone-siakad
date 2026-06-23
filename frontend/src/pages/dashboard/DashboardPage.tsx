import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { get } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Users, BookOpen, DollarSign, GraduationCap, Loader2, FileSpreadsheet, Printer, Library,
  BellRing, TrendingUp, ArrowRight, Sparkles, School, UserCheck, BookMarked, ScrollText,
  ClipboardCheck, CreditCard, Wallet, Receipt, CheckCircle, Clock, AlertCircle, User,
  BarChart3, Activity, Target, Globe, Zap, Plus, Search, ChevronDown, SlidersHorizontal,
  Filter, MoreHorizontal,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const adminQuickActions = [
  { label: 'Tambah Mahasiswa', icon: UserCheck, path: 'mahasiswa', color: '#3b82f6' },
  { label: 'Input Nilai', icon: FileSpreadsheet, path: 'nilai', color: '#10b981' },
  { label: 'Buat Jadwal', icon: BookOpen, path: 'jadwal', color: '#f59e0b' },
  { label: 'Cetak KHS', icon: Printer, path: 'cetak-pdf', color: '#ef4444' },
];

const mhsQuickActions = [
  { label: 'KHS', icon: ScrollText, path: 'khs', color: '#3b82f6' },
  { label: 'Tagihan', icon: Receipt, path: 'tagihan', color: '#10b981' },
  { label: 'KRS', icon: ClipboardCheck, path: 'krs', color: '#f59e0b' },
  { label: 'Riwayat Bayar', icon: CreditCard, path: 'riwayat-pembayaran', color: '#8b5cf6' },
];

const sparklineData = {
  kehadiran: [{ v: 30 }, { v: 45 }, { v: 35 }, { v: 52 }, { v: 42 }, { v: 58 }, { v: 50 }, { v: 66 }, { v: 60 }, { v: 74 }],
  nilai: [{ v: 20 }, { v: 38 }, { v: 28 }, { v: 42 }, { v: 36 }, { v: 30 }, { v: 48 }, { v: 40 }, { v: 55 }, { v: 50 }],
  sks: [{ v: 42 }, { v: 30 }, { v: 46 }, { v: 34 }, { v: 50 }, { v: 40 }, { v: 56 }, { v: 46 }, { v: 62 }, { v: 54 }],
};

function SparklineChart({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <div style={{ height: 56 }}>
      <ResponsiveContainer width="100%" height={56}>
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.18} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#sg-${color.replace('#', '')})`} dot={false} activeDot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ProgressBar({ value, total, color }: { value: number; total: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const pct = Math.min((value / Math.max(total, 1)) * 100, 100);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-1.5">
      <div className="h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: visible ? `${pct}%` : '0%', background: color }} />
    </div>
  );
}

function MiniBarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16 pt-2">
      {data.map((d, i) => {
        const h = (d.value / maxVal) * 100;
        const color = d.value >= 3 ? '#10b981' : d.value >= 2.5 ? '#f59e0b' : '#ef4444';
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-[8px] font-bold text-gray-500 dark:text-zinc-400 tabular-nums">{d.value.toFixed(2)}</span>
            <div className="w-full rounded-t-sm transition-all duration-700 ease-out" style={{ height: `${Math.max(h, 4)}%`, background: color }} />
            <span className="text-[6px] text-gray-400 dark:text-zinc-500 truncate w-full text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Selamat Pagi');
    else if (h < 15) setGreeting('Selamat Siang');
    else if (h < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  const [stats, setStats] = useState<any>(null);
  const [mhsProfile, setMhsProfile] = useState<any>(null);
  const [khsData, setKhsData] = useState<any>(null);
  const [tagihanMe, setTagihanMe] = useState<any[]>([]);
  const [clock, setClock] = useState(new Date());
  const [aktivitas, setAktivitas] = useState<any[]>([]);

  const isMahasiswa = user?.role === 'mahasiswa';

  useEffect(() => {
    if (isMahasiswa) {
      Promise.all([
        get<any>('/akademik/krs/me').catch(() => null),
        get<any>('/nilai/khs').catch(() => null),
        get<any[]>('/keuangan/tagihan/me').catch(() => []),
      ]).then(([krsMe, khs, tagihan]) => {
        setKhsData(khs);
        setTagihanMe(tagihan || []);
        if (krsMe?.nim) {
          get<any>(`/akademik/mahasiswa/${krsMe.nim}`).then(setMhsProfile).catch(() => setMhsProfile({ nim: krsMe.nim, nama: krsMe.nama }));
        } else {
          setMhsProfile({});
        }
      }).finally(() => setLoading(false));
    } else {
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
    }
  }, [isMahasiswa]);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isMahasiswa) {
      get<{ rows: any[] }>('/akademik/notifikasi?limit=5').then(d => setAktivitas(d.rows || [])).catch(() => {});
    }
  }, [isMahasiswa]);

  const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const tagihanPending = tagihanMe.filter((t: any) => t.status === 'pending').length;
  const tagihanLunas = tagihanMe.filter((t: any) => t.status === 'lunas').length;
  const mhs = mhsProfile || {};
  const totalSks = khsData?.totalSks || 0;
  const ipk = khsData?.ipk || 0;
  const ipData = (khsData?.semesters || []).slice(-6).map((sem: any) => ({
    label: sem.semester,
    value: parseFloat(sem.ip) || 0,
  }));

  if (loading) return (
    <div className="p-5 lg:p-6 bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-zinc-950 dark:to-zinc-900 min-h-screen -m-4 lg:-m-6">
      <div className="animate-pulse space-y-5">
        <div className="h-10 w-48 bg-white/70 backdrop-blur-md dark:bg-zinc-900 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-44 bg-white/70 backdrop-blur-md border-white/40 dark:bg-zinc-900/70 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-5 lg:p-6 bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-zinc-950 dark:to-zinc-900 min-h-screen -m-4 lg:-m-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{greeting}, {user?.nama?.split(' ')[0]}</h1>
          <p className="text-[13px] text-gray-500 dark:text-zinc-400 mt-0.5">
            {isMahasiswa ? 'Portal Mahasiswa' : 'Ringkasan Data Kampus'}
            <span className="mx-2">·</span>
            {clock.toLocaleDateString('id', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md border-white/40 dark:bg-zinc-900/70 dark:border-zinc-700/50 text-gray-700 dark:text-zinc-300 text-[12px] px-3 py-1.5 rounded-lg hover:bg-white/90 dark:hover:bg-zinc-800 font-medium transition-colors">
            <Filter size={12} />
            Filter
          </button>
          <button className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md border-white/40 dark:bg-zinc-900/70 dark:border-zinc-700/50 text-gray-600 dark:text-zinc-400 text-[12px] px-3 py-1.5 rounded-lg select-none transition-colors">
            <ChevronDown size={11} className="text-gray-400 rotate-90" />
            <span>2024/2025 Ganjil</span>
            <ChevronDown size={11} className="text-gray-400 -rotate-90" />
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          { label: isMahasiswa ? 'IPK' : 'Total Mahasiswa', value: isMahasiswa ? (ipk || '-') : (stats?.mahasiswa ?? 0).toLocaleString(), change: isMahasiswa ? (ipk >= 3 ? '+0.5' : '+0.2') : '+12%', sub: isMahasiswa ? 'Semester ini' : '+12% bulan lalu', color: '#3b82f6', data: sparklineData.kehadiran, icon: TrendingUp },
          { label: isMahasiswa ? 'SKS Aktif' : 'Dosen & Prodi', value: isMahasiswa ? `${totalSks} SKS` : `${stats?.dosen ?? 0} Dosen`, change: isMahasiswa ? '+2 SKS' : '+5%', sub: isMahasiswa ? 'Semester ini' : '+5% semester lalu', color: '#10b981', data: sparklineData.nilai, icon: TrendingUp },
          { label: isMahasiswa ? 'Tagihan' : 'Mata Kuliah', value: isMahasiswa ? tagihanPending : (stats?.matakuliah ?? 0).toLocaleString(), change: isMahasiswa ? `${tagihanLunas} lunas` : '+8%', sub: isMahasiswa ? 'Menunggu pembayaran' : '+8% minggu lalu', color: '#f59e0b', data: sparklineData.sks, icon: TrendingUp },
        ].map((m, idx) => (
          <div key={idx} className="bg-white/70 backdrop-blur-md border-white/40 rounded-2xl px-5 py-4 border hover:shadow-lg hover:shadow-emerald-500/10 transition-shadow dark:bg-zinc-900/70 dark:border-zinc-800/50">
            <div className="flex items-start justify-between mb-1">
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">{m.label}</p>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {m.change}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{m.value}</p>
            <SparklineChart data={m.data} color={m.color} />
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={11} />
              {m.sub}
            </p>
          </div>
        ))}
      </div>

      {isMahasiswa ? (
        <>
          {/* Mahasiswa: Profile + Quick Actions + Tagihan + KHS */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-5">
            <div className="bg-white/70 backdrop-blur-md border-white/40 rounded-2xl border dark:bg-zinc-900/70 dark:border-zinc-800/50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {(mhs.nama || user?.nama || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-gray-400">{mhs.nim || '-'}</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{mhs.nama || user?.nama}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">Prodi</span><span className="font-semibold text-gray-700 dark:text-zinc-300">{mhs.prodi_jenjang || ''} {mhs.prodi_nama || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Angkatan</span><span className="font-semibold text-gray-700 dark:text-zinc-300">{mhs.angkatan || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Semester</span><span className="font-semibold text-gray-700 dark:text-zinc-300">{mhs.semester || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Status</span>
                  <Badge variant={mhs.status === 'aktif' ? 'success' : 'warning'}>{mhs.status || '-'}</Badge>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Semester', value: mhs.semester || '-', icon: GraduationCap, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                { label: 'IPK', value: ipk || '-', icon: TrendingUp, color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                { label: 'SKS Tempuh', value: totalSks || '-', icon: BookOpen, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                { label: 'Tagihan', value: tagihanPending, extra: `${tagihanLunas} lunas`, icon: Wallet, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-500/10' },
              ].map((card, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800 hover:shadow-md dark:hover:shadow-black/20 transition-all group">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3 ring-2 ring-white dark:ring-zinc-900 group-hover:scale-110 transition-transform`}>
                    <card.icon size={18} style={{ color: card.color }} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{card.value}</p>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5 font-medium">{card.label}</p>
                  {card.extra && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{card.extra}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-md border-white/40 rounded-2xl border dark:bg-zinc-900/70 dark:border-zinc-800/50 p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-500" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Aksi Cepat</h2>
              </div>
              <span className="text-[10px] text-gray-400">Shortcut</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {mhsQuickActions.map((action) => (
                <button key={action.label} onClick={() => navigate(action.path)}
                  className="group relative overflow-hidden rounded-xl p-3 text-white text-left transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${action.color}, ${action.color}dd)` }}>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                  <action.icon size={18} className="mb-2 opacity-90" />
                  <p className="text-xs font-bold">{action.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tagihan + KHS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/70 backdrop-blur-md border-white/40 rounded-2xl border dark:bg-zinc-900/70 dark:border-zinc-800/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Receipt size={15} className="text-blue-500" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Tagihan Terkini</h2>
              </div>
              {tagihanMe.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-gray-400">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                    <CheckCircle size={24} className="text-emerald-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Tidak Ada Tagihan</p>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1">Semua tagihan telah dibayar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tagihanMe.slice(0, 3).map((t: any) => {
                    const StatIcon = t.status === 'lunas' ? CheckCircle : t.status === 'overdue' ? AlertCircle : Clock;
                    const statusColor = t.status === 'lunas' ? 'text-emerald-500' : t.status === 'overdue' ? 'text-red-500' : 'text-amber-500';
                    return (
                      <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all">
                        <div className="flex items-center gap-2.5">
                          <StatIcon size={14} className={statusColor} />
                          <div>
                            <p className="text-xs font-semibold text-gray-800 dark:text-white capitalize">{t.jenis?.replace('_', ' ')}</p>
                            <p className="text-[10px] text-gray-400">{t.tahun_akademik} - Sem {t.semester}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-gray-800 dark:text-white">{rupiah(t.nominal)}</span>
                      </div>
                    );
                  })}
                  {tagihanMe.length > 3 && (
                    <button onClick={() => navigate('tagihan')} className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors mt-1">
                      Lihat semua tagihan <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white/70 backdrop-blur-md border-white/40 rounded-2xl border dark:bg-zinc-900/70 dark:border-zinc-800/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={15} className="text-blue-500" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Ringkasan Akademik</h2>
              </div>
              {!khsData?.semesters?.length ? (
                <div className="flex flex-col items-center py-8 text-gray-400">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                    <GraduationCap size={24} className="text-gray-300 dark:text-zinc-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Belum Ada Data KHS</p>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1">Data akademik akan muncul setelah KHS diterbitkan</p>
                </div>
              ) : (
                <>
                  {ipData.length > 1 && (
                    <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/30">
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-zinc-400 mb-2 uppercase tracking-wider">Trend IP per Semester</p>
                      <MiniBarChart data={ipData} />
                    </div>
                  )}
                  <div className="space-y-2.5">
                    {khsData.semesters.slice(-4).reverse().map((sem: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all">
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-white">Semester {sem.semester} ({sem.tahunAkademik})</p>
                          <p className="text-[10px] text-gray-400">{sem.totalSks} SKS</p>
                        </div>
                        <span className={`text-xs font-bold ${sem.ip >= 3 ? 'text-emerald-500' : sem.ip >= 2.5 ? 'text-amber-500' : 'text-red-500'}`}>IP: {sem.ip}</span>
                      </div>
                    ))}
                    {khsData.semesters.length > 4 && (
                      <button onClick={() => navigate('khs')} className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors mt-1">
                        Lihat KHS lengkap <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Admin: Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
            {[
              { label: 'Mahasiswa', value: stats?.mahasiswa ?? 0, icon: Users, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { label: 'Dosen', value: stats?.dosen ?? 0, icon: UserCheck, color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { label: 'Prodi', value: stats?.prodi ?? 0, icon: School, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-500/10' },
              { label: 'Mata Kuliah', value: stats?.matakuliah ?? 0, icon: BookMarked, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-500/10' },
              { label: 'Tagihan', value: stats?.tagihan ?? 0, icon: DollarSign, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-500/10' },
              { label: 'Alumni', value: stats?.alumni ?? 0, icon: GraduationCap, color: '#06b6d4', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
            ].map((card) => (
              <div key={card.label}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800 cursor-pointer hover:shadow-md dark:hover:shadow-black/20 transition-all group"
                onClick={() => navigate(card.label.toLowerCase().replace(/\s+/g, '-'))}>
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3 ring-2 ring-white dark:ring-zinc-900 group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                  <card.icon size={18} style={{ color: card.color }} />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{card.value.toLocaleString()}</p>
                <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5 font-medium">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-md border-white/40 rounded-2xl border dark:bg-zinc-900/70 dark:border-zinc-800/50 p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-blue-500" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Aksi Cepat</h2>
              </div>
              <span className="text-[10px] text-gray-400">Shortcut</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {adminQuickActions.map((action) => (
                <button key={action.label} onClick={() => navigate(action.path)}
                  className="group relative overflow-hidden rounded-xl p-3 text-white text-left transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${action.color}, ${action.color}dd)` }}>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                  <action.icon size={18} className="mb-2 opacity-90" />
                  <p className="text-xs font-bold">{action.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Aktivitas Terkini */}
          <div className="bg-white/70 backdrop-blur-md border-white/40 rounded-2xl border dark:bg-zinc-900/70 dark:border-zinc-800/50 p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={15} className="text-blue-500" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Aktivitas Terkini</h2>
            </div>
            {aktivitas.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-400">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                  <BellRing size={24} className="text-gray-300 dark:text-zinc-600" />
                </div>
                <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Belum Ada Aktivitas</p>
                <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1">Aktivitas terbaru akan muncul di sini</p>
              </div>
            ) : (
              <div className="space-y-1">
                {aktivitas.map((a: any, i: number) => (
                  <div key={a.id || i} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <p className="text-xs text-gray-600 dark:text-zinc-300 flex-1 truncate">{a.judul || a.message}</p>
                    <span className="text-[10px] text-gray-400 tabular-nums">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ringkasan Akademik + Modul Terintegrasi */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/70 backdrop-blur-md border-white/40 rounded-2xl border dark:bg-zinc-900/70 dark:border-zinc-800/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target size={15} className="text-blue-500" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Ringkasan Akademik</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Mahasiswa Aktif', value: stats?.mahasiswa ?? 0, total: (stats?.mahasiswa + (stats?.alumni || 0)) || 1, color: '#3b82f6' },
                  { label: 'Dosen Tetap', value: stats?.dosen ?? 0, total: Math.max(stats?.dosen || 1, 1), color: '#10b981' },
                  { label: 'Program Studi', value: stats?.prodi ?? 0, total: Math.max(stats?.prodi || 1, 1), color: '#8b5cf6' },
                  { label: 'Tagihan Pending', value: stats?.tagihan ?? 0, total: Math.max(stats?.tagihan || 1, 1), color: '#ef4444' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-zinc-400">{item.label}</span>
                      <span className="font-bold text-gray-800 dark:text-white">{item.value}</span>
                    </div>
                    <ProgressBar value={item.value} total={item.total} color={item.color} />
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('laporan')} className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                Lihat Laporan Lengkap <ArrowRight size={13} />
              </button>
            </div>

            <div className="bg-white/70 backdrop-blur-md border-white/40 rounded-2xl border dark:bg-zinc-900/70 dark:border-zinc-800/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={15} className="text-blue-500" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Modul Terintegrasi</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Perpustakaan', path: 'perpustakaan', icon: Library, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                  { label: 'PPDB', path: 'ppdb', icon: Users, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                  { label: 'Keuangan', path: 'tagihan', icon: DollarSign, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-500/10' },
                  { label: 'EDOM', path: 'edom', icon: BellRing, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-500/10' },
                  { label: 'Akreditasi', path: 'akreditasi', icon: BookOpen, color: '#06b6d4', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
                  { label: 'Integrasi LMS', path: 'integrasi-lms', icon: TrendingUp, color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                ].map((mod) => (
                  <button key={mod.label} onClick={() => navigate(mod.path)}
                    className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-white/70 backdrop-blur-md border-white/40 dark:bg-zinc-900/70 ring-1 ring-gray-200/50 dark:ring-zinc-700/30 hover:ring-2 hover:-translate-y-0.5 hover:shadow-md transition-all text-left">
                    <div className={`w-8 h-8 rounded-lg ${mod.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <mod.icon size={15} style={{ color: mod.color }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">{mod.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
