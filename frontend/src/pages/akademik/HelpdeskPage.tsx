import { useState, useEffect, useCallback } from 'react';
import { get, post, put } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import {
  Plus, RefreshCw, MessageSquare, Send, ChevronLeft, Clock,
  AlertCircle, CheckCircle, XCircle, Loader2, Paperclip,
  User, UserCheck, Flag, Filter,
} from 'lucide-react';

const statusBadge: Record<string, 'warning' | 'info' | 'success' | 'danger'> = {
  terbuka: 'warning', diproses: 'info', menunggu: 'warning', selesai: 'success', ditolak: 'danger',
};

const statusLabel: Record<string, string> = {
  terbuka: 'Terbuka', diproses: 'Diproses', menunggu: 'Menunggu', selesai: 'Selesai', ditolak: 'Ditolak',
};

const prioritasBadge: Record<string, 'default' | 'warning' | 'danger'> = {
  rendah: 'default', normal: 'default', tinggi: 'warning', urgent: 'danger',
};

const prioritasColor: Record<string, string> = {
  rendah: 'text-slate-400', normal: 'text-blue-400', tinggi: 'text-amber-500', urgent: 'text-red-500',
};

interface Kategori { id: string; nama: string; deskripsi: string; icon: string; }
interface Tiket { id: string; no_tiket: string; subjek: string; status: string; prioritas: string; kategori_nama: string; kategori_icon: string; user_nama: string; assigned_nama: string; created_at: string; updated_at: string; }
interface Pesan { id: string; user_id: string; user_nama: string; user_foto: string; user_role: string; pesan: string; lampiran: string; is_internal: boolean; created_at: string; }

