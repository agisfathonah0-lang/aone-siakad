import { useState, useEffect } from 'react';
import { get, post, patch } from '../../api/client';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, Edit3 } from 'lucide-react';

interface TicketItem {
  id: string; title: string; tenant_id: string; tenant_name: string; priority: string; category: string; status: string; description: string; created_by: string; created_at: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editTicket, setEditTicket] = useState<TicketItem | null>(null);
  const [form, setForm] = useState({ title: '', priority: 'Sedang', category: 'Umum', description: '' });
  const [editForm, setEditForm] = useState({ status: '', priority: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await get<TicketItem[]>('/vendor/tickets'); setTickets(Array.isArray(d) ? d : []); } finally { setLoading(false); }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await post('/vendor/tickets', form);
    setCreateModal(false);
    setForm({ title: '', priority: 'Sedang', category: 'Umum', description: '' });
    load();
  }

  function openEdit(t: TicketItem) { setEditTicket(t); setEditForm({ status: t.status, priority: t.priority }); setEditModal(true); }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTicket) return;
    const body: any = {};
    if (editForm.status !== editTicket.status) body.status = editForm.status;
    if (editForm.priority !== editTicket.priority) body.priority = editForm.priority;
    if (Object.keys(body).length === 0) { setEditModal(false); return; }
    await patch(`/vendor/tickets/${editTicket.id}`, body);
    setEditModal(false);
    load();
  }

  const statusColor: Record<string, string> = { Terbuka: 'bg-blue-500/10 text-blue-500', 'Dalam Proses': 'bg-amber-500/10 text-amber-500', Selesai: 'bg-emerald-500/10 text-emerald-500', Ditutup: 'bg-slate-500/10 text-slate-500' };
  const priorityColor: Record<string, string> = { Rendah: 'bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-300', Sedang: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', Tinggi: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', Kritis: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' };

  const cols = [
    { key: 'title', label: 'Ticket', render: (r: TicketItem) => <><p className="font-semibold text-sm dark:text-white">{r.title}</p><p className="text-[10px] text-slate-400">{r.tenant_name || '-'} · {r.category}</p></> },
    { key: 'priority', label: 'Prioritas', render: (r: TicketItem) => <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${priorityColor[r.priority] || priorityColor.Sedang}`}>{r.priority}</span> },
    { key: 'status', label: 'Status', render: (r: TicketItem) => <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusColor[r.status] || 'bg-slate-500/10 text-slate-500'}`}>{r.status}</span> },
    { key: 'created_at', label: 'Dibuat', render: (r: TicketItem) => <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('id')}</span> },
    { key: 'id', label: '', render: (r: TicketItem) => <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"><Edit3 size={13} /></button> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Tickets</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Tiket support & permintaan bantuan</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
          <Plus size={14} /> Buat Ticket
        </button>
      </div>

      <DataTable columns={cols} data={tickets} loading={loading} emptyMessage="Belum ada ticket" />

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Buat Ticket Baru">
        <form onSubmit={create} className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Judul</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="input-field" placeholder="Judul ticket..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Prioritas</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-field"><option>Rendah</option><option>Sedang</option><option>Tinggi</option><option>Kritis</option></select></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Kategori</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field"><option>Umum</option><option>PDDIKTI</option><option>Infrastruktur</option><option>Modul Alumni</option><option>Modul Akademik</option><option>Modul Keuangan</option><option>Lainnya</option></select></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Deskripsi</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} placeholder="Deskripsi detail..." /></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Buat Ticket</button>
        </form>
      </Modal>

      <Modal open={editModal} onClose={() => setEditModal(false)} title={editTicket ? `Update: ${editTicket.title}` : ''}>
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Status</label>
              <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="input-field">
                <option>Terbuka</option><option>Dalam Proses</option><option>Selesai</option><option>Ditutup</option>
              </select></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Prioritas</label>
              <select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })} className="input-field">
                <option>Rendah</option><option>Sedang</option><option>Tinggi</option><option>Kritis</option>
              </select></div>
          </div>
          {editTicket && <p className="text-[10px] text-slate-400">Tenant: {editTicket.tenant_name || '-'} · Kategori: {editTicket.category}</p>}
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Update Ticket</button>
        </form>
      </Modal>
    </div>
  );
}
