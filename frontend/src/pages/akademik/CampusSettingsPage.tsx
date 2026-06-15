import { useState, useEffect } from 'react';
import { get, put } from '../../api/client';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';

export default function CampusSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const d = await get<Record<string, any>>('/akademik/settings');
      setSettings(d || {});
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