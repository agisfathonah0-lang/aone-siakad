import { useState, useEffect, useCallback } from 'react';
import { get, getPaginated, post, put, del } from '../../api/client';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Plus, Pencil, Trash2, Award, Eye, Upload, ListChecks, RefreshCw } from 'lucide-react';
import type { Akreditasi, StandarAkreditasi, DokumenAkreditasi } from '../../types';
import FileUpload from '../../components/ui/FileUpload';

const peringkatColors: Record<string, string> = {
  Unggul: 'success',
  'Baik Sekali': 'info',
  Baik: 'default',
  A: 'warning',
  B: 'default',
  C: 'danger',
};

interface ProdiOption {
  id: string;
  kode: string;
  nama: string;
  jenjang: string;
}

export default function AkreditasiPage() {
  const [tab, setTab] = useState(0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Akreditasi BAN-PT</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Kelola data akreditasi institusi dan program studi</p>
        </div>
      </div>
      <div className="flex gap-1 border-b border-slate-200 dark:border-zinc-700/30">
        <button onClick={() => setTab(0)} className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 -mb-[1px] ${tab === 0 ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'}`}>Akreditasi</button>
        <button onClick={() => setTab(1)} className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 -mb-[1px] ${tab === 1 ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'}`}>Standar</button>
      </div>
      {tab === 0 && <AkreditasiTab />}
      {tab === 1 && <StandarTab />}
    </div>
  );
}

function AkreditasiTab() {
  const [data, setData] = useState<Akreditasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Akreditasi | null>(null);
  const [filterProdi, setFilterProdi] = useState('');
  const [filterCurrent, setFilterCurrent] = useState('');
  const [prodiList, setProdiList] = useState<ProdiOption[]>([]);
  const [form, setForm] = useState({
    jenis: 'institusi',
    program_studi_id: '',
    peringkat: '',
    skor: 0,
    nomor_sk: '',
    tanggal_sk: '',
    tanggal_kadaluarsa: '',
    file_sk: '',
    tahun_akreditasi: new Date().getFullYear(),
    is_current: false,
  });
  const [detailModal, setDetailModal] = useState(false);
  const [selected, setSelected] = useState<Akreditasi | null>(null);
  const [dokumenList, setDokumenList] = useState<DokumenAkreditasi[]>([]);
  const [standarList, setStandarList] = useState<StandarAkreditasi[]>([]);
  const [dokumenModal, setDokumenModal] = useState(false);
  const [editDokumen, setEditDokumen] = useState<DokumenAkreditasi | null>(null);
  const [dokForm, setDokForm] = useState({ standar_id: '', nama_dokumen: '', file_url: '', keterangan: '', status: 'draft' });

  useEffect(() => {
    get<{ rows: ProdiOption[] }>('/akademik/prodi?limit=200').then(res => setProdiList(res.rows || [])).catch(() => {});
    get<StandarAkreditasi[]>('/akademik/akreditasi/standar').then(res => setStandarList(Array.isArray(res) ? res : [])).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = `/akademik/akreditasi?page=${page}`;
      if (filterProdi) url += `&program_studi_id=${filterProdi}`;
      if (filterCurrent !== '') url += `&is_current=${filterCurrent}`;
      const res = await getPaginated<Akreditasi>(url);
      setData(res.rows);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterProdi, filterCurrent]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEdit(null);
    setForm({ jenis: 'institusi', program_studi_id: '', peringkat: '', skor: 0, nomor_sk: '', tanggal_sk: '', tanggal_kadaluarsa: '', file_sk: '', tahun_akreditasi: new Date().getFullYear(), is_current: false });
    setModal(true);
  };

  const openEdit = (row: Akreditasi) => {
    setEdit(row);
    setForm({
      jenis: row.jenis,
      program_studi_id: row.program_studi_id || '',
      peringkat: row.peringkat || '',
      skor: row.skor || 0,
      nomor_sk: row.nomor_sk || '',
      tanggal_sk: row.tanggal_sk?.slice(0, 10) || '',
      tanggal_kadaluarsa: row.tanggal_kadaluarsa?.slice(0, 10) || '',
      file_sk: row.file_sk || '',
      tahun_akreditasi: row.tahun_akreditasi,
      is_current: row.is_current,
    });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        jenis: form.jenis,
        program_studi_id: form.jenis === 'program_studi' ? form.program_studi_id || null : null,
        peringkat: form.peringkat || null,
        skor: form.skor || null,
        nomor_sk: form.nomor_sk || null,
        tanggal_sk: form.tanggal_sk || null,
        tanggal_kadaluarsa: form.tanggal_kadaluarsa || null,
        file_sk: form.file_sk || null,
        tahun_akreditasi: form.tahun_akreditasi,
        is_current: form.is_current,
      };
      if (edit) {
        await put(`/akademik/akreditasi/${edit.id}`, payload);
      } else {
        await post('/akademik/akreditasi', payload);
      }
      setModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Yakin ingin menghapus akreditasi ini?')) return;
    try {
      await del(`/akademik/akreditasi/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const openDetail = async (row: Akreditasi) => {
    setSelected(row);
    setDokumenList([]);
    setDetailModal(true);
    try {
      const res = await get<Akreditasi & { dokumen: DokumenAkreditasi[] }>(`/akademik/akreditasi/${row.id}`);
      setDokumenList(res.dokumen || []);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const openCreateDokumen = () => {
    setEditDokumen(null);
    setDokForm({ standar_id: '', nama_dokumen: '', file_url: '', keterangan: '', status: 'draft' });
    setDokumenModal(true);
  };

  const openEditDokumen = (d: DokumenAkreditasi) => {
    setEditDokumen(d);
    setDokForm({
      standar_id: d.standar_id || '',
      nama_dokumen: d.nama_dokumen,
      file_url: d.file_url || '',
      keterangan: d.keterangan || '',
      status: d.status,
    });
    setDokumenModal(true);
  };

  const saveDokumen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      const payload = {
        standar_id: dokForm.standar_id || null,
        nama_dokumen: dokForm.nama_dokumen,
        file_url: dokForm.file_url || null,
        keterangan: dokForm.keterangan || null,
        status: dokForm.status,
      };
      if (editDokumen) {
        await put(`/akademik/akreditasi/dokumen/${editDokumen.id}`, payload);
      } else {
        await post(`/akademik/akreditasi/${selected.id}/dokumen`, payload);
      }
      setDokumenModal(false);
      const res = await get<Akreditasi & { dokumen: DokumenAkreditasi[] }>(`/akademik/akreditasi/${selected.id}`);
      setDokumenList(res.dokumen || []);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const removeDokumen = async (id: string) => {
    if (!confirm('Hapus dokumen ini?')) return;
    if (!selected) return;
    try {
      await del(`/akademik/akreditasi/dokumen/${id}`);
      const res = await get<Akreditasi & { dokumen: DokumenAkreditasi[] }>(`/akademik/akreditasi/${selected.id}`);
      setDokumenList(res.dokumen || []);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const columns = [
    { key: 'jenis', label: 'Jenis', render: (r: Akreditasi) => <Badge variant={r.jenis === 'institusi' ? 'info' : 'default'}>{r.jenis === 'institusi' ? 'Institusi' : 'Prodi'}</Badge> },
    { key: 'prodi_nama', label: 'Prodi', render: (r: Akreditasi) => r.jenis === 'program_studi' ? <span className="dark:text-white">{r.prodi_nama || '-'}</span> : <span className="text-slate-400">-</span> },
    { key: 'peringkat', label: 'Peringkat', render: (r: Akreditasi) => r.peringkat ? <Badge variant={(peringkatColors[r.peringkat] || 'default') as any}>{r.peringkat}</Badge> : <span className="text-slate-400">-</span> },
    { key: 'skor', label: 'Skor', render: (r: Akreditasi) => r.skor ? <span className="font-mono">{r.skor}</span> : <span className="text-slate-400">-</span> },
    { key: 'nomor_sk', label: 'No. SK', render: (r: Akreditasi) => r.nomor_sk || <span className="text-slate-400">-</span> },
    { key: 'tahun_akreditasi', label: 'Tahun' },
    { key: 'is_current', label: 'Status', render: (r: Akreditasi) => r.is_current ? <Badge variant="success">Current</Badge> : <span className="text-slate-400">-</span> },
    { key: 'id', label: '', render: (r: Akreditasi) => (
      <div className="flex gap-1 justify-end">
        <button onClick={() => openDetail(r)} className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors" title="Detail"><Eye size={14} /></button>
        <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => remove(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select value={filterProdi} onChange={(e) => { setPage(1); setFilterProdi(e.target.value); }} className="input-field max-w-xs">
            <option value="">Semua Prodi</option>
            {prodiList.map(p => <option key={p.id} value={p.id}>{p.jenjang} {p.nama}</option>)}
          </select>
          <select value={filterCurrent} onChange={(e) => { setPage(1); setFilterCurrent(e.target.value); }} className="input-field max-w-[120px]">
            <option value="">Semua</option>
            <option value="true">Current</option>
            <option value="false">Non-Current</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><RefreshCw size={16} /></button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah</button>
        </div>
      </div>
      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Akreditasi' : 'Tambah Akreditasi'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jenis</label>
              <select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })} className="input-field">
                <option value="institusi">Institusi</option>
                <option value="program_studi">Program Studi</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Peringkat</label>
              <select value={form.peringkat} onChange={(e) => setForm({ ...form, peringkat: e.target.value })} className="input-field">
                <option value="">Pilih Peringkat</option>
                <option value="Unggul">Unggul</option>
                <option value="Baik Sekali">Baik Sekali</option>
                <option value="Baik">Baik</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>
          {form.jenis === 'program_studi' && (
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Program Studi</label>
              <select value={form.program_studi_id} onChange={(e) => setForm({ ...form, program_studi_id: e.target.value })} className="input-field">
                <option value="">Pilih Prodi</option>
                {prodiList.map(p => <option key={p.id} value={p.id}>{p.jenjang} {p.nama}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Skor</label>
              <input type="number" step="0.01" value={form.skor} onChange={(e) => setForm({ ...form, skor: parseFloat(e.target.value) || 0 })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun Akreditasi</label>
              <input type="number" required value={form.tahun_akreditasi} onChange={(e) => setForm({ ...form, tahun_akreditasi: parseInt(e.target.value) || new Date().getFullYear() })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nomor SK</label>
            <input value={form.nomor_sk} onChange={(e) => setForm({ ...form, nomor_sk: e.target.value })} className="input-field" placeholder="Nomor SK" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tanggal SK</label>
              <input type="date" value={form.tanggal_sk} onChange={(e) => setForm({ ...form, tanggal_sk: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tanggal Kadaluarsa</label>
              <input type="date" value={form.tanggal_kadaluarsa} onChange={(e) => setForm({ ...form, tanggal_kadaluarsa: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">File SK (URL)</label>
            <FileUpload value={form.file_sk} onChange={(v) => setForm({ ...form, file_sk: v })} label="File SK Akreditasi" accept=".pdf" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} className="rounded border-slate-300 dark:border-zinc-600" />
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Akreditasi Saat Ini</span>
          </label>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={selected ? `Detail Akreditasi: ${selected.jenis === 'institusi' ? 'Institusi' : selected.prodi_nama || ''}` : 'Detail'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Jenis</span><Badge variant={selected?.jenis === 'institusi' ? 'info' : 'default'}>{selected?.jenis === 'institusi' ? 'Institusi' : 'Prodi'}</Badge></div>
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Prodi</span><span className="dark:text-white">{selected?.prodi_nama || '-'}</span></div>
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Peringkat</span>{selected?.peringkat ? <Badge variant={(peringkatColors[selected.peringkat] || 'default') as any}>{selected.peringkat}</Badge> : <span className="text-slate-400">-</span>}</div>
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Skor</span><span className="dark:text-white">{selected?.skor || '-'}</span></div>
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">No. SK</span><span className="dark:text-white">{selected?.nomor_sk || '-'}</span></div>
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Tahun</span><span className="dark:text-white">{selected?.tahun_akreditasi}</span></div>
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Tanggal SK</span><span className="dark:text-white">{selected?.tanggal_sk?.slice(0, 10) || '-'}</span></div>
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Tanggal Kadaluarsa</span><span className="dark:text-white">{selected?.tanggal_kadaluarsa?.slice(0, 10) || '-'}</span></div>
            <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">Status</span>{selected?.is_current ? <Badge variant="success">Current</Badge> : <Badge variant="default">Non-Current</Badge>}</div>
            {selected?.file_sk && <div><span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">File SK</span><a href={selected.file_sk} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 text-xs hover:underline">Lihat File</a></div>}
          </div>
          <div className="border-t border-slate-200 dark:border-zinc-700 pt-4">
            <h3 className="text-sm font-bold dark:text-white mb-3 flex items-center gap-2"><Upload size={16} /> Dokumen Akreditasi</h3>
            <button onClick={openCreateDokumen} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 mb-3"><Plus size={14} /> Tambah Dokumen</button>
            <div className="overflow-hidden rounded-xl bg-white dark:bg-zinc-900/50 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800/30">
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Nama Dokumen</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Standar</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">File</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-zinc-800/20">
                  {dokumenList.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">Belum ada dokumen</td></tr>
                  ) : dokumenList.map((d) => (
                    <tr key={d.id}>
                      <td className="px-4 py-3">{d.nama_dokumen}</td>
                      <td className="px-4 py-3">{d.standar_kode ? <Badge variant="info">{d.standar_kode}</Badge> : <span className="text-slate-400">-</span>}</td>
                      <td className="px-4 py-3">
                        <Badge variant={d.status === 'lengkap' ? 'success' : d.status === 'revisi' ? 'warning' : 'default'}>{d.status}</Badge>
                      </td>
                      <td className="px-4 py-3">{d.file_url ? <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 text-xs hover:underline">Lihat</a> : <span className="text-slate-400">-</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEditDokumen(d)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => removeDokumen(d.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
      <Modal open={dokumenModal} onClose={() => setDokumenModal(false)} title={editDokumen ? 'Edit Dokumen' : 'Tambah Dokumen'} size="lg">
        <form onSubmit={saveDokumen} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama Dokumen</label>
            <input required value={dokForm.nama_dokumen} onChange={(e) => setDokForm({ ...dokForm, nama_dokumen: e.target.value })} className="input-field" placeholder="Nama dokumen" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Standar</label>
            <select value={dokForm.standar_id} onChange={(e) => setDokForm({ ...dokForm, standar_id: e.target.value })} className="input-field">
              <option value="">Pilih Standar</option>
              {standarList.map(s => <option key={s.id} value={s.id}>{s.kode} - {s.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">File URL</label>
            <FileUpload value={dokForm.file_url} onChange={(v) => setDokForm({ ...dokForm, file_url: v })} label="File Dokumen" accept=".pdf,.doc,.docx,.xls,.xlsx" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Status</label>
            <select value={dokForm.status} onChange={(e) => setDokForm({ ...dokForm, status: e.target.value })} className="input-field">
              <option value="draft">Draft</option>
              <option value="lengkap">Lengkap</option>
              <option value="revisi">Revisi</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Keterangan</label>
            <textarea value={dokForm.keterangan} onChange={(e) => setDokForm({ ...dokForm, keterangan: e.target.value })} className="input-field min-h-[60px]" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{editDokumen ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
    </div>
  );
}

function StandarTab() {
  const [data, setData] = useState<StandarAkreditasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get<StandarAkreditasi[]>('/akademik/akreditasi/standar');
      setData(Array.isArray(res) ? res : []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'kode', label: 'Kode', render: (r: StandarAkreditasi) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{r.kode}</span> },
    { key: 'nama', label: 'Nama Standar', render: (r: StandarAkreditasi) => <span className="dark:text-white font-medium">{r.nama}</span> },
    { key: 'deskripsi', label: 'Deskripsi', render: (r: StandarAkreditasi) => r.deskripsi || <span className="text-slate-400">-</span> },
    { key: 'bobot', label: 'Bobot', render: (r: StandarAkreditasi) => <span className="font-mono font-bold">{r.bobot}%</span> },
  ];

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={data} loading={loading} error={error} onRefresh={fetchData} emptyMessage="Belum ada standar" />
    </div>
  );
}
