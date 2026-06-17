import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, DollarSign, GraduationCap, Loader2, FileSpreadsheet, Printer, Library, BellRing, TrendingUp, ArrowRight, Sparkles, School, UserCheck, BookMarked, ScrollText, ClipboardCheck, CreditCard, Bot, Wallet, Receipt, CheckCircle, Clock, AlertCircle, User, BarChart3 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const adminQuickActions = [
  { label: 'Tambah Mahasiswa', icon: UserCheck, path: 'mahasiswa', color: 'from-emerald-500 to-emerald-600' },
  { label: 'Input Nilai', icon: FileSpreadsheet, path: 'nilai', color: 'from-indigo-500 to-indigo-600' },
  { label: 'Buat Jadwal', icon: BookOpen, path: 'jadwal', color: 'from-amber-500 to-amber-600' },
  { label: 'Cetak KHS', icon: Printer, path: 'cetak-pdf', color: 'from-rose-500 to-rose-600' },
];

const mhsQuickActions = [
  { label: 'KHS', icon: ScrollText, path: 'khs', color: 'from-emerald-500 to-emerald-600' },
  { label: 'Tagihan', icon: Receipt, path: 'tagihan', color: 'from-indigo-500 to-indigo-600' },
  { label: 'KRS', icon: ClipboardCheck, path: 'krs', color: 'from-amber-500 to-amber-600' },
  { label: 'Riwayat Bayar', icon: CreditCard, path: 'riwayat-pembayaran', color: 'from-rose-500 to-rose-600' },
];

const adminGradientMap: Record<string, string> = {
  Mahasiswa: 'from-indigo-500/20 via-indigo-500/5 to-transparent',
  Dosen: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
  'Mata Kuliah': 'from-amber-500/20 via-amber-500/5 to-transparent',
  Tagihan: 'from-rose-500/20 via-rose-500/5 to-transparent',
  Alumni: 'from-purple-500/20 via-purple-500/5 to-transparent',
  Prodi: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
};

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
      <Skeleton className="w-10 h-10 rounded-xl mb-3" />
      <Skeleton className="h-7 w-16 mb-1" />
      <Skeleton className="h-3 w-20" />
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
    <div ref={ref} className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
        style={{ width: visible ? `${pct}%` : '0%' }}
      />
    </div>
  );
}

function MiniBarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-20 pt-2">
      {data.map((d, i) => {
        const h = (d.value / maxVal) * 100;
        const color = d.value >= 3 ? 'bg-emerald-500' : d.value >= 2.5 ? 'bg-amber-500' : 'bg-red-400';
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] font-bold dark:text-white tabular-nums">{d.value.toFixed(2)}</span>
            <div className="w-full flex flex-col items-center">
              <div
                className={`w-full rounded-t-sm ${color} transition-all duration-700 ease-out`}
                style={{ height: `${Math.max(h, 4)}%` }}
              />
              <span className="text-[7px] text-slate-400 dark:text-zinc-500 mt-1 truncate w-full text-center">{d.label}</span>
            </div>
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

  if (loading) return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      <Skeleton className="h-32 rounded-2xl" />
      {isMahasiswa ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Skeleton className="h-44 rounded-2xl" />
            <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
            </div>
          </div>
          <Skeleton className="h-32 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-52 rounded-2xl" />
            <Skeleton className="h-52 rounded-2xl" />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <Skeleton className="h-32 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-52 rounded-2xl" />
            <Skeleton className="h-52 rounded-2xl" />
          </div>
        </>
      )}
    </div>
  );

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

  return (
    <div className="space-y-6 relative">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white shadow-lg shadow-emerald-500/20">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute top-4 right-20 w-2 h-2 bg-white/30 rounded-full" />
        <div className="absolute bottom-6 right-12 w-3 h-3 bg-white/20 rounded-full" />
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-16 right-1/4 w-48 h-48 bg-teal-400/10 rounded-full blur-[60px]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-bold font-display tracking-tight">{greeting},</h1>
              <span className="text-2xl font-bold font-display text-emerald-100">{user?.nama?.split(' ')[0]}</span>
            </div>
            <p className="text-sm text-emerald-100/80">
              {isMahasiswa ? 'Selamat datang di portal mahasiswa' : 'Berikut ringkasan data kampus hari ini'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-emerald-100/70">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
              <BellRing size={13} />
              <span className="tabular-nums">
                {clock.toLocaleDateString('id', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="w-1 h-1 rounded-full bg-emerald-300/50" />
              <span className="tabular-nums font-mono font-bold text-emerald-200">
                {clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isMahasiswa ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-1 glass-card rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{mhs.nim || '-'}</p>
                  <p className="text-sm font-bold dark:text-white">{mhs.nama || user?.nama}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Prodi</span><span className="font-semibold dark:text-white">{mhs.prodi_jenjang || ''} {mhs.prodi_nama || '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Angkatan</span><span className="font-semibold dark:text-white">{mhs.angkatan || '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Semester</span><span className="font-semibold dark:text-white">{mhs.semester || '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Status</span>
                  <Badge variant={mhs.status === 'aktif' ? 'success' : 'warning'}>{mhs.status || '-'}</Badge>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Semester', value: mhs.semester || '-', icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', bar: 'bg-indigo-500' },
                { label: 'IPK', value: ipk || '-', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', bar: 'bg-emerald-500' },
                { label: 'SKS Tempuh', value: totalSks || '-', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', bar: 'bg-amber-500' },
                { label: 'Tagihan', value: tagihanPending, extra: `${tagihanLunas} lunas`, icon: Wallet, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', bar: 'bg-rose-500' },
              ].map((card, idx) => (
                <div key={card.label} className={`relative glass-card rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group animate-stagger-${idx + 1}`}>
                  <div className={`absolute top-0 left-0 w-full h-0.5 ${card.bar} opacity-60`} />
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-gradient-to-br from-transparent to-current opacity-[0.03] dark:opacity-[0.06]" />
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.color} mb-3 ring-4 ring-white dark:ring-zinc-900 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                    <card.icon size={18} />
                  </div>
                  <p className="text-2xl font-extrabold dark:text-white tabular-nums">{card.value}</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 font-medium">{card.label}</p>
                  {card.extra && <p className="text-[10px] text-emerald-500 font-medium">{card.extra}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-500" />
                <h2 className="text-sm font-bold font-display dark:text-white">Aksi Cepat</h2>
              </div>
              <span className="text-[10px] text-slate-400">Shortcut</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {mhsQuickActions.map((action) => (
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
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Receipt size={15} className="text-emerald-500" />
                <h2 className="text-sm font-bold font-display dark:text-white">Tagihan Terkini</h2>
              </div>
              {tagihanMe.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 flex items-center justify-center mb-3">
                    <CheckCircle size={24} className="text-emerald-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Tidak Ada Tagihan</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Semua tagihan telah dibayar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tagihanMe.slice(0, 3).map((t: any) => {
                    const StatIcon = t.status === 'lunas' ? CheckCircle : t.status === 'overdue' ? AlertCircle : Clock;
                    const statusColor = t.status === 'lunas' ? 'text-emerald-500' : t.status === 'overdue' ? 'text-red-500' : 'text-amber-500';
                    return (
                      <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all">
                        <div className="flex items-center gap-2.5">
                          <StatIcon size={14} className={statusColor} />
                          <div>
                            <p className="text-xs font-semibold dark:text-white capitalize">{t.jenis?.replace('_', ' ')}</p>
                            <p className="text-[10px] text-slate-400">{t.tahun_akademik} - Sem {t.semester}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold dark:text-white">{rupiah(t.nominal)}</span>
                      </div>
                    );
                  })}
                  {tagihanMe.length > 3 && (
                    <button onClick={() => navigate('tagihan')} className="flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors mt-1">
                      Lihat semua tagihan <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={15} className="text-emerald-500" />
                <h2 className="text-sm font-bold font-display dark:text-white">Ringkasan Akademik</h2>
              </div>
              {!khsData?.semesters?.length ? (
                <div className="flex flex-col items-center py-8 text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 flex items-center justify-center mb-3">
                    <GraduationCap size={24} className="text-slate-300 dark:text-zinc-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Belum Ada Data KHS</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Data akademik akan muncul setelah KHS diterbitkan</p>
                </div>
              ) : (
                <>
                  {ipData.length > 1 && (
                    <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/30">
                      <p className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Trend IP per Semester</p>
                      <MiniBarChart data={ipData} />
                    </div>
                  )}
                  <div className="space-y-2.5">
                    {khsData.semesters.slice(-4).reverse().map((sem: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all">
                        <div>
                          <p className="text-xs font-semibold dark:text-white">Semester {sem.semester} ({sem.tahunAkademik})</p>
                          <p className="text-[10px] text-slate-400">{sem.totalSks} SKS</p>
                        </div>
                        <span className={`text-xs font-bold ${sem.ip >= 3 ? 'text-emerald-500' : sem.ip >= 2.5 ? 'text-amber-500' : 'text-red-500'}`}>IP: {sem.ip}</span>
                      </div>
                    ))}
                    {khsData.semesters.length > 4 && (
                      <button onClick={() => navigate('khs')} className="flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors mt-1">
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
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {[
              { label: 'Mahasiswa', value: stats?.mahasiswa ?? 0, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', bar: 'bg-indigo-500' },
              { label: 'Dosen', value: stats?.dosen ?? 0, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', bar: 'bg-emerald-500' },
              { label: 'Prodi', value: stats?.prodi ?? 0, icon: School, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', bar: 'bg-cyan-500' },
              { label: 'Mata Kuliah', value: stats?.matakuliah ?? 0, icon: BookMarked, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', bar: 'bg-amber-500' },
              { label: 'Tagihan', value: stats?.tagihan ?? 0, icon: DollarSign, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', bar: 'bg-rose-500' },
              { label: 'Alumni', value: stats?.alumni ?? 0, icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', bar: 'bg-purple-500' },
            ].map((card, idx) => (
              <div key={card.label} className={`relative group glass-card rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden animate-stagger-${idx + 1}`} onClick={() => navigate(card.label.toLowerCase().replace(/\s+/g, '-'))}>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${adminGradientMap[card.label] || 'from-slate-500/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className={`absolute top-0 left-0 w-full h-0.5 ${card.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="absolute -bottom-3 -right-3 w-20 h-20 rounded-full bg-gradient-to-br from-transparent to-current opacity-[0.02] dark:opacity-[0.04] group-hover:opacity-[0.06] transition-opacity" />
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.color} mb-3 ring-4 ring-white dark:ring-zinc-900 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <card.icon size={18} />
                  </div>
                  <p className="text-2xl font-extrabold dark:text-white tabular-nums">{card.value.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 font-medium">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-5 animate-stagger-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-500" />
                <h2 className="text-sm font-bold font-display dark:text-white">Aksi Cepat</h2>
              </div>
              <span className="text-[10px] text-slate-400">Shortcut</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {adminQuickActions.map((action) => (
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

          <div className="glass-card rounded-2xl p-5 animate-stagger-2">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={15} className="text-emerald-500" />
              <h2 className="text-sm font-bold font-display dark:text-white">Aktivitas Terkini</h2>
            </div>
            {aktivitas.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 flex items-center justify-center mb-3">
                  <BellRing size={24} className="text-slate-300 dark:text-zinc-600" />
                </div>
                <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Belum Ada Aktivitas</p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Aktivitas terbaru akan muncul di sini</p>
              </div>
            ) : (
              <div className="space-y-1">
                {aktivitas.map((a: any, i: number) => (
                  <div key={a.id || i} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <p className="text-xs text-slate-600 dark:text-zinc-300 flex-1 truncate">{a.judul || a.message}</p>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-emerald-500" />
                <h2 className="text-sm font-bold font-display dark:text-white">Ringkasan Akademik</h2>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-3">
                {[
                  { label: 'Mahasiswa Aktif', value: stats?.mahasiswa ?? 0, total: (stats?.mahasiswa + (stats?.alumni || 0)) || 1, color: 'bg-indigo-500' },
                  { label: 'Dosen Tetap', value: stats?.dosen ?? 0, total: Math.max(stats?.dosen || 1, 1), color: 'bg-emerald-500' },
                  { label: 'Program Studi', value: stats?.prodi ?? 0, total: Math.max(stats?.prodi || 1, 1), color: 'bg-cyan-500' },
                  { label: 'Tagihan Pending', value: stats?.tagihan ?? 0, total: Math.max(stats?.tagihan || 1, 1), color: 'bg-rose-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-zinc-400">{item.label}</span>
                      <span className="font-bold dark:text-white">{item.value}</span>
                    </div>
                    <ProgressBar value={item.value} total={item.total} color={item.color} />
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('laporan')} className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
                Lihat Laporan Lengkap <ArrowRight size={13} />
              </button>
            </div>

            <div className="glass-card rounded-2xl p-5 relative">
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-indigo-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-4">
                <Library size={15} className="text-emerald-500" />
                <h2 className="text-sm font-bold font-display dark:text-white">Modul Terintegrasi</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Perpustakaan', path: 'perpustakaan', icon: Library, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', bar: 'bg-amber-500' },
                  { label: 'PPDB', path: 'ppdb', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', bar: 'bg-indigo-500' },
                  { label: 'Keuangan', path: 'tagihan', icon: DollarSign, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', bar: 'bg-rose-500' },
                  { label: 'EDOM', path: 'edom', icon: BellRing, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', bar: 'bg-purple-500' },
                  { label: 'Akreditasi', path: 'akreditasi', icon: BookOpen, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', bar: 'bg-cyan-500' },
                  { label: 'Integrasi LMS', path: 'integrasi-lms', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', bar: 'bg-emerald-500' },
                ].map((mod) => (
                  <button key={mod.label} onClick={() => navigate(mod.path)}
                    className="group relative overflow-hidden rounded-xl p-2.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] bg-white dark:bg-zinc-900/50 ring-1 ring-slate-200/50 dark:ring-zinc-800/30 hover:ring-2"
                    style={{ ['--hover-color' as string]: mod.bar.replace('bg-', 'rgb(var(--color-') }}
                  >
                    <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${mod.bar.replace('bg-', 'from-')}/10 via-transparent to-transparent`} />
                    <div className="absolute top-0 left-0 w-full h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: mod.bar.replace('bg-', '') }} />
                    <div className="relative flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${mod.bg} flex items-center justify-center ${mod.color} transition-transform duration-300 group-hover:scale-110`}>
                        <mod.icon size={15} />
                      </div>
                      <span className="text-xs font-semibold dark:text-white">{mod.label}</span>
                    </div>
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
