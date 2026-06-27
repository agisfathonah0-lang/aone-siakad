import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Info, CalendarCheck, DollarSign, UserCheck, AlertCircle, CheckCheck, Loader2 } from 'lucide-react';
import { get, patch } from '../../api/client';

interface Notif {
  id: string; judul: string; pesan: string | null;
  tipe: string; link: string | null; is_read: boolean; created_at: string;
}

const tipeIcons: Record<string, any> = { info: Info, akademik: CalendarCheck, keuangan: DollarSign, approval: UserCheck, warning: AlertCircle };

export default function NotifBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) load();
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function load() {
    setLoading(true);
    try {
      const d = await get<any>('/akademik/notifikasi');
      setData((d.rows || []).slice(0, 5));
      setUnread(d.unread || 0);
    } catch {} finally { setLoading(false); }
  }

  async function markRead(id: string) {
    await patch(`/akademik/notifikasi/${id}/read`, {});
    load();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-lg border flex items-center justify-center transition-colors"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <Bell size={15} style={{ color: 'var(--muted-foreground)' }} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: '#EF4444', fontSize: 9, padding: '0 4px' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[360px] rounded-xl border shadow-xl overflow-hidden z-50"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Notifikasi</span>
            {unread > 0 && (
              <button onClick={async () => { await patch('/akademik/notifikasi/read-all', {}); load(); }}
                className="text-xs font-semibold flex items-center gap-1 transition-colors" style={{ color: 'var(--primary)' }}>
                <CheckCheck size={13} /> Baca Semua
              </button>
            )}
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} /></div>
            ) : data.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={28} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Belum ada notifikasi</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {data.map((n) => {
                  const Icon = tipeIcons[n.tipe] || Info;
                  return (
                    <div
                      key={n.id}
                      onClick={() => { if (!n.is_read) markRead(n.id); }}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                      style={{
                        background: n.is_read ? 'transparent' : 'color-mix(in srgb, var(--primary) 8%, transparent)',
                        opacity: n.is_read ? 0.6 : 1,
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: n.is_read ? 'var(--muted)' : 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
                        <Icon size={15} style={{ color: n.is_read ? 'var(--muted-foreground)' : 'var(--primary)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>{n.judul}</p>
                        {n.pesan && <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{n.pesan}</p>}
                      </div>
                      {!n.is_read && <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--primary)' }} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-4 py-2.5 border-t text-center" style={{ borderColor: 'var(--border)' }}>
            <button onClick={() => { setOpen(false); navigate('notifikasi'); }}
              className="text-xs font-semibold transition-colors" style={{ color: 'var(--primary)' }}>
              Lihat Semua Notifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}