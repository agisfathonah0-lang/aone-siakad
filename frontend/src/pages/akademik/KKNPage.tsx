import { useState, useEffect, useCallback } from 'react';
import { getPaginated, get, post, put, del as apiDel } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { BookMarked, Plus, Pencil, Trash2, Award, ClipboardList, CheckCircle, Search, Users, X, UserPlus } from 'lucide-react';
import type { KKN, KKNLogbook, KKNKelompok, Mahasiswa, Dosen } from '../../types';

const statusBadge: Record<string, 'info' | 'success' | 'default' | 'danger'> = {
  direncanakan: 'info',
  berlangsung: 'success',
  selesai: 'default',
  batal: 'danger',
};
const statusLabel: Record<string, string> = {
  direncanakan: 'Direncanakan',
  berlangsung: 'Berlangsung',
  selesai: 'Selesai',
  batal: 'Batal',
};
const semesterList = ['Ganjil', 'Genap', 'Pendek'];
const tahunAkademikList = ['2025/2026', '2024/2025', '2023/2024', '2022/2023'];

export default function KKNPage() {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === 'super_admin' || role === 'admin' || role === 'akademik' || role === 'kaprodi';

  const [activeTab, setActiveTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [data, setData] = useState<KKN[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [searchNama, setSearchNama] = useState('');

  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<KKN | null>(null);
  const [nilaiModal, setNilaiModal] = useState(false);
  const [nilaiItem, setNilaiItem] = useState<KKN | null>(null);
  const [nilaiForm, setNilaiForm] = useState({ nilai: 0 });

  const [form, setForm] = useState({
    mahasiswa_id: '', lokasi: '', tema: '', kelompok: '',
    dosen_pembimbing: '', tanggal_mulai: '', tanggal_selesai: '',
    semester: '', tahun_akademik: '', status: 'direncanakan',
  });

  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);

  const fetchRefs = useCallback(async () => {
    try {
      const [mhsRes, dosenRes] = await Promise.all([
        getPaginated<any>('/akademik/mahasiswa?page=1&limit=500'),
        getPaginated<any>('/akademik/dosen?page=1&limit=500'),
      ]);
      setMahasiswaList(mhsRes.rows || []);
      setDosenList(dosenRes.rows || []);
    } catch {}
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let url = `/akademik/kkn?page=${page}&limit=20`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (semesterFilter) url += `&semester=${semesterFilter}`;
      const res = await getPaginated<KKN>(url);
      const rows = (res.rows || []).filter((r: KKN) =>
        !searchNama || r.mahasiswa_nama?.toLowerCase().includes(searchNama.toLowerCase())
      );
      setData(rows);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, statusFilter, semesterFilter, searchNama]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchRefs(); }, [fetchRefs]);

  function openCreate() {
    setEditItem(null);
    setForm({ mahasiswa_id: '', lokasi: '', tema: '', kelompok: '', dosen_pembimbing: '', tanggal_mulai: '', tanggal_selesai: '', semester: '', tahun_akademik: '', status: 'direncanakan' });
    setModal(true);
  }

  function openEdit(row: KKN) {
    setEditItem(row);
    setForm({
      mahasiswa_id: row.mahasiswa_id,
      lokasi: row.lokasi,
      tema: row.tema || '',
      kelompok: row.kelompok || '',
      dosen_pembimbing: row.dosen_pembimbing || '',
      tanggal_mulai: row.tanggal_mulai?.slice(0, 10) || '',
      tanggal_selesai: row.tanggal_selesai?.slice(0, 10) || '',
      semester: row.semester || '',
      tahun_akademik: row.tahun_akademik || '',
      status: row.status,
    });
    setModal(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editItem) { await put(`/akademik/kkn/${editItem.id}`, form); }
      else { await post('/akademik/kkn', form); }
      setModal(false);
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  }

  async function deleteRow(id: string) {
    if (!confirm('Hapus data KKN ini?')) return;
    try { await apiDel(`/akademik/kkn/${id}`); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
  }

  function openNilai(row: KKN) {
    setNilaiItem(row);
    setNilaiForm({ nilai: row.nilai || 0 });
    setNilaiModal(true);
  }

  async function saveNilai(e: React.FormEvent) {
    e.preventDefault();
    if (!nilaiItem) return;
    setSubmitting(true);
    try {
      await put(`/akademik/kkn/${nilaiItem.id}/nilai`, nilaiForm);
      setNilaiModal(false);
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  }

  const columns = [
    { key: 'nim', label: 'NIM', render: (r: KKN) => r.nim || '-' },
    { key: 'mahasiswa_nama', label: 'Mahasiswa' },
    { key: 'lokasi', label: 'Lokasi' },
    { key: 'kelompok', label: 'Kelompok', render: (r: KKN) => r.kelompok || '-' },
    { key: 'pembimbing_nama', label: 'Pembimbing', render: (r: KKN) => r.pembimbing_nama || '-' },
    { key: 'status', label: 'Status', render: (r: KKN) => <Badge variant={statusBadge[r.status] || 'default'}>{statusLabel[r.status] || r.status}</Badge> },
    { key: 'nilai', label: 'Nilai', render: (r: KKN) => r.nilai != null ? r.nilai : '-' },
    { key: 'id', label: 'Aksi', render: (r: KKN) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => openNilai(r)} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"><Award size={14} /></button>
        {(isAdmin) && <button onClick={() => deleteRow(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>}
      </div>
    )},
  ];

  const [selectedKkn, setSelectedKkn] = useState('');
  const [logbookData, setLogbookData] = useState<KKNLogbook[]>([]);
  const [logbookLoading, setLogbookLoading] = useState(false);
  const [logbookModal, setLogbookModal] = useState(false);
  const [logbookForm, setLogbookForm] = useState({ tanggal: '', kegiatan: '', dokumentasi_url: '' });
  const [logbookEdit, setLogbookEdit] = useState<KKNLogbook | null>(null);

  useEffect(() => {
    if (!selectedKkn) { setLogbookData([]); return; }
    setLogbookLoading(true);
    get<KKNLogbook[]>(`/akademik/kkn/${selectedKkn}/logbook`)
      .then(res => setLogbookData(Array.isArray(res) ? res : []))
      .catch(() => setLogbookData([]))
      .finally(() => setLogbookLoading(false));
  }, [selectedKkn]);

  function openLogbookCreate() {
    setLogbookEdit(null);
    setLogbookForm({ tanggal: new Date().toISOString().slice(0, 10), kegiatan: '', dokumentasi_url: '' });
    setLogbookModal(true);
  }

  function openLogbookEdit(row: KKNLogbook) {
    setLogbookEdit(row);
    setLogbookForm({ tanggal: row.tanggal?.slice(0, 10) || '', kegiatan: row.kegiatan, dokumentasi_url: row.dokumentasi_url || '' });
    setLogbookModal(true);
  }

  async function saveLogbook(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (logbookEdit) { await put(`/akademik/kkn/logbook/${logbookEdit.id}`, logbookForm); }
      else { await post(`/akademik/kkn/${selectedKkn}/logbook`, logbookForm); }
      setLogbookModal(false);
      const res = await get<KKNLogbook[]>(`/akademik/kkn/${selectedKkn}/logbook`);
      setLogbookData(Array.isArray(res) ? res : []);
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  }

  async function deleteLogbook(id: string) {
    if (!confirm('Hapus entry logbook ini?')) return;
    try {
      await apiDel(`/akademik/kkn/logbook/${id}`);
      const res = await get<KKNLogbook[]>(`/akademik/kkn/${selectedKkn}/logbook`);
      setLogbookData(Array.isArray(res) ? res : []);
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  }

  async function approveLogbook(id: string) {
    try {
      await put(`/akademik/kkn/logbook/${id}/approve`, {});
      const res = await get<KKNLogbook[]>(`/akademik/kkn/${selectedKkn}/logbook`);
      setLogbookData(Array.isArray(res) ? res : []);
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  }

  const logbookCols = [
    { key: 'tanggal', label: 'Tanggal', render: (r: KKNLogbook) => r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID') : '-' },
    { key: 'kegiatan', label: 'Kegiatan' },
    { key: 'dokumentasi_url', label: 'Dokumentasi', render: (r: KKNLogbook) => r.dokumentasi_url ? <a href={r.dokumentasi_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs">Lihat</a> : '-' },
    { key: 'catatan_pembimbing', label: 'Catatan Pembimbing', render: (r: KKNLogbook) => r.catatan_pembimbing || '-' },
    { key: 'disetujui', label: 'Status', render: (r: KKNLogbook) => r.disetujui ? <Badge variant="success">Disetujui</Badge> : <Badge variant="warning">Pending</Badge> },
    { key: 'id', label: 'Aksi', render: (r: KKNLogbook) => (
      <div className="flex gap-1">
        <button onClick={() => openLogbookEdit(r)} className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => deleteLogbook(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
        {!r.disetujui && (role === 'dosen' || isAdmin) && (
          <button onClick={() => approveLogbook(r.id)} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"><CheckCircle size={14} /></button>
        )}
      </div>
    )},
  ];

  const [kelompokData, setKelompokData] = useState<KKNKelompok[]>([]);
  const [kelompokLoading, setKelompokLoading] = useState(false);
  const [kelompokModal, setKelompokModal] = useState(false);
  const [kelompokEdit, setKelompokEdit] = useState<KKNKelompok | null>(null);
  const [kelompokForm, setKelompokForm] = useState({ nama: '', lokasi: '', dosen_pembimbing: '' });
  const [kelompokDetail, setKelompokDetail] = useState<KKNKelompok | null>(null);
  const [anggotaList, setAnggotaList] = useState<any[]>([]);
  const [anggotaModal, setAnggotaModal] = useState(false);
  const [anggotaForm, setAnggotaForm] = useState({ mahasiswa_id: '' });

  const fetchKelompok = useCallback(async () => {
    setKelompokLoading(true);
    try {
      const res = await getPaginated<KKNKelompok>('/akademik/kkn-kelompok?limit=500');
      setKelompokData(res.rows || []);
    } catch { setKelompokData([]); }
    finally { setKelompokLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === 2) fetchKelompok(); }, [activeTab, fetchKelompok]);

  function openKelompokCreate() {
    setKelompokEdit(null);
    setKelompokForm({ nama: '', lokasi: '', dosen_pembimbing: '' });
    setKelompokModal(true);
  }

  function openKelompokEdit(row: KKNKelompok) {
    setKelompokEdit(row);
    setKelompokForm({ nama: row.nama, lokasi: row.lokasi || '', dosen_pembimbing: row.dosen_pembimbing || '' });
    setKelompokModal(true);
  }

  async function saveKelompok(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (kelompokEdit) { await put(`/akademik/kkn-kelompok/${kelompokEdit.id}`, kelompokForm); }
      else { await post('/akademik/kkn-kelompok', kelompokForm); }
      setKelompokModal(false);
      fetchKelompok();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  }

  async function deleteKelompok(id: string) {
    if (!confirm('Hapus kelompok ini?')) return;
    try { await apiDel(`/akademik/kkn-kelompok/${id}`); fetchKelompok(); }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
  }

  async function openKelompokDetail(row: KKNKelompok) {
    setKelompokDetail(row);
    try {
      const res = await get<any[]>(`/akademik/kkn-kelompok/${row.id}`);
      setAnggotaList(Array.isArray(res) ? res : []);
    } catch { setAnggotaList([]); }
  }

  function openAnggotaModal() {
    setAnggotaForm({ mahasiswa_id: '' });
    setAnggotaModal(true);
  }

  async function addAnggota(e: React.FormEvent) {
    e.preventDefault();
    if (!kelompokDetail) return;
    setSubmitting(true);
    try {
      await post(`/akademik/kkn-kelompok/${kelompokDetail.id}/anggota`, anggotaForm);
      setAnggotaModal(false);
      const res = await get<any[]>(`/akademik/kkn-kelompok/${kelompokDetail.id}`);
      setAnggotaList(Array.isArray(res) ? res : []);
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  }

  async function removeAnggota(anggotaId: string) {
    if (!confirm('Hapus anggota ini?')) return;
    if (!kelompokDetail) return;
    try {
      await apiDel(`/akademik/kkn-kelompok/${kelompokDetail.id}/anggota/${anggotaId}`);
      const res = await get<any[]>(`/akademik/kkn-kelompok/${kelompokDetail.id}`);
      setAnggotaList(Array.isArray(res) ? res : []);
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  }

  const kelompokCols = [
    { key: 'nama', label: 'Nama Kelompok' },
    { key: 'lokasi', label: 'Lokasi', render: (r: KKNKelompok) => r.lokasi || '-' },
    { key: 'pembimbing_nama', label: 'Pembimbing', render: (r: KKNKelompok) => r.pembimbing_nama || '-' },
    { key: 'jumlah_anggota', label: 'Anggota', render: (r: KKNKelompok) => r.jumlah_anggota ?? 0 },
    { key: 'id', label: 'Aksi', render: (r: KKNKelompok) => (
      <div className="flex gap-1">
        <button onClick={() => openKelompokDetail(r)} className="p-1.5 rounded-lg text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"><Users size={14} /></button>
        <button onClick={() => openKelompokEdit(r)} className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => deleteKelompok(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  const tabs = [
    { key: 0, label: 'Data KKN', icon: BookMarked },
    { key: 1, label: 'Logbook', icon: ClipboardList },
    { key: 2, label: 'Kelompok', icon: Users },
  ];

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold font-display tracking-tight dark:text-white">KKN (Kuliah Kerja Nyata)</h1></div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === t.key ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-2 items-center flex-wrap">
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field text-xs max-w-[150px]">
                <option value="">Semua Status</option>
                <option value="direncanakan">Direncanakan</option>
                <option value="berlangsung">Berlangsung</option>
                <option value="selesai">Selesai</option>
                <option value="batal">Batal</option>
              </select>
              <select value={semesterFilter} onChange={e => { setSemesterFilter(e.target.value); setPage(1); }} className="input-field text-xs max-w-[130px]">
                <option value="">Semester</option>
                {semesterList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="relative max-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={searchNama} onChange={e => { setSearchNama(e.target.value); setPage(1); }} placeholder="Cari mahasiswa..." className="input-field pl-8 text-xs" />
              </div>
            </div>
            <button onClick={openCreate} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={14} /> Tambah KKN</button>
          </div>
          <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} emptyMessage="Belum ada data KKN" />
        </>
      )}

      {activeTab === 1 && (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <select value={selectedKkn} onChange={e => setSelectedKkn(e.target.value)} className="input-field text-xs max-w-[400px]">
              <option value="">Pilih KKN</option>
              {data.map(p => <option key={p.id} value={p.id}>{p.mahasiswa_nama || '-'} - {p.lokasi}</option>)}
            </select>
            {selectedKkn && <button onClick={openLogbookCreate} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={14} /> Tambah Log</button>}
          </div>
          {selectedKkn ? (
            <DataTable columns={logbookCols} data={logbookData} loading={logbookLoading} emptyMessage="Belum ada entry logbook" />
          ) : (
            <div className="text-center py-12 text-slate-400 dark:text-zinc-500 text-xs">Pilih data KKN terlebih dahulu</div>
          )}
        </>
      )}

      {activeTab === 2 && (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div />
            <button onClick={openKelompokCreate} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={14} /> Tambah Kelompok</button>
          </div>
          <DataTable columns={kelompokCols} data={kelompokData} loading={kelompokLoading} emptyMessage="Belum ada kelompok KKN" />
        </>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Edit KKN' : 'Tambah KKN'} size="lg">
        <form onSubmit={save} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Mahasiswa</label>
              <select value={form.mahasiswa_id} onChange={e => setForm({ ...form, mahasiswa_id: e.target.value })} required className="input-field text-sm">
                <option value="">Pilih Mahasiswa</option>
                {mahasiswaList.map(m => <option key={m.id} value={m.id}>{m.nim} - {m.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Dosen Pembimbing</label>
              <select value={form.dosen_pembimbing} onChange={e => setForm({ ...form, dosen_pembimbing: e.target.value })} className="input-field text-sm">
                <option value="">Pilih Dosen</option>
                {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Lokasi</label>
            <input value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })} required className="input-field text-sm" placeholder="Lokasi KKN" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Tema</label>
              <input value={form.tema} onChange={e => setForm({ ...form, tema: e.target.value })} className="input-field text-sm" placeholder="Tema kegiatan" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Kelompok</label>
              <input value={form.kelompok} onChange={e => setForm({ ...form, kelompok: e.target.value })} className="input-field text-sm" placeholder="Nama kelompok" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Tanggal Mulai</label>
              <input type="date" value={form.tanggal_mulai} onChange={e => setForm({ ...form, tanggal_mulai: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Tanggal Selesai</label>
              <input type="date" value={form.tanggal_selesai} onChange={e => setForm({ ...form, tanggal_selesai: e.target.value })} className="input-field text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Semester</label>
              <select value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} className="input-field text-sm">
                <option value="">Pilih</option>
                {semesterList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Tahun Akademik</label>
              <select value={form.tahun_akademik} onChange={e => setForm({ ...form, tahun_akademik: e.target.value })} className="input-field text-sm">
                <option value="">Pilih</option>
                {tahunAkademikList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field text-sm">
                <option value="direncanakan">Direncanakan</option>
                <option value="berlangsung">Berlangsung</option>
                <option value="selesai">Selesai</option>
                <option value="batal">Batal</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary text-xs">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">{submitting ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambah KKN'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={nilaiModal} onClose={() => setNilaiModal(false)} title="Input Nilai KKN" size="sm">
        <form onSubmit={saveNilai} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Nilai (0-100)</label>
            <input type="number" min="0" max="100" step="0.01" value={nilaiForm.nilai} onChange={e => setNilaiForm({ nilai: parseFloat(e.target.value) || 0 })} required className="input-field text-sm" />
          </div>
          {nilaiItem && (
            <p className="text-xs text-slate-400">{nilaiItem.mahasiswa_nama} - {nilaiItem.lokasi}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setNilaiModal(false)} className="btn-secondary text-xs">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">{submitting ? 'Menyimpan...' : 'Simpan Nilai'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={logbookModal} onClose={() => setLogbookModal(false)} title={logbookEdit ? 'Edit Logbook' : 'Tambah Logbook'} size="md">
        <form onSubmit={saveLogbook} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Tanggal</label>
            <input type="date" value={logbookForm.tanggal} onChange={e => setLogbookForm({ ...logbookForm, tanggal: e.target.value })} required className="input-field text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Kegiatan</label>
            <textarea rows={4} value={logbookForm.kegiatan} onChange={e => setLogbookForm({ ...logbookForm, kegiatan: e.target.value })} required className="input-field text-sm" placeholder="Deskripsi kegiatan" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Dokumentasi URL</label>
            <input value={logbookForm.dokumentasi_url} onChange={e => setLogbookForm({ ...logbookForm, dokumentasi_url: e.target.value })} className="input-field text-sm" placeholder="URL dokumentasi" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setLogbookModal(false)} className="btn-secondary text-xs">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">{submitting ? 'Menyimpan...' : logbookEdit ? 'Simpan Perubahan' : 'Tambah Log'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={kelompokModal} onClose={() => setKelompokModal(false)} title={kelompokEdit ? 'Edit Kelompok' : 'Tambah Kelompok'} size="md">
        <form onSubmit={saveKelompok} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Nama Kelompok</label>
            <input value={kelompokForm.nama} onChange={e => setKelompokForm({ ...kelompokForm, nama: e.target.value })} required className="input-field text-sm" placeholder="Nama kelompok" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Lokasi</label>
            <input value={kelompokForm.lokasi} onChange={e => setKelompokForm({ ...kelompokForm, lokasi: e.target.value })} className="input-field text-sm" placeholder="Lokasi KKN" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Dosen Pembimbing</label>
            <select value={kelompokForm.dosen_pembimbing} onChange={e => setKelompokForm({ ...kelompokForm, dosen_pembimbing: e.target.value })} className="input-field text-sm">
              <option value="">Pilih Dosen</option>
              {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setKelompokModal(false)} className="btn-secondary text-xs">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">{submitting ? 'Menyimpan...' : kelompokEdit ? 'Simpan Perubahan' : 'Tambah Kelompok'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!kelompokDetail} onClose={() => setKelompokDetail(null)} title={`Detail Kelompok: ${kelompokDetail?.nama || ''}`} size="lg">
        {kelompokDetail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Anggota Kelompok</p>
              <button onClick={openAnggotaModal} className="btn-primary text-xs flex items-center gap-1"><UserPlus size={14} /> Tambah Anggota</button>
            </div>
            {anggotaList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada anggota</p>
            ) : (
              <div className="space-y-1">
                {anggotaList.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800">
                    <div>
                      <p className="text-sm font-medium dark:text-white">{a.mahasiswa_nama || a.nama || '-'}</p>
                      <p className="text-xs text-slate-400">{a.nim || '-'}</p>
                    </div>
                    <button onClick={() => removeAnggota(a.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={anggotaModal} onClose={() => setAnggotaModal(false)} title="Tambah Anggota Kelompok" size="sm">
        <form onSubmit={addAnggota} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Mahasiswa</label>
            <select value={anggotaForm.mahasiswa_id} onChange={e => setAnggotaForm({ mahasiswa_id: e.target.value })} required className="input-field text-sm">
              <option value="">Pilih Mahasiswa</option>
              {mahasiswaList.map(m => <option key={m.id} value={m.id}>{m.nim} - {m.nama}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAnggotaModal(false)} className="btn-secondary text-xs">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">{submitting ? 'Menyimpan...' : 'Tambah'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
