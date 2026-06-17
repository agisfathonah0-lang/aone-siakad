import { useState, useEffect, useCallback } from 'react';
import { get, put, post } from '../../api/client';
import { getPaginated } from '../../api/client';
import type { LmsConfig, LmsSyncLog } from '../../types';
import DataTable from '../../components/ui/DataTable';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { Settings, Save, RefreshCw, Database, Loader2, Wifi, WifiOff, CheckCircle, AlertCircle, BookOpen, Users, GraduationCap, BarChart3, Search, BookMarked } from 'lucide-react';
import { toast } from '../../context/ToastContext';

type Tab = 'dashboard' | 'courses' | 'users' | 'grades' | 'config' | 'sync';

interface MoodleCourse {
  id: number; fullname: string; shortname: string; summary?: string;
  idnumber?: string; format?: string; startdate?: number; enddate?: number;
  visible?: number; category?: number; categoryname?: string;
}

interface MoodleUser {
  id: number; username: string; firstname: string; lastname: string;
  email: string; idnumber?: string; department?: string;
}

interface GradeTable {
  courseid: number; userid: number; userfullname?: string;
  items: { id: number; itemname?: string; grade?: string; graderaw?: number; grademax?: number }[];
}

interface MoodleSiteInfo {
  sitename: string; version: string; release: string;
  username: string; firstname: string; lastname: string;
  userid: number; userpictureurl?: string;
}

