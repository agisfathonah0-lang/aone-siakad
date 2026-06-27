import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { get } from '../../api/client';
import { Users, BookOpen, School, UserCheck, TrendingUp, TrendingDown, Filter, ArrowRight, ChevronRight, BellRing, Clock, ClipboardCheck, CalendarPlus, UserPlus, Printer, BarChart3, Award } from 'lucide-react';

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

function StatCard({ icon: Icon, label, value, change, changeType, color }: { icon: any; label: string; value: string; change?: string; changeType?: 'up' | 'down'; color?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color || 'bg-primary'}`}><Icon size={18} className="text-white" /></div>
        {change && (
          <span className={`flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${changeType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
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

export default function AkademikDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [aktivitas, setAktivitas] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      get<any>('/akademik/mahasiswa?limit=1').catch(() => ({ pagination: { total: 0 } })),
      get<any>('/akademik/dosen?limit=1').catch(() => ({ pagination: { total: 0 } })),
      get<any>('/akademik/mata-kuliah?limit=1').catch(() => ({ pagination: { total: 0 } })),
      get<any>('/akademik/prodi?limit=1').catch(() => ({ pagination: { total: 0 } })),
      get<any>('/keuangan/tagihan?limit=1').catch(() => ({ pagination: { total: 0 } })),
      get<any>('/alumni/stats').catch(() => ({ total: 0 })),
    ]).then(([mhs, dsn, mk, prodi, tag, alm]) => {
      setStats({
        mahasiswa: mhs.pagination?.total || 0,
        dosen: dsn.pagination?.total || 0,
        matakuliah: mk.pagination?.total || 0,
        tagihan: tag.pagination?.total || 0,
        alumni: alm.total || 0,
        prodi: prodi.pagination?.total || 0,
      });
    }).finally(() => setLoading(false));
    get<{ rows: any[] }>('/akademik/notifikasi?limit=5').then(d => setAktivitas(d.rows || [])).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 rounded-lg" style={{ background: 'var(--muted)' }} />
            <div className="h-7 w-24 mt-3 rounded" style={{ background: 'var(--muted)' }} />
            <div className="h-3 w-20 mt-2 rounded" style={{ background: 'var(--muted)' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Mahasiswa" value={(stats?.mahasiswa ?? 0).toLocaleString()} change="+8.2%" changeType="up" color="bg-primary" />
        <StatCard icon={UserCheck} label="Total Dosen" value={(stats?.dosen ?? 0).toLocaleString()} change="+3.1%" changeType="up" color="bg-indigo-500" />
        <StatCard icon={BookOpen} label="Mata Kuliah" value={(stats?.matakuliah ?? 0).toLocaleString()} change="+12" changeType="up" color="bg-sky-500" />
        <StatCard icon={School} label="Program Studi" value={(stats?.prodi ?? 0).toLocaleString()} color="bg-violet-500" />
      </section>

      {/* Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Tren Pendaftaran Mahasiswa</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Jumlah mahasiswa per semester</p>
            </div>
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
          <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Distribusi Jurusan</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={jurusanData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {jurusanData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
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

      {/* Bottom Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Tren IPK</h2>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={ipkTrendData}>
              <defs>
                <linearGradient id="ipkGradAkd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="bln" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[3.0, 3.6]} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ipk" name="IPK" stroke="#6366F1" strokeWidth={2} fill="url(#ipkGradAkd)" dot={{ r: 3, fill: '#6366F1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: ClipboardCheck, label: 'Input Nilai', color: 'text-blue-600 bg-blue-50', path: 'nilai' },
              { icon: CalendarPlus, label: 'Buat Jadwal', color: 'text-indigo-600 bg-indigo-50', path: 'jadwal' },
              { icon: UserPlus, label: 'Tambah MHS', color: 'text-sky-600 bg-sky-50', path: 'mahasiswa' },
              { icon: BarChart3, label: 'Cetak Laporan', color: 'text-violet-600 bg-violet-50', path: 'laporan' },
            ].map(({ icon: Icon, label, color, path }) => (
              <button key={label} onClick={() => navigate(path)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all"
                style={{ borderColor: 'var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}><Icon size={14} /></div>
                <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Aktivitas Terkini</h2>
          {aktivitas.length === 0 ? (
            <div className="flex flex-col items-center py-6">
              <BellRing size={20} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
              <p className="text-xs font-semibold mt-2" style={{ color: 'var(--foreground)' }}>Belum Ada Aktivitas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {aktivitas.slice(0, 4).map((a: any, i: number) => (
                <div key={a.id || i} className="flex items-start gap-2 py-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: a.penting ? '#EF4444' : 'var(--muted-foreground)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium leading-snug" style={{ color: 'var(--foreground)' }}>{a.judul || a.message}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}><Clock size={8} className="inline mr-0.5" />{a.created_at ? new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
