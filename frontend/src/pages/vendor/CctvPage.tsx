import { useState, useEffect, useRef } from 'react';
import { get, post, put, del as apiDel } from '../../api/client';
import Modal from '../../components/ui/Modal';
import FileUpload from '../../components/ui/FileUpload';
import { Cctv, Plus, Loader2, Pencil, Trash2, Camera, Play, ExternalLink, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface Camera {
  id: string; name: string; tenant_id: string; tenant_name?: string;
  rtsp_url: string; snapshot_url: string; location: string;
  status: string; created_at: string;
}

export default function CctvPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', tenant_id: '', rtsp_url: '', snapshot_url: '', location: '' });
  const [viewing, setViewing] = useState<Camera | null>(null);

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
    setForm({ name: '', tenant_id: '', rtsp_url: '', snapshot_url: '', location: '' });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Hapus kamera ini?')) return;
    await apiDel(`/vendor/cctv/${id}`);
    load();
  }

  function openCreate() { setEditing(null); setForm({ name: '', tenant_id: '', rtsp_url: '', snapshot_url: '', location: '' }); setModal(true); }
  function openEdit(c: Camera) { setEditing(c.id); setForm({ name: c.name, tenant_id: c.tenant_id, rtsp_url: c.rtsp_url, snapshot_url: c.snapshot_url, location: c.location }); setModal(true); }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">CCTV</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Monitoring kamera pengawas ({cameras.length})</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
          <Plus size={14} /> Tambah Kamera
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameras.map(c => (
          <CameraCard key={c.id} camera={c} onEdit={() => openEdit(c)} onDelete={() => remove(c.id)} onView={() => setViewing(c)} />
        ))}
        {cameras.length === 0 && <div className="col-span-full text-center py-16 text-sm text-slate-400 dark:text-zinc-500">Belum ada kamera terdaftar</div>}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Kamera' : 'Tambah Kamera'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama Kamera</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="input-field" placeholder="Kamera Gerbang Utama" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Lokasi</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="Gerbang Utama, Lantai 2" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">RTSP Stream URL</label><input value={form.rtsp_url} onChange={e => setForm({ ...form, rtsp_url: e.target.value })} className="input-field font-mono text-xs" placeholder="rtsp://username:password@ip:port/stream" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Snapshot URL (HTTP)</label><FileUpload value={form.snapshot_url} onChange={(v) => setForm({ ...form, snapshot_url: v })} accept="image/*" hint="URL snapshot kamera atau upload gambar test" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tenant</label><select value={form.tenant_id} onChange={e => setForm({ ...form, tenant_id: e.target.value })} required className="input-field"><option value="">Pilih Tenant</option>{tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{editing ? 'Update' : 'Simpan'}</button>
        </form>
      </Modal>

      {/* Live View Modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name || 'Live View'} size="xl">
        {viewing && <LiveView camera={viewing} />}
      </Modal>
    </div>
  );
}

function CameraCard({ camera, onEdit, onDelete, onView }: { camera: Camera; onEdit: () => void; onDelete: () => void; onView: () => void }) {
  return (
    <div className="bg-white dark:bg-zinc-900/50 rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 hover:shadow-md transition-all group">
      {/* Snapshot Preview */}
      <div className="relative h-40 bg-zinc-900 overflow-hidden">
        {camera.snapshot_url ? (
          <img src={camera.snapshot_url} alt={camera.name} className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.querySelector('.fallback')?.classList.remove('hidden'); }} />
        ) : null}
        <div className={`fallback ${camera.snapshot_url ? 'hidden' : ''} absolute inset-0 flex items-center justify-center`}>
          <Camera size={32} className="text-zinc-700" />
        </div>
        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] text-white/80">
          {camera.status === 'Aktif' ? <Wifi size={10} className="text-emerald-400" /> : <WifiOff size={10} className="text-red-400" />}
          {camera.status || 'Aktif'}
        </div>
        <button onClick={onView} className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all group/play">
          <div className="w-10 h-10 rounded-full bg-emerald-500/90 flex items-center justify-center opacity-0 group-hover/play:opacity-100 transition-all scale-90 group-hover/play:scale-100">
            <Play size={16} className="text-white ml-0.5" />
          </div>
        </button>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <p className="font-bold text-sm dark:text-white truncate">{camera.name}</p>
          <span className="text-[9px] text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">{camera.tenant_name || 'N/A'}</span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mb-2">{camera.location || '-'}</p>
        {camera.rtsp_url && (
          <a href={camera.rtsp_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] text-indigo-500 hover:text-indigo-400 font-mono truncate" title={camera.rtsp_url}>
            <ExternalLink size={9} /> RTSP
          </a>
        )}
        <div className="flex gap-2 pt-2 mt-2 border-t border-slate-100 dark:border-zinc-800/30">
          <button onClick={onEdit} className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors"><Pencil size={12} /> Edit</button>
          <button onClick={onDelete} className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-500 transition-colors"><Trash2 size={12} /> Hapus</button>
        </div>
      </div>
    </div>
  );
}

function LiveView({ camera }: { camera: Camera }) {
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoading(true);
    const timer = setInterval(() => {
      setRefresh(r => r + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative bg-zinc-900 rounded-xl overflow-hidden" style={{ minHeight: 300 }}>
        {camera.snapshot_url ? (
          <img ref={imgRef} key={refresh} src={`${camera.snapshot_url}${camera.snapshot_url.includes('?') ? '&' : '?'}_t=${Date.now()}`}
            alt={camera.name} className="w-full h-auto object-contain"
            onLoad={() => setLoading(false)} onError={() => setLoading(false)} />
        ) : (
          <div className="flex items-center justify-center" style={{ minHeight: 300 }}>
            <Camera size={48} className="text-zinc-700" />
          </div>
        )}
        {loading && <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/60"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>}
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-black/60 text-[9px] text-emerald-400 flex items-center gap-1"><RefreshCw size={9} /> Live</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <div className="space-y-0.5">
          <p className="font-bold text-zinc-300">{camera.name}</p>
          <p>{camera.location}</p>
        </div>
        <div className="flex gap-2">
          {camera.rtsp_url && (
            <a href={camera.rtsp_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] flex items-center gap-1 transition-colors">
              <ExternalLink size={11} /> Buka RTSP
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
