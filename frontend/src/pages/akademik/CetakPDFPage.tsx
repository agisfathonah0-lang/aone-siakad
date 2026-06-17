import { useState, useEffect } from 'react';
import { get } from '../../api/client';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../context/ToastContext';
import { Printer, Search, Loader2, FileText, Calendar } from 'lucide-react';
import type { Mahasiswa } from '../../types';

const tahunAkademikList = ['2025/2026', '2024/2025', '2023/2024', '2022/2023'];
const semesterList = ['Ganjil', 'Genap', 'Pendek'];

type Tab = 'khs' | 'krs' | 'transkrip';

export default function CetakPDFPage() {
  const { user } = useAuth();
  const role = user?.role;
  const isMahasiswa = role === 'mahasiswa';

  const [tab, setTab] = useState<Tab>('khs');
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState('');
  const [mahasiswaInfo, setMahasiswaInfo] = useState<{ nim: string; nama: string } | null>(null);
  const [semester, setSemester] = useState('Ganjil');
  const [tahunAkademik, setTahunAkademik] = useState('2025/2026');
  const [loadingCetak, setLoadingCetak] = useState(false);

  useEffect(() => {
    if (isMahasiswa) {
      get<{ mahasiswa_id: string; nim: string; nama: string }>('/akademik/krs/me').then(r => {
        setSelectedMahasiswa(r.mahasiswa_id);
        setMahasiswaInfo({ nim: r.nim, nama: r.nama });
      }).catch(() => {});
    } else {
      get<{ rows: Mahasiswa[] }>('/akademik/mahasiswa?limit=500').then(r => {
        setMahasiswaList(r.rows || []);
      }).catch(() => {});
    }
  }, []);

  const handleCetak = async (endpoint: string) => {
    if (!selectedMahasiswa) return;
    setLoadingCetak(true);
    try {
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
    } catch (err: any) {
      toast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoadingCetak(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: 'khs', label: 'KHS', icon: FileText },
    { key: 'krs', label: 'KRS', icon: Calendar },
    { key: 'transkrip', label: 'Transkrip', icon: FileText },
  ];

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Cetak Dokumen Akademik</h1><p className="text-xs text-slate-500 dark:text-zinc-500">Cetak KHS, KRS, dan Transkrip Nilai</p></div>

      {!isMahasiswa && (
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 max-w-lg">
          <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Pilih Mahasiswa</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <select
              value={selectedMahasiswa}
              onChange={e => setSelectedMahasiswa(e.target.value)}
              className="input-field pl-9 text-sm"
            >
              <option value="">-- Pilih Mahasiswa --</option>
              {mahasiswaList.map(m => (
                <option key={m.id} value={m.id}>{m.nim} - {m.nama}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      {isMahasiswa && mahasiswaInfo && (
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 max-w-lg">
          <p className="text-sm font-semibold dark:text-white">{mahasiswaInfo.nama}</p>
          <p className="text-xs text-slate-400 dark:text-zinc-500">{mahasiswaInfo.nim}</p>
        </div>
      )}

      <div className="flex gap-1 bg-white dark:bg-zinc-900/50 rounded-xl p-1 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'}`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'khs' && (
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-6 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 max-w-lg space-y-4">
          <h2 className="font-bold dark:text-white mb-2">Cetak Kartu Hasil Studi (KHS)</h2>
          <p className="text-xs text-slate-400 dark:text-zinc-500">Cetak laporan hasil studi per semester</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Semester (opsional)</label>
              <select value={semester} onChange={e => setSemester(e.target.value)} className="input-field text-sm">
                {semesterList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun Akademik (opsional)</label>
              <select value={tahunAkademik} onChange={e => setTahunAkademik(e.target.value)} className="input-field text-sm">
                {tahunAkademikList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleCetak(`/akademik/cetak/khs/${selectedMahasiswa}`)}
              disabled={!selectedMahasiswa || loadingCetak}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              {loadingCetak ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
              {loadingCetak ? 'Mencetak...' : 'Cetak Semua'}
            </button>
            <button
              onClick={() => handleCetak(`/akademik/cetak/khs/${selectedMahasiswa}?semester=${semester}&tahun_akademik=${tahunAkademik}`)}
              disabled={!selectedMahasiswa || loadingCetak}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              {loadingCetak ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
              {loadingCetak ? 'Mencetak...' : 'Cetak Per Semester'}
            </button>
          </div>
        </div>
      )}

      {tab === 'krs' && (
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-6 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 max-w-lg space-y-4">
          <h2 className="font-bold dark:text-white">Cetak Kartu Rencana Studi (KRS)</h2>
          <p className="text-xs text-slate-400 dark:text-zinc-500">Cetak rencana studi per semester</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Semester</label>
              <select value={semester} onChange={e => setSemester(e.target.value)} className="input-field text-sm">
                {semesterList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun Akademik</label>
              <select value={tahunAkademik} onChange={e => setTahunAkademik(e.target.value)} className="input-field text-sm">
                {tahunAkademikList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={() => handleCetak(`/akademik/cetak/krs/${selectedMahasiswa}?semester=${semester}&tahun_akademik=${tahunAkademik}`)}
            disabled={!selectedMahasiswa || loadingCetak}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            {loadingCetak ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
            {loadingCetak ? 'Mencetak...' : 'Cetak KRS'}
          </button>
        </div>
      )}

      {tab === 'transkrip' && (
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-6 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 max-w-lg">
          <h2 className="font-bold dark:text-white mb-2">Cetak Transkrip Nilai</h2>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mb-4">Cetak transkrip nilai akademik lengkap</p>
          <button
            onClick={() => handleCetak(`/akademik/cetak/transkrip/${selectedMahasiswa}`)}
            disabled={!selectedMahasiswa || loadingCetak}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            {loadingCetak ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
            {loadingCetak ? 'Mencetak...' : 'Cetak Transkrip'}
          </button>
        </div>
      )}
    </div>
  );
}
