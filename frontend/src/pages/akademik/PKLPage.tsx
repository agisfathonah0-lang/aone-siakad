import { useState, useEffect, useCallback } from 'react';
import { getPaginated, get, post, put, del as apiDel } from '../../api/client';
import { toast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Briefcase, Plus, Pencil, Trash2, Award, ClipboardList, CheckCircle, Search } from 'lucide-react';
import type { PKL, PKLLogbook, Mahasiswa, Dosen } from '../../types';
import FileUpload from '../../components/ui/FileUpload';

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

export default function PKLPage() {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === 'super_admin' || role === 'admin' || role === 'akademik' || role === 'kaprodi';
  const isMahasiswa = role === 'mahasiswa';

  const [activeTab, setActiveTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [data, setData] = useState<PKL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [searchNama, setSearchNama] = useState('');
  const [currentMhsId, setCurrentMhsId] = useState('');

  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<PKL | null>(null);
  const [nilaiModal, setNilaiModal] = useState(false);
  const [nilaiItem, setNilaiItem] = useState<PKL | null>(null);
  const [nilaiForm, setNilaiForm] = useState({ nilai: 0 });

  const [form, setForm] = useState({
    mahasiswa_id: '', perusahaan: '', alamat_perusahaan: '', bidang: '',
    dosen_pembimbing: '', tanggal_mulai: '', tanggal_selesai: '',
    semester: '', tahun_akademik: '', status: 'direncanakan',
  });

  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);

  const fetchRefs = useCallback(async () => {
    try {
      if (isMahasiswa) {
        const res = await get<any>('/akademik/krs/me');
        setCurrentMhsId(res.mahasiswa_id || '');
      }
      const dosenRes = await getPaginated<any>('/akademik/dosen?page=1&limit=500');
      setDosenList(dosenRes.rows || []);
      if (!isMahasiswa) {
        const mhsRes = await getPaginated<any>('/akademik/mahasiswa?page=1&limit=500');
        setMahasiswaList(mhsRes.rows || []);
      }
    } catch {}
  }, [isMahasiswa]);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let url: string;
      if (isMahasiswa) {
        url = `/akademik/pkl/me`;
        const res = await get<PKL[]>(url);
        setData(Array.isArray(res) ? res : []);
        setTotalPages(1);
      } else {
        url = `/akademik/pkl?page=${page}&limit=20`;
        if (statusFilter) url += `&status=${statusFilter}`;
        if (semesterFilter) url += `&semester=${semesterFilter}`;
        const res = await getPaginated<PKL>(url);
        const rows = (res.rows || []).filter((r: PKL) =>
          !searchNama || r.mahasiswa_nama?.toLowerCase().includes(searchNama.toLowerCase())
        );
        setData(rows);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, statusFilter, semesterFilter, searchNama, isMahasiswa]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchRefs(); }, [fetchRefs]);

  function openCreate() {
    setEditItem(null);
    setForm({ mahasiswa_id: isMahasiswa ? currentMhsId : '', perusahaan: '', alamat_perusahaan: '', bidang: '', dosen_pembimbing: '', tanggal_mulai: '', tanggal_selesai: '', semester: '', tahun_akademik: '', status: 'direncanakan' });
    setModal(true);
  }

  function openEdit(row: PKL) {
    setEditItem(row);
    setForm({
      mahasiswa_id: row.mahasiswa_id,
      perusahaan: row.perusahaan,
      alamat_perusahaan: row.alamat_perusahaan || '',
      bidang: row.bidang || '',
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
      if (editItem) { await put(`/akademik/pkl/${editItem.id}`, form); }
      else { await post('/akademik/pkl', form); }
      setModal(false);
      fetchData();
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
    finally { setSubmitting(false); }
  }

  async function deleteRow(id: string) {
    if (!confirm('Hapus data PKL ini?')) return;
    try { await apiDel(`/akademik/pkl/${id}`); fetchData(); }
    catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  }

  function openNilai(row: PKL) {
    setNilaiItem(row);
    setNilaiForm({ nilai: row.nilai || 0 });
    setNilaiModal(true);
  }

  async function saveNilai(e: React.FormEvent) {
    e.preventDefault();
    if (!nilaiItem) return;
    setSubmitting(true);
    try {
      await put(`/akademik/pkl/${nilaiItem.id}/nilai`, nilaiForm);
      setNilaiModal(false);
      fetchData();
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
    finally { setSubmitting(false); }
  }

  const columns = [
    { key: 'nim', label: 'NIM', render: (r: PKL) => r.nim || '-' },
    { key: 'mahasiswa_nama', label: 'Mahasiswa' },
    { key: 'perusahaan', label: 'Perusahaan' },
    { key: 'bidang', label: 'Bidang', render: (r: PKL) => r.bidang || '-' },
    { key: 'pembimbing_nama', label: 'Pembimbing', render: (r: PKL) => r.pembimbing_nama || '-' },
    { key: 'tanggal_mulai', label: 'Tgl Mulai', render: (r: PKL) => r.tanggal_mulai ? new Date(r.tanggal_mulai).toLocaleDateString('id-ID') : '-' },
    { key: 'tanggal_selesai', label: 'Tgl Selesai', render: (r: PKL) => r.tanggal_selesai ? new Date(r.tanggal_selesai).toLocaleDateString('id-ID') : '-' },
    { key: 'status', label: 'Status', render: (r: PKL) => <Badge variant={statusBadge[r.status] || 'default'}>{statusLabel[r.status] || r.status}</Badge> },
    { key: 'nilai', label: 'Nilai', render: (r: PKL) => r.nilai != null ? r.nilai : '-' },
    { key: 'id', label: 'Aksi', render: (r: PKL) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Pencil size={14} /></button>
        {!isMahasiswa && <button onClick={() => openNilai(r)} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"><Award size={14} /></button>}
        {(isAdmin) && <button onClick={() => deleteRow(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>}
      </div>
    )},
  ];

  const [selectedPkl, setSelectedPkl] = useState('');
  const [logbookData, setLogbookData] = useState<PKLLogbook[]>([]);
  const [logbookLoading, setLogbookLoading] = useState(false);
  const [logbookModal, setLogbookModal] = useState(false);
  const [logbookForm, setLogbookForm] = useState({ tanggal: '', kegiatan: '', dokumentasi_url: '' });
  const [logbookEdit, setLogbookEdit] = useState<PKLLogbook | null>(null);

  useEffect(() => {
    if (!selectedPkl) { setLogbookData([]); return; }
    setLogbookLoading(true);
    get<PKLLogbook[]>(`/akademik/pkl/${selectedPkl}/logbook`)
      .then(res => setLogbookData(Array.isArray(res) ? res : []))
      .catch(() => setLogbookData([]))
      .finally(() => setLogbookLoading(false));
  }, [selectedPkl]);

  function openLogbookCreate() {
    setLogbookEdit(null);
    setLogbookForm({ tanggal: new Date().toISOString().slice(0, 10), kegiatan: '', dokumentasi_url: '' });
    setLogbookModal(true);
  }

  function openLogbookEdit(row: PKLLogbook) {
    setLogbookEdit(row);
    setLogbookForm({ tanggal: row.tanggal?.slice(0, 10) || '', kegiatan: row.kegiatan, dokumentasi_url: row.dokumentasi_url || '' });
    setLogbookModal(true);
  }

  async function saveLogbook(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (logbookEdit) { await put(`/akademik/pkl/logbook/${logbookEdit.id}`, logbookForm); }
      else { await post(`/akademik/pkl/${selectedPkl}/logbook`, logbookForm); }
      setLogbookModal(false);
      const res = await get<PKLLogbook[]>(`/akademik/pkl/${selectedPkl}/logbook`);
      setLogbookData(Array.isArray(res) ? res : []);
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
    finally { setSubmitting(false); }
  }

  async function deleteLogbook(id: string) {
    if (!confirm('Hapus entry logbook ini?')) return;
    try {
      await apiDel(`/akademik/pkl/logbook/${id}`);
      const res = await get<PKLLogbook[]>(`/akademik/pkl/${selectedPkl}/logbook`);
      setLogbookData(Array.isArray(res) ? res : []);
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  }

  async function approveLogbook(id: string) {
    try {
      await put(`/akademik/pkl/logbook/${id}/approve`, {});
      const res = await get<PKLLogbook[]>(`/akademik/pkl/${selectedPkl}/logbook`);
      setLogbookData(Array.isArray(res) ? res : []);
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  }

  const logbookCols = [
    { key: 'tanggal', label: 'Tanggal', render: (r: PKLLogbook) => r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID') : '-' },
    { key: 'kegiatan', label: 'Kegiatan' },
    { key: 'dokumentasi_url', label: 'Dokumentasi', render: (r: PKLLogbook) => r.dokumentasi_url ? <a href={r.dokumentasi_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs">Lihat</a> : '-' },
    { key: 'catatan_pembimbing', label: 'Catatan Pembimbing', render: (r: PKLLogbook) => r.catatan_pembimbing || '-' },
    { key: 'disetujui', label: 'Status', render: (r: PKLLogbook) => r.disetujui ? <Badge variant="success">Disetujui</Badge> : <Badge variant="warning">Pending</Badge> },
    { key: 'id', label: 'Aksi', render: (r: PKLLogbook) => (
      <div className="flex gap-1">
        <button onClick={() => openLogbookEdit(r)} className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => deleteLogbook(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
        {!r.disetujui && (role === 'dosen' || isAdmin) && (
          <button onClick={() => approveLogbook(r.id)} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"><CheckCircle size={14} /></button>
        )}
      </div>
    )},
  ];

  const tabs = [
    { key: 0, label: 'Data PKL', icon: Briefcase },
    { key: 1, label: 'Logbook', icon: ClipboardList },
  ];

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold font-display tracking-tight dark:text-white">PKL (Praktek Kerja Lapangan)</h1></div>

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
              {!isMahasiswa && (
                <>
                  <select value={semesterFilter} onChange={e => { setSemesterFilter(e.target.value); setPage(1); }} className="input-field text-xs max-w-[130px]">
                    <option value="">Semester</option>
                    {semesterList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="relative max-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={searchNama} onChange={e => { setSearchNama(e.target.value); setPage(1); }} placeholder="Cari mahasiswa..." className="input-field pl-8 text-xs" />
                  </div>
                </>
              )}
            </div>
            <button onClick={openCreate} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={14} /> Tambah PKL</button>
          </div>
          <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} emptyMessage="Belum ada data PKL" />
        </>
      )}

      {activeTab === 1 && (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <select value={selectedPkl} onChange={e => setSelectedPkl(e.target.value)} className="input-field text-xs max-w-[400px]">
              <option value="">Pilih PKL</option>
              {data.map(p => <option key={p.id} value={p.id}>{p.mahasiswa_nama || '-'} - {p.perusahaan}</option>)}
            </select>
            {selectedPkl && <button onClick={openLogbookCreate} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={14} /> Tambah Log</button>}
          </div>
          {selectedPkl ? (
            <DataTable columns={logbookCols} data={logbookData} loading={logbookLoading} emptyMessage="Belum ada entry logbook" />
          ) : (
            <div className="text-center py-12 text-slate-400 dark:text-zinc-500 text-xs">Pilih data PKL terlebih dahulu</div>
          )}
        </>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Edit PKL' : 'Tambah PKL'} size="lg">
        <form onSubmit={save} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {!isMahasiswa && (
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Mahasiswa</label>
                <select value={form.mahasiswa_id} onChange={e => setForm({ ...form, mahasiswa_id: e.target.value })} required className="input-field text-sm">
                  <option value="">Pilih Mahasiswa</option>
                  {mahasiswaList.map(m => <option key={m.id} value={m.id}>{m.nim} - {m.nama}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Dosen Pembimbing</label>
              <select value={form.dosen_pembimbing} onChange={e => setForm({ ...form, dosen_pembimbing: e.target.value })} className="input-field text-sm">
                <option value="">Pilih Dosen</option>
                {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Perusahaan</label>
            <input value={form.perusahaan} onChange={e => setForm({ ...form, perusahaan: e.target.value })} required className="input-field text-sm" placeholder="Nama perusahaan" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Alamat Perusahaan</label>
              <input value={form.alamat_perusahaan} onChange={e => setForm({ ...form, alamat_perusahaan: e.target.value })} className="input-field text-sm" placeholder="Alamat" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Bidang</label>
              <input value={form.bidang} onChange={e => setForm({ ...form, bidang: e.target.value })} className="input-field text-sm" placeholder="Bidang pekerjaan" />
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
            <button type="submit" disabled={submitting} className="btn-primary text-xs">{submitting ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambah PKL'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={nilaiModal} onClose={() => setNilaiModal(false)} title="Input Nilai PKL" size="sm">
        <form onSubmit={saveNilai} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Nilai (0-100)</label>
            <input type="number" min="0" max="100" step="0.01" value={nilaiForm.nilai} onChange={e => setNilaiForm({ nilai: parseFloat(e.target.value) || 0 })} required className="input-field text-sm" />
          </div>
          {nilaiItem && (
            <p className="text-xs text-slate-400">{nilaiItem.mahasiswa_nama} - {nilaiItem.perusahaan}</p>
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
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Dokumentasi</label>
            <FileUpload value={logbookForm.dokumentasi_url} onChange={(v) => setLogbookForm({ ...logbookForm, dokumentasi_url: v })} label="Dokumentasi" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setLogbookModal(false)} className="btn-secondary text-xs">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">{submitting ? 'Menyimpan...' : logbookEdit ? 'Simpan Perubahan' : 'Tambah Log'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
