import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { get } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, DollarSign, GraduationCap, Loader2, FileSpreadsheet, Printer, Library, BellRing, TrendingUp, ArrowRight, Sparkles, School, UserCheck, BookMarked, ScrollText, ClipboardCheck, CreditCard, Bot, Wallet, Receipt, CheckCircle, Clock, AlertCircle, User, BarChart3, Activity, Zap, Target, Globe } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const adminQuickActions = [
  { label: 'Tambah Mahasiswa', icon: UserCheck, path: 'mahasiswa', gradient: 'from-emerald-600 to-emerald-400' },
  { label: 'Input Nilai', icon: FileSpreadsheet, path: 'nilai', gradient: 'from-indigo-600 to-indigo-400' },
  { label: 'Buat Jadwal', icon: BookOpen, path: 'jadwal', gradient: 'from-amber-600 to-amber-400' },
  { label: 'Cetak KHS', icon: Printer, path: 'cetak-pdf', gradient: 'from-rose-600 to-rose-400' },
];

const mhsQuickActions = [
  { label: 'KHS', icon: ScrollText, path: 'khs', gradient: 'from-emerald-600 to-emerald-400' },
  { label: 'Tagihan', icon: Receipt, path: 'tagihan', gradient: 'from-indigo-600 to-indigo-400' },
  { label: 'KRS', icon: ClipboardCheck, path: 'krs', gradient: 'from-amber-600 to-amber-400' },
  { label: 'Riwayat Bayar', icon: CreditCard, path: 'riwayat-pembayaran', gradient: 'from-rose-600 to-rose-400' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
} as const;

function StatCardSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/5 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-white/5 mb-3" />
      <div className="h-7 w-16 bg-white/5 rounded mb-1" />
      <div className="h-3 w-20 bg-white/5 rounded" />
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
    <div ref={ref} className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} style={{ width: visible ? `${pct}%` : '0%' }} />
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
            <span className="text-[9px] font-bold text-white/70 tabular-nums">{d.value.toFixed(2)}</span>
            <div className="w-full flex flex-col items-center">
              <div className={`w-full rounded-t-sm ${color} transition-all duration-700 ease-out shadow-sm`} style={{ height: `${Math.max(h, 4)}%`, boxShadow: d.value >= 3 ? '0 0 8px rgba(16,185,129,0.3)' : 'none' }} />
              <span className="text-[7px] text-white/30 mt-1 truncate w-full text-center">{d.label}</span>
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
    <>
      <div className="fixed inset-0 bg-[#0a0a0f]" />
      <div className="space-y-6 relative z-10">
        <Skeleton className="h-32 rounded-2xl bg-white/5" />
      {isMahasiswa ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Skeleton className="h-44 rounded-2xl bg-white/5" />
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      )}
      <Skeleton className="h-32 rounded-2xl bg-white/5" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-52 rounded-2xl bg-white/5" />
        <Skeleton className="h-52 rounded-2xl bg-white/5" />
      </div>
      </div>
    </>
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
    <>
    <div className="fixed inset-0 bg-[#0a0a0f] pointer-events-none" />
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 relative z-10">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[200px]" />
      </div>

      {/* Greeting header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl p-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-indigo-500/5" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)]" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{greeting}, <span className="text-emerald-400">{user?.nama?.split(' ')[0]}</span></h1>
                <p className="text-sm text-white/40 font-medium tracking-wide">{isMahasiswa ? 'Portal Mahasiswa' : 'Dashboard Akademik'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.06]">
              <BellRing size={13} />
              <span className="tabular-nums">
                {clock.toLocaleDateString('id', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
              <span className="tabular-nums font-mono font-bold text-emerald-400/70">
                {clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {isMahasiswa ? (
        <>
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-1 p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.15)]">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs text-white/40">{mhs.nim || '-'}</p>
                  <p className="text-sm font-bold text-white">{mhs.nama || user?.nama}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-white/40">Prodi</span><span className="font-semibold text-white/80">{mhs.prodi_jenjang || ''} {mhs.prodi_nama || '-'}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Angkatan</span><span className="font-semibold text-white/80">{mhs.angkatan || '-'}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Semester</span><span className="font-semibold text-white/80">{mhs.semester || '-'}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Status</span>
                  <Badge variant={mhs.status === 'aktif' ? 'success' : 'warning'}>{mhs.status || '-'}</Badge>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Semester', value: mhs.semester || '-', icon: GraduationCap, accent: 'text-indigo-400', border: 'border-indigo-500/20', glow: 'rgba(99,102,241,0.1)' },
                { label: 'IPK', value: ipk || '-', icon: TrendingUp, accent: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'rgba(16,185,129,0.1)' },
                { label: 'SKS Tempuh', value: totalSks || '-', icon: BookOpen, accent: 'text-amber-400', border: 'border-amber-500/20', glow: 'rgba(245,158,11,0.1)' },
                { label: 'Tagihan', value: tagihanPending, extra: `${tagihanLunas} lunas`, icon: Wallet, accent: 'text-rose-400', border: 'border-rose-500/20', glow: 'rgba(244,63,94,0.1)' },
              ].map((card, idx) => (
                <motion.div key={card.label} variants={itemVariants}
                  className={`p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border ${card.border} hover:bg-white/[0.06] transition-all duration-200 group`}
                  style={{ boxShadow: `0 0 24px ${card.glow}` }}>
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${card.accent} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon size={18} />
                  </div>
                  <p className="text-2xl font-extrabold text-white tabular-nums">{card.value}</p>
                  <p className="text-[11px] text-white/40 mt-0.5 font-medium">{card.label}</p>
                  {card.extra && <p className="text-[10px] text-emerald-400/70 font-medium">{card.extra}</p>}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Aksi Cepat</h2>
              </div>
              <span className="text-[10px] text-white/30">Shortcut</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {mhsQuickActions.map((action) => (
                <button key={action.label} onClick={() => navigate(action.path)}
                  className="group relative overflow-hidden rounded-xl p-3 text-white text-left transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${action.gradient.split(' to-')[0].replace('from-', '')}, ${action.gradient.split(' to-')[1]})` }}>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                  <action.icon size={18} className="mb-2 opacity-90" />
                  <p className="text-xs font-bold">{action.label}</p>
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-4">
                <Receipt size={15} className="text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Tagihan Terkini</h2>
              </div>
              {tagihanMe.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-white/40">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                    <CheckCircle size={24} className="text-emerald-400/70" />
                  </div>
                  <p className="text-sm font-semibold text-white/50">Tidak Ada Tagihan</p>
                  <p className="text-[11px] text-white/30 mt-1">Semua tagihan telah dibayar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tagihanMe.slice(0, 3).map((t: any) => {
                    const StatIcon = t.status === 'lunas' ? CheckCircle : t.status === 'overdue' ? AlertCircle : Clock;
                    const statusColor = t.status === 'lunas' ? 'text-emerald-400' : t.status === 'overdue' ? 'text-red-400' : 'text-amber-400';
                    return (
                      <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.03] transition-all">
                        <div className="flex items-center gap-2.5">
                          <StatIcon size={14} className={statusColor} />
                          <div>
                            <p className="text-xs font-semibold text-white/80 capitalize">{t.jenis?.replace('_', ' ')}</p>
                            <p className="text-[10px] text-white/40">{t.tahun_akademik} - Sem {t.semester}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-white/80">{rupiah(t.nominal)}</span>
                      </div>
                    );
                  })}
                  {tagihanMe.length > 3 && (
                    <button onClick={() => navigate('tagihan')} className="flex items-center gap-1 text-xs font-semibold text-emerald-400/70 hover:text-emerald-400 transition-colors mt-1">
                      Lihat semua tagihan <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={15} className="text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Ringkasan Akademik</h2>
              </div>
              {!khsData?.semesters?.length ? (
                <div className="flex flex-col items-center py-8 text-white/40">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                    <GraduationCap size={24} className="text-white/20" />
                  </div>
                  <p className="text-sm font-semibold text-white/50">Belum Ada Data KHS</p>
                  <p className="text-[11px] text-white/30 mt-1">Data akademik akan muncul setelah KHS diterbitkan</p>
                </div>
              ) : (
                <>
                  {ipData.length > 1 && (
                    <div className="mb-4 p-3 rounded-xl bg-white/[0.03]">
                      <p className="text-[10px] font-semibold text-white/30 mb-2 uppercase tracking-wider">Trend IP per Semester</p>
                      <MiniBarChart data={ipData} />
                    </div>
                  )}
                  <div className="space-y-2.5">
                    {khsData.semesters.slice(-4).reverse().map((sem: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.03] transition-all">
                        <div>
                          <p className="text-xs font-semibold text-white/80">Semester {sem.semester} ({sem.tahunAkademik})</p>
                          <p className="text-[10px] text-white/40">{sem.totalSks} SKS</p>
                        </div>
                        <span className={`text-xs font-bold ${sem.ip >= 3 ? 'text-emerald-400' : sem.ip >= 2.5 ? 'text-amber-400' : 'text-red-400'}`}>IP: {sem.ip}</span>
                      </div>
                    ))}
                    {khsData.semesters.length > 4 && (
                      <button onClick={() => navigate('khs')} className="flex items-center gap-1 text-xs font-semibold text-emerald-400/70 hover:text-emerald-400 transition-colors mt-1">
                        Lihat KHS lengkap <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      ) : (
        <>
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {[
              { label: 'Mahasiswa', value: stats?.mahasiswa ?? 0, icon: Users, accent: 'text-indigo-400', border: 'border-indigo-500/20', glow: 'rgba(99,102,241,0.1)' },
              { label: 'Dosen', value: stats?.dosen ?? 0, icon: UserCheck, accent: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'rgba(16,185,129,0.1)' },
              { label: 'Prodi', value: stats?.prodi ?? 0, icon: School, accent: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'rgba(6,182,212,0.1)' },
              { label: 'Mata Kuliah', value: stats?.matakuliah ?? 0, icon: BookMarked, accent: 'text-amber-400', border: 'border-amber-500/20', glow: 'rgba(245,158,11,0.1)' },
              { label: 'Tagihan', value: stats?.tagihan ?? 0, icon: DollarSign, accent: 'text-rose-400', border: 'border-rose-500/20', glow: 'rgba(244,63,94,0.1)' },
              { label: 'Alumni', value: stats?.alumni ?? 0, icon: GraduationCap, accent: 'text-purple-400', border: 'border-purple-500/20', glow: 'rgba(168,85,247,0.1)' },
            ].map((card, idx) => (
              <motion.div key={card.label} variants={itemVariants}
                className={`relative p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border ${card.border} cursor-pointer hover:bg-white/[0.06] transition-all duration-200 group overflow-hidden`}
                style={{ boxShadow: `0 0 24px ${card.glow}` }}
                onClick={() => navigate(card.label.toLowerCase().replace(/\s+/g, '-'))}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${card.accent} mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <card.icon size={18} />
                  </div>
                  <p className="text-2xl font-extrabold text-white tabular-nums">{card.value.toLocaleString()}</p>
                  <p className="text-[11px] text-white/40 mt-0.5 font-medium">{card.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Aksi Cepat</h2>
              </div>
              <span className="text-[10px] text-white/30">Shortcut</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {adminQuickActions.map((action) => (
                <button key={action.label} onClick={() => navigate(action.path)}
                  className="group relative overflow-hidden rounded-xl p-3 text-white text-left transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${action.gradient.split(' to-')[0].replace('from-', '')}, ${action.gradient.split(' to-')[1]})` }}>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                  <action.icon size={18} className="mb-2 opacity-90" />
                  <p className="text-xs font-bold">{action.label}</p>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={15} className="text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Aktivitas Terkini</h2>
            </div>
            {aktivitas.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-white/40">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                  <BellRing size={24} className="text-white/20" />
                </div>
                <p className="text-sm font-semibold text-white/50">Belum Ada Aktivitas</p>
                <p className="text-[11px] text-white/30 mt-1">Aktivitas terbaru akan muncul di sini</p>
              </div>
            ) : (
              <div className="space-y-1">
                {aktivitas.map((a: any, i: number) => (
                  <div key={a.id || i} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.03] transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 flex-shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.3)]" />
                    <p className="text-xs text-white/60 flex-1 truncate">{a.judul || a.message}</p>
                    <span className="text-[10px] text-white/30 tabular-nums">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] relative">
              <div className="flex items-center gap-2 mb-4">
                <Target size={15} className="text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Ringkasan Akademik</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Mahasiswa Aktif', value: stats?.mahasiswa ?? 0, total: (stats?.mahasiswa + (stats?.alumni || 0)) || 1, color: 'bg-indigo-500' },
                  { label: 'Dosen Tetap', value: stats?.dosen ?? 0, total: Math.max(stats?.dosen || 1, 1), color: 'bg-emerald-500' },
                  { label: 'Program Studi', value: stats?.prodi ?? 0, total: Math.max(stats?.prodi || 1, 1), color: 'bg-cyan-500' },
                  { label: 'Tagihan Pending', value: stats?.tagihan ?? 0, total: Math.max(stats?.tagihan || 1, 1), color: 'bg-rose-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40">{item.label}</span>
                      <span className="font-bold text-white/80">{item.value}</span>
                    </div>
                    <ProgressBar value={item.value} total={item.total} color={item.color} />
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('laporan')} className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-400/70 hover:text-emerald-400 transition-colors">
                Lihat Laporan Lengkap <ArrowRight size={13} />
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] relative">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={15} className="text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Modul Terintegrasi</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Perpustakaan', path: 'perpustakaan', icon: Library, accent: 'text-amber-400', border: 'border-amber-500/20' },
                  { label: 'PPDB', path: 'ppdb', icon: Users, accent: 'text-indigo-400', border: 'border-indigo-500/20' },
                  { label: 'Keuangan', path: 'tagihan', icon: DollarSign, accent: 'text-rose-400', border: 'border-rose-500/20' },
                  { label: 'EDOM', path: 'edom', icon: BellRing, accent: 'text-purple-400', border: 'border-purple-500/20' },
                  { label: 'Akreditasi', path: 'akreditasi', icon: BookOpen, accent: 'text-cyan-400', border: 'border-cyan-500/20' },
                  { label: 'Integrasi LMS', path: 'integrasi-lms', icon: TrendingUp, accent: 'text-emerald-400', border: 'border-emerald-500/20' },
                ].map((mod) => (
                  <button key={mod.label} onClick={() => navigate(mod.path)}
                    className={`group relative overflow-hidden rounded-xl p-2.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] bg-white/[0.03] border ${mod.border} hover:bg-white/[0.06]`}>
                    <div className="relative flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${mod.accent} group-hover:scale-110 transition-transform duration-300`}>
                        <mod.icon size={15} />
                      </div>
                      <span className="text-xs font-semibold text-white/80">{mod.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
    </>
  );
}
