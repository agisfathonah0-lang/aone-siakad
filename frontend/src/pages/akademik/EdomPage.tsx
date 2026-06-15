import { useState, useEffect, useCallback } from 'react';
import { get, post, put, del } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { EdomKuisioner, EdomPeriode, EdomJadwal, EdomJawaban, EdomRekapDosen, EdomRingkasan } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Plus, Pencil, Trash2, CheckCircle, Calendar, Star, Send, ClipboardCheck, BarChart3, Users, Search, Loader2 } from 'lucide-react';

const aspekList = ['Pengajaran', 'Materi', 'Sikap', 'Komunikasi', 'Penugasan'];
const aspekColors: Record<string, string> = { Pengajaran: 'info', Materi: 'success', Sikap: 'warning', Komunikasi: 'info', Penugasan: 'default' };

export default function EdomPage() {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === 'admin' || role === 'akademik' || role === 'super_admin';
  const isMahasiswa = role === 'mahasiswa';
  const isDosen = role === 'dosen';

  const [tab, setTab] = useState(0);
  const tabs = [
    ...(isAdmin ? ['Kuisioner', 'Periode'] : []),
    ...(isMahasiswa ? ['Isi Evaluasi'] : []),
    ...(isAdmin || isDosen ? ['Rekap'] : []),
  ];

  if (tabs.length === 0) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Evaluasi Dosen (EDOM)</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Kelola evaluasi proses belajar mengajar</p>
        </div>
      </div>
      <div className="flex gap-1 border-b border-slate-200 dark:border-zinc-700/30">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 -mb-[1px] ${tab === i ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'}`}>{t}</button>
        ))}
      </div>
      {tab === 0 && isAdmin && <KuisionerTab />}
      {tab === 1 && isAdmin && <PeriodeTab />}
      {tab === (isAdmin ? 2 : 0) && isMahasiswa && <IsiEvaluasiTab />}
      {tab === (tabs.length - 1) && (isAdmin || isDosen) && <RekapTab />}
    </div>
  );
}

