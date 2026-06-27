import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../api/client';
import { DollarSign, Receipt, CreditCard, TrendingUp, TrendingDown, CheckCircle, Clock, AlertCircle, ArrowRight, BarChart3, Wallet, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

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

function StatCard({ icon: Icon, label, value, color, change, changeType }: { icon: any; label: string; value: string; color: string; change?: string; changeType?: 'up' | 'down' }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4 hover:shadow-md transition-shadow" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon size={18} className="text-white" /></div>
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

const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const bulananData = [
  { bln: 'Jul', tagihan: 580, bayar: 420 },
  { bln: 'Agu', tagihan: 620, bayar: 510 },
  { bln: 'Sep', tagihan: 590, bayar: 490 },
  { bln: 'Okt', tagihan: 640, bayar: 530 },
  { bln: 'Nov', tagihan: 610, bayar: 480 },
  { bln: 'Des', tagihan: 560, bayar: 520 },
];

export default function KeuanganDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ tagihan: 0, pembayaranBulan: 0, pending: 0, lunas: 0, totalNominal: 0 });
  const [latestTagihan, setLatestTagihan] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      get<any>('/keuangan/tagihan?limit=5').catch(() => ({ pagination: { total: 0 }, data: { rows: [] } })),
      get<any>('/keuangan/pembayaran?limit=1').catch(() => ({ pagination: { total: 0 } })),
    ]).then(([t, p]) => {
      const rows = t.data?.rows || t.rows || [];
      const allTagihan = Array.isArray(t) ? t : rows;
      const pending = allTagihan.filter((x: any) => x.status === 'pending').length;
      const lunas = allTagihan.filter((x: any) => x.status === 'lunas').length;
      const totalNominal = allTagihan.reduce((sum: number, x: any) => sum + (x.nominal || 0), 0);
      setLatestTagihan(rows.slice(0, 5));
      setStats({
        tagihan: t.pagination?.total || 0,
        pembayaranBulan: p.pagination?.total || 0,
        pending, lunas, totalNominal,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 rounded-lg" style={{ background: 'var(--muted)' }} />
            <div className="h-7 w-24 mt-3 rounded" style={{ background: 'var(--muted)' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Receipt} label="Total Tagihan" value={stats.tagihan.toLocaleString()} color="bg-primary" change="+5" changeType="up" />
        <StatCard icon={CreditCard} label="Pembayaran Bulan Ini" value={stats.pembayaranBulan.toLocaleString()} color="bg-emerald-500" />
        <StatCard icon={Wallet} label="Nominal Terkumpul" value={rupiah(stats.totalNominal)} color="bg-violet-500" change="+12%" changeType="up" />
        <StatCard icon={AlertCircle} label="Pending" value={stats.pending.toString()} color="bg-amber-500" />
      </section>

      {/* Charts + Tagihan */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-5" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Realisasi Tagihan vs Pembayaran</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bulananData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="bln" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="tagihan" name="Tagihan" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bayar" name="Pembayaran" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Tagihan Terbaru</h2>
            <button onClick={() => navigate('tagihan')} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--primary)' }}>Lihat <ArrowRight size={12} /></button>
          </div>
          {latestTagihan.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <CheckCircle size={24} style={{ color: '#10B981' }} />
              <p className="text-xs font-semibold mt-2" style={{ color: 'var(--foreground)' }}>Tidak Ada Tagihan</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {latestTagihan.map((t: any) => {
                const SIcon = t.status === 'lunas' ? CheckCircle : t.status === 'overdue' ? AlertCircle : Clock;
                const sColor = t.status === 'lunas' ? '#10B981' : t.status === 'overdue' ? '#EF4444' : '#F59E0B';
                return (
                  <div key={t.id} className="flex items-center gap-2.5 p-2 rounded-lg transition-colors"
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    <SIcon size={12} style={{ color: sColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate" style={{ color: 'var(--foreground)' }}>{t.jenis?.replace('_', ' ') || 'Tagihan'}</p>
                      <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{t.tahun_akademik}</p>
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-mono)' }}>{rupiah(t.nominal)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Aksi Cepat */}
      <section className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { icon: Receipt, label: 'Kelola Tagihan', color: 'text-blue-600 bg-blue-50', path: 'tagihan' },
            { icon: CreditCard, label: 'Pembayaran', color: 'text-emerald-600 bg-emerald-50', path: 'pembayaran' },
            { icon: BarChart3, label: 'Laporan', color: 'text-violet-600 bg-violet-50', path: 'laporan' },
            { icon: Download, label: 'Cetak', color: 'text-amber-600 bg-amber-50', path: 'laporan' },
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
      </section>
    </div>
  );
}
