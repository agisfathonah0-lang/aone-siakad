import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, GraduationCap, Briefcase, BookOpen, Target, Loader2, ChevronRight, Lightbulb, Award, TrendingUp } from 'lucide-react';

export default function AcademicAdvisorWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  async function getRecommendation(tipe: string) {
    setLoading(true);
    try {
      const result = await post<any>('/ai/academic-advisor', { tipe });
      setData(result);
    } catch {
      setData({ rekomendasi_mk: [], catatan_akademik: 'Gagal memuat rekomendasi. Coba lagi.' });
    } finally { setLoading(false); }
  }

  if (!data && !loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <GraduationCap size={32} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)', opacity: 0.3 }} />
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>AI Academic Advisor</p>
        <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Dapatkan rekomendasi mata kuliah & jalur karir personalized</p>
        <div className="flex gap-2 justify-center">
          <button onClick={() => getRecommendation('mk')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all"
            style={{ background: 'var(--primary)' }}>
            <BookOpen size={14} /> Rekomendasi MK
          </button>
          <button onClick={() => getRecommendation('karir')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all border"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <Briefcase size={14} /> Jalur Karir
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <Loader2 size={24} className="animate-spin mx-auto mb-3" style={{ color: 'var(--primary)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Menganalisis data akademik...</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>AI memproses IPK, nilai, dan kurikulum</p>
      </div>
    );
  }

  const mkList = data?.rekomendasi_mk || [];
  const karirList = data?.jalur_karir || [];
  const displayMk = showAll ? mkList : mkList.slice(0, 4);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-500" />
          <h2 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>AI Academic Advisor</h2>
        </div>
        {data && (
          <div className="flex items-center gap-2 text-[10px]">
            <TrendingUp size={12} className="text-emerald-500" />
            <span className="font-semibold" style={{ color: 'var(--muted-foreground)' }}>IPK {data.ipk}</span>
          </div>
        )}
      </div>

      {data?.rekomendasi_mk?.length > 0 && (
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1.5 mb-3">
            <BookOpen size={14} className="text-blue-500" />
            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Rekomendasi Mata Kuliah Semester Depan</p>
          </div>
          <div className="space-y-2">
            {displayMk.map((mk: any, i: number) => {
              const priorityColor = mk.prioritas === 'wajib' ? '#3B82F6' : mk.prioritas === 'rekomendasi' ? '#10B981' : '#8B5CF6';
              const priorityLabel = mk.prioritas === 'wajib' ? 'Wajib' : mk.prioritas === 'rekomendasi' ? 'Rekomendasi' : 'Opsional';
              return (
                <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg transition-colors"
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: priorityColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{mk.nama}</p>
                    <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{mk.alasan}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${priorityColor}20`, color: priorityColor }}>{mk.sks} SKS</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${priorityColor}15`, color: priorityColor }}>{priorityLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {mkList.length > 4 && (
            <button onClick={() => setShowAll(!showAll)} className="mt-2 text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
              {showAll ? 'Tutup' : `Lihat semua ${mkList.length} MK`} <ChevronRight size={12} />
            </button>
          )}
        </div>
      )}

      {data?.jalur_karir?.length > 0 && (
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1.5 mb-3">
            <Briefcase size={14} className="text-amber-500" />
            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Rekomendasi Jalur Karir</p>
          </div>
          <div className="space-y-2">
            {karirList.map((k: any, i: number) => (
              <div key={i} className="p-2.5 rounded-lg transition-colors"
                style={{ border: '1px solid var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{k.bidang}</p>
                  <span className="text-[9px] capitalize px-1.5 py-0.5 rounded-full"
                    style={{ background: k.level === 'pemula' ? '#10B98120' : k.level === 'menengah' ? '#F59E0B20' : '#EF444420', color: k.level === 'pemula' ? '#10B981' : k.level === 'menengah' ? '#F59E0B' : '#EF4444' }}>
                    {k.level}
                  </span>
                </div>
                <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{k.prospek}</p>
                {k.mk_pendukung?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {k.mk_pendukung.map((mk: string) => (
                      <span key={mk} className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{mk}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.skill_gap?.length > 0 && (
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={14} className="text-red-500" />
            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Skill Gap</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.skill_gap.map((s: string) => (
              <span key={s} className="text-[10px] px-2 py-1 rounded-lg" style={{ background: 'color-mix(in srgb, #EF4444 10%, transparent)', color: '#EF4444' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {data?.rekomendasi_sertifikasi?.length > 0 && (
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Award size={14} className="text-purple-500" />
            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Sertifikasi Rekomendasi</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.rekomendasi_sertifikasi.map((s: string) => (
              <span key={s} className="text-[10px] px-2 py-1 rounded-lg" style={{ background: 'color-mix(in srgb, #8B5CF6 10%, transparent)', color: '#8B5CF6' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {data?.catatan_akademik && (
        <div className="p-4">
          <div className="flex items-start gap-2">
            <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{data.catatan_akademik}</p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="px-4 py-2.5 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
          <button onClick={() => getRecommendation('mk')} className="flex-1 py-2 text-[10px] font-semibold rounded-lg transition-all" style={{ background: 'var(--secondary)', color: 'var(--foreground)' }}>
            <BookOpen size={12} className="inline mr-1" /> Rekomendasi MK
          </button>
          <button onClick={() => getRecommendation('karir')} className="flex-1 py-2 text-[10px] font-semibold rounded-lg transition-all" style={{ background: 'var(--secondary)', color: 'var(--foreground)' }}>
            <Briefcase size={12} className="inline mr-1" /> Jalur Karir
          </button>
          <button onClick={() => getRecommendation('semua')} className="flex-1 py-2 text-[10px] font-semibold rounded-lg text-white transition-all" style={{ background: 'var(--primary)' }}>
            <Sparkles size={12} className="inline mr-1" /> Lengkap
          </button>
        </div>
      )}
    </div>
  );
}