function KuisionerTab() {
  const [data, setData] = useState<EdomKuisioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<EdomKuisioner | null>(null);
  const [form, setForm] = useState({ pertanyaan: '', aspek: 'Pengajaran', urutan: 1, is_active: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get<EdomKuisioner[]>('/akademik/edom/kuisioner');
      setData(Array.isArray(res) ? res : []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEdit(null);
    setForm({ pertanyaan: '', aspek: 'Pengajaran', urutan: data.length + 1, is_active: true });
    setModal(true);
  };

  const openEdit = (r: EdomKuisioner) => {
    setEdit(r);
    setForm({ pertanyaan: r.pertanyaan, aspek: r.aspek, urutan: r.urutan, is_active: r.is_active });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (edit) await put(`/akademik/edom/kuisioner/${edit.id}`, form);
      else await post('/akademik/edom/kuisioner', form);
      setModal(false);
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pertanyaan ini?')) return;
    try { await del(`/akademik/edom/kuisioner/${id}`); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const columns = [
    { key: 'index', label: 'No', render: (r: EdomKuisioner) => <span className="text-xs font-mono">{r.urutan}</span> },
    { key: 'pertanyaan', label: 'Pertanyaan', render: (r: EdomKuisioner) => <span className="text-sm dark:text-white">{r.pertanyaan}</span> },
    { key: 'aspek', label: 'Aspek', render: (r: EdomKuisioner) => <Badge variant={(aspekColors[r.aspek] || 'default') as any}>{r.aspek}</Badge> },
    { key: 'urutan', label: 'Urutan' },
    { key: 'is_active', label: 'Aktif', render: (r: EdomKuisioner) => <Badge variant={r.is_active ? 'success' : 'danger'}>{r.is_active ? 'Aktif' : 'Nonaktif'}</Badge> },
    { key: 'id', label: 'Aksi', render: (r: EdomKuisioner) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(r)} className="p-1 text-indigo-500 hover:text-indigo-600 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => handleDelete(r.id)} className="p-1 text-red-500 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah</button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} error={error} onRefresh={fetchData} />
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Kuisioner' : 'Tambah Kuisioner'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Pertanyaan</label>
            <textarea required value={form.pertanyaan} onChange={(e) => setForm({ ...form, pertanyaan: e.target.value })} className="input-field min-h-[100px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Aspek</label>
              <select value={form.aspek} onChange={(e) => setForm({ ...form, aspek: e.target.value })} className="input-field">
                {aspekList.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Urutan</label>
              <input type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 1 })} className="input-field" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-indigo-600" />
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Aktif</span>
          </label>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
    </div>
  );
}

function PeriodeTab() {
  const [data, setData] = useState<EdomPeriode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<EdomPeriode | null>(null);
  const [form, setForm] = useState({ nama: '', semester: 'Ganjil', tahun_akademik: '2025/2026', tanggal_mulai: '', tanggal_selesai: '' });
  const [jadwalModal, setJadwalModal] = useState(false);
  const [selectedPeriode, setSelectedPeriode] = useState<EdomPeriode | null>(null);
  const [jadwalList, setJadwalList] = useState<EdomJadwal[]>([]);
  const [allJadwal, setAllJadwal] = useState<any[]>([]);
  const [selectedJadwal, setSelectedJadwal] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get<EdomPeriode[]>('/akademik/edom/periode');
      setData(Array.isArray(res) ? res : []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEdit(null);
    setForm({ nama: '', semester: 'Ganjil', tahun_akademik: '2025/2026', tanggal_mulai: '', tanggal_selesai: '' });
    setModal(true);
  };

  const openEdit = (r: EdomPeriode) => {
    setEdit(r);
    setForm({ nama: r.nama, semester: r.semester, tahun_akademik: r.tahun_akademik, tanggal_mulai: r.tanggal_mulai?.slice(0, 10) || '', tanggal_selesai: r.tanggal_selesai?.slice(0, 10) || '' });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (edit) await put(`/akademik/edom/periode/${edit.id}`, form);
      else await post('/akademik/edom/periode', form);
      setModal(false);
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus periode ini?')) return;
    try { await del(`/akademik/edom/periode/${id}`); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const handleAktifkan = async (id: string) => {
    try { await post(`/akademik/edom/periode/${id}/aktifkan`); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const openJadwal = async (p: EdomPeriode) => {
    setSelectedPeriode(p);
    setJadwalModal(true);
    setSelectedJadwal('');
    try {
      const [jadwalRes, allRes] = await Promise.all([
        get<EdomJadwal[]>(`/akademik/edom/jadwal/${p.id}`),
        get<any>('/akademik/jadwal?limit=500'),
      ]);
      setJadwalList(Array.isArray(jadwalRes) ? jadwalRes : []);
      setAllJadwal(allRes.rows || (Array.isArray(allRes) ? allRes : []));
    } catch { setJadwalList([]); setAllJadwal([]); }
  };

  const addJadwal = async () => {
    if (!selectedJadwal || !selectedPeriode) return;
    try {
      await post('/akademik/edom/jadwal', { periode_id: selectedPeriode.id, jadwal_id: selectedJadwal });
      setSelectedJadwal('');
      const res = await get<EdomJadwal[]>(`/akademik/edom/jadwal/${selectedPeriode.id}`);
      setJadwalList(Array.isArray(res) ? res : []);
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const removeJadwal = async (id: string) => {
    if (!confirm('Yakin ingin menghapus jadwal ini dari periode?')) return;
    try {
      await del(`/akademik/edom/jadwal/${id}`);
      setJadwalList((prev) => prev.filter((j) => j.id !== id));
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const columns = [
    { key: 'nama', label: 'Nama', render: (r: EdomPeriode) => <span className="dark:text-white font-medium">{r.nama}</span> },
    { key: 'semester', label: 'Semester' },
    { key: 'tahun_akademik', label: 'TA' },
    { key: 'tanggal_mulai', label: 'Tanggal Mulai', render: (r: EdomPeriode) => r.tanggal_mulai?.slice(0, 10) || '-' },
    { key: 'tanggal_selesai', label: 'Tanggal Selesai', render: (r: EdomPeriode) => r.tanggal_selesai?.slice(0, 10) || '-' },
    { key: 'is_active', label: 'Status', render: (r: EdomPeriode) => <Badge variant={r.is_active ? 'success' : 'default'}>{r.is_active ? 'Aktif' : 'Nonaktif'}</Badge> },
    { key: 'id', label: 'Aksi', render: (r: EdomPeriode) => (
      <div className="flex items-center gap-1 flex-wrap">
        {!r.is_active && <button onClick={() => handleAktifkan(r.id)} className="p-1 text-emerald-500 hover:text-emerald-600 transition-colors" title="Aktifkan"><CheckCircle size={14} /></button>}
        <button onClick={() => openEdit(r)} className="p-1 text-indigo-500 hover:text-indigo-600 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => openJadwal(r)} className="p-1 text-sky-500 hover:text-sky-600 transition-colors" title="Atur Jadwal"><Calendar size={14} /></button>
        <button onClick={() => handleDelete(r.id)} className="p-1 text-red-500 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah</button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} error={error} onRefresh={fetchData} />
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Periode' : 'Tambah Periode'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama</label>
            <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Semester</label>
              <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className="input-field">
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
                <option value="Pendek">Pendek</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun Akademik</label>
              <input value={form.tahun_akademik} onChange={(e) => setForm({ ...form, tahun_akademik: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tanggal Mulai</label>
              <input type="date" required value={form.tanggal_mulai} onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tanggal Selesai</label>
              <input type="date" required value={form.tanggal_selesai} onChange={(e) => setForm({ ...form, tanggal_selesai: e.target.value })} className="input-field" />
            </div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
      <Modal open={jadwalModal} onClose={() => setJadwalModal(false)} title={`Atur Jadwal - ${selectedPeriode?.nama || ''}`} size="lg">
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tambah Jadwal</label>
              <select value={selectedJadwal} onChange={(e) => setSelectedJadwal(e.target.value)} className="input-field">
                <option value="">Pilih Jadwal</option>
                {allJadwal.filter((a) => !jadwalList.some((j) => j.jadwal_id === a.id)).map((a) => (
                  <option key={a.id} value={a.id}>{a.mk_nama} - {a.dosen_nama} ({a.hari})</option>
                ))}
              </select>
            </div>
            <button onClick={addJadwal} disabled={!selectedJadwal} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all"><Plus size={14} /></button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {jadwalList.length === 0 ? <p className="text-sm text-slate-400 text-center py-6">Belum ada jadwal</p> : jadwalList.map((j) => (
              <div key={j.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                <div>
                  <p className="text-sm font-medium dark:text-white">{j.mk_nama || '-'} ({j.mk_kode || '-'})</p>
                  <p className="text-xs text-slate-400">{j.dosen_nama || '-'}</p>
                </div>
                <button onClick={() => removeJadwal(j.id)} className="p-1 text-red-500 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function IsiEvaluasiTab() {
  const { user } = useAuth();
  const [mahasiswaData, setMahasiswaData] = useState<any>(null);
  const [activePeriode, setActivePeriode] = useState<EdomPeriode | null>(null);
  const [jadwalList, setJadwalList] = useState<EdomJadwal[]>([]);
  const [krsList, setKrsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluasiModal, setEvaluasiModal] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<EdomJadwal | null>(null);
  const [questions, setQuestions] = useState<EdomKuisioner[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [saran, setSaran] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedJadwal, setCompletedJadwal] = useState<Set<string>>(new Set());
  const [alreadyFilled, setAlreadyFilled] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const mhs = await get<any>('/akademik/krs/me');
        setMahasiswaData(mhs);

        const [periodeRes, krsRes] = await Promise.all([
          get<EdomPeriode[]>('/akademik/edom/periode').catch(() => []),
          get<any>(`/akademik/krs?mahasiswa_id=${mhs.mahasiswa_id}&limit=200`).catch(() => ({ rows: [] })),
        ]);

        const periodeList = Array.isArray(periodeRes) ? periodeRes : [];
        const active = periodeList.find((p) => p.is_active);
        setActivePeriode(active || null);

        const krsRows = krsRes.rows || (Array.isArray(krsRes) ? krsRes : []);
        setKrsList(krsRows);

        if (active) {
          const jadwalRes = await get<EdomJadwal[]>(`/akademik/edom/jadwal/${active.id}`).catch(() => []);
          const jadwalArr = Array.isArray(jadwalRes) ? jadwalRes : [];
          setJadwalList(jadwalArr);

          const filledRes = await get<EdomJawaban[]>(`/akademik/edom/jawaban/${jadwalArr[0]?.id || 'x'}/${mhs.mahasiswa_id}`).catch(() => []);
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const openEvaluasi = async (j: EdomJadwal) => {
    setSelectedJadwal(j);
    setSaran('');
    setRatings({});
    try {
      const qs = await get<EdomKuisioner[]>('/akademik/edom/kuisioner');
      const qArr = Array.isArray(qs) ? qs.filter((q) => q.is_active) : [];
      setQuestions(qArr.sort((a, b) => a.urutan - b.urutan));

      if (mahasiswaData) {
        const jawabanRes = await get<EdomJawaban[]>(`/akademik/edom/jawaban/${j.id}/${mahasiswaData.mahasiswa_id}`).catch(() => []);
        const jawabanArr = Array.isArray(jawabanRes) ? jawabanRes : [];
        if (jawabanArr.length > 0) {
          const map: Record<string, number> = {};
          jawabanArr.forEach((jb) => { if (jb.kuisioner_id) map[jb.kuisioner_id] = jb.nilai; });
          setRatings(map);
          const s = jawabanArr.find((jb) => jb.saran);
          if (s?.saran) setSaran(s.saran);
        }
      }
      setEvaluasiModal(true);
    } catch { setQuestions([]); setEvaluasiModal(true); }
  };

  const submitEvaluasi = async () => {
    if (!selectedJadwal || !mahasiswaData) return;
    setSubmitting(true);
    try {
      for (const q of questions) {
        const nilai = ratings[q.id];
        if (nilai) {
          await post('/akademik/edom/jawaban', {
            edom_jadwal_id: selectedJadwal.id,
            kuisioner_id: q.id,
            mahasiswa_id: mahasiswaData.mahasiswa_id,
            nilai,
            saran: undefined,
          });
        }
      }
      if (saran.trim()) {
        await post('/akademik/edom/jawaban', {
          edom_jadwal_id: selectedJadwal.id,
          kuisioner_id: questions[0]?.id || '',
          mahasiswa_id: mahasiswaData.mahasiswa_id,
          nilai: 0,
          saran: saran.trim(),
        });
      }
      setCompletedJadwal((prev) => new Set(prev).add(selectedJadwal.id));
      setAlreadyFilled((prev) => new Set(prev).add(selectedJadwal.id));
      setEvaluasiModal(false);
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  };

  const enrolledJadwal = jadwalList.filter((j) => krsList.some((k) => k.jadwal_id === j.jadwal_id));

  if (loading) return <div className="flex justify-center py-16 text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /><span className="text-sm font-medium">Memuat data...</span></div>;
  if (!activePeriode) return <div className="text-center py-16 text-slate-400"><p className="text-sm">Belum ada periode evaluasi yang aktif</p></div>;
  if (enrolledJadwal.length === 0) return <div className="text-center py-16 text-slate-400"><p className="text-sm">Tidak ada jadwal yang perlu dievaluasi</p></div>;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
        <p className="text-xs text-slate-500 dark:text-zinc-400">Periode Aktif: <span className="font-semibold text-slate-700 dark:text-zinc-300">{activePeriode.nama}</span></p>
      </div>
      <div className="space-y-2">
        {enrolledJadwal.map((j) => {
          const krs = krsList.find((k) => k.jadwal_id === j.jadwal_id);
          const done = completedJadwal.has(j.id) || alreadyFilled.has(j.id);
          return (
            <div key={j.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900/50 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
              <div>
                <p className="text-sm font-semibold dark:text-white">{j.mk_nama || '-'}</p>
                <p className="text-xs text-slate-400">{j.dosen_nama || '-'} {krs ? `· ${krs.hari || ''} ${krs.jam_mulai?.slice(0, 5) || ''}` : ''}</p>
              </div>
              {done ? (
                <Badge variant="success">Selesai</Badge>
              ) : (
                <button onClick={() => openEvaluasi(j)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><ClipboardCheck size={14} /> Isi Evaluasi</button>
              )}
            </div>
          );
        })}
      </div>
      <Modal open={evaluasiModal} onClose={() => setEvaluasiModal(false)} title={`Evaluasi - ${selectedJadwal?.mk_nama || ''}`} size="lg">
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id}>
              <p className="text-sm font-medium dark:text-white mb-2">{q.pertanyaan}</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button key={v} type="button" onClick={() => setRatings({ ...ratings, [q.id]: v })} className={`p-2 rounded-lg transition-colors ${ratings[q.id] === v ? 'text-amber-400' : 'text-slate-300 dark:text-zinc-600 hover:text-slate-400'}`}>
                    <Star size={24} fill={ratings[q.id] === v ? 'currentColor' : 'none'} />
                  </button>
                ))}
                <span className="text-xs text-slate-400 ml-2">{ratings[q.id] ? `${ratings[q.id]}/5` : ''}</span>
              </div>
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Saran & Kritik</label>
            <textarea value={saran} onChange={(e) => setSaran(e.target.value)} className="input-field min-h-[80px]" placeholder="Tulis saran dan kritik..." />
          </div>
          <button onClick={submitEvaluasi} disabled={submitting} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</> : <><Send size={14} /> Kirim Evaluasi</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function RekapTab() {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === 'admin' || role === 'akademik' || role === 'super_admin';

  const [periodeList, setPeriodeList] = useState<EdomPeriode[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [dosenList, setDosenList] = useState<any[]>([]);
  const [selectedDosenId, setSelectedDosenId] = useState('');
  const [rekapDosen, setRekapDosen] = useState<EdomRekapDosen[]>([]);
  const [ringkasan, setRingkasan] = useState<EdomRingkasan[]>([]);
  const [loadingRekap, setLoadingRekap] = useState(false);
  const [loadingRingkasan, setLoadingRingkasan] = useState(false);
  const [jadwalDosen, setJadwalDosen] = useState<any[]>([]);
  const [selectedJadwalId, setSelectedJadwalId] = useState('');
  const [rekapJadwal, setRekapJadwal] = useState<EdomRekapDosen[]>([]);
  const [loadingJadwal, setLoadingJadwal] = useState(false);

  useEffect(() => {
    get<EdomPeriode[]>('/akademik/edom/periode').then((r) => {
      const arr = Array.isArray(r) ? r : [];
      setPeriodeList(arr);
      if (arr.length > 0) setSelectedPeriodeId(arr[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isAdmin) {
      get<any>('/akademik/dosen?limit=500').then((r) => {
        setDosenList(r.rows || (Array.isArray(r) ? r : []));
      }).catch(() => {});
    } else if (role === 'dosen') {
      get<any>('/akademik/dosen/me').then((r) => {
        setSelectedDosenId(r.id);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!selectedDosenId || !selectedPeriodeId) return;
    setLoadingRekap(true);
    get<EdomRekapDosen[]>(`/akademik/edom/rekap/dosen/${selectedDosenId}?periode_id=${selectedPeriodeId}`).then((r) => {
      setRekapDosen(Array.isArray(r) ? r : []);
    }).catch(() => setRekapDosen([]))
    .finally(() => setLoadingRekap(false));
  }, [selectedDosenId, selectedPeriodeId]);

  useEffect(() => {
    if (!selectedDosenId) return;
    get<any>(`/akademik/jadwal?dosen_id=${selectedDosenId}&limit=200`).then((r) => {
      setJadwalDosen(r.rows || (Array.isArray(r) ? r : []));
    }).catch(() => setJadwalDosen([]));
  }, [selectedDosenId]);

  useEffect(() => {
    if (!selectedJadwalId) { setRekapJadwal([]); return; }
    setLoadingJadwal(true);
    get<EdomRekapDosen[]>(`/akademik/edom/rekap/jadwal/${selectedJadwalId}`).then((r) => {
      setRekapJadwal(Array.isArray(r) ? r : []);
    }).catch(() => setRekapJadwal([]))
    .finally(() => setLoadingJadwal(false));
  }, [selectedJadwalId]);

  const loadRingkasan = async () => {
    if (!selectedPeriodeId) return;
    setLoadingRingkasan(true);
    try {
      const r = await get<EdomRingkasan[]>(`/akademik/edom/rekap/ringkasan/${selectedPeriodeId}`);
      setRingkasan(Array.isArray(r) ? r : []);
    } catch { setRingkasan([]); }
    finally { setLoadingRingkasan(false); }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Periode</label>
          <select value={selectedPeriodeId} onChange={(e) => setSelectedPeriodeId(e.target.value)} className="input-field">
            <option value="">Pilih Periode</option>
            {periodeList.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>
        </div>
        {isAdmin && (
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Dosen</label>
            <select value={selectedDosenId} onChange={(e) => { setSelectedDosenId(e.target.value); setSelectedJadwalId(''); }} className="input-field">
              <option value="">Pilih Dosen</option>
              {dosenList.map((d) => <option key={d.id} value={d.id}>{d.nama}</option>)}
            </select>
          </div>
        )}
        <div className="flex items-end">
          <button onClick={loadRingkasan} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><BarChart3 size={14} /> Ringkasan Periode</button>
        </div>
      </div>

      {ringkasan.length > 0 && (
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
          <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-4 flex items-center gap-2"><BarChart3 size={16} /> Ringkasan Periode</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {ringkasan.map((r) => (
              <div key={r.aspek} className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/50 text-center">
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1">{r.aspek}</p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{r.rata_rata.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400">{r.total_responden} responden</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDosenId && (
        <>
          <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-4 flex items-center gap-2"><Users size={16} /> Rekap Dosen</h3>
            {loadingRekap ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>
            ) : rekapDosen.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Belum ada data rekap</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {rekapDosen.map((r) => (
                  <div key={r.aspek} className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-800/50 text-center">
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1">{r.aspek}</p>
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{r.rata_rata.toFixed(2)}</p>
                    <div className="mt-2 space-y-0.5">
                      <p className="text-[10px] text-slate-400">Jawaban: {r.jumlah_jawaban}</p>
                      <p className="text-[10px] text-slate-400">Responden: {r.total_responden}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-4 flex items-center gap-2"><Search size={16} /> Rekap Jadwal</h3>
            <div className="mb-4">
              <select value={selectedJadwalId} onChange={(e) => setSelectedJadwalId(e.target.value)} className="input-field max-w-md">
                <option value="">Pilih Jadwal</option>
                {jadwalDosen.map((j) => <option key={j.id} value={j.id}>{j.mk_nama} ({j.kelas || '-'}) - {j.hari} {j.jam_mulai?.slice(0, 5)}</option>)}
              </select>
            </div>
            {loadingJadwal ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>
            ) : selectedJadwalId && rekapJadwal.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {rekapJadwal.map((r) => (
                  <div key={r.aspek} className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/50 text-center">
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1">{r.aspek}</p>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{r.rata_rata.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">{r.total_responden} responden</p>
                  </div>
                ))}
              </div>
            ) : selectedJadwalId ? (
              <p className="text-sm text-slate-400 text-center py-4">Belum ada data rekap untuk jadwal ini</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
