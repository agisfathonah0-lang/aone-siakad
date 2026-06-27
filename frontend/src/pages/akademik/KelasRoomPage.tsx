import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../api/client';
import { toast } from '../../context/ToastContext';
import { Plus, LogIn, BookOpen, Users, FileText, ClipboardList, Megaphone, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';

export default function KelasRoomPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [form, setForm] = useState({ nama: '', deskripsi: '', semester: '', tahun_akademik: '' });
  const [kode, setKode] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await get<any>('/akademik/kelas-room?limit=100');
      setRooms(res.rows || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await post<any>('/akademik/kelas-room', form);
      toast(res.message || 'Kelas berhasil dibuat', 'success');
      setShowCreate(false);
      setForm({ nama: '', deskripsi: '', semester: '', tahun_akademik: '' });
      fetchRooms();
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); } finally { setSaving(false); }
  };

  const handleEnroll = async () => {
    if (!kode.trim()) return;
    setSaving(true);
    try {
      const res = await post<any>('/akademik/kelas-room/enroll', { kode: kode.trim() });
      toast(res.message || 'Berhasil bergabung', 'success');
      setShowEnroll(false);
      setKode('');
      fetchRooms();
    } catch (err: any) { toast(err.response?.data?.message || err.message, 'error'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Kelas Saya</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Portal kelas virtual — materi, tugas, dan pengumuman</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchRooms} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><RefreshCw size={16} /></button>
          <button onClick={() => setShowEnroll(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"><LogIn size={14} /> Gabung</button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Buat Kelas</button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="h-5 w-3/4 rounded" style={{ background: 'var(--muted)' }} />
              <div className="h-3 w-1/2 mt-3 rounded" style={{ background: 'var(--muted)' }} />
              <div className="flex gap-3 mt-4"><div className="h-3 w-16 rounded" style={{ background: 'var(--muted)' }} /><div className="h-3 w-16 rounded" style={{ background: 'var(--muted)' }} /></div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <BookOpen size={48} style={{ color: 'var(--muted-foreground)', opacity: 0.2 }} />
          <p className="text-sm font-semibold mt-4" style={{ color: 'var(--foreground)' }}>Belum Ada Kelas</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Buat kelas baru atau gabung dengan kode enroll</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room: any) => (
            <button
              key={room.id}
              onClick={() => navigate(`/kelas-room/${room.id}`)}
              className="bg-card rounded-xl border border-border p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-indigo-500" />
                </div>
              </div>
              <h3 className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{room.nama}</h3>
              {room.deskripsi && <p className="text-[10px] mt-1 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{room.deskripsi}</p>}
              {room.dosen_nama && <p className="text-[10px] mt-2 font-medium" style={{ color: 'var(--primary)' }}>{room.dosen_nama}</p>}
              <div className="flex items-center gap-3 mt-3 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                <span className="flex items-center gap-1"><FileText size={11} />{room.materi_count}</span>
                <span className="flex items-center gap-1"><ClipboardList size={11} />{room.tugas_count}</span>
                <span className="flex items-center gap-1"><Megaphone size={11} />{room.pengumuman_count}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl shadow-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Buat Kelas Baru</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div><input required placeholder="Nama Kelas (contoh: Pemrograman Web A)" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} className="input-field" /></div>
              <div><textarea placeholder="Deskripsi (opsional)" value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} className="input-field" rows={3} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><input placeholder="Semester (Ganjil/Genap)" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} className="input-field" /></div>
                <div><input placeholder="T.A. (2025/2026)" value={form.tahun_akademik} onChange={e => setForm({ ...form, tahun_akademik: e.target.value })} className="input-field" /></div>
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">
                {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Buat Kelas'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowEnroll(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-2xl shadow-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Gabung Kelas</h2>
            <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>Masukkan kode enroll dari dosen Anda</p>
            <input placeholder="Kode Enroll" value={kode} onChange={e => setKode(e.target.value.toUpperCase())} className="input-field text-center text-lg font-bold tracking-widest uppercase" maxLength={8} />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowEnroll(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Batal</button>
              <button onClick={handleEnroll} disabled={saving || !kode.trim()} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20">
                {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Gabung'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
