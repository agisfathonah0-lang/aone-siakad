import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get, post, setTenantSlug } from '../api/client';
import api from '../api/client';
import useSEO from '../hooks/useSEO';
import { Building2, Loader2, CheckCircle, ArrowLeft, ChevronLeft, ChevronRight, Upload, FileText, Sparkles } from 'lucide-react';

interface FieldDef { key: string; label: string; type: string; required: boolean; placeholder?: string; options?: { value: string; label: string }[]; order: number; }
interface StepDef { title: string; fields: FieldDef[]; }
interface FormConfig { steps: StepDef[]; appearance: { bannerImage: string; formColor: string; accentColor: string; showTimeline: boolean; }; }
interface ProdiOption { id: string; kode: string; nama: string; jenjang: string; }
interface CampusInfo { tenant: { id: string; slug: string; name: string; nama_pt: string; singkatan: string; logo_url: string }; programStudi: ProdiOption[]; landingPage: { primaryColor: string; tahunAkademik: string }; }

export default function CampusPPDBPage() {
  const { slug } = useParams<{ slug: string }>();
  const [campus, setCampus] = useState<CampusInfo | null>(null);
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<{ nomor_daftar: string; nama: string } | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, any>>({});

  useSEO(
    `PPDB ${campus?.tenant.nama_pt || campus?.tenant.name || 'Kampus'} - AONE SIAKAD`,
    `Pendaftaran PPDB online ${campus?.tenant.nama_pt || campus?.tenant.name || 'Kampus'} - Sistem Penerimaan Peserta Didik Baru.`,
    campus?.tenant.logo_url || '/logo.png'
  );

  useEffect(() => {
    if (!slug) return;
    setTenantSlug(slug);
    Promise.all([
      get<CampusInfo>(`/public/kampus/${slug}`),
      get<FormConfig>('/campus/ppdb-config'),
    ])
      .then(([c, cfg]) => {
        setCampus(c);
        setConfig(cfg);
        const initial: Record<string, any> = {};
        cfg.steps.forEach(s => s.fields.forEach(f => {
          initial[f.key] = f.type === 'select' ? '' : '';
        }));
        setForm(initial);
      })
      .catch(() => setError('Kampus tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await post<{ nomor_daftar: string; nama: string }>('/ppdb/register', form);
      setResult(data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Pendaftaran gagal');
    } finally { setSubmitting(false); }
  }

  function validateStep(si: number): boolean {
    if (!config) return false;
    const fields = config.steps[si].fields;
    for (const f of fields) {
      if (f.required && !form[f.key]) {
        setError(`"${f.label}" wajib diisi`);
        return false;
      }
      if (f.key === 'password' && form.password && form.password.length < 6) {
        setError('Password minimal 6 karakter');
        return false;
      }
      if (f.key === 'email' && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError('Format email tidak valid');
        return false;
      }
    }
    return true;
  }

  function nextStep() {
    setError('');
    if (validateStep(step) && config) {
      setStep(s => Math.min(s + 1, config.steps.length - 1));
    }
  }
  function prevStep() { setError(''); setStep(s => Math.max(s - 1, 0)); }

  const color = campus?.landingPage?.primaryColor || config?.appearance?.formColor || '#22c55e';

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
    </div>
  );

  if (error && !campus) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center"><Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" /><p className="text-zinc-400 text-sm">{error}</p></div>
    </div>
  );

  const { tenant, programStudi } = campus!;
  const steps = config?.steps || [];
  const app = config?.appearance;

  // ─── Success ───
  if (success && result) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-black to-emerald-950/10" />
      <div className="relative z-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${color}20` }}>
          <CheckCircle className="w-8 h-8" style={{ color }} />
        </div>
        <h2 className="text-xl font-display font-extrabold tracking-tight text-white mb-2">Pendaftaran Berhasil!</h2>
        <p className="text-sm text-zinc-400 mb-4">Terima kasih <strong className="text-white">{result.nama}</strong>, pendaftaran kamu sudah diterima.</p>
        <div className="rounded-xl bg-zinc-900/50 border border-white/5 p-4 mb-6">
          <p className="text-[10px] text-zinc-500 mb-1">Nomor Pendaftaran</p>
          <p className="text-lg font-bold font-display tracking-wider" style={{ color }}>{result.nomor_daftar}</p>
        </div>
        <p className="text-[11px] text-zinc-500 mb-6">Silakan login menggunakan email dan password yang didaftarkan untuk melanjutkan pembayaran dan upload dokumen.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to={`/kampus/${slug}`} className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-zinc-300 hover:bg-white/10 transition-all border border-white/10">Kembali</Link>
          <Link to={`/login?tenant=${slug}`} className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg" style={{ backgroundColor: color }}>Login</Link>
        </div>
      </div>
    </div>
  );

  // ─── Main Form ───
  return (
    <div className="min-h-screen bg-black overflow-hidden dark">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-black to-emerald-950/10" />
      <div className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl -top-20 -right-20" style={{ backgroundColor: app?.accentColor || color }} />

      {app?.bannerImage ? (
        <div className="relative w-full h-40 overflow-hidden">
          <img src={app.bannerImage} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-indigo-600 overflow-hidden">
          <div className="max-w-lg mx-auto px-4 py-3 relative z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-white/90">
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>PPDB Online — {tenant.nama_pt}</span>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <Link to={`/kampus/${slug}`} className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-400 transition-colors mb-4">
          <ArrowLeft size={13} /> Kembali ke halaman {tenant.singkatan || tenant.nama_pt}
        </Link>

        {/* Timeline */}
        {app?.showTimeline !== false && steps.length > 1 && (
          <div className="flex items-center justify-between mb-6">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-[10px] font-bold ${step > i ? 'text-white' : step === i ? 'text-white' : 'text-zinc-500'}`}
                    style={step > i ? { backgroundColor: color } : step === i ? { backgroundColor: color, boxShadow: `0 0 0 2px ${color}40` } : { backgroundColor: '#27272a' }}>
                    {step > i ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span className={`text-[9px] mt-1 font-medium text-center ${step >= i ? 'text-zinc-300' : 'text-zinc-600'}`}>{s.title}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-px mx-1 ${step > i ? '' : 'bg-zinc-800'}`} style={step > i ? { backgroundColor: color } : {}} />}
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/5 p-6">
          <div className="text-center mb-5">
            {tenant.logo_url && <img src={tenant.logo_url} alt="" className="w-12 h-12 rounded-xl mx-auto mb-3 object-cover" />}
            <h1 className="text-lg font-display font-bold tracking-tight text-white">PPDB Online</h1>
            <p className="text-[11px] text-zinc-400 mt-0.5">{tenant.nama_pt}</p>
            {campus?.landingPage?.tahunAkademik && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">
                TA {campus.landingPage.tahunAkademik}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">{error}</div>}

            {steps[step]?.fields.map((field) => (
              <div key={field.key}>
                <label className="text-[10px] font-semibold text-zinc-400 block mb-1">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                <DynamicField field={field} value={form[field.key] ?? ''} onChange={(v: any) => setForm((prev: Record<string, any>) => ({ ...prev, [field.key]: v }))} programStudi={programStudi} color={color} />
              </div>
            ))}

            {/* Footer buttons */}
            {steps.length > 1 ? (
              <div className="flex gap-2 mt-4">
                {step > 0 ? (
                  <button type="button" onClick={prevStep} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all flex items-center justify-center gap-2">
                    <ChevronLeft size={15} /> Sebelumnya
                  </button>
                ) : <div className="flex-1" />}
                {step < steps.length - 1 ? (
                  <button type="button" onClick={nextStep} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2" style={{ backgroundColor: color }}>
                    Selanjutnya <ChevronRight size={15} />
                  </button>
                ) : (
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60" style={{ backgroundColor: color }}>
                    {submitting ? 'Memproses...' : 'Daftar Sekarang'} <CheckCircle size={15} />
                  </button>
                )}
              </div>
            ) : (
              <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg mt-3 disabled:opacity-60" style={{ backgroundColor: color }}>
                {submitting ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function DynamicField({ field, value, onChange, programStudi, color }: {
  field: FieldDef; value: any; onChange: (v: any) => void;
  programStudi: ProdiOption[]; color: string;
}) {
  switch (field.type) {
    case 'prodi':
      return (
        <select value={value ?? ''} onChange={e => onChange(e.target.value)} required={field.required} className="input-field dark">
          <option value="" className="bg-zinc-800">Pilih {field.label}...</option>
          {programStudi.map(p => (
            <option key={p.id} value={p.id} className="bg-zinc-800">{p.jenjang} - {p.nama}</option>
          ))}
        </select>
      );
    case 'select':
      return (
        <select value={value ?? ''} onChange={e => onChange(e.target.value)} required={field.required} className="input-field dark appearance-none">
          <option value="" className="bg-zinc-800">Pilih {field.label}...</option>
          {(field.options || []).map((o, i) => (
            <option key={i} value={o.value} className="bg-zinc-800">{o.label}</option>
          ))}
        </select>
      );
    case 'textarea':
      return (
        <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder}
          required={field.required} className="input-field dark" rows={3} />
      );
    case 'file':
      return <FileUploadField value={value} onChange={onChange} label={field.label} />;
    default:
      return (
        <input type={field.type === 'tel' ? 'tel' : field.type} value={value ?? ''} onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder} required={field.required}
          minLength={field.key === 'password' ? 6 : undefined}
          className={`input-field dark ${field.type === 'date' ? '[color-scheme:dark]' : ''}`} />
      );
  }
}

function FileUploadField({ value, onChange, label }: { value: any; onChange: (v: any) => void; label: string }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');

  return (
    <div>
      {preview ? (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800 border border-zinc-700">
          <span className="text-[10px] text-zinc-300 flex-1 truncate">{preview.split('/').pop()}</span>
          <button type="button" onClick={() => { onChange(''); setPreview(''); }} className="text-[10px] text-red-400">Hapus</button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-zinc-600 cursor-pointer hover:border-emerald-500 transition-colors">
          <Upload size={14} className="text-zinc-400" />
          <span className="text-[10px] text-zinc-400">Upload {label}</span>
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              try {
                const fd = new FormData();
                fd.append('file', file);
                const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                if (data.success) { onChange(data.data.url); setPreview(data.data.url); }
              } catch {} finally { setUploading(false); }
            }} />
          {uploading && <span className="text-[10px] text-emerald-400">Uploading...</span>}
        </label>
      )}
    </div>
  );
}
