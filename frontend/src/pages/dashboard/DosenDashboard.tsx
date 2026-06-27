import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Users, ClipboardCheck, Award, Clock, UserCheck, ArrowRight, CalendarDays, GraduationCap, TrendingUp, TrendingDown, BarChart3, BellRing } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, change, changeType }: { icon: any; label: string; value: string; color: string; change?: string; changeType?: 'up' | 'down' }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon size={18} className="text-white" /></div>
        {change && (
          <span className={`flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${changeType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {changeType === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{change}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{value}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      </div>
    </div>
  );
}

export default function DosenDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [perwalian, setPerwalian] = useState<any[]>([]);
  const [stats, setStats] = useState({ kelas: 0, mahasiswaBimbingan: 0, absensiTerisi: 0, nilaiDiinput: 0 });

  useEffect(() => {
    Promise.all([
      get<any>('/akademik/jadwal?limit=5').catch(() => ({ rows: [] })),
      get<any>('/akademik/perwalian/mahasiswa-bimbingan').catch(() => []),
      get<any>('/akademik/absensi?limit=1').catch(() => ({ pagination: { total: 0 } })),
      get<any>('/akademik/nilai?limit=1').catch(() => ({ pagination: { total: 0 } })),
    ]).then(([j, p, a, n]) => {
      setJadwal(j.rows || []);
      setPerwalian(Array.isArray(p) ? p : []);
      setStats({
        kelas: j.rows?.length || 0,
        mahasiswaBimbingan: Array.isArray(p) ? p.length : 0,
        absensiTerisi: a.pagination?.total || 0,
        nilaiDiinput: n.pagination?.total || 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 rounded-lg" style={{ background: 'var(--muted)' }} />
            <div className="h-7 w-24 mt-3 rounded" style={{ background: 'var(--muted)' }} />
            <div className="h-3 w-20 mt-2 rounded" style={{ background: 'var(--muted)' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Kelas Diampu" value={stats.kelas.toString()} color="bg-primary" change="+2" changeType="up" />
        <StatCard icon={Users} label="Mhs Bimbingan" value={stats.mahasiswaBimbingan.toString()} color="bg-indigo-500" change={stats.mahasiswaBimbingan > 0 ? '+0' : undefined} changeType={stats.mahasiswaBimbingan > 0 ? 'up' : undefined} />
        <StatCard icon={ClipboardCheck} label="Absensi Terisi" value={stats.absensiTerisi.toLocaleString()} color="bg-sky-500" />
        <StatCard icon={Award} label="Nilai Diinput" value={stats.nilaiDiinput.toLocaleString()} color="bg-violet-500" />
      </section>

      {/* Jadwal + Perwalian */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Jadwal Mengajar */}
        <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Jadwal Mengajar</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Hari ini</p>
            </div>
            <button onClick={() => navigate('jadwal')} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--primary)' }}>
              Lihat semua <ArrowRight size={12} />
            </button>
          </div>
          {jadwal.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <CalendarDays size={32} style={{ color: 'var(--muted-foreground)', opacity: 0.3 }} />
              <p className="text-sm font-semibold mt-3" style={{ color: 'var(--foreground)' }}>Tidak Ada Jadwal</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Belum ada jadwal hari ini</p>
            </div>
          ) : (
            <div className="space-y-2">
              {jadwal.map((j: any) => (
                <div key={j.id} className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer"
                  style={{ border: '1px solid var(--border)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--muted)' }}>
                    <BookOpen size={16} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>{j.mk_nama || j.mata_kuliah_id}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {j.jam_mulai?.slice(0, 5)} - {j.jam_selesai?.slice(0, 5)} · {j.ruangan || '-'} · {j.kelas || ''}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'var(--primary)15', color: 'var(--primary)' }}>
                    {j.sks} SKS
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mahasiswa Perwalian */}
        <div className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Mahasiswa Bimbingan</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Daftar mahasiswa wali</p>
            </div>
            <button onClick={() => navigate('perwalian')} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--primary)' }}>
              Lihat semua <ArrowRight size={12} />
            </button>
          </div>
          {perwalian.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <UserCheck size={32} style={{ color: 'var(--muted-foreground)', opacity: 0.3 }} />
              <p className="text-sm font-semibold mt-3" style={{ color: 'var(--foreground)' }}>Tidak Ada Bimbingan</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Belum ada mahasiswa bimbingan</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {perwalian.slice(0, 6).map((m: any) => (
                <div key={m.id} className="flex items-center gap-2.5 p-2 rounded-lg transition-colors"
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ background: 'var(--primary)' }}>
                    {(m.nama || '?').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>{m.nama}</p>
                    <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{m.nim} · Semester {m.semester || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-card rounded-xl border border-border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { icon: ClipboardCheck, label: 'Input Nilai', color: 'text-blue-600 bg-blue-50', path: 'nilai' },
            { icon: BookOpen, label: 'Absensi', color: 'text-indigo-600 bg-indigo-50', path: 'absensi' },
            { icon: CalendarDays, label: 'BAP', color: 'text-sky-600 bg-sky-50', path: 'bap' },
            { icon: Users, label: 'Perwalian', color: 'text-violet-600 bg-violet-50', path: 'perwalian' },
          ].map(({ icon: Icon, label, color, path }) => (
            <button key={label} onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all"
              style={{ borderColor: 'var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}><Icon size={14} /></div>
              <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
