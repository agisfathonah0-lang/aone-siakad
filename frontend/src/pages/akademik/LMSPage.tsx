import { useState, useEffect, useCallback } from 'react';
import { get, put, post } from '../../api/client';
import { getPaginated } from '../../api/client';
import type { LmsConfig, LmsSyncLog } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { Settings, Save, RefreshCw, Database, Loader2 } from 'lucide-react';

export default function LMSPage() {
  const [config, setConfig] = useState<LmsConfig>({ platform: 'moodle', base_url: '', api_token: '', sync_mahasiswa: false, sync_nilai: false, sync_jadwal: false, is_active: false });
  const [logs, setLogs] = useState<LmsSyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [filterEntity, setFilterEntity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchConfig = useCallback(async () => {
    try {
      const data = await get<LmsConfig>('/akademik/lms/config');
      if (data) setConfig(data);
    } catch { }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      let url = `/akademik/lms/sync/log?page=${page}&limit=20`;
      if (filterEntity) url += `&entity_type=${filterEntity}`;
      if (filterStatus) url += `&status=${filterStatus}`;
      const result = await getPaginated<LmsSyncLog>(url);
      setLogs(result.rows);
      setTotalPages(result.pagination.totalPages);
    } catch { }
  }, [page, filterEntity, filterStatus]);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await put<LmsConfig>('/akademik/lms/config', config);
      setConfig(data);
    } catch { }
    finally { setSaving(false); }
  };

  const handleSync = async (entity: string) => {
    setSyncing(entity);
    try {
      await post(`/akademik/lms/sync/${entity}`);
      fetchLogs();
    } catch { }
    finally { setSyncing(null); }
  };

  const statusBadge: Record<string, 'success' | 'danger' | 'warning'> = { success: 'success', failed: 'danger' };

  const columns = [
    { key: 'entity_type', label: 'Entity Type', render: (r: LmsSyncLog) => <Badge variant="default">{r.entity_type}</Badge> },
    { key: 'action', label: 'Action' },
    { key: 'status', label: 'Status', render: (r: LmsSyncLog) => <Badge variant={statusBadge[r.status] || 'default'}>{r.status}</Badge> },
    { key: 'records_count', label: 'Records Count' },
    { key: 'error_message', label: 'Error Message', render: (r: LmsSyncLog) => r.error_message || '-' },
    { key: 'created_at', label: 'Timestamp', render: (r: LmsSyncLog) => new Date(r.created_at).toLocaleString('id') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Integrasi LMS</h1>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-6 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-emerald-500" />
          <h2 className="text-base font-bold font-display dark:text-white">Konfigurasi LMS</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Platform</label>
            <select value={config.platform} onChange={(e) => setConfig({ ...config, platform: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="moodle">Moodle</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Base URL</label>
            <input type="url" value={config.base_url} onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">API Token</label>
            <input type="password" value={config.api_token || ''} onChange={(e) => setConfig({ ...config, api_token: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!config.sync_mahasiswa} onChange={(e) => setConfig({ ...config, sync_mahasiswa: e.target.checked })}
              className="rounded border-slate-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500" />
            <span className="text-sm dark:text-white">Sync Mahasiswa</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!config.sync_nilai} onChange={(e) => setConfig({ ...config, sync_nilai: e.target.checked })}
              className="rounded border-slate-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500" />
            <span className="text-sm dark:text-white">Sync Nilai</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!config.sync_jadwal} onChange={(e) => setConfig({ ...config, sync_jadwal: e.target.checked })}
              className="rounded border-slate-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500" />
            <span className="text-sm dark:text-white">Sync Jadwal</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!config.is_active} onChange={(e) => setConfig({ ...config, is_active: e.target.checked })}
              className="rounded border-slate-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500" />
            <span className="text-sm dark:text-white">Active</span>
          </label>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 disabled:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/20">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-6 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-emerald-500" />
          <h2 className="text-base font-bold font-display dark:text-white">Sync Log</h2>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button disabled={syncing === 'mahasiswa'} onClick={() => handleSync('mahasiswa')}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20">
            {syncing === 'mahasiswa' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Sync Mahasiswa
          </button>
          <button disabled={syncing === 'nilai'} onClick={() => handleSync('nilai')}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20">
            {syncing === 'nilai' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Sync Nilai
          </button>
          <button disabled={syncing === 'jadwal'} onClick={() => handleSync('jadwal')}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20">
            {syncing === 'jadwal' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Sync Jadwal
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={filterEntity} onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Entity</option>
            <option value="mahasiswa">Mahasiswa</option>
            <option value="nilai">Nilai</option>
            <option value="jadwal">Jadwal</option>
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <DataTable columns={columns} data={logs} loading={false} page={page} totalPages={totalPages}
          onPageChange={setPage} emptyMessage="Belum ada sync log" />
      </div>
    </div>
  );
}