export default function HelpdeskPage() {
  const { user } = useAuth();
  const isStaff = ['super_admin', 'admin', 'akademik'].includes(user?.role || '');

  const [data, setData] = useState<Tiket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKategori, setFilterKategori] = useState('');

  const [selectedTiket, setSelectedTiket] = useState<any>(null);
  const [pesan, setPesan] = useState<Pesan[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ kategori_id: '', subjek: '', deskripsi: '', prioritas: 'normal' });
  const [sending, setSending] = useState(false);

  const [messageText, setMessageText] = useState('');
  const [messageSending, setMessageSending] = useState(false);

  const [staffList, setStaffList] = useState<{ id: string; nama: string }[]>([]);

  useEffect(() => {
    get<Kategori[]>('/akademik/helpdesk/kategori').then(setKategori).catch(() => {});
    if (isStaff) {
      get<{ rows: { id: string; nama: string }[] }>('/akademik/users?role=admin,akademik&limit=200')
        .then(r => setStaffList(r.rows || [])).catch(() => {});
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filterStatus) params.set('status', filterStatus);
      if (filterKategori) params.set('kategori_id', filterKategori);
      const res = await get<{ rows: Tiket[]; pagination: { totalPages: number } }>(`/akademik/helpdesk?${params}`);
      setData(res.rows || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch {} finally { setLoading(false); }
  }, [page, filterStatus, filterKategori]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function openDetail(t: Tiket) {
    setSelectedTiket(t);
    setDetailLoading(true);
    try {
      const res = await get<any>(`/akademik/helpdesk/${t.id}`);
      setPesan(res.pesan || []);
      setSelectedTiket(res);
    } catch {} finally { setDetailLoading(false); }
  }

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await post('/akademik/helpdesk', form);
      setCreateModal(false);
      setForm({ kategori_id: '', subjek: '', deskripsi: '', prioritas: 'normal' });
      fetchData();
    } catch {} finally { setSending(false); }
  }

  async function sendMessage() {
    if (!messageText.trim() || !selectedTiket) return;
    setMessageSending(true);
    try {
      await post(`/akademik/helpdesk/${selectedTiket.id}/pesan`, { pesan: messageText });
      setMessageText('');
      const res = await get<any>(`/akademik/helpdesk/${selectedTiket.id}`);
      setPesan(res.pesan || []);
      setSelectedTiket(res);
    } catch {} finally { setMessageSending(false); }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await put(`/akademik/helpdesk/${id}/status`, { status });
      const res = await get<any>(`/akademik/helpdesk/${id}`);
      setPesan(res.pesan || []);
      setSelectedTiket(res);
      fetchData();
    } catch {}
  }

  async function assignTicket(id: string, staffId: string) {
    try {
      await put(`/akademik/helpdesk/${id}/assign`, { assigned_to: staffId });
      const res = await get<any>(`/akademik/helpdesk/${id}`);
      setSelectedTiket(res);
      fetchData();
    } catch {}
  }

  const columns = [
    { key: 'no_tiket', label: 'No. Tiket', render: (r: Tiket) => (
      <button onClick={() => openDetail(r)} className="text-indigo-600 dark:text-indigo-400 hover:underline font-mono text-xs font-medium">{r.no_tiket}</button>
    )},
    { key: 'subjek', label: 'Subjek', render: (r: Tiket) => (
      <button onClick={() => openDetail(r)} className="text-left hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        <span className="font-medium text-sm dark:text-white">{r.subjek}</span>
      </button>
    )},
    { key: 'kategori_nama', label: 'Kategori', render: (r: Tiket) => (
      <span className="text-xs text-slate-500 dark:text-zinc-400">{r.kategori_nama}</span>
    )},
    { key: 'prioritas', label: 'Prioritas', render: (r: Tiket) => (
      <span className={`text-xs font-semibold flex items-center gap-1 ${prioritasColor[r.prioritas] || ''}`}>
        <Flag size={11} /> {r.prioritas}
      </span>
    )},
    { key: 'status', label: 'Status', render: (r: Tiket) => (
      <Badge variant={statusBadge[r.status as keyof typeof statusBadge] || 'default'}>{statusLabel[r.status as keyof typeof statusLabel] || r.status}</Badge>
    )},
    { key: 'assigned_nama', label: 'Ditugaskan', render: (r: Tiket) => (
      <span className="text-xs text-slate-400">{r.assigned_nama || '-'}</span>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Helpdesk</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Laporan masalah & permohonan bantuan</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><RefreshCw size={16} /></button>
          <button onClick={() => setCreateModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tiket Baru</button>
        </div>
      </div>

      {selectedTiket ? (
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <button onClick={() => setSelectedTiket(null)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors">
              <ChevronLeft size={14} /> Kembali
            </button>
            <div className="flex items-center gap-2">
              {isStaff && selectedTiket.status !== 'selesai' && selectedTiket.status !== 'ditolak' && (
                <>
                  <select onChange={e => updateStatus(selectedTiket.id, e.target.value)} className="input-field text-xs py-1.5" defaultValue="">
                    <option value="" disabled>Ubah Status</option>
                    <option value="diproses">Proses</option>
                    <option value="menunggu">Menunggu</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditolak">Tolak</option>
                  </select>
                  <select onChange={e => assignTicket(selectedTiket.id, e.target.value)} className="input-field text-xs py-1.5 max-w-[180px]" defaultValue="">
                    <option value="" disabled>Tugaskan ke</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                  </select>
                </>
              )}
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-bold dark:text-white">{selectedTiket.subjek}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedTiket.no_tiket}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusBadge[selectedTiket.status as keyof typeof statusBadge] || 'default'}>
                  {statusLabel[selectedTiket.status as keyof typeof statusLabel] || selectedTiket.status}
                </Badge>
                <span className={`text-xs font-semibold flex items-center gap-1 ${prioritasColor[selectedTiket.prioritas] || ''}`}>
                  <Flag size={11} /> {selectedTiket.prioritas}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><User size={11} /> {selectedTiket.user_nama}</span>
              <span className="flex items-center gap-1"><Clock size={11} /> {new Date(selectedTiket.created_at).toLocaleDateString('id-ID')}</span>
              {selectedTiket.kategori_nama && <span>{selectedTiket.kategori_nama}</span>}
            </div>

            {selectedTiket.deskripsi && (
              <div className="text-sm p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg dark:text-zinc-300 whitespace-pre-wrap">{selectedTiket.deskripsi}</div>
            )}
          </div>

          <div className="px-4 pb-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={12} /> Pesan ({pesan.length})
            </h3>
            {detailLoading ? (
              <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-slate-400" /></div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {pesan.map((p) => (
                  <div key={p.id} className={`flex gap-2.5 ${p.is_internal ? 'opacity-70' : ''}`}>
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                      <User size={12} className="text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold dark:text-white">{p.user_nama}</span>
                        <span className="text-[10px] text-slate-400">{new Date(p.created_at).toLocaleString('id-ID')}</span>
                        {p.is_internal && <Badge variant="warning">Internal</Badge>}
                        {p.user_role === 'mahasiswa' ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-500">Mahasiswa</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">Staff</span>
                        )}
                      </div>
                      <p className="text-sm mt-0.5 dark:text-zinc-300 whitespace-pre-wrap">{p.pesan}</p>
                      {p.lampiran && (
                        <a href={p.lampiran} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline flex items-center gap-1 mt-1">
                          <Paperclip size={10} /> Lampiran
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <input value={messageText} onChange={e => setMessageText(e.target.value)}
                placeholder="Ketik pesan..." className="input-field flex-1 text-sm"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
              <button onClick={sendMessage} disabled={!messageText.trim() || messageSending}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl transition-all text-xs flex items-center gap-1.5">
                {messageSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Kirim
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <select value={filterStatus} onChange={e => { setPage(1); setFilterStatus(e.target.value); }} className="input-field text-xs max-w-[150px]">
              <option value="">Semua Status</option>
              <option value="terbuka">Terbuka</option>
              <option value="diproses">Diproses</option>
              <option value="menunggu">Menunggu</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
            </select>
            <select value={filterKategori} onChange={e => { setPage(1); setFilterKategori(e.target.value); }} className="input-field text-xs max-w-[180px]">
              <option value="">Semua Kategori</option>
              {kategori.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>

          <DataTable columns={columns} data={data} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData}
            emptyMessage="Belum ada tiket. Buat tiket baru untuk melaporkan masalah." />

          <Modal open={createModal} onClose={() => setCreateModal(false)} title="Buat Tiket Baru">
            <form onSubmit={createTicket} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Kategori</label>
                <select required value={form.kategori_id} onChange={e => setForm({ ...form, kategori_id: e.target.value })} className="input-field">
                  <option value="">Pilih Kategori</option>
                  {kategori.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Prioritas</label>
                <select value={form.prioritas} onChange={e => setForm({ ...form, prioritas: e.target.value })} className="input-field">
                  <option value="rendah">Rendah</option>
                  <option value="normal">Normal</option>
                  <option value="tinggi">Tinggi</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Subjek</label>
                <input required value={form.subjek} onChange={e => setForm({ ...form, subjek: e.target.value })} className="input-field" placeholder="Judul singkat masalah" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Deskripsi</label>
                <textarea required value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} rows={4} className="input-field" placeholder="Jelaskan masalah secara detail..." />
              </div>
              <button type="submit" disabled={sending} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">
                {sending ? 'Menyimpan...' : 'Buat Tiket'}
              </button>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
}
