import { useState, useEffect } from 'react';
import { get, put } from '../../api/client';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Globe, Search, ToggleLeft, ToggleRight, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface LandingPage {
  active: boolean; seoTitle: string; seoDescription: string;
  heroTitle: string; heroSubtitle: string; primaryColor: string;
  showBerita: boolean; showPPDB: boolean; showProdi: boolean;
  showStruktur: boolean; showPrestasi: boolean; showPromosi: boolean; showPopUp: boolean;
  heroImages: string[];
  prestasi: Array<{ icon: string; title: string; desc: string }>;
  promosi: Array<{ title: string; description: string; image: string; link: string }>;
  strukturOrganisasi: Array<{ id: string; jabatan: string; nama: string; image: string }>;
  popUp: { active: boolean; title: string; content: string; image: string; buttonText: string; buttonLink: string };
  sambutan: { active: boolean; title: string; content: string; nama: string; jabatan: string; image: string };
  tahunAkademik: string;
}

interface TenantLP {
  id: string; slug: string; name: string; nama_pt: string; logo_url: string;
  landingPage: LandingPage;
}

const defaultForm: LandingPage = {
  active: false,
  seoTitle: '', seoDescription: '',
  heroTitle: '', heroSubtitle: '',
  showBerita: true, showPPDB: true, showProdi: true,
  showStruktur: true, showPrestasi: true, showPromosi: true, showPopUp: false,
  primaryColor: '#10b981',
  heroImages: [],
  prestasi: [],
  promosi: [],
  strukturOrganisasi: [],
  popUp: { active: false, title: '', content: '', image: '', buttonText: 'Tutup', buttonLink: '' },
  sambutan: { active: false, title: 'Sambutan', content: '', nama: '', jabatan: '', image: '' },
  tahunAkademik: '2025/2026',
};

function SectionCollapse({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className="border-t border-slate-200 dark:border-zinc-700/50 pt-4">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-left mb-3">
        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">{title}</p>
        {open ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  );
}

export default function LandingPagesPage() {
  const [tenants, setTenants] = useState<TenantLP[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<TenantLP | null>(null);
  const [form, setForm] = useState<LandingPage>(defaultForm);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await get<TenantLP[]>('/vendor/landing-pages');
      setTenants(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }

  function openEdit(t: TenantLP) {
    setEdit(t);
    const lp = t.landingPage || {};
    setForm({
      ...defaultForm,
      ...lp,
      heroImages: lp.heroImages || [],
      prestasi: lp.prestasi || [],
      promosi: lp.promosi || [],
      strukturOrganisasi: lp.strukturOrganisasi || [],
      popUp: { ...defaultForm.popUp, ...(lp.popUp || {}) },
      sambutan: { ...defaultForm.sambutan, ...(lp.sambutan || {}) },
    });
    setModal(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    await put(`/vendor/landing-pages/${edit.id}`, { landingPage: form });
    setModal(false);
    setEdit(null);
    load();
  }

  const filtered = tenants.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) || t.slug?.includes(search)
  );

  const cols = [
    { key: 'name', label: 'Tenant', render: (r: TenantLP) => <><p className="font-semibold text-sm dark:text-white">{r.name}</p><p className="text-[10px] text-slate-400">{r.slug}</p></> },
    { key: 'status', label: 'Landing Page', render: (r: TenantLP) => r.landingPage?.active
      ? <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-0.5 rounded">Aktif</span>
      : <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-500 px-2 py-0.5 rounded">Nonaktif</span> },
    { key: 'seo', label: 'SEO Title', render: (r: TenantLP) => <span className="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-[200px] block">{r.landingPage?.seoTitle || r.name}</span> },
    { key: 'id', label: '', render: (r: TenantLP) => (
      <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors"><Globe size={14} /></button>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Landing Pages Kampus</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Kelola halaman publik setiap kampus</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kampus..." className="input-field pl-9" />
      </div>

      <DataTable columns={cols} data={filtered} loading={loading} />

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? `Landing Page: ${edit.name}` : ''}>
        <form onSubmit={save} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
            <div>
              <p className="text-sm font-semibold dark:text-white">Aktifkan Landing Page</p>
              <p className="text-[10px] text-slate-400">URL: {edit?.slug}.aone-siakad.com</p>
            </div>
            <button type="button" onClick={() => setForm({ ...form, active: !form.active })} className={`p-2 rounded-lg transition-all ${form.active ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-zinc-400 bg-zinc-100 dark:bg-zinc-700'}`}>
              {form.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">SEO Title</label>
            <input value={form.seoTitle} onChange={e => setForm({ ...form, seoTitle: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">SEO Description</label>
            <input value={form.seoDescription} onChange={e => setForm({ ...form, seoDescription: e.target.value })} className="input-field" />
          </div>

          <SectionCollapse title="Hero Section">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Judul Hero</label>
              <input value={form.heroTitle} onChange={e => setForm({ ...form, heroTitle: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Subjudul Hero</label>
              <input value={form.heroSubtitle} onChange={e => setForm({ ...form, heroSubtitle: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Warna Aksen (HEX)</label>
              <div className="flex gap-2">
                <input value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} className="input-field flex-1" placeholder="#10b981" />
                <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-600" style={{ backgroundColor: form.primaryColor }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Gambar Slider</label>
                <button type="button" onClick={() => setForm({ ...form, heroImages: [...form.heroImages, ''] })} className="text-[10px] text-indigo-500 hover:text-indigo-400 flex items-center gap-0.5"><Plus size={12} /> Tambah</button>
              </div>
              {form.heroImages.map((url, i) => (
                <div key={i} className="flex items-center gap-1 mb-1">
                  <input value={url} onChange={e => { const a = [...form.heroImages]; a[i] = e.target.value; setForm({ ...form, heroImages: a }); }} className="input-field flex-1 text-[11px]" placeholder="https://..." />
                  <button type="button" onClick={() => setForm({ ...form, heroImages: form.heroImages.filter((_, idx) => idx !== i) })} className="p-1 text-red-400"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </SectionCollapse>

          <SectionCollapse title="Modul yang Ditampilkan">
            <div className="grid grid-cols-2 gap-2">
              {[
                ['showBerita', 'Berita'], ['showPPDB', 'PPDB'], ['showProdi', 'Prodi'],
                ['showStruktur', 'Struktur'], ['showPrestasi', 'Prestasi'], ['showPromosi', 'Promosi'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                  <span className="text-xs dark:text-white">{label}</span>
                  <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} className="accent-emerald-500" />
                </label>
              ))}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun Akademik</label>
              <input value={form.tahunAkademik} onChange={e => setForm({ ...form, tahunAkademik: e.target.value })} className="input-field" />
            </div>
          </SectionCollapse>

          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Simpan</button>
        </form>
      </Modal>
    </div>
  );
}
