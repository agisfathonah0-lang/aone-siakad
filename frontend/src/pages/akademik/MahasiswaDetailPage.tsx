import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get } from '../../api/client';
import { ArrowLeft, Loader2, AlertCircle, BookOpen, GraduationCap } from 'lucide-react';

interface Detail {
  mahasiswa: {
    id: string;
    nim: string;
    nama: string;
    email: string;
    no_hp: string;
    angkatan: number;
    semester: number;
    status: string;
    program_studi_id: string;
    prodi_nama: string;
    prodi_jenjang: string;
    dosen_wali_id: string;
  };
  ipk: number | null;
  krs_count: number;
}

export default function MahasiswaDetailPage() {
  const { nim } = useParams<{ nim: string }>();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    get<Detail>(`/akademik/mahasiswa/${nim}`)
      .then(setDetail)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [nim]);

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /><span className="text-sm font-medium">Memuat...</span></div>;
  if (error) return <div className="flex flex-col items-center justify-center py-20 text-red-400"><AlertCircle className="w-8 h-8 mb-2" /><p className="text-sm font-medium">{error}</p></div>;
  if (!detail) return null;

  const m = detail.mahasiswa;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/mahasiswa" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-indigo-500 transition-colors">
        <ArrowLeft size={14} /> Kembali
      </Link>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 p-6">
        <h1 className="text-lg font-bold font-display tracking-tight dark:text-white">{m.nama}</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">NIM {m.nim}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 p-5 text-center">
          <GraduationCap size={20} className="mx-auto text-indigo-500 mb-1.5" />
          <p className="text-2xl font-bold font-display dark:text-white">{detail.ipk !== null ? detail.ipk.toFixed(2) : '-'}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-500">IPK</p>
        </div>
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 p-5 text-center">
          <BookOpen size={20} className="mx-auto text-emerald-500 mb-1.5" />
          <p className="text-2xl font-bold font-display dark:text-white">{detail.krs_count}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-500">KRS</p>
        </div>
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 p-5 text-center">
          <p className="text-2xl font-bold font-display dark:text-white">{m.semester}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Semester</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 p-6">
        <h2 className="text-sm font-semibold font-display dark:text-white mb-4">Informasi Mahasiswa</h2>
        <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <div><dt className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">NIM</dt><dd className="mt-0.5 dark:text-zinc-200">{m.nim}</dd></div>
          <div><dt className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Nama</dt><dd className="mt-0.5 dark:text-zinc-200">{m.nama}</dd></div>
          <div><dt className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Email</dt><dd className="mt-0.5 dark:text-zinc-200">{m.email || '-'}</dd></div>
          <div><dt className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">No. HP</dt><dd className="mt-0.5 dark:text-zinc-200">{m.no_hp || '-'}</dd></div>
          <div><dt className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Program Studi</dt><dd className="mt-0.5 dark:text-zinc-200">{m.prodi_nama || '-'}</dd></div>
          <div><dt className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Angkatan</dt><dd className="mt-0.5 dark:text-zinc-200">{m.angkatan || '-'}</dd></div>
          <div><dt className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Semester</dt><dd className="mt-0.5 dark:text-zinc-200">{m.semester || '-'}</dd></div>
          <div><dt className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Status</dt><dd className="mt-0.5 dark:text-zinc-200 capitalize">{m.status || '-'}</dd></div>
        </dl>
      </div>
    </div>
  );
}
