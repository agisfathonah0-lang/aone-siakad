import { useState, useEffect, useCallback } from 'react';
import { get, getPaginated, post, put, del } from '../../api/client';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, RefreshCw, Pencil, Trash2, ClipboardList } from 'lucide-react';

interface BAP {
  id: string;
  jadwal_id: string;
  pertemuan: number;
  tanggal: string;
  materi?: string;
  jumlah_mahasiswa_hadir?: number;
  jumlah_mahasiswa_terdaftar?: number;
  catatan?: string;
  dosen_pengganti?: string;
  mk_nama?: string;
  mk_kode?: string;
  dosen_nama?: string;
  kelas?: string;
}

interface JadwalOption {
  id: string;
  mk_nama: string;
  mk_kode: string;
  kelas: string;
  hari: string;
}

export default function BAPPage() {
  const [data, setData] = useState<BAP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<BAP | null>(null);
  const [filterJadwal, setFilterJadwal] = useState('');
  const [jadwalList, setJadwalList] = useState<JadwalOption[]>([]);
  const [form, setForm] = useState({ jadwal_id: '', pertemuan: 1, tanggal: new Date().toISOString().split('T')[0], materi: '', jumlah_mahasiswa_hadir: 0, jumlah_mahasiswa_terdaftar: 0, catatan: '', dosen_pengganti: '' });
  const [fetchingTerdaftar, setFetchingTerdaftar] = useState(false);

  useEffect(() => {
    getPaginated<JadwalOption>('/akademik/jadwal?page=1&limit=1000').then(res => setJadwalList(res.rows)).catch(() => {});
  }, []);

  const autoFillTerdaftar = useCallback(async (jadwalId: string) => {
    if (!jadwalId) return;
    setFetchingTerdaftar(true);
    try {
      const res = await getPaginated<any>(`/akademik/krs?jadwal_id=${jadwalId}&status=disetujui&page=1&limit=1`);
      setForm(f => ({ ...f, jumlah_mahasiswa_terdaftar: res.pagination.total }));
    } catch {
      // ignore
    } finally {
      setFetchingTerdaftar(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = `/akademik/bap?page=${page}`;
      if (filterJadwal) url += `&jadwal_id=${filterJadwal}`;
      const res = await getPaginated<BAP>(url);
      setData(res.rows);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterJadwal]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEdit(null);
    const today = new Date().toISOString().split('T')[0];
    setForm({ jadwal_id: filterJadwal || '', pertemuan: 1, tanggal: today, materi: '', jumlah_mahasiswa_hadir: 0, jumlah_mahasiswa_terdaftar: 0, catatan: '', dosen_pengganti: '' });
    if (filterJadwal) autoFillTerdaftar(filterJadwal);
    setModal(true);
  };

  const openEdit = (row: BAP) => {
    setEdit(row);
    setForm({
      jadwal_id: row.jadwal_id,
      pertemuan: row.pertemuan,
      tanggal: row.tanggal ? row.tanggal.split('T')[0] : new Date().toISOString().split('T')[0],
      materi: row.materi || '',
      jumlah_mahasiswa_hadir: row.jumlah_mahasiswa_hadir || 0,
      jumlah_mahasiswa_terdaftar: row.jumlah_mahasiswa_terdaftar || 0,
      catatan: row.catatan || '',
      dosen_pengganti: row.dosen_pengganti || '',
    });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        jadwal_id: form.jadwal_id,
        pertemuan: form.pertemuan,
        tanggal: form.tanggal,
        materi: form.materi || null,
        jumlah_mahasiswa_hadir: form.jumlah_mahasiswa_hadir || 0,
        jumlah_mahasiswa_terdaftar: form.jumlah_mahasiswa_terdaftar || 0,
        catatan: form.catatan || null,
        dosen_pengganti: form.dosen_pengganti || null,
      };
      if (edit) {
        await put(`/akademik/bap/${edit.id}`, payload);
      } else {
        await post('/akademik/bap', payload);
      }
      setModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus BAP ini?')) return;
    try {
      await del(`/akademik/bap/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const columns = [
    { key: 'pertemuan', label: 'Pertemuan' },
    { key: 'tanggal', label: 'Tanggal', render: (r: BAP) => r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID') : '-' },
    { key: 'materi', label: 'Materi', render: (r: BAP) => r.materi || '-' },
    { key: 'jumlah_mahasiswa_hadir', label: 'Hadir' },
    { key: 'jumlah_mahasiswa_terdaftar', label: 'Terdaftar' },
    { key: 'catatan', label: 'Catatan', render: (r: BAP) => r.catatan || '-' },
    { key: 'dosen_pengganti', label: 'Dosen Pengganti', render: (r: BAP) => r.dosen_pengganti || '-' },
    { key: 'id', label: '', render: (r: BAP) => (
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
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">BAP</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Berita Acara Perkuliahan</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><RefreshCw size={16} /></button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah</button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <ClipboardList size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select value={filterJadwal} onChange={(e) => { setPage(1); setFilterJadwal(e.target.value); }} className="input-field pl-9">
            <option value="">Semua Jadwal</option>
            {jadwalList.map((j) => <option key={j.id} value={j.id}>{j.mk_kode} - {j.mk_nama} ({j.kelas})</option>)}
          </select>
        </div>
      </div>
      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit BAP' : 'Tambah BAP'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jadwal</label>
              <select required value={form.jadwal_id} disabled={!!filterJadwal} onChange={(e) => { const v = e.target.value; setForm({ ...form, jadwal_id: v }); autoFillTerdaftar(v); }} className="input-field">
                <option value="">Pilih Jadwal</option>
                {jadwalList.map((j) => <option key={j.id} value={j.id}>{j.mk_kode} - {j.mk_nama} ({j.kelas})</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Pertemuan</label><input type="number" required min={1} value={form.pertemuan} onChange={(e) => setForm({ ...form, pertemuan: parseInt(e.target.value) || 1 })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tanggal</label><input type="date" required value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Materi</label><input value={form.materi} onChange={(e) => setForm({ ...form, materi: e.target.value })} className="input-field" placeholder="Materi perkuliahan" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jumlah Hadir</label><input type="number" value={form.jumlah_mahasiswa_hadir} onChange={(e) => setForm({ ...form, jumlah_mahasiswa_hadir: parseInt(e.target.value) || 0 })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jumlah Terdaftar {fetchingTerdaftar ? <span className="text-indigo-400 animate-pulse">(mengisi...)</span> : ''}</label><input type="number" value={form.jumlah_mahasiswa_terdaftar} onChange={(e) => setForm({ ...form, jumlah_mahasiswa_terdaftar: parseInt(e.target.value) || 0 })} className="input-field" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Catatan</label><textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} className="input-field" rows={2} placeholder="Catatan perkuliahan" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Dosen Pengganti</label><input value={form.dosen_pengganti} onChange={(e) => setForm({ ...form, dosen_pengganti: e.target.value })} className="input-field" placeholder="Nama dosen pengganti (jika ada)" /></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
    </div>
  );
}
