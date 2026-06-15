import { useState, useEffect, useCallback } from 'react';
import { get, post, put } from '../../api/client';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { Settings, Globe, RefreshCw, ExternalLink, Wifi, WifiOff } from 'lucide-react';

const statusBadge: Record<string, 'success' | 'warning' | 'danger'> = { Terbit: 'success', Ditolak: 'danger', 'Dalam Reviewer': 'warning' };

type Tab = 'config' | 'submissions' | 'proxy';

interface OjsConfig {
  base_url: string;
  api_key: string;
  journal_id: number;
  sync_interval: number;
  last_sync_at?: string;
  is_active: boolean;
}

interface SyncResult {
  synced: number;
  total: number;
  message?: string;
}

interface SyncLog {
  id: string;
  entity_type: string;
  action: string;
  status: string;
  records_count: number;
  error_message?: string;
  created_at: string;
}

export default function OJSPage() {
  const [tab, setTab] = useState<Tab>('config');
  const [config, setConfig] = useState<OjsConfig>({ base_url: 'http://localhost/ojs-v3', api_key: '', journal_id: 1, sync_interval: 3600, is_active: true });
  const [configLoading, setConfigLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [submissionsError, setSubmissionsError] = useState('');
  const [configForm, setConfigForm] = useState({ base_url: 'http://localhost/ojs-v3', api_key: '', journal_id: 1, sync_interval: 3600 });

  useEffect(() => {
    loadConfig();
    fetchSubmissions();
  }, []);

  const loadConfig = async () => {
    setConfigLoading(true);
    try {
      const cfg = await get<OjsConfig>('/ojs/config');
      setConfig(cfg);
      setConfigForm({
        base_url: cfg.base_url,
        api_key: '',
        journal_id: cfg.journal_id,
        sync_interval: cfg.sync_interval,
      });
    } catch { /* ignore */ }
    finally { setConfigLoading(false); }
  };

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    setSubmissionsError('');
    try {
      const res = await get<any[]>('/ojs');
      setSubmissions(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setSubmissionsError(err.message);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus(null);
    try {
      const res = await get<{ connected: boolean; message: string }>('/ojs/test-connection');
      setConnectionStatus(res);
    } catch (err: any) {
      setConnectionStatus({ connected: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await put('/ojs/config', configForm);
      await loadConfig();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const syncSubmissions = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await post<SyncResult>('/ojs/sync-submissions');
      setSyncResult(res);
      fetchSubmissions();
    } catch (err: any) {
      setSyncResult({ synced: 0, total: 0, message: err.message });
    } finally {
      setSyncing(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author' },
    { key: 'journalCategory', label: 'Kategori' },
    {
      key: 'status', label: 'Status',
      render: (r: any) => <Badge variant={statusBadge[r.status as keyof typeof statusBadge] || 'default'}>{r.status}</Badge>,
    },
    { key: 'source', label: 'Source' },
    { key: 'publishedAt', label: 'Sync Time', render: (r: any) => r.publishedAt || r.created_at || '-' },
    {
      key: 'id', label: 'Aksi',
      render: (r: any) => (
        <a
          href={`http://localhost/ojs-v3/index.php/workflow/access/${r.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 text-xs"
        >
          <ExternalLink size={12} /> Buka
        </a>
      ),
    },
  ];

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'config', label: 'Konfigurasi OJS', icon: Settings },
    { key: 'submissions', label: 'Submissions', icon: RefreshCw },
    { key: 'proxy', label: 'OJS Proxy', icon: Globe },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">OJS Integration</h1>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-zinc-700">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              tab === t.key
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'config' && (
        <div className="max-w-xl space-y-4">
          {configLoading ? (
            <p className="text-sm text-slate-400">Memuat konfigurasi...</p>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Base URL</label>
                <input
                  value={configForm.base_url}
                  onChange={(e) => setConfigForm({ ...configForm, base_url: e.target.value })}
                  className="input-field"
                  placeholder="http://localhost/ojs-v3"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">API Key</label>
                <input
                  type="password"
                  value={configForm.api_key}
                  onChange={(e) => setConfigForm({ ...configForm, api_key: e.target.value })}
                  className="input-field"
                  placeholder={config.api_key ? '(tersimpan)' : 'Masukkan API key'}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Journal ID</label>
                  <input
                    type="number"
                    value={configForm.journal_id}
                    onChange={(e) => setConfigForm({ ...configForm, journal_id: parseInt(e.target.value) || 1 })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Sync Interval (detik)</label>
                  <input
                    type="number"
                    value={configForm.sync_interval}
                    onChange={(e) => setConfigForm({ ...configForm, sync_interval: parseInt(e.target.value) || 3600 })}
                    className="input-field"
                  />
                </div>
              </div>

              {connectionStatus && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  connectionStatus.connected
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                }`}>
                  {connectionStatus.connected ? <Wifi size={15} /> : <WifiOff size={15} />}
                  {connectionStatus.message}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={testConnection}
                  disabled={testing}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-zinc-600 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
                >
                  <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
                  {testing ? 'Menguji...' : 'Uji Koneksi'}
                </button>
                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={syncSubmissions}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Menyinkronkan...' : 'Sync Submissions'}
            </button>
            {syncResult && (
              <span className="text-sm text-slate-600 dark:text-zinc-300">
                {syncResult.message
                  ? syncResult.message
                  : `${syncResult.synced} baru dari ${syncResult.total} submission`
                }
              </span>
            )}
          </div>
          <DataTable
            columns={columns}
            data={submissions}
            loading={submissionsLoading}
            error={submissionsError}
            onRefresh={fetchSubmissions}
            emptyMessage="Belum ada submission"
          />
        </div>
      )}

      {tab === 'proxy' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Tampilan OJS langsung melalui proxy. Atau buka di tab baru:
          </p>
          <a
            href="http://localhost/ojs-v3"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ExternalLink size={14} /> Buka OJS di Tab Baru
          </a>
          <div className="border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden">
            <iframe
              src="/api/v1/ojs/proxy?url=/index.php"
              className="w-full h-[70vh] bg-white"
              title="OJS Proxy"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        </div>
      )}
    </div>
  );
}
