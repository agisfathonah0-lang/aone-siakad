import { useState, useEffect, useCallback } from 'react';
import { getPaginated, put, post } from '../../api/client';
import type { Nilai } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Calculator, Printer, Search, RefreshCw } from 'lucide-react';

const nilaiHurufColor: Record<string, string> = { A: 'success', 'A-': 'success', 'B+': 'info', B: 'info', 'B-': 'info', 'C+': 'warning', C: 'warning', D: 'danger', E: 'danger' };

const tahunAkademikList = ['2025/2026', '2024/2025', '2023/2024', '2022/2023'];
const semesterList = ['Ganjil', 'Genap', 'Pendek'];

export default function NilaiPage() {
  const [data, setData] = useState<Nilai[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false); const [editItem, setEditItem] = useState<Nilai | null>(null);
  const [form, setForm] = useState({ nilai_tugas: 0, nilai_uts: 0, nilai_uas: 0, bobot_tugas: 30, bobot_uts: 30, bobot_uas: 40 });

  const [jadwalList, setJadwalList] = useState<any[]>([]);
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [mahasiswaList, setMahasiswaList] = useState<any[]>([]);
  const [jadwalFilter, setJadwalFilter] = useState('');
  const [prodiFilter, setProdiFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [taFilter, setTaFilter] = useState('');
  const [mahasiswaFilter, setMahasiswaFilter] = useState('');
  const [kalkulasiLoading, setKalkulasiLoading] = useState(false);

  const fetchProdi = useCallback(async () => {
    try { const res = await getPaginated<any>('/akademik/prodi?page=1&limit=100'); setProdiList(res.rows); }
    catch { /* ignore */ }
  }, []);

  const fetchMahasiswa = useCallback(async () => {
    try { const res = await getPaginated<any>('/akademik/mahasiswa?page=1&limit=500'); setMahasiswaList(res.rows); }
    catch { /* ignore */ }
  }, []);

  const fetchJadwal = useCallback(async () => {
    try {
      let url = '/akademik/jadwal?page=1&limit=500';
      if (prodiFilter) url += `&program_studi_id=${prodiFilter}`;
      if (semesterFilter) url += `&semester=${semesterFilter}`;
      if (taFilter) url += `&tahun_akademik=${taFilter}`;
      const res = await getPaginated<any>(url);
      setJadwalList(res.rows || []);
    } catch { setJadwalList([]); }
  }, [prodiFilter, semesterFilter, taFilter]);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let url = `/akademik/nilai?page=${page}`;
      if (jadwalFilter) url += `&jadwal_id=${jadwalFilter}`;
      if (mahasiswaFilter) url += `&mahasiswa_id=${mahasiswaFilter}`;
      const res = await getPaginated<Nilai>(url);
      setData(res.rows || []);
      setTotalPages(res.pagination?.totalPages || 1);
    }
    catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }, [page, jadwalFilter, mahasiswaFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchJadwal(); }, [fetchJadwal]);
  useEffect(() => { fetchProdi(); }, [fetchProdi]);
  useEffect(() => { fetchMahasiswa(); }, [fetchMahasiswa]);

  const openEdit = (r: Nilai) => {
    setEditItem(r);
    setForm({
      nilai_tugas: r.nilai_tugas || 0,
      nilai_uts: r.nilai_uts || 0,
      nilai_uas: r.nilai_uas || 0,
      bobot_tugas: r.bobot_tugas != null ? r.bobot_tugas * 100 : 30,
      bobot_uts: r.bobot_uts != null ? r.bobot_uts * 100 : 30,
      bobot_uas: r.bobot_uas != null ? r.bobot_uas * 100 : 40,
    });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      await put(`/akademik/nilai/${editItem.id}`, {
        nilai_tugas: form.nilai_tugas,
        nilai_uts: form.nilai_uts,
        nilai_uas: form.nilai_uas,
        bobot_tugas: form.bobot_tugas / 100,
        bobot_uts: form.bobot_uts / 100,
        bobot_uas: form.bobot_uas / 100,
      });
      setModal(false); fetchData();
    }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const handleKalkulasiBatch = async () => {
    if (!jadwalFilter) { alert('Pilih jadwal terlebih dahulu'); return; }
    if (!confirm('Kalkulasi ulang semua nilai untuk jadwal ini?')) return;
    setKalkulasiLoading(true);
    try {
      const res = await post<{ updated: number }>(`/akademik/nilai/kalkulasi/${jadwalFilter}`);
      alert(`${res.updated} nilai berhasil dikalkulasi`);
      fetchData();
    }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setKalkulasiLoading(false); }
  };

  const columns = [
    { key: 'nim', label: 'NIM' }, { key: 'mahasiswa_nama', label: 'Mahasiswa' },
    { key: 'mk_nama', label: 'MK' }, { key: 'mk_kode', label: 'Kode' }, { key: 'sks', label: 'SKS' },
    { key: 'nilai_tugas', label: 'Tugas' }, { key: 'nilai_uts', label: 'UTS' }, { key: 'nilai_uas', label: 'UAS' },
    { key: 'nilai_akhir', label: 'Akhir', render: (r: Nilai) => r.nilai_akhir?.toFixed(2) ?? '-' },
    { key: 'nilai_huruf', label: 'Huruf', render: (r: Nilai) => r.nilai_huruf ? <Badge variant={(nilaiHurufColor[r.nilai_huruf] as any) || 'default'}>{r.nilai_huruf}</Badge> : '-' },
    { key: 'id', label: '', render: (r: Nilai) => <button onClick={() => openEdit(r)} className="text-indigo-500 hover:underline text-xs font-bold">Input</button> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Nilai</h1>
        <div className="flex items-center gap-2">
          {jadwalFilter && (
            <button onClick={handleKalkulasiBatch} disabled={kalkulasiLoading} className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20">
              <Calculator size={14} /> {kalkulasiLoading ? 'Mengkalkulasi...' : 'Kalkulasi Batch'}
            </button>
          )}
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20">
            <Printer size={14} /> Cetak KHS
          </button>
          <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><RefreshCw size={16} /></button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select value={prodiFilter} onChange={(e) => { setPage(1); setJadwalFilter(''); setProdiFilter(e.target.value); }} className="input-field max-w-[180px] text-sm">
          <option value="">Semua Prodi</option>
          {prodiList.map((p: any) => <option key={p.id} value={p.id}>{p.jenjang} - {p.nama}</option>)}
        </select>
        <select value={semesterFilter} onChange={(e) => { setPage(1); setJadwalFilter(''); setSemesterFilter(e.target.value); }} className="input-field max-w-[130px] text-sm">
          <option value="">Semester</option>
          {semesterList.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={taFilter} onChange={(e) => { setPage(1); setJadwalFilter(''); setTaFilter(e.target.value); }} className="input-field max-w-[150px] text-sm">
          <option value="">Tahun Akademik</option>
          {tahunAkademikList.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={jadwalFilter} onChange={(e) => { setPage(1); setJadwalFilter(e.target.value); }} className="input-field flex-1 min-w-[200px] text-sm">
          <option value="">Semua Jadwal</option>
          {jadwalList.map((j: any) => <option key={j.id} value={j.id}>{j.mk_nama} ({j.mk_kode}) - {j.dosen_nama}</option>)}
        </select>
        <div className="relative flex-1 max-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <select value={mahasiswaFilter} onChange={(e) => { setPage(1); setMahasiswaFilter(e.target.value); }} className="input-field pl-8 text-sm">
            <option value="">Semua Mahasiswa</option>
            {mahasiswaList.map((m: any) => <option key={m.id} value={m.id}>{m.nim} - {m.nama}</option>)}
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />

      <Modal open={modal} onClose={() => setModal(false)} title="Input Nilai">
        <form onSubmit={save} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nilai Tugas</label><input type="number" step="0.01" value={form.nilai_tugas} onChange={(e) => setForm({ ...form, nilai_tugas: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nilai UTS</label><input type="number" step="0.01" value={form.nilai_uts} onChange={(e) => setForm({ ...form, nilai_uts: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nilai UAS</label><input type="number" step="0.01" value={form.nilai_uas} onChange={(e) => setForm({ ...form, nilai_uas: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
          </div>
          <div className="border-t border-slate-200 dark:border-zinc-700 pt-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-2">Bobot (%)</p>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Bobot Tugas</label><input type="number" min="0" max="100" step="1" value={form.bobot_tugas} onChange={(e) => setForm({ ...form, bobot_tugas: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
              <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Bobot UTS</label><input type="number" min="0" max="100" step="1" value={form.bobot_uts} onChange={(e) => setForm({ ...form, bobot_uts: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
              <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Bobot UAS</label><input type="number" min="0" max="100" step="1" value={form.bobot_uas} onChange={(e) => setForm({ ...form, bobot_uas: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
            </div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Simpan</button>
        </form>
      </Modal>
    </div>
  );
}
