import { useState, useEffect, useCallback } from 'react';
import { get, post } from '../../api/client';
import type { SyncRun, SyncStats } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { RefreshCw, Database, Send } from 'lucide-react';

const statusBadge: Record<string, 'success' | 'danger' | 'warning'> = { Sukses: 'success', Gagal: 'danger', Peringatan: 'warning' };

const types = ['Mahasiswa', 'Dosen', 'KRS', 'Nilai'];

export default function PDDIKTIPage() {
  const [data, setData] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [logs, s] = await Promise.all([get<SyncRun[]>('/pddikti'), get<SyncStats>('/pddikti/stats')]);
      setData(logs || []); setStats(s || null);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const triggerSync = async (type: string) => {
    setSyncing(type);
    try { await post('/pddikti/sync', { type }); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setSyncing(null); }
  };

  const columns = [
    { key: 'entity_type', label: 'Tipe' },
    { key: 'records_synced', label: 'Tersinkronisasi' },
    { key: 'records_failed', label: 'Gagal' },
    { key: 'status', label: 'Status', render: (r: SyncRun) => <Badge variant={statusBadge[r.status as keyof typeof statusBadge] || 'default'}>{r.status}</Badge> },
    { key: 'started_at', label: 'Waktu', render: (r: SyncRun) => new Date(r.started_at).toLocaleString('id') },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">PDDIKTI Sync</h1>
        <button onClick={fetchData} className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500"><RefreshCw size={16} /></button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Rasio</p>
            <p className="text-lg font-extrabold text-emerald-500">{stats.ratio}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Total Sync</p>
            <p className="text-lg font-extrabold">{stats.totalLogs}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Sukses</p>
            <p className="text-lg font-extrabold text-emerald-500">{stats.sukses}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Gagal</p>
            <p className="text-lg font-extrabold text-red-500">{stats.gagal}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Record Counts</p>
            <div className="text-[10px] mt-1 space-y-0.5">
              {Object.entries(stats.recordCounts || {}).map(([k, v]) => (
                <div key={k} className="flex justify-between"><span>{k}:</span><span className="font-bold">{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button key={t} disabled={syncing === t} onClick={() => triggerSync(t)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20">
            <Send size={14} /> {syncing === t ? 'Sync...' : `Sync ${t}`}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={data} loading={loading} error={error} onRefresh={fetchData} emptyMessage="Belum ada sync" />
    </div>
  );
}
