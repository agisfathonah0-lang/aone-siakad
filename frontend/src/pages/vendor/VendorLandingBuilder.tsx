import { useState, useEffect, useCallback } from 'react';
import { get, put } from '../../api/client';
import {
  Save, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp,
  GripVertical, Sparkles,
} from 'lucide-react';

interface SectionVisibility {
  hero: boolean; ppdb: boolean; prodi: boolean; features: boolean;
  testimonials: boolean; faq: boolean; cta: boolean;
}

const defaultConfig = {
  hero: {
    title: 'Platform SIAKAD All-in-One untuk Kampus Indonesia',
    subtitle: 'Satu platform terintegrasi untuk PPDB online, akademik, keuangan, akreditasi 9 standar BAN-PT, dan pelaporan PDDIKTI.',
    badge: 'Platform Akademik Cloud untuk Kampus Anda',
    ctaText: 'Ajukan Demo Gratis',
    ctaLink: '/register',
    secondaryText: 'Pelajari Fitur',
    stats: [{ value: '50+', label: 'Kampus Mitra' }, { value: '250rb+', label: 'Mahasiswa Terkelola' }, { value: '99.99%', label: 'Uptime SLA' }, { value: '10+', label: 'Tahun Pengalaman' }],
    show: true,
  },
  ppdb: {
    title: 'Modul PPDB Online',
    subtitle: 'Kelola penerimaan mahasiswa baru secara digital — dari pendaftaran, seleksi, pembayaran, hingga daftar ulang dalam satu sistem.',
    badge: 'FITUR PPDB',
    stats: [{ icon: 'Users', label: 'Kampus Aktif', value: '50+', change: 'Terintegrasi' }, { icon: 'FileText', label: 'Form Digital', value: '100%', change: 'Paperless' }, { icon: 'CreditCard', label: 'Pembayaran', value: 'Multi-Gateway', change: 'VA / Kartu' }],
    steps: [
      { title: 'Konfigurasi Gelombang', desc: 'Atur jadwal, kuota, jalur seleksi, dan persyaratan pendaftaran' },
      { title: 'Pendaftaran Online', desc: 'Calon mahasiswa daftar, upload dokumen, dan bayar via portal' },
      { title: 'Seleksi Otomatis', desc: 'Sistem筛选 sesuai kriteria, nilai, dan jalur yang ditentukan' },
      { title: 'Pengumuman & Daftar Ulang', desc: 'Pengumuman real-time, daftar ulang online, terbit NIM otomatis' },
    ],
    show: true,
  },
  prodi: {
    title: 'Program Studi', subtitle: 'Dukungan penuh untuk seluruh jenjang dan program studi.',
    badge: 'MANAJEMEN PRODI', items: [], show: false,
  },
  features: {
    title: 'Mengapa AONE SIAKAD?',
    subtitle: 'Platform all-in-one yang mencakup seluruh kebutuhan operasional perguruan tinggi.',
    badge: 'FITUR PLATFORM',
    items: [
      { icon: 'Server', title: 'Multi-Tenant Architecture', desc: 'Setiap kampus mendapat environment terisolasi.', color: 'from-emerald-500/20 to-emerald-600/10' },
      { icon: 'Database', title: 'Sinkronasi PDDIKTI', desc: 'Laporan otomatis real-time ke PDDIKTI.', color: 'from-indigo-500/20 to-indigo-600/10' },
    ],
    show: true,
  },
  testimonials: {
    title: 'Apa Kata Mereka?',
    subtitle: 'Rektor, dekan, dan dosen dari berbagai kampus mitra berbagi pengalaman.',
    badge: 'TESTIMONI',
    items: [
      { name: 'Dr. Ahmad Syukri, M.Ag.', role: 'Rektor UND Jakarta', text: 'AONE SIAKAD meningkatkan skor akreditasi institusi kami menjadi UNGGUL.', avatar: 'AS', rating: 5 },
    ],
    show: true,
  },
  faq: {
    title: 'Pertanyaan Umum',
    subtitle: 'Temukan jawaban seputar platform AONE SIAKAD, implementasi, dan dukungan.',
    badge: 'FAQ',
    items: [
      { q: 'Apa itu AONE SIAKAD?', a: 'AONE SIAKAD adalah platform SaaS all-in-one untuk perguruan tinggi Indonesia.' },
      { q: 'Bagaimana proses implementasinya?', a: 'Implementasi dimulai dengan migrasi data, konfigurasi sistem, dan pelatihan.' },
    ],
    show: true,
  },
  cta: {
    title: 'Siap Digitalisasi Kampus?',
    subtitle: 'Dapatkan demo gratis dan konsultasi dengan tim kami.',
    phone: '+62 21 1234 5678', email: 'info@aoneproject.id', address: 'Jakarta, Indonesia',
    show: true,
  },
  footer: {
    text: '© 2026 AONE Project. All rights reserved.',
    columns: [
      { title: 'Produk', items: ['PPDB Online', 'SIAKAD', 'LMS', 'Akreditasi', 'PDDIKTI'] },
      { title: 'Sumber Daya', items: ['Dokumentasi', 'API Reference', 'Status Sistem', 'Blog', 'FAQ'] },
      { title: 'Kontak', items: ['+62 21 1234 5678', 'info@aoneproject.id', 'Jakarta, Indonesia', 'Senin-Jumat 08:00-17:00'] },
    ],
  },
  ppdbBanner: { text: 'Daftarkan kampus Anda sekarang. Gratis demo & konsultasi selama 30 hari.', show: true },
};

