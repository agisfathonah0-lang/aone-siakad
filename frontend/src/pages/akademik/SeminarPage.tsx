import { useState, useEffect, useCallback } from 'react';
import { getPaginated, post, put, del } from '../../api/client';
import { toast } from '../../context/ToastContext';
import { confirm } from '../../context/ConfirmContext';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Plus, Pencil, Trash2, Users, Award, Calendar, Clock, Search } from 'lucide-react';
import type { Seminar, Mahasiswa, Dosen } from '../../types';

const jenisLabel: Record<string, string> = {
  seminar_proposal: 'Proposal',
  seminar_hasil: 'Hasil',
  seminar_umum: 'Umum',
};
const jenisBadge: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  seminar_proposal: 'info',
  seminar_hasil: 'success',
  seminar_umum: 'warning',
};
const statusLabel: Record<string, string> = {
  dijadwalkan: 'Dijadwalkan',
  dilaksanakan: 'Dilaksanakan',
  batal: 'Batal',
};
const statusBadge: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  dijadwalkan: 'warning',
  dilaksanakan: 'success',
  batal: 'danger',
};
const semesterList = ['Ganjil', 'Genap', 'Pendek'];
const tahunAkademikList = ['2025/2026', '2024/2025', '2023/2024', '2022/2023'];

