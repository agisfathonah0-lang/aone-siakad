import { useState, useEffect, useCallback } from 'react';
import { toast } from '../../context/ToastContext';
import api, { get, getPaginated, post, patch } from '../../api/client';
import { Plus, Printer, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { KRS } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const statusBadge: Record<string, 'warning' | 'success' | 'danger'> = { pending: 'warning', disetujui: 'success', ditolak: 'danger' };
const statusLabel: Record<string, string> = { pending: 'Pending', disetujui: 'Disetujui', ditolak: 'Ditolak' };

export default function KRSPage() {
  const { user } = useAuth();
  const role = user?.role;
  const isMahasiswa = role === 'mahasiswa';

  const [data, setData] = useState<KRS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filterMahasiswa, setFilterMahasiswa] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [mahasiswaList, setMahasiswaList] = useState<any[]>([]);
  const [currentMhsId, setCurrentMhsId] = useState('');

  const [ipk, setIpk] = useState<number | null>(null);
  const [totalSks, setTotalSks] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [jadwalList, setJadwalList] = useState<any[]>([]);
  const [selectedJadwal, setSelectedJadwal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [loadingJadwal, setLoadingJadwal] = useState(false);
  const [cetakSemester, setCetakSemester] = useState('Ganjil');
  const [cetakTA, setCetakTA] = useState('2025/2026');
  const [loadingCetak, setLoadingCetak] = useState(false);

  useEffect(() => {
    if (isMahasiswa) {
      get<{ mahasiswa_id: string; nim: string; nama: string }>('/akademik/krs/me').then(r => {
        setCurrentMhsId(r.mahasiswa_id);
        setFilterMahasiswa(r.mahasiswa_id);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!isMahasiswa) {
      get<any>('/akademik/mahasiswa?limit=200').then(r => {
        setMahasiswaList(r.rows || []);
      }).catch(() => {});
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = `/akademik/krs?page=${page}`;
      if (filterMahasiswa) url += `&mahasiswa_id=${filterMahasiswa}`;
      if (filterStatus) url += `&status=${filterStatus}`;
      const res = await getPaginated<KRS>(url);
      setData(res.rows || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterMahasiswa, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (filterMahasiswa) {
      get<any>(`/akademik/krs/transcript/${filterMahasiswa}`).then(r => {
        setIpk(r.ipk);
        setTotalSks(r.totalSks);
      }).catch(() => {
        setIpk(null);
        setTotalSks(0);
      });
    } else {
      setIpk(null);
      setTotalSks(0);
    }
  }, [filterMahasiswa]);

  async function handleApprove(id: string) {
    try { await patch(`/akademik/krs/${id}/approve`); fetchData(); }
    catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  }

  async function handleReject(id: string) {
    try {
      await patch(`/akademik/krs/${id}/reject`, { alasan_penolakan: rejectReason || undefined });
      setRejectingId(null);
      setRejectReason('');
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || err.message, 'error');
    }
  }

  async function openCreateModal() {
    setShowCreateModal(true);
    setSelectedJadwal('');
    setLoadingJadwal(true);
    try {
      const [jadwalRes, krsRes] = await Promise.all([
        get<any>(`/akademik/jadwal?limit=200`),
        get<any>(`/akademik/krs?mahasiswa_id=${currentMhsId}&limit=200`),
      ]);
      const allJadwal = jadwalRes.rows || (Array.isArray(jadwalRes) ? jadwalRes : []);
      const enrolledJadwalIds = new Set((krsRes.rows || (Array.isArray(krsRes) ? krsRes : [])).map((k: any) => k.jadwal_id));
      setJadwalList(allJadwal.filter((j: any) => !enrolledJadwalIds.has(j.id)));
    } catch { setJadwalList([]); }
    finally { setLoadingJadwal(false); }
  }

  async function handleCreate() {
    if (!selectedJadwal) return;
    setSubmitting(true);
    try {
      const j = jadwalList.find((j: any) => j.id === selectedJadwal);
      await post('/akademik/krs', {
        mahasiswa_id: currentMhsId,
        jadwal_id: selectedJadwal,
        tahun_akademik: j.tahun_akademik,
        semester: j.semester,
      });
      setShowCreateModal(false);
      setSelectedJadwal('');
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || err.message, 'error');
    } finally { setSubmitting(false); }
  }

  const columns = [
    { key: 'mk_nama', label: 'Mata Kuliah' },
    { key: 'mk_kode', label: 'Kode' },
    { key: 'sks', label: 'SKS' },
    { key: 'dosen_nama', label: 'Dosen' },
    { key: 'hari', label: 'Jadwal', render: (r: KRS) => `${r.hari} ${r.jam_mulai?.slice(0, 5)}` },
    { key: 'status', label: 'Status', render: (r: KRS) => <Badge variant={statusBadge[r.status as keyof typeof statusBadge] || 'default'}>{statusLabel[r.status] || r.status}</Badge> },
    {
      key: 'id', label: 'Aksi', render: (r: KRS) => {
        if (r.status === 'pending') {
          return (
            <div className="flex gap-2">
              <button onClick={() => handleApprove(r.id)} className="text-[10px] font-bold text-emerald-500 hover:underline">Setuju</button>
              {rejectingId === r.id ? (
                <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                  <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Alasan penolakan..." className="text-xs p-1 border rounded w-40 h-12" />
                  <div className="flex gap-1">
                    <button onClick={() => handleReject(r.id)} className="text-[10px] font-bold text-red-500 hover:underline">Kirim</button>
                    <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="text-[10px] text-slate-400 hover:underline">Batal</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setRejectingId(r.id)} className="text-[10px] font-bold text-red-500 hover:underline">Tolak</button>
              )}
            </div>
          );
        }
        return <span className="text-[10px] text-slate-400">-</span>;
      }
    },
  ];

  return (
    <div className="space-y-4">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex items-center justify-between no-print">
        <div><h1 className="text-xl font-bold font-display tracking-tight dark:text-white">KRS</h1></div>
        <div className="flex items-center gap-2">
          {isMahasiswa && (
            <button onClick={openCreateModal} className="btn-primary text-xs flex items-center gap-1.5">
              <Plus size={14} /> Tambah KRS
            </button>
          )}
          <div className="flex items-center gap-2">
            <select value={cetakSemester} onChange={e => setCetakSemester(e.target.value)} className="input-field text-xs max-w-[90px]">
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
              <option value="Pendek">Pendek</option>
            </select>
            <select value={cetakTA} onChange={e => setCetakTA(e.target.value)} className="input-field text-xs max-w-[110px]">
              <option value="2025/2026">2025/2026</option>
              <option value="2024/2025">2024/2025</option>
              <option value="2023/2024">2023/2024</option>
              <option value="2022/2023">2022/2023</option>
            </select>
            <button
              onClick={async () => {
                const mhsId = filterMahasiswa || currentMhsId;
                if (!mhsId) return;
                setLoadingCetak(true);
                try {
                  const response = await api.get(`/akademik/cetak/krs/${mhsId}?semester=${cetakSemester}&tahun_akademik=${cetakTA}`, { responseType: 'blob' });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  window.open(url, '_blank');
                } catch (err: any) {
                  toast(err.response?.data?.message || err.message, 'error');
                } finally {
                  setLoadingCetak(false);
                }
              }}
              disabled={loadingCetak}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              {loadingCetak ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
              {loadingCetak ? 'Mencetak...' : 'Cetak KRS'}
            </button>
          </div>
        </div>
      </div>

      {ipk !== null && (
        <div className="print-area bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-slate-400 dark:text-zinc-500">IPK</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{ipk}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-zinc-500">Total SKS</p>
              <p className="text-2xl font-bold text-slate-700 dark:text-zinc-300">{totalSks}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 no-print">
        {!isMahasiswa && (
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <select
              value={filterMahasiswa}
              onChange={e => { setFilterMahasiswa(e.target.value); setPage(1); }}
              className="input-field pl-9 text-sm"
            >
              <option value="">Semua Mahasiswa</option>
              {mahasiswaList.map((m: any) => (
                <option key={m.id} value={m.id}>{m.nim} - {m.nama}</option>
              ))}
            </select>
          </div>
        )}
        <div className="relative max-w-[160px]">
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="input-field text-sm"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="disetujui">Disetujui</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tambah KRS" size="lg">
        {loadingJadwal ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
        ) : jadwalList.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Tidak ada jadwal tersedia</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {jadwalList.map((j: any) => (
              <label
                key={j.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedJadwal === j.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/50'}`}
              >
                <input type="radio" name="jadwal" value={j.id} checked={selectedJadwal === j.id} onChange={() => setSelectedJadwal(j.id)} className="accent-indigo-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold dark:text-white">{j.mk_nama} ({j.mk_kode})</p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">
                    {j.dosen_nama} &middot; {j.hari} {j.jam_mulai?.slice(0, 5)}-{j.jam_selesai?.slice(0, 5)} &middot; {j.ruangan || '-'} &middot; {j.sks} SKS
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setShowCreateModal(false)} className="btn-secondary text-xs">Batal</button>
          <button onClick={handleCreate} disabled={!selectedJadwal || submitting} className="btn-primary text-xs">
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal>
    </div>
  );
}