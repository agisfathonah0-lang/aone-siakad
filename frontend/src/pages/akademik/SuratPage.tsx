import { useState, useEffect } from 'react';
import { get, post, put, del as apiDel } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Plus, Eye, Pencil, Trash2, Search, Mail, Send, FileOutput, FileText, CheckCircle, XCircle, Clock, FolderOpen } from 'lucide-react';
import type { SuratKategori, SuratMasuk, SuratKeluar, SuratPengajuan } from '../../types';

const masukStatusBadge: Record<string, 'success' | 'info' | 'default'> = { diterima: 'success', didisposisikan: 'info', selesai: 'default' };
const masukStatusLabel: Record<string, string> = { diterima: 'Diterima', didisposisikan: 'Didisposisikan', selesai: 'Selesai' };
const keluarStatusBadge: Record<string, 'default' | 'info' | 'success'> = { draft: 'default', dikirim: 'info', ditandatangani: 'success' };
const keluarStatusLabel: Record<string, string> = { draft: 'Draft', dikirim: 'Dikirim', ditandatangani: 'Ditandatangani' };
const pengajuanStatusBadge: Record<string, 'warning' | 'info' | 'success' | 'danger'> = { diajukan: 'warning', diproses: 'info', selesai: 'success', ditolak: 'danger' };
const pengajuanStatusLabel: Record<string, string> = { diajukan: 'Diajukan', diproses: 'Diproses', selesai: 'Selesai', ditolak: 'Ditolak' };

