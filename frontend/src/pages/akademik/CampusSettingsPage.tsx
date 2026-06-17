import { useState, useEffect } from 'react';
import { get, put } from '../../api/client';
import { Loader2, Save, CheckCircle2, CreditCard, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import FileUpload from '../../components/ui/FileUpload';

export default function CampusSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [tenantInfo, setTenantInfo] = useState<{ logo_url: string | null }>({ logo_url: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showMidtransKey, setShowMidtransKey] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [d, t] = await Promise.all([
        get<Record<string, any>>('/akademik/settings'),
        get<{ logo_url: string | null }>('/akademik/settings/tenant').catch(() => ({ logo_url: null })),
      ]);
      setSettings(d || {});
      setTenantInfo(t || { logo_url: null });
    } finally { setLoading(false); }
  }

  async function save(key: string, value: any) {
    setSaving(key);
    try {
      await put(`/akademik/settings/${key}`, { value });
      setSettings(prev => ({ ...prev, [key]: value }));
      setTimeout(() => setSaving(null), 1000);
    } catch { setSaving(null); }
  }

  const fields = [
    { key: 'tahun_akademik_aktif', label: 'Tahun Akademik Aktif', type: 'text', placeholder: '2024/2025' },
    { key: 'semester_aktif', label: 'Semester Aktif', type: 'select', options: ['Ganjil', 'Genap', 'Pendek'] },
    { key: 'tanggal_awal_krs', label: 'Tanggal Awal KRS', type: 'date' },
    { key: 'tanggal_akhir_krs', label: 'Tanggal Akhir KRS', type: 'date' },
    { key: 'tanggal_awal_perkuliahan', label: 'Tanggal Awal Perkuliahan', type: 'date' },
    { key: 'tanggal_akhir_perkuliahan', label: 'Tanggal Akhir Perkuliahan', type: 'date' },
    { key: 'biaya_daftar_ulang', label: 'Biaya Daftar Ulang (Rp)', type: 'number' },
    { key: 'batas_min_sks', label: 'Batas Minimal SKS', type: 'number' },
    { key: 'batas_maks_sks', label: 'Batas Maksimal SKS', type: 'number' },
    { key: 'nilai_minimal_lulus', label: 'Nilai Minimal Lulus', type: 'number' },
    { key: 'min_payment_for_krs', label: 'Min. Pembayaran/Cicilan untuk KRS (%)', type: 'number', placeholder: '0 = bebas, 50 = bayar 50%, 100 = lunas' },
    { key: 'nama_pt', label: 'Nama Perguruan Tinggi', type: 'text' },
    { key: 'alamat_pt', label: 'Alamat PT', type: 'textarea' },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Pengaturan Kampus</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-500">Konfigurasi sistem akademik</p>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 space-y-4 max-w-2xl">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
          <ImageIcon size={16} className="text-emerald-500" />
          <h2 className="text-sm font-bold font-display dark:text-white">Logo Kampus</h2>
        </div>
        <div className="flex items-center gap-4">
          {tenantInfo.logo_url && (
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0">
              <img src={tenantInfo.logo_url} alt="Logo" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <FileUpload
              value={tenantInfo.logo_url || ''}
              onChange={async (url) => {
                await put('/akademik/settings/tenant/logo', { logo_url: url });
                setTenantInfo(prev => ({ ...prev, logo_url: url }));
              }}
              accept="image/*"
              label="Upload Logo Kampus"
              hint="Format JPG, PNG, WEBP. Maks 2MB."
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 space-y-4 max-w-2xl">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
          <CreditCard size={16} className="text-emerald-500" />
          <h2 className="text-sm font-bold font-display dark:text-white">Midtrans Payment Gateway</h2>
        </div>
        <p className="text-xs text-slate-400">Daftar di <a href="https://dashboard.midtrans.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400">dashboard.midtrans.com</a> (gratis), lalu masukkan API Key-nya di sini.</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Server Key</label>
            <div className="flex gap-2">
              <input type={showMidtransKey ? 'text' : 'password'} value={settings['midtrans_server_key'] || ''}
                onChange={e => save('midtrans_server_key', e.target.value)} placeholder="Midtrans server key..."
                className="input-field flex-1 font-mono text-xs" />
              <button type="button" onClick={() => setShowMidtransKey(!showMidtransKey)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-slate-600">
                {showMidtransKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1">Client Key</label>
            <input type={showMidtransKey ? 'text' : 'password'} value={settings['midtrans_client_key'] || ''}
              onChange={e => save('midtrans_client_key', e.target.value)} placeholder="Midtrans client key..."
              className="input-field w-full font-mono text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Production?</label>
            <input type="checkbox" checked={settings['midtrans_is_production'] === 'true'}
              onChange={e => save('midtrans_is_production', e.target.checked ? 'true' : 'false')}
              className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500/30" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 max-w-2xl overflow-hidden">
        {fields.map((f, idx) => {
          const val = settings[f.key];
          const isSaving = saving === f.key;
          return (
            <div key={f.key} className={`px-5 py-4 flex items-start gap-4 ${idx < fields.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800/30' : ''}`}>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-semibold text-slate-600 dark:text-zinc-300 block mb-1.5">{f.label}</label>
                {f.type === 'select' ? (
                  <select value={val || ''} onChange={e => save(f.key, e.target.value)} className="input-field">
                    <option value="">Pilih</option>
                    {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea value={val || ''} onChange={e => save(f.key, e.target.value)} className="input-field" rows={3} />
                ) : (
                  <input type={f.type} value={val ?? ''} onChange={e => save(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={f.placeholder} className="input-field" />
                )}
              </div>
              <div className="pt-6 shrink-0">
                {isSaving ? <Loader2 size={14} className="animate-spin text-indigo-500" /> : <CheckCircle2 size={14} className="text-emerald-400" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}