import { useState } from 'react';
import { post } from '../../api/client';
import { Sparkles, Loader2, CheckCircle, AlertCircle, ThumbsUp, ThumbsDown, Lightbulb, Star, Send, FileText } from 'lucide-react';

export default function AutoGradingWidget() {
  const [soal, setSoal] = useState('');
  const [jawaban, setJawaban] = useState('');
  const [rubrik, setRubrik] = useState('');
  const [maxNilai, setMaxNilai] = useState(100);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function grade() {
    if (!soal.trim() || !jawaban.trim()) return;
    setLoading(true);
    try {
      const r = await post<any>('/ai/auto-grade', { soal, jawaban, rubrik: rubrik || undefined, max_nilai: maxNilai });
      setResult(r);
    } catch {
      setResult({ skor: 0, persentase: 0, feedback: 'Gagal mengoreksi. Coba lagi.', kekuatan: [], kelemahan: [], saran_perbaikan: '' });
    } finally { setLoading(false); }
  }

  const scoreColor = result?.persentase >= 80 ? '#10B981' : result?.persentase >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
        <FileText size={16} className="text-emerald-500" />
        <h2 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Auto-grading Essay</h2>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Soal / Pertanyaan</label>
          <textarea value={soal} onChange={e => setSoal(e.target.value)} rows={2} placeholder="Masukkan soal..."
            className="w-full text-xs px-3 py-2 rounded-lg resize-none" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Jawaban Mahasiswa</label>
          <textarea value={jawaban} onChange={e => setJawaban(e.target.value)} rows={4} placeholder="Tempel jawaban mahasiswa di sini..."
            className="w-full text-xs px-3 py-2 rounded-lg resize-none" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Nilai Maksimal</label>
            <input type="number" value={maxNilai} onChange={e => setMaxNilai(parseInt(e.target.value) || 100)}
              className="w-full text-xs px-3 py-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Rubrik (opsional)</label>
            <input value={rubrik} onChange={e => setRubrik(e.target.value)} placeholder="Kriteria penilaian..."
              className="w-full text-xs px-3 py-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          </div>
        </div>
        <button onClick={grade} disabled={loading || !soal.trim() || !jawaban.trim()}
          className="w-full py-2.5 text-xs font-bold text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'var(--primary)' }}>
          {loading ? <><Loader2 size={14} className="animate-spin" /> Mengoreksi...</> : <><Sparkles size={14} /> Koreksi dengan AI</>}
        </button>
      </div>

      {result && (
        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
          {/* Score */}
          <div className="p-4 text-center" style={{ background: 'var(--muted)' }}>
            <div className="text-4xl font-extrabold" style={{ color: scoreColor, fontFamily: 'var(--font-display)' }}>{result.persentase || result.skor}</div>
            <p className="text-xs mt-1 font-semibold" style={{ color: scoreColor }}>{result.persentase >= 80 ? 'Luar Biasa' : result.persentase >= 60 ? 'Cukup Baik' : 'Perlu Perbaikan'}</p>
            {result.skor != null && result.max_nilai && (
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Skor: {result.skor} / {result.max_nilai}</p>
            )}
          </div>

          {/* Feedback */}
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>{result.feedback}</p>
            </div>

            {result.kekuatan?.length > 0 && (
              <div>
                <p className="text-xs font-semibold flex items-center gap-1 mb-1.5" style={{ color: '#10B981' }}>
                  <ThumbsUp size={12} /> Kekuatan
                </p>
                <ul className="space-y-1">
                  {result.kekuatan.map((k: string) => (
                    <li key={k} className="text-[11px] flex items-start gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                      <span style={{ color: '#10B981' }}>+</span> {k}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.kelemahan?.length > 0 && (
              <div>
                <p className="text-xs font-semibold flex items-center gap-1 mb-1.5" style={{ color: '#EF4444' }}>
                  <ThumbsDown size={12} /> Kelemahan
                </p>
                <ul className="space-y-1">
                  {result.kelemahan.map((k: string) => (
                    <li key={k} className="text-[11px] flex items-start gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                      <span style={{ color: '#EF4444' }}>-</span> {k}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.saran_perbaikan && (
              <div className="p-3 rounded-lg" style={{ background: 'color-mix(in srgb, var(--primary) 8%, transparent)' }}>
                <p className="text-xs font-semibold flex items-center gap-1 mb-1" style={{ color: 'var(--primary)' }}>
                  <Star size={12} /> Saran Perbaikan
                </p>
                <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{result.saran_perbaikan}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}