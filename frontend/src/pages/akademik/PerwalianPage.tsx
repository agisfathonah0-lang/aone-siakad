import { useState, useEffect } from 'react';
import { get, put, post } from '../../api/client';
import { UserCheck, Search, Loader2, Plus, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/ui/Modal';

interface Bimbingan {
  id: string;
  nim: string;
  nama: string;
  angkatan: number;
  semester: number;
  status: string;
  prodi_nama: string;
  dosen_wali_id: string;
  dosen_wali_nama: string;
}

export default function PerwalianPage() {
  const [data, setData] = useState<Bimbingan[]>([]);
  const [dosenList, setDosenList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const [logModal, setLogModal] = useState(false);
  const [logMahasiswa, setLogMahasiswa] = useState<Bimbingan | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [logForm, setLogForm] = useState({ catatan: '', tanggal: new Date().toISOString().slice(0, 10) });

  const { user } = useAuth();
  const role = user?.role;
  const isDosen = role === 'dosen';

  useEffect(() => { load(); loadDosen(); }, []);

  async function load() {
    setLoading(true);
    try {
      const d = await get<Bimbingan[]>(`/akademik/perwalian/bimbingan?q=${search}`);
      setData(Array.isArray(d) ? d : []);
    } finally { setLoading(false); }
  }

  async function loadDosen() {
    try {
      const d = await get<any>('/akademik/dosen?limit=100');
      setDosenList(d.rows || []);
    } catch {}
  }

  async function openLog(m: Bimbingan) {
    setLogMahasiswa(m);
    setLogForm({ catatan: '', tanggal: new Date().toISOString().slice(0, 10) });
    try {
      const d = await get<any[]>(`/akademik/perwalian/log/${m.id}`);
      setLogs(Array.isArray(d) ? d : []);
    } catch { setLogs([]); }
    setLogModal(true);
  }

  async function addLog(e: React.FormEvent) {
    e.preventDefault();
    if (!logMahasiswa) return;
    try {
      await post(`/akademik/perwalian/log`, { mahasiswa_id: logMahasiswa.id, ...logForm });
      setLogForm({ catatan: '', tanggal: new Date().toISOString().slice(0, 10) });
      const d = await get<any[]>(`/akademik/perwalian/log/${logMahasiswa.id}`);
      setLogs(Array.isArray(d) ? d : []);
    } catch (err: any) { alert(err.response?.data?.message || 'Gagal menambah catatan'); }
  }

  async function setDosenWali(mhsId: string, dosenId: string) {
    await put(`/akademik/perwalian/${mhsId}/dosen-wali`, { dosen_wali_id: dosenId || null });
    setEditId(null);
    load();
  }

  if (isDosen) {
    return (
      <div className="space-y-4">
        <div><h1 className="text-2xl font-bold font-display tracking-tight dark:text-white">Perwalian</h1><p className="text-xs text-slate-500 dark:text-zinc-500">Mahasiswa Bimbingan</p></div>
        {loading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map(m => (
              <div key={m.id} className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center"><UserCheck size={20} className="text-indigo-500" /></div>
                  <div><p className="font-bold text-sm dark:text-white">{m.nama}</p><p className="text-xs text-slate-400 dark:text-zinc-500">{m.nim}</p></div>
                </div>
                <div className="text-xs space-y-1 text-slate-500 dark:text-zinc-400">
                  <p>{m.prodi_nama} &middot; Angkatan {m.angkatan}</p>
                  <p>Semester {m.semester} &middot; <span className={`font-bold ${m.status === 'aktif' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'}`}>{m.status}</span></p>
                </div>
                <button onClick={() => openLog(m)} className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"><MessageSquare size={14} /> Catatan</button>
              </div>
            ))}
            {data.length === 0 && <p className="text-sm text-slate-400 dark:text-zinc-500 col-span-3 text-center py-10">Tidak ada mahasiswa bimbingan</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold font-display tracking-tight dark:text-white">Perwalian</h1><p className="text-xs text-slate-500 dark:text-zinc-500">Atur dosen wali mahasiswa</p></div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari mahasiswa..." className="input-field pl-9" />
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold">
              <tr><th className="p-3 text-left">NIM</th><th className="p-3 text-left">Nama</th><th className="p-3 text-left">Prodi</th><th className="p-3 text-left">Dosen Wali</th><th className="p-3 text-center">Aksi</th></tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800/30">
              {data.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                  <td className="p-3 font-mono text-xs dark:text-zinc-300">{m.nim}</td>
                  <td className="p-3 font-semibold dark:text-white">{m.nama}</td>
                  <td className="p-3 text-xs text-slate-500 dark:text-zinc-400">{m.prodi_nama}</td>
                  <td className="p-3 text-xs dark:text-zinc-300">
                    {editId === m.id ? (
                      <select onChange={e => setDosenWali(m.id, e.target.value)} value={m.dosen_wali_id || ''} className="input-field text-xs p-1.5" autoFocus>
                        <option value="">Pilih</option>
                        {dosenList.map((d: any) => <option key={d.id} value={d.id}>{d.nama}</option>)}
                      </select>
                    ) : (
                      <span>{m.dosen_wali_nama || <span className="text-slate-300 dark:text-zinc-600">-</span>}</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => setEditId(editId === m.id ? null : m.id)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">{editId === m.id ? 'Batal' : 'Atur'}</button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-sm text-slate-400 dark:text-zinc-500">Belum ada data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={logModal} onClose={() => setLogModal(false)} title={logMahasiswa ? `Catatan Bimbingan: ${logMahasiswa.nama}` : 'Catatan Bimbingan'} size="lg">
        <form onSubmit={addLog} className="space-y-3 mb-4 p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tanggal</label><input type="date" value={logForm.tanggal} onChange={e => setLogForm({ ...logForm, tanggal: e.target.value })} className="input-field" required /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Catatan</label><textarea rows={3} value={logForm.catatan} onChange={e => setLogForm({ ...logForm, catatan: e.target.value })} className="input-field" placeholder="Tulis catatan bimbingan..." required /></div>
          <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"><Plus size={14} /> Tambah Catatan</button>
        </form>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {logs.map((l: any) => (
            <div key={l.id} className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl text-xs">
              <div className="flex items-center justify-between mb-1"><span className="font-semibold text-slate-600 dark:text-zinc-300">{new Date(l.tanggal).toLocaleDateString('id-ID')}</span>{l.dosen_nama && <span className="text-slate-400">oleh {l.dosen_nama}</span>}</div>
              <p className="text-slate-600 dark:text-zinc-400 whitespace-pre-wrap">{l.catatan}</p>
            </div>
          ))}
          {logs.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada catatan</p>}
        </div>
      </Modal>
    </div>
  );
}
