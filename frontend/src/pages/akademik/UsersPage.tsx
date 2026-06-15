import { useState, useEffect } from 'react';
import { get, put, post as apiPost } from '../../api/client';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Search, Pencil, Key, ToggleRight, ToggleLeft, Plus } from 'lucide-react';

interface CampusUser {
  id: string;
  email: string;
  role: string;
  nama: string;
  nip: string | null;
  nim: string | null;
  nidn: string | null;
  is_active: boolean;
  must_change_password: boolean;
  last_login: string;
  created_at: string;
}

const roleLabels: Record<string, string> = {
  admin: 'Admin', akademik: 'Akademik', keuangan: 'Keuangan',
  dosen: 'Dosen', mahasiswa: 'Mahasiswa', alumni: 'Alumni',
};

export default function UsersPage() {
  const [data, setData] = useState<CampusUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<CampusUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ role: '', nama: '' });
  const [createForm, setCreateForm] = useState({ email: '', password: '', nama: '', role: 'mahasiswa' });

  useEffect(() => { load(); }, [page, search]);

  async function load() {
    setLoading(true);
    try {
      const res = await get<any>(`/akademik/users?page=${page}&limit=20&q=${search}`);
      setData(res.rows || []);
      setTotal(res.pagination?.total || 0);
    } finally { setLoading(false); }
  }

  async function save() {
    setSaving(true);
    try {
      await put(`/akademik/users/${edit!.id}`, form);
      setEdit(null);
      load();
    } finally { setSaving(false); }
  }

  async function createUser() {
    setSaving(true);
    try {
      await apiPost('/akademik/users', createForm);
      setCreating(false);
      setCreateForm({ email: '', password: '', nama: '', role: 'mahasiswa' });
      load();
    } finally { setSaving(false); }
  }

  async function resetPassword(id: string) {
    if (!confirm('Reset password user ini ke 123456?')) return;
    await apiPost(`/akademik/users/${id}/reset-password`, {});
    load();
  }

  const cols = [
    { key: 'nama', label: 'Nama' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r: CampusUser) => <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">{roleLabels[r.role] || r.role}</span> },
    { key: 'is_active', label: 'Status', render: (r: CampusUser) => r.is_active ? <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-0.5 rounded">Aktif</span> : <span className="text-xs font-bold text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">Nonaktif</span> },
    { key: 'last_login', label: 'Terakhir Login', render: (r: CampusUser) => r.last_login ? <span className="text-xs text-slate-400">{new Date(r.last_login).toLocaleDateString()}</span> : '-' },
    { key: 'id', label: '', render: (r: CampusUser) => (
      <div className="flex gap-1 justify-end">
        <button onClick={() => { setEdit(r); setForm({ role: r.role, nama: r.nama }); }} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => resetPassword(r.id)} className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors"><Key size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Manajemen User</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">{total} user terdaftar</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary text-sm flex items-center gap-1.5"><Plus size={16} /> Tambah User</button>
      </div>

      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari user..." className="input-field pl-9" />
      </div>

      <DataTable columns={cols} data={data} loading={loading} page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} />

      <Modal open={creating} onClose={() => setCreating(false)} title="Tambah User">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Email</label>
            <input value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} type="email" className="input-field" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Password</label>
            <input value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} type="password" className="input-field" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama</label>
            <input value={createForm.nama} onChange={e => setCreateForm({ ...createForm, nama: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Role</label>
            <select value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })} className="input-field">
              {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={createUser} disabled={saving} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Buat User</button>
        </div>
      </Modal>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit User">
        {edit && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
              <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                {edit.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold dark:text-white">{edit.nama}</p>
                <p className="text-xs text-slate-400">{edit.email}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama</label>
              <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-field">
                {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40">
              <span className="text-sm font-medium text-slate-600 dark:text-zinc-300">Status Akun</span>
              <button onClick={async () => { await put(`/akademik/users/${edit.id}`, { is_active: !edit.is_active }); setEdit({ ...edit, is_active: !edit.is_active }); load(); }} className="transition-colors">
                {edit.is_active ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-slate-400" />}
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => resetPassword(edit.id)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/10 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors flex items-center justify-center gap-1.5"><Key size={14} /> Reset Password</button>
            </div>
            <button onClick={save} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Simpan Perubahan</button>
          </div>
        )}
      </Modal>
    </div>
  );
}