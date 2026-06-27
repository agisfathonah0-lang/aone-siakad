import { useState, useEffect } from 'react';
import { get, post, put, patch, del } from '../../api/client';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import FileUpload from '../../components/ui/FileUpload';
import { confirm } from '../../context/ConfirmContext';

interface Berita {
  id: string;
  judul: string;
  slug: string;
  konten?: string;
  ringkasan?: string;
  gambar?: string;
  penulis?: string;
  status: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export default function BeritaPage() {
  const [data, setData] = useState<Berita[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Berita | null>(null);
  const [form, setForm] = useState({ judul: '', konten: '', ringkasan: '', gambar: '', penulis: '', status: 'draft' });

  const fetch = async () => {
    setLoading(true);
    try {
      const q = search ? `&q=${search}` : '';
      const res = await get<{ rows: Berita[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/akademik/berita?page=${page}&limit=20${q}`);
      setData(res.rows);
      setTotal(res.pagination.total);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [page]);
  const handleSearch = () => { setPage(1); fetch(); };

  const openCreate = () => {
    setEdit(null);
    setForm({ judul: '', konten: '', ringkasan: '', gambar: '', penulis: '', status: 'draft' });
    setModal(true);
  };

  const openEdit = (item: Berita) => {
    setEdit(item);
    setForm({ judul: item.judul, konten: item.konten || '', ringkasan: item.ringkasan || '', gambar: item.gambar || '', penulis: item.penulis || '', status: item.status || 'draft' });
    setModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (edit) await put(`/akademik/berita/${edit.id}`, form);
      else await post('/akademik/berita', form);
      setModal(false);
      fetch();
    } catch { /* */ }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm('Hapus berita ini?'))) return;
    await del(`/akademik/berita/${id}`);
    fetch();
  };

  const handlePublish = async (id: string, publish: boolean) => {
    await patch(`/akademik/berita/${id}/publish`, { publish });
    fetch();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight dark:text-white">Berita & Pengumuman</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Kelola berita dan pengumuman kampus.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
          <Plus size={14} /> Berita Baru
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Cari berita..." className="input-field pl-9" />
      </div>

      <DataTable
        columns={[
          { key: 'judul', label: 'Judul', render: (item: Berita) => <><p className="font-semibold text-sm dark:text-white">{item.judul}</p>{item.ringkasan && <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{item.ringkasan}</p>}</> },
          { key: 'penulis', label: 'Penulis', render: (item: Berita) => <span className="text-slate-500 text-xs">{item.penulis || '-'}</span> },
          { key: 'status', label: 'Status', render: (item: Berita) => <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : item.status === 'draft' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'}`}>{item.status}</span> },
          { key: 'is_published', label: 'Publikasi', render: (item: Berita) => item.is_published ? <CheckCircle size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-slate-300 dark:text-zinc-600" /> },
          { key: 'created_at', label: 'Dibuat', render: (item: Berita) => <span className="text-slate-400 text-xs">{new Date(item.created_at).toLocaleDateString('id')}</span> },
          { key: 'actions', label: '', render: (item: Berita) => <div className="flex gap-1 justify-end">
            <button onClick={() => handlePublish(item.id, !item.is_published)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 transition-colors" title={item.is_published ? 'Unpublish' : 'Publish'}>
              {item.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors">
              <Edit size={14} />
            </button>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div> },
        ]}
        data={data}
        loading={loading}
        page={page}
        totalPages={Math.ceil(total / 20)}
        onPageChange={setPage}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Berita' : 'Berita Baru'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Judul</label>
            <input type="text" required value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className="input-field" placeholder="Judul berita..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Ringkasan</label>
            <input value={form.ringkasan} onChange={(e) => setForm({ ...form, ringkasan: e.target.value })} className="input-field" placeholder="Ringkasan singkat..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Konten</label>
            <textarea rows={6} value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })} className="input-field font-mono text-xs" placeholder="Tulis konten berita disini..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Penulis</label>
              <input value={form.penulis} onChange={(e) => setForm({ ...form, penulis: e.target.value })} className="input-field" placeholder="Nama penulis" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Gambar</label>
              <FileUpload value={form.gambar} onChange={(v) => setForm({ ...form, gambar: v })} label="Gambar" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Batal</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Buat'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}