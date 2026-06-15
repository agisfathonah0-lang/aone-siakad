import { useState, useEffect } from 'react';
import { get } from '../../api/client';
import { Search, Loader2 } from 'lucide-react';

interface AuditEntry {
  id: string; action: string; actor: string; detail: string; createdAt: string;
}

export default function VendorAuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await get<AuditEntry[]>('/vendor/audit'); setLogs(Array.isArray(d) ? d : []); } finally { setLoading(false); }
  }

  const filtered = logs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.actor?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Audit Logs</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-500">Riwayat aktivitas admin platform</p>
      </div>

      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari aksi atau aktor..." className="input-field pl-9" />
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-800/30">
              <th className="text-left px-4 py-3.5 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Aksi</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Aktor</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Detail</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-zinc-800/20">
            {filtered.map(l => (
              <tr key={l.id} className="transition-colors">
                <td className="px-4 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">{l.action}</span></td>
                <td className="px-4 py-3 text-xs text-slate-600 dark:text-zinc-300">{l.actor}</td>
                <td className="px-4 py-3 text-xs text-slate-500 dark:text-zinc-400 max-w-xs truncate">{l.detail || '—'}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{new Date(l.createdAt).toLocaleString('id')}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-sm text-slate-400">Belum ada data audit</td></tr>}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-slate-400">Menampilkan 50 log terbaru dari maksimal 500 log tersimpan.</p>
    </div>
  );
}
