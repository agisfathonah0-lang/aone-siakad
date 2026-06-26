import { useState, useEffect, useCallback } from 'react';
import { get, put } from '../../api/client';
import {
  Save, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp,
  GripVertical, Sparkles, Palette,
} from 'lucide-react';

interface SectionVisibility {
  hero: boolean; ppdb: boolean; prodi: boolean; features: boolean;
  testimonials: boolean; faq: boolean; cta: boolean;
}

const PRESET_COLORS = [
  '#10b981', '#059669', '#2563eb', '#3b82f6', '#6366f1', '#8b5cf6',
  '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
  '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9',
];

const defaultConfig = {
  colors: {
    primary: '#10b981',
    background: '#ffffff',
    text: '#1e293b',
  },
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
      { icon: 'Server', title: 'Multi-Tenant Architecture', desc: 'Setiap kampus mendapat environment terisolasi.', color: '#10b981' },
      { icon: 'Database', title: 'Sinkronasi PDDIKTI', desc: 'Laporan otomatis real-time ke PDDIKTI.', color: '#6366f1' },
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
  ppdbBanner: { text: 'Daftarkan kampus Anda sekarang. Demo trial 1 hari, approval 1x24 jam.', show: true },
};

function SectionCard({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} className="overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full px-6 py-4 flex items-center justify-between text-left transition" style={{ background: 'transparent' }}>
        <span className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{title}</span>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />}
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
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
        <button onClick={() => onChange([...items, Object.fromEntries(fields.map(f => [f.key, '']))])} className="text-xs flex items-center gap-1 font-medium" style={{ color: 'var(--primary)' }}>
          <Plus className="w-3 h-3" /> Tambah
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
          <GripVertical className="w-4 h-4 mt-2 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {fields.map(f => (
              f.type === 'textarea' ? (
                <textarea key={f.key} value={item[f.key] || ''} onChange={e => update(i, f.key, e.target.value)} placeholder={f.label} className="col-span-full text-xs px-3 py-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} rows={2} />
              ) : (
                <input key={f.key} type={f.type || 'text'} value={item[f.key] || ''} onChange={e => update(i, f.key, e.target.value)} placeholder={f.label} className="text-xs px-3 py-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
              )
            ))}
          </div>
          <button onClick={() => onChange(items.filter((_: any, j: number) => j !== i))} style={{ color: '#EF4444' }} className="p-1"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}

