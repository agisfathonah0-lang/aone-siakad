import { useState, useEffect, useCallback } from 'react';
import { get, getPaginated, post, put, del } from '../../api/client';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Plus, RefreshCw, Pencil, Trash2, Eye, BookOpen, Search } from 'lucide-react';

interface Kurikulum {
  id: string;
  kode: string;
  nama: string;
  program_studi_id?: string;
  tahun_mulai: number;
  tahun_selesai?: number;
  total_sks?: number;
  is_active?: boolean;
  prodi_nama?: string;
  prodi_jenjang?: string;
}

interface MKRow {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  wajib?: boolean;
  jenis?: string;
}

interface ProdiOption {
  id: string;
  kode: string;
  nama: string;
  jenjang: string;
}

export default function KurikulumPage() {
  const [data, setData] = useState<Kurikulum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Kurikulum | null>(null);
  const [filterProdi, setFilterProdi] = useState('');
  const [prodiList, setProdiList] = useState<ProdiOption[]>([]);
  const [form, setForm] = useState({ kode: '', nama: '', program_studi_id: '', tahun_mulai: new Date().getFullYear(), tahun_selesai: 0, total_sks: 0, is_active: true });
  const [detailModal, setDetailModal] = useState(false);
  const [selected, setSelected] = useState<Kurikulum | null>(null);
  const [kurikulumMK, setKurikulumMK] = useState<MKRow[]>([]);
  const [addMkForm, setAddMkForm] = useState({ mata_kuliah_id: '', semester: 1, wajib: true });
  const [mkOptions, setMkOptions] = useState<{ id: string; kode: string; nama: string }[]>([]);

  useEffect(() => {
    get<{ rows: ProdiOption[] }>('/akademik/prodi?limit=200').then(res => setProdiList(res.rows || [])).catch(() => {});
  }, []);

  useEffect(() => {
    getPaginated<{ id: string; kode: string; nama: string }>('/akademik/mata-kuliah?page=1&limit=1000').then(res => setMkOptions(res.rows)).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = `/akademik/kurikulum?page=${page}`;
      if (filterProdi) url += `&program_studi_id=${filterProdi}`;
      const res = await getPaginated<Kurikulum>(url);
      setData(res.rows);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterProdi]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEdit(null);
    setForm({ kode: '', nama: '', program_studi_id: '', tahun_mulai: new Date().getFullYear(), tahun_selesai: 0, total_sks: 0, is_active: true });
    setModal(true);
  };

  const openEdit = (row: Kurikulum) => {
    setEdit(row);
    setForm({
      kode: row.kode,
      nama: row.nama,
      program_studi_id: row.program_studi_id || '',
      tahun_mulai: row.tahun_mulai,
      tahun_selesai: row.tahun_selesai || 0,
      total_sks: row.total_sks || 0,
      is_active: row.is_active ?? true,
    });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        kode: form.kode,
        nama: form.nama,
        program_studi_id: form.program_studi_id || null,
        tahun_mulai: form.tahun_mulai,
        tahun_selesai: form.tahun_selesai || null,
        total_sks: form.total_sks || 0,
        is_active: form.is_active,
      };
      if (edit) {
        await put(`/akademik/kurikulum/${edit.id}`, payload);
      } else {
        await post('/akademik/kurikulum', payload);
      }
      setModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kurikulum ini?')) return;
    try {
      await del(`/akademik/kurikulum/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const openDetail = async (row: Kurikulum) => {
    setSelected(row);
    setKurikulumMK([]);
    setAddMkForm({ mata_kuliah_id: '', semester: 1, wajib: true });
    setDetailModal(true);
    try {
      const res = await get<Kurikulum & { mata_kuliah: MKRow[] }>(`/akademik/kurikulum/${row.id}`);
      setKurikulumMK(res.mata_kuliah || []);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const addMataKuliah = async () => {
    if (!addMkForm.mata_kuliah_id || !selected) return;
    try {
      await post(`/akademik/kurikulum/${selected.id}/mata-kuliah`, addMkForm);
      setAddMkForm({ mata_kuliah_id: '', semester: 1, wajib: true });
      const res = await get<Kurikulum & { mata_kuliah: MKRow[] }>(`/akademik/kurikulum/${selected.id}`);
      setKurikulumMK(res.mata_kuliah || []);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const removeMataKuliah = async (mkKode: string) => {
    if (!confirm('Hapus mata kuliah dari kurikulum ini?')) return;
    if (!selected) return;
    const mk = mkOptions.find(m => m.kode === mkKode);
    if (!mk) return alert('Mata kuliah tidak ditemukan');
    try {
      await del(`/akademik/kurikulum/${selected.id}/mata-kuliah/${mk.id}`);
      const res = await get<Kurikulum & { mata_kuliah: MKRow[] }>(`/akademik/kurikulum/${selected.id}`);
      setKurikulumMK(res.mata_kuliah || []);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const columns = [
    { key: 'kode', label: 'Kode' },
    { key: 'nama', label: 'Nama' },
    { key: 'prodi_nama', label: 'Prodi' },
    { key: 'tahun_mulai', label: 'Tahun Mulai' },
    { key: 'tahun_selesai', label: 'Tahun Selesai', render: (r: Kurikulum) => r.tahun_selesai || '-' },
    { key: 'total_sks', label: 'Total SKS' },
    { key: 'is_active', label: 'Status', render: (r: Kurikulum) => <Badge variant={r.is_active ? 'success' : 'danger'}>{r.is_active ? 'Aktif' : 'Nonaktif'}</Badge> },
    { key: 'id', label: '', render: (r: Kurikulum) => (
      <div className="flex gap-1 justify-end">
        <button onClick={() => openDetail(r)} className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors" title="Detail"><Eye size={14} /></button>
        <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => remove(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Kurikulum</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Data kurikulum program studi</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><RefreshCw size={16} /></button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah</button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <select value={filterProdi} onChange={(e) => { setPage(1); setFilterProdi(e.target.value); }} className="input-field max-w-xs">
          <option value="">Semua Prodi</option>
          {prodiList.map(p => <option key={p.id} value={p.id}>{p.jenjang} {p.nama}</option>)}
        </select>
      </div>
      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Kurikulum' : 'Tambah Kurikulum'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Kode</label><input required value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} className="input-field" placeholder="KUR-2024" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama</label><input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="input-field" placeholder="Kurikulum 2024" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Program Studi</label><select value={form.program_studi_id} onChange={(e) => setForm({ ...form, program_studi_id: e.target.value })} className="input-field"><option value="">Pilih Prodi</option>{prodiList.map(p => <option key={p.id} value={p.id}>{p.jenjang} {p.nama}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun Mulai</label><input type="number" required value={form.tahun_mulai} onChange={(e) => setForm({ ...form, tahun_mulai: parseInt(e.target.value) || 2024 })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun Selesai</label><input type="number" value={form.tahun_selesai || ''} onChange={(e) => setForm({ ...form, tahun_selesai: parseInt(e.target.value) || 0 })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Total SKS</label><input type="number" value={form.total_sks} onChange={(e) => setForm({ ...form, total_sks: parseInt(e.target.value) || 0 })} className="input-field" /></div>
            <div className="flex items-end pb-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-slate-300 dark:border-zinc-600" /><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Aktif</span></label></div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={selected ? `Detail Kurikulum: ${selected.nama}` : 'Detail'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Kode</span><span className="dark:text-white">{selected?.kode}</span></div>
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Prodi</span><span className="dark:text-white">{selected?.prodi_nama || '-'}</span></div>
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Tahun Mulai</span><span className="dark:text-white">{selected?.tahun_mulai}</span></div>
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Tahun Selesai</span><span className="dark:text-white">{selected?.tahun_selesai || '-'}</span></div>
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Total SKS</span><span className="dark:text-white">{selected?.total_sks || 0}</span></div>
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Status</span>{selected?.is_active ? <Badge variant="success">Aktif</Badge> : <Badge variant="danger">Nonaktif</Badge>}</div>
          </div>
          <div className="border-t border-slate-200 dark:border-zinc-700 pt-4">
            <h3 className="text-sm font-bold dark:text-white mb-3 flex items-center gap-2"><BookOpen size={16} /> Mata Kuliah</h3>
            <div className="flex gap-2 mb-3">
              <select value={addMkForm.mata_kuliah_id} onChange={(e) => setAddMkForm({ ...addMkForm, mata_kuliah_id: e.target.value })} className="input-field flex-1">
                <option value="">Pilih Mata Kuliah</option>
                {mkOptions.map(mk => <option key={mk.id} value={mk.id}>{mk.kode} - {mk.nama}</option>)}
              </select>
              <input type="number" value={addMkForm.semester} onChange={(e) => setAddMkForm({ ...addMkForm, semester: parseInt(e.target.value) || 1 })} className="input-field w-20" placeholder="Sem" title="Semester" />
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400 cursor-pointer"><input type="checkbox" checked={addMkForm.wajib} onChange={(e) => setAddMkForm({ ...addMkForm, wajib: e.target.checked })} className="rounded border-slate-300 dark:border-zinc-600" /> Wajib</label>
              <button onClick={addMataKuliah} className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah</button>
            </div>
            <div className="overflow-hidden rounded-xl bg-white dark:bg-zinc-900/50 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800/30">
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Kode</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Nama</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">SKS</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Semester</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Wajib</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-zinc-800/20">
                  {kurikulumMK.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">Belum ada mata kuliah</td></tr>
                  ) : kurikulumMK.map((mk) => (
                    <tr key={mk.id}>
                      <td className="px-4 py-3">{mk.kode}</td>
                      <td className="px-4 py-3">{mk.nama}</td>
                      <td className="px-4 py-3">{mk.sks}</td>
                      <td className="px-4 py-3">{mk.semester}</td>
                      <td className="px-4 py-3">{mk.wajib ? <Badge variant="success">Wajib</Badge> : <Badge variant="info">Pilihan</Badge>}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => removeMataKuliah(mk.kode)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
