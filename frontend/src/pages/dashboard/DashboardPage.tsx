import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { get } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Users, BookOpen, DollarSign, GraduationCap, TrendingUp, TrendingDown, ArrowUpRight,
  BellRing, ArrowRight, School, UserCheck, BookMarked, ScrollText, ClipboardCheck,
  CreditCard, Receipt, CheckCircle, Clock, AlertCircle, BarChart3, Activity,
  UserPlus, CalendarPlus, Printer, ChevronRight, Sparkles, Award, Wallet,
  Building2, Filter, Search, Dot, Eye, Plus, Download,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-500', indigo: 'bg-indigo-500', sky: 'bg-sky-500', violet: 'bg-violet-500',
  emerald: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500', cyan: 'bg-cyan-500',
};

const adminQuickActions = [
  { label: 'Input Nilai', icon: ClipboardCheck, color: 'text-blue-600 bg-blue-50', path: 'nilai' },
  { label: 'Buat Jadwal', icon: CalendarPlus, color: 'text-indigo-600 bg-indigo-50', path: 'jadwal' },
  { label: 'Tambah MHS', icon: UserPlus, color: 'text-sky-600 bg-sky-50', path: 'mahasiswa' },
  { label: 'Cetak Laporan', icon: Printer, color: 'text-violet-600 bg-violet-50', path: 'laporan' },
];

const mhsQuickActions = [
  { label: 'Lihat KHS', icon: ScrollText, color: 'text-blue-600 bg-blue-50', path: 'khs' },
  { label: 'Cek Tagihan', icon: Receipt, color: 'text-emerald-600 bg-emerald-50', path: 'tagihan' },
  { label: 'KRS Aktif', icon: ClipboardCheck, color: 'text-amber-600 bg-amber-50', path: 'krs' },
  { label: 'Riwayat Bayar', icon: CreditCard, color: 'text-violet-600 bg-violet-50', path: 'riwayat-pembayaran' },
];

const enrollmentData = [
  { sem: '2020/1', mhs: 412 }, { sem: '2020/2', mhs: 389 },
  { sem: '2021/1', mhs: 478 }, { sem: '2021/2', mhs: 521 },
  { sem: '2022/1', mhs: 596 }, { sem: '2022/2', mhs: 548 },
  { sem: '2023/1', mhs: 634 }, { sem: '2023/2', mhs: 712 },
];

const jurusanData = [
  { name: 'Teknik Informatika', value: 34, color: '#2563EB' },
  { name: 'Sistem Informasi', value: 28, color: '#6366F1' },
  { name: 'Manajemen Bisnis', value: 22, color: '#0EA5E9' },
  { name: 'Teknik Elektro', value: 16, color: '#10B981' },
];

const ipkTrendData = [
  { bln: 'Jan', ipk: 3.21 }, { bln: 'Feb', ipk: 3.18 }, { bln: 'Mar', ipk: 3.35 },
  { bln: 'Apr', ipk: 3.29 }, { bln: 'Mei', ipk: 3.42 }, { bln: 'Jun', ipk: 3.38 },
  { bln: 'Jul', ipk: 3.51 }, { bln: 'Agu', ipk: 3.47 },
];

const pengumuman = [
  { judul: 'Pendaftaran KRS Semester Genap 2024/2025', waktu: '2 jam lalu', penting: true },
  { judul: 'Jadwal UTS Semester Ganjil telah diumumkan', waktu: '5 jam lalu', penting: true },
  { judul: 'Workshop AI & Machine Learning', waktu: '1 hari lalu', penting: false },
  { judul: 'Pengumuman Beasiswa Bidikmisi Periode II', waktu: '2 hari lalu', penting: false },
];

