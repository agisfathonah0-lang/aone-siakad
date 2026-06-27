import { useState, useEffect, useCallback } from 'react';
import { get, getPaginated, post, put, del } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../context/ToastContext';
import { confirm } from '../../context/ConfirmContext';
import type { AbsensiDosen, Dosen } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { ClipboardCheck, Clock, MapPin, Plus, Pencil, Trash2, Search, BarChart3, Calendar } from 'lucide-react';

const statusBadge: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  hadir: 'success', izin: 'warning', sakit: 'danger', tugas: 'info', alpha: 'default',
};

const statusLabels: Record<string, string> = {
  hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', tugas: 'Tugas', alpha: 'Alpha',
};

export default function AbsensiDosenPage() {
  const { user } = useAuth();
  const role = user?.role || 'mahasiswa';
  const isDosen = role === 'dosen';
  const isAdmin = ['admin', 'akademik', 'kaprodi'].includes(role);

  const [activeTab, setActiveTab] = useState('harian');
  const [data, setData] = useState<AbsensiDosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [dosenFilter, setDosenFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [dosenList, setDosenList] = useState<Dosen[]>([]);

  const [todayAbsensi, setTodayAbsensi] = useState<AbsensiDosen | null>(null);
  const [todayLoading, setTodayLoading] = useState(false);

  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [form, setForm] = useState({ dosen_id: '', status: 'hadir', jam_masuk: '', jam_keluar: '', keterangan: '', lokasi: '' });

  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [rekap, setRekap] = useState<any[]>([]);
  const [rekapLoading, setRekapLoading] = useState(false);
  const [myRekap, setMyRekap] = useState<any>(null);

  const fetchDosen = useCallback(async () => {
    try {
      const res = await getPaginated<Dosen>('/akademik/dosen?page=1&limit=1000');
      setDosenList(res.rows);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchDosen(); }, [fetchDosen]);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let url = '/akademik/absensi-dosen?page=' + page + '&limit=20';
      if (dosenFilter) url += '&dosen_id=' + dosenFilter;
      if (statusFilter) url += '&status=' + statusFilter;
      if (startDate) url += '&start_date=' + startDate;
      if (endDate) url += '&end_date=' + endDate;
      const res = await getPaginated<AbsensiDosen>(url);
      setData(res.rows);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, dosenFilter, statusFilter, startDate, endDate]);

  useEffect(() => { if (activeTab === 'harian') fetchData(); }, [fetchData, activeTab]);

  const fetchToday = useCallback(async () => {
    if (!isDosen) return;
    setTodayLoading(true);
    try {
      const dosenId = user?.id;
      const res = await get<AbsensiDosen | null>('/akademik/absensi-dosen/today?dosen_id=' + dosenId);
      setTodayAbsensi(res);
    } catch { setTodayAbsensi(null); }
    finally { setTodayLoading(false); }
  }, [isDosen, user?.id]);

  useEffect(() => { if (isDosen && activeTab === 'harian') fetchToday(); }, [fetchToday, activeTab]);

  const markToday = async (status: string) => {
    try {
      const now = new Date();
      const jam = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      await post('/akademik/absensi-dosen', {
        dosen_id: user!.id,
        status,
        jam_masuk: status === 'hadir' ? jam : null,
      });
      fetchToday();
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || err.message, 'error');
    }
  };

  const openCreate = () => {
    setForm({ dosen_id: isDosen ? user?.id || '' : '', status: 'hadir', jam_masuk: '', jam_keluar: '', keterangan: '', lokasi: '' });
    setModal(true);
  };

  const openEdit = (item: AbsensiDosen) => {
    setEditId(item.id);
    setForm({
      dosen_id: item.dosen_id,
      status: item.status,
      jam_masuk: item.jam_masuk || '',
      jam_keluar: item.jam_keluar || '',
      keterangan: item.keterangan || '',
      lokasi: item.lokasi || '',
    });
    setEditModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await post('/akademik/absensi-dosen', form);
      setModal(false);
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || err.message, 'error');
    }
  };

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await put('/akademik/absensi-dosen/' + editId, form);
      setEditModal(false);
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || err.message, 'error');
    }
  };

  const remove = async (id: string) => {
    if (!(await confirm('Hapus absensi ini?'))) return;
    try {
      await del('/akademik/absensi-dosen/' + id);
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || err.message, 'error');
    }
  };

  const fetchRekap = useCallback(async () => {
    if (isDosen) {
      setRekapLoading(true);
      try {
        const res = await get<any>('/akademik/absensi-dosen/rekap/' + user!.id + '?bulan=' + bulan + '&tahun=' + tahun);
        setMyRekap(res);
      } catch { setMyRekap(null); }
      finally { setRekapLoading(false); }
    } else {
      setRekapLoading(true);
      try {
        const res = await get<any[]>('/akademik/absensi-dosen/rekap?bulan=' + bulan + '&tahun=' + tahun);
        setRekap(res);
      } catch { setRekap([]); }
      finally { setRekapLoading(false); }
    }
  }, [bulan, tahun, isDosen, user?.id]);

  useEffect(() => { if (activeTab === 'rekap') fetchRekap(); }, [fetchRekap, activeTab]);

  const columns = [
    { key: 'dosen_nama', label: 'Nama Dosen' },
    { key: 'nidn', label: 'NIDN' },
    { key: 'tanggal', label: 'Tanggal' },
    {
      key: 'jam_masuk', label: 'Jam Masuk',
      render: (r: AbsensiDosen) => r.jam_masuk ? <span className="flex items-center gap-1"><Clock size={12} />{r.jam_masuk.slice(0, 5)}</span> : '-',
    },
    {
      key: 'jam_keluar', label: 'Jam Keluar',
      render: (r: AbsensiDosen) => r.jam_keluar ? <span className="flex items-center gap-1"><Clock size={12} />{r.jam_keluar.slice(0, 5)}</span> : '-',
    },
    {
      key: 'status', label: 'Status',
      render: (r: AbsensiDosen) => <Badge variant={statusBadge[r.status] || 'default'}>{statusLabels[r.status] || r.status}</Badge>,
    },
    {
      key: 'lokasi', label: 'Lokasi',
      render: (r: AbsensiDosen) => r.lokasi ? <span className="flex items-center gap-1"><MapPin size={12} />{r.lokasi}</span> : '-',
    },
    { key: 'keterangan', label: 'Keterangan', render: (r: AbsensiDosen) => r.keterangan || '-' },
    {
      key: 'aksi', label: 'Aksi',
      render: (r: AbsensiDosen) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Pencil size={14} /></button>
          <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  const tabs = [
    { key: 'harian', label: 'Absensi Harian', icon: ClipboardCheck },
    { key: 'rekap', label: 'Rekap Bulanan', icon: BarChart3 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Absensi Dosen</h1>
        {(isAdmin || isDosen) && (
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
            <Plus size={14} /> Absen
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-xl p-1 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
              }`}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'harian' && (
        <>
          {isDosen && (
            <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg border border-slate-200/50 dark:border-zinc-700/30 p-5">
              <h2 className="text-sm font-bold font-display tracking-tight dark:text-white mb-3 flex items-center gap-2">
                <ClipboardCheck size={16} className="text-emerald-500" /> Absen Hari Ini
              </h2>
              {todayLoading ? (
                <p className="text-xs text-slate-400">Memuat...</p>
              ) : todayAbsensi ? (
                <div className="flex items-center gap-4">
                  <Badge variant={statusBadge[todayAbsensi.status] || 'default'}>
                    {statusLabels[todayAbsensi.status] || todayAbsensi.status}
                  </Badge>
                  {todayAbsensi.jam_masuk && (
                    <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                      <Clock size={12} /> {todayAbsensi.jam_masuk.slice(0, 5)}
                    </span>
                  )}
                  {todayAbsensi.lokasi && (
                    <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                      <MapPin size={12} /> {todayAbsensi.lokasi}
                    </span>
                  )}
                  <button onClick={() => openEdit(todayAbsensi)} className="ml-auto text-xs text-indigo-500 hover:underline">Edit</button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => markToday('hadir')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20">Hadir</button>
                  <button onClick={() => markToday('izin')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20">Izin</button>
                  <button onClick={() => markToday('sakit')} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/20">Sakit</button>
                  <button onClick={() => markToday('tugas')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20">Tugas</button>
                  <button onClick={() => markToday('alpha')} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-gray-500/20">Alpha</button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {isAdmin && (
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select value={dosenFilter} onChange={e => { setPage(1); setDosenFilter(e.target.value); }} className="input-field pl-8">
                  <option value="">Semua Dosen</option>
                  {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                </select>
              </div>
            )}
            <select value={statusFilter} onChange={e => { setPage(1); setStatusFilter(e.target.value); }} className="input-field max-w-[130px]">
              <option value="">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
              <option value="tugas">Tugas</option>
              <option value="alpha">Alpha</option>
            </select>
            <div className="flex items-center gap-2">
              <input type="date" value={startDate} onChange={e => { setPage(1); setStartDate(e.target.value); }} className="input-field max-w-[150px]" />
              <span className="text-xs text-slate-400">s/d</span>
              <input type="date" value={endDate} onChange={e => { setPage(1); setEndDate(e.target.value); }} className="input-field max-w-[150px]" />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            error={error}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onRefresh={fetchData}
            emptyMessage="Belum ada absensi dosen"
          />
        </>
      )}

      {activeTab === 'rekap' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-xl px-3 py-2 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
              <Calendar size={14} className="text-slate-400" />
              <select value={bulan} onChange={e => setBulan(parseInt(e.target.value))} className="input-field !border-0 !ring-0 !shadow-none !bg-transparent !p-0 text-xs font-semibold">
                {[
                  { v: 1, l: 'Januari' }, { v: 2, l: 'Februari' }, { v: 3, l: 'Maret' },
                  { v: 4, l: 'April' }, { v: 5, l: 'Mei' }, { v: 6, l: 'Juni' },
                  { v: 7, l: 'Juli' }, { v: 8, l: 'Agustus' }, { v: 9, l: 'September' },
                  { v: 10, l: 'Oktober' }, { v: 11, l: 'November' }, { v: 12, l: 'Desember' },
                ].map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
              </select>
              <select value={tahun} onChange={e => setTahun(parseInt(e.target.value))} className="input-field !border-0 !ring-0 !shadow-none !bg-transparent !p-0 text-xs font-semibold">
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {isDosen ? (
            rekapLoading ? (
              <p className="text-xs text-slate-400">Memuat rekap...</p>
            ) : myRekap ? (
              <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg border border-slate-200/50 dark:border-zinc-700/30 p-5 space-y-4">
                <h2 className="text-sm font-bold font-display tracking-tight dark:text-white">Rekap Absensi - {myRekap.nama}</h2>
                <div className="grid grid-cols-5 gap-3">
                  <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Hadir</p>
                    <p className="text-lg font-bold text-emerald-600">{myRekap.hadir}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Izin</p>
                    <p className="text-lg font-bold text-amber-600">{myRekap.izin}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Sakit</p>
                    <p className="text-lg font-bold text-red-600">{myRekap.sakit}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Tugas</p>
                    <p className="text-lg font-bold text-blue-600">{myRekap.tugas}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900/20">
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Alpha</p>
                    <p className="text-lg font-bold text-gray-600">{myRekap.alpha}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Persentase Kehadiran</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{myRekap.persentase}%</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Belum ada data rekap</p>
            )
          ) : (
            <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg border border-slate-200/50 dark:border-zinc-700/30 p-5">
              {rekapLoading ? (
                <p className="text-xs text-slate-400">Memuat...</p>
              ) : rekap.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500">Belum ada data rekap</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-zinc-700">
                        <th className="text-left py-2 px-3 text-slate-500 dark:text-zinc-400 font-semibold">Nama</th>
                        <th className="text-left py-2 px-3 text-slate-500 dark:text-zinc-400 font-semibold">NIDN</th>
                        <th className="text-center py-2 px-3 text-emerald-600 font-semibold">Hadir</th>
                        <th className="text-center py-2 px-3 text-amber-600 font-semibold">Izin</th>
                        <th className="text-center py-2 px-3 text-red-600 font-semibold">Sakit</th>
                        <th className="text-center py-2 px-3 text-blue-600 font-semibold">Tugas</th>
                        <th className="text-center py-2 px-3 text-gray-600 font-semibold">Alpha</th>
                        <th className="text-center py-2 px-3 text-indigo-600 font-semibold">% Kehadiran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rekap.map((r: any) => (
                        <tr key={r.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/30">
                          <td className="py-2 px-3 text-slate-700 dark:text-zinc-300 font-medium">{r.nama}</td>
                          <td className="py-2 px-3 font-mono text-slate-500 dark:text-zinc-400">{r.nidn || '-'}</td>
                          <td className="py-2 px-3 text-center font-bold text-emerald-600">{r.hadir}</td>
                          <td className="py-2 px-3 text-center font-bold text-amber-600">{r.izin}</td>
                          <td className="py-2 px-3 text-center font-bold text-red-600">{r.sakit}</td>
                          <td className="py-2 px-3 text-center font-bold text-blue-600">{r.tugas}</td>
                          <td className="py-2 px-3 text-center font-bold text-gray-600">{r.alpha}</td>
                          <td className="py-2 px-3 text-center font-bold text-indigo-600">{r.persentase}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Tambah Absensi Dosen">
        <form onSubmit={save} className="space-y-3">
          {isAdmin && (
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Dosen</label>
              <select required value={form.dosen_id} onChange={e => setForm({ ...form, dosen_id: e.target.value })} className="input-field">
                <option value="">Pilih Dosen</option>
                {dosenList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
              <option value="hadir">Hadir</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
              <option value="tugas">Tugas</option>
              <option value="alpha">Alpha</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jam Masuk</label>
              <input type="time" value={form.jam_masuk} onChange={e => setForm({ ...form, jam_masuk: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jam Keluar</label>
              <input type="time" value={form.jam_keluar} onChange={e => setForm({ ...form, jam_keluar: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Lokasi</label>
            <input value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })} className="input-field" placeholder="Ruang / Gedung" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Keterangan</label>
            <textarea value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} className="input-field" rows={2} />
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Simpan</button>
        </form>
      </Modal>

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Absensi Dosen">
        <form onSubmit={update} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
              <option value="hadir">Hadir</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
              <option value="tugas">Tugas</option>
              <option value="alpha">Alpha</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jam Masuk</label>
              <input type="time" value={form.jam_masuk} onChange={e => setForm({ ...form, jam_masuk: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jam Keluar</label>
              <input type="time" value={form.jam_keluar} onChange={e => setForm({ ...form, jam_keluar: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Lokasi</label>
            <input value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })} className="input-field" placeholder="Ruang / Gedung" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Keterangan</label>
            <textarea value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} className="input-field" rows={2} />
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Update</button>
        </form>
      </Modal>
    </div>
  );
}
