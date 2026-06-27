import { useState, useEffect } from 'react';
import { get, post, put, del as apiDel } from '../../api/client';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { confirm } from '../../context/ConfirmContext';

interface Prodi {
  id: string;
  kode: string;
  nama: string;
  jenjang: string;
  fakultas: string;
  akreditasi: string;
  created_at: string;
}

export default function ProdiPage() {
  const [data, setData] = useState<Prodi[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Prodi | null>(null);
  const [form, setForm] = useState({ kode: '', nama: '', jenjang: 'S1', fakultas: '', akreditasi: '' });

  useEffect(() => { load(); }, [page, search]);

  async function load() {
    setLoading(true);
    try {
      const res = await get<any>(`/akademik/prodi?page=${page}&limit=20&q=${search}`);
      setData(res.rows || []);
      setTotal(res.pagination?.total || 0);
    } finally { setLoading(false); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (edit) { await put(`/akademik/prodi/${edit.id}`, form); }
    else { await post('/akademik/prodi', form); }
    setModal(false);
    setEdit(null);
    setForm({ kode: '', nama: '', jenjang: 'S1', fakultas: '', akreditasi: '' });
    load();
  }

  async function remove(id: string) {
    if (!(await confirm('Hapus program studi ini?'))) return;
    await apiDel(`/akademik/prodi/${id}`);
    load();
  }

  function openEdit(item: Prodi) {
    setEdit(item);
    setForm({ kode: item.kode, nama: item.nama, jenjang: item.jenjang, fakultas: item.fakultas || '', akreditasi: item.akreditasi || '' });
    setModal(true);
  }

  const cols = [
    { key: 'kode', label: 'Kode' },
    { key: 'nama', label: 'Program Studi' },
    { key: 'jenjang', label: 'Jenjang', render: (r: Prodi) => <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800">{r.jenjang}</span> },
    { key: 'fakultas', label: 'Fakultas' },
    { key: 'akreditasi', label: 'Akreditasi', render: (r: Prodi) => r.akreditasi ? <span className={`text-xs font-bold px-2 py-0.5 rounded ${r.akreditasi === 'Unggul' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : r.akreditasi === 'Baik Sekali' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600'}`}>{r.akreditasi}</span> : '-' },
    { key: 'id', label: '', render: (r: Prodi) => (
      <div className="flex gap-1 justify-end">
        <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => remove(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Program Studi</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">{total} prodi</p>
        </div>
        <button onClick={() => { setModal(true); setEdit(null); setForm({ kode: '', nama: '', jenjang: 'S1', fakultas: '', akreditasi: '' }); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah</button>
      </div>

      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari prodi..." className="input-field pl-9" />
      </div>

      <DataTable columns={cols} data={data} loading={loading} page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} />

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Program Studi' : 'Tambah Program Studi'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Kode</label>
              <input value={form.kode} onChange={e => setForm({ ...form, kode: e.target.value })} required className="input-field" placeholder="IF" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jenjang</label>
              <select value={form.jenjang} onChange={e => setForm({ ...form, jenjang: e.target.value })} className="input-field">
                <option value="D3">D3</option><option value="S1">S1</option><option value="S2">S2</option><option value="S3">S3</option><option value="Profesi">Profesi</option><option value="Spesialis">Spesialis</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama Program Studi</label>
            <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required className="input-field" placeholder="Informatika" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Fakultas</label>
            <input value={form.fakultas} onChange={e => setForm({ ...form, fakultas: e.target.value })} className="input-field" placeholder="Ilmu Komputer" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Akreditasi</label>
            <select value={form.akreditasi} onChange={e => setForm({ ...form, akreditasi: e.target.value })} className="input-field">
              <option value="">Pilih</option><option value="Unggul">Unggul</option><option value="Baik Sekali">Baik Sekali</option><option value="Baik">Baik</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan Perubahan' : 'Tambah Program Studi'}</button>
        </form>
      </Modal>
    </div>
  );
}