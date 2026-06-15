import { useState, useEffect, useCallback } from 'react';
import { get, getPaginated, post, put, del, patch } from '../../api/client';
import { Plus, Pencil, Trash2, Eye, Users, Search, Handshake, Check, CheckCircle, XCircle, DollarSign, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Beasiswa, BeasiswaPenerima, BeasiswaPencairan } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const statusPenerimaBadge: Record<string, 'warning' | 'success' | 'danger'> = { pending: 'warning', disetujui: 'success', ditolak: 'danger' };
const statusPenerimaLabel: Record<string, string> = { pending: 'Pending', disetujui: 'Disetujui', ditolak: 'Ditolak' };

const jenisList = ['BPP', 'Bidikmisi', 'KIP', 'Prestasi', 'Lainnya'];

export default function BeasiswaPage() {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === 'super_admin' || role === 'admin' || role === 'akademik';
  const isMahasiswa = role === 'mahasiswa';

  const [activeTab, setActiveTab] = useState(isMahasiswa ? 1 : 0);

  const [data, setData] = useState<Beasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterTA, setFilterTA] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nama: '', jenis: 'BPP', penyelenggara: '', nominal: 0, kuota: 0,
    tahun_akademik: '', tanggal_mulai: '', tanggal_selesai: '',
    deskripsi: '', is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const [detailModal, setDetailModal] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailPenerima, setDetailPenerima] = useState<BeasiswaPenerima[]>([]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [mhsData, setMhsData] = useState<{ mahasiswa_id: string; nim: string; nama: string } | null>(null);
  const [availableBeasiswa, setAvailableBeasiswa] = useState<Beasiswa[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Set<string>>(new Set());

  const [selectedBeasiswaId, setSelectedBeasiswaId] = useState('');
  const [penerimaList, setPenerimaList] = useState<BeasiswaPenerima[]>([]);
  const [filterPenerimaStatus, setFilterPenerimaStatus] = useState('');
  const [penerimaLoading, setPenerimaLoading] = useState(false);

  const [pencairanModal, setPencairanModal] = useState(false);
  const [pencairanPenerima, setPencairanPenerima] = useState<BeasiswaPenerima | null>(null);
  const [pencairanList, setPencairanList] = useState<BeasiswaPencairan[]>([]);
  const [pencairanForm, setPencairanForm] = useState({ nominal: 0, tanggal_cair: '', keterangan: '' });
  const [pencairanSubmitting, setPencairanSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/akademik/beasiswa?page=${page}`;
      if (filterTA) url += `&tahun_akademik=${filterTA}`;
      if (filterActive) url += `&is_active=${filterActive}`;
      const res = await getPaginated<Beasiswa>(url);
      setData(res.rows || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch {} finally { setLoading(false); }
  }, [page, filterTA, filterActive]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (isMahasiswa) {
      get<{ mahasiswa_id: string; nim: string; nama: string }>('/akademik/krs/me').then(r => {
        setMhsData(r);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (isMahasiswa && mhsData) {
      get<any>('/akademik/beasiswa?is_active=true&limit=100').then(r => {
        const list = r.rows || (Array.isArray(r) ? r : []);
        setAvailableBeasiswa(list);
        Promise.all(list.map((b: Beasiswa) =>
          get<any>(`/akademik/beasiswa/${b.id}`).then(detail => {
            const penerima = detail.penerima || [];
            return penerima.find((p: any) => p.mahasiswa_id === mhsData.mahasiswa_id);
          }).catch(() => null)
        )).then(results => {
          const registered = new Set<string>();
          results.forEach((p: any, i: number) => {
            if (p) registered.add(list[i].id);
          });
          setMyRegistrations(registered);
        });
      }).catch(() => {});
    }
  }, [isMahasiswa, mhsData]);

  async function handleRegister(beasiswaId: string) {
    if (!mhsData) return;
    try {
      await post(`/akademik/beasiswa/${beasiswaId}/penerima`, { mahasiswa_id: mhsData.mahasiswa_id });
      setMyRegistrations(prev => new Set(prev).add(beasiswaId));
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  }

  async function openDetail(row: Beasiswa) {
    try {
      const res = await get<any>(`/akademik/beasiswa/${row.id}`);
      setDetailData(res);
      setDetailPenerima(res.penerima || []);
      setDetailModal(true);
    } catch {}
  }

  function openCreate() {
    setEditId(null);
    setForm({ nama: '', jenis: 'BPP', penyelenggara: '', nominal: 0, kuota: 0, tahun_akademik: '', tanggal_mulai: '', tanggal_selesai: '', deskripsi: '', is_active: true });
    setShowForm(true);
  }

  async function openEdit(row: Beasiswa) {
    setEditId(row.id);
    setForm({
      nama: row.nama,
      jenis: row.jenis,
      penyelenggara: row.penyelenggara || '',
      nominal: row.nominal,
      kuota: row.kuota || 0,
      tahun_akademik: row.tahun_akademik,
      tanggal_mulai: row.tanggal_mulai?.slice(0, 10) || '',
      tanggal_selesai: row.tanggal_selesai?.slice(0, 10) || '',
      deskripsi: row.deskripsi || '',
      is_active: row.is_active ?? true,
    });
    setShowForm(true);
  }

  async function handleSave() {
    setSubmitting(true);
    try {
      const body = { ...form, nominal: Number(form.nominal), kuota: Number(form.kuota) };
      if (editId) {
        await put(`/akademik/beasiswa/${editId}`, body);
      } else {
        await post('/akademik/beasiswa', body);
      }
      setShowForm(false);
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    try {
      await del(`/akademik/beasiswa/${id}`);
      setShowDeleteConfirm(null);
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  }

  const columns = [
    { key: 'nama', label: 'Nama' },
    { key: 'jenis', label: 'Jenis', render: (r: Beasiswa) => <Badge variant="info">{r.jenis}</Badge> },
    { key: 'penyelenggara', label: 'Penyelenggara' },
    { key: 'nominal', label: 'Nominal', render: (r: Beasiswa) => <span className="font-mono">Rp {r.nominal.toLocaleString('id-ID')}</span> },
    { key: 'kuota', label: 'Kuota' },
    { key: 'tahun_akademik', label: 'Tahun Akademik' },
    { key: 'is_active', label: 'Status', render: (r: Beasiswa) => <Badge variant={r.is_active ? 'success' : 'default'}>{r.is_active ? 'Aktif' : 'Nonaktif'}</Badge> },
    ...(isAdmin ? [{
      key: 'id', label: 'Aksi', render: (r: Beasiswa) => (
        <div className="flex gap-1.5">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" title="Edit"><Pencil size={14} /></button>
          <button onClick={() => setShowDeleteConfirm(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Hapus"><Trash2 size={14} /></button>
          <button onClick={() => openDetail(r)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors" title="Detail"><Eye size={14} /></button>
        </div>
      ),
    }] : [{
      key: 'id', label: 'Detail', render: (r: Beasiswa) => (
        <button onClick={() => openDetail(r)} className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"><Eye size={14} /> Lihat</button>
      ),
    }]),
  ];

  async function loadPenerima() {
    if (!selectedBeasiswaId) return;
    setPenerimaLoading(true);
    try {
      let url = `/akademik/beasiswa/${selectedBeasiswaId}/penerima`;
      if (filterPenerimaStatus) url += `?status=${filterPenerimaStatus}`;
      const res = await get<BeasiswaPenerima[]>(url);
      setPenerimaList(Array.isArray(res) ? res : []);
    } catch {} finally { setPenerimaLoading(false); }
  }

  useEffect(() => { loadPenerima(); }, [selectedBeasiswaId, filterPenerimaStatus]);

  async function handleApproveReject(penerimaId: string, status: string) {
    try {
      await patch(`/akademik/beasiswa/penerima/${penerimaId}/status`, { status, keterangan: '' });
      loadPenerima();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  }

  async function openPencairan(penerima: BeasiswaPenerima) {
    setPencairanPenerima(penerima);
    setPencairanForm({ nominal: 0, tanggal_cair: new Date().toISOString().slice(0, 10), keterangan: '' });
    try {
      const res = await get<BeasiswaPencairan[]>(`/akademik/beasiswa/penerima/${penerima.id}/pencairan`);
      setPencairanList(Array.isArray(res) ? res : []);
    } catch { setPencairanList([]); }
    setPencairanModal(true);
  }

  async function handleAddPencairan() {
    if (!pencairanPenerima) return;
    setPencairanSubmitting(true);
    try {
      await post(`/akademik/beasiswa/penerima/${pencairanPenerima.id}/pencairan`, {
        nominal: Number(pencairanForm.nominal),
        tanggal_cair: pencairanForm.tanggal_cair,
        keterangan: pencairanForm.keterangan || undefined,
      });
      setPencairanForm({ nominal: 0, tanggal_cair: new Date().toISOString().slice(0, 10), keterangan: '' });
      const res = await get<BeasiswaPencairan[]>(`/akademik/beasiswa/penerima/${pencairanPenerima.id}/pencairan`);
      setPencairanList(Array.isArray(res) ? res : []);
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setPencairanSubmitting(false); }
  }

  const tabs = [
    ...(isAdmin ? [{ key: 0, label: 'Daftar Beasiswa' }] : []),
    { key: 1, label: 'Pendaftaran' },
    ...(isAdmin ? [{ key: 2, label: 'Penerima & Pencairan' }] : []),
  ];

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Beasiswa</h1></div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === t.key ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'}`}>{t.label}</button>
        ))}
      </div>

      {activeTab === 0 && isAdmin && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="relative max-w-[140px]">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={filterTA} onChange={e => { setFilterTA(e.target.value); setPage(1); }} className="input-field pl-8 text-xs">
                  <option value="">Semua TA</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2024/2025">2024/2025</option>
                  <option value="2023/2024">2023/2024</option>
                </select>
              </div>
              <div className="relative max-w-[130px]">
                <select value={filterActive} onChange={e => { setFilterActive(e.target.value); setPage(1); }} className="input-field text-xs">
                  <option value="">Semua Status</option>
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            </div>
            <button onClick={openCreate} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={14} /> Tambah Beasiswa</button>
          </div>
          <DataTable columns={columns} data={data} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} emptyMessage="Belum ada beasiswa" />
        </>
      )}

      {activeTab === 1 && (
        <div className="space-y-3">
          {!mhsData && !isAdmin && <p className="text-sm text-slate-400">Memuat data mahasiswa...</p>}
          {isAdmin && (
            <div className="relative max-w-xs">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select value={filterTA} onChange={e => setFilterTA(e.target.value)} className="input-field pl-8 text-xs">
                <option value="">Semua TA</option>
                <option value="2025/2026">2025/2026</option>
                <option value="2024/2025">2024/2025</option>
              </select>
            </div>
          )}
          {(isAdmin ? availableBeasiswa : availableBeasiswa).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Belum ada beasiswa tersedia</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(isAdmin ? data.filter(b => b.is_active) : availableBeasiswa).map(b => (
                <div key={b.id} className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="info">{b.jenis}</Badge>
                    {myRegistrations.has(b.id) && <Badge variant="success">Sudah Mendaftar</Badge>}
                  </div>
                  <h3 className="font-bold text-sm dark:text-white mb-1">{b.nama}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mb-2">{b.penyelenggara || '-'} &middot; {b.tahun_akademik}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">Rp {b.nominal.toLocaleString('id-ID')}</span>
                    {isMahasiswa && mhsData && !myRegistrations.has(b.id) && (
                      <button onClick={() => handleRegister(b.id)} className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"><Handshake size={14} /> Daftar</button>
                    )}
                    {myRegistrations.has(b.id) && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"><Check size={14} /> Terdaftar</span>
                    )}
                  </div>
                </div>
              ))}
              {(isAdmin ? data.filter(b => b.is_active) : availableBeasiswa).length === 0 && <p className="text-sm text-slate-400 col-span-full text-center py-8">Tidak ada beasiswa aktif</p>}
            </div>
          )}
        </div>
      )}

      {activeTab === 2 && isAdmin && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select value={selectedBeasiswaId} onChange={e => setSelectedBeasiswaId(e.target.value)} className="input-field pl-8 text-xs">
                <option value="">Pilih Beasiswa</option>
                {data.map(b => <option key={b.id} value={b.id}>{b.nama} - {b.tahun_akademik}</option>)}
              </select>
            </div>
            <div className="relative max-w-[140px]">
              <select value={filterPenerimaStatus} onChange={e => setFilterPenerimaStatus(e.target.value)} className="input-field text-xs">
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          {!selectedBeasiswaId ? (
            <p className="text-sm text-slate-400 text-center py-8">Pilih beasiswa terlebih dahulu</p>
          ) : penerimaLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
          ) : penerimaList.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Belum ada pendaftar</p>
          ) : (
            <div className="overflow-hidden rounded-xl bg-white dark:bg-zinc-900/50 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800/30">
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">NIM</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Nama</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Tanggal Daftar</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Status</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-zinc-800/20">
                  {penerimaList.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer" onClick={() => openPencairan(p)}>
                      <td className="px-4 py-3 font-mono text-xs dark:text-zinc-300">{p.nim}</td>
                      <td className="px-4 py-3 font-semibold dark:text-white">{p.mahasiswa_nama}</td>
                      <td className="px-4 py-3 text-xs dark:text-zinc-300">{new Date(p.tanggal_daftar).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-3"><Badge variant={statusPenerimaBadge[p.status as keyof typeof statusPenerimaBadge] || 'default'}>{statusPenerimaLabel[p.status] || p.status}</Badge></td>
                      <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                        {p.status === 'pending' ? (
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handleApproveReject(p.id, 'disetujui')} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Setujui"><CheckCircle size={15} /></button>
                            <button onClick={() => handleApproveReject(p.id, 'ditolak')} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Tolak"><XCircle size={15} /></button>
                          </div>
                        ) : (
                          <button onClick={() => openPencairan(p)} className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"><DollarSign size={14} /> Pencairan</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Beasiswa' : 'Tambah Beasiswa'} size="lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Nama Beasiswa</label>
              <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} className="input-field text-sm" placeholder="Nama beasiswa" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Jenis</label>
              <select value={form.jenis} onChange={e => setForm({ ...form, jenis: e.target.value })} className="input-field text-sm">
                {jenisList.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Penyelenggara</label>
              <input value={form.penyelenggara} onChange={e => setForm({ ...form, penyelenggara: e.target.value })} className="input-field text-sm" placeholder="Kemdikbud, Swasta, dll" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Tahun Akademik</label>
              <select value={form.tahun_akademik} onChange={e => setForm({ ...form, tahun_akademik: e.target.value })} className="input-field text-sm">
                <option value="">Pilih TA</option>
                <option value="2025/2026">2025/2026</option>
                <option value="2024/2025">2024/2025</option>
                <option value="2023/2024">2023/2024</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Nominal (Rp)</label>
              <input type="number" value={form.nominal} onChange={e => setForm({ ...form, nominal: Number(e.target.value) })} className="input-field text-sm" min={0} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Kuota</label>
              <input type="number" value={form.kuota} onChange={e => setForm({ ...form, kuota: Number(e.target.value) })} className="input-field text-sm" min={0} />
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
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Deskripsi</label>
            <textarea rows={3} value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} className="input-field text-sm" placeholder="Deskripsi beasiswa" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="accent-indigo-600" />
            <label htmlFor="is_active" className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Aktif</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary text-xs">Batal</button>
            <button onClick={handleSave} disabled={submitting} className="btn-primary text-xs">{submitting ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </div>
      </Modal>

      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={detailData?.nama || 'Detail Beasiswa'} size="lg">
        {detailData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-slate-400 block">Jenis</span><Badge variant="info">{detailData.jenis}</Badge></div>
              <div><span className="text-xs text-slate-400 block">Penyelenggara</span><span className="dark:text-white">{detailData.penyelenggara || '-'}</span></div>
              <div><span className="text-xs text-slate-400 block">Nominal</span><span className="font-mono font-bold dark:text-white">Rp {detailData.nominal?.toLocaleString('id-ID')}</span></div>
              <div><span className="text-xs text-slate-400 block">Kuota</span><span className="dark:text-white">{detailData.kuota || 0}</span></div>
              <div><span className="text-xs text-slate-400 block">Tahun Akademik</span><span className="dark:text-white">{detailData.tahun_akademik}</span></div>
              <div><span className="text-xs text-slate-400 block">Status</span><Badge variant={detailData.is_active ? 'success' : 'default'}>{detailData.is_active ? 'Aktif' : 'Nonaktif'}</Badge></div>
              {detailData.tanggal_mulai && <div><span className="text-xs text-slate-400 block">Tanggal Mulai</span><span className="dark:text-white">{new Date(detailData.tanggal_mulai).toLocaleDateString('id-ID')}</span></div>}
              {detailData.tanggal_selesai && <div><span className="text-xs text-slate-400 block">Tanggal Selesai</span><span className="dark:text-white">{new Date(detailData.tanggal_selesai).toLocaleDateString('id-ID')}</span></div>}
              <div><span className="text-xs text-slate-400 block">Total Pencairan</span><span className="font-mono font-bold dark:text-white">Rp {detailData.total_pencairan?.toLocaleString('id-ID') || 0}</span></div>
            </div>
            {detailData.deskripsi && <div><span className="text-xs text-slate-400 block mb-1">Deskripsi</span><p className="text-sm dark:text-zinc-300">{detailData.deskripsi}</p></div>}
            <div>
              <h3 className="text-sm font-bold dark:text-white mb-2 flex items-center gap-1.5"><Users size={14} /> Pendaftar ({detailPenerima.length})</h3>
              {detailPenerima.length === 0 ? (
                <p className="text-xs text-slate-400">Belum ada pendaftar</p>
              ) : (
                <div className="overflow-hidden rounded-lg border dark:border-zinc-700/30">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-zinc-800">
                      <tr><th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">NIM</th><th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Nama</th><th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Status</th></tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800/30">
                      {detailPenerima.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                          <td className="px-3 py-2 font-mono text-xs">{p.nim}</td>
                          <td className="px-3 py-2 text-xs font-semibold dark:text-white">{p.mahasiswa_nama}</td>
                          <td className="px-3 py-2"><Badge variant={statusPenerimaBadge[p.status as keyof typeof statusPenerimaBadge] || 'default'}>{statusPenerimaLabel[p.status] || p.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Hapus Beasiswa" size="sm">
        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">Yakin ingin menghapus beasiswa ini? Semua data pendaftaran terkait akan ikut terhapus.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setShowDeleteConfirm(null)} className="btn-secondary text-xs">Batal</button>
          <button onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)} className="btn-danger text-xs">Hapus</button>
        </div>
      </Modal>

      <Modal open={pencairanModal} onClose={() => setPencairanModal(false)} title={pencairanPenerima ? `Pencairan: ${pencairanPenerima.mahasiswa_nama}` : 'Pencairan'} size="lg">
        {pencairanPenerima && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Nominal</label>
                  <input type="number" value={pencairanForm.nominal} onChange={e => setPencairanForm({ ...pencairanForm, nominal: Number(e.target.value) })} className="input-field text-sm" min={0} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Tanggal Cair</label>
                  <input type="date" value={pencairanForm.tanggal_cair} onChange={e => setPencairanForm({ ...pencairanForm, tanggal_cair: e.target.value })} className="input-field text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Keterangan</label>
                <textarea rows={2} value={pencairanForm.keterangan} onChange={e => setPencairanForm({ ...pencairanForm, keterangan: e.target.value })} className="input-field text-sm" />
              </div>
              <button onClick={handleAddPencairan} disabled={pencairanSubmitting} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5">
                {pencairanSubmitting ? 'Menyimpan...' : <><DollarSign size={14} /> Tambah Pencairan</>}
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pencairanList.map(pc => (
                <div key={pc.id} className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Rp {pc.nominal.toLocaleString('id-ID')}</p>
                    {pc.keterangan && <p className="text-slate-400 mt-0.5">{pc.keterangan}</p>}
                  </div>
                  <span className="text-slate-400">{new Date(pc.tanggal_cair).toLocaleDateString('id-ID')}</span>
                </div>
              ))}
              {pencairanList.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada pencairan</p>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
