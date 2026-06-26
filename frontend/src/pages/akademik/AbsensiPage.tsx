import { useState, useEffect, useCallback } from 'react';
import { toast } from '../../context/ToastContext';
import { getPaginated, get, post } from '../../api/client';
import type { Absensi, Jadwal } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Plus, Upload, BarChart3, Search } from 'lucide-react';

const statusBadge: Record<string, 'success' | 'warning' | 'danger' | 'info'> = { hadir: 'success', izin: 'warning', sakit: 'info', alpha: 'danger' };

interface RekapRow {
  id: string; nim: string; nama: string; total_hadir: number;
  hadir: number; sakit: number; izin: number; alfa: number;
}

export default function AbsensiPage() {
  const [data, setData] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ jadwal_id: '', mahasiswa_id: '', pertemuan: 1, status: 'hadir', tanggal: new Date().toISOString().slice(0, 10) });
  const [jadwalFilter, setJadwalFilter] = useState('');
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [prodiFilter, setProdiFilter] = useState('');
  const [prodiList, setProdiList] = useState<{ id: string; nama: string; jenjang: string }[]>([]);
  const [batchPertemuan, setBatchPertemuan] = useState(1);
  const [batchTanggal, setBatchTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [batchStudents, setBatchStudents] = useState<RekapRow[]>([]);
  const [batchStatuses, setBatchStatuses] = useState<Record<string, string>>({});
  const [batchLoading, setBatchLoading] = useState(false);
  const [rekapModal, setRekapModal] = useState(false);
  const [rekapData, setRekapData] = useState<RekapRow[]>([]);
  const [rekapLoading, setRekapLoading] = useState(false);

  const fetchJadwal = useCallback(async () => {
    try { const res = await getPaginated<Jadwal>('/akademik/jadwal?page=1&limit=1000'); setJadwalList(res.rows); }
    catch { /* ignore */ }
  }, []);

  const fetchProdi = useCallback(async () => {
    try { const res = await getPaginated<any>('/akademik/prodi?page=1&limit=100'); setProdiList(res.rows); }
    catch { /* ignore */ }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await get<Absensi[]>('/akademik/absensi');
      let filtered = res ?? [];
      if (jadwalFilter) filtered = filtered.filter(a => a.jadwal_id === jadwalFilter);
      setData(filtered);
      setTotalPages(1);
    }
    catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }, [jadwalFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchJadwal(); }, [fetchJadwal]);
  useEffect(() => { fetchProdi(); }, [fetchProdi]);

  useEffect(() => {
    if (!jadwalFilter) { setBatchStudents([]); setBatchStatuses({}); return; }
    (async () => {
      try {
        const res = await get<RekapRow[]>(`/akademik/absensi/rekap/${jadwalFilter}`);
        setBatchStudents(res);
        const statuses: Record<string, string> = {};
        for (const s of res) statuses[s.id] = 'hadir';
        setBatchStatuses(statuses);
        setBatchPertemuan(1);
        setBatchTanggal(new Date().toISOString().slice(0, 10));
      } catch { setBatchStudents([]); }
    })();
  }, [jadwalFilter]);

  useEffect(() => {
    if (!jadwalFilter || !batchPertemuan || batchStudents.length === 0) return;
    (async () => {
      try {
        const existing = await get<Absensi[]>(`/akademik/absensi?jadwal_id=${jadwalFilter}`);
        const filtered = existing.filter(a => a.pertemuan === batchPertemuan);
        setBatchStatuses(prev => {
          const next = { ...prev };
          for (const a of filtered) next[a.mahasiswa_id] = a.status;
          return next;
        });
      } catch { /* ignore */ }
    })();
  }, [jadwalFilter, batchPertemuan, batchStudents.length]);

  const handleJadwalChange = (jadwal_id: string) => {
    setForm(f => ({ ...f, jadwal_id }));
    if (!jadwal_id) return;
    (async () => {
      try {
        const existing = await get<Absensi[]>(`/akademik/absensi?jadwal_id=${jadwal_id}`);
        const maxP = existing.reduce((max, a) => Math.max(max, a.pertemuan), 0);
        setForm(prev => ({ ...prev, pertemuan: maxP + 1 }));
      } catch { /* ignore */ }
    })();
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await post('/akademik/absensi', form); setModal(false); fetchData(); }
    catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const saveBatch = async () => {
    if (!jadwalFilter) return;
    setBatchLoading(true);
    try {
      const data = Object.entries(batchStatuses).map(([mahasiswa_id, status]) => ({ mahasiswa_id, status }));
      await post('/akademik/absensi/batch', { jadwal_id: jadwalFilter, pertemuan: batchPertemuan, tanggal: batchTanggal, data });
      fetchData();
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
    finally { setBatchLoading(false); }
  };

  const openRekap = async () => {
    if (!jadwalFilter) return;
    setRekapModal(true); setRekapLoading(true);
    try { const res = await get<RekapRow[]>(`/akademik/absensi/rekap/${jadwalFilter}`); setRekapData(res); }
    catch { setRekapData([]); }
    finally { setRekapLoading(false); }
  };

  const columns = [
    { key: 'nim', label: 'NIM' },
    { key: 'mahasiswa_nama', label: 'Mahasiswa' },
    { key: 'pertemuan', label: 'Pertemuan' },
    { key: 'tanggal', label: 'Tanggal' },
    { key: 'status', label: 'Status', render: (r: Absensi) => <Badge variant={statusBadge[r.status as keyof typeof statusBadge] || 'default'}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Absensi</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah</button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <select value={prodiFilter} onChange={(e) => { setPage(1); setProdiFilter(e.target.value); }} className="input-field max-w-xs">
          <option value="">Semua Prodi</option>
          {prodiList.map(p => <option key={p.id} value={p.id}>{p.jenjang} - {p.nama}</option>)}
        </select>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select value={jadwalFilter} onChange={(e) => { setPage(1); setJadwalFilter(e.target.value); }} className="input-field pl-8">
            <option value="">Semua Jadwal</option>
            {jadwalList.map(j => <option key={j.id} value={j.id}>{j.mk_nama} - {j.dosen_nama} ({j.hari})</option>)}
          </select>
        </div>
        <button onClick={openRekap} disabled={!jadwalFilter} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"><BarChart3 size={14} /> Lihat Rekap</button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />
      {jadwalFilter && (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg border border-slate-200/50 dark:border-zinc-700/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-display tracking-tight dark:text-white flex items-center gap-2"><Upload size={16} /> Input Absensi Batch</h2>
            <div className="flex items-center gap-3">
              <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Pertemuan</label><input type="number" min={1} value={batchPertemuan} onChange={e => setBatchPertemuan(parseInt(e.target.value) || 1)} className="input-field w-20 text-center" /></div>
              <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Tanggal</label><input type="date" value={batchTanggal} onChange={e => setBatchTanggal(e.target.value)} className="input-field" /></div>
            </div>
          </div>
          {batchStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-700">
                    <th className="text-left py-2 px-3 text-slate-500 dark:text-zinc-400 font-semibold">NIM</th>
                    <th className="text-left py-2 px-3 text-slate-500 dark:text-zinc-400 font-semibold">Mahasiswa</th>
                    <th className="text-center py-2 px-3 text-slate-500 dark:text-zinc-400 font-semibold w-40">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batchStudents.map(s => (
                    <tr key={s.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/30">
                      <td className="py-2 px-3 font-mono text-slate-700 dark:text-zinc-300">{s.nim}</td>
                      <td className="py-2 px-3 text-slate-700 dark:text-zinc-300">{s.nama}</td>
                      <td className="py-2 px-3 text-center">
                        <select value={batchStatuses[s.id] || 'hadir'} onChange={e => setBatchStatuses({ ...batchStatuses, [s.id]: e.target.value })} className="input-field text-xs">
                          <option value="hadir">Hadir</option>
                          <option value="sakit">Sakit</option>
                          <option value="izin">Izin</option>
                          <option value="alpha">Alpha</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-zinc-500">Memuat data mahasiswa...</p>
          )}
          <div className="flex justify-end">
            <button onClick={saveBatch} disabled={batchLoading || batchStudents.length === 0} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"><Upload size={14} /> {batchLoading ? 'Menyimpan...' : 'Simpan Batch'}</button>
          </div>
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Tambah Absensi">
        <form onSubmit={save} className="space-y-3">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jadwal</label>
            <select required value={form.jadwal_id} onChange={e => handleJadwalChange(e.target.value)} className="input-field">
              <option value="">Pilih Jadwal</option>
              {jadwalList.map(j => <option key={j.id} value={j.id}>{j.mk_nama} - {j.dosen_nama} ({j.hari})</option>)}
            </select></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Mahasiswa ID</label><input required value={form.mahasiswa_id} onChange={e => setForm({ ...form, mahasiswa_id: e.target.value })} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Pertemuan</label><input type="number" value={form.pertemuan} onChange={e => setForm({ ...form, pertemuan: parseInt(e.target.value) || 1 })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field"><option value="hadir">Hadir</option><option value="izin">Izin</option><option value="sakit">Sakit</option><option value="alpha">Alpha</option></select></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tanggal</label><input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} className="input-field" /></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Tambah</button>
        </form>
      </Modal>
      <Modal open={rekapModal} onClose={() => setRekapModal(false)} title="Rekap Absensi" size="xl">
        {rekapLoading ? (
          <p className="text-xs text-slate-400">Memuat...</p>
        ) : rekapData.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-zinc-500">Belum ada data rekap</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-700">
                  <th className="text-left py-2 px-3 text-slate-500 dark:text-zinc-400 font-semibold">NIM</th>
                  <th className="text-left py-2 px-3 text-slate-500 dark:text-zinc-400 font-semibold">Nama</th>
                  <th className="text-center py-2 px-3 text-slate-500 dark:text-zinc-400 font-semibold">Total Hadir</th>
                  <th className="text-center py-2 px-3 text-emerald-600 font-semibold">Hadir</th>
                  <th className="text-center py-2 px-3 text-amber-600 font-semibold">Izin</th>
                  <th className="text-center py-2 px-3 text-sky-600 font-semibold">Sakit</th>
                  <th className="text-center py-2 px-3 text-red-600 font-semibold">Alpha</th>
                </tr>
              </thead>
              <tbody>
                {rekapData.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/30">
                    <td className="py-2 px-3 font-mono text-slate-700 dark:text-zinc-300">{r.nim}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-zinc-300">{r.nama}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-700 dark:text-zinc-300">{r.total_hadir}</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-600">{r.hadir}</td>
                    <td className="py-2 px-3 text-center font-bold text-amber-600">{r.izin}</td>
                    <td className="py-2 px-3 text-center font-bold text-sky-600">{r.sakit}</td>
                    <td className="py-2 px-3 text-center font-bold text-red-600">{r.alfa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
