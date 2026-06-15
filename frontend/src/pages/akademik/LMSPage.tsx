import { useState, useEffect, useCallback } from 'react';
import { get, put, post } from '../../api/client';
import { getPaginated } from '../../api/client';
import type { LmsConfig, LmsSyncLog } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { Settings, Save, RefreshCw, Database, Loader2, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function LMSPage() {
  const [config, setConfig] = useState<LmsConfig>({ platform: 'moodle', base_url: '', api_token: '', sync_mahasiswa: false, sync_nilai: false, sync_jadwal: false, is_active: false });
  const [logs, setLogs] = useState<LmsSyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ entity: string; synced: number; errors: number; message: string } | null>(null);
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

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await post<{ ok: boolean; message: string }>('/akademik/lms/test-connection');
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ ok: false, message: err.response?.data?.message || err.message });
    } finally { setTesting(false); }
  };

  const handleSync = async (entity: string) => {
    setSyncing(entity);
    setSyncResult(null);
    try {
      const res = await post<{ entity: string; synced: number; errors: number; message: string }>(`/akademik/lms/sync/${entity}`);
      setSyncResult(res);
      fetchLogs();
    } catch (err: any) {
      setSyncResult({ entity, synced: 0, errors: 0, message: err.response?.data?.message || err.message });
    } finally { setSyncing(null); }
  };

  const statusBadge: Record<string, 'success' | 'danger' | 'warning'> = { success: 'success', failed: 'danger' };

  const columns = [
    { key: 'entity_type', label: 'Entity', render: (r: LmsSyncLog) => <Badge variant="info">{r.entity_type}</Badge> },
    { key: 'action', label: 'Action' },
    { key: 'status', label: 'Status', render: (r: LmsSyncLog) => <Badge variant={statusBadge[r.status] || 'default'}>{r.status}</Badge> },
    { key: 'records_count', label: 'Records' },
    { key: 'error_message', label: 'Error', render: (r: LmsSyncLog) => r.error_message ? <span className="text-[10px] text-red-400">{r.error_message}</span> : '-' },
    { key: 'created_at', label: 'Waktu', render: (r: LmsSyncLog) => new Date(r.created_at).toLocaleString('id') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Integrasi LMS Moodle</h1>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-6 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-emerald-500" />
          <h2 className="text-base font-bold font-display dark:text-white">Konfigurasi Moodle</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Platform</label>
            <select value={config.platform} onChange={(e) => setConfig({ ...config, platform: e.target.value })}
              className="input-field">
              <option value="moodle">Moodle</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Base URL</label>
            <input type="url" value={config.base_url} onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
              className="input-field" placeholder="https://moodle.kampus.ac.id" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">API Token</label>
            <input type="password" value={config.api_token || ''} onChange={(e) => setConfig({ ...config, api_token: e.target.value })}
              className="input-field" placeholder="Token web service Moodle" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!config.sync_mahasiswa} onChange={(e) => setConfig({ ...config, sync_mahasiswa: e.target.checked })}
              className="rounded border-slate-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500" />
            <span className="text-sm dark:text-white">Sync Mahasiswa (push user ke Moodle)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!config.sync_nilai} onChange={(e) => setConfig({ ...config, sync_nilai: e.target.checked })}
              className="rounded border-slate-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500" />
            <span className="text-sm dark:text-white">Sync Nilai (tarik nilai dari Moodle)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!config.sync_jadwal} onChange={(e) => setConfig({ ...config, sync_jadwal: e.target.checked })}
              className="rounded border-slate-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500" />
            <span className="text-sm dark:text-white">Sync Jadwal (tarik course dari Moodle)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!config.is_active} onChange={(e) => setConfig({ ...config, is_active: e.target.checked })}
              className="rounded border-slate-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500" />
            <span className="text-sm dark:text-white font-semibold text-emerald-500">Aktifkan Integrasi</span>
          </label>
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={handleTestConnection} disabled={testing || !config.base_url || !config.api_token}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-zinc-600 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-all">
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />} Test Koneksi
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 disabled:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/20">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
          </button>
        </div>

        {testResult && (
          <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            testResult.ok ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}>
            {testResult.ok ? <Wifi size={15} /> : <WifiOff size={15} />}
            {testResult.message}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-6 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-emerald-500" />
          <h2 className="text-base font-bold font-display dark:text-white">Sinkronisasi Data</h2>
        </div>

        {syncResult && (
          <div className={`mb-4 flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            syncResult.errors > 0 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
          }`}>
            {syncResult.errors > 0 ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
            {syncResult.message}
          </div>
        )}

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
          <select value={filterEntity} onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }} className="input-field max-w-[160px]">
            <option value="">Semua Entity</option>
            <option value="mahasiswa">Mahasiswa</option>
            <option value="nilai">Nilai</option>
            <option value="jadwal">Jadwal</option>
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="input-field max-w-[160px]">
            <option value="">Semua Status</option>
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
