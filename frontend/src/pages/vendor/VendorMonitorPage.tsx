import { useState, useEffect } from 'react';
import { get } from '../../api/client';
import { Server, Cpu, MemoryStick, Activity, Loader2 } from 'lucide-react';

interface MonitorData {
  server: { hostname: string; platform: string; arch: string; uptime: string; nodeVersion: string; startTime: string };
  cpu: { usage: number; cores: number; model: string };
  memory: { total: number; used: number; free: number; usagePercent: number };
  tenants: { total: number; active: number };
  tickets: { total: number; open: number };
}

export default function VendorMonitorPage() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { get<MonitorData>('/vendor/monitor').then(setData).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;
  if (!data) return <div className="text-center py-20 text-sm text-zinc-400">Gagal memuat data monitor</div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">System Monitor</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-500">Status server & performa platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card dark:dark-card p-4">
          <div className="flex items-center gap-2 mb-3"><Server size={16} className="text-indigo-500" /><span className="text-xs font-bold dark:text-white">Server</span></div>
          <div className="space-y-1.5 text-xs text-slate-500 dark:text-zinc-400">
            <p>Hostname: <span className="text-slate-700 dark:text-zinc-200 font-mono">{data.server.hostname}</span></p>
            <p>Platform: {data.server.platform} ({data.server.arch})</p>
            <p>Node: {data.server.nodeVersion}</p>
            <p>Uptime: <span className="text-emerald-500 font-bold">{data.server.uptime}</span></p>
          </div>
        </div>

        <div className="card dark:dark-card p-4">
          <div className="flex items-center gap-2 mb-3"><Cpu size={16} className="text-indigo-500" /><span className="text-xs font-bold dark:text-white">CPU</span></div>
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1"><span className="text-slate-500 dark:text-zinc-400">Usage</span><span className="font-bold dark:text-white">{data.cpu.usage}%</span></div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-zinc-700 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(data.cpu.usage, 100)}%`, backgroundColor: data.cpu.usage > 80 ? '#ef4444' : data.cpu.usage > 50 ? '#f59e0b' : '#10b981' }} />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">{data.cpu.cores} cores · {data.cpu.model?.substring(0, 40)}</p>
        </div>

        <div className="card dark:dark-card p-4">
          <div className="flex items-center gap-2 mb-3"><MemoryStick size={16} className="text-indigo-500" /><span className="text-xs font-bold dark:text-white">Memory</span></div>
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1"><span className="text-slate-500 dark:text-zinc-400">Usage</span><span className="font-bold dark:text-white">{data.memory.usagePercent}%</span></div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-zinc-700 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(data.memory.usagePercent, 100)}%`, backgroundColor: data.memory.usagePercent > 80 ? '#ef4444' : data.memory.usagePercent > 50 ? '#f59e0b' : '#10b981' }} />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">{data.memory.used} MB / {data.memory.total} MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card dark:dark-card p-4 flex items-center gap-3">
          <Activity size={20} className="text-indigo-500" />
          <div>
            <p className="text-xs font-bold dark:text-white">Tenants</p>
            <p className="text-lg font-extrabold dark:text-white">{data.tenants.active} <span className="text-xs text-slate-400 font-medium">/ {data.tenants.total} aktif</span></p>
          </div>
        </div>
        <div className="card dark:dark-card p-4 flex items-center gap-3">
          <Activity size={20} className="text-amber-500" />
          <div>
            <p className="text-xs font-bold dark:text-white">Tickets Terbuka</p>
            <p className="text-lg font-extrabold dark:text-white">{data.tickets.open} <span className="text-xs text-slate-400 font-medium">/ {data.tickets.total} total</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
