import { useState, useEffect } from 'react';
import { get, post, put, del } from '../../api/client';
import Modal from '../../components/ui/Modal';
import { Plus, Trash2, Edit3, Check, Layers, Star, Loader2 } from 'lucide-react';

interface Plan {
  id: string; name: string; price: string; maxStudents: number; maxTenants: number;
  features: string[]; color: string; popular: boolean; createdAt: string;
}

const featureOptions = ['Sync PDDIKTI', 'SSO Terintegrasi', 'Modul Akademik', 'Modul Keuangan', 'CMS', 'PPDB', 'OJS', 'Alumni Portal', 'Laporan & Rekap', 'WA Gateway', 'Multi Device', 'Backup Otomatis'];

export default function VendorPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', price: '', maxStudents: 1000, maxTenants: 1, features: [] as string[], color: '#6366f1', popular: false });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await get<Plan[]>('/vendor/plans'); setPlans(Array.isArray(d) ? d : []); } finally { setLoading(false); }
  }

  function openCreate() { setEditId(null); setForm({ name: '', price: '', maxStudents: 1000, maxTenants: 1, features: [], color: '#6366f1', popular: false }); setModal(true); }

  function openEdit(p: Plan) { setEditId(p.id); setForm({ name: p.name, price: p.price, maxStudents: p.maxStudents, maxTenants: p.maxTenants, features: p.features || [], color: p.color || '#6366f1', popular: p.popular || false }); setModal(true); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editId) await put(`/vendor/plans/${editId}`, form);
    else await post('/vendor/plans', form);
    setModal(false);
    load();
  }

  async function handleDelete(id: string) { await del(`/vendor/plans/${id}`); load(); }

  function toggleFeature(f: string) {
    setForm(prev => ({ ...prev, features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f] }));
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight dark:text-white">Paket Berlangganan</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Limit billing, kuota server, dan fitur per tenant kampus.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
          <Plus size={14} /> Tambah Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16">
          <Layers size={40} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Belum ada paket berlangganan</p>
          <button onClick={openCreate} className="mt-3 text-xs text-indigo-500 hover:text-indigo-400 font-bold">Buat Plan Baru</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative bg-white dark:bg-zinc-900/50 rounded-xl p-5 shadow-sm ring-1 ${plan.popular ? 'ring-2 ring-emerald-500/40 scale-[1.02]' : 'ring-slate-200/50 dark:ring-zinc-800/30'} hover:shadow-md transition-all`}>
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full text-[9px] font-bold text-white shadow-lg flex items-center gap-1">
                  <Star size={10} /> TERPOPULER
                </div>
              )}
              <div className="flex items-start justify-between">
                <p className="text-xs font-bold font-display uppercase tracking-wider text-slate-500 dark:text-zinc-400">{plan.name}</p>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(plan)} className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"><Edit3 size={12} /></button>
                  <button onClick={() => handleDelete(plan.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                </div>
              </div>
              <div className="mt-3 mb-3">
                <p className="text-xl font-extrabold dark:text-white">{plan.price}</p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5"><Layers size={12} /><span>Max <b>{plan.maxStudents.toLocaleString()}</b> mahasiswa</span></div>
                <div className="flex items-center gap-1.5"><Layers size={12} /><span>{plan.maxTenants === -1 ? 'Unlimited' : `Max ${plan.maxTenants}`} tenant</span></div>
                {(plan.features || []).slice(0, 4).map((f, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-emerald-500"><Check size={12} /><span>{f}</span></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Plan' : 'Tambah Plan'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama Plan</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Harga</label><input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required className="input-field" placeholder="Rp 14,5 Jt" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Max Mahasiswa</label><input type="number" value={form.maxStudents} onChange={e => setForm({ ...form, maxStudents: parseInt(e.target.value) || 0 })} required className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Max Tenants</label><input type="number" value={form.maxTenants} onChange={e => setForm({ ...form, maxTenants: parseInt(e.target.value) || 0 })} required className="input-field" /></div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Warna Aksen (HEX)</label>
            <div className="flex gap-2"><input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="input-field flex-1" /><div className="w-9 h-9 rounded-lg border" style={{ backgroundColor: form.color }} /></div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Fitur</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
              {featureOptions.map(f => (
                <label key={f} className="flex items-center gap-1.5 p-1.5 rounded hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                  <input type="checkbox" checked={form.features.includes(f)} onChange={() => toggleFeature(f)} className="accent-indigo-500" />
                  <span className="text-[11px] dark:text-white">{f}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer">
            <input type="checkbox" checked={form.popular} onChange={e => setForm({ ...form, popular: e.target.checked })} className="accent-emerald-500" />
            <span className="text-xs dark:text-white">Tandai sebagai Populer</span>
          </label>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{editId ? 'Simpan' : 'Tambah Plan'}</button>
        </form>
      </Modal>
    </div>
  );
}
