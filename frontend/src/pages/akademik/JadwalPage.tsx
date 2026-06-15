import { useState, useEffect, useCallback } from 'react';
import { getPaginated, post, put, del } from '../../api/client';
import type { Jadwal } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';

const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const hariColors: Record<string, string> = { Senin: 'info', Selasa: 'success', Rabu: 'warning', Kamis: 'info', Jumat: 'success', Sabtu: 'warning' };

export default function JadwalPage() {
  const [data, setData] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false); const [edit, setEdit] = useState<Jadwal | null>(null);
  const [form, setForm] = useState({ mata_kuliah_id: '', dosen_id: '', hari: 'Senin', jam_mulai: '08:00', jam_selesai: '09:40', ruangan: '', kelas: 'A', kuota: 40, tahun_akademik: '2025/2026', semester: 'Ganjil' });
  const [mkList, setMkList] = useState<{ id: string; kode: string; nama: string }[]>([]);
  const [dosenList, setDosenList] = useState<{ id: string; nama: string; nidn: string }[]>([]);
  const [prodi, setProdi] = useState<{ id: string; nama: string; jenjang: string }[]>([]);
  const [prodiFilter, setProdiFilter] = useState('');

  const fetchMk = useCallback(async () => {
    try { const res = await getPaginated<any>('/akademik/mata-kuliah?page=1&limit=1000'); setMkList(res.rows); }
    catch { /* ignore */ }
  }, []);

  const fetchDosen = useCallback(async () => {
    try { const res = await getPaginated<any>('/akademik/dosen?page=1&limit=1000'); setDosenList(res.rows); }
    catch { /* ignore */ }
  }, []);

  const fetchProdi = useCallback(async () => {
    try { const res = await getPaginated<any>('/akademik/prodi?page=1&limit=100'); setProdi(res.rows); }
    catch { /* ignore */ }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let url = `/akademik/jadwal?page=${page}`;
      if (prodiFilter) url += `&program_studi_id=${prodiFilter}`;
      const res = await getPaginated<Jadwal>(url); setData(res.rows); setTotalPages(res.pagination.totalPages);
    }
    catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }, [page, prodiFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchMk(); }, [fetchMk]);
  useEffect(() => { fetchDosen(); }, [fetchDosen]);
  useEffect(() => { fetchProdi(); }, [fetchProdi]);

  const openCreate = () => {
    setEdit(null);
    setForm({ mata_kuliah_id: '', dosen_id: '', hari: 'Senin', jam_mulai: '08:00', jam_selesai: '09:40', ruangan: '', kelas: 'A', kuota: 40, tahun_akademik: '2025/2026', semester: 'Ganjil' });
    setModal(true);
  };

  const openEdit = (r: Jadwal) => {
    setEdit(r);
    setForm({
      mata_kuliah_id: r.mata_kuliah_id, dosen_id: r.dosen_id, hari: r.hari,
      jam_mulai: r.jam_mulai, jam_selesai: r.jam_selesai, ruangan: r.ruangan || '',
      kelas: r.kelas || 'A', kuota: r.kuota ?? 40, tahun_akademik: r.tahun_akademik,
      semester: r.semester
    });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (edit) await put(`/akademik/jadwal/${edit.id}`, form);
      else await post('/akademik/jadwal', form);
      setModal(false); fetchData();
    }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;
    try { await del(`/akademik/jadwal/${id}`); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const columns = [
    { key: 'hari', label: 'Hari', render: (r: Jadwal) => <Badge variant={(hariColors[r.hari] || 'default') as any}>{r.hari}</Badge> },
    { key: 'jam_mulai', label: 'Jam', render: (r: Jadwal) => <span className="text-xs font-mono">{r.jam_mulai?.slice(0, 5)} - {r.jam_selesai?.slice(0, 5)}</span> },
    { key: 'mk_nama', label: 'Mata Kuliah' }, { key: 'dosen_nama', label: 'Dosen' },
    { key: 'ruangan', label: 'Ruangan' }, { key: 'kelas', label: 'Kelas' },
    { key: 'id', label: '', render: (r: Jadwal) => (
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
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Jadwal Kuliah</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Kelola jadwal perkuliahan</p>
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
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Jadwal' : 'Tambah Jadwal'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Mata Kuliah</label>
              <select required value={form.mata_kuliah_id} onChange={(e) => setForm({ ...form, mata_kuliah_id: e.target.value })} className="input-field">
                <option value="">Pilih Mata Kuliah</option>
                {mkList.map((mk) => <option key={mk.id} value={mk.id}>{mk.kode} - {mk.nama}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Dosen</label>
              <select required value={form.dosen_id} onChange={(e) => setForm({ ...form, dosen_id: e.target.value })} className="input-field">
                <option value="">Pilih Dosen</option>
                {dosenList.map((d) => <option key={d.id} value={d.id}>{d.nama} - {d.nidn}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Hari</label><select value={form.hari} onChange={(e) => setForm({ ...form, hari: e.target.value })} className="input-field">{hariList.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Kelas</label><input value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jam Mulai</label><input type="time" value={form.jam_mulai} onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jam Selesai</label><input type="time" value={form.jam_selesai} onChange={(e) => setForm({ ...form, jam_selesai: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Ruangan</label><input value={form.ruangan} onChange={(e) => setForm({ ...form, ruangan: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Kuota</label><input type="number" value={form.kuota} onChange={(e) => setForm({ ...form, kuota: parseInt(e.target.value) || 40 })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun Akademik</label><input value={form.tahun_akademik} onChange={(e) => setForm({ ...form, tahun_akademik: e.target.value })} className="input-field" /></div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
    </div>
  );
}
