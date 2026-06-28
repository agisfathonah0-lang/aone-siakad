import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, BookMarked, Loader2, AlertCircle, GraduationCap, Zap, Lightbulb } from 'lucide-react';

export default function SmartKRSWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [preferensi, setPreferensi] = useState('');
  const [showAll, setShowAll] = useState(false);

  async function getRecommendation() {
    setLoading(true);
    setShowAll(false);
    try {
      const result = await post<any>('/ai/smart-krs', { preferensi: preferensi || undefined });
      setData(result);
    } catch {
      setData({ rekomendasi_krs: [], catatan: ['Gagal memuat rekomendasi. Coba lagi.'], sks_maksimal: 0 });
    } finally { setLoading(false); }
  }

  function getPriorityColor(p: string) {
    switch (p) {
      case 'wajib': return { text: '#3B82F6', bg: '#3B82F620' };
      case 'rekomendasi': return { text: '#10B981', bg: '#10B98120' };
      case 'opsional': return { text: '#8B5CF6', bg: '#8B5CF620' };
      default: return { text: '#6B7280', bg: '#6B728020' };
    }
  }

  function getKategoriLabel(k: string) {
    switch (k) {
      case 'semester_ini': return 'Semester Ini';
      case 'semester_lalu': return 'Semester Lalu';
      case 'semester_depan': return 'Semester Depan';
      default: return k;
    }
  }

  const items = data?.rekomendasi_krs || [];
  const displayItems = showAll ? items : items.slice(0, 6);
  const sksUsed = data?.total_sks_rekomendasi || 0;
  const sksMax = data?.sks_maksimal || 0;
  const progressPct = sksMax > 0 ? Math.round((sksUsed / sksMax) * 100) : 0;
  const progressColor = progressPct > 90 ? '#EF4444' : progressPct > 75 ? '#F59E0B' : '#10B981';

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <BookMarked size={18} color="var(--primary)" />
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
          Smart KRS
        </h3>
      </div>
      <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 14 }}>
        Rekomendasi pengisian KRS berdasarkan IPK, SKS, dan kurikulum
      </p>

      {!data && !loading && (
        <div>
          <textarea
            value={preferensi}
            onChange={(e) => setPreferensi(e.target.value)}
            placeholder="Preferensi (opsional): hari, dosen, atau MK tertentu..."
            rows={2}
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: 12,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              resize: 'none',
              marginBottom: 10,
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={getRecommendation}
            style={{
              width: '100%',
              padding: '10px 16px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Sparkles size={15} />
            Rekomendasi KRS
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Loader2 size={22} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>Menganalisis kurikulum...</p>
        </div>
      )}

      {data && !loading && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            <div style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg)', borderRadius: 10 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: progressColor, margin: 0 }}>{sksUsed}</p>
              <p style={{ fontSize: 10, color: 'var(--muted)', margin: '2px 0 0' }}>SKS Diambil</p>
            </div>
            <div style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg)', borderRadius: 10 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', margin: 0 }}>{sksMax}</p>
              <p style={{ fontSize: 10, color: 'var(--muted)', margin: '2px 0 0' }}>SKS Maksimal</p>
            </div>
            <div style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg)', borderRadius: 10 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: data.sks_tersisa_kurikulum > 0 ? '#F59E0B' : '#10B981', margin: 0 }}>{data.sks_tersisa_kurikulum || 0}</p>
              <p style={{ fontSize: 10, color: 'var(--muted)', margin: '2px 0 0' }}>SKS Tersisa</p>
            </div>
          </div>

          {sksMax > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>
                <span>Kapasitas SKS</span>
                <span>{progressPct}%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(progressPct, 100)}%`, height: '100%', background: progressColor, borderRadius: 3, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )}

          {data.rekomendasi_krs?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                Rekomendasi MK ({items.length} MK)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {displayItems.map((item: any, i: number) => {
                  const pc = getPriorityColor(item.prioritas);
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 10px', background: 'var(--bg)', borderRadius: 10,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: pc.text,
                        background: pc.bg, flexShrink: 0,
                      }}>
                        {item.sks}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{item.nama}</p>
                        <p style={{ fontSize: 10, color: 'var(--muted)', margin: '1px 0 0' }}>
                          {item.kode} &middot; {getKategoriLabel(item.kategori)}
                        </p>
                      </div>
                      <span style={{
                        fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 6,
                        color: pc.text, background: pc.bg, whiteSpace: 'nowrap',
                      }}>
                        {item.prioritas}
                      </span>
                    </div>
                  );
                })}
              </div>
              {items.length > 6 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  style={{
                    width: '100%', padding: '6px', marginTop: 6, fontSize: 11,
                    color: 'var(--primary)', background: 'transparent', border: '1px dashed var(--border)',
                    borderRadius: 8, cursor: 'pointer',
                  }}
                >
                  {showAll ? 'Tampilkan sedikit' : `Lihat semua (${items.length} MK)`}
                </button>
              )}
            </div>
          )}

          {data.catatan?.length > 0 && (
            <div style={{ marginTop: 12, padding: 10, background: '#FEF3C720', borderRadius: 10, border: '1px solid #F59E0B30' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <Lightbulb size={13} color="#F59E0B" />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#92400E' }}>Catatan</span>
              </div>
              {data.catatan.map((c: string, i: number) => (
                <p key={i} style={{ fontSize: 11, color: '#92400E', margin: '2px 0', lineHeight: 1.4 }}>{c}</p>
              ))}
            </div>
          )}

          {data.strategi && (
            <div style={{ marginTop: 10, padding: 10, background: '#ECFDF520', borderRadius: 10, border: '1px solid #10B98130' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <Zap size={13} color="#10B981" />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#065F46' }}>Strategi</span>
              </div>
              <p style={{ fontSize: 11, color: '#065F46', margin: 0, lineHeight: 1.4 }}>{data.strategi}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
            <button
              onClick={getRecommendation}
              style={{
                flex: 1, padding: '8px 12px', backgroundColor: 'var(--primary)', color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}
            >
              <Sparkles size={13} /> Segarkan
            </button>
            <button
              onClick={() => navigate('/ai?tab=smart-krs')}
              style={{
                padding: '8px 12px', background: 'transparent', color: 'var(--primary)',
                border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, cursor: 'pointer',
              }}
            >
              Detail
            </button>
          </div>
        </div>
      )}
    </div>
  );
}