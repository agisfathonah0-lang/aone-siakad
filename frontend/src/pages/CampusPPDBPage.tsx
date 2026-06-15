import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get, post } from '../api/client';
import { setTenantSlug } from '../api/client';
import { Building2, Loader2, CheckCircle, ArrowLeft, Mail, Phone, User, Lock, GraduationCap, Calendar, Sparkles, ChevronLeft, ChevronRight, Upload, FileText } from 'lucide-react';

interface ProdiOption {
  id: string; kode: string; nama: string; jenjang: string; fakultas: string;
}

interface CampusInfo {
  tenant: { id: string; slug: string; name: string; nama_pt: string; singkatan: string; logo_url: string };
  programStudi: ProdiOption[];
  landingPage: { primaryColor: string; tahunAkademik: string };
}

const steps = [
  { label: 'Data Diri', icon: User },
  { label: 'Pilihan Prodi', icon: GraduationCap },
  { label: 'Upload Dokumen', icon: Upload },
  { label: 'Selesai', icon: CheckCircle },
];

export default function CampusPPDBPage() {
  const { slug } = useParams<{ slug: string }>();
  const [campus, setCampus] = useState<CampusInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<{ nomor_daftar: string; nama: string } | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    nama: '', email: '', no_hp: '', program_studi_id: '', password: '',
    tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: '', alamat: '', asal_sekolah: '',
  });

  useEffect(() => {
    if (!slug) return;
    setTenantSlug(slug);
    get<CampusInfo>(`/public/kampus/${slug}`)
      .then(d => setCampus(d))
      .catch(() => setError('Kampus tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await post<{ nomor_daftar: string; nama: string }>('/ppdb/register', {
        nama: form.nama,
        email: form.email,
        no_hp: form.no_hp,
        program_studi_id: form.program_studi_id,
        password: form.password,
        tempat_lahir: form.tempat_lahir || undefined,
        tanggal_lahir: form.tanggal_lahir || undefined,
        jenis_kelamin: form.jenis_kelamin || undefined,
        alamat: form.alamat || undefined,
        asal_sekolah: form.asal_sekolah || undefined,
      });
      setResult(data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Pendaftaran gagal');
    } finally { setSubmitting(false); }
  }

  function nextStep() {
    if (step === 1 && (!form.nama || !form.email || !form.no_hp)) {
      setError('Lengkapi data diri terlebih dahulu');
      return;
    }
    if (step === 2 && !form.program_studi_id) {
      setError('Pilih program studi terlebih dahulu');
      return;
    }
    if (step === 2 && !form.password) {
      setError('Masukkan password');
      return;
    }
    setError('');
    setStep(s => Math.min(s + 1, 4));
  }

  function prevStep() {
    setError('');
    setStep(s => Math.max(s - 1, 1));
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
    </div>
  );

  if (error && !campus) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-400 text-sm">{error}</p>
      </div>
    </div>
  );

  const color = campus?.landingPage?.primaryColor || '#10b981';
  const { tenant, programStudi } = campus!;

  if (success && result) {
    return (
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
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden dark">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-black to-emerald-950/10" />
      <div className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl -top-20 -right-20" style={{ backgroundColor: color }} />

      <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-indigo-600 overflow-hidden">
        <div className="max-w-lg mx-auto px-4 py-3 relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-white/90">
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Promo Pendaftaran Awal — Diskon 50% Biaya Pendaftaran!</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <Link to={`/kampus/${slug}`} className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-400 transition-colors mb-4">
          <ArrowLeft size={13} /> Kembali ke halaman {tenant.singkatan || tenant.nama_pt}
        </Link>

        <div className="flex items-center justify-between mb-6">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${step > i + 1 ? 'bg-emerald-500' : step === i + 1 ? '' : 'bg-zinc-800'}`} style={step === i + 1 ? { backgroundColor: color, boxShadow: `0 0 0 2px ${color}40` } : {}}>
                  <s.icon className={`w-3.5 h-3.5 ${step > i + 1 || step === i + 1 ? 'text-white' : 'text-zinc-500'}`} />
                </div>
                <span className={`text-[9px] mt-1 font-medium text-center ${step >= i + 1 ? 'text-zinc-300' : 'text-zinc-600'}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-1 ${step > i + 1 ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
              )}
            </div>
          ))}
        </div>

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
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">{error}</div>
            )}

            {step === 1 && (
              <>
                <div className="col-span-2">
                  <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Nama Lengkap <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required className="input-field dark" placeholder="Nama lengkap sesuai KTP" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Email <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="input-field dark" placeholder="email@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 block mb-1">No. HP <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input value={form.no_hp} onChange={e => setForm({ ...form, no_hp: e.target.value })} required className="input-field dark" placeholder="08xxxxxxxxx" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Tempat Lahir</label>
                    <input value={form.tempat_lahir} onChange={e => setForm({ ...form, tempat_lahir: e.target.value })} className="input-field dark" placeholder="Kota lahir" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Tanggal Lahir</label>
                    <input type="date" value={form.tanggal_lahir} onChange={e => setForm({ ...form, tanggal_lahir: e.target.value })} className="input-field dark [color-scheme:dark]" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Jenis Kelamin</label>
                  <select value={form.jenis_kelamin} onChange={e => setForm({ ...form, jenis_kelamin: e.target.value })} className="input-field dark appearance-none">
                    <option value="" className="bg-zinc-800">Pilih jenis kelamin</option>
                    <option value="L" className="bg-zinc-800">Laki-laki</option>
                    <option value="P" className="bg-zinc-800">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Alamat</label>
                  <input value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} className="input-field dark" placeholder="Alamat lengkap" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Asal Sekolah</label>
                  <input value={form.asal_sekolah} onChange={e => setForm({ ...form, asal_sekolah: e.target.value })} className="input-field dark" placeholder="Nama SMA/SMK sederajat" />
                </div>
                <button type="button" onClick={nextStep} className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg mt-2 flex items-center justify-center gap-2" style={{ backgroundColor: color }}>
                  Selanjutnya <ChevronRight size={15} />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Program Studi <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <GraduationCap size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10" />
                    <select value={form.program_studi_id} onChange={e => setForm({ ...form, program_studi_id: e.target.value })} required className="input-field dark appearance-none pl-9">
                      <option value="" className="bg-zinc-800">Pilih program studi...</option>
                      {programStudi.map(p => (
                        <option key={p.id} value={p.id} className="bg-zinc-800">{p.jenjang} - {p.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Password <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} className="input-field dark" placeholder="Minimal 6 karakter" />
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={prevStep} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all flex items-center justify-center gap-2">
                    <ChevronLeft size={15} /> Sebelumnya
                  </button>
                  <button type="button" onClick={nextStep} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2" style={{ backgroundColor: color }}>
                    Selanjutnya <ChevronRight size={15} />
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="p-4 rounded-xl bg-zinc-800/50 border border-white/5 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
                  <p className="text-xs text-zinc-400">Fitur upload dokumen akan tersedia setelah pendaftaran. Silakan login untuk melengkapi dokumen.</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 font-semibold mb-2">Dokumen yang perlu disiapkan:</p>
                  <ul className="space-y-1">
                    {['Pas foto 3x4', 'Scan Ijazah/SKL', 'Scan KTP/Kartu Keluarga', 'Transkrip Nilai (jika ada)'].map((d, i) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <FileText size={10} className="text-emerald-500" /> {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={prevStep} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all flex items-center justify-center gap-2">
                    <ChevronLeft size={15} /> Sebelumnya
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60" style={{ backgroundColor: color }}>
                    {submitting ? 'Memproses...' : 'Daftar Sekarang'} <CheckCircle size={15} />
                  </button>
                </div>
              </>
            )}

            {step === 4 && (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color }} />
                <p className="text-sm text-zinc-300 font-semibold">Semua data sudah lengkap!</p>
                <p className="text-xs text-zinc-500 mt-1">Klik tombol di bawah untuk menyelesaikan pendaftaran.</p>
                <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg mt-4 disabled:opacity-60" style={{ backgroundColor: color }}>
                  {submitting ? 'Memproses...' : 'Selesaikan Pendaftaran'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