function SectionCard({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700/50 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-zinc-700/30 transition">
        <span className="font-bold text-sm text-slate-700 dark:text-zinc-200">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-6 pb-6 space-y-4">{children}</div>}
    </div>
  );
}

function ArrayField({ items, onChange, fields, label }: {
  items: any[]; onChange: (v: any[]) => void; fields: { key: string; label: string; type?: string }[]; label: string;
}) {
  const update = (i: number, k: string, v: any) => {
    const next = [...items];
    next[i] = { ...next[i], [k]: v };
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{label}</label>
        <button onClick={() => onChange([...items, Object.fromEntries(fields.map(f => [f.key, '']))])} className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 font-medium">
          <Plus className="w-3 h-3" /> Tambah
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 bg-slate-50 dark:bg-zinc-700/30 p-3 rounded-xl">
          <GripVertical className="w-4 h-4 text-slate-300 mt-2 shrink-0" />
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {fields.map(f => (
              f.type === 'textarea' ? (
                <textarea key={f.key} value={item[f.key] || ''} onChange={e => update(i, f.key, e.target.value)} placeholder={f.label} className="col-span-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" rows={2} />
              ) : (
                <input key={f.key} type={f.type || 'text'} value={item[f.key] || ''} onChange={e => update(i, f.key, e.target.value)} placeholder={f.label} className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
              )
            ))}
          </div>
          <button onClick={() => onChange(items.filter((_: any, j: number) => j !== i))} className="text-red-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}

export default function VendorLandingBuilder() {
  const [config, setConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [vis, setVis] = useState<SectionVisibility>({
    hero: true, ppdb: true, prodi: true, features: true,
    testimonials: true, faq: true, cta: true,
  });

  useEffect(() => {
    get<any>('/public/vendor-landing-page').then(d => {
      setConfig(d);
      const v: any = {};
      Object.keys(vis).forEach(k => { v[k] = d[k]?.show ?? true; });
      setVis(v);
    }).catch(() => setConfig(JSON.parse(JSON.stringify(defaultConfig))));
  }, []);

  const update = useCallback((section: string, val: any) => {
    setConfig((prev: any) => ({ ...prev, [section]: { ...prev[section], ...val } }));
  }, []);

  const setItems = useCallback((section: string, items: any[]) => {
    setConfig((prev: any) => ({ ...prev, [section]: { ...prev[section], items } }));
  }, []);

  const toggleSection = (section: keyof SectionVisibility) => {
    const next = !vis[section];
    setVis(prev => ({ ...prev, [section]: next }));
    update(section, { show: next });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await put('/vendor/settings', { landing_page: JSON.stringify(config) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (!config) return null;

  const h = (s: string) => config[s] || {};
  const hItems = (s: string) => config[s]?.items || [];

  const iconOptions = ['Server', 'Database', 'Award', 'CreditCard', 'BookOpen', 'Users', 'Globe', 'Smartphone', 'Cloud', 'Zap', 'Headphones', 'Shield', 'FileText', 'Upload', 'UserCheck', 'School', 'GraduationCap', 'Building2'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Landing Page Builder</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Sesuaikan tampilan halaman utama vendor AONE SIAKAD</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan'}
        </button>
      </div>

      {/* PPDB Banner */}
      <SectionCard title="PPDB Banner Info" defaultOpen>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 shrink-0">Tampilkan</label>
          <button onClick={() => setConfig((p: any) => ({ ...p, ppdbBanner: { ...p.ppdbBanner, show: !p.ppdbBanner?.show } }))} className={`w-10 h-5 rounded-full transition-colors ${config.ppdbBanner?.show ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-600'} relative`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-transform ${config.ppdbBanner?.show ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <input value={config.ppdbBanner?.text || ''} onChange={e => update('ppdbBanner', { ...h('ppdbBanner'), text: e.target.value })} placeholder="Teks banner PPDB" className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
      </SectionCard>

      {/* Hero Section */}
      <SectionCard title={`Hero Section ${vis.hero ? '' : '(Tersembunyi)'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Visibilitas</span>
          <button onClick={() => toggleSection('hero')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${vis.hero ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
            {vis.hero ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {vis.hero ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={h('hero').title || ''} onChange={e => update('hero', { ...h('hero'), title: e.target.value })} placeholder="Judul hero" className="col-span-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
          <textarea value={h('hero').subtitle || ''} onChange={e => update('hero', { ...h('hero'), subtitle: e.target.value })} placeholder="Subtitle hero" className="col-span-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" rows={2} />
          <input value={h('hero').badge || ''} onChange={e => update('hero', { ...h('hero'), badge: e.target.value })} placeholder="Badge (mis: Portal Akademik Terintegrasi)" className="text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
          <input value={h('hero').ctaText || ''} onChange={e => update('hero', { ...h('hero'), ctaText: e.target.value })} placeholder="Teks tombol CTA" className="text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
          <input value={h('hero').secondaryText || ''} onChange={e => update('hero', { ...h('hero'), secondaryText: e.target.value })} placeholder="Teks tombol sekunder" className="text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
        </div>
        <ArrayField items={h('hero').stats || []} onChange={v => update('hero', { ...h('hero'), stats: v })} fields={[{ key: 'value', label: 'Nilai' }, { key: 'label', label: 'Label' }]} label="Statistik Hero" />
      </SectionCard>

      {/* PPDB Section */}
      <SectionCard title={`PPDB Section ${vis.ppdb ? '' : '(Tersembunyi)'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Visibilitas</span>
          <button onClick={() => toggleSection('ppdb')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${vis.ppdb ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
            {vis.ppdb ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {vis.ppdb ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={h('ppdb').title || ''} onChange={e => update('ppdb', { ...h('ppdb'), title: e.target.value })} placeholder="Judul" className="col-span-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
          <textarea value={h('ppdb').subtitle || ''} onChange={e => update('ppdb', { ...h('ppdb'), subtitle: e.target.value })} placeholder="Subtitle" className="col-span-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" rows={2} />
          <input value={h('ppdb').badge || ''} onChange={e => update('ppdb', { ...h('ppdb'), badge: e.target.value })} placeholder="Badge" className="text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
        </div>
        <ArrayField items={h('ppdb').stats || []} onChange={v => update('ppdb', { ...h('ppdb'), stats: v })} fields={[{ key: 'icon', label: 'Icon' }, { key: 'label', label: 'Label' }, { key: 'value', label: 'Nilai' }, { key: 'change', label: 'Perubahan' }]} label="Statistik PPDB" />
        <ArrayField items={h('ppdb').steps || []} onChange={v => update('ppdb', { ...h('ppdb'), steps: v })} fields={[{ key: 'icon', label: 'Nama Icon' }, { key: 'title', label: 'Judul' }, { key: 'desc', label: 'Deskripsi' }]} label="Langkah Pendaftaran" />
      </SectionCard>

      {/* Program Studi Section */}
      <SectionCard title={`Program Studi ${vis.prodi ? '' : '(Tersembunyi)'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Visibilitas</span>
          <button onClick={() => toggleSection('prodi')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${vis.prodi ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
            {vis.prodi ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {vis.prodi ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={h('prodi').title || ''} onChange={e => update('prodi', { ...h('prodi'), title: e.target.value })} placeholder="Judul" className="col-span-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
          <textarea value={h('prodi').subtitle || ''} onChange={e => update('prodi', { ...h('prodi'), subtitle: e.target.value })} placeholder="Subtitle" className="col-span-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" rows={2} />
          <input value={h('prodi').badge || ''} onChange={e => update('prodi', { ...h('prodi'), badge: e.target.value })} placeholder="Badge" className="text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
        </div>
        <ArrayField items={hItems('prodi')} onChange={v => setItems('prodi', v)} fields={[{ key: 'kode', label: 'Kode' }, { key: 'nama', label: 'Nama' }, { key: 'jenjang', label: 'Jenjang' }, { key: 'fakultas', label: 'Fakultas' }, { key: 'akreditasi', label: 'Akreditasi' }]} label="Program Studi" />
      </SectionCard>

      {/* Features Section */}
      <SectionCard title={`Features ${vis.features ? '' : '(Tersembunyi)'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Visibilitas</span>
          <button onClick={() => toggleSection('features')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${vis.features ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
            {vis.features ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {vis.features ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={h('features').title || ''} onChange={e => update('features', { ...h('features'), title: e.target.value })} placeholder="Judul" className="col-span-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
          <textarea value={h('features').subtitle || ''} onChange={e => update('features', { ...h('features'), subtitle: e.target.value })} placeholder="Subtitle" className="col-span-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" rows={2} />
          <input value={h('features').badge || ''} onChange={e => update('features', { ...h('features'), badge: e.target.value })} placeholder="Badge" className="text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
        </div>
        <ArrayField items={hItems('features')} onChange={v => setItems('features', v)} fields={[
          { key: 'icon', label: 'Icon' },
          { key: 'title', label: 'Judul' },
          { key: 'desc', label: 'Deskripsi' },
          { key: 'color', label: 'Warna (ex: from-emerald-500/20...)' },
        ]} label="Fitur" />
        {iconOptions.length > 0 && (
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">Icon tersedia: {iconOptions.join(', ')}</p>
        )}
      </SectionCard>

      {/* Testimonials Section */}
      <SectionCard title={`Testimonials ${vis.testimonials ? '' : '(Tersembunyi)'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Visibilitas</span>
          <button onClick={() => toggleSection('testimonials')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${vis.testimonials ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
            {vis.testimonials ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {vis.testimonials ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={h('testimonials').title || ''} onChange={e => update('testimonials', { ...h('testimonials'), title: e.target.value })} placeholder="Judul" className="col-span-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
          <textarea value={h('testimonials').subtitle || ''} onChange={e => update('testimonials', { ...h('testimonials'), subtitle: e.target.value })} placeholder="Subtitle" className="col-span-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" rows={2} />
          <input value={h('testimonials').badge || ''} onChange={e => update('testimonials', { ...h('testimonials'), badge: e.target.value })} placeholder="Badge" className="text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
        </div>
        <ArrayField items={hItems('testimonials')} onChange={v => setItems('testimonials', v)} fields={[
          { key: 'name', label: 'Nama' },
          { key: 'role', label: 'Jabatan' },
          { key: 'text', label: 'Testimoni', type: 'textarea' },
          { key: 'avatar', label: 'Inisial Avatar' },
          { key: 'rating', label: 'Rating (1-5)' },
        ]} label="Testimoni" />
      </SectionCard>

      {/* FAQ Section */}
      <SectionCard title={`FAQ ${vis.faq ? '' : '(Tersembunyi)'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Visibilitas</span>
          <button onClick={() => toggleSection('faq')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${vis.faq ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
            {vis.faq ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {vis.faq ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={h('faq').title || ''} onChange={e => update('faq', { ...h('faq'), title: e.target.value })} placeholder="Judul" className="col-span-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
          <textarea value={h('faq').subtitle || ''} onChange={e => update('faq', { ...h('faq'), subtitle: e.target.value })} placeholder="Subtitle" className="col-span-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" rows={2} />
          <input value={h('faq').badge || ''} onChange={e => update('faq', { ...h('faq'), badge: e.target.value })} placeholder="Badge" className="text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
        </div>
        <ArrayField items={hItems('faq')} onChange={v => setItems('faq', v)} fields={[{ key: 'q', label: 'Pertanyaan' }, { key: 'a', label: 'Jawaban', type: 'textarea' }]} label="FAQ" />
      </SectionCard>

      {/* CTA Section */}
      <SectionCard title={`CTA Section ${vis.cta ? '' : '(Tersembunyi)'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Visibilitas</span>
          <button onClick={() => toggleSection('cta')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${vis.cta ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
            {vis.cta ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {vis.cta ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={h('cta').title || ''} onChange={e => update('cta', { ...h('cta'), title: e.target.value })} placeholder="Judul" className="col-span-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
          <textarea value={h('cta').subtitle || ''} onChange={e => update('cta', { ...h('cta'), subtitle: e.target.value })} placeholder="Subtitle" className="col-span-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" rows={2} />
          <input value={h('cta').phone || ''} onChange={e => update('cta', { ...h('cta'), phone: e.target.value })} placeholder="Telepon" className="text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
          <input value={h('cta').email || ''} onChange={e => update('cta', { ...h('cta'), email: e.target.value })} placeholder="Email" className="text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
          <input value={h('cta').address || ''} onChange={e => update('cta', { ...h('cta'), address: e.target.value })} placeholder="Alamat" className="text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
        </div>
      </SectionCard>

      {/* Footer */}
      <SectionCard title="Footer">
        <input value={config.footer?.text || ''} onChange={e => setConfig((p: any) => ({ ...p, footer: { ...p.footer, text: e.target.value } }))} placeholder="Teks footer" className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-200" />
        <ArrayField items={config.footer?.columns || []} onChange={v => setConfig((p: any) => ({ ...p, footer: { ...p.footer, columns: v } }))} fields={[
          { key: 'title', label: 'Judul Kolom' },
          { key: 'items', label: 'Items (json array)', type: 'textarea' },
        ]} label="Kolom Footer" />
      </SectionCard>

      {/* Quick Preview link */}
      <div className="flex items-center justify-center gap-2 text-sm text-slate-400 dark:text-zinc-500 pb-8">
        <Sparkles className="w-4 h-4" />
        <span>Perubahan langsung tampil di halaman utama setelah disimpan.</span>
      </div>
    </div>
  );
}