export default function SeminarPage() {
  const [data, setData] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [jenisFilter, setJenisFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [searchNama, setSearchNama] = useState('');

  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<Seminar | null>(null);
  const [nilaiModal, setNilaiModal] = useState(false);
  const [nilaiItem, setNilaiItem] = useState<Seminar | null>(null);
  const [nilaiForm, setNilaiForm] = useState({ nilai: 0, catatan: '' });
  const [pesertaModal, setPesertaModal] = useState(false);
  const [selectedSeminar, setSelectedSeminar] = useState<Seminar | null>(null);
  const [pesertaList, setPesertaList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    mahasiswa_id: '', judul: '', jenis: 'seminar_proposal',
    dosen_pembimbing_1: '', dosen_pembimbing_2: '',
    dosen_penguji_1: '', dosen_penguji_2: '',
    tanggal: '', jam_mulai: '', jam_selesai: '',
    ruangan: '', semester: '', tahun_akademik: '', status: 'dijadwalkan', catatan: '',
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
      let url = `/akademik/seminar?page=${page}&limit=20`;
      if (jenisFilter) url += `&jenis=${jenisFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (semesterFilter) url += `&semester=${semesterFilter}`;
      const res = await getPaginated<Seminar>(url);
      const rows = (res.rows || []).filter((r: Seminar) =>
        !searchNama || r.mahasiswa_nama?.toLowerCase().includes(searchNama.toLowerCase())
      );
      setData(rows);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, jenisFilter, statusFilter, semesterFilter, searchNama]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchRefs(); }, [fetchRefs]);

  function openCreate() {
    setEditItem(null);
    setForm({
      mahasiswa_id: '', judul: '', jenis: 'seminar_proposal',
      dosen_pembimbing_1: '', dosen_pembimbing_2: '',
      dosen_penguji_1: '', dosen_penguji_2: '',
      tanggal: '', jam_mulai: '', jam_selesai: '',
      ruangan: '', semester: '', tahun_akademik: '', status: 'dijadwalkan', catatan: '',
    });
    setModal(true);
  }

  function openEdit(row: Seminar) {
    setEditItem(row);
    setForm({
      mahasiswa_id: row.mahasiswa_id,
      judul: row.judul,
      jenis: row.jenis,
      dosen_pembimbing_1: row.dosen_pembimbing_1 || '',
      dosen_pembimbing_2: row.dosen_pembimbing_2 || '',
      dosen_penguji_1: row.dosen_penguji_1 || '',
      dosen_penguji_2: row.dosen_penguji_2 || '',
      tanggal: row.tanggal?.slice(0, 10) || '',
      jam_mulai: row.jam_mulai?.slice(0, 5) || '',
      jam_selesai: row.jam_selesai?.slice(0, 5) || '',
      ruangan: row.ruangan || '',
      semester: row.semester || '',
      tahun_akademik: row.tahun_akademik || '',
      status: row.status,
      catatan: row.catatan || '',
    });
    setModal(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editItem) { await put(`/akademik/seminar/${editItem.id}`, form); }
      else { await post('/akademik/seminar', form); }
      setModal(false);
      fetchData();
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
    finally { setSubmitting(false); }
  }

  async function deleteRow(id: string) {
    if (!(await confirm('Hapus data seminar ini?'))) return;
    try { await del(`/akademik/seminar/${id}`); fetchData(); }
    catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  }

  function openNilai(row: Seminar) {
    setNilaiItem(row);
    setNilaiForm({ nilai: row.nilai || 0, catatan: row.catatan || '' });
    setNilaiModal(true);
  }

  async function saveNilai(e: React.FormEvent) {
    e.preventDefault();
    if (!nilaiItem) return;
    setSubmitting(true);
    try {
      await put(`/akademik/seminar/${nilaiItem.id}/nilai`, nilaiForm);
      setNilaiModal(false);
      fetchData();
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
    finally { setSubmitting(false); }
  }

  async function openPeserta(row: Seminar) {
    setSelectedSeminar(row);
    try {
      const res = await fetch(`/api/v1/akademik/seminar/${row.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('aone_access_token')}` },
      });
      const json = await res.json();
      setPesertaList(json.data?.peserta || []);
    } catch {}
    setPesertaModal(true);
  }

  async function removePeserta(pesertaId: string) {
    if (!selectedSeminar) return;
    if (!(await confirm('Hapus peserta ini?'))) return;
    try {
      await del(`/akademik/seminar/${selectedSeminar.id}/peserta/${pesertaId}`);
      setPesertaList(p => p.filter(x => x.id !== pesertaId));
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  }

  const columns = [
    { key: 'nim', label: 'NIM', render: (r: Seminar) => r.nim || '-' },
    { key: 'mahasiswa_nama', label: 'Mahasiswa' },
    { key: 'judul', label: 'Judul', render: (r: Seminar) => (
      <span className="max-w-[200px] truncate block" title={r.judul}>{r.judul}</span>
    )},
    { key: 'jenis', label: 'Jenis', render: (r: Seminar) => (
      <Badge variant={jenisBadge[r.jenis] || 'default'}>{jenisLabel[r.jenis] || r.jenis}</Badge>
    )},
    { key: 'pembimbing_1_nama', label: 'Pembimbing', render: (r: Seminar) => {
      const parts = [r.pembimbing_1_nama, r.pembimbing_2_nama].filter(Boolean);
      return parts.length ? parts.join(', ') : '-';
    }},
    { key: 'penguji_1_nama', label: 'Penguji', render: (r: Seminar) => {
      const parts = [r.penguji_1_nama, r.penguji_2_nama].filter(Boolean);
      return parts.length ? parts.join(', ') : '-';
    }},
    { key: 'tanggal', label: 'Tanggal', render: (r: Seminar) => r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID') : '-' },
    { key: 'ruangan', label: 'Ruangan', render: (r: Seminar) => r.ruangan || '-' },
    { key: 'status', label: 'Status', render: (r: Seminar) => (
      <Badge variant={statusBadge[r.status] || 'default'}>{statusLabel[r.status] || r.status}</Badge>
    )},
    { key: 'nilai', label: 'Nilai', render: (r: Seminar) => r.nilai != null ? r.nilai : '-' },
    { key: 'id', label: 'Aksi', render: (r: Seminar) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => openNilai(r)} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"><Award size={14} /></button>
        <button onClick={() => openPeserta(r)} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"><Users size={14} /></button>
        <button onClick={() => deleteRow(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Seminar</h1></div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 items-center flex-wrap">
          <select value={jenisFilter} onChange={e => { setJenisFilter(e.target.value); setPage(1); }} className="input-field text-xs max-w-[140px]">
            <option value="">Semua Jenis</option>
            <option value="seminar_proposal">Proposal</option>
            <option value="seminar_hasil">Hasil</option>
            <option value="seminar_umum">Umum</option>
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field text-xs max-w-[150px]">
            <option value="">Semua Status</option>
            <option value="dijadwalkan">Dijadwalkan</option>
            <option value="dilaksanakan">Dilaksanakan</option>
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
        <button onClick={openCreate} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={14} /> Tambah Seminar</button>
      </div>

      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} emptyMessage="Belum ada data seminar" />

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Edit Seminar' : 'Tambah Seminar'} size="xl">
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
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Jenis</label>
              <select value={form.jenis} onChange={e => setForm({ ...form, jenis: e.target.value })} required className="input-field text-sm">
                <option value="seminar_proposal">Seminar Proposal</option>
                <option value="seminar_hasil">Seminar Hasil</option>
                <option value="seminar_umum">Seminar Umum</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Judul</label>
            <input value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} required className="input-field text-sm" placeholder="Judul seminar" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Pembimbing 1</label>
              <select value={form.dosen_pembimbing_1} onChange={e => setForm({ ...form, dosen_pembimbing_1: e.target.value })} className="input-field text-sm">
                <option value="">Pilih Dosen</option>
                {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Pembimbing 2</label>
              <select value={form.dosen_pembimbing_2} onChange={e => setForm({ ...form, dosen_pembimbing_2: e.target.value })} className="input-field text-sm">
                <option value="">Pilih Dosen</option>
                {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Penguji 1</label>
              <select value={form.dosen_penguji_1} onChange={e => setForm({ ...form, dosen_penguji_1: e.target.value })} className="input-field text-sm">
                <option value="">Pilih Dosen</option>
                {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Penguji 2</label>
              <select value={form.dosen_penguji_2} onChange={e => setForm({ ...form, dosen_penguji_2: e.target.value })} className="input-field text-sm">
                <option value="">Pilih Dosen</option>
                {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1 flex items-center gap-1"><Calendar size={12} /> Tanggal</label>
              <input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1 flex items-center gap-1"><Clock size={12} /> Ruangan</label>
              <input value={form.ruangan} onChange={e => setForm({ ...form, ruangan: e.target.value })} className="input-field text-sm" placeholder="Ruangan" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1 flex items-center gap-1"><Clock size={12} /> Jam Mulai</label>
              <input type="time" value={form.jam_mulai} onChange={e => setForm({ ...form, jam_mulai: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1 flex items-center gap-1"><Clock size={12} /> Jam Selesai</label>
              <input type="time" value={form.jam_selesai} onChange={e => setForm({ ...form, jam_selesai: e.target.value })} className="input-field text-sm" />
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
                <option value="dijadwalkan">Dijadwalkan</option>
                <option value="dilaksanakan">Dilaksanakan</option>
                <option value="batal">Batal</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Catatan</label>
            <textarea rows={2} value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} className="input-field text-sm" placeholder="Catatan" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary text-xs">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">{submitting ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambah Seminar'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={nilaiModal} onClose={() => setNilaiModal(false)} title="Input Nilai Seminar" size="sm">
        <form onSubmit={saveNilai} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Nilai (0-100)</label>
            <input type="number" min="0" max="100" step="0.01" value={nilaiForm.nilai} onChange={e => setNilaiForm({ ...nilaiForm, nilai: parseFloat(e.target.value) || 0 })} required className="input-field text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Catatan</label>
            <textarea rows={2} value={nilaiForm.catatan} onChange={e => setNilaiForm({ ...nilaiForm, catatan: e.target.value })} className="input-field text-sm" placeholder="Catatan nilai" />
          </div>
          {nilaiItem && (
            <p className="text-xs text-slate-400">{nilaiItem.mahasiswa_nama} - {jenisLabel[nilaiItem.jenis] || nilaiItem.jenis}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setNilaiModal(false)} className="btn-secondary text-xs">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">{submitting ? 'Menyimpan...' : 'Simpan Nilai'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={pesertaModal} onClose={() => setPesertaModal(false)} title="Daftar Peserta Seminar" size="lg">
        <div className="space-y-3">
          {selectedSeminar && (
            <p className="text-xs text-slate-500">{selectedSeminar.mahasiswa_nama} - {selectedSeminar.judul}</p>
          )}
          {pesertaList.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Belum ada peserta</p>
          ) : (
            <div className="overflow-hidden rounded-xl bg-white dark:bg-zinc-900/50 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800/30">
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Nama</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Tipe</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Kehadiran</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-zinc-800/20">
                  {pesertaList.map(p => (
                    <tr key={p.id} className="transition-colors">
                      <td className="px-4 py-3 text-sm">{p.mahasiswa_nama || p.dosen_nama || '-'}</td>
                      <td className="px-4 py-3 text-sm">{p.mahasiswa_id ? 'Mahasiswa' : 'Dosen'}</td>
                      <td className="px-4 py-3 text-sm">{p.kehadiran ? 'Hadir' : 'Tidak Hadir'}</td>
                      <td className="px-4 py-3 text-sm">
                        <button onClick={() => removePeserta(p.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button type="button" onClick={() => setPesertaModal(false)} className="btn-secondary text-xs">Tutup</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
