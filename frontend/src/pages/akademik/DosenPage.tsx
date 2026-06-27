import { useState, useEffect, useCallback } from 'react';
import { toast } from '../../context/ToastContext';
import { confirm } from '../../context/ConfirmContext';
import { getPaginated, post, put, del } from '../../api/client';
import type { Dosen } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';

export default function DosenPage() {
  const [data, setData] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false); const [edit, setEdit] = useState<Dosen | null>(null);
  const [form, setForm] = useState({ nidn: '', nama: '', email: '', no_hp: '', password: '', program_studi_id: '', is_dosen_wali: false });
  const [prodi, setProdi] = useState<{ id: string; nama: string; jenjang: string }[]>([]);
  const [prodiFilter, setProdiFilter] = useState('');

  const fetchProdi = useCallback(async () => {
    try { const res = await getPaginated<any>('/akademik/prodi?page=1&limit=100'); setProdi(res.rows); }
    catch { /* ignore */ }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let url = `/akademik/dosen?page=${page}`;
      if (prodiFilter) url += `&program_studi_id=${prodiFilter}`;
      const res = await getPaginated<Dosen>(url); setData(res.rows); setTotalPages(res.pagination.totalPages);
    }
    catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }, [page, prodiFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchProdi(); }, [fetchProdi]);

  const openCreate = () => { setEdit(null); setForm({ nidn: '', nama: '', email: '', no_hp: '', password: '', program_studi_id: '', is_dosen_wali: false }); setModal(true); };
  const openEdit = (r: Dosen) => { setEdit(r); setForm({ nidn: r.nidn || '', nama: r.nama, email: r.email || '', no_hp: r.no_hp || '', password: '', program_studi_id: r.program_studi_id || '', is_dosen_wali: r.is_dosen_wali || false }); setModal(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: any = {
        nidn: form.nidn || undefined,
        nama: form.nama,
        email: form.email || undefined,
        no_hp: form.no_hp || undefined,
        program_studi_id: form.program_studi_id || null,
        is_dosen_wali: form.is_dosen_wali,
      };
      if (!edit && form.password) body.password = form.password;
      if (edit) await put(`/akademik/dosen/${edit.id}`, body);
      else await post('/akademik/dosen', body);
      setModal(false); fetchData();
    }
    catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm('Yakin ingin menghapus data dosen ini?'))) return;
    try { await del(`/akademik/dosen/${id}`); fetchData(); }
    catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const columns = [
    { key: 'nidn', label: 'NIDN' }, { key: 'nama', label: 'Nama' },
    { key: 'email', label: 'Email' }, { key: 'no_hp', label: 'No. HP' },
    { key: 'prodi_nama', label: 'Prodi' },
    { key: 'is_dosen_wali', label: 'Wali', render: (r: Dosen) => r.is_dosen_wali ? <span className="text-emerald-500 font-bold">✓</span> : <span className="text-slate-300">-</span> },
    { key: 'id', label: '', render: (r: Dosen) => (
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
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Dosen</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Data dosen pengajar</p>
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
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Dosen' : 'Tambah Dosen'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">NIDN</label><input value={form.nidn} onChange={(e) => setForm({ ...form, nidn: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">No. HP</label><input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} className="input-field" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama Lengkap</label><input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="input-field" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
          {!edit && <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" /></div>}
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Program Studi</label><select value={form.program_studi_id} onChange={(e) => setForm({ ...form, program_studi_id: e.target.value })} className="input-field"><option value="">Pilih Prodi</option>{prodi.map((p) => <option key={p.id} value={p.id}>{p.jenjang} - {p.nama}</option>)}</select></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_dosen_wali} onChange={(e) => setForm({ ...form, is_dosen_wali: e.target.checked })} className="rounded border-slate-300 dark:border-zinc-600" /><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Dosen Wali</span></label>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
    </div>
  );
}
