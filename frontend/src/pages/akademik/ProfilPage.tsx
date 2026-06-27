import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { put } from '../../api/client';
import { Loader2, Save, Camera, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/client';

export default function ProfilPage() {
  const { user, setActiveRole } = useAuth();
  const [nama, setNama] = useState(user?.nama || '');
  const [email, setEmail] = useState(user?.email || '');
  const [noHp, setNoHp] = useState('');
  const [fotoUrl, setFotoUrl] = useState(user?.logo_url || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [passwordLama, setPasswordLama] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin', rektor: 'Rektor', admin: 'Admin', dekan: 'Dekan',
    akademik: 'Akademik', kaprodi: 'Kaprodi', keuangan: 'Keuangan', humas: 'Humas',
    pustakawan: 'Pustakawan', dosen: 'Dosen', mahasiswa: 'Mahasiswa',
    calon_mahasiswa: 'Calon Mhs', alumni: 'Alumni',
  };

  async function handleSaveProfile() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await put<any>('/auth/me', { nama, email, no_hp: noHp || undefined, foto_url: fotoUrl || undefined });
      if (res?.id) {
        setActiveRole(res.role as any);
      }
      setSaveMsg({ type: 'success', text: 'Profil berhasil diupdate' });
    } catch (err: any) {
      setSaveMsg({ type: 'error', text: err?.response?.data?.message || err?.message || 'Gagal update profil' });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (passwordBaru !== konfirmasi) {
      setPwMsg({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      return;
    }
    if (passwordBaru.length < 6) {
      setPwMsg({ type: 'error', text: 'Password baru minimal 6 karakter' });
      return;
    }
    setSavingPw(true);
    setPwMsg(null);
    try {
      await put('/auth/me/password', { password_lama: passwordLama, password_baru: passwordBaru });
      setPwMsg({ type: 'success', text: 'Password berhasil diubah' });
      setPasswordLama('');
      setPasswordBaru('');
      setKonfirmasi('');
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err?.response?.data?.message || err?.message || 'Gagal ubah password' });
    } finally {
      setSavingPw(false);
    }
  }

  const handleUploadFoto = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSaveMsg({ type: 'error', text: 'File harus berupa gambar' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveMsg({ type: 'error', text: 'Maksimal 5MB' });
      return;
    }
    setUploadingFoto(true);
    setSaveMsg(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        setFotoUrl(data.data.url);
      } else {
        setSaveMsg({ type: 'error', text: data.message || 'Upload gagal' });
      }
    } catch (err: any) {
      setSaveMsg({ type: 'error', text: err?.response?.data?.message || err?.message || 'Upload gagal' });
    } finally {
      setUploadingFoto(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, []);

  return (
    <div className="max-w-2xl space-y-8">
      {/* Profile Photo */}
      <div className="bg-card rounded-xl border border-border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Foto Profil</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-white text-xl font-bold" style={{ background: 'var(--primary)' }}>
              {fotoUrl ? (
                <img src={fotoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                (user?.nama || '?').charAt(0).toUpperCase()
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingFoto}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white border-2 transition-colors"
              style={{ background: 'var(--primary)', borderColor: 'var(--card)' }}
            >
              {uploadingFoto ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUploadFoto} className="hidden" />
          </div>
          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <p className="font-medium" style={{ color: 'var(--foreground)' }}>{user?.nama}</p>
            <p className="mt-0.5">{roleLabels[user?.role || ''] || user?.role}</p>
            <p className="mt-0.5">Klik ikon kamera untuk mengganti foto</p>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="bg-card rounded-xl border border-border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Data Profil</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--foreground)' }}>Nama Lengkap</label>
            <input value={nama} onChange={e => setNama(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.15)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--foreground)' }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email"
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.15)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--foreground)' }}>No. HP</label>
            <input value={noHp} onChange={e => setNoHp(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.15)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>

          {saveMsg && (
            <div className={`flex items-center gap-2 text-xs p-3 rounded-lg ${saveMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
              {saveMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {saveMsg.text}
            </div>
          )}

          <button onClick={handleSaveProfile} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-lg transition-all disabled:opacity-50"
            style={{ background: 'var(--primary)' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-card rounded-xl border border-border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Ganti Password</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--foreground)' }}>Password Lama</label>
            <div className="relative">
              <input value={passwordLama} onChange={e => setPasswordLama(e.target.value)} type={showPw ? 'text' : 'password'}
                className="w-full px-3 py-2 pr-9 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.15)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }} />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--foreground)' }}>Password Baru</label>
            <input value={passwordBaru} onChange={e => setPasswordBaru(e.target.value)} type={showPw ? 'text' : 'password'}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.15)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--foreground)' }}>Konfirmasi Password Baru</label>
            <input value={konfirmasi} onChange={e => setKonfirmasi(e.target.value)} type={showPw ? 'text' : 'password'}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.15)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>

          {pwMsg && (
            <div className={`flex items-center gap-2 text-xs p-3 rounded-lg ${pwMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
              {pwMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {pwMsg.text}
            </div>
          )}

          <button onClick={handleChangePassword} disabled={savingPw}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-lg transition-all disabled:opacity-50"
            style={{ background: 'var(--primary)' }}>
            {savingPw ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Ubah Password
          </button>
        </div>
      </div>
    </div>
  );
}
