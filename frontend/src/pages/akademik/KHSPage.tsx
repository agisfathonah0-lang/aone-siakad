import { useState, useEffect } from 'react';
import { get } from '../../api/client';
import { Loader2, GraduationCap, BookOpen, SearchX, FileQuestion } from 'lucide-react';

interface MataKuliah {
  kode: string; mk_nama: string; sks: number;
  nilai_tugas: number | null; nilai_uts: number | null; nilai_uas: number | null;
  nilai_akhir: number | null; nilai_huruf: string | null;
}

interface SemesterData {
  tahunAkademik: string; semester: string;
  mataKuliah: MataKuliah[]; totalSks: number; ip: number;
  ipKumulatif: number; totalSksKumulatif: number;
}

export default function KHSPage() {
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [ipk, setIpk] = useState(0);
  const [totalSks, setTotalSks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const data = await get<{ semesters: SemesterData[]; ipk: number; totalSks: number }>('/akademik/nilai/khs');
      setSemesters(data.semesters || []);
      setIpk(data.ipk || 0);
      setTotalSks(data.totalSks || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const nilaiWarna = (h: string | null) => {
    if (!h) return 'text-slate-400';
    if (h === 'A' || h === 'A-') return 'text-emerald-600 dark:text-emerald-400';
    if (h === 'B+' || h === 'B' || h === 'B-') return 'text-blue-600 dark:text-blue-400';
    if (h === 'C+' || h === 'C') return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /><span className="text-sm font-medium">Memuat KHS...</span></div>;

  const noData = error?.toLowerCase().includes('tidak ditemukan') || error?.toLowerCase().includes('belum ada') || error?.toLowerCase().includes('no data');

  if (error && noData) return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Kartu Hasil Studi</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Belum Ada Data KHS</p>
        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 text-center max-w-xs">Data Kartu Hasil Studi belum tersedia. Hubungi bagian akademik untuk informasi lebih lanjut.</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Kartu Hasil Studi</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-20 text-red-400">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
          <FileQuestion className="w-8 h-8 text-red-300 dark:text-red-500" />
        </div>
        <p className="text-sm font-semibold text-red-500">Gagal Memuat KHS</p>
        <p className="text-xs mt-1 text-slate-400 dark:text-zinc-500">{error}</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all">Coba Lagi</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Kartu Hasil Studi</h1>
        <button onClick={fetchData} className="text-xs text-indigo-500 hover:underline">Refresh</button>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            <div>
              <p className="text-xs text-slate-400 dark:text-zinc-500">IPK</p>
              <p className="text-3xl font-bold font-display tracking-tight text-indigo-600 dark:text-indigo-400">{ipk}</p>
            </div>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-zinc-700" />
          <div>
            <p className="text-xs text-slate-400 dark:text-zinc-500">Total SKS</p>
            <p className="text-3xl font-bold font-display tracking-tight text-slate-700 dark:text-zinc-300">{totalSks}</p>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-zinc-700" />
          <div>
            <p className="text-xs text-slate-400 dark:text-zinc-500">Semester</p>
            <p className="text-3xl font-bold font-display tracking-tight text-slate-700 dark:text-zinc-300">{semesters.length}</p>
          </div>
        </div>
      </div>

      {semesters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Belum Ada Data KHS</p>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 text-center max-w-xs">Belum ada data Kartu Hasil Studi yang tersimpan. Silakan hubungi bagian akademik jika ini seharusnya sudah tersedia.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {semesters.map((sem) => (
            <div key={`${sem.tahunAkademik}-${sem.semester}`} className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800/30">
                <div>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">
                    Semester {sem.semester} - {sem.tahunAkademik}
                  </p>
                  <p className="text-sm font-bold dark:text-white mt-0.5">
                    IP: {sem.ip} &middot; SKS: {sem.totalSks} &middot; IPK: {sem.ipKumulatif}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-zinc-800/30">
                      <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Kode</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Mata Kuliah</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider w-14">SKS</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider w-16">Tugas</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider w-16">UTS</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider w-16">UAS</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider w-16">Akhir</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider w-16">Huruf</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 dark:divide-zinc-800/20">
                    {sem.mataKuliah.map((mk, i) => (
                      <tr key={i} className="transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/30">
                        <td className="px-4 py-2.5 text-xs text-slate-500 dark:text-zinc-400">{mk.kode}</td>
                        <td className="px-4 py-2.5 text-sm font-medium dark:text-white">{mk.mk_nama}</td>
                        <td className="px-4 py-2.5 text-center text-sm dark:text-white">{mk.sks}</td>
                        <td className="px-4 py-2.5 text-center text-sm dark:text-white">{mk.nilai_tugas ?? '-'}</td>
                        <td className="px-4 py-2.5 text-center text-sm dark:text-white">{mk.nilai_uts ?? '-'}</td>
                        <td className="px-4 py-2.5 text-center text-sm dark:text-white">{mk.nilai_uas ?? '-'}</td>
                        <td className="px-4 py-2.5 text-center text-sm font-semibold dark:text-white">{mk.nilai_akhir ?? '-'}</td>
                        <td className={`px-4 py-2.5 text-center text-sm font-bold ${nilaiWarna(mk.nilai_huruf)}`}>{mk.nilai_huruf || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
