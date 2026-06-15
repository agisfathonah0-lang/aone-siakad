import { useState, useEffect } from 'react';
import { get, put } from '../../api/client';
import FileUpload from '../../components/ui/FileUpload';
import { Plus, Trash2, MoveUp, MoveDown, GripVertical, Settings, Eye, Save } from 'lucide-react';

interface FieldDef {
  key: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  order: number;
}

interface StepDef {
  title: string;
  fields: FieldDef[];
}

interface Appearance {
  bannerImage: string;
  formColor: string;
  accentColor: string;
  showTimeline: boolean;
  customCSS: string;
}

interface FormConfig {
  steps: StepDef[];
  appearance: Appearance;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Teks' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Telepon' },
  { value: 'number', label: 'Angka' },
  { value: 'date', label: 'Tanggal' },
  { value: 'select', label: 'Pilihan' },
  { value: 'file', label: 'File Upload' },
  { value: 'prodi', label: 'Program Studi' },
];

function DefaultField(): FieldDef {
  return { key: '', label: '', type: 'text', required: false, placeholder: '', order: 0 };
}

export default function PPDBConfigPage() {
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState<{ stepIdx: number; fieldIdx: number } | null>(null);

  useEffect(() => {
    get<FormConfig>('/campus/ppdb-config')
      .then(setConfig)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function addStep() {
    if (!config) return;
    setConfig({ ...config, steps: [...config.steps, { title: '', fields: [] }] });
  }

  function delStep(i: number) {
    if (!config) return;
    setConfig({ ...config, steps: config.steps.filter((_, idx) => idx !== i) });
  }

  function addField(si: number) {
    if (!config) return;
    const steps = [...config.steps];
    steps[si] = { ...steps[si], fields: [...steps[si].fields, { ...DefaultField(), order: steps[si].fields.length + 1 }] };
    setConfig({ ...config, steps });
    setEditing({ stepIdx: si, fieldIdx: steps[si].fields.length - 1 });
  }

  function delField(si: number, fi: number) {
    if (!config) return;
    const steps = [...config.steps];
    steps[si] = { ...steps[si], fields: steps[si].fields.filter((_, idx) => idx !== fi).map((f, i) => ({ ...f, order: i + 1 })) };
    setConfig({ ...config, steps });
    if (editing?.stepIdx === si && editing?.fieldIdx === fi) setEditing(null);
  }

  function moveField(si: number, fi: number, dir: -1 | 1) {
    if (!config) return;
    const steps = [...config.steps];
    const fields = [...steps[si].fields];
    const ni = fi + dir;
    if (ni < 0 || ni >= fields.length) return;
    [fields[fi], fields[ni]] = [fields[ni], fields[fi]];
    steps[si] = { ...steps[si], fields: fields.map((f, i) => ({ ...f, order: i + 1 })) };
    setConfig({ ...config, steps });
  }

  function updField(si: number, fi: number, patch: Partial<FieldDef>) {
    if (!config) return;
    const steps = [...config.steps];
    steps[si] = { ...steps[si], fields: steps[si].fields.map((f, idx) => idx === fi ? { ...f, ...patch } : f) };
    setConfig({ ...config, steps });
  }

  function updStep(si: number, title: string) {
    if (!config) return;
    const steps = [...config.steps];
    steps[si] = { ...steps[si], title };
    setConfig({ ...config, steps });
  }

  function addOption(si: number, fi: number) {
    if (!config) return;
    const steps = [...config.steps];
    const field = steps[si].fields[fi];
    const opts = field.options || [];
    steps[si].fields[fi] = { ...field, options: [...opts, { value: '', label: '' }] };
    setConfig({ ...config, steps });
  }

  function updOption(si: number, fi: number, oi: number, patch: Partial<{ value: string; label: string }>) {
    if (!config) return;
    const steps = [...config.steps];
    const opts = [...(steps[si].fields[fi].options || [])];
    opts[oi] = { ...opts[oi], ...patch };
    steps[si].fields[fi] = { ...steps[si].fields[fi], options: opts };
    setConfig({ ...config, steps });
  }

  function delOption(si: number, fi: number, oi: number) {
    if (!config) return;
    const steps = [...config.steps];
    const opts = (steps[si].fields[fi].options || []).filter((_, i) => i !== oi);
    steps[si].fields[fi] = { ...steps[si].fields[fi], options: opts };
    setConfig({ ...config, steps });
  }

  async function save() {
    if (!config) return;
    setSaving(true); setMsg('');
    try {
      await put('/campus/ppdb-config', config);
      setMsg('Konfigurasi disimpan!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Gagal menyimpan');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="p-8 text-center text-sm text-zinc-400">Memuat...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Form PPDB</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Custom field dan tampilan form pendaftaran</p>
        </div>
        <button onClick={save} disabled={saving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5">
          <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
      {msg && <div className={`p-3 rounded-xl text-xs font-bold ${msg.includes('berhasil') ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>{msg}</div>}

      {/* Appearance */}
      <div className="card p-4 space-y-4">
        <h3 className="text-sm font-bold dark:text-white flex items-center gap-1.5"><Settings size={14} /> Tampilan</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1">Banner / Gambar Header</label>
            <FileUpload value={config?.appearance.bannerImage || ''} onChange={(v) => setConfig(config ? { ...config, appearance: { ...config.appearance, bannerImage: v } } : config)} accept="image/*" />
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-zinc-500 block mb-1">Warna Tombol</label>
              <input type="color" value={config?.appearance.formColor || '#22c55e'} onChange={(e) => setConfig(config ? { ...config, appearance: { ...config.appearance, formColor: e.target.value } } : config)} className="w-full h-8 rounded-lg cursor-pointer" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 block mb-1">Warna Aksen</label>
              <input type="color" value={config?.appearance.accentColor || '#6366f1'} onChange={(e) => setConfig(config ? { ...config, appearance: { ...config.appearance, accentColor: e.target.value } } : config)} className="w-full h-8 rounded-lg cursor-pointer" />
            </div>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <input type="checkbox" checked={config?.appearance.showTimeline ?? true} onChange={(e) => setConfig(config ? { ...config, appearance: { ...config.appearance, showTimeline: e.target.checked } } : config)} className="rounded" />
          Tampilkan timeline step
        </label>
      </div>

      {/* Steps */}
      {config?.steps.map((step, si) => (
        <div key={si} className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <input value={step.title} onChange={(e) => updStep(si, e.target.value)} className="input-field font-bold text-sm flex-1 max-w-xs" placeholder="Nama step (mis: Data Pribadi)" />
            <div className="flex gap-1">
              <button onClick={() => delStep(si)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={14} /></button>
            </div>
          </div>
          <div className="space-y-2">
            {step.fields.map((field, fi) => (
              <div key={fi} className={`rounded-xl border ${editing?.stepIdx === si && editing?.fieldIdx === fi ? 'border-emerald-400 dark:border-emerald-600' : 'border-zinc-200 dark:border-zinc-700'} overflow-hidden`}>
                <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50">
                  <GripVertical size={14} className="text-zinc-300 flex-shrink-0" />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 flex-1">{field.label || 'Field baru'} <span className="text-[10px] text-zinc-400">({field.type})</span></span>
                  <button onClick={() => moveField(si, fi, -1)} className="p-1 text-zinc-400 hover:text-zinc-600"><MoveUp size={12} /></button>
                  <button onClick={() => moveField(si, fi, 1)} className="p-1 text-zinc-400 hover:text-zinc-600"><MoveDown size={12} /></button>
                  <button onClick={() => setEditing(editing?.stepIdx === si && editing?.fieldIdx === fi ? null : { stepIdx: si, fieldIdx: fi })} className="p-1 text-zinc-400 hover:text-emerald-600"><Settings size={12} /></button>
                  <button onClick={() => delField(si, fi)} className="p-1 text-zinc-400 hover:text-red-500"><Trash2 size={12} /></button>
                </div>
                {editing?.stepIdx === si && editing?.fieldIdx === fi && (
                  <div className="p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-medium text-zinc-400">Key</label>
                        <input value={field.key} onChange={(e) => updField(si, fi, { key: e.target.value })} className="input-field text-xs mt-0.5" placeholder="nama_field" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-zinc-400">Label</label>
                        <input value={field.label} onChange={(e) => updField(si, fi, { label: e.target.value })} className="input-field text-xs mt-0.5" placeholder="Nama Field" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-zinc-400">Tipe Input</label>
                        <select value={field.type} onChange={(e) => updField(si, fi, { type: e.target.value })} className="input-field text-xs mt-0.5">
                          {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-zinc-400">Placeholder</label>
                        <input value={field.placeholder || ''} onChange={(e) => updField(si, fi, { placeholder: e.target.value })} className="input-field text-xs mt-0.5" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-zinc-500">
                      <input type="checkbox" checked={field.required} onChange={(e) => updField(si, fi, { required: e.target.checked })} className="rounded" />
                      Wajib diisi
                    </label>
                    {(field.type === 'select') && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-zinc-400">Opsi Pilihan</span>
                          <button onClick={() => addOption(si, fi)} className="text-[10px] text-emerald-600 hover:text-emerald-500 flex items-center gap-0.5"><Plus size={10} /> Tambah</button>
                        </div>
                        {(field.options || []).map((opt, oi) => (
                          <div key={oi} className="flex gap-2 items-center">
                            <input value={opt.value} onChange={(e) => updOption(si, fi, oi, { value: e.target.value })} className="input-field text-[10px] flex-1" placeholder="Value" />
                            <input value={opt.label} onChange={(e) => updOption(si, fi, oi, { label: e.target.value })} className="input-field text-[10px] flex-1" placeholder="Label" />
                            <button onClick={() => delOption(si, fi, oi)} className="p-1 text-red-400"><Trash2 size={10} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => addField(si)} className="w-full py-2 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl text-xs text-zinc-400 hover:text-emerald-500 hover:border-emerald-400 transition flex items-center justify-center gap-1"><Plus size={14} /> Tambah Field</button>
        </div>
      ))}
      <button onClick={addStep} className="w-full py-3 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl text-sm text-zinc-400 hover:text-emerald-500 hover:border-emerald-400 transition flex items-center justify-center gap-1.5"><Plus size={16} /> Tambah Step</button>

      {/* Preview */}
      {config && (
        <div className="card p-4">
          <h3 className="text-sm font-bold dark:text-white flex items-center gap-1.5 mb-3"><Eye size={14} /> Pratinjau</h3>
          <div className="text-xs space-y-1 text-zinc-500 dark:text-zinc-400 font-mono">
            <p>Step: {config.steps.map(s => s.title || '(tanpa judul)').join(' → ')}</p>
            <p>Total field: {config.steps.reduce((a, s) => a + s.fields.length, 0)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
