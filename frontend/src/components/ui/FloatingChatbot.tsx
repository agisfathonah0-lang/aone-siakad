import { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { get, post, del } from '../../api/client';

const suggestions = [
  'Apa itu AONE SIAKAD?',
  'Fitur apa saja yang tersedia?',
  'Bagaimana cara mendaftar?',
  'Berapa harga berlangganan?',
  'Apakah ada demo gratis?',
];

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setShowHint(false);
      if (messages.length === 0) {
        get<any[]>('/ai/chat/history')
          .then((data) => {
            if (data && data.length > 0) {
              const hist = data.flatMap((h: any) => [
                { role: 'user', content: h.pesan },
                { role: 'assistant', content: h.respons },
              ]);
              setMessages(hist);
            }
          })
          .catch(() => {});
      }
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await post<any>('/ai/chat', { message: msg, history: historyPayload });
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {!open && showHint && (
          <div className="bg-white border border-emerald-100 rounded-2xl px-4 py-2.5 shadow-lg animate-fade-in text-sm text-slate-700 relative">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-500" />
              <span>Ada yang bisa dibantu?</span>
            </div>
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-emerald-100 rotate-45" />
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center relative"
          aria-label="Chat dengan AI"
        >
          {open ? (
            <X size={22} />
          ) : (
            <>
              <MessageCircle size={22} />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
            </>
          )}
        </button>
      </div>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden transition-all duration-300 origin-bottom-right ${
          open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
        style={{ maxHeight: 'min(600px, calc(100vh - 160px))' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">AI Assistant</p>
              <p className="text-emerald-100 text-[10px] font-medium">Online • Siap membantu</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Messages */}
        <div className="overflow-y-auto p-4 space-y-3" style={{ height: 360 }}>
          {messages.length === 0 && (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 mx-auto mb-3 flex items-center justify-center">
                <Bot size={28} className="text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-slate-800 mb-1">Halo! Ada yang bisa dibantu?</p>
              <p className="text-xs text-slate-400 mb-4">Tanya seputar AONE SIAKAD di sini</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); }}
                    className="px-3 py-1.5 text-xs rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:scale-105 transition-all border border-emerald-100 font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-br-md'
                    : 'bg-slate-50 text-slate-700 rounded-bl-md'
                }`}
              >
                <span className="whitespace-pre-wrap">{m.content}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Memikirkan jawaban...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ketik pesan..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 disabled:opacity-50 transition-all placeholder:text-slate-400"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}