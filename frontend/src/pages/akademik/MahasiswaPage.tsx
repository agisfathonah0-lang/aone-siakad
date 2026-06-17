import { useState, useEffect, useCallback } from 'react';
import { toast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import { get, getPaginated, post, put, del as apiDel } from '../../api/client';
import type { Mahasiswa } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Plus, RefreshCw, Pencil, Trash2, ExternalLink } from 'lucide-react';

interface ProdiOption {
  id: string;
  kode: string;
  nama: string;
  jenjang: string;
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info'> = { aktif: 'success', cuti: 'warning', lulus: 'info', drop_out: 'danger' };

export default function MahasiswaPage() {
  const [data, setData] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Mahasiswa | null>(null);
  const [filterProdi, setFilterProdi] = useState('');
  const [prodiList, setProdiList] = useState<ProdiOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ nim: '', nama: '', angkatan: new Date().getFullYear(), semester: 1, status: 'aktif', email: '', no_hp: '', program_studi_id: '', ukt_golongan: '', ukt_nominal: 0, password: '' });

  useEffect(() => {
    get<{ rows: ProdiOption[] }>('/akademik/prodi?limit=200').then(res => setProdiList(res.rows || [])).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filterProdi) params.set('program_studi_id', filterProdi);
      if (searchTerm) params.set('q', searchTerm);
      const res = await getPaginated<Mahasiswa>(`/akademik/mahasiswa?${params}`);
      setData(res.rows); setTotalPages(res.pagination.totalPages);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, filterProdi, searchTerm]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEdit(null);
    setForm({ nim: '', nama: '', angkatan: new Date().getFullYear(), semester: 1, status: 'aktif', email: '', no_hp: '', program_studi_id: '', ukt_golongan: '', ukt_nominal: 0, password: '' });
    setModal(true);
  };

  const openEdit = (row: Mahasiswa) => {
    setEdit(row);
    setForm({ nim: row.nim, nama: row.nama, angkatan: row.angkatan || new Date().getFullYear(), semester: row.semester || 1, status: row.status || 'aktif', email: row.email || '', no_hp: row.no_hp || '', program_studi_id: row.program_studi_id || '', ukt_golongan: row.ukt_golongan || '', ukt_nominal: row.ukt_nominal || 0, password: '' });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...form, ukt_nominal: form.ukt_nominal || 0 };
      if (!payload.ukt_golongan) delete payload.ukt_golongan;
      if (!payload.password) delete payload.password;
      if (!payload.program_studi_id) payload.program_studi_id = null;
      if (edit) {
        delete payload.password;
        await put(`/akademik/mahasiswa/${edit.id}`, payload);
      } else {
        await post('/akademik/mahasiswa', payload);
      }
      setModal(false); fetchData();
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const remove = async (id: string) => {
    if (!confirm('Hapus mahasiswa ini?')) return;
    try {
      await apiDel(`/akademik/mahasiswa/${id}`);
      fetchData();
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const columns = [
    { key: 'nim', label: 'NIM', render: (r: Mahasiswa) => <Link to={`/mahasiswa/${r.nim}`} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1">{r.nim}<ExternalLink size={12} /></Link> },
    { key: 'nama', label: 'Nama' },
    { key: 'angkatan', label: 'Angkatan' },
    { key: 'semester', label: 'Sem' },
    { key: 'prodi_nama', label: 'Prodi' },
    { key: 'status', label: 'Status', render: (r: Mahasiswa) => <Badge variant={statusVariant[r.status || ''] || 'default'}>{r.status}</Badge> },
    { key: 'nim', label: '', render: (r: Mahasiswa) => (
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
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Mahasiswa</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Data mahasiswa aktif</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><RefreshCw size={16} /></button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah</button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <input value={searchTerm} onChange={handleSearch} placeholder="Cari NIM atau nama..." className="input-field pl-3" />
        </div>
        <select value={filterProdi} onChange={e => { setFilterProdi(e.target.value); setPage(1); }} className="input-field max-w-[200px]">
          <option value="">Semua Prodi</option>
          {prodiList.map(p => <option key={p.id} value={p.id}>{p.jenjang} {p.nama}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">NIM</label><input required value={form.nim} onChange={(e) => setForm({ ...form, nim: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Angkatan</label><input type="number" value={form.angkatan} onChange={(e) => setForm({ ...form, angkatan: parseInt(e.target.value) || 2024 })} className="input-field" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama Lengkap</label><input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">No. HP</label><input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Program Studi</label><select value={form.program_studi_id} onChange={(e) => setForm({ ...form, program_studi_id: e.target.value })} className="input-field"><option value="">Pilih Prodi</option>{prodiList.map(p => <option key={p.id} value={p.id}>{p.jenjang} {p.nama}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Semester</label><input type="number" value={form.semester} onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) || 1 })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">UKT Golongan</label><select value={form.ukt_golongan} onChange={(e) => setForm({ ...form, ukt_golongan: e.target.value })} className="input-field"><option value="">Pilih</option>{[1,2,3,4,5,6,7,8].map(g => <option key={g} value={g}>Golongan {g}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">UKT Nominal</label><input type="number" value={form.ukt_nominal} onChange={(e) => setForm({ ...form, ukt_nominal: parseInt(e.target.value) || 0 })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field"><option value="aktif">Aktif</option><option value="cuti">Cuti</option><option value="lulus">Lulus</option><option value="drop_out">Drop Out</option></select></div>
            {!edit && <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required={!edit} className="input-field" placeholder="Min. 8 karakter" /></div>}
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
    </div>
  );
}
