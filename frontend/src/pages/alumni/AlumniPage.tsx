import { useState, useEffect, useCallback } from 'react';
import { get, post } from '../../api/client';
import type { AlumniTracer, AlumniStats } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { Send, Plus, RefreshCw } from 'lucide-react';
import { toast } from '../../context/ToastContext';

const roleAccess = ['super_admin', 'admin', 'akademik'];

export default function AlumniPage() {
  const { user } = useAuth();
  const isAdmin = user && roleAccess.includes(user.role);
  const [data, setData] = useState<AlumniTracer[]>([]);
  const [stats, setStats] = useState<AlumniStats | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ tahun_lulus: new Date().getFullYear(), institusi: '', pekerjaan: '', gaji: 5000000, masa_tunggu: 3, kesesuaian: 'Sesuai', kepuasan: 3, saran: '' });

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (isAdmin) {
        const [d, s] = await Promise.all([get<AlumniTracer[]>('/alumni'), get<AlumniStats>('/alumni/stats')]);
        setData(d || []); setStats(s || null);
      } else {
        const s = await get<AlumniStats>('/alumni/stats');
        setStats(s || null);
      }
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }, [isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await post('/alumni/tracer', form); setModal(false); fetchData(); setForm({ tahun_lulus: new Date().getFullYear(), institusi: '', pekerjaan: '', gaji: 5000000, masa_tunggu: 3, kesesuaian: 'Sesuai', kepuasan: 3, saran: '' }); }
    catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); }
  };

  const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const columns = [
    { key: 'nim', label: 'NIM' }, { key: 'nama', label: 'Nama' },
    { key: 'tahun_lulus', label: 'Tahun Lulus' },
    { key: 'institusi', label: 'Institusi' }, { key: 'pekerjaan', label: 'Pekerjaan' },
    { key: 'gaji', label: 'Gaji', render: (r: AlumniTracer) => r.gaji ? rupiah(r.gaji) : '-' },
    { key: 'masa_tunggu', label: 'Masa Tunggu', render: (r: AlumniTracer) => r.masa_tunggu ? `${r.masa_tunggu} bln` : '-' },
    { key: 'kesesuaian', label: 'Kesesuaian' },
    { key: 'kepuasan', label: 'Kepuasan', render: (r: AlumniTracer) => r.kepuasan ? '★'.repeat(r.kepuasan) : '-' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Alumni Tracer Study</h1>
        <div className="flex gap-2">
          {!isAdmin && <button onClick={() => setModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Isi Tracer</button>}
          <button onClick={fetchData} className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500"><RefreshCw size={16} /></button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Total Responden</p>
            <p className="text-xl font-extrabold dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Rata-rata Gaji</p>
            <p className="text-xl font-extrabold text-emerald-500">{stats.avgGaji ? rupiah(stats.avgGaji) : '-'}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Masa Tunggu</p>
            <p className="text-xl font-extrabold text-indigo-500">{stats.avgMasaTunggu} bln</p>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Kesesuaian Tertinggi</p>
            <p className="text-xl font-extrabold dark:text-white">{stats.kesesuaian?.[0]?.kesesuaian || '-'}</p>
          </div>
        </div>
      )}

      {isAdmin && (
        <DataTable columns={columns} data={data} loading={loading} error={error} onRefresh={fetchData} emptyMessage="Belum ada data tracer" />
      )}

      {!isAdmin && !loading && (
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-6 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 text-center">
          <p className="text-sm text-slate-500 dark:text-zinc-400">Isi tracer study untuk membantu pengembangan kurikulum.</p>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Isi Tracer Study" size="lg">
        <form onSubmit={submit} className="space-y-3">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun Lulus</label><input type="number" value={form.tahun_lulus} onChange={(e) => setForm({ ...form, tahun_lulus: parseInt(e.target.value) || 2025 })} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Institusi</label><input value={form.institusi} onChange={(e) => setForm({ ...form, institusi: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Pekerjaan</label><input value={form.pekerjaan} onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Gaji</label><input type="number" value={form.gaji} onChange={(e) => setForm({ ...form, gaji: parseInt(e.target.value) || 0 })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Masa Tunggu (bulan)</label><input type="number" value={form.masa_tunggu} onChange={(e) => setForm({ ...form, masa_tunggu: parseInt(e.target.value) || 0 })} className="input-field" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Kesesuaian</label><select value={form.kesesuaian} onChange={(e) => setForm({ ...form, kesesuaian: e.target.value })} className="input-field"><option>Sangat Sesuai</option><option>Sesuai</option><option>Cukup Sesuai</option><option>Kurang Sesuai</option><option>Tidak Sesuai</option></select></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Kepuasan (1-5)</label><input type="number" min={1} max={5} value={form.kepuasan} onChange={(e) => setForm({ ...form, kepuasan: parseInt(e.target.value) || 3 })} className="input-field" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Saran</label><textarea rows={3} value={form.saran} onChange={(e) => setForm({ ...form, saran: e.target.value })} className="input-field" /></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"><Send size={16} /> Kirim</button>
        </form>
      </Modal>
    </div>
  );
}
