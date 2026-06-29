import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, Upload, CreditCard, CheckCircle, Clock, AlertCircle,
  ArrowRight, UserCheck, School, Hash, Calendar, User, Mail, Phone,
  MapPin, Sparkles, BookOpen, ChevronRight,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pendaftaran: { label: 'Pendaftaran', color: '#F59E0B', bg: 'bg-amber-50' },
  verifikasi: { label: 'Verifikasi', color: '#3B82F6', bg: 'bg-blue-50' },
  diterima: { label: 'Diterima', color: '#10B981', bg: 'bg-emerald-50' },
  ditolak: { label: 'Ditolak', color: '#EF4444', bg: 'bg-red-50' },
  daftar_ulang: { label: 'Daftar Ulang', color: '#8B5CF6', bg: 'bg-violet-50' },
};

function StatusTimeline({ status }: { status: string }) {
  const steps = ['pendaftaran', 'verifikasi', 'diterima'];
  const currentIdx = steps.indexOf(status);
  return (
    <div className="flex items-center gap-1 py-2">
      {steps.map((s, i) => {
        const done = i <= currentIdx;
        const cfg = statusConfig[s];
        return (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'text-white' : 'opacity-40'}`}
              style={{ background: done ? cfg.color : 'var(--muted)' }}>
              {done ? <CheckCircle size={14} /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 rounded transition-all" style={{ background: done ? cfg.color : 'var(--border)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{value}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      </div>
    </div>
  );
}

export default function CalonMahasiswaDashboard() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const base = `/kampus/${slug}`;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendaftar, setPendaftar] = useState<any>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Selamat Pagi');
    else if (h < 15) setGreeting('Selamat Siang');
    else if (h < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  useEffect(() => {
    get<any>('/ppdb/me')
      .then(setPendaftar)
      .catch(() => setPendaftar(null))
      .finally(() => setLoading(false));
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

  const cfg = statusConfig[pendaftar?.status] || statusConfig.pendaftaran;

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm" style={{ background: 'var(--primary)' }}>
            {(pendaftar?.nama || user?.nama || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{greeting}, {pendaftar?.nama || user?.nama}</p>
            <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
              <Hash size={11} /> {pendaftar?.nomor_daftar || '-'}
              <span className="inline-block w-1 h-1 rounded-full" style={{ background: 'var(--muted-foreground)' }} />
              <Badge variant={pendaftar?.status === 'diterima' ? 'success' : pendaftar?.status === 'ditolak' ? 'danger' : 'warning'} style={{ background: cfg.bg, color: cfg.color }}>
                {cfg.label}
              </Badge>
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={School} label="Program Studi" value={pendaftar?.prodi_nama || '-'} color="bg-blue-500" />
        <StatCard icon={BookOpen} label="Jenjang" value={pendaftar?.jenjang || '-'} color="bg-indigo-500" />
        <StatCard icon={Calendar} label="Tanggal Daftar" value={pendaftar?.created_at ? new Date(pendaftar.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'} color="bg-emerald-500" />
        <StatCard icon={Sparkles} label="Jalur" value={pendaftar?.jalur_pendaftaran || '-'} color="bg-violet-500" />
      </section>

      {/* Status Timeline */}
      <section className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h2 className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Status Pendaftaran</h2>
        <StatusTimeline status={pendaftar?.status || 'pendaftaran'} />
        {pendaftar?.status === 'diterima' && (
          <div className="mt-3 p-3 rounded-lg flex items-start gap-3" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
              Selamat! Pendaftaran Anda telah <strong>diterima</strong>. Silakan lakukan daftar ulang untuk melanjutkan ke proses selanjutnya.
            </p>
          </div>
        )}
        {pendaftar?.status === 'ditolak' && (
          <div className="mt-3 p-3 rounded-lg flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
              Mohon maaf, pendaftaran Anda belum dapat diterima. Silakan hubungi bagian administrasi untuk informasi lebih lanjut.
            </p>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => navigate(base + '/ppdb/upload-dokumen')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all"
              style={{ borderColor: 'var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50"><Upload size={14} /></div>
              <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--muted-foreground)' }}>Upload Dokumen</span>
            </button>
            <button onClick={() => navigate(base + '/ppdb/pembayaran')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all"
              style={{ borderColor: 'var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-50"><CreditCard size={14} /></div>
              <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--muted-foreground)' }}>Pembayaran</span>
            </button>
            <button onClick={() => navigate(base + '/profil')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all"
              style={{ borderColor: 'var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-violet-600 bg-violet-50"><User size={14} /></div>
              <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--muted-foreground)' }}>Profil Saya</span>
            </button>
            <button onClick={() => navigate(base + '/ppdb')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all"
              style={{ borderColor: 'var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-600 bg-amber-50"><FileText size={14} /></div>
              <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--muted-foreground)' }}>Detail PPDB</span>
            </button>
          </div>
        </div>

        {/* Data Diri */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Data Pendaftaran</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Informasi personal dan pendaftaran</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Hash, label: 'Nomor Daftar', value: pendaftar?.nomor_daftar },
              { icon: Mail, label: 'Email', value: pendaftar?.email || user?.email },
              { icon: Phone, label: 'No. HP', value: pendaftar?.no_hp },
              { icon: School, label: 'Program Studi', value: pendaftar?.prodi_nama },
              { icon: BookOpen, label: 'Jenjang', value: pendaftar?.jenjang },
              { icon: MapPin, label: 'Alamat', value: pendaftar?.alamat || '-' },
            ].filter(f => f.value).map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'var(--secondary)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--muted)' }}>
                  <Icon size={14} style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