export default function LMSPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [config, setConfig] = useState<LmsConfig>({ platform: 'moodle', base_url: '', api_token: '', sync_mahasiswa: false, sync_nilai: false, sync_jadwal: false, is_active: false });
  const [configForm, setConfigForm] = useState({ platform: 'moodle', base_url: '', api_token: '', sync_mahasiswa: false, sync_nilai: false, sync_jadwal: false, is_active: false });
  const [configLoading, setConfigLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [siteInfo, setSiteInfo] = useState<MoodleSiteInfo | null>(null);

  const [courses, setCourses] = useState<MoodleCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState('');

  const [searchField, setSearchField] = useState('email');
  const [searchValue, setSearchValue] = useState('');
  const [users, setUsers] = useState<MoodleUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  const [selectedCourse, setSelectedCourse] = useState('');
  const [grades, setGrades] = useState<GradeTable[]>([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesError, setGradesError] = useState('');

  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ entity: string; synced: number; errors: number; message: string } | null>(null);
  const [logs, setLogs] = useState<LmsSyncLog[]>([]);
  const [filterEntity, setFilterEntity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const data = await get<LmsConfig>('/akademik/lms/config');
      if (data) {
        setConfig(data);
        setConfigForm({
          platform: data.platform || 'moodle',
          base_url: data.base_url || '',
          api_token: '',
          sync_mahasiswa: !!data.sync_mahasiswa,
          sync_nilai: !!data.sync_nilai,
          sync_jadwal: !!data.sync_jadwal,
          is_active: !!data.is_active,
        });
      }
    } catch { }
    finally { setConfigLoading(false); }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      let url = `/akademik/lms/sync/log?page=${page}&limit=20`;
      if (filterEntity) url += `&entity_type=${filterEntity}`;
      if (filterStatus) url += `&status=${filterStatus}`;
      const result = await getPaginated<LmsSyncLog>(url);
      if (result) {
        setLogs(result.rows || []);
        setTotalPages(result.pagination?.totalPages || 1);
      }
    } catch { }
  }, [page, filterEntity, filterStatus]);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => { if (tab === 'dashboard' && config.base_url) handleTestConnection(); }, [tab]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await put<LmsConfig>('/akademik/lms/config', configForm);
      if (data) setConfig(data);
    } catch (err: any) {
      toast(err.response?.data?.message || err.message, 'error');
    }
    finally { setSaving(false); }
  };

  const handleTestConnection = async () => {
    if (!configForm.base_url && !config.base_url) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await post<{ ok: boolean; message: string; siteinfo?: MoodleSiteInfo }>('/akademik/lms/test-connection');
      setTestResult(res);
      if (res.ok && (res as any).siteinfo) setSiteInfo((res as any).siteinfo);
    } catch (err: any) {
      setTestResult({ ok: false, message: err.response?.data?.message || err.message });
    } finally { setTesting(false); }
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    setCoursesError('');
    try {
      const res = await get<MoodleCourse[]>('/akademik/lms/courses');
      setCourses(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setCoursesError(err.response?.data?.message || err.message);
    } finally { setCoursesLoading(false); }
  };

  const searchUsers = async () => {
    if (!searchValue) return;
    setUsersLoading(true);
    setUsersError('');
    try {
      const res = await get<MoodleUser[]>(`/akademik/lms/users?field=${searchField}&value=${encodeURIComponent(searchValue)}`);
      setUsers(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setUsersError(err.response?.data?.message || err.message);
    } finally { setUsersLoading(false); }
  };

  const fetchGrades = async () => {
    if (!selectedCourse) return;
    setGradesLoading(true);
    setGradesError('');
    try {
      const res = await get<{ tables: GradeTable[] }>(`/akademik/lms/courses/${selectedCourse}/grades`);
      const tables = res?.tables || (Array.isArray(res) ? res : []);
      setGrades(Array.isArray(tables) ? tables : []);
    } catch (err: any) {
      setGradesError(err.response?.data?.message || err.message);
    } finally { setGradesLoading(false); }
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

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'courses', label: 'Courses', icon: BookOpen },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'grades', label: 'Grades', icon: GraduationCap },
    { key: 'config', label: 'Konfigurasi', icon: Settings },
    { key: 'sync', label: 'Sync Log', icon: Database },
  ];

  const statusBadge: Record<string, 'success' | 'danger' | 'warning'> = { success: 'success', failed: 'danger' };

  const logColumns = [
    { key: 'entity_type', label: 'Entity', render: (r: LmsSyncLog) => <Badge variant="info">{r.entity_type}</Badge> },
    { key: 'action', label: 'Action' },
    { key: 'status', label: 'Status', render: (r: LmsSyncLog) => <Badge variant={statusBadge[r.status] || 'default'}>{r.status}</Badge> },
    { key: 'records_count', label: 'Records' },
    { key: 'error_message', label: 'Error', render: (r: LmsSyncLog) => r.error_message ? <span className="text-[10px] text-red-400">{r.error_message}</span> : '-' },
    { key: 'created_at', label: 'Waktu', render: (r: LmsSyncLog) => new Date(r.created_at).toLocaleString('id') },
  ];

  const courseColumns = [
    { key: 'id', label: 'ID' },
    { key: 'fullname', label: 'Nama Course' },
    { key: 'shortname', label: 'Shortname' },
    { key: 'categoryname', label: 'Kategori' },
    { key: 'startdate', label: 'Mulai', render: (r: MoodleCourse) => r.startdate ? new Date(r.startdate * 1000).toLocaleDateString('id') : '-' },
    { key: 'visible', label: 'Status', render: (r: MoodleCourse) => <Badge variant={r.visible ? 'success' : 'danger'}>{r.visible ? 'Aktif' : 'Tidak Aktif'}</Badge> },
  ];

  const userColumns = [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'firstname', label: 'Nama Depan' },
    { key: 'lastname', label: 'Nama Belakang' },
    { key: 'email', label: 'Email' },
    { key: 'idnumber', label: 'NIM/NIK' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Moodle Integration</h1>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-zinc-700 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              tab === t.key
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
            }`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Status Koneksi" value={testResult?.ok ? 'Terhubung' : 'Terputus'} color={testResult?.ok ? 'primary' : 'rose'}
              icon={testResult?.ok ? <Wifi size={16} /> : <WifiOff size={16} />} />
            <StatCard title="Total Courses" value={courses.length || '-'} color="accent" icon={<BookOpen size={16} />} />
            <StatCard title="Site Name" value={siteInfo?.sitename || '-'} color="amber" icon={<BookMarked size={16} />} />
            <StatCard title="Moodle Version" value={siteInfo?.release || '-'} color="primary" icon={<BarChart3 size={16} />} />
          </div>
          {testResult && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              testResult.ok ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              {testResult.ok ? <Wifi size={15} /> : <WifiOff size={15} />}
              {testResult.message}
            </div>
          )}
          {siteInfo && (
            <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
              <h3 className="text-sm font-bold font-display dark:text-white mb-3">Site Info</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-slate-400">Site:</span> <span className="dark:text-white font-semibold">{siteInfo.sitename}</span></div>
                <div><span className="text-slate-400">Version:</span> <span className="dark:text-white">{siteInfo.version}</span></div>
                <div><span className="text-slate-400">Release:</span> <span className="dark:text-white">{siteInfo.release}</span></div>
                <div><span className="text-slate-400">User:</span> <span className="dark:text-white">{siteInfo.firstname} {siteInfo.lastname} ({siteInfo.username})</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'courses' && (
        <div className="space-y-4">
          <button onClick={fetchCourses} disabled={coursesLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20">
            {coursesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Ambil Courses
          </button>
          <DataTable columns={courseColumns} data={courses} loading={coursesLoading} error={coursesError}
            onRefresh={fetchCourses} emptyMessage="Klik tombol untuk ambil courses" />
          {courses.length > 0 && (
            <p className="text-xs text-slate-400">Total {courses.length} courses dari Moodle</p>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Cari berdasarkan</label>
              <select value={searchField} onChange={(e) => setSearchField(e.target.value)}
                className="input-field">
                <option value="id">ID</option>
                <option value="username">Username</option>
                <option value="email">Email</option>
                <option value="idnumber">NIM/NIK</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Nilai</label>
              <input value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                className="input-field" placeholder="Masukkan nilai pencarian..." />
            </div>
            <button onClick={searchUsers} disabled={usersLoading || !searchValue}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20">
              {usersLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Cari
            </button>
          </div>
          <DataTable columns={userColumns} data={users} loading={usersLoading} error={usersError}
            onRefresh={searchUsers} emptyMessage="Cari user Moodle berdasarkan field di atas" />
        </div>
      )}

      {tab === 'grades' && (
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 max-w-md">
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Pilih Course</label>
              <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
                className="input-field">
                <option value="">-- Pilih Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullname} ({c.shortname})</option>
                ))}
              </select>
            </div>
            <button onClick={() => { fetchCourses(); }} className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 dark:border-zinc-600 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">
              <RefreshCw size={13} /> Muat Courses
            </button>
            <button onClick={fetchGrades} disabled={gradesLoading || !selectedCourse}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20">
              {gradesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />} Lihat Nilai
            </button>
          </div>
          {gradesError && <p className="text-xs text-red-400">{gradesError}</p>}
          {gradesLoading && <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Memuat nilai...</div>}
          {!gradesLoading && grades.length > 0 && grades.map((table) => (
            <div key={table.userid} className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
              <h4 className="text-sm font-bold dark:text-white mb-2">User: {table.userfullname || `#${table.userid}`}</h4>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800">
                    <th className="text-left px-2 py-1.5 text-slate-500 font-semibold">Item</th>
                    <th className="text-left px-2 py-1.5 text-slate-500 font-semibold">Grade</th>
                    <th className="text-left px-2 py-1.5 text-slate-500 font-semibold">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {(table.items || []).map((item) => (
                    <tr key={item.id} className="border-b border-slate-50 dark:border-zinc-800/30">
                      <td className="px-2 py-1.5 dark:text-white">{item.itemname || '-'}</td>
                      <td className="px-2 py-1.5 font-semibold dark:text-white">{item.grade ?? item.graderaw ?? '-'}</td>
                      <td className="px-2 py-1.5 text-slate-400">{item.grademax || '100'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {!gradesLoading && selectedCourse && grades.length === 0 && (
            <p className="text-sm text-slate-400">Tidak ada data nilai untuk course ini</p>
          )}
        </div>
      )}

      {tab === 'config' && (
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-6 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold font-display dark:text-white">Konfigurasi Moodle</h2>
          </div>
          {configLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Platform</label>
                  <select value={configForm.platform} onChange={(e) => setConfigForm({ ...configForm, platform: e.target.value })}
                    className="input-field">
                    <option value="moodle">Moodle</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Base URL</label>
                  <input type="url" value={configForm.base_url} onChange={(e) => setConfigForm({ ...configForm, base_url: e.target.value })}
                    className="input-field" placeholder="https://moodle.kampus.ac.id" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">API Token</label>
                  <input type="password" value={configForm.api_token} onChange={(e) => setConfigForm({ ...configForm, api_token: e.target.value })}
                    className="input-field" placeholder={config.api_token ? '(tersimpan)' : 'Token web service Moodle'} />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={configForm.sync_mahasiswa} onChange={(e) => setConfigForm({ ...configForm, sync_mahasiswa: e.target.checked })}
                    className="rounded border-slate-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500" />
                  <span className="text-sm dark:text-white">Sync Mahasiswa (push user ke Moodle)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={configForm.sync_nilai} onChange={(e) => setConfigForm({ ...configForm, sync_nilai: e.target.checked })}
                    className="rounded border-slate-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500" />
                  <span className="text-sm dark:text-white">Sync Nilai (tarik nilai dari Moodle)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={configForm.sync_jadwal} onChange={(e) => setConfigForm({ ...configForm, sync_jadwal: e.target.checked })}
                    className="rounded border-slate-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500" />
                  <span className="text-sm dark:text-white">Sync Jadwal (tarik course dari Moodle)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={configForm.is_active} onChange={(e) => setConfigForm({ ...configForm, is_active: e.target.checked })}
                    className="rounded border-slate-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500" />
                  <span className="text-sm dark:text-white font-semibold text-emerald-500">Aktifkan Integrasi</span>
                </label>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={handleTestConnection} disabled={testing || !configForm.base_url}
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
            </>
          )}
        </div>
      )}

      {tab === 'sync' && (
        <div className="space-y-4">
          {syncResult && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              syncResult.errors > 0 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
            }`}>
              {syncResult.errors > 0 ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
              {syncResult.message}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
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

          <div className="flex flex-wrap gap-2">
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

          <DataTable columns={logColumns} data={logs} loading={false} page={page} totalPages={totalPages}
            onPageChange={setPage} emptyMessage="Belum ada sync log" />
        </div>
      )}
    </div>
  );
}
