import { useState, useEffect } from 'react';
import { get, put } from '../../api/client';
import { Loader2, CheckCircle2, Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const d = await get<Record<string, string>>('/vendor/settings');
      setSettings(d || {});
    } finally { setLoading(false); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await put('/vendor/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Pengaturan Platform</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-500">Konfigurasi global AONE SIAKAD</p>
      </div>

      <form onSubmit={save} className="bg-white dark:bg-zinc-900/50 rounded-xl p-6 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 space-y-5 max-w-2xl">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key}>
            <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">{key.replace(/_/g, ' ')}</label>
            {key.includes('color') || key.includes('warna') ? (
              <div className="flex gap-2 items-center">
                <input type="color" value={value || '#10b981'} onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer" />
                <input value={value || ''} onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} className="input-field flex-1" />
              </div>
            ) : (
              <textarea value={value || ''} onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} className="input-field" rows={key.includes('tentang') || key.includes('desc') || key.length > 50 ? 4 : 2} />
            )}
          </div>
        ))}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Semua'}
          </button>
          {saved && <span className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12} /> Tersimpan</span>}
        </div>
      </form>
    </div>
  );
}
