import { useState, Fragment } from 'react';
import { get } from '../../api/client';
import api from '../../api/client';
import { Search, Loader2, Printer } from 'lucide-react';
import { toast } from '../../context/ToastContext';

interface TranscriptItem {
  kode: string;
  mk_nama: string;
  sks: number;
  nilai_akhir: number | null;
  nilai_huruf: string | null;
  semester: string;
  tahun_akademik: string;
  status: string;
}

interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  prodi_nama?: string;
}

export default function TranscriptPage() {
  const [searchMhs, setSearchMhs] = useState('');
  const [mhsList, setMhsList] = useState<Mahasiswa[]>([]);
  const [selected, setSelected] = useState<Mahasiswa | null>(null);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [ipk, setIpk] = useState(0);
  const [totalSks, setTotalSks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  async function searchMahasiswa() {
    if (!searchMhs) return;
    setSearching(true);
    try {
      const d = await get<any>(`/akademik/mahasiswa?q=${searchMhs}&limit=10`);
      setMhsList(d.rows || []);
    } finally { setSearching(false); }
  }

  async function loadTranscript(m: Mahasiswa) {
    setSelected(m);
    setLoading(true);
    try {
      const d = await get<any>(`/akademik/krs/transcript/${m.id}`);
      setTranscript(d.rows || []);
      setIpk(d.ipk || 0);
      setTotalSks(d.totalSks || 0);
    } finally { setLoading(false); }
  }

  const grouped = transcript.reduce((acc: Record<string, TranscriptItem[]>, item) => {
    const key = `${item.tahun_akademik} - ${item.semester}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const [loadingCetak, setLoadingCetak] = useState(false);

  async function handleCetakTranskrip() {
    if (!selected) return;
    setLoadingCetak(true);
    try {
      const response = await api.get(`/akademik/cetak/transkrip/${selected.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
    } catch (err: any) {
      toast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoadingCetak(false);
    }
  }

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Transkrip Nilai</h1><p className="text-xs text-slate-500 dark:text-zinc-500">Lihat dan cetak transkrip akademik mahasiswa</p></div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 max-w-lg">
        <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Cari Mahasiswa (NIM/Nama)</label>
        <div className="flex gap-2">
          <input value={searchMhs} onChange={e => setSearchMhs(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchMahasiswa()} placeholder="20241001 atau nama..." className="input-field flex-1" />
          <button onClick={searchMahasiswa} disabled={searching} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"><Search size={16} /></button>
        </div>
        {mhsList.length > 0 && (
          <div className="mt-2 space-y-1">
            {mhsList.map(m => (
              <button key={m.id} onClick={() => loadTranscript(m)} className={`w-full text-left p-2.5 rounded-xl shadow-sm ring-1 text-sm hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition dark:text-zinc-300 ${selected?.id === m.id ? 'ring-indigo-300 dark:ring-indigo-700 bg-indigo-50 dark:bg-indigo-900/20' : 'ring-slate-200/50 dark:ring-zinc-800/30'}`}>
                <span className="font-semibold">{m.nama}</span>
                <span className="text-xs text-slate-400 dark:text-zinc-500 ml-2">{m.nim} &middot; {m.prodi_nama}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>}

      {selected && !loading && (
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800/30 flex items-center justify-between">
            <div>
              <h2 className="font-bold dark:text-white">{selected.nama}</h2>
              <p className="text-xs text-slate-400 dark:text-zinc-500">{selected.nim} &middot; {selected.prodi_nama}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{ipk}</p>
                <p className="text-xs text-slate-400 dark:text-zinc-500">IPK &middot; {totalSks} SKS</p>
              </div>
              <button
                onClick={handleCetakTranskrip}
                disabled={loadingCetak}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                {loadingCetak ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
                {loadingCetak ? 'Mencetak...' : 'Cetak PDF'}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold">
                <tr><th className="p-3 text-left">Kode</th><th className="p-3 text-left">Mata Kuliah</th><th className="p-3 text-center">SKS</th><th className="p-3 text-center">Nilai</th><th className="p-3 text-center">Huruf</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/30">
                {Object.entries(grouped).map(([period, items]) => (
                  <Fragment key={period}>
                    <tr className="bg-slate-50/50 dark:bg-zinc-800/50"><td colSpan={5} className="p-2 px-3 text-xs font-bold text-slate-500 dark:text-zinc-400">{period}</td></tr>
                    {items.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                        <td className="p-3 font-mono text-xs dark:text-zinc-300">{item.kode}</td>
                        <td className="p-3 dark:text-zinc-300">{item.mk_nama}</td>
                        <td className="p-3 text-center font-semibold dark:text-zinc-300">{item.sks}</td>
                        <td className="p-3 text-center font-semibold dark:text-zinc-300">{item.nilai_akhir ?? '-'}</td>
                        <td className="p-3 text-center"><span className={`text-xs font-bold px-2 py-0.5 rounded ${!item.nilai_huruf ? 'text-slate-400 dark:text-zinc-500' : ['A', 'A-', 'B+', 'B'].includes(item.nilai_huruf) ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'}`}>{item.nilai_huruf || '-'}</span></td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
