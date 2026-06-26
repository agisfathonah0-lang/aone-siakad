import { useState, useEffect } from 'react';
import { get, post } from '../../api/client';
import { toast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';
import { Search, Loader2, Shield, ShieldOff, Plus } from 'lucide-react';

interface FirewallLog {
  id: string; ip: string; method: string; path: string; user_agent: string; reason: string; created_at: string;
}

interface BlockedIp {
  id: string; ip: string; reason: string; blocked_at: string;
}

export default function FirewallPage() {
  const [logs, setLogs] = useState<FirewallLog[]>([]);
  const [blocked, setBlocked] = useState<BlockedIp[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'logs' | 'blocked'>('logs');
  const [search, setSearch] = useState('');
  const [blockModal, setBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({ ip: '', reason: '' });

  useEffect(() => { Promise.all([loadLogs(), loadBlocked()]).finally(() => setLoading(false)); }, []);

  async function loadLogs() {
    try { const d = await get<FirewallLog[]>('/vendor/firewall/logs'); setLogs(Array.isArray(d) ? d : []); } catch (err: any) { toast(err?.response?.data?.message || err?.message || 'Gagal memuat log', 'error'); }
  }
  async function loadBlocked() {
    try { const d = await get<BlockedIp[]>('/vendor/firewall/blocked-ips'); setBlocked(Array.isArray(d) ? d : []); } catch (err: any) { toast(err?.response?.data?.message || err?.message || 'Gagal memuat daftar blokir', 'error'); }
  }
  async function unblock(id: string) {
    const item = blocked.find(b => b.id === id);
    if (!item) return;
    try { await post('/vendor/firewall/unblock-ip', { ip: item.ip }); toast('IP berhasil di-unblock', 'success'); loadBlocked(); } catch (err: any) { toast(err?.response?.data?.message || err?.message || 'Gagal unblock IP', 'error'); }
  }
  async function handleBlock(e: React.FormEvent) {
    e.preventDefault();
    try { await post('/vendor/firewall/block-ip', { ip: blockForm.ip, reason: blockForm.reason || undefined }); setBlockModal(false); setBlockForm({ ip: '', reason: '' }); toast('IP berhasil diblokir', 'success'); loadBlocked(); loadLogs(); } catch (err: any) { toast(err?.response?.data?.message || err?.message || 'Gagal memblokir IP', 'error'); }
  }

  const filteredLogs = logs.filter(l => l.ip?.includes(search) || l.path?.includes(search));
  const filteredBlocked = blocked.filter(b => b.ip?.includes(search));

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Firewall</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-500">Log keamanan & IP terblokir</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('logs')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${tab === 'logs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'}`}>
          <Shield size={14} className="inline mr-1" /> Logs ({logs.length})
        </button>
        <button onClick={() => setTab('blocked')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${tab === 'blocked' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'}`}>
          <ShieldOff size={14} className="inline mr-1" /> Blokir ({blocked.length})
        </button>
        <button onClick={() => setBlockModal(true)} className="px-4 py-2 text-xs font-bold rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-500/20 ml-auto flex items-center gap-1">
          <Plus size={14} /> Block IP
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari IP atau path..." className="input-field pl-9" />
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 overflow-hidden">
        {tab === 'logs' ? (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 dark:border-zinc-800/30"><th className="text-left px-4 py-3.5 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">IP</th><th className="text-left px-4 py-3.5 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Method</th><th className="text-left px-4 py-3.5 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Path</th><th className="text-left px-4 py-3.5 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Alasan</th><th className="text-left px-4 py-3.5 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Waktu</th></tr></thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-zinc-800/20">
              {filteredLogs.map(l => (
                <tr key={l.id} className="transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{l.ip}</td>
                  <td className="px-4 py-3"><span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">{l.method}</span></td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500 dark:text-zinc-400">{l.path}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-zinc-300">{l.reason}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-sm text-slate-400">Tidak ada data</td></tr>}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 dark:border-zinc-800/30"><th className="text-left px-4 py-3.5 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">IP</th><th className="text-left px-4 py-3.5 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Alasan</th><th className="text-left px-4 py-3.5 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Diblokir</th><th className="text-center px-4 py-3.5 font-semibold text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Aksi</th></tr></thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-zinc-800/20">
              {filteredBlocked.map(b => (
                <tr key={b.id} className="transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{b.ip}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-zinc-300">{b.reason}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(b.blocked_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => unblock(b.id)} className="text-xs text-indigo-500 hover:text-indigo-600 font-bold transition-colors">Unblock</button>
                  </td>
                </tr>
              ))}
              {filteredBlocked.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-sm text-slate-400">Tidak ada IP terblokir</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={blockModal} onClose={() => setBlockModal(false)} title="Block IP">
        <form onSubmit={handleBlock} className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Alamat IP</label><input value={blockForm.ip} onChange={e => setBlockForm({ ...blockForm, ip: e.target.value })} required className="input-field" placeholder="192.168.1.1" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Alasan (opsional)</label><input value={blockForm.reason} onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })} className="input-field" placeholder="Serangan brute force..." /></div>
          <button type="submit" className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-500/20">Block IP</button>
        </form>
      </Modal>
    </div>
  );
}
