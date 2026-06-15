import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Shield, ShieldAlert, ShieldCheck, AlertTriangle, Ban,
  RefreshCw, Search, Clock, Globe, XCircle, Activity, Server
} from 'lucide-react';
import { api } from '../api';

interface FirewallMonitorProps {
  isDark: boolean;
}

export default function FirewallMonitor({ isDark }: FirewallMonitorProps) {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [blockedIps, setBlockedIps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockIpInput, setBlockIpInput] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, logsData, blockedData] = await Promise.all([
        api.getFirewallStats(),
        api.getFirewallLogs({ limit: 50 }),
        api.getBlockedIps(),
      ]);
      setStats(statsData);
      setLogs(logsData);
      setBlockedIps(blockedData);
    } catch {
      setMessage('Gagal memuat data firewall');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBlockIp = async () => {
    if (!blockIpInput.trim()) return;
    try {
      await api.blockIp({ ip: blockIpInput.trim(), reason: blockReason || 'Manual block by admin' });
      setMessage(`IP ${blockIpInput} berhasil diblokir`);
      setMessageType('success');
      setBlockIpInput('');
      setBlockReason('');
      fetchData();
    } catch (err: any) {
      setMessage(err.message || 'Gagal memblokir IP');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUnblockIp = async (ip: string) => {
    try {
      await api.unblockIp(ip);
      setMessage(`IP ${ip} berhasil dibuka`);
      setMessageType('success');
      fetchData();
    } catch {
      setMessage('Gagal membuka IP');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const severityColor = (s: string) => {
    switch (s) {
      case 'CRITICAL': return 'text-rose-500 bg-rose-500/10';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10';
      case 'MEDIUM': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'BLOCKED': return 'text-rose-500 bg-rose-500/10';
      case 'MITIGATED': return 'text-emerald-500 bg-emerald-500/10';
      case 'MONITORED': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  const actionIcon = (a: string) => {
    switch (a) {
      case 'BLOCK': return <Ban className="w-3.5 h-3.5" />;
      case 'RATE_LIMIT': return <Activity className="w-3.5 h-3.5" />;
      case 'CHALLENGE': return <ShieldCheck className="w-3.5 h-3.5" />;
      default: return <AlertTriangle className="w-3.5 h-3.5" />;
    }
  };

  const typeBadge = (t: string) => {
    const colors: Record<string, string> = {
      BRUTE_FORCE: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400',
      SQL_INJECTION: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
      XSS: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
      DDoS: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
      MALICIOUS: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[t] || 'text-slate-600 bg-slate-100';
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-xs text-slate-400">Memuat data firewall...</span>
      </div>
    );
  }

  const cardClass = `${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} p-5 rounded-2xl border`;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 font-mono">KEAMANAN SISTEM</span>
          <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Firewall & Monitoring Serangan</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Pantau lalu lintas mencurigakan, blokir IP berbahaya, dan lihat riwayat mitigasi serangan siber.</p>
        </div>
        <button onClick={fetchData} className="px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`px-4 py-3 rounded-xl text-xs font-bold ${messageType === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
          {message}
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Total Serangan</p>
              <p className="text-2xl font-extrabold mt-0.5">{stats?.totalAttacks || 0}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <Ban className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Diblokir Hari Ini</p>
              <p className="text-2xl font-extrabold mt-0.5">{stats?.blockedToday || 0}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Dimtigasi Hari Ini</p>
              <p className="text-2xl font-extrabold mt-0.5">{stats?.mitigatedToday || 0}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-500" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">IP Diblokir Aktif</p>
              <p className="text-2xl font-extrabold mt-0.5">{stats?.activeBlocks || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Type Distribution */}
        <div className={`${cardClass} lg:col-span-1`}>
          <h3 className="font-bold text-sm font-display mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-500" />
            Jenis Serangan
          </h3>
          <div className="space-y-3">
            {stats?.byType?.map((t: any, i: number) => {
              const max = Math.max(...stats.byType.map((x: any) => x.count));
              const pct = max > 0 ? (t.count / max) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold">{t.type.replace('_', ' ')}</span>
                    <span className="text-slate-400 font-mono">{t.count}x</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full" style={{ backgroundColor: i === 0 ? '#f43f5e' : i === 1 ? '#8b5cf6' : i === 2 ? '#f59e0b' : '#06b6d4' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <h3 className="font-bold text-sm font-display mt-6 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-indigo-500" />
            Tingkat Keparahan
          </h3>
          <div className="space-y-2">
            {stats?.bySeverity?.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${severityColor(s.severity)}`}>{s.severity}</span>
                <span className="font-mono text-slate-400">{s.count} kejadian</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attacks & Logs */}
        <div className={`${cardClass} lg:col-span-2`}>
          <h3 className="font-bold text-sm font-display mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Log Serangan Terkini
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'} border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <tr>
                  <th className="pb-3 pr-3">Waktu</th>
                  <th className="pb-3 pr-3">IP Sumber</th>
                  <th className="pb-3 pr-3">Tipe</th>
                  <th className="pb-3 pr-3">Severity</th>
                  <th className="pb-3 pr-3">Path</th>
                  <th className="pb-3 pr-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {(logs.length > 0 ? logs : stats?.recentLogs || []).map((log: any, i: number) => (
                  <tr key={log.id || i} className={`border-b ${isDark ? 'border-zinc-800/50' : 'border-slate-100'} hover:bg-slate-50 dark:hover:bg-zinc-800/20`}>
                    <td className="py-2.5 pr-3 font-mono text-[10px] text-slate-400 whitespace-nowrap">{log.timestamp?.slice(11, 19) || '-'}</td>
                    <td className="py-2.5 pr-3 font-mono font-bold">{log.sourceIp}</td>
                    <td className="py-2.5 pr-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${typeBadge(log.type)}`}>{log.type.replace('_', ' ')}</span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${severityColor(log.severity)}`}>{log.severity}</span>
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-[10px] text-slate-500">{log.path}</td>
                    <td className="py-2.5 pr-3">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${statusColor(log.status)}`}>
                        {actionIcon(log.action)} {log.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Blocked IPs Management */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-sm font-display mb-4 flex items-center gap-2">
          <Ban className="w-4 h-4 text-indigo-500" />
          IP yang Diblokir
        </h3>

        {/* Block IP Form */}
        <div className={`flex flex-col sm:flex-row gap-3 mb-6 p-4 rounded-xl ${isDark ? 'bg-zinc-800/50 border border-zinc-700' : 'bg-slate-50 border border-slate-200'}`}>
          <div className="flex-1">
            <input
              type="text" value={blockIpInput} onChange={e => setBlockIpInput(e.target.value)}
              placeholder="Masukkan IP address untuk diblokir..."
              className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:border-rose-500 ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200'}`}
            />
          </div>
          <div className="flex-1">
            <input
              type="text" value={blockReason} onChange={e => setBlockReason(e.target.value)}
              placeholder="Alasan pemblokiran..."
              className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:border-rose-500 ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200'}`}
            />
          </div>
          <button onClick={handleBlockIp} disabled={!blockIpInput.trim()} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5" />
            Blokir IP
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'} border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
              <tr>
                <th className="pb-3 pr-3">IP Address</th>
                <th className="pb-3 pr-3">Alasan</th>
                <th className="pb-3 pr-3">Diblokir Pada</th>
                <th className="pb-3 pr-3">Oleh</th>
                <th className="pb-3 pr-3">Berlaku</th>
                <th className="pb-3 pr-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {blockedIps.map((ip: any) => (
                <tr key={ip.id} className={`border-b ${isDark ? 'border-zinc-800/50' : 'border-slate-100'}`}>
                  <td className="py-2.5 pr-3 font-mono font-bold text-rose-500">{ip.ip}</td>
                  <td className="py-2.5 pr-3">{ip.reason}</td>
                  <td className="py-2.5 pr-3 text-slate-400 text-[10px]">{ip.blockedAt}</td>
                  <td className="py-2.5 pr-3">{ip.blockedBy || 'System'}</td>
                  <td className="py-2.5 pr-3 text-[10px]">{ip.expiresAt || 'Permanen'}</td>
                  <td className="py-2.5 pr-3">
                    <button onClick={() => handleUnblockIp(ip.ip)} className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-500 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                      Buka Blokir
                    </button>
                  </td>
                </tr>
              ))}
              {blockedIps.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400 text-xs">Tidak ada IP yang diblokir</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
