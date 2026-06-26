import { useState, useEffect } from 'react';
import { get, put } from '../../api/client';
import { Globe, ExternalLink, ToggleLeft, ToggleRight, Loader2, Plus, Trash2, Award, Users as UsersIcon, BookOpen, GraduationCap, Target, Eye, Trophy, School, ChevronDown, ChevronUp, Palette } from 'lucide-react';
import FileUpload from '../../components/ui/FileUpload';

type PrestasiItem = { icon: string; title: string; desc: string };
type PromosiItem = { title: string; description: string; image: string; link: string };
type StrukturItem = { id: string; jabatan: string; nama: string; image: string };

const iconOptions = [
  { value: 'Award', label: 'Award' }, { value: 'Users', label: 'Users' },
  { value: 'BookOpen', label: 'BookOpen' }, { value: 'GraduationCap', label: 'GraduationCap' },
  { value: 'Target', label: 'Target' }, { value: 'Eye', label: 'Eye' },
  { value: 'Trophy', label: 'Trophy' }, { value: 'School', label: 'School' },
];

const PRESET_COLORS = [
  '#10b981', '#059669', '#2563eb', '#3b82f6', '#6366f1', '#8b5cf6',
  '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
  '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#1e293b', '#475569', '#64748b',
];

function ColorPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
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

function SectionCard({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="p-5 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-left">
        <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{title}</h2>
        {open ? <ChevronUp size={16} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />}
      </button>
      {open && <div className="space-y-4">{children}</div>}
    </div>
  );
}

