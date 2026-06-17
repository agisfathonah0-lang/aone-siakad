import { useState, useEffect, useCallback } from 'react';
import { toast } from '../../context/ToastContext';
import { getPaginated, post, put, del } from '../../api/client';
import type { MataKuliah } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';

export default function MatakuliahPage() {
  const [data, setData] = useState<MataKuliah[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false); const [edit, setEdit] = useState<MataKuliah | null>(null);
  const [form, setForm] = useState({ kode: '', nama: '', sks: 3, semester: 1, program_studi_id: '', is_active: true });
  const [prodi, setProdi] = useState<{ id: string; nama: string; jenjang: string }[]>([]);
  const [prodiFilter, setProdiFilter] = useState('');

  const fetchProdi = useCallback(async () => {
    try { const res = await getPaginated<any>('/akademik/prodi?page=1&limit=100'); setProdi(res.rows); }
    catch { /* ignore */ }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let url = `/akademik/mata-kuliah?page=${page}`;
      if (prodiFilter) url += `&program_studi_id=${prodiFilter}`;
      const res = await getPaginated<MataKuliah>(url); setData(res.rows); setTotalPages(res.pagination.totalPages);
    }
    catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }, [page, prodiFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchProdi(); }, [fetchProdi]);

  const openCreate = () => { setEdit(null); setForm({ kode: '', nama: '', sks: 3, semester: 1, program_studi_id: '', is_active: true }); setModal(true); };
  const openEdit = (r: MataKuliah) => { setEdit(r); setForm({ kode: r.kode, nama: r.nama, sks: r.sks, semester: r.semester, program_studi_id: r.program_studi_id || '', is_active: r.is_active ?? true }); setModal(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        kode: form.kode,
        nama: form.nama,
        sks: form.sks,
        semester: form.semester,
        program_studi_id: form.program_studi_id || null,
        is_active: form.is_active,
      };
      if (edit) await put(`/akademik/mata-kuliah/${edit.id}`, body);
      else await post('/akademik/mata-kuliah', body);
      setModal(false); fetchData();
    }
    catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus mata kuliah ini?')) return;
    try { await del(`/akademik/mata-kuliah/${id}`); fetchData(); }
    catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const columns = [
    { key: 'kode', label: 'Kode' }, { key: 'nama', label: 'Nama' },
    { key: 'sks', label: 'SKS' }, { key: 'semester', label: 'Sem' },
    { key: 'is_active', label: 'Status', render: (r: MataKuliah) => <Badge variant={r.is_active ? 'success' : 'danger'}>{r.is_active ? 'Aktif' : 'Nonaktif'}</Badge> },
    { key: 'id', label: '', render: (r: MataKuliah) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(r)} className="text-indigo-500 hover:text-indigo-600 text-xs font-bold transition-colors">Edit</button>
        <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-600 text-xs font-bold transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Mata Kuliah</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Daftar mata kuliah</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><RefreshCw size={16} /></button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah</button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <select value={prodiFilter} onChange={(e) => { setPage(1); setProdiFilter(e.target.value); }} className="input-field max-w-xs">
          <option value="">Semua Prodi</option>
          {prodi.map((p) => <option key={p.id} value={p.id}>{p.jenjang} - {p.nama}</option>)}
        </select>
      </div>
      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}>
        <form onSubmit={save} className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Kode</label><input required value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} className="input-field" placeholder="IF123" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama</label><input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="input-field" placeholder="Algoritma Pemrograman" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">SKS</label><input type="number" value={form.sks} onChange={(e) => setForm({ ...form, sks: parseInt(e.target.value) || 3 })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Semester</label><input type="number" value={form.semester} onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) || 1 })} className="input-field" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Program Studi</label><select value={form.program_studi_id} onChange={(e) => setForm({ ...form, program_studi_id: e.target.value })} className="input-field"><option value="">Pilih Prodi</option>{prodi.map((p) => <option key={p.id} value={p.id}>{p.jenjang} - {p.nama}</option>)}</select></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-slate-300 dark:border-zinc-600" /><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Aktif</span></label>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
    </div>
  );
}