function initialAvatar(nama?: string) {
  if (!nama) return '?';
  return nama.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-mono font-semibold">{p.value}</span></p>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, changeType, color }: {
  icon: any; label: string; value: string; change?: string; changeType?: 'up' | 'down'; color?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color || 'bg-primary'}`}>
          <Icon size={18} className="text-white" />
        </div>
        {change && (
          <span className={`flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
            changeType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`} style={{ fontFamily: 'var(--font-mono)' }}>
            {changeType === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{change}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{value}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      </div>
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
    <div ref={ref} className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--muted)' }}>
      <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: visible ? `${pct}%` : '0%', background: `linear-gradient(90deg, ${color}88, ${color})` }} />
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [mhsProfile, setMhsProfile] = useState<any>(null);
  const [khsData, setKhsData] = useState<any>(null);
  const [tagihanMe, setTagihanMe] = useState<any[]>([]);
  const [aktivitas, setAktivitas] = useState<any[]>([]);

  const isMahasiswa = user?.role === 'mahasiswa';

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Selamat Pagi');
    else if (h < 15) setGreeting('Selamat Siang');
    else if (h < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  useEffect(() => {
    if (isMahasiswa) {
      Promise.all([
        get<any>('/akademik/krs/me').catch(() => null),
        get<any>('/akademik/nilai/khs').catch(() => null),
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-lg" style={{ background: 'var(--muted)' }} />
              <div className="h-7 w-24 mt-3 rounded" style={{ background: 'var(--muted)' }} />
              <div className="h-3 w-20 mt-2 rounded" style={{ background: 'var(--muted)' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isMahasiswa ? (
        <>
          {/* ── STAT CARDS ── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Mahasiswa Aktif" value={(stats?.mahasiswa ?? 0).toLocaleString()} change="+8.2%" changeType="up" color="bg-primary" />
            <StatCard icon={UserCheck} label="Total Dosen Aktif" value={(stats?.dosen ?? 0).toLocaleString()} change="+3.1%" changeType="up" color="bg-indigo-500" />
            <StatCard icon={BookOpen} label="Mata Kuliah Aktif" value={(stats?.matakuliah ?? 0).toLocaleString()} change="+12" changeType="up" color="bg-sky-500" />
            <StatCard icon={Award} label="IPK Rata-rata" value={(stats?.mahasiswa ? '3.47' : '—')} change="-0.04" changeType="down" color="bg-violet-500" />
          </section>

          {/* ── CHARTS ── */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Tren Pendaftaran Mahasiswa</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Jumlah mahasiswa per semester akademik</p>
                </div>
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--muted-foreground)', background: 'var(--muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--foreground)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)'; }}>
                  <Filter size={12} /> Filter
                </button>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={enrollmentData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis dataKey="sem" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.05)' }} />
                  <Bar dataKey="mhs" name="Mahasiswa" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="mb-4">
                <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Distribusi Jurusan</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Persentase per program studi</p>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={jurusanData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {jurusanData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {jurusanData.map(j => (
                  <div key={j.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: j.color }} />
                      <span className="text-xs truncate max-w-[130px]" style={{ color: 'var(--muted-foreground)' }}>{j.name}</span>
                    </div>
                    <span className="text-xs font-mono font-semibold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-mono)' }}>{j.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── BOTTOM ROW ── */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Tren IPK</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Rata-rata IPK 2023</p>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                  <TrendingUp size={10} /> +0.13
                </span>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={ipkTrendData}>
                  <defs>
                    <linearGradient id="ipkGradDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                  <XAxis dataKey="bln" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[3.0, 3.6]} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="ipk" name="IPK" stroke="#6366F1" strokeWidth={2} fill="url(#ipkGradDash)" dot={{ r: 3, fill: '#6366F1' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Aksi Cepat</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Tugas umum administrasi kampus</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {adminQuickActions.map(({ icon: Icon, label, color, path }) => (
                  <button key={label} onClick={() => navigate(path)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all group"
                    style={{ borderColor: 'var(--border)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}><Icon size={14} /></div>
                    <span className="text-[10px] font-medium text-center leading-tight transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--foreground)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)'; }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── BOTTOM SECTION ── */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Aktivitas Terkini</h2>
                <button onClick={() => navigate('notifikasi')} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--primary)' }}>
                  Lihat semua <ChevronRight size={12} />
                </button>
              </div>
              {aktivitas.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                    <BellRing size={20} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
                  </div>
                  <p className="text-sm font-semibold mt-3" style={{ color: 'var(--foreground)' }}>Belum Ada Aktivitas</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Aktivitas terbaru akan muncul di sini</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {aktivitas.map((a: any, i: number) => (
                    <div key={a.id || i} className="px-5 py-3.5 transition-colors cursor-pointer group"
                      style={{ borderColor: 'var(--border)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <div className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: a.penting ? '#EF4444' : 'var(--muted-foreground)' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-snug transition-colors"
                            style={{ color: 'var(--foreground)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--foreground)'; }}>
                            {a.judul || a.message || a.deskripsi}
                          </p>
                          <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                            <Clock size={9} />
                            {a.created_at ? new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Ringkasan Akademik</p>
                <div className="space-y-3">
                  {[
                    { label: 'Mahasiswa Aktif', value: stats?.mahasiswa ?? 0, total: (stats?.mahasiswa + (stats?.alumni || 0)) || 1, color: '#3b82f6' },
                    { label: 'Dosen Tetap', value: stats?.dosen ?? 0, total: Math.max(stats?.dosen || 1, 1), color: '#10b981' },
                    { label: 'Program Studi', value: stats?.prodi ?? 0, total: Math.max(stats?.prodi || 1, 1), color: '#8b5cf6' },
                    { label: 'Tagihan Pending', value: stats?.tagihan ?? 0, total: Math.max(stats?.tagihan || 1, 1), color: '#ef4444' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: 'var(--muted-foreground)' }}>{item.label}</span>
                        <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{item.value.toLocaleString()}</span>
                      </div>
                      <ProgressBar value={item.value} total={item.total} color={item.color} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Pengumuman</h2>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {pengumuman.map((p, i) => (
                  <div key={i} className="px-5 py-3.5 transition-colors cursor-pointer group"
                    style={{ borderColor: 'var(--border)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    <div className="flex items-start gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${p.penting ? '' : ''}`}
                        style={{ background: p.penting ? '#EF4444' : 'var(--muted-foreground)' }} />
                      <div>
                        <p className="text-xs font-medium leading-snug transition-colors"
                          style={{ color: 'var(--foreground)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--foreground)'; }}>{p.judul}</p>
                        <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}><Clock size={9} /> {p.waktu}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Aksi Cepat</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: ClipboardCheck, label: 'Input Nilai', color: 'text-blue-600 bg-blue-50' },
                    { icon: CalendarPlus, label: 'Buat Jadwal', color: 'text-indigo-600 bg-indigo-50' },
                    { icon: UserPlus, label: 'Tambah MHS', color: 'text-sky-600 bg-sky-50' },
                    { icon: BarChart3, label: 'Cetak Laporan', color: 'text-violet-600 bg-violet-50' },
                  ].map(({ icon: Icon, label, color }) => (
                    <button key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all group"
                      style={{ borderColor: 'var(--border)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}><Icon size={14} /></div>
                      <span className="text-[10px] font-medium text-center leading-tight transition-colors"
                        style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--foreground)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)'; }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* ═══ MAHASISWA VIEW ═══ */
        <>
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0 shadow-sm"
                  style={{ background: 'var(--primary)' }}>
                  {(mhs.nama || user?.nama || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-mono font-medium" style={{ color: 'var(--muted-foreground)' }}>{mhs.nim || '-'}</p>
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{mhs.nama || user?.nama}</p>
                </div>
              </div>
              <div className="space-y-2.5 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                {[
                  ['Program Studi', `${mhs.prodi_jenjang || ''} ${mhs.prodi_nama || '-'}`],
                  ['Angkatan', mhs.angkatan || '-'],
                  ['Semester', mhs.semester || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center text-xs">
                    <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                    <span className="font-semibold text-right truncate ml-2" style={{ color: 'var(--foreground)' }}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Status</span>
                  <Badge variant={mhs.status === 'aktif' ? 'success' : 'warning'}>{mhs.status || '-'}</Badge>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Semester Berjalan" value={mhs.semester || '-'} icon={GraduationCap} color="bg-blue-500" />
              <StatCard label="IPK" value={ipk ? ipk.toString() : '-'} icon={BarChart3} color="bg-emerald-500" />
              <StatCard label="SKS Aktif" value={totalSks ? `${totalSks} SKS` : '-'} icon={BookOpen} color="bg-amber-500" />
              <StatCard label="Tagihan" value={tagihanPending.toString()} icon={Wallet} color="bg-red-500" />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Aksi Cepat</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Fitur utama untuk mahasiswa</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {mhsQuickActions.map(({ icon: Icon, label, color, path }) => (
                  <button key={label} onClick={() => navigate(path)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all group"
                    style={{ borderColor: 'var(--border)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}><Icon size={14} /></div>
                    <span className="text-[10px] font-medium text-center leading-tight transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--foreground)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)'; }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Aktivitas Terkini</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Notifikasi dan event terbaru</p>
                </div>
              </div>
              {aktivitas.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                    <BellRing size={20} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
                  </div>
                  <p className="text-sm font-semibold mt-3" style={{ color: 'var(--foreground)' }}>Belum Ada Aktivitas</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Aktivitas terbaru akan muncul di sini</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {aktivitas.map((a: any, i: number) => (
                    <div key={a.id || i} className="py-3 transition-colors cursor-pointer group"
                      style={{ borderColor: 'var(--border)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <div className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#10B981' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-snug" style={{ color: 'var(--foreground)' }}>{a.judul || a.message || a.deskripsi}</p>
                          <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                            <Clock size={9} />
                            {a.created_at ? new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Tagihan + KHS ── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Tagihan Terkini</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{tagihanPending} menunggu pembayaran</p>
                </div>
              </div>
              {tagihanMe.length === 0 ? (
                <div className="flex flex-col items-center py-10">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                    <CheckCircle size={20} style={{ color: '#10B981' }} />
                  </div>
                  <p className="text-sm font-semibold mt-3" style={{ color: 'var(--foreground)' }}>Tidak Ada Tagihan</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Semua tagihan telah dibayar</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {tagihanMe.slice(0, 4).map((t: any) => {
                    const StatIcon = t.status === 'lunas' ? CheckCircle : t.status === 'overdue' ? AlertCircle : Clock;
                    const statusColor = t.status === 'lunas' ? '#10B981' : t.status === 'overdue' ? '#EF4444' : '#F59E0B';
                    return (
                      <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg border border-transparent transition-all"
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${statusColor}15` }}>
                            <StatIcon size={14} style={{ color: statusColor }} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold capitalize" style={{ color: 'var(--foreground)' }}>{t.jenis?.replace('_', ' ') || 'Tagihan'}</p>
                            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{t.tahun_akademik} - Semester {t.semester}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-mono)' }}>{rupiah(t.nominal)}</span>
                      </div>
                    );
                  })}
                  {tagihanMe.length > 4 && (
                    <button onClick={() => navigate('tagihan')} className="flex items-center gap-1.5 text-xs font-medium mt-1 hover:underline"
                      style={{ color: 'var(--primary)' }}>
                      Lihat semua tagihan <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Ringkasan KHS</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>IPK: {ipk} | Total SKS: {totalSks}</p>
                </div>
              </div>
              {!khsData?.semesters?.length ? (
                <div className="flex flex-col items-center py-10">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                    <GraduationCap size={20} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
                  </div>
                  <p className="text-sm font-semibold mt-3" style={{ color: 'var(--foreground)' }}>Belum Ada Data KHS</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Data akan muncul setelah KHS diterbitkan</p>
                </div>
              ) : (
                <>
                  {ipData.length > 1 && (
                    <div className="mb-4 p-3.5 rounded-lg" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Trend IP per Semester</p>
                      <div className="flex items-end gap-2" style={{ height: 72 }}>
                        {(() => {
                          const maxVal = Math.max(...ipData.map((d: any) => d.value), 1);
                          return ipData.map((d: any, i: number) => {
                            const h = (d.value / (maxVal * 1.15)) * 100;
                            const c = d.value >= 3 ? '#10B981' : d.value >= 2.5 ? '#F59E0B' : '#EF4444';
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                                <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>{d.value.toFixed(2)}</span>
                                <div className="w-full rounded-sm transition-all duration-700 relative" style={{ height: `${Math.max(h, 3)}%`, background: c }}>
                                  <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 rounded-sm" />
                                </div>
                                <span className="text-[7px] truncate w-full text-center" style={{ color: 'var(--muted-foreground)' }}>{d.label}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    {khsData.semesters.slice(-4).reverse().map((sem: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-transparent transition-all"
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold"
                            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{sem.semester}</div>
                          <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Semester {sem.semester}</p>
                            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{sem.totalSks} SKS {sem.tahunAkademik ? `· ${sem.tahunAkademik}` : ''}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold ${sem.ip >= 3 ? 'text-emerald-500' : sem.ip >= 2.5 ? 'text-amber-500' : 'text-red-500'}`}
                          style={{ fontFamily: 'var(--font-mono)' }}>{sem.ip}</span>
                      </div>
                    ))}
                    {khsData.semesters.length > 4 && (
                      <button onClick={() => navigate('khs')} className="flex items-center gap-1.5 text-xs font-medium mt-1 hover:underline"
                        style={{ color: 'var(--primary)' }}>
                        Lihat KHS lengkap <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
