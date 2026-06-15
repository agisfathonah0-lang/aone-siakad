import { useState, useEffect } from 'react';
import { get, patch } from '../../api/client';
import { Bell, CheckCheck, Loader2, Info, CalendarCheck, DollarSign, UserCheck, AlertCircle } from 'lucide-react';

interface Notif {
  id: string;
  judul: string;
  pesan: string | null;
  tipe: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const tipeIcons: Record<string, any> = { info: Info, akademik: CalendarCheck, keuangan: DollarSign, approval: UserCheck, warning: AlertCircle };

export default function NotifikasiPage() {
  const [data, setData] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const d = await get<any>('/akademik/notifikasi');
      setData(d.rows || []);
      setUnread(d.unread || 0);
    } finally { setLoading(false); }
  }

  async function markRead(id: string) {
    await patch(`/akademik/notifikasi/${id}/read`, {});
    load();
  }

  async function markAllRead() {
    await patch('/akademik/notifikasi/read-all', {});
    load();
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Notifikasi</h1><p className="text-xs text-slate-500 dark:text-zinc-500">{unread} belum dibaca</p></div>
        {unread > 0 && <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition"><CheckCheck size={14} /> Tandai Dibaca</button>}
      </div>

      <div className="space-y-2">
        {data.map(n => {
          const Icon = tipeIcons[n.tipe] || Info;
          return (
            <div key={n.id} onClick={() => !n.is_read && markRead(n.id)} className={`bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 transition flex items-start gap-3 cursor-pointer ${!n.is_read ? 'ring-indigo-200 dark:ring-indigo-800/50 shadow-md' : 'ring-slate-200/50 dark:ring-zinc-800/30 opacity-70'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.is_read ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400'}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold dark:text-white">{n.judul}</p>
                {n.pesan && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{n.pesan}</p>}
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{new Date(n.created_at).toLocaleString('id-ID')}</p>
              </div>
              {!n.is_read && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />}
            </div>
          );
        })}
        {data.length === 0 && (
          <div className="text-center py-16">
            <Bell size={40} className="mx-auto text-slate-300 dark:text-zinc-600 mb-3" />
            <p className="text-sm text-slate-400 dark:text-zinc-500">Belum ada notifikasi</p>
          </div>
        )}
      </div>
    </div>
  );
}
