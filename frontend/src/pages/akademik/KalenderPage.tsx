import { useState, useEffect } from 'react';
import { get, post, put, del as apiDel } from '../../api/client';
import Modal from '../../components/ui/Modal';
import { Plus, X, ChevronLeft, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { confirm } from '../../context/ConfirmContext';

interface Event {
  id: string;
  judul: string;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  tipe: string;
  deskripsi: string | null;
  warna: string;
}

const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function KalenderPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Event | null>(null);
  const [form, setForm] = useState({ judul: '', tanggal_mulai: '', tanggal_selesai: '', tipe: 'umum', deskripsi: '', warna: '#10b981' });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const d = await get<Event[]>('/akademik/kalender');
      setEvents(Array.isArray(d) ? d : []);
    } finally { setLoading(false); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (edit) { await put(`/akademik/kalender/${edit.id}`, form); }
    else { await post('/akademik/kalender', form); }
    setModal(false); setEdit(null);
    setForm({ judul: '', tanggal_mulai: '', tanggal_selesai: '', tipe: 'umum', deskripsi: '', warna: '#10b981' });
    load();
  }

  async function remove(id: string) {
    if (!(await confirm('Hapus acara ini?'))) return;
    await apiDel(`/akademik/kalender/${id}`);
    load();
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  function getEventsForDay(day: number) {
    return events.filter(e => {
      const start = new Date(e.tanggal_mulai);
      const end = e.tanggal_selesai ? new Date(e.tanggal_selesai) : start;
      const d = new Date(year, month, day);
      return d >= start && d <= end;
    });
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Kalender Akademik</h1><p className="text-xs text-slate-500 dark:text-zinc-500">{events.length} acara</p></div>
        <button onClick={() => { setModal(true); setEdit(null); setForm({ judul: '', tanggal_mulai: '', tanggal_selesai: '', tipe: 'umum', deskripsi: '', warna: '#10b981' }); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah</button>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800/30">
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 dark:text-zinc-400"><ChevronLeft size={18} /></button>
          <h2 className="font-bold text-lg dark:text-white">{months[month]} {year}</h2>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 dark:text-zinc-400"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase border-b border-slate-100 dark:border-zinc-800/30">
          {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => <div key={d} className="p-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="min-h-[80px] p-1 border-b border-r border-slate-100 dark:border-zinc-800/30" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const isToday = isCurrentMonth && day === today.getDate();
            return (
              <div key={day} className={`min-h-[80px] p-1 border-b border-r border-slate-100 dark:border-zinc-800/30 text-sm ${isToday ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                <span className={`inline-block w-6 h-6 text-center leading-6 text-xs font-semibold rounded-full ${isToday ? 'bg-emerald-600 text-white' : 'dark:text-zinc-300'}`}>{day}</span>
                <div className="space-y-0.5 mt-0.5">
                  {dayEvents.slice(0, 2).map(ev => (
                    <div key={ev.id} className="text-[8px] leading-tight px-1 py-0.5 rounded text-white truncate cursor-pointer" style={{ backgroundColor: ev.warna || '#10b981' }} title={ev.judul}>{ev.judul}</div>
                  ))}
                  {dayEvents.length > 2 && <span className="text-[8px] text-slate-400 dark:text-zinc-500">+{dayEvents.length - 2}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 overflow-hidden">
        <div className="p-3.5 font-bold text-sm dark:text-white border-b border-slate-100 dark:border-zinc-800/30">Daftar Acara</div>
        <div className="divide-y divide-slate-100 dark:divide-zinc-800/30">
          {events.filter(e => new Date(e.tanggal_mulai).getFullYear() === year).map(e => (
            <div key={e.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: e.warna || '#10b981' }} />
                <div>
                  <p className="text-sm font-semibold dark:text-white">{e.judul}</p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">{new Date(e.tanggal_mulai).toLocaleDateString('id-ID')} {e.tanggal_selesai && `- ${new Date(e.tanggal_selesai).toLocaleDateString('id-ID')}`}</p>
                </div>
              </div>
              <button onClick={() => remove(e.id)} className="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Acara' : 'Tambah Acara'}>
        <form onSubmit={save} className="space-y-3">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Judul Acara</label><input value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} placeholder="Judul acara" required className="input-field" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tanggal Mulai</label><input type="date" value={form.tanggal_mulai} onChange={e => setForm({ ...form, tanggal_mulai: e.target.value })} required className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tanggal Selesai</label><input type="date" value={form.tanggal_selesai} onChange={e => setForm({ ...form, tanggal_selesai: e.target.value })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tipe</label>
              <select value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })} className="input-field">
                <option value="umum">Umum</option><option value="akademik">Akademik</option><option value="ujian">Ujian</option><option value="libur">Libur</option><option value="pendaftaran">Pendaftaran</option>
              </select>
            </div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Warna</label><input type="color" value={form.warna} onChange={e => setForm({ ...form, warna: e.target.value })} className="input-field h-[42px] cursor-pointer" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Deskripsi</label><textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} placeholder="Deskripsi (opsional)" className="input-field" rows={2} /></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
    </div>
  );
}