export default function SuratPage() {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === 'super_admin' || role === 'admin' || role === 'akademik';
  const isMahasiswa = role === 'mahasiswa';

  const [activeTab, setActiveTab] = useState(isMahasiswa ? 2 : 0);
  const [kategoriList, setKategoriList] = useState<SuratKategori[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadKategori(); }, []);

  async function loadKategori() {
    try {
      const res = await get<any>('/akademik/surat/kategori');
      setKategoriList(Array.isArray(res) ? res : []);
    } catch {}
  }

  const [masukData, setMasukData] = useState<SuratMasuk[]>([]);
  const [masukLoading, setMasukLoading] = useState(true);
  const [masukPage, setMasukPage] = useState(1);
  const [masukTotal, setMasukTotal] = useState(0);
  const [masukSearch, setMasukSearch] = useState('');
  const [masukStatus, setMasukStatus] = useState('');
  const [masukForm, setMasukForm] = useState({ nomor_surat: '', tanggal_surat: '', tanggal_terima: '', asal: '', perihal: '', lampiran: '', penerima: '', kategori_id: '', file_url: '', status: 'diterima', catatan: '' });
  const [masukModal, setMasukModal] = useState(false);
  const [masukEdit, setMasukEdit] = useState<SuratMasuk | null>(null);
  const [masukDetail, setMasukDetail] = useState<SuratMasuk | null>(null);
  const [masukDetailModal, setMasukDetailModal] = useState(false);
  const [disposisiForm, setDisposisiForm] = useState({ dari_jabatan: '', ke_jabatan: '', instruksi: '', catatan: '', batas_waktu: '' });
  const [showDisposisiForm, setShowDisposisiForm] = useState(false);

  useEffect(() => { loadMasuk(); }, [masukPage, masukSearch, masukStatus]);

  async function loadMasuk() {
    setMasukLoading(true);
    try {
      let url = `/akademik/surat/masuk?page=${masukPage}&limit=20`;
      if (masukSearch) url += `&q=${encodeURIComponent(masukSearch)}`;
      if (masukStatus) url += `&status=${masukStatus}`;
      const res = await get<any>(url);
      setMasukData(res.rows || []);
      setMasukTotal(res.pagination?.total || 0);
    } catch {} finally { setMasukLoading(false); }
  }

  async function openMasukDetail(row: SuratMasuk) {
    try {
      const res = await get<SuratMasuk>(`/akademik/surat/masuk/${row.id}`);
      setMasukDetail(res);
      setShowDisposisiForm(false);
      setMasukDetailModal(true);
    } catch {}
  }

  function openMasukCreate() {
    setMasukEdit(null);
    setMasukForm({ nomor_surat: '', tanggal_surat: '', tanggal_terima: '', asal: '', perihal: '', lampiran: '', penerima: '', kategori_id: '', file_url: '', status: 'diterima', catatan: '' });
    setMasukModal(true);
  }

  function openMasukEdit(row: SuratMasuk) {
    setMasukEdit(row);
    setMasukForm({ nomor_surat: row.nomor_surat, tanggal_surat: row.tanggal_surat?.slice(0, 10) || '', tanggal_terima: row.tanggal_terima?.slice(0, 10) || '', asal: row.asal, perihal: row.perihal, lampiran: row.lampiran || '', penerima: row.penerima || '', kategori_id: row.kategori_id || '', file_url: row.file_url || '', status: row.status, catatan: row.catatan || '' });
    setMasukModal(true);
  }

  async function saveMasuk(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (masukEdit) { await put(`/akademik/surat/masuk/${masukEdit.id}`, masukForm); }
      else { await post('/akademik/surat/masuk', masukForm); }
      setMasukModal(false);
      loadMasuk();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  }

  async function deleteMasuk(id: string) {
    if (!confirm('Hapus surat masuk ini?')) return;
    try { await apiDel(`/akademik/surat/masuk/${id}`); loadMasuk(); }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
  }

  async function addDisposisi() {
    if (!masukDetail) return;
    setSubmitting(true);
    try {
      await post(`/akademik/surat/masuk/${masukDetail.id}/disposisi`, disposisiForm);
      setShowDisposisiForm(false);
      setDisposisiForm({ dari_jabatan: '', ke_jabatan: '', instruksi: '', catatan: '', batas_waktu: '' });
      const res = await get<SuratMasuk>(`/akademik/surat/masuk/${masukDetail.id}`);
      setMasukDetail(res);
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  }

  async function deleteDisposisi(id: string) {
    if (!confirm('Hapus disposisi ini?')) return;
    try {
      await apiDel(`/akademik/surat/disposisi/${id}`);
      if (masukDetail) {
        const res = await get<SuratMasuk>(`/akademik/surat/masuk/${masukDetail.id}`);
        setMasukDetail(res);
      }
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  }

  const masukCols = [
    { key: 'nomor_surat', label: 'No Surat' },
    { key: 'tanggal_surat', label: 'Tanggal', render: (r: SuratMasuk) => r.tanggal_surat ? new Date(r.tanggal_surat).toLocaleDateString('id-ID') : '-' },
    { key: 'asal', label: 'Asal' },
    { key: 'perihal', label: 'Perihal' },
    { key: 'penerima', label: 'Penerima' },
    { key: 'status', label: 'Status', render: (r: SuratMasuk) => <Badge variant={masukStatusBadge[r.status as keyof typeof masukStatusBadge] || 'default'}>{masukStatusLabel[r.status as keyof typeof masukStatusLabel] || r.status}</Badge> },
    { key: 'id', label: 'Aksi', render: (r: SuratMasuk) => (
      <div className="flex gap-1">
        <button onClick={() => openMasukDetail(r)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><Eye size={14} /></button>
        <button onClick={() => openMasukEdit(r)} className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => deleteMasuk(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  const [keluarData, setKeluarData] = useState<SuratKeluar[]>([]);
  const [keluarLoading, setKeluarLoading] = useState(true);
  const [keluarPage, setKeluarPage] = useState(1);
  const [keluarTotal, setKeluarTotal] = useState(0);
  const [keluarSearch, setKeluarSearch] = useState('');
  const [keluarStatusFilter, setKeluarStatusFilter] = useState('');
  const [keluarForm, setKeluarForm] = useState({ nomor_surat: '', tanggal_surat: '', tujuan: '', perihal: '', lampiran: '', kategori_id: '', file_url: '', status: 'draft', pengirim: '', penandatangan: '', catatan: '' });
  const [keluarModal, setKeluarModal] = useState(false);
  const [keluarEdit, setKeluarEdit] = useState<SuratKeluar | null>(null);

  useEffect(() => { loadKeluar(); }, [keluarPage, keluarSearch, keluarStatusFilter]);

  async function loadKeluar() {
    setKeluarLoading(true);
    try {
      let url = `/akademik/surat/keluar?page=${keluarPage}&limit=20`;
      if (keluarSearch) url += `&q=${encodeURIComponent(keluarSearch)}`;
      if (keluarStatusFilter) url += `&status=${keluarStatusFilter}`;
      const res = await get<any>(url);
      setKeluarData(res.rows || []);
      setKeluarTotal(res.pagination?.total || 0);
    } catch {} finally { setKeluarLoading(false); }
  }

  function openKeluarCreate() {
    setKeluarEdit(null);
    setKeluarForm({ nomor_surat: '', tanggal_surat: '', tujuan: '', perihal: '', lampiran: '', kategori_id: '', file_url: '', status: 'draft', pengirim: '', penandatangan: '', catatan: '' });
    setKeluarModal(true);
  }

  function openKeluarEdit(row: SuratKeluar) {
    setKeluarEdit(row);
    setKeluarForm({ nomor_surat: row.nomor_surat, tanggal_surat: row.tanggal_surat?.slice(0, 10) || '', tujuan: row.tujuan, perihal: row.perihal, lampiran: row.lampiran || '', kategori_id: row.kategori_id || '', file_url: row.file_url || '', status: row.status, pengirim: row.pengirim || '', penandatangan: row.penandatangan || '', catatan: row.catatan || '' });
    setKeluarModal(true);
  }

  async function saveKeluar(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (keluarEdit) { await put(`/akademik/surat/keluar/${keluarEdit.id}`, keluarForm); }
      else { await post('/akademik/surat/keluar', keluarForm); }
      setKeluarModal(false);
      loadKeluar();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  }

  async function deleteKeluar(id: string) {
    if (!confirm('Hapus surat keluar ini?')) return;
    try { await apiDel(`/akademik/surat/keluar/${id}`); loadKeluar(); }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
  }

  const keluarCols = [
    { key: 'nomor_surat', label: 'No Surat' },
    { key: 'tanggal_surat', label: 'Tanggal', render: (r: SuratKeluar) => r.tanggal_surat ? new Date(r.tanggal_surat).toLocaleDateString('id-ID') : '-' },
    { key: 'tujuan', label: 'Tujuan' },
    { key: 'perihal', label: 'Perihal' },
    { key: 'status', label: 'Status', render: (r: SuratKeluar) => <Badge variant={keluarStatusBadge[r.status as keyof typeof keluarStatusBadge] || 'default'}>{keluarStatusLabel[r.status as keyof typeof keluarStatusLabel] || r.status}</Badge> },
    { key: 'id', label: 'Aksi', render: (r: SuratKeluar) => (
      <div className="flex gap-1">
        <button onClick={() => openKeluarEdit(r)} className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => deleteKeluar(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  const [pengajuanData, setPengajuanData] = useState<SuratPengajuan[]>([]);
  const [pengajuanLoading, setPengajuanLoading] = useState(true);
  const [pengajuanPage, setPengajuanPage] = useState(1);
  const [pengajuanTotal, setPengajuanTotal] = useState(0);
  const [pengajuanForm, setPengajuanForm] = useState({ kategori_id: '', keperluan: '', tujuan: '' });
  const [pengajuanModal, setPengajuanModal] = useState(false);

  useEffect(() => { loadPengajuan(); }, [pengajuanPage]);

  async function loadPengajuan() {
    setPengajuanLoading(true);
    try {
      const res = await get<any>(`/akademik/surat/pengajuan?page=${pengajuanPage}&limit=20`);
      setPengajuanData(res.rows || []);
      setPengajuanTotal(res.pagination?.total || 0);
    } catch {} finally { setPengajuanLoading(false); }
  }

  async function savePengajuan(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await post('/akademik/surat/pengajuan', pengajuanForm);
      setPengajuanModal(false);
      setPengajuanForm({ kategori_id: '', keperluan: '', tujuan: '' });
      loadPengajuan();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  }

  const pengajuanCols = [
    { key: 'nomor_surat', label: 'No Surat', render: (r: SuratPengajuan) => r.nomor_surat || '-' },
    { key: 'kategori_nama', label: 'Kategori', render: (r: SuratPengajuan) => r.kategori_nama || '-' },
    { key: 'keperluan', label: 'Keperluan' },
    { key: 'status', label: 'Status', render: (r: SuratPengajuan) => <Badge variant={pengajuanStatusBadge[r.status as keyof typeof pengajuanStatusBadge] || 'default'}>{pengajuanStatusLabel[r.status as keyof typeof pengajuanStatusLabel] || r.status}</Badge> },
    { key: 'id', label: 'Detail', render: (r: SuratPengajuan) => (
      <div className="flex gap-1 items-center">
        {r.status === 'ditolak' && r.catatan_penolakan && <span className="text-xs text-red-500 max-w-[120px] truncate" title={r.catatan_penolakan}>{r.catatan_penolakan}</span>}
        {r.status === 'selesai' && r.file_url && <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"><FileText size={12} /> Lihat</a>}
      </div>
    )},
  ];

  const [kategoriForm, setKategoriForm] = useState({ kode: '', nama: '', deskripsi: '', template: '' });
  const [kategoriModal, setKategoriModal] = useState(false);
  const [kategoriEdit, setKategoriEdit] = useState<SuratKategori | null>(null);

  function openKategoriCreate() {
    setKategoriEdit(null);
    setKategoriForm({ kode: '', nama: '', deskripsi: '', template: '' });
    setKategoriModal(true);
  }

  function openKategoriEdit(row: SuratKategori) {
    setKategoriEdit(row);
    setKategoriForm({ kode: row.kode, nama: row.nama, deskripsi: row.deskripsi || '', template: row.template || '' });
    setKategoriModal(true);
  }

  async function saveKategori(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (kategoriEdit) { await put(`/akademik/surat/kategori/${kategoriEdit.id}`, kategoriForm); }
      else { await post('/akademik/surat/kategori', kategoriForm); }
      setKategoriModal(false);
      loadKategori();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  }

  async function deleteKategori(id: string) {
    if (!confirm('Hapus kategori ini?')) return;
    try { await apiDel(`/akademik/surat/kategori/${id}`); loadKategori(); }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
  }

  const kategoriCols = [
    { key: 'kode', label: 'Kode' },
    { key: 'nama', label: 'Nama' },
    { key: 'deskripsi', label: 'Deskripsi', render: (r: SuratKategori) => r.deskripsi || '-' },
    { key: 'id', label: 'Aksi', render: (r: SuratKategori) => (
      <div className="flex gap-1">
        <button onClick={() => openKategoriEdit(r)} className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => deleteKategori(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  const tabs = [
    ...(isAdmin ? [{ key: 0, label: 'Surat Masuk', icon: Mail }] : []),
    ...(isAdmin ? [{ key: 1, label: 'Surat Keluar', icon: Send }] : []),
    { key: 2, label: 'Pengajuan Surat', icon: FileText },
    ...(isAdmin ? [{ key: 3, label: 'Kategori', icon: FolderOpen }] : []),
  ];

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Surat</h1></div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === t.key ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 0 && isAdmin && (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2 items-center">
              <div className="relative max-w-xs">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={masukSearch} onChange={e => { setMasukSearch(e.target.value); setMasukPage(1); }} placeholder="Cari surat masuk..." className="input-field pl-9 text-xs" />
              </div>
              <select value={masukStatus} onChange={e => { setMasukStatus(e.target.value); setMasukPage(1); }} className="input-field text-xs max-w-[150px]">
                <option value="">Semua Status</option>
                <option value="diterima">Diterima</option>
                <option value="didisposisikan">Didisposisikan</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
            <button onClick={openMasukCreate} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={14} /> Tambah Surat Masuk</button>
          </div>
          <DataTable columns={masukCols} data={masukData} loading={masukLoading} page={masukPage} totalPages={Math.ceil(masukTotal / 20)} onPageChange={setMasukPage} />
        </>
      )}

      {activeTab === 1 && isAdmin && (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2 items-center">
              <div className="relative max-w-xs">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={keluarSearch} onChange={e => { setKeluarSearch(e.target.value); setKeluarPage(1); }} placeholder="Cari surat keluar..." className="input-field pl-9 text-xs" />
              </div>
              <select value={keluarStatusFilter} onChange={e => { setKeluarStatusFilter(e.target.value); setKeluarPage(1); }} className="input-field text-xs max-w-[150px]">
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="dikirim">Dikirim</option>
                <option value="ditandatangani">Ditandatangani</option>
              </select>
            </div>
            <button onClick={openKeluarCreate} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={14} /> Tambah Surat Keluar</button>
          </div>
          <DataTable columns={keluarCols} data={keluarData} loading={keluarLoading} page={keluarPage} totalPages={Math.ceil(keluarTotal / 20)} onPageChange={setKeluarPage} />
        </>
      )}

      {activeTab === 2 && (
        <>
          <div className="flex items-center justify-between">
            <div />
            <button onClick={() => { setPengajuanForm({ kategori_id: '', keperluan: '', tujuan: '' }); setPengajuanModal(true); }} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={14} /> Ajukan Surat</button>
          </div>
          <DataTable columns={pengajuanCols} data={pengajuanData} loading={pengajuanLoading} page={pengajuanPage} totalPages={Math.ceil(pengajuanTotal / 20)} onPageChange={setPengajuanPage} emptyMessage="Belum ada pengajuan surat" />
        </>
      )}

      {activeTab === 3 && isAdmin && (
        <>
          <div className="flex items-center justify-between">
            <div />
            <button onClick={openKategoriCreate} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={14} /> Tambah Kategori</button>
          </div>
          <DataTable columns={kategoriCols} data={kategoriList} emptyMessage="Belum ada kategori" />
        </>
      )}

      <Modal open={masukModal} onClose={() => setMasukModal(false)} title={masukEdit ? 'Edit Surat Masuk' : 'Tambah Surat Masuk'} size="lg">
        <form onSubmit={saveMasuk} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Nomor Surat</label>
              <input value={masukForm.nomor_surat} onChange={e => setMasukForm({ ...masukForm, nomor_surat: e.target.value })} required className="input-field text-sm" placeholder="001/UNIV/A/2025" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Kategori</label>
              <select value={masukForm.kategori_id} onChange={e => setMasukForm({ ...masukForm, kategori_id: e.target.value })} className="input-field text-sm">
                <option value="">Pilih Kategori</option>
                {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Tanggal Surat</label>
              <input type="date" value={masukForm.tanggal_surat} onChange={e => setMasukForm({ ...masukForm, tanggal_surat: e.target.value })} required className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Tanggal Terima</label>
              <input type="date" value={masukForm.tanggal_terima} onChange={e => setMasukForm({ ...masukForm, tanggal_terima: e.target.value })} required className="input-field text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Asal</label>
              <input value={masukForm.asal} onChange={e => setMasukForm({ ...masukForm, asal: e.target.value })} required className="input-field text-sm" placeholder="Instansi pengirim" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Penerima</label>
              <input value={masukForm.penerima} onChange={e => setMasukForm({ ...masukForm, penerima: e.target.value })} className="input-field text-sm" placeholder="Nama penerima" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Perihal</label>
            <input value={masukForm.perihal} onChange={e => setMasukForm({ ...masukForm, perihal: e.target.value })} required className="input-field text-sm" placeholder="Perihal surat" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Lampiran</label>
              <input value={masukForm.lampiran} onChange={e => setMasukForm({ ...masukForm, lampiran: e.target.value })} className="input-field text-sm" placeholder="Lampiran (jika ada)" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">File URL</label>
              <input value={masukForm.file_url} onChange={e => setMasukForm({ ...masukForm, file_url: e.target.value })} className="input-field text-sm" placeholder="URL file surat" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Status</label>
              <select value={masukForm.status} onChange={e => setMasukForm({ ...masukForm, status: e.target.value })} className="input-field text-sm">
                <option value="diterima">Diterima</option>
                <option value="didisposisikan">Didisposisikan</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Catatan</label>
              <input value={masukForm.catatan} onChange={e => setMasukForm({ ...masukForm, catatan: e.target.value })} className="input-field text-sm" placeholder="Catatan" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setMasukModal(false)} className="btn-secondary text-xs">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">{submitting ? 'Menyimpan...' : masukEdit ? 'Simpan Perubahan' : 'Tambah Surat'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={masukDetailModal} onClose={() => { setMasukDetailModal(false); setShowDisposisiForm(false); }} title="Detail Surat Masuk" size="lg">
        {masukDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-slate-400 block">Nomor Surat</span><span className="font-semibold dark:text-white">{masukDetail.nomor_surat}</span></div>
              <div><span className="text-xs text-slate-400 block">Status</span><Badge variant={masukStatusBadge[masukDetail.status as keyof typeof masukStatusBadge] || 'default'}>{masukStatusLabel[masukDetail.status as keyof typeof masukStatusLabel] || masukDetail.status}</Badge></div>
              <div><span className="text-xs text-slate-400 block">Tanggal Surat</span><span className="dark:text-white">{new Date(masukDetail.tanggal_surat).toLocaleDateString('id-ID')}</span></div>
              <div><span className="text-xs text-slate-400 block">Tanggal Terima</span><span className="dark:text-white">{new Date(masukDetail.tanggal_terima).toLocaleDateString('id-ID')}</span></div>
              <div><span className="text-xs text-slate-400 block">Asal</span><span className="dark:text-white">{masukDetail.asal}</span></div>
              <div><span className="text-xs text-slate-400 block">Penerima</span><span className="dark:text-white">{masukDetail.penerima || '-'}</span></div>
              <div className="col-span-2"><span className="text-xs text-slate-400 block">Perihal</span><span className="dark:text-white">{masukDetail.perihal}</span></div>
              {masukDetail.lampiran && <div><span className="text-xs text-slate-400 block">Lampiran</span><span className="dark:text-white">{masukDetail.lampiran}</span></div>}
              {masukDetail.kategori_nama && <div><span className="text-xs text-slate-400 block">Kategori</span><span className="dark:text-white">{masukDetail.kategori_nama}</span></div>}
              {masukDetail.file_url && <div className="col-span-2"><span className="text-xs text-slate-400 block">File</span><a href={masukDetail.file_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs">Lihat File</a></div>}
              {masukDetail.catatan && <div className="col-span-2"><span className="text-xs text-slate-400 block">Catatan</span><span className="dark:text-white">{masukDetail.catatan}</span></div>}
            </div>

            <div className="border-t dark:border-zinc-700/30 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold dark:text-white flex items-center gap-1.5"><Mail size={14} /> Disposisi ({masukDetail.disposisi?.length || 0})</h3>
                <button onClick={() => setShowDisposisiForm(!showDisposisiForm)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"><Plus size={12} /> Tambah Disposisi</button>
              </div>

              {showDisposisiForm && (
                <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl mb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Dari Jabatan</label>
                      <input value={disposisiForm.dari_jabatan} onChange={e => setDisposisiForm({ ...disposisiForm, dari_jabatan: e.target.value })} required className="input-field text-sm" placeholder="Rektor" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Ke Jabatan</label>
                      <input value={disposisiForm.ke_jabatan} onChange={e => setDisposisiForm({ ...disposisiForm, ke_jabatan: e.target.value })} required className="input-field text-sm" placeholder="Wakil Rektor I" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Instruksi</label>
                    <input value={disposisiForm.instruksi} onChange={e => setDisposisiForm({ ...disposisiForm, instruksi: e.target.value })} className="input-field text-sm" placeholder="Instruksi" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Batas Waktu</label>
                      <input type="date" value={disposisiForm.batas_waktu} onChange={e => setDisposisiForm({ ...disposisiForm, batas_waktu: e.target.value })} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Catatan</label>
                      <input value={disposisiForm.catatan} onChange={e => setDisposisiForm({ ...disposisiForm, catatan: e.target.value })} className="input-field text-sm" placeholder="Catatan disposisi" />
                    </div>
                  </div>
                  <button onClick={addDisposisi} disabled={submitting} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition">{submitting ? 'Menyimpan...' : 'Simpan Disposisi'}</button>
                </div>
              )}

              {(masukDetail.disposisi || []).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Belum ada disposisi</p>
              ) : (
                <div className="space-y-2">
                  {masukDetail.disposisi?.map(d => (
                    <div key={d.id} className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl text-xs flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <p className="font-semibold dark:text-white">{d.dari_jabatan} → {d.ke_jabatan}</p>
                        {d.instruksi && <p className="text-slate-500">{d.instruksi}</p>}
                        {d.batas_waktu && <p className="text-slate-400">Batas: {new Date(d.batas_waktu).toLocaleDateString('id-ID')}</p>}
                        {d.catatan && <p className="text-slate-400">{d.catatan}</p>}
                      </div>
                      <button onClick={() => deleteDisposisi(d.id)} className="text-red-400 hover:text-red-600 p-1 shrink-0"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={keluarModal} onClose={() => setKeluarModal(false)} title={keluarEdit ? 'Edit Surat Keluar' : 'Tambah Surat Keluar'} size="lg">
        <form onSubmit={saveKeluar} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Nomor Surat</label>
              <input value={keluarForm.nomor_surat} onChange={e => setKeluarForm({ ...keluarForm, nomor_surat: e.target.value })} required className="input-field text-sm" placeholder="002/UNIV/A/2025" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Kategori</label>
              <select value={keluarForm.kategori_id} onChange={e => setKeluarForm({ ...keluarForm, kategori_id: e.target.value })} className="input-field text-sm">
                <option value="">Pilih Kategori</option>
                {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Tanggal Surat</label>
              <input type="date" value={keluarForm.tanggal_surat} onChange={e => setKeluarForm({ ...keluarForm, tanggal_surat: e.target.value })} required className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Tujuan</label>
              <input value={keluarForm.tujuan} onChange={e => setKeluarForm({ ...keluarForm, tujuan: e.target.value })} required className="input-field text-sm" placeholder="Instansi tujuan" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Perihal</label>
            <input value={keluarForm.perihal} onChange={e => setKeluarForm({ ...keluarForm, perihal: e.target.value })} required className="input-field text-sm" placeholder="Perihal surat" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Lampiran</label>
              <input value={keluarForm.lampiran} onChange={e => setKeluarForm({ ...keluarForm, lampiran: e.target.value })} className="input-field text-sm" placeholder="Lampiran" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">File URL</label>
              <input value={keluarForm.file_url} onChange={e => setKeluarForm({ ...keluarForm, file_url: e.target.value })} className="input-field text-sm" placeholder="URL file surat" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Pengirim</label>
              <input value={keluarForm.pengirim} onChange={e => setKeluarForm({ ...keluarForm, pengirim: e.target.value })} className="input-field text-sm" placeholder="Pengirim" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Penandatangan</label>
              <input value={keluarForm.penandatangan} onChange={e => setKeluarForm({ ...keluarForm, penandatangan: e.target.value })} className="input-field text-sm" placeholder="Penandatangan" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Status</label>
              <select value={keluarForm.status} onChange={e => setKeluarForm({ ...keluarForm, status: e.target.value })} className="input-field text-sm">
                <option value="draft">Draft</option>
                <option value="dikirim">Dikirim</option>
                <option value="ditandatangani">Ditandatangani</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Catatan</label>
            <textarea rows={2} value={keluarForm.catatan} onChange={e => setKeluarForm({ ...keluarForm, catatan: e.target.value })} className="input-field text-sm" placeholder="Catatan" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setKeluarModal(false)} className="btn-secondary text-xs">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">{submitting ? 'Menyimpan...' : keluarEdit ? 'Simpan Perubahan' : 'Tambah Surat'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={pengajuanModal} onClose={() => setPengajuanModal(false)} title="Ajukan Surat" size="md">
        <form onSubmit={savePengajuan} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Kategori</label>
            <select value={pengajuanForm.kategori_id} onChange={e => setPengajuanForm({ ...pengajuanForm, kategori_id: e.target.value })} required className="input-field text-sm">
              <option value="">Pilih Kategori</option>
              {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Keperluan</label>
            <textarea rows={4} value={pengajuanForm.keperluan} onChange={e => setPengajuanForm({ ...pengajuanForm, keperluan: e.target.value })} required className="input-field text-sm" placeholder="Jelaskan keperluan pengajuan surat..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Tujuan</label>
            <input value={pengajuanForm.tujuan} onChange={e => setPengajuanForm({ ...pengajuanForm, tujuan: e.target.value })} className="input-field text-sm" placeholder="Tujuan surat (opsional)" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setPengajuanModal(false)} className="btn-secondary text-xs">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">{submitting ? 'Mengirim...' : 'Ajukan'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={kategoriModal} onClose={() => setKategoriModal(false)} title={kategoriEdit ? 'Edit Kategori' : 'Tambah Kategori'} size="md">
        <form onSubmit={saveKategori} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Kode</label>
              <input value={kategoriForm.kode} onChange={e => setKategoriForm({ ...kategoriForm, kode: e.target.value })} required className="input-field text-sm" placeholder="SK" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Nama</label>
              <input value={kategoriForm.nama} onChange={e => setKategoriForm({ ...kategoriForm, nama: e.target.value })} required className="input-field text-sm" placeholder="Surat Keputusan" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Deskripsi</label>
            <input value={kategoriForm.deskripsi} onChange={e => setKategoriForm({ ...kategoriForm, deskripsi: e.target.value })} className="input-field text-sm" placeholder="Deskripsi kategori" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Template</label>
            <textarea rows={4} value={kategoriForm.template} onChange={e => setKategoriForm({ ...kategoriForm, template: e.target.value })} className="input-field text-sm" placeholder="Template surat (opsional)" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setKategoriModal(false)} className="btn-secondary text-xs">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">{submitting ? 'Menyimpan...' : kategoriEdit ? 'Simpan Perubahan' : 'Tambah Kategori'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
