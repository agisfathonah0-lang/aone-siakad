import { useState, useEffect } from 'react';
import { get, post, put, del } from '../../api/client';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, ToggleLeft, ToggleRight, Shield } from 'lucide-react';

interface VendorUser {
  id: string; email: string; nama: string; role: string; is_active: boolean; last_login: string; created_at: string;
}

export default function VendorUsersPage() {
  const [users, setUsers] = useState<VendorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', nama: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await get<VendorUser[]>('/vendor/users'); setUsers(Array.isArray(d) ? d : []); } finally { setLoading(false); }
  }

  function openCreate() { setEditId(null); setForm({ email: '', nama: '', password: '' }); setError(''); setModal(true); }

  function openEdit(u: VendorUser) { setEditId(u.id); setForm({ email: u.email, nama: u.nama, password: '' }); setError(''); setModal(true); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        const body: any = { nama: form.nama, email: form.email };
        if (form.password) body.password = form.password;
        await put(`/vendor/users/${editId}`, body);
      } else {
        await post('/vendor/users', form);
      }
      setModal(false);
      load();
    } catch (err: any) { setError(err.response?.data?.message || err.message || 'Gagal menyimpan'); }
  }

  async function toggleActive(id: string) {
    await del(`/vendor/users/${id}/toggle`);
    load();
  }

  const cols = [
    { key: 'nama', label: 'Nama', render: (r: VendorUser) => <><p className="font-semibold text-sm dark:text-white">{r.nama}</p><p className="text-[10px] text-slate-400">{r.email}</p></> },
    { key: 'role', label: 'Role', render: (r: VendorUser) => <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">{r.role}</span> },
    { key: 'status', label: 'Status', render: (r: VendorUser) => <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.is_active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>{r.is_active ? 'Aktif' : 'Nonaktif'}</span> },
    { key: 'last_login', label: 'Terakhir Login', render: (r: VendorUser) => <span className="text-xs text-slate-400">{r.last_login ? new Date(r.last_login).toLocaleDateString('id') : '—'}</span> },
    { key: 'id', label: '', render: (r: VendorUser) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors text-xs">Edit</button>
        <button onClick={() => toggleActive(r.id)} className={`p-1.5 transition-colors ${r.is_active ? 'text-emerald-500 hover:text-emerald-400' : 'text-zinc-400 hover:text-zinc-300'}`}>
          {r.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Vendor Users</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Kelola akun admin platform</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
          <Plus size={14} /> Tambah User
        </button>
      </div>

      <DataTable columns={cols} data={users} loading={loading} emptyMessage="Belum ada vendor user" />

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Vendor User' : 'Tambah Vendor User'}>
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">{error}</div>}
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama</label><input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required className="input-field" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="input-field" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">{editId ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editId} minLength={6} className="input-field" /></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{editId ? 'Simpan' : 'Tambah User'}</button>
        </form>
      </Modal>
    </div>
  );
}
