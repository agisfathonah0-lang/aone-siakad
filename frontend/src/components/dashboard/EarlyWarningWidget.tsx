import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../api/client';
import { AlertTriangle, AlertCircle, Info, TrendingUp, TrendingDown, ArrowRight, Loader2, Users } from 'lucide-react';

interface MahasiswaRisk {
  id: string; nim: string; nama: string; prodi: string;
  angkatan: string; semester: number; ipk: number; alpha: number;
  avgNilai: number; riskScore: number; level: string;
}

interface WarningData {
  total_dianalisis: number;
  risiko_tinggi: number;
  risiko_sedang: number;
  risiko_rendah: number;
  mahasiswa: MahasiswaRisk[];
}

export default function EarlyWarningWidget() {
  const [data, setData] = useState<WarningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    get<WarningData>('/ai/early-warning')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} className="text-amber-500" />
        <h2 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Early Warning System</h2>
      </div>
      <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} /></div>
    </div>
  );

  if (!data) return null;

  const displayMhs = showAll ? data.mahasiswa : data.mahasiswa.filter(m => m.level !== 'rendah').slice(0, 5);
  const pctTinggi = data.total_dianalisis ? Math.round((data.risiko_tinggi / data.total_dianalisis) * 100) : 0;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Early Warning System</h2>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, #EF4444 10%, transparent)' }}>
            <p className="text-lg font-bold text-red-500">{data.risiko_tinggi}</p>
            <p className="text-[10px] font-medium text-red-400">Risiko Tinggi</p>
          </div>
          <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, #F59E0B 10%, transparent)' }}>
            <p className="text-lg font-bold text-amber-500">{data.risiko_sedang}</p>
            <p className="text-[10px] font-medium text-amber-400">Risiko Sedang</p>
          </div>
          <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, #10B981 10%, transparent)' }}>
            <p className="text-lg font-bold text-emerald-500">{data.risiko_rendah}</p>
            <p className="text-[10px] font-medium text-emerald-400">Risiko Rendah</p>
          </div>
          <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}>
            <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{data.total_dianalisis}</p>
            <p className="text-[10px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Total</p>
          </div>
        </div>
        {pctTinggi > 0 && (
          <div className="mt-3 flex items-center gap-2 text-[10px]">
            <TrendingUp size={12} className="text-red-500" />
            <span style={{ color: 'var(--muted-foreground)' }}>
              {pctTinggi}% mahasiswa berisiko tinggi — <button onClick={() => navigate('ai?tab=early-warning')} className="text-primary font-semibold hover:underline">lihat detail</button>
            </span>
          </div>
        )}
      </div>

      {displayMhs.length > 0 && (
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {displayMhs.slice(0, showAll ? 50 : 5).map((m) => {
            const levelColor = m.level === 'tinggi' ? '#EF4444' : m.level === 'sedang' ? '#F59E0B' : '#10B981';
            const LevelIcon = m.level === 'tinggi' ? AlertCircle : m.level === 'sedang' ? Info : Info;
            return (
              <div key={m.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                style={{ borderColor: 'var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <LevelIcon size={12} style={{ color: levelColor }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>{m.nama}</p>
                  <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{m.nim} · {m.prodi} · Smt {m.semester} · IPK {m.ipk}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold" style={{ color: levelColor, fontFamily: 'var(--font-mono)' }}>{m.riskScore}</p>
                  <p className="text-[9px] capitalize" style={{ color: levelColor }}>{m.level}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data.mahasiswa.filter(m => m.level !== 'rendah').length > 5 && (
        <div className="px-4 py-2.5 border-t text-center" style={{ borderColor: 'var(--border)' }}>
          <button onClick={() => setShowAll(!showAll)} className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
            {showAll ? 'Tampilkan sedikit' : `Lihat semua (${data.risiko_tinggi + data.risiko_sedang})`}
          </button>
        </div>
      )}
    </div>
  );
}