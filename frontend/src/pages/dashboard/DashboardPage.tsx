import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, DollarSign, GraduationCap, Loader2, FileSpreadsheet, Printer, Library, BellRing, TrendingUp, ArrowRight, Sparkles, School, UserCheck, BookMarked, ScrollText, ClipboardCheck, CreditCard, Bot, Wallet, Receipt, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';
import Badge from '../../components/ui/Badge';

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

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Memuat dashboard...</p>
      </div>
    </div>
  );

  const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const tagihanPending = tagihanMe.filter((t: any) => t.status === 'pending').length;
  const tagihanLunas = tagihanMe.filter((t: any) => t.status === 'lunas').length;
  const mhs = mhsProfile || {};
  const totalSks = khsData?.totalSks || 0;
  const ipk = khsData?.ipk || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold font-display tracking-tight dark:text-white">{greeting},</h1>
            <span className="text-2xl font-bold font-display text-emerald-500">{user?.nama?.split(' ')[0]}</span>
          </div>
          <p className="text-sm text-slate-400 dark:text-zinc-500">
            {isMahasiswa ? 'Selamat datang di portal mahasiswa' : 'Berikut ringkasan data kampus hari ini'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500">
          <BellRing size={14} />
          <span>{new Date().toLocaleDateString('id', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {isMahasiswa ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-1 bg-white dark:bg-zinc-900/50 rounded-2xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
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
                { label: 'Semester', value: mhs.semester || '-', icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                { label: 'IPK', value: ipk || '-', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { label: 'SKS Tempuh', value: totalSks || '-', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                { label: 'Tagihan', value: tagihanPending, extra: `${tagihanLunas} lunas`, icon: Wallet, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
              ].map((card) => (
                <div key={card.label} className="bg-white dark:bg-zinc-900/50 rounded-2xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
                  <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center ${card.color} mb-2.5`}>
                    <card.icon size={17} />
                  </div>
                  <p className="text-2xl font-extrabold dark:text-white">{card.value}</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 font-medium">{card.label}</p>
                  {card.extra && <p className="text-[10px] text-emerald-500 font-medium">{card.extra}</p>}
                </div>
              ))}
            </div>
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
            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
              <div className="flex items-center gap-2 mb-4">
                <Receipt size={15} className="text-emerald-500" />
                <h2 className="text-sm font-bold font-display dark:text-white">Tagihan Terkini</h2>
              </div>
              {tagihanMe.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-slate-400">
                  <CheckCircle size={28} className="text-emerald-400 mb-2" />
                  <p className="text-xs font-medium">Tidak ada tagihan</p>
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

            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-emerald-500" />
                <h2 className="text-sm font-bold font-display dark:text-white">Ringkasan Akademik</h2>
              </div>
              {!khsData?.semesters?.length ? (
                <div className="flex flex-col items-center py-6 text-slate-400">
                  <GraduationCap size={28} className="text-slate-300 mb-2" />
                  <p className="text-xs font-medium">Belum ada data KHS</p>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {[
              { label: 'Mahasiswa', value: stats?.mahasiswa ?? 0, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', ring: 'ring-indigo-500/10' },
              { label: 'Dosen', value: stats?.dosen ?? 0, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', ring: 'ring-emerald-500/10' },
              { label: 'Prodi', value: stats?.prodi ?? 0, icon: School, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', ring: 'ring-cyan-500/10' },
              { label: 'Mata Kuliah', value: stats?.matakuliah ?? 0, icon: BookMarked, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', ring: 'ring-amber-500/10' },
              { label: 'Tagihan', value: stats?.tagihan ?? 0, icon: DollarSign, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', ring: 'ring-rose-500/10' },
              { label: 'Alumni', value: stats?.alumni ?? 0, icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', ring: 'ring-purple-500/10' },
            ].map((card) => (
              <div key={card.label} className="relative group bg-white dark:bg-zinc-900/50 rounded-2xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" onClick={() => navigate(card.label.toLowerCase().replace(/\s+/g, '-'))}>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${adminGradientMap[card.label] || 'from-slate-500/5'} opacity-0 group-hover:opacity-100 transition-opacity`} />
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
              <button onClick={() => navigate('laporan')} className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
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
                  { label: 'Perpustakaan', path: 'perpustakaan', icon: Library, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                  { label: 'PPDB', path: 'ppdb', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                  { label: 'Keuangan', path: 'tagihan', icon: DollarSign, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                  { label: 'EDOM', path: 'edom', icon: BellRing, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                  { label: 'Akreditasi', path: 'akreditasi', icon: BookOpen, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
                  { label: 'Integrasi LMS', path: 'integrasi-lms', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
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
        </>
      )}
    </div>
  );
}
