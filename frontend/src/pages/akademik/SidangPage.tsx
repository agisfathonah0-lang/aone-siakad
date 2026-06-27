import { useState, useEffect, useCallback } from 'react';
import { get, getPaginated, post, put, del as apiDel } from '../../api/client';
import { toast } from '../../context/ToastContext';
import { confirm } from '../../context/ConfirmContext';
import type { Sidang } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { GraduationCap, Plus, Pencil, Trash2, Award, Search, Calendar, CheckCircle, XCircle, Eye } from 'lucide-react';

interface ProdiOption { id: string; kode: string; nama: string; jenjang: string; }
interface DosenOption { id: string; nama: string; nidn?: string; }
interface MahasiswaOption { id: string; nim: string; nama: string; }

const statusVariant: Record<string, 'info' | 'success' | 'danger' | 'warning'> = {
  dijadwalkan: 'info',
  dilaksanakan: 'warning',
  lulus: 'success',
  tidak_lulus: 'danger',
  batal: 'danger',
};

const statusLabel: Record<string, string> = {
  dijadwalkan: 'Dijadwalkan',
  dilaksanakan: 'Dilaksanakan',
  lulus: 'Lulus',
  tidak_lulus: 'Tidak Lulus',
  batal: 'Batal',
};

export default function SidangPage() {
  const [data, setData] = useState<Sidang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Sidang | null>(null);
  const [detail, setDetail] = useState<Sidang | null>(null);
  const [dosenList, setDosenList] = useState<DosenOption[]>([]);
  const [mahasiswaList, setMahasiswaList] = useState<MahasiswaOption[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  const [form, setForm] = useState({
    mahasiswa_id: '', judul_skripsi: '', dosen_pembimbing_1: '', dosen_pembimbing_2: '',
    dosen_penguji_1: '', dosen_penguji_2: '', dosen_penguji_3: '',
    tanggal: '', jam_mulai: '', jam_selesai: '', ruangan: '',
    semester: 'Ganjil', tahun_akademik: '2025/2026', status: 'dijadwalkan',
  });

  const semesterList = ['Ganjil', 'Genap', 'Pendek'];
  const taList = ['2025/2026', '2024/2025', '2023/2024'];

  useEffect(() => {
    get<{ rows: DosenOption[] }>('/akademik/dosen?limit=200').then(r => setDosenList(r.rows || [])).catch(() => {});
    get<{ rows: MahasiswaOption[] }>('/akademik/mahasiswa?limit=500').then(r => setMahasiswaList(r.rows || [])).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filterStatus) params.set('status', filterStatus);
      if (filterSemester) params.set('semester', filterSemester);
      if (search) params.set('q', search);
      const res = await getPaginated<Sidang>(`/akademik/sidang?${params}`);
      setData(res.rows); setTotalPages(res.pagination.totalPages);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, filterStatus, filterSemester, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEdit(null);
    setForm({ mahasiswa_id: '', judul_skripsi: '', dosen_pembimbing_1: '', dosen_pembimbing_2: '', dosen_penguji_1: '', dosen_penguji_2: '', dosen_penguji_3: '', tanggal: '', jam_mulai: '', jam_selesai: '', ruangan: '', semester: 'Ganjil', tahun_akademik: '2025/2026', status: 'dijadwalkan' });
    setModal(true);
  };

  const openEdit = (r: Sidang) => {
    setEdit(r);
    setForm({
      mahasiswa_id: r.mahasiswa_id, judul_skripsi: r.judul_skripsi,
      dosen_pembimbing_1: r.dosen_pembimbing_1 || '', dosen_pembimbing_2: r.dosen_pembimbing_2 || '',
      dosen_penguji_1: r.dosen_penguji_1 || '', dosen_penguji_2: r.dosen_penguji_2 || '', dosen_penguji_3: r.dosen_penguji_3 || '',
      tanggal: r.tanggal || '', jam_mulai: r.jam_mulai || '', jam_selesai: r.jam_selesai || '',
      ruangan: r.ruangan || '', semester: r.semester || 'Ganjil', tahun_akademik: r.tahun_akademik || '2025/2026', status: r.status || 'dijadwalkan',
    });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (edit) {
        await put(`/akademik/sidang/${edit.id}`, payload);
      } else {
        await post('/akademik/sidang', payload);
      }
      setModal(false); fetchData();
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const remove = async (id: string) => {
    if (!(await confirm('Hapus data sidang ini?'))) return;
    try { await apiDel(`/akademik/sidang/${id}`); fetchData(); }
    catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const [nilaiModal, setNilaiModal] = useState<Sidang | null>(null);
  const [nilaiForm, setNilaiForm] = useState({ nilai_angka: 0 });

  const openNilai = (r: Sidang) => {
    setNilaiModal(r);
    setNilaiForm({ nilai_angka: r.nilai_angka || 0 });
  };

  const saveNilai = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nilaiModal) return;
    try {
      await put(`/akademik/sidang/${nilaiModal.id}/nilai`, nilaiForm);
      setNilaiModal(null); fetchData();
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await put(`/akademik/sidang/${id}/status`, { status });
      fetchData();
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const hitungNilaiHuruf = (nilai: number): string => {
    if (nilai >= 85) return 'A'; if (nilai >= 80) return 'A-'; if (nilai >= 75) return 'B+';
    if (nilai >= 70) return 'B'; if (nilai >= 65) return 'B-'; if (nilai >= 60) return 'C+';
    if (nilai >= 55) return 'C'; if (nilai >= 45) return 'D'; return 'E';
  };

  const columns = [
    { key: 'nim', label: 'NIM' },
    { key: 'mahasiswa_nama', label: 'Mahasiswa' },
    { key: 'judul_skripsi', label: 'Judul', render: (r: Sidang) => <span className="max-w-[200px] truncate block">{r.judul_skripsi}</span> },
    { key: 'pembimbing_1_nama', label: 'Pembimbing 1' },
    { key: 'tanggal', label: 'Tanggal', render: (r: Sidang) => r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID') : '-' },
    { key: 'status', label: 'Status', render: (r: Sidang) => <Badge variant={statusVariant[r.status as keyof typeof statusVariant] || 'default'}>{statusLabel[r.status] || r.status}</Badge> },
    { key: 'nilai_angka', label: 'Nilai', render: (r: Sidang) => r.nilai_angka != null ? `${r.nilai_angka} (${r.nilai_huruf || hitungNilaiHuruf(r.nilai_angka)})` : '-' },
    { key: 'id', label: '', render: (r: Sidang) => (
      <div className="flex gap-1 justify-end">
        <button onClick={() => setDetail(r)} className="p-1.5 text-slate-400 hover:text-primary-500 transition-colors"><Eye size={14} /></button>
        <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => openNilai(r)} className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors" title="Input Nilai"><Award size={14} /></button>
        <button onClick={() => remove(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Sidang Skripsi</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Jadwal dan penilaian sidang skripsi</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={14} /> Tambah Sidang</button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari mahasiswa..." className="input-field pl-3" />
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="input-field max-w-[160px]">
          <option value="">Semua Status</option>
          {Object.keys(statusLabel).map(k => <option key={k} value={k}>{statusLabel[k]}</option>)}
        </select>
        <select value={filterSemester} onChange={e => { setFilterSemester(e.target.value); setPage(1); }} className="input-field max-w-[140px]">
          <option value="">Semester</option>
          {semesterList.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />

      {/* Create/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Sidang' : 'Tambah Sidang'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Mahasiswa</label>
            <select required value={form.mahasiswa_id} onChange={e => setForm({...form, mahasiswa_id: e.target.value})} className="input-field">
              <option value="">Pilih Mahasiswa</option>
              {mahasiswaList.map(m => <option key={m.id} value={m.id}>{m.nim} - {m.nama}</option>)}
            </select>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Judul Skripsi</label>
            <textarea required value={form.judul_skripsi} onChange={e => setForm({...form, judul_skripsi: e.target.value})} className="input-field" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Pembimbing 1</label>
              <select value={form.dosen_pembimbing_1} onChange={e => setForm({...form, dosen_pembimbing_1: e.target.value})} className="input-field">
                <option value="">Pilih</option>
                {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Pembimbing 2</label>
              <select value={form.dosen_pembimbing_2} onChange={e => setForm({...form, dosen_pembimbing_2: e.target.value})} className="input-field">
                <option value="">Pilih</option>
                {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Penguji 1</label>
              <select value={form.dosen_penguji_1} onChange={e => setForm({...form, dosen_penguji_1: e.target.value})} className="input-field">
                <option value="">Pilih</option>
                {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Penguji 2</label>
              <select value={form.dosen_penguji_2} onChange={e => setForm({...form, dosen_penguji_2: e.target.value})} className="input-field">
                <option value="">Pilih</option>
                {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Penguji 3</label>
              <select value={form.dosen_penguji_3} onChange={e => setForm({...form, dosen_penguji_3: e.target.value})} className="input-field">
                <option value="">Pilih</option>
                {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tanggal</label>
              <input type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} className="input-field" />
            </div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Ruangan</label>
              <input value={form.ruangan} onChange={e => setForm({...form, ruangan: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jam Mulai</label>
              <input type="time" value={form.jam_mulai} onChange={e => setForm({...form, jam_mulai: e.target.value})} className="input-field" />
            </div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jam Selesai</label>
              <input type="time" value={form.jam_selesai} onChange={e => setForm({...form, jam_selesai: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Semester</label>
              <select value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} className="input-field">
                {semesterList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun Akademik</label>
              <select value={form.tahun_akademik} onChange={e => setForm({...form, tahun_akademik: e.target.value})} className="input-field">
                {taList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                {Object.keys(statusLabel).map(k => <option key={k} value={k}>{statusLabel[k]}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full justify-center">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>

      {/* Nilai Modal */}
      <Modal open={!!nilaiModal} onClose={() => setNilaiModal(null)} title="Input Nilai Sidang">
        <form onSubmit={saveNilai} className="space-y-4">
          {nilaiModal && (
            <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-sm font-semibold dark:text-white">{nilaiModal.mahasiswa_nama}</p>
              <p className="text-xs text-slate-500">{nilaiModal.judul_skripsi}</p>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nilai Angka (0-100)</label>
            <input type="number" step="0.01" min="0" max="100" value={nilaiForm.nilai_angka} onChange={e => setNilaiForm({ nilai_angka: parseFloat(e.target.value) || 0 })} className="input-field" />
            <p className="text-xs text-slate-400 mt-1">Nilai Huruf: <span className="font-bold text-primary-500">{hitungNilaiHuruf(nilaiForm.nilai_angka)}</span></p>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 justify-center">Simpan Nilai</button>
            {nilaiModal?.status === 'dilaksanakan' && (
              <>
                <button type="button" onClick={() => { updateStatus(nilaiModal.id, 'lulus'); setNilaiModal(null); }} className="btn-secondary flex-1 justify-center text-emerald-600"><CheckCircle size={14} /> Lulus</button>
                <button type="button" onClick={() => { updateStatus(nilaiModal.id, 'tidak_lulus'); setNilaiModal(null); }} className="btn-secondary flex-1 justify-center text-red-600"><XCircle size={14} /> Tidak Lulus</button>
              </>
            )}
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail Sidang" size="lg">
        {detail && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-slate-500">Mahasiswa</p><p className="font-semibold dark:text-white">{detail.mahasiswa_nama} ({detail.nim})</p></div>
              <div><p className="text-xs text-slate-500">Status</p><Badge variant={statusVariant[detail.status as keyof typeof statusVariant] || 'default'}>{statusLabel[detail.status] || detail.status}</Badge></div>
              <div className="col-span-2"><p className="text-xs text-slate-500">Judul</p><p className="font-semibold dark:text-white">{detail.judul_skripsi}</p></div>
              <div><p className="text-xs text-slate-500">Pembimbing 1</p><p className="dark:text-white">{detail.pembimbing_1_nama || '-'}</p></div>
              <div><p className="text-xs text-slate-500">Pembimbing 2</p><p className="dark:text-white">{detail.pembimbing_2_nama || '-'}</p></div>
              <div><p className="text-xs text-slate-500">Penguji 1</p><p className="dark:text-white">{detail.penguji_1_nama || '-'}</p></div>
              <div><p className="text-xs text-slate-500">Penguji 2</p><p className="dark:text-white">{detail.penguji_2_nama || '-'}</p></div>
              <div><p className="text-xs text-slate-500">Penguji 3</p><p className="dark:text-white">{detail.penguji_3_nama || '-'}</p></div>
              <div><p className="text-xs text-slate-500">Tanggal</p><p className="dark:text-white">{detail.tanggal ? new Date(detail.tanggal).toLocaleDateString('id-ID') : '-'}</p></div>
              <div><p className="text-xs text-slate-500">Jam</p><p className="dark:text-white">{detail.jam_mulai ? `${detail.jam_mulai.slice(0,5)} - ${detail.jam_selesai?.slice(0,5)}` : '-'}</p></div>
              <div><p className="text-xs text-slate-500">Ruangan</p><p className="dark:text-white">{detail.ruangan || '-'}</p></div>
              <div><p className="text-xs text-slate-500">Nilai</p><p className="font-bold dark:text-white">{detail.nilai_angka != null ? `${detail.nilai_angka} (${detail.nilai_huruf || '-'})` : 'Belum diinput'}</p></div>
            </div>
            {detail.revisi && <div><p className="text-xs text-slate-500">Revisi</p><p className="dark:text-white">{detail.revisi}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
