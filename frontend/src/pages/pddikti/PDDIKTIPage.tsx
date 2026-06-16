import { useState, useEffect, useCallback } from 'react';
import { get, post, put } from '../../api/client';
import type { SyncRun, SyncStats } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { RefreshCw, Send, Settings, CheckCircle, XCircle, AlertTriangle, Plug, Eye } from 'lucide-react';

const statusBadge: Record<string, 'success' | 'danger' | 'warning'> = { Sukses: 'success', Gagal: 'danger', Peringatan: 'warning' };

const types = ['Mahasiswa', 'Dosen', 'KRS', 'Nilai'];

interface PddiktiConfig {
  id: string;
  feeder_url: string;
  username: string;
  database_name: string;
  is_active: boolean;
  last_sync_at?: string;
}

export default function PDDIKTIPage() {
  const [data, setData] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const [config, setConfig] = useState<PddiktiConfig | null>(null);
  const [configForm, setConfigForm] = useState({ feeder_url: 'http://localhost:8085', username: '', password: '', database_name: '', is_active: false });
  const [showConfig, setShowConfig] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [connResult, setConnResult] = useState<{ success: boolean; message: string } | null>(null);

  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [loadingValidation, setLoadingValidation] = useState(false);

  const [detailRun, setDetailRun] = useState<SyncRun | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [logs, s, cfg] = await Promise.all([
        get<SyncRun[]>('/pddikti'),
        get<SyncStats>('/pddikti/stats'),
        get<PddiktiConfig>('/pddikti/config'),
      ]);
      setData(logs || []);
      setStats(s || null);
      setConfig(cfg || null);
      if (cfg) setConfigForm({ feeder_url: cfg.feeder_url, username: cfg.username, password: '', database_name: cfg.database_name, is_active: cfg.is_active });
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const triggerSync = async (type: string) => {
    setSyncing(type);
    try {
      const res = await post<any>('/pddikti/sync', { type });
      alert(res.message || `Sync ${type} selesai`);
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setSyncing(null); }
  };

  const loadValidation = async () => {
    setLoadingValidation(true);
    try {
      const res = await get<any[]>('/pddikti/validate');
      setValidationErrors(res || []);
      setShowValidation(true);
    } catch (err: any) { alert(err.message); }
    finally { setLoadingValidation(false); }
  };

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await put('/pddikti/config', configForm);
      alert('Konfigurasi disimpan');
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const testConnection = async () => {
    setTestingConn(true);
    setConnResult(null);
    try {
      const res = await post<{ success: boolean; message: string }>('/pddikti/test-connection', {});
      setConnResult(res);
    } catch (err: any) { setConnResult({ success: false, message: err.message }); }
    finally { setTestingConn(false); }
  };

  const columns = [
    { key: 'entity_type', label: 'Tipe' },
    { key: 'records_synced', label: 'Tersinkronisasi' },
    { key: 'records_failed', label: 'Gagal' },
    { key: 'status', label: 'Status', render: (r: SyncRun) => <Badge variant={statusBadge[r.status as keyof typeof statusBadge] || 'default'}>{r.status}</Badge> },
    { key: 'started_at', label: 'Waktu', render: (r: SyncRun) => new Date(r.started_at).toLocaleString('id') },
    { key: 'id', label: '', render: (r: SyncRun) => (
      <button onClick={() => setDetailRun(r)} className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"><Eye size={14} /></button>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">PDDIKTI Feeder</h1>
        <div className="flex items-center gap-2">
          <button onClick={loadValidation} disabled={loadingValidation} className="btn-secondary text-xs flex items-center gap-1.5">
            <AlertTriangle size={13} /> {loadingValidation ? '...' : 'Validasi'}
          </button>
          <button onClick={() => setShowConfig(true)} className="btn-secondary text-xs flex items-center gap-1.5">
            <Settings size={13} /> Konfigurasi
          </button>
          <button onClick={fetchData} className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {config && (
        <div className={`px-4 py-2 rounded-xl text-xs flex items-center gap-2 ${config.is_active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'}`}>
          <Plug size={14} />
          Feeder: {config.feeder_url || '-'} {config.is_active ? '(Aktif)' : '(Nonaktif)'}
          {config.last_sync_at && ` · Sync terakhir: ${new Date(config.last_sync_at).toLocaleString('id')}`}
        </div>
      )}

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
          <button key={t} disabled={syncing === t || !config?.is_active} onClick={() => triggerSync(t)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20">
            <Send size={14} /> {syncing === t ? 'Sync...' : `Sync ${t}`}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={data} loading={loading} error={error} onRefresh={fetchData} emptyMessage="Belum ada sync" />

      <Modal open={showConfig} onClose={() => setShowConfig(false)} title="Konfigurasi PDDIKTI Feeder" size="md">
        <form onSubmit={saveConfig} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Feeder URL</label>
            <input value={configForm.feeder_url} onChange={e => setConfigForm({ ...configForm, feeder_url: e.target.value })} required className="input-field text-sm" placeholder="http://localhost:8085" />
            <p className="text-[10px] text-slate-400 mt-0.5">URL Neo Feeder server (contoh: http://localhost:8085)</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Username</label>
              <input value={configForm.username} onChange={e => setConfigForm({ ...configForm, username: e.target.value })} className="input-field text-sm" placeholder="Username Feeder" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Password</label>
              <input type="password" value={configForm.password} onChange={e => setConfigForm({ ...configForm, password: e.target.value })} className="input-field text-sm" placeholder="Password Feeder" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Nama Database</label>
              <input value={configForm.database_name} onChange={e => setConfigForm({ ...configForm, database_name: e.target.value })} className="input-field text-sm" placeholder="Nama database di Feeder" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Aktif</label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={configForm.is_active} onChange={e => setConfigForm({ ...configForm, is_active: e.target.checked })} className="accent-indigo-600" />
                <span className="text-sm">Aktifkan Feeder Sync</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={testConnection} disabled={testingConn || !configForm.feeder_url} className="btn-secondary text-xs flex items-center gap-1.5">
              {testingConn ? 'Menguji...' : 'Test Koneksi'}
            </button>
          </div>
          {connResult && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${connResult.success ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
              {connResult.success ? <CheckCircle size={14} className="mt-0.5 shrink-0" /> : <XCircle size={14} className="mt-0.5 shrink-0" />}
              <span>{connResult.message}</span>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowConfig(false)} className="btn-secondary text-xs">Tutup</button>
            <button type="submit" className="btn-primary text-xs">Simpan</button>
          </div>
        </form>
      </Modal>

      <Modal open={showValidation} onClose={() => setShowValidation(false)} title="Hasil Validasi Data" size="lg">
        {validationErrors.length === 0 ? (
          <div className="text-center py-8 text-emerald-500 text-sm flex flex-col items-center gap-2">
            <CheckCircle size={32} />
            <p className="font-bold">Semua data valid untuk sinkronisasi</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {validationErrors.map((e, i) => (
              <div key={i} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={e.priority === 'Tinggi' ? 'danger' : 'warning'}>{e.priority}</Badge>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">{e.type}</span>
                  {e.field && <span className="text-slate-400">({e.field})</span>}
                </div>
                <p className="text-slate-600 dark:text-zinc-400">{e.message}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={!!detailRun} onClose={() => setDetailRun(null)} title="Detail Sinkronisasi" size="md">
        {detailRun && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-xs text-slate-400">Tipe</span><p className="font-semibold dark:text-white">{detailRun.entity_type}</p></div>
              <div><span className="text-xs text-slate-400">Status</span><p><Badge variant={statusBadge[detailRun.status as keyof typeof statusBadge] || 'default'}>{detailRun.status}</Badge></p></div>
              <div><span className="text-xs text-slate-400">Tersinkronisasi</span><p className="font-semibold dark:text-white">{detailRun.records_synced}</p></div>
              <div><span className="text-xs text-slate-400">Gagal</span><p className="font-semibold text-red-500">{detailRun.records_failed}</p></div>
              <div className="col-span-2"><span className="text-xs text-slate-400">Waktu</span><p className="dark:text-white">{new Date(detailRun.started_at).toLocaleString('id')}</p></div>
              {detailRun.error_detail && (
                <div className="col-span-2"><span className="text-xs text-slate-400">Error Detail</span><p className="text-red-500 text-xs whitespace-pre-wrap">{detailRun.error_detail}</p></div>
              )}
            </div>
            {detailRun.errors && typeof detailRun.errors === 'string' && JSON.parse(detailRun.errors).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Daftar Error</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {(JSON.parse(detailRun.errors) as any[]).map((err: any, i: number) => (
                    <p key={i} className="text-[10px] text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{err.type || 'Error'}: {err.message || JSON.stringify(err)}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
