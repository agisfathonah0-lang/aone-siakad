import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../api/client';
import { Newspaper, BellRing, Megaphone, Calendar, TrendingUp, TrendingDown, ArrowRight, Plus, Eye, Clock, CheckCircle } from 'lucide-react';

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

const dummyBerita = [
  { judul: 'Wisuda Periode II Tahun 2024', tgl: '20 Des 2024', status: 'published', views: 1240 },
  { judul: 'Pendaftaran Mahasiswa Baru 2025/2026', tgl: '15 Des 2024', status: 'published', views: 2890 },
  { judul: 'Workshop Inovasi Pembelajaran Digital', tgl: '10 Des 2024', status: 'draft', views: 0 },
  { judul: 'Pengumuman Libur Akhir Tahun', tgl: '5 Des 2024', status: 'published', views: 980 },
];

export default function HumasDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [beritaCount, setBeritaCount] = useState(0);
  const [pengumumanCount, setPengumumanCount] = useState(0);

  useEffect(() => {
    Promise.all([
      get<any>('/akademik/berita?limit=1').catch(() => ({ pagination: { total: 0 } })),
    ]).then(([b]) => {
      setBeritaCount(b.pagination?.total || 4);
    }).finally(() => setLoading(false));
    setPengumumanCount(3);
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
        <StatCard icon={Newspaper} label="Berita Terbit" value={beritaCount.toString()} color="bg-primary" change="+3" changeType="up" />
        <StatCard icon={Megaphone} label="Pengumuman" value={pengumumanCount.toString()} color="bg-amber-500" />
        <StatCard icon={Eye} label="Total Tayangan" value="5.110" color="bg-emerald-500" change="+18%" changeType="up" />
        <StatCard icon={Calendar} label="Agenda" value="6" color="bg-violet-500" />
      </section>

      {/* Berita + Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Berita Terbaru</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Kabar terbaru kampus</p>
            </div>
            <button onClick={() => navigate('berita')} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--primary)' }}>
              Kelola <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {dummyBerita.slice(0, 4).map((b, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg transition-colors cursor-pointer"
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--muted)' }}>
                  <Newspaper size={14} style={{ color: 'var(--primary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>{b.judul}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {b.tgl} · {b.views.toLocaleString()} dilihat
                  </p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${b.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {b.status === 'published' ? 'Terbit' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Aksi Cepat</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Plus, label: 'Buat Berita', color: 'text-blue-600 bg-blue-50', path: 'berita' },
                { icon: Megaphone, label: 'Pengumuman', color: 'text-amber-600 bg-amber-50', path: 'pengumuman' },
                { icon: Calendar, label: 'Agenda', color: 'text-violet-600 bg-violet-50', path: 'kalender' },
                { icon: Eye, label: 'Landing Page', color: 'text-emerald-600 bg-emerald-50', path: 'landing-page' },
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
        </div>
      </section>
    </div>
  );
}
