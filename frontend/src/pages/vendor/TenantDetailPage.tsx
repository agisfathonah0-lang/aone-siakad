import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get, put } from '../../api/client';
import { Building2, Users, GraduationCap, UserCheck, ArrowLeft, Loader2, Globe, Mail, Phone, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';

interface TenantDetail {
  id: string; slug: string; name: string; nama_pt: string; singkatan: string; paket: string; is_active: boolean;
  logo_url: string; alamat: string; telepon: string; email: string; website: string; custom_domain: string; subscription_end_date: string | null; created_at: string;
  stats: { studentCount: number; lecturerCount: number; userCount: number; prodiCount: number };
}

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    get<TenantDetail>(`/vendor/tenants/${id}`)
      .then(setTenant)
      .catch(err => setError(err.response?.data?.message || 'Tenant tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;
  if (error || !tenant) return <div className="text-center py-20"><Building2 className="w-12 h-12 text-zinc-400 mx-auto mb-3" /><p className="text-sm text-zinc-400">{error || 'Tenant tidak ditemukan'}</p></div>;

  const t = tenant;
  const color = t.is_active ? '#10b981' : '#a1a1aa';

  return (
    <div className="space-y-5 max-w-3xl">
      <Link to="/vendor/tenants" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 hover:text-indigo-500 transition-colors">
        <ArrowLeft size={13} /> Kembali ke Tenants
      </Link>

      <div className="card dark:dark-card p-5">
        <div className="flex items-center gap-4">
          {t.logo_url ? <img src={t.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover" /> : <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center"><Building2 size={24} className="text-slate-400" /></div>}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-display dark:text-white">{t.name}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.is_active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>{t.is_active ? 'Aktif' : 'Nonaktif'}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 capitalize">{t.paket}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t.nama_pt} · {t.slug}</p>
          </div>
          <a href={`/kampus/${t.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all">Lihat LP <Globe size={11} /></a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Mahasiswa', value: t.stats.studentCount, icon: Users },
          { label: 'Dosen', value: t.stats.lecturerCount, icon: UserCheck },
          { label: 'Prodi', value: t.stats.prodiCount, icon: GraduationCap },
          { label: 'Akun', value: t.stats.userCount, icon: Users },
        ].map(s => (
          <div key={s.label} className="card dark:dark-card p-4 text-center">
            <s.icon size={18} className="mx-auto mb-1.5 text-indigo-500" />
            <p className="text-xl font-bold font-display dark:text-white">{s.value}</p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card dark:dark-card p-5 space-y-3">
        <h2 className="text-sm font-bold dark:text-white">Informasi Kontak</h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {t.email && <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400"><Mail size={13} /><span>{t.email}</span></div>}
          {t.telepon && <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400"><Phone size={13} /><span>{t.telepon}</span></div>}
          {t.website && <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400"><Globe size={13} /><span>{t.website}</span></div>}
          {t.alamat && <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 col-span-2"><MapPin size={13} /><span>{t.alamat}</span></div>}
        </div>
      </div>

      <div className="card dark:dark-card p-5 space-y-3">
        <h2 className="text-sm font-bold dark:text-white">Langganan</h2>
        {t.subscription_end_date ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-zinc-400">Berlangganan s/d</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${new Date(t.subscription_end_date) < new Date() ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
              {new Date(t.subscription_end_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              {new Date(t.subscription_end_date) < new Date() ? ' (Kadaluarsa)' : ''}
            </span>
          </div>
        ) : <p className="text-xs text-slate-400">Tidak ada data langganan</p>}
      </div>

      {t.custom_domain && (
        <div className="card dark:dark-card p-5">
          <p className="text-xs font-semibold dark:text-white mb-1">Custom Domain</p>
          <p className="text-xs text-indigo-500 font-mono">{t.custom_domain}</p>
        </div>
      )}

      <div className="card dark:dark-card p-5">
        <p className="text-[10px] text-slate-400">Dibuat pada {new Date(t.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  );
}
