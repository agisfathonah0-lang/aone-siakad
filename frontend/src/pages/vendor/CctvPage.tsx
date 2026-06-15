import { useState, useEffect } from 'react';
import { get, post, put, del as apiDel } from '../../api/client';
import Modal from '../../components/ui/Modal';
import { Cctv, Plus, Loader2, Pencil, Trash2, Camera } from 'lucide-react';

interface Camera {
  id: string;
  name: string;
  tenant_id: string;
  tenant_name?: string;
  rtsp_url: string;
  location: string;
  is_active: boolean;
  created_at: string;
}

export default function CctvPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', tenant_id: '', rtsp_url: '', location: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [c, t] = await Promise.all([get<Camera[]>('/vendor/cctv'), get<any[]>('/vendor/tenants')]);
      setCameras(Array.isArray(c) ? c : []);
      setTenants(Array.isArray(t) ? t : []);
    } finally { setLoading(false); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (editing) { await put(`/vendor/cctv/${editing}`, form); setEditing(null); }
    else { await post('/vendor/cctv', form); }
    setModal(false);
    setForm({ name: '', tenant_id: '', rtsp_url: '', location: '' });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Hapus kamera ini?')) return;
    await apiDel(`/vendor/cctv/${id}`);
    load();
  }

  function openCreate() { setEditing(null); setForm({ name: '', tenant_id: '', rtsp_url: '', location: '' }); setModal(true); }
  function openEdit(c: Camera) { setEditing(c.id); setForm({ name: c.name, tenant_id: c.tenant_id, rtsp_url: c.rtsp_url, location: c.location }); setModal(true); }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">CCTV</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Manajemen kamera pengawas ({cameras.length})</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
          <Plus size={14} /> Tambah Kamera
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameras.map(c => (
          <div key={c.id} className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <Camera size={20} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm dark:text-white">{c.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{c.tenant_name || 'N/A'}</p>
              </div>
            </div>
            <div className="text-xs space-y-1 mb-3">
              <p className="text-slate-400 dark:text-zinc-500 font-mono truncate" title={c.rtsp_url}>{c.rtsp_url}</p>
              <p className="text-slate-500 dark:text-zinc-400">{c.location || '-'}</p>
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800/30">
              <button onClick={() => openEdit(c)} className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors"><Pencil size={12} /> Edit</button>
              <button onClick={() => remove(c.id)} className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-500 transition-colors"><Trash2 size={12} /> Hapus</button>
            </div>
          </div>
        ))}
        {cameras.length === 0 && <div className="col-span-full text-center py-16 text-sm text-slate-400 dark:text-zinc-500">Belum ada kamera terdaftar</div>}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Kamera' : 'Tambah Kamera'}>
        <form onSubmit={save} className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama Kamera</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="input-field" placeholder="Kamera Gerbang Utama" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Stream URL</label><input value={form.rtsp_url} onChange={e => setForm({ ...form, rtsp_url: e.target.value })} required className="input-field font-mono text-xs" placeholder="rtsp://..." /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Lokasi</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="Gerbang Utama, Lantai 2" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tenant</label><select value={form.tenant_id} onChange={e => setForm({ ...form, tenant_id: e.target.value })} required className="input-field"><option value="">Pilih Tenant</option>{tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{editing ? 'Update' : 'Simpan'}</button>
        </form>
      </Modal>
    </div>
  );
}