import { useState, useEffect, useRef } from 'react';
import { get, post } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { MessageCircle, Send, Loader2, Users, ArrowLeft, MoreVertical, UserPlus } from 'lucide-react';

interface Grup {
  id: string; nama: string; deskripsi: string | null;
  kode_mk: string | null; created_by: string;
  last_read_at: string; total_messages: number; unread: number;
}

interface Pesan {
  id: string; grup_id: string; user_id: string; pesan: string;
  user_nama: string; user_email: string; created_at: string;
}

export default function ChatKelasPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Grup[]>([]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [messages, setMessages] = useState<Pesan[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadGroups(); }, []);

  useEffect(() => {
    if (activeGroup) {
      loadMessages(activeGroup);
      markRead(activeGroup);
    }
  }, [activeGroup]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function loadGroups() {
    try {
      const d = await get<Grup[]>('/chat/grup');
      setGroups(d || []);
    } catch {} finally { setLoading(false); }
  }

  async function loadMessages(grupId: string) {
    try {
      const d = await get<Pesan[]>(`/chat/grup/${grupId}/messages`);
      setMessages(d || []);
    } catch {}
  }

  async function markRead(grupId: string) {
    try { await post(`/chat/grup/${grupId}/read`, {}); } catch {}
  }

  async function sendMessage() {
    if (!input.trim() || !activeGroup || sending) return;
    const msg = input.trim();
    setInput('');
    setSending(true);
    try {
      const result = await post<Pesan>(`/chat/grup/${activeGroup}/messages`, { pesan: msg });
      setMessages((prev) => [...prev, result]);
      loadGroups();
    } catch {} finally { setSending(false); }
  }

  async function createGroup() {
    if (!newNama.trim()) return;
    try {
      await post('/chat/grup', { nama: newNama, deskripsi: newDesc, anggota: [user?.id] });
      setShowCreate(false);
      setNewNama('');
      setNewDesc('');
      loadGroups();
    } catch {}
  }

  const activeData = groups.find(g => g.id === activeGroup);

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      {/* Sidebar grup */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 transition-all duration-200 border-r overflow-hidden`} style={{ borderColor: 'var(--border)' }}>
        <div className="w-72 h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Grup Kelas</h2>
            <button onClick={() => setShowCreate(!showCreate)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ color: 'var(--muted-foreground)' }}>
              <UserPlus size={15} />
            </button>
          </div>

          {showCreate && (
            <div className="p-3 border-b space-y-2" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
              <input value={newNama} onChange={e => setNewNama(e.target.value)} placeholder="Nama grup..." className="w-full text-xs px-3 py-2 rounded-lg"
                style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Deskripsi (opsional)..." className="w-full text-xs px-3 py-2 rounded-lg"
                style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
              <button onClick={createGroup} className="w-full py-2 text-xs font-bold text-white rounded-lg transition" style={{ background: 'var(--primary)' }}>
                Buat Grup
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} /></div>
            ) : groups.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle size={32} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Belum ada grup</p>
              </div>
            ) : (
              groups.map(g => (
                <button key={g.id} onClick={() => { setActiveGroup(g.id); setSidebarOpen(false); }}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    background: activeGroup === g.id ? 'var(--muted)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                  }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
                    <MessageCircle size={16} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>{g.nama}</p>
                      {g.unread > 0 && (
                        <span className="text-[9px] font-bold text-white rounded-full min-w-[16px] h-4 flex items-center justify-center px-1" style={{ background: 'var(--primary)' }}>
                          {g.unread > 9 ? '9+' : g.unread}
                        </span>
                      )}
                    </div>
                    {g.deskripsi && <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>{g.deskripsi}</p>}
                    {g.kode_mk && <p className="text-[9px] mt-0.5 font-mono" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>{g.kode_mk}</p>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Panel chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeGroup ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)', opacity: 0.3 }} />
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Pilih grup untuk mulai chat</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header chat */}
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                <ArrowLeft size={15} />
              </button>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
                <MessageCircle size={16} style={{ color: 'var(--primary)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{activeData?.nama}</p>
                {activeData?.kode_mk && <p className="text-[10px] font-mono" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>{activeData.kode_mk}</p>}
              </div>
              <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                <MoreVertical size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => {
                const isMe = m.user_id === user?.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[75%]">
                      {!isMe && (
                        <p className="text-[10px] font-medium mb-1 px-1" style={{ color: 'var(--muted-foreground)' }}>{m.user_nama}</p>
                      )}
                      <div className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                        style={{
                          background: isMe ? 'var(--primary)' : 'var(--muted)',
                          color: isMe ? 'white' : 'var(--foreground)',
                          borderBottomRightRadius: isMe ? 4 : 16,
                          borderBottomLeftRadius: isMe ? 16 : 4,
                        }}>
                        <span className="whitespace-pre-wrap">{m.pesan}</span>
                      </div>
                      <p className="text-[9px] mt-0.5 px-1" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>
                        {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Ketik pesan..." disabled={sending}
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.15)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <button onClick={sendMessage} disabled={sending || !input.trim()}
                  className="px-4 py-2.5 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--primary)' }}>
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
