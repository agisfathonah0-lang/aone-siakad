import { useState, useEffect, useCallback } from 'react';
import { getPaginated, post, put, del, get } from '../../api/client';
import { toast } from '../../context/ToastContext';
import type { Tagihan, Pembayaran, Mahasiswa } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Pencil, Trash2, Eye, Plus, Search, RefreshCw } from 'lucide-react';

const statusBadge: Record<string, 'warning' | 'success' | 'danger'> = { pending: 'warning', lunas: 'success', overdue: 'danger' };

export default function TagihanPage() {
  const [data, setData] = useState<Tagihan[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [detailModal, setDetailModal] = useState(false);
  const [detailTagihan, setDetailTagihan] = useState<Tagihan | null>(null);
  const [riwayat, setRiwayat] = useState<Pembayaran[]>([]);
  const [form, setForm] = useState({ mahasiswa_id: '', tahun_akademik: '2025/2026', semester: 'Ganjil', nominal: 1000000, jenis: 'ukt_semester' });
  const [editForm, setEditForm] = useState({ mahasiswa_id: '', tahun_akademik: '', semester: '', nominal: 0, jenis: '' });
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let url = `/keuangan/tagihan?page=${page}`;
      if (filterStatus) url += `&status=${filterStatus}`;
      if (filterSearch) url += `&search=${filterSearch}`;
      const res = await getPaginated<Tagihan>(url); setData(res?.rows || []); setTotalPages(res?.pagination?.totalPages || 1);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }, [page, filterStatus, filterSearch]);
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => { getPaginated<Mahasiswa>('/akademik/mahasiswa?limit=500').then(r => setMahasiswaList(r?.rows || [])).catch(() => {}); }, []);

  useEffect(() => { setPage(1); }, [filterStatus, filterSearch]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await post('/keuangan/tagihan', form); setModal(false); fetchData(); }
    catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await put(`/keuangan/tagihan/${editId}`, editForm); setEditModal(false); fetchData(); }
    catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus tagihan ini?')) return;
    try { await del(`/keuangan/tagihan/${id}`); fetchData(); }
    catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const openEdit = (r: Tagihan) => {
    setEditId(r.id);
    setEditForm({ mahasiswa_id: r.mahasiswa_id, tahun_akademik: r.tahun_akademik, semester: r.semester, nominal: r.nominal, jenis: r.jenis });
    setEditModal(true);
  };

  const openDetail = async (r: Tagihan) => {
    setDetailTagihan(r);
    try { const res = await getPaginated<Pembayaran>(`/keuangan/pembayaran?tagihan_id=${r.id}&limit=100`); setRiwayat(res?.rows || []); }
    catch { setRiwayat([]); }
    setDetailModal(true);
  };

  const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const columns = [
    { key: 'nim', label: 'NIM' }, { key: 'mahasiswa_nama', label: 'Mahasiswa' },
    { key: 'tahun_akademik', label: 'T.Akademik' }, { key: 'semester', label: 'Sem' },
    { key: 'nominal', label: 'Nominal', render: (r: Tagihan) => rupiah(r.nominal) },
    { key: 'jenis', label: 'Jenis' },
    { key: 'status', label: 'Status', render: (r: Tagihan) => <Badge variant={statusBadge[r.status as keyof typeof statusBadge] || 'default'}>{r.status}</Badge> },
    { key: 'aksi', label: 'Aksi', render: (r: Tagihan) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(r)} className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg"><Pencil size={14} /></button>
        <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={14} /></button>
      </div>
    )},
    { key: 'detail', label: '', render: (r: Tagihan) => (
      <button onClick={() => openDetail(r)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg" title="Riwayat Pembayaran"><Eye size={14} /></button>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Tagihan UKT</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah</button>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} placeholder="Cari NIM/Nama..." className="input-field pl-9 pr-3 py-1.5 text-xs" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field py-1.5 text-xs max-w-[130px]">
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="lunas">Lunas</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />
      <Modal open={modal} onClose={() => setModal(false)} title="Tambah Tagihan">
        <form onSubmit={save} className="space-y-3">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Mahasiswa</label>
            <select required value={form.mahasiswa_id} onChange={(e) => setForm({ ...form, mahasiswa_id: e.target.value })} className="input-field">
              <option value="">Pilih Mahasiswa</option>
              {mahasiswaList.map((m) => <option key={m.id} value={m.id}>{m.nim} - {m.nama}</option>)}
            </select>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nominal</label><input type="number" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: parseInt(e.target.value) || 0 })} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun Akademik</label><input value={form.tahun_akademik} onChange={(e) => setForm({ ...form, tahun_akademik: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Semester</label><select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className="input-field"><option>Ganjil</option><option>Genap</option></select></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jenis</label><select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })} className="input-field"><option value="ukt_semester">UKT Semester</option><option value="ukt_cicilan">UKT Cicilan</option><option value="ppdb">PPDB</option></select></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Tambah</button>
        </form>
      </Modal>
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Tagihan">
        <form onSubmit={handleEdit} className="space-y-3">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nominal</label><input type="number" value={editForm.nominal} onChange={(e) => setEditForm({ ...editForm, nominal: parseInt(e.target.value) || 0 })} className="input-field" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jenis</label><select value={editForm.jenis} onChange={(e) => setEditForm({ ...editForm, jenis: e.target.value })} className="input-field"><option value="ukt_semester">UKT Semester</option><option value="ukt_cicilan">UKT Cicilan</option><option value="ppdb">PPDB</option></select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Semester</label><select value={editForm.semester} onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })} className="input-field"><option>Ganjil</option><option>Genap</option></select></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun Akademik</label><input value={editForm.tahun_akademik} onChange={(e) => setEditForm({ ...editForm, tahun_akademik: e.target.value })} className="input-field" /></div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Simpan</button>
        </form>
      </Modal>
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={`Riwayat Pembayaran - ${detailTagihan?.nim || ''}`}>
        {riwayat.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-zinc-400">Belum ada pembayaran</p>
        ) : (
          <div className="space-y-2">
            {riwayat.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                <div>
                  <p className="text-xs font-semibold dark:text-white">{rupiah(r.nominal)}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{r.metode} - {r.paid_at ? new Date(r.paid_at).toLocaleDateString('id') : '-'}</p>
                </div>
                <Badge variant={r.status === 'settlement' ? 'success' : r.status === 'pending' ? 'warning' : 'danger'}>{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