function ColorPalette({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [customOpen, setCustomOpen] = useState(false);
  return (
    <div>
      <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className="w-7 h-7 rounded-lg border-2 transition-all"
              style={{
                backgroundColor: c,
                borderColor: value === c ? 'var(--foreground)' : 'var(--border)',
                boxShadow: value === c ? '0 0 0 2px var(--primary)' : 'none',
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCustomOpen(!customOpen)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
        >
          <Palette size={14} />
        </button>
      </div>
      {customOpen && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5"
          />
          <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{value}</span>
        </div>
      )}
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
    <div className="space-y-6" style={{ maxWidth: '1024px', margin: '0 auto' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Landing Page Builder</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Sesuaikan tampilan halaman utama vendor AONE SIAKAD</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg transition flex items-center gap-2" style={{ background: 'var(--primary)' }}>
          <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan'}
        </button>
      </div>

      {/* Color Settings */}
      <SectionCard title="Pengaturan Warna" defaultOpen>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ColorPalette value={config.colors?.primary || '#10b981'} onChange={v => setConfig((p: any) => ({ ...p, colors: { ...p.colors, primary: v } }))} label="Warna Utama" />
          <ColorPalette value={config.colors?.background || '#ffffff'} onChange={v => setConfig((p: any) => ({ ...p, colors: { ...p.colors, background: v } }))} label="Warna Latar" />
          <ColorPalette value={config.colors?.text || '#1e293b'} onChange={v => setConfig((p: any) => ({ ...p, colors: { ...p.colors, text: v } }))} label="Warna Teks" />
        </div>
      </SectionCard>

      {/* PPDB Banner */}
      <SectionCard title="PPDB Banner Info" defaultOpen>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium shrink-0" style={{ color: 'var(--foreground)' }}>Tampilkan</label>
          <button onClick={() => setConfig((p: any) => ({ ...p, ppdbBanner: { ...p.ppdbBanner, show: !p.ppdbBanner?.show } }))} className="w-10 h-5 rounded-full transition-colors relative" style={{ background: config.ppdbBanner?.show ? 'var(--primary)' : 'var(--muted)' }}>
            <div className="w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-transform" style={{ transform: config.ppdbBanner?.show ? 'translateX(20px)' : 'translateX(2px)' }} />
          </button>
        </div>
        <input value={config.ppdbBanner?.text || ''} onChange={e => update('ppdbBanner', { ...h('ppdbBanner'), text: e.target.value })} placeholder="Teks banner PPDB" className="w-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
      </SectionCard>

      {/* Hero Section */}
      <SectionCard title={`Hero Section ${vis.hero ? '' : '(Tersembunyi)'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Visibilitas</span>
          <button onClick={() => toggleSection('hero')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: vis.hero ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--muted)', color: vis.hero ? 'var(--primary)' : 'var(--muted-foreground)' }}>
            {vis.hero ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {vis.hero ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={h('hero').title || ''} onChange={e => update('hero', { ...h('hero'), title: e.target.value })} placeholder="Judul hero" className="col-span-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          <textarea value={h('hero').subtitle || ''} onChange={e => update('hero', { ...h('hero'), subtitle: e.target.value })} placeholder="Subtitle hero" className="col-span-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} rows={2} />
          <input value={h('hero').badge || ''} onChange={e => update('hero', { ...h('hero'), badge: e.target.value })} placeholder="Badge (mis: Portal Akademik Terintegrasi)" className="text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          <input value={h('hero').ctaText || ''} onChange={e => update('hero', { ...h('hero'), ctaText: e.target.value })} placeholder="Teks tombol CTA" className="text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          <input value={h('hero').secondaryText || ''} onChange={e => update('hero', { ...h('hero'), secondaryText: e.target.value })} placeholder="Teks tombol sekunder" className="text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
        </div>
        <ArrayField items={h('hero').stats || []} onChange={v => update('hero', { ...h('hero'), stats: v })} fields={[{ key: 'value', label: 'Nilai' }, { key: 'label', label: 'Label' }]} label="Statistik Hero" />
      </SectionCard>

      {/* PPDB Section */}
      <SectionCard title={`PPDB Section ${vis.ppdb ? '' : '(Tersembunyi)'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Visibilitas</span>
          <button onClick={() => toggleSection('ppdb')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: vis.ppdb ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--muted)', color: vis.ppdb ? 'var(--primary)' : 'var(--muted-foreground)' }}>
            {vis.ppdb ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {vis.ppdb ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={h('ppdb').title || ''} onChange={e => update('ppdb', { ...h('ppdb'), title: e.target.value })} placeholder="Judul" className="col-span-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          <textarea value={h('ppdb').subtitle || ''} onChange={e => update('ppdb', { ...h('ppdb'), subtitle: e.target.value })} placeholder="Subtitle" className="col-span-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} rows={2} />
          <input value={h('ppdb').badge || ''} onChange={e => update('ppdb', { ...h('ppdb'), badge: e.target.value })} placeholder="Badge" className="text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
        </div>
        <ArrayField items={h('ppdb').stats || []} onChange={v => update('ppdb', { ...h('ppdb'), stats: v })} fields={[{ key: 'icon', label: 'Icon' }, { key: 'label', label: 'Label' }, { key: 'value', label: 'Nilai' }, { key: 'change', label: 'Perubahan' }]} label="Statistik PPDB" />
        <ArrayField items={h('ppdb').steps || []} onChange={v => update('ppdb', { ...h('ppdb'), steps: v })} fields={[{ key: 'icon', label: 'Nama Icon' }, { key: 'title', label: 'Judul' }, { key: 'desc', label: 'Deskripsi' }]} label="Langkah Pendaftaran" />
      </SectionCard>

      {/* Program Studi Section */}
      <SectionCard title={`Program Studi ${vis.prodi ? '' : '(Tersembunyi)'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Visibilitas</span>
          <button onClick={() => toggleSection('prodi')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: vis.prodi ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--muted)', color: vis.prodi ? 'var(--primary)' : 'var(--muted-foreground)' }}>
            {vis.prodi ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {vis.prodi ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={h('prodi').title || ''} onChange={e => update('prodi', { ...h('prodi'), title: e.target.value })} placeholder="Judul" className="col-span-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          <textarea value={h('prodi').subtitle || ''} onChange={e => update('prodi', { ...h('prodi'), subtitle: e.target.value })} placeholder="Subtitle" className="col-span-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} rows={2} />
          <input value={h('prodi').badge || ''} onChange={e => update('prodi', { ...h('prodi'), badge: e.target.value })} placeholder="Badge" className="text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
        </div>
        <ArrayField items={hItems('prodi')} onChange={v => setItems('prodi', v)} fields={[{ key: 'kode', label: 'Kode' }, { key: 'nama', label: 'Nama' }, { key: 'jenjang', label: 'Jenjang' }, { key: 'fakultas', label: 'Fakultas' }, { key: 'akreditasi', label: 'Akreditasi' }]} label="Program Studi" />
      </SectionCard>

      {/* Features Section */}
      <SectionCard title={`Features ${vis.features ? '' : '(Tersembunyi)'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Visibilitas</span>
          <button onClick={() => toggleSection('features')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: vis.features ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--muted)', color: vis.features ? 'var(--primary)' : 'var(--muted-foreground)' }}>
            {vis.features ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {vis.features ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={h('features').title || ''} onChange={e => update('features', { ...h('features'), title: e.target.value })} placeholder="Judul" className="col-span-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          <textarea value={h('features').subtitle || ''} onChange={e => update('features', { ...h('features'), subtitle: e.target.value })} placeholder="Subtitle" className="col-span-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} rows={2} />
          <input value={h('features').badge || ''} onChange={e => update('features', { ...h('features'), badge: e.target.value })} placeholder="Badge" className="text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
        </div>
        <ArrayField items={hItems('features')} onChange={v => setItems('features', v)} fields={[
          { key: 'icon', label: 'Icon' },
          { key: 'title', label: 'Judul' },
          { key: 'desc', label: 'Deskripsi' },
          { key: 'color', label: 'Warna (hex)' },
        ]} label="Fitur" />
        {iconOptions.length > 0 && (
          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Icon tersedia: {iconOptions.join(', ')}</p>
        )}
      </SectionCard>

      {/* Testimonials Section */}
      <SectionCard title={`Testimonials ${vis.testimonials ? '' : '(Tersembunyi)'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Visibilitas</span>
          <button onClick={() => toggleSection('testimonials')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: vis.testimonials ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--muted)', color: vis.testimonials ? 'var(--primary)' : 'var(--muted-foreground)' }}>
            {vis.testimonials ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {vis.testimonials ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={h('testimonials').title || ''} onChange={e => update('testimonials', { ...h('testimonials'), title: e.target.value })} placeholder="Judul" className="col-span-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          <textarea value={h('testimonials').subtitle || ''} onChange={e => update('testimonials', { ...h('testimonials'), subtitle: e.target.value })} placeholder="Subtitle" className="col-span-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} rows={2} />
          <input value={h('testimonials').badge || ''} onChange={e => update('testimonials', { ...h('testimonials'), badge: e.target.value })} placeholder="Badge" className="text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
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
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Visibilitas</span>
          <button onClick={() => toggleSection('faq')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: vis.faq ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--muted)', color: vis.faq ? 'var(--primary)' : 'var(--muted-foreground)' }}>
            {vis.faq ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {vis.faq ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={h('faq').title || ''} onChange={e => update('faq', { ...h('faq'), title: e.target.value })} placeholder="Judul" className="col-span-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          <textarea value={h('faq').subtitle || ''} onChange={e => update('faq', { ...h('faq'), subtitle: e.target.value })} placeholder="Subtitle" className="col-span-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} rows={2} />
          <input value={h('faq').badge || ''} onChange={e => update('faq', { ...h('faq'), badge: e.target.value })} placeholder="Badge" className="text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
        </div>
        <ArrayField items={hItems('faq')} onChange={v => setItems('faq', v)} fields={[{ key: 'q', label: 'Pertanyaan' }, { key: 'a', label: 'Jawaban', type: 'textarea' }]} label="FAQ" />
      </SectionCard>

      {/* CTA Section */}
      <SectionCard title={`CTA Section ${vis.cta ? '' : '(Tersembunyi)'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Visibilitas</span>
          <button onClick={() => toggleSection('cta')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: vis.cta ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--muted)', color: vis.cta ? 'var(--primary)' : 'var(--muted-foreground)' }}>
            {vis.cta ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {vis.cta ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={h('cta').title || ''} onChange={e => update('cta', { ...h('cta'), title: e.target.value })} placeholder="Judul" className="col-span-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          <textarea value={h('cta').subtitle || ''} onChange={e => update('cta', { ...h('cta'), subtitle: e.target.value })} placeholder="Subtitle" className="col-span-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} rows={2} />
          <input value={h('cta').phone || ''} onChange={e => update('cta', { ...h('cta'), phone: e.target.value })} placeholder="Telepon" className="text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          <input value={h('cta').email || ''} onChange={e => update('cta', { ...h('cta'), email: e.target.value })} placeholder="Email" className="text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
          <input value={h('cta').address || ''} onChange={e => update('cta', { ...h('cta'), address: e.target.value })} placeholder="Alamat" className="text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
        </div>
      </SectionCard>

      {/* Footer */}
      <SectionCard title="Footer">
        <input value={config.footer?.text || ''} onChange={e => setConfig((p: any) => ({ ...p, footer: { ...p.footer, text: e.target.value } }))} placeholder="Teks footer" className="w-full text-sm px-4 py-2.5 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }} />
        <ArrayField items={config.footer?.columns || []} onChange={v => setConfig((p: any) => ({ ...p, footer: { ...p.footer, columns: v } }))} fields={[
          { key: 'title', label: 'Judul Kolom' },
          { key: 'items', label: 'Items (json array)', type: 'textarea' },
        ]} label="Kolom Footer" />
      </SectionCard>

      <div className="flex items-center justify-center gap-2 text-sm pb-8" style={{ color: 'var(--muted-foreground)' }}>
        <Sparkles className="w-4 h-4" />
        <span>Perubahan langsung tampil di halaman utama setelah disimpan.</span>
      </div>
    </div>
  );
}