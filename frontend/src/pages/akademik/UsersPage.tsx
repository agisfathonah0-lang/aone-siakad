import { useState, useEffect } from 'react';
import { get, put, post as apiPost } from '../../api/client';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Search, Pencil, Key, ToggleRight, ToggleLeft, Plus, Mail, Shield, UserPlus, Sparkles, Users } from 'lucide-react';

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

const roleStyle: Record<string, string> = {
  admin: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/10',
  akademik: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/10',
  keuangan: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/10',
  dosen: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/10',
  mahasiswa: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/10',
  alumni: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/10',
};

const avatarGradient: Record<string, string> = {
  admin: 'from-indigo-500 to-indigo-600',
  akademik: 'from-sky-500 to-sky-600',
  keuangan: 'from-emerald-500 to-emerald-600',
  dosen: 'from-purple-500 to-purple-600',
  mahasiswa: 'from-blue-500 to-blue-600',
  alumni: 'from-amber-500 to-amber-600',
};

function capitalize(str: string) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function Avatar({ nama, role }: { nama: string; role: string }) {
  const gradient = avatarGradient[role] || 'from-slate-500 to-slate-600';
  const initial = nama ? nama.trim().charAt(0).toUpperCase() : '?';
  return (
    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0`}>
      {initial}
    </div>
  );
}

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

  const activeCount = data.filter(u => u.is_active).length;

  const cols = [
    {
      key: 'nama', label: 'User',
      render: (r: CampusUser) => (
        <div className="flex items-center gap-3">
          <Avatar nama={r.nama} role={r.role} />
          <div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm">{capitalize(r.nama)}</p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: 'Role',
      render: (r: CampusUser) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${roleStyle[r.role] || 'bg-slate-50 text-slate-600'}`}>
          <Shield size={11} />
          {roleLabels[r.role] || r.role}
        </span>
      ),
    },
    {
      key: 'is_active', label: 'Status',
      render: (r: CampusUser) => r.is_active
        ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/10"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" /> Aktif</span>
        : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 ring-1 ring-red-500/10"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Nonaktif</span>,
    },
    {
      key: 'last_login', label: 'Terakhir Login',
      render: (r: CampusUser) => (
        <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
          {r.last_login ? new Date(r.last_login).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
        </span>
      ),
    },
    {
      key: 'id', label: '',
      render: (r: CampusUser) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => { setEdit(r); setForm({ role: r.role, nama: r.nama }); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
            <Pencil size={14} />
          </button>
          <button onClick={() => resetPassword(r.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all">
            <Key size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white shadow-lg shadow-emerald-500/20">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            <Users size={22} className="text-emerald-100" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">Manajemen User</h1>
            <p className="text-sm text-emerald-100/80 mt-0.5">
              {total} user terdaftar · <span className="font-semibold text-emerald-100">{activeCount} aktif</span>
            </p>
          </div>
          <button onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold transition-all hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]">
            <UserPlus size={16} />
            Tambah User
          </button>
        </div>
      </div>

      {/* Search + Stats row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari user berdasarkan nama atau email..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-white/40 dark:border-zinc-700/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 shadow-sm shadow-slate-200/50 dark:shadow-black/5 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-zinc-500 ml-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-white/40 dark:border-zinc-700/40">
            <Mail size={13} />
            <span>Email terverifikasi</span>
          </div>
        </div>
      </div>

      {/* Table with glassmorphism */}
      <div className="relative">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/40 dark:border-zinc-700/40 shadow-xl shadow-slate-200/50 dark:shadow-black/10 overflow-hidden">
          <div className="px-5 pt-4 pb-1 border-b border-slate-100/50 dark:border-zinc-800/30">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <Sparkles size={13} className="text-emerald-500" />
              <span>Daftar user — diurutkan berdasarkan terbaru</span>
            </div>
          </div>
          <DataTable
            columns={cols}
            data={data}
            loading={loading}
            page={page}
            totalPages={Math.ceil(total / 20)}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={creating} onClose={() => setCreating(false)} title="Tambah User Baru">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Email</label>
            <input value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
              type="email" className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-zinc-700/30 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Password</label>
            <input value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
              type="password" className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-zinc-700/30 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama</label>
            <input value={createForm.nama} onChange={e => setCreateForm({ ...createForm, nama: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-zinc-700/30 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Role</label>
            <select value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-zinc-700/30 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all">
              {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={createUser} disabled={saving}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-[0.98]">
            {saving ? 'Menyimpan...' : 'Buat User'}
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit User">
        {edit && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
              <Avatar nama={edit.nama} role={edit.role} />
              <div>
                <p className="text-sm font-semibold dark:text-white">{capitalize(edit.nama)}</p>
                <p className="text-xs text-slate-400">{edit.email}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama</label>
              <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-zinc-700/30 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-zinc-700/30 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all">
                {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40">
              <div>
                <span className="text-sm font-medium text-slate-600 dark:text-zinc-300">Status Akun</span>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">{edit.is_active ? 'Akun aktif' : 'Akun nonaktif'}</p>
              </div>
              <button onClick={async () => { await put(`/akademik/users/${edit.id}`, { is_active: !edit.is_active }); setEdit({ ...edit, is_active: !edit.is_active }); load(); }} className="transition-all hover:scale-110">
                {edit.is_active ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} className="text-slate-400" />}
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => resetPassword(edit.id)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all flex items-center justify-center gap-1.5">
                <Key size={14} /> Reset Password
              </button>
            </div>
            <button onClick={save}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-[0.98]">
              Simpan Perubahan
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
