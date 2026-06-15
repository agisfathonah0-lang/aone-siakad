import { useState, useEffect, useCallback } from 'react';
import { getPaginated, post, put, del } from '../../api/client';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, RefreshCw, Pencil, Trash2, BookOpen } from 'lucide-react';

interface RPS {
  id: string;
  jadwal_id: string;
  pertemuan: number;
  materi: string;
  capaian_pembelajaran?: string;
  metode?: string;
  durasi_menit?: number;
  mk_nama?: string;
  mk_kode?: string;
  dosen_nama?: string;
  hari?: string;
  kelas?: string;
}

interface JadwalOption {
  id: string;
  mk_nama: string;
  mk_kode: string;
  kelas: string;
  hari: string;
}

export default function RPSPage() {
  const [data, setData] = useState<RPS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<RPS | null>(null);
  const [filterJadwal, setFilterJadwal] = useState('');
  const [filterPertemuan, setFilterPertemuan] = useState('');
  const [jadwalList, setJadwalList] = useState<JadwalOption[]>([]);
  const [form, setForm] = useState({ jadwal_id: '', pertemuan: 1, materi: '', capaian_pembelajaran: '', metode: '', durasi_menit: 100 });

  useEffect(() => {
    getPaginated<JadwalOption>('/akademik/jadwal?page=1&limit=1000').then(res => setJadwalList(res.rows)).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = `/akademik/rps?page=${page}`;
      if (filterJadwal) url += `&jadwal_id=${filterJadwal}`;
      if (filterPertemuan) url += `&pertemuan=${filterPertemuan}`;
      const res = await getPaginated<RPS>(url);
      setData(res.rows);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterJadwal, filterPertemuan]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEdit(null);
    setForm({ jadwal_id: filterJadwal || '', pertemuan: 1, materi: '', capaian_pembelajaran: '', metode: '', durasi_menit: 100 });
    setModal(true);
  };

  const openEdit = (row: RPS) => {
    setEdit(row);
    setForm({
      jadwal_id: row.jadwal_id,
      pertemuan: row.pertemuan,
      materi: row.materi,
      capaian_pembelajaran: row.capaian_pembelajaran || '',
      metode: row.metode || '',
      durasi_menit: row.durasi_menit || 100,
    });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        jadwal_id: form.jadwal_id,
        pertemuan: form.pertemuan,
        materi: form.materi,
        capaian_pembelajaran: form.capaian_pembelajaran || null,
        metode: form.metode || null,
        durasi_menit: form.durasi_menit || 100,
      };
      if (edit) {
        await put(`/akademik/rps/${edit.id}`, payload);
      } else {
        await post('/akademik/rps', payload);
      }
      setModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus RPS ini?')) return;
    try {
      await del(`/akademik/rps/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const columns = [
    { key: 'pertemuan', label: 'Pertemuan' },
    { key: 'materi', label: 'Materi' },
    { key: 'capaian_pembelajaran', label: 'Capaian Pembelajaran', render: (r: RPS) => r.capaian_pembelajaran || '-' },
    { key: 'metode', label: 'Metode', render: (r: RPS) => r.metode || '-' },
    { key: 'durasi_menit', label: 'Durasi (menit)' },
    { key: 'id', label: '', render: (r: RPS) => (
      <div className="flex gap-1 justify-end">
        <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">RPS</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Rencana Pembelajaran Semester</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><RefreshCw size={16} /></button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah</button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select value={filterJadwal} onChange={(e) => { setPage(1); setFilterJadwal(e.target.value); }} className="input-field pl-9">
            <option value="">Semua Jadwal</option>
            {jadwalList.map((j) => <option key={j.id} value={j.id}>{j.mk_kode} - {j.mk_nama} ({j.kelas})</option>)}
          </select>
        </div>
        <input type="number" value={filterPertemuan} onChange={(e) => { setPage(1); setFilterPertemuan(e.target.value); }} className="input-field w-32" placeholder="Pertemuan ke-" min={1} />
      </div>
      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit RPS' : 'Tambah RPS'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jadwal</label>
              <select required value={form.jadwal_id} disabled={!!filterJadwal} onChange={(e) => setForm({ ...form, jadwal_id: e.target.value })} className="input-field">
                <option value="">Pilih Jadwal</option>
                {jadwalList.map((j) => <option key={j.id} value={j.id}>{j.mk_kode} - {j.mk_nama} ({j.kelas})</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Pertemuan</label><input type="number" required min={1} value={form.pertemuan} onChange={(e) => setForm({ ...form, pertemuan: parseInt(e.target.value) || 1 })} className="input-field" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Materi</label><input required value={form.materi} onChange={(e) => setForm({ ...form, materi: e.target.value })} className="input-field" placeholder="Materi perkuliahan" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Capaian Pembelajaran</label><textarea value={form.capaian_pembelajaran} onChange={(e) => setForm({ ...form, capaian_pembelajaran: e.target.value })} className="input-field" rows={3} placeholder="Capaian pembelajaran pertemuan ini" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Metode</label><input value={form.metode} onChange={(e) => setForm({ ...form, metode: e.target.value })} className="input-field" placeholder="Ceramah, Diskusi" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Durasi (menit)</label><input type="number" value={form.durasi_menit} onChange={(e) => setForm({ ...form, durasi_menit: parseInt(e.target.value) || 100 })} className="input-field" /></div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
    </div>
  );
}
