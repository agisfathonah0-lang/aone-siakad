import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { post, get, del } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Bot, Send, Trash2, Loader2, Sparkles, BookOpen, ScrollText,
  AlertTriangle, BarChart3, User, GraduationCap, BookMarked,
  FileText, CheckCircle, AlertCircle, RefreshCw, Plus,
  Gauge, Zap,
} from 'lucide-react';

const tabs = [
  { id: 'chat', label: 'AI Chatbot', icon: Bot },
  { id: 'rps', label: 'Generate RPS', icon: BookOpen },
  { id: 'plagiarism', label: 'Plagiarism Check', icon: AlertTriangle },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const suggestions = [
  'Jelaskan cara mengisi KRS',
  'Apa saja syarat sidang skripsi?',
  'Berapa SKS maksimal per semester?',
  'Bagaimana cara mengundurkan diri?',
  'Apa itu IPK dan cara menghitungnya?',
];

export default function AIPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'chat');
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    get<any>('/ai/usage').then(setUsage).catch(() => {});
  }, []);

  function switchTab(id: string) {
    setTab(id);
    setSearchParams(id === 'chat' ? {} : { tab: id }, { replace: true });
  }

  const pctUsed = usage?.daily?.used != null && usage?.daily?.limit ? Math.round((usage.daily.used / usage.daily.limit) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 mb-1">
        <Sparkles size={20} className="text-emerald-500" />
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Fitur AI</h1>
      </div>
      <p className="text-xs text-slate-500 dark:text-zinc-400 -mt-2">
        Kecerdasan buatan untuk membantu kegiatan akademik
      </p>

      {usage && (
        <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold dark:text-white">Kuota AI</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                usage.provider === 'gemini' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'
              }`}>{usage.provider === 'gemini' ? 'Gemini' : 'OpenAI'}</span>
              <span className="text-[10px] text-slate-400 font-mono">{usage.model}</span>
            </div>
            <span className="text-[10px] text-slate-400">
              <Zap size={11} className="inline mr-1 text-amber-400" />
              ~${usage.estCostUsd} bulan ini
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${
              pctUsed > 80 ? 'bg-rose-500' : pctUsed > 50 ? 'bg-amber-500' : 'bg-emerald-500'
            }`} style={{ width: `${Math.min(pctUsed, 100)}%` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
            <span>{usage.daily.used} / {usage.daily.limit} hari ini</span>
            <span>{usage.monthly.used} / {usage.monthly.limit} bulan ini</span>
          </div>
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar bg-white dark:bg-zinc-900/50 rounded-xl p-1.5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => switchTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                tab === t.id
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}>
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'chat' && <ChatTab user={user} />}
      {tab === 'rps' && <RPSTab user={user} />}
      {tab === 'plagiarism' && <PlagiarismTab />}
      {tab === 'analytics' && <AnalyticsTab />}
    </div>
  );
}

