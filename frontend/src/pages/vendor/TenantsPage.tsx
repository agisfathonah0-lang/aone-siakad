import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { get, post, put, del as apiDel } from '../../api/client';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, Search, Pencil, CheckCircle, XCircle, Filter, ExternalLink, Copy, Check, Trash2, Building2 } from 'lucide-react';

interface Tenant {
  id: string;
  slug: string;
  name: string;
  nama_pt: string;
  paket: string;
  is_active: boolean;
  logo_url: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  custom_domain: string;
  subscription_end_date: string | null;
  _studentCount: number;
  created_at: string;
}

const emptyForm = { name: '', nama_pt: '', slug: '', paket: 'basic', alamat: '', telepon: '', email: '', website: '', subscription_end_date: '', adminEmail: '', adminPassword: '', adminNama: '' };

function subStatus(tenant: Tenant): { label: string; color: string } {
  if (!tenant.subscription_end_date) return { label: 'Tidak Ada', color: 'bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400' };
  const end = new Date(tenant.subscription_end_date);
  const now = new Date();
  if (end < now) return { label: 'Expired', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  const diff = end.getTime() - now.getTime();
  if (diff < 30 * 24 * 60 * 60 * 1000) return { label: 'Akan Expired', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
  return { label: 'Aktif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
}

const FILTER_TABS = [
  { key: '', label: 'Semua' },
  { key: 'aktif', label: 'Aktif' },
  { key: 'expired', label: 'Expired' },
  { key: 'trial', label: 'Trial' },
] as const;

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPaket, setFilterPaket] = useState('');
  const [filterTab, setFilterTab] = useState('');
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Tenant | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const baseUrl = window.location.origin;

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await get<Tenant[]>('/vendor/tenants');
      setTenants(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }

  async function toggle(id: string) {
    await apiDel(`/vendor/tenants/${id}/toggle`);
    load();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDel(`/vendor/tenants/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } finally { setDeleting(false); }
  }

  function openCreate() {
    setEdit(null);
    setForm(emptyForm);
    setModal(true);
  }

  function openEdit(t: Tenant) {
    setEdit(t);
    setForm({ name: t.name, nama_pt: t.nama_pt || '', slug: t.slug, paket: t.paket, alamat: t.alamat || '', telepon: t.telepon || '', email: t.email || '', website: t.website || '', subscription_end_date: t.subscription_end_date ? t.subscription_end_date.slice(0, 16) : '', adminEmail: '', adminPassword: '', adminNama: '' });
    setModal(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (edit) {
      await put(`/vendor/tenants/${edit.id}`, { name: form.name, nama_pt: form.nama_pt, slug: form.slug || undefined, paket: form.paket, alamat: form.alamat, telepon: form.telepon, email: form.email, website: form.website, subscription_end_date: form.subscription_end_date || null });
      setModal(false);
      setEdit(null);
    } else {
      await post('/vendor/tenants', { slug: form.slug, name: form.name, nama_pt: form.nama_pt, paket: form.paket, adminEmail: form.adminEmail, adminPassword: form.adminPassword, adminNama: form.adminNama });
      setModal(false);
      setCreatedSlug(form.slug);
    }
    load();
  }

  const filtered = tenants.filter(t => {
    const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase()) || t.slug?.includes(search);
    const matchPaket = !filterPaket || t.paket === filterPaket;
    const sub = subStatus(t);
    const matchTab = !filterTab || filterTab === 'trial' ? !t.subscription_end_date : filterTab === 'aktif' ? sub.label === 'Aktif' || sub.label === 'Akan Expired' : filterTab === 'expired' ? sub.label === 'Expired' : true;
    return matchSearch && matchPaket && matchTab;
  });

  const paketColor: Record<string, string> = { basic: 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300', pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };

  const cols = [
    { key: 'name', label: 'Tenant', render: (r: Tenant) => <Link to={`/vendor/tenants/${r.id}`} className="hover:text-indigo-500 transition-colors"><p className="font-semibold text-sm dark:text-white">{r.name}</p><p className="text-[10px] text-slate-400">{r.slug}</p></Link> },
    { key: 'nama_pt', label: 'PT', render: (r: Tenant) => <span className="text-xs text-slate-500">{r.nama_pt || '-'}</span> },
    { key: 'paket', label: 'Paket', render: (r: Tenant) => <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${paketColor[r.paket] || 'bg-slate-100 text-slate-600'}`}>{r.paket}</span> },
    { key: '_studentCount', label: 'Mhs', render: (r: Tenant) => <span className="text-sm font-bold dark:text-white">{r._studentCount}</span> },
    { key: 'is_active', label: 'Status', render: (r: Tenant) => r.is_active ? <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-0.5 rounded">Aktif</span> : <span className="text-[10px] font-bold text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">Nonaktif</span> },
    { key: 'subscription', label: 'Subscription', render: (r: Tenant) => {
      const s = subStatus(r);
      return <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.color}`}>{s.label}</span>;
    } },
    { key: 'created_at', label: 'Dibuat', render: (r: Tenant) => <span className="text-[11px] text-slate-400">{new Date(r.created_at).toLocaleDateString('id-ID')}</span> },
    { key: 'id', label: '', render: (r: Tenant) => (
      <div className="flex gap-1 justify-end">
        <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => toggle(r.id)} className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors">{r.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />}</button>
        <button onClick={() => setDeleteTarget(r)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Manajemen Institusi</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">{tenants.length} kampus terdaftar</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
          <Plus size={16} /> Buat Institusi Baru
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === tab.key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="w-px h-5 bg-slate-200 dark:bg-zinc-700 mx-1" />
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari institusi..." className="input-field pl-9" />
        </div>
        <select value={filterPaket} onChange={e => setFilterPaket(e.target.value)} className="input-field max-w-[140px]">
          <option value="">Semua Paket</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      <DataTable columns={cols} data={filtered} loading={loading} />

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Institusi' : 'Buat Institusi Baru'} size="lg">
        <form onSubmit={save} className="space-y-4">
          {!edit && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama Institusi</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="input-field" /></div>
                <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Slug</label><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} required className="input-field" placeholder="nama-institusi" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama PT</label><input value={form.nama_pt} onChange={e => setForm({ ...form, nama_pt: e.target.value })} required className="input-field" /></div>
                <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Paket</label><select value={form.paket} onChange={e => setForm({ ...form, paket: e.target.value })} className="input-field"><option value="basic">Basic</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></div>
              </div>
              <div className="border-t border-slate-200 dark:border-zinc-700/50 pt-4">
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-3">Akun Admin Institusi</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama Admin</label><input value={form.adminNama} onChange={e => setForm({ ...form, adminNama: e.target.value })} required className="input-field" /></div>
                  <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Email Admin</label><input type="email" value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} required className="input-field" /></div>
                </div>
                <div className="mt-3"><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Password Admin</label><input type="password" value={form.adminPassword} onChange={e => setForm({ ...form, adminPassword: e.target.value })} required minLength={8} className="input-field" placeholder="Minimal 8 karakter" /></div>
              </div>
            </>
          )}
          {edit && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama Tenant</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="input-field" /></div>
                <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama PT</label><input value={form.nama_pt} onChange={e => setForm({ ...form, nama_pt: e.target.value })} className="input-field" /></div>
              </div>
              <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Slug</label><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className="input-field font-mono text-xs" placeholder="nama-institusi" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Paket</label><select value={form.paket} onChange={e => setForm({ ...form, paket: e.target.value })} className="input-field"><option value="basic">Basic</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></div>
                <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
              </div>
              <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Alamat</label><textarea value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} className="input-field" rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Telepon</label><input value={form.telepon} onChange={e => setForm({ ...form, telepon: e.target.value })} className="input-field" /></div>
                <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Website</label><input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="input-field" /></div>
              </div>
              <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Berlangganan s/d</label><input type="datetime-local" value={form.subscription_end_date} onChange={e => setForm({ ...form, subscription_end_date: e.target.value })} className="input-field" /></div>
            </>
          )}
          <button type="submit" className="btn-primary w-full justify-center">
            {edit ? 'Simpan Perubahan' : 'Buat Tenant'}
          </button>
        </form>
      </Modal>

      <Modal open={!!createdSlug} onClose={() => { setCreatedSlug(null); setCopied(false); }} title="Kampus Berhasil Dibuat">
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30">
            <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Tenant "{form.name}" berhasil dibuat!</p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">Kampus sudah aktif dan siap digunakan.</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Link Kampus</label>
            <div className="flex gap-2">
              <a href={`${baseUrl}/kampus/${createdSlug}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-700/50 border border-slate-200 dark:border-zinc-600 text-sm font-mono text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-700 transition">
                <ExternalLink size={14} />
                /kampus/{createdSlug}
              </a>
              <button onClick={() => { navigator.clipboard.writeText(`${baseUrl}/kampus/${createdSlug}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-600 transition flex items-center gap-1.5">
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? 'Tersalin' : 'Salin'}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1.5">Klik link untuk membuka halaman kampus.</p>
          </div>

          <div className="border-t border-slate-200 dark:border-zinc-700/50 pt-4 flex gap-3">
            <button onClick={() => { navigate(`/vendor/landing-pages`); }} className="btn-primary flex-1 justify-center">
              Kelola Landing Page
            </button>
            <button onClick={() => { setCreatedSlug(null); setCopied(false); }} className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-zinc-600 transition">
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} title="Hapus Tenant">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
            <p className="text-sm font-bold text-red-700 dark:text-red-300">Yakin ingin menghapus <strong>{deleteTarget?.name}</strong>?</p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">Semua data kampus ini akan dihapus permanen termasuk database schema. Tindakan ini tidak bisa dibatalkan.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-zinc-600 transition">Batal</button>
            <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-800 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-500/20">
              {deleting ? 'Menghapus...' : 'Hapus Tenant'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
