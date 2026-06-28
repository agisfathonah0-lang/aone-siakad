import { useState } from 'react';
import { post } from '../../api/client';
import { Sparkles, Loader2, CalendarDays, Clock, MapPin, User, BookOpen, BarChart3, Info, Download, RefreshCw } from 'lucide-react';

export default function SmartSchedulerWidget() {
  const [prodiId, setProdiId] = useState('');
  const [semester, setSemester] = useState('');
  const [preferensi, setPreferensi] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function optimize() {
    setLoading(true);
    try {
      const r = await post<any>('/ai/schedule-optimize', {
        prodi_id: prodiId || undefined,
        semester: semester ? parseInt(semester) : undefined,
        preferensi: preferensi || undefined,
      });
      setResult(r);
    } catch {
      setResult({ jadwal: [], statistik: { total_kelas: 0 }, catatan: 'Gagal mengoptimalkan jadwal. Coba lagi.' });
    } finally { setLoading(false); }
  }

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const slots = ['07:30-09:10', '09:20-11:00', '11:10-12:50', '13:00-14:40', '14:50-16:30', '16:40-18:20'];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-card rounded-xl border border-border p-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays size={16} className="text-blue-500" />
          <h2 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Smart Course Scheduler</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Prodi</label>
            <input value={prodiId} onChange={e => setProdiId(e.target.value)} placeholder="ID Prodi (opsional)"
              className="w-full text-xs px-3 py-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          </div>
          <div>
            <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Semester</label>
            <input type="number" value={semester} onChange={e => setSemester(e.target.value)} placeholder="Contoh: 3"
              className="w-full text-xs px-3 py-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          </div>
          <div className="flex items-end">
            <button onClick={optimize} disabled={loading}
              className="w-full py-2 text-xs font-bold text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)' }}>
              {loading ? <><Loader2 size={14} className="animate-spin" /> Mengoptimalkan...</> : <><Sparkles size={14} /> Optimalkan Jadwal</>}
            </button>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Preferensi Tambahan (opsional)</label>
          <input value={preferensi} onChange={e => setPreferensi(e.target.value)}
            placeholder="Contoh: dosen A hanya bisa Senin-Rabu, ruang B khusus praktikum..."
            className="w-full text-xs px-3 py-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-card rounded-xl border border-border p-12 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: 'var(--primary)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>AI sedang menyusun jadwal optimal...</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Mempertimbangkan dosen, ruangan, dan preferensi</p>
        </div>
      )}

      {/* Statistics */}
      {result?.statistik && !loading && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Kelas', value: result.statistik.total_kelas || 0, icon: BookOpen, color: '#3B82F6' },
            { label: 'Total SKS', value: result.statistik.total_sks || 0, icon: BarChart3, color: '#10B981' },
            { label: 'Jadwal Pagi', value: `${result.statistik.pagi_persen || 0}%`, icon: Clock, color: '#F59E0B' },
            { label: 'Utilisasi', value: `${result.statistik.pemanfaatan_ruang || 0}%`, icon: MapPin, color: '#8B5CF6' },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-3 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <s.icon size={16} className="mx-auto mb-1" style={{ color: s.color }} />
              <p className="text-lg font-bold" style={{ color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</p>
              <p className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Table */}
      {result?.jadwal?.length > 0 && !loading && (
        <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Hasil Jadwal ({result.jadwal.length} kelas)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--muted)' }}>
                  <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>Hari</th>
                  <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>Jam</th>
                  <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>Mata Kuliah</th>
                  <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>Dosen</th>
                  <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>Ruangan</th>
                  <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>SKS</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {result.jadwal.map((j: any, i: number) => (
                  <tr key={i} className="transition-colors" onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    <td className="px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>{j.hari}</td>
                    <td className="px-3 py-2 font-mono" style={{ color: 'var(--muted-foreground)' }}>{j.jam}</td>
                    <td className="px-3 py-2" style={{ color: 'var(--foreground)' }}>{j.mk_nama || j.mk_kode}</td>
                    <td className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>{j.dosen}</td>
                    <td className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>{j.ruangan}</td>
                    <td className="px-3 py-2 font-mono font-semibold" style={{ color: 'var(--primary)' }}>{j.sks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes */}
      {result?.catatan && !loading && (
        <div className="bg-card rounded-xl border border-border p-4 flex items-start gap-2" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{result.catatan}</p>
        </div>
      )}
    </div>
  );
}