function ChatTab({ user }: { user: any }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan. Coba lagi.' }]);
    } finally { setLoading(false); }
  }

  async function clearChat() {
    await del('/ai/chat/history');
    setMessages([]);
  }

  if (loadingHistory) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-emerald-500" /></div>;

  return (
    <div className="bg-white dark:bg-zinc-900/50 rounded-2xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-emerald-500" />
          <span className="text-sm font-bold dark:text-white">AI Asisten Akademik</span>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors">
            <Trash2 size={13} /> Hapus Riwayat
          </button>
        )}
      </div>

      <div className="h-[400px] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot size={36} className="mx-auto text-emerald-300 mb-3" />
            <p className="text-sm text-slate-400 mb-4">Tanyakan seputar akademik</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {suggestions.map((s) => (
                <button key={s} onClick={() => { setInput(s); }}
                  className="px-3 py-1.5 text-xs rounded-full bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-all border border-slate-200 dark:border-zinc-700">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === 'user'
                ? 'bg-emerald-500 text-white rounded-br-md'
                : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded-bl-md'
            }`}>
              {m.role === 'assistant' && (
                <Bot size={13} className="inline mr-1.5 text-emerald-500 mb-0.5" />
              )}
              <span className="whitespace-pre-wrap">{m.content}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 dark:bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-slate-400">
              <Loader2 size={14} className="animate-spin inline mr-2" />
              Memikirkan jawaban...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ketik pesan..." disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:text-white disabled:opacity-50" />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function RPSTab({ user }: { user: any }) {
  const [form, setForm] = useState({ mata_kuliah: '', prodi: '', sks: 3, semester: 1, capaian_pembelajaran: '', deskripsi: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    get<any[]>('/ai/generate-rps/history').then(setHistory).catch(() => {});
  }, []);

  async function generate() {
    if (!form.mata_kuliah || !form.prodi) return;
    setLoading(true);
    setResult('');
    try {
      const r = await post<any>('/ai/generate-rps', form);
      setResult(r.rps);
    } catch { setResult('Gagal generate RPS. Coba lagi.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-emerald-500" />
          <h2 className="text-sm font-bold font-display dark:text-white">Parameter RPS</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Nama Mata Kuliah', key: 'mata_kuliah', type: 'text' },
            { label: 'Program Studi', key: 'prodi', type: 'text' },
            { label: 'SKS', key: 'sks', type: 'number' },
            { label: 'Semester', key: 'semester', type: 'number' },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1 block">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:text-white" />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1 block">Capaian Pembelajaran (opsional)</label>
            <textarea value={form.capaian_pembelajaran} onChange={(e) => setForm({ ...form, capaian_pembelajaran: e.target.value })} rows={2}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:text-white resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1 block">Deskripsi (opsional)</label>
            <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={2}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:text-white resize-none" />
          </div>
          <button onClick={generate} disabled={loading}
            className="w-full py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Generate...</> : <><Sparkles size={15} /> Generate RPS</>}
          </button>
        </div>
        {history.length > 0 && (
          <button onClick={() => setShowHistory(!showHistory)} className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-500 transition-colors">
            <RefreshCw size={13} /> Riwayat ({history.length})
          </button>
        )}
        {showHistory && (
          <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
            {history.map((h: any) => (
              <div key={h.id} className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
                {h.mata_kuliah} - {h.prodi} ({h.sks} SKS)
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
        <div className="flex items-center gap-2 mb-4">
          <ScrollText size={16} className="text-emerald-500" />
          <h2 className="text-sm font-bold font-display dark:text-white">Hasil RPS</h2>
        </div>
        {result ? (
          <pre className="text-xs text-slate-600 dark:text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed max-h-[500px] overflow-y-auto">{result}</pre>
        ) : (
          <div className="text-center py-16 text-slate-300 dark:text-zinc-600">
            <FileText size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Isi parameter dan klik Generate</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlagiarismTab() {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const r = await post<any>('/ai/plagiarism/check', { text, title: title || undefined });
      setResult(r);
    } catch { setResult({ skor_plagiarisme: 0, indikasi: 'error', analisis: 'Gagal memeriksa. Coba lagi.', saran: '' }); }
    finally { setLoading(false); }
  }

  const getColor = (skor: number) => {
    if (skor < 30) return 'text-emerald-500';
    if (skor < 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getBg = (skor: number) => {
    if (skor < 30) return 'bg-emerald-50 dark:bg-emerald-900/20 ring-emerald-500/20';
    if (skor < 60) return 'bg-amber-50 dark:bg-amber-900/20 ring-amber-500/20';
    return 'bg-rose-50 dark:bg-rose-900/20 ring-rose-500/20';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-amber-500" />
          <h2 className="text-sm font-bold font-display dark:text-white">Cek Plagiarisme</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1 block">Judul (opsional)</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul dokumen..."
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:text-white" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1 block">Teks yang akan diperiksa</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Tempel teks di sini..."
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:text-white resize-none" />
          </div>
          <button onClick={check} disabled={loading || !text.trim()}
            className="w-full py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Memeriksa...</> : <><Search size={15} /> Periksa Plagiarisme</>}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={16} className="text-emerald-500" />
          <h2 className="text-sm font-bold font-display dark:text-white">Hasil Analisis</h2>
        </div>
        {result ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${getBg(result.skor_plagiarisme)} ring-1 text-center`}>
              <p className={`text-4xl font-extrabold ${getColor(result.skor_plagiarisme)}`}>{result.skor_plagiarisme}%</p>
              <p className={`text-xs font-semibold mt-1 ${getColor(result.skor_plagiarisme)}`}>
                {result.indikasi === 'rendah' ? 'Aman' : result.indikasi === 'sedang' ? 'Perlu Ditinjau' : result.indikasi === 'tinggi' ? 'Terindikasi Plagiarisme' : result.indikasi}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Analisis</p>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{result.analisis}</p>
            </div>
            {result.saran && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Saran</p>
                <p className="text-xs text-slate-600 dark:text-zinc-300">{result.saran}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-300 dark:text-zinc-600">
            <Search size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Masukkan teks untuk diperiksa</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const [tipe, setTipe] = useState<'performa' | 'risiko' | 'rekomendasi'>('performa');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    try {
      const r = await post<any>('/ai/analytics/mahasiswa', { tipe });
      setResult(r);
    } catch { setResult({ ringkasan: 'Gagal menganalisis. Coba lagi.', detail: [], saran_akademik: [] }); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-emerald-500" />
          <h2 className="text-sm font-bold font-display dark:text-white">Analisis Mahasiswa</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-2 block">Tipe Analisis</label>
            <div className="flex gap-2">
              {[
                { id: 'performa', label: 'Performa', icon: User },
                { id: 'risiko', label: 'Risiko Dropout', icon: AlertCircle },
                { id: 'rekomendasi', label: 'Rekomendasi', icon: GraduationCap },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setTipe(t.id as any)}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-semibold transition-all border ${
                      tipe === t.id
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-slate-600'
                    }`}>
                    <Icon size={18} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={analyze} disabled={loading}
            className="w-full py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Menganalisis...</> : <><BarChart3 size={15} /> Analisis Sekarang</>}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
        <div className="flex items-center gap-2 mb-4">
          <ScrollText size={16} className="text-emerald-500" />
          <h2 className="text-sm font-bold font-display dark:text-white">Hasil Analisis</h2>
        </div>
        {result ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800">
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{result.ringkasan}</p>
            </div>
            {result.detail?.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Detail</p>
                {result.detail.slice(0, 10).map((d: any, i: number) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
                    <span className="font-semibold">{d.nama || d.nim}</span>: {d.catatan || d.indikator || d.rekomendasi || d.tingkat_risiko}
                  </div>
                ))}
              </div>
            )}
            {result.saran_akademik?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Saran Akademik</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {result.saran_akademik.map((s: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-zinc-300">{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-300 dark:text-zinc-600">
            <BarChart3 size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Pilih tipe dan klik Analisis</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Search(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>; }