export default function LandingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slug, setSlug] = useState('');
  const [form, setForm] = useState({
    active: false, seoTitle: '', seoDescription: '',
    heroTitle: '', heroSubtitle: '',
    showBerita: true, showPPDB: true, showProdi: true, showStruktur: true, showPrestasi: true, showPromosi: true, showPopUp: false,
    primaryColor: '#10b981',
    heroImages: [] as string[],
    sambutan: { active: false, title: 'Sambutan', content: '', nama: '', jabatan: '', image: '' },
    prestasi: [] as PrestasiItem[],
    promosi: [] as PromosiItem[],
    strukturOrganisasi: [] as StrukturItem[],
    popUp: { active: false, title: '', content: '', image: '', buttonText: 'Tutup', buttonLink: '' },
    tahunAkademik: '2025/2026',
  });

  useEffect(() => {
    get<{ landingPage: typeof form; landingPageUrl: string }>('/campus/landing-page')
      .then(d => {
        setSlug(d.landingPageUrl?.replace('.aone-siakad.com', '') || '');
        setForm(prev => ({
          ...prev,
          ...d.landingPage,
          heroImages: d.landingPage.heroImages || [],
          prestasi: d.landingPage.prestasi || [],
          promosi: d.landingPage.promosi || [],
          strukturOrganisasi: d.landingPage.strukturOrganisasi || [],
          sambutan: d.landingPage.sambutan || prev.sambutan,
          popUp: d.landingPage.popUp || prev.popUp,
        }));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await put('/campus/landing-page', { landingPage: form });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  }

  function addHeroImage() { setForm({ ...form, heroImages: [...form.heroImages, ''] }); }
  function updHeroImage(i: number, v: string) { const a = [...form.heroImages]; a[i] = v; setForm({ ...form, heroImages: a }); }
  function delHeroImage(i: number) { setForm({ ...form, heroImages: form.heroImages.filter((_, idx) => idx !== i) }); }

  function addPrestasi() { setForm({ ...form, prestasi: [...form.prestasi, { icon: 'Award', title: '', desc: '' }] }); }
  function updPrestasi(i: number, k: keyof PrestasiItem, v: string) { const a = [...form.prestasi]; a[i] = { ...a[i], [k]: v }; setForm({ ...form, prestasi: a }); }
  function delPrestasi(i: number) { setForm({ ...form, prestasi: form.prestasi.filter((_, idx) => idx !== i) }); }

  function addPromosi() { setForm({ ...form, promosi: [...form.promosi, { title: '', description: '', image: '', link: '' }] }); }
  function updPromosi(i: number, k: keyof PromosiItem, v: string) { const a = [...form.promosi]; a[i] = { ...a[i], [k]: v }; setForm({ ...form, promosi: a }); }
  function delPromosi(i: number) { setForm({ ...form, promosi: form.promosi.filter((_, idx) => idx !== i) }); }

  function addStruktur() { setForm({ ...form, strukturOrganisasi: [...form.strukturOrganisasi, { id: crypto.randomUUID(), jabatan: '', nama: '', image: '' }] }); }
  function updStruktur(i: number, k: keyof StrukturItem, v: string) { const a = [...form.strukturOrganisasi]; a[i] = { ...a[i], [k]: v }; setForm({ ...form, strukturOrganisasi: a }); }
  function delStruktur(i: number) { setForm({ ...form, strukturOrganisasi: form.strukturOrganisasi.filter((_, idx) => idx !== i) }); }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} />
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight" style={{ color: 'var(--foreground)' }}>Landing Page Kampus</h1>
        <p className="text-xs mt-0.5 flex items-center gap-3 flex-wrap" style={{ color: 'var(--muted-foreground)' }}>
          <span>URL publik: <a href={`/kampus/${slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium" style={{ color: 'var(--primary)' }}>
            /kampus/{slug} <ExternalLink size={11} />
          </a></span>
          {slug && (
            <a href={`http://${slug}.aone-siakad.com`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
              {slug}.aone-siakad.com <ExternalLink size={11} />
            </a>
          )}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
        <div className="p-5 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Aktifkan Halaman Publik</p>
              <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Jika nonaktif, pengunjung akan melihat halaman tidak ditemukan</p>
            </div>
            <button type="button" onClick={() => setForm({ ...form, active: !form.active })} className="p-2 rounded-lg transition-all" style={{ color: form.active ? 'var(--primary)' : 'var(--muted-foreground)', background: form.active ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--muted)' }}>
              {form.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </button>
          </div>
        </div>

        <SectionCard title="SEO & Hero Section" defaultOpen>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>SEO Title</label>
            <input value={form.seoTitle} onChange={e => setForm({ ...form, seoTitle: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>SEO Description</label>
            <input value={form.seoDescription} onChange={e => setForm({ ...form, seoDescription: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Judul Hero</label>
            <input value={form.heroTitle} onChange={e => setForm({ ...form, heroTitle: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Subjudul Hero</label>
            <input value={form.heroSubtitle} onChange={e => setForm({ ...form, heroSubtitle: e.target.value })} className="input-field" />
          </div>
          <ColorPicker value={form.primaryColor} onChange={v => setForm({ ...form, primaryColor: v })} label="Warna Aksen" />
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Gambar Hero (Slider)</label>
              <button type="button" onClick={addHeroImage} className="text-[10px] flex items-center gap-0.5" style={{ color: 'var(--primary)' }}><Plus size={12} /> Tambah</button>
            </div>
            <div className="space-y-2">
              {form.heroImages.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <FileUpload value={url} onChange={(v) => updHeroImage(i, v)} accept="image/*" />
                  <button type="button" onClick={() => delHeroImage(i)} className="p-1.5" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>
                </div>
              ))}
              {form.heroImages.length === 0 && <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Belum ada gambar. Tambah minimal 1 gambar untuk slider hero.</p>}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Sambutan (Kata Pengantar)">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setForm({ ...form, sambutan: { ...form.sambutan, active: !form.sambutan.active } })} className="p-1.5 rounded-lg transition-all" style={{ color: form.sambutan.active ? 'var(--primary)' : 'var(--muted-foreground)' }}>
              {form.sambutan.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            </button>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{form.sambutan.active ? 'Ditampilkan' : 'Disembunyikan'}</span>
          </div>
          {form.sambutan.active && (
            <>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Judul</label>
                <input value={form.sambutan.title} onChange={e => setForm({ ...form, sambutan: { ...form.sambutan, title: e.target.value } })} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Konten Sambutan</label>
                <textarea value={form.sambutan.content} onChange={e => setForm({ ...form, sambutan: { ...form.sambutan, content: e.target.value } })} className="input-field h-20 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Nama (e.g. Rektor)</label>
                <input value={form.sambutan.nama} onChange={e => setForm({ ...form, sambutan: { ...form.sambutan, nama: e.target.value } })} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Jabatan</label>
                <input value={form.sambutan.jabatan} onChange={e => setForm({ ...form, sambutan: { ...form.sambutan, jabatan: e.target.value } })} className="input-field" />
              </div>
              <FileUpload value={form.sambutan.image} onChange={(v) => setForm({ ...form, sambutan: { ...form.sambutan, image: v } })} accept="image/*" label="Gambar" />
            </>
          )}
        </SectionCard>

        <SectionCard title="Prestasi & Akreditasi">
          <div className="space-y-3">
            {form.prestasi.map((p, i) => (
              <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: 'var(--muted)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--muted-foreground)' }}>Item #{i + 1}</span>
                  <button type="button" onClick={() => delPrestasi(i)} className="p-1" style={{ color: '#EF4444' }}><Trash2 size={12} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Ikon</label>
                    <select value={p.icon} onChange={e => updPrestasi(i, 'icon', e.target.value)} className="input-field text-xs">
                      {iconOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Judul</label>
                    <input value={p.title} onChange={e => updPrestasi(i, 'title', e.target.value)} className="input-field text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Deskripsi</label>
                  <input value={p.desc} onChange={e => updPrestasi(i, 'desc', e.target.value)} className="input-field text-xs" />
                </div>
              </div>
            ))}
            <button type="button" onClick={addPrestasi} className="w-full py-2 border-2 border-dashed rounded-xl text-xs flex items-center justify-center gap-1 transition-all" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
              <Plus size={14} /> Tambah Prestasi
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Promosi / Banner">
          <div className="space-y-3">
            {form.promosi.map((p, i) => (
              <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: 'var(--muted)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--muted-foreground)' }}>Banner #{i + 1}</span>
                  <button type="button" onClick={() => delPromosi(i)} className="p-1" style={{ color: '#EF4444' }}><Trash2 size={12} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Judul</label>
                    <input value={p.title} onChange={e => updPromosi(i, 'title', e.target.value)} className="input-field text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Link</label>
                    <input value={p.link} onChange={e => updPromosi(i, 'link', e.target.value)} className="input-field text-xs" placeholder="https://..." />
                  </div>
                </div>
                <div>
                  <label className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Deskripsi</label>
                  <input value={p.description} onChange={e => updPromosi(i, 'description', e.target.value)} className="input-field text-xs" />
                </div>
                <div>
                  <label className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Gambar</label>
                  <FileUpload value={p.image} onChange={(v) => updPromosi(i, 'image', v)} accept="image/*" />
                </div>
              </div>
            ))}
            <button type="button" onClick={addPromosi} className="w-full py-2 border-2 border-dashed rounded-xl text-xs flex items-center justify-center gap-1 transition-all" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
              <Plus size={14} /> Tambah Promosi
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Struktur Organisasi">
          <div className="space-y-3">
            {form.strukturOrganisasi.map((s, i) => (
              <div key={s.id} className="p-3 rounded-xl space-y-2" style={{ background: 'var(--muted)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--muted-foreground)' }}>#{(i + 1).toString().padStart(2, '0')}</span>
                  <button type="button" onClick={() => delStruktur(i)} className="p-1" style={{ color: '#EF4444' }}><Trash2 size={12} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Jabatan</label>
                    <input value={s.jabatan} onChange={e => updStruktur(i, 'jabatan', e.target.value)} className="input-field text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Nama</label>
                    <input value={s.nama} onChange={e => updStruktur(i, 'nama', e.target.value)} className="input-field text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Foto (URL)</label>
                  <FileUpload value={s.image} onChange={(v) => updStruktur(i, 'image', v)} accept="image/*" />
                </div>
              </div>
            ))}
            <button type="button" onClick={addStruktur} className="w-full py-2 border-2 border-dashed rounded-xl text-xs flex items-center justify-center gap-1 transition-all" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
              <Plus size={14} /> Tambah Struktur
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Popup Banner">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setForm({ ...form, popUp: { ...form.popUp, active: !form.popUp.active } })} className="p-1.5 rounded-lg transition-all" style={{ color: form.popUp.active ? 'var(--primary)' : 'var(--muted-foreground)' }}>
              {form.popUp.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            </button>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{form.popUp.active ? 'Ditampilkan (1x per kunjungan)' : 'Disembunyikan'}</span>
          </div>
          {form.popUp.active && (
            <>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Judul Popup</label>
                <input value={form.popUp.title} onChange={e => setForm({ ...form, popUp: { ...form.popUp, title: e.target.value } })} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Konten Popup</label>
                <textarea value={form.popUp.content} onChange={e => setForm({ ...form, popUp: { ...form.popUp, content: e.target.value } })} className="input-field h-16 resize-none" />
              </div>
              <FileUpload value={form.popUp.image} onChange={(v) => setForm({ ...form, popUp: { ...form.popUp, image: v } })} accept="image/*" label="Gambar" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Tombol Text</label>
                  <input value={form.popUp.buttonText} onChange={e => setForm({ ...form, popUp: { ...form.popUp, buttonText: e.target.value } })} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Tombol Link</label>
                  <input value={form.popUp.buttonLink} onChange={e => setForm({ ...form, popUp: { ...form.popUp, buttonLink: e.target.value } })} className="input-field" placeholder="https://..." />
                </div>
              </div>
            </>
          )}
        </SectionCard>

        <SectionCard title="Modul & Konfigurasi">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['showBerita', 'Berita / Artikel'],
              ['showPPDB', 'PPDB'],
              ['showProdi', 'Program Studi'],
              ['showStruktur', 'Struktur Organisasi'],
              ['showPrestasi', 'Prestasi & Akreditasi'],
              ['showPromosi', 'Promosi / Banner'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between p-2 rounded-lg cursor-pointer" style={{ background: 'var(--muted)' }}>
                <span className="text-xs" style={{ color: 'var(--foreground)' }}>{label}</span>
                <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} className="accent-emerald-500" />
              </label>
            ))}
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Tahun Akademik</label>
            <input value={form.tahunAkademik} onChange={e => setForm({ ...form, tahunAkademik: e.target.value })} className="input-field" placeholder="2025/2026" />
          </div>
        </SectionCard>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="px-5 py-2.5 text-white font-bold rounded-xl text-sm transition-all shadow-lg" style={{ background: 'var(--primary)' }}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          {saved && <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>✓ Tersimpan</span>}
        </div>
      </form>
    </div>
  );
}