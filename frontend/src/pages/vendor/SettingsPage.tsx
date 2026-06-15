import { useState, useEffect } from 'react';
import { get, put } from '../../api/client';
import { Loader2, CheckCircle2, Save, Eye, EyeOff, Brain } from 'lucide-react';

const AI_KEYS = ['ai_provider', 'ai_model', 'openai_api_key', 'gemini_api_key', 'ai_daily_limit', 'ai_monthly_limit'];
const MODELS_BY_PROVIDER: Record<string, { label: string; value: string; cost: string }[]> = {
  openai: [
    { label: 'GPT-4o Mini', value: 'gpt-4o-mini', cost: '$0.15 / $0.60 per 1M token' },
    { label: 'GPT-4o', value: 'gpt-4o', cost: '$2.50 / $10 per 1M token' },
  ],
  gemini: [
    { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash', cost: '$0.10 / $0.40 per 1M token' },
    { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash', cost: '$0.15 / $0.60 per 1M token' },
    { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash', cost: '$0.075 / $0.30 per 1M token' },
  ],
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

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

  function update(key: string, value: string) {
    setSettings(s => ({ ...s, [key]: value }));
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;

  const aiKeys = Object.keys(settings).filter(k => AI_KEYS.includes(k));
  const otherKeys = Object.keys(settings).filter(k => !AI_KEYS.includes(k));

  const provider = settings['ai_provider'] || 'openai';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Pengaturan Platform</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-500">Konfigurasi global AONE SIAKAD</p>
      </div>

      <form onSubmit={save} className="space-y-5 max-w-2xl">
        {aiKeys.length > 0 && (
          <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-6 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
              <Brain size={18} className="text-emerald-500" />
              <h2 className="text-sm font-bold font-display dark:text-white">Konfigurasi AI</h2>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">AI Provider</label>
              <div className="flex gap-2">
                {['openai', 'gemini'].map(p => (
                  <button key={p} type="button" onClick={() => { update('ai_provider', p); update('ai_model', MODELS_BY_PROVIDER[p][0].value); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      provider === p
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-slate-700'
                    }`}>
                    {p === 'openai' ? 'OpenAI' : 'Google Gemini'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Model AI</label>
              <select value={settings['ai_model'] || MODELS_BY_PROVIDER[provider][0].value}
                onChange={e => update('ai_model', e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:text-white">
                {(MODELS_BY_PROVIDER[provider] || []).map(m => (
                  <option key={m.value} value={m.value}>{m.label} ({m.cost})</option>
                ))}
              </select>
            </div>

            {provider === 'openai' && (
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">OpenAI API Key</label>
                <div className="flex gap-2">
                  <input type={showKeys['openai_api_key'] ? 'text' : 'password'} value={settings['openai_api_key'] || ''}
                    onChange={e => update('openai_api_key', e.target.value)} placeholder="sk-..." className="input-field flex-1 font-mono text-xs" />
                  <button type="button" onClick={() => setShowKeys(s => ({ ...s, openai_api_key: !s.openai_api_key }))}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-slate-600">
                    {showKeys['openai_api_key'] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {provider === 'gemini' && (
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Gemini API Key</label>
                <div className="flex gap-2">
                  <input type={showKeys['gemini_api_key'] ? 'text' : 'password'} value={settings['gemini_api_key'] || ''}
                    onChange={e => update('gemini_api_key', e.target.value)} placeholder="AIza..." className="input-field flex-1 font-mono text-xs" />
                  <button type="button" onClick={() => setShowKeys(s => ({ ...s, gemini_api_key: !s.gemini_api_key }))}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-slate-600">
                    {showKeys['gemini_api_key'] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Batas Harian</label>
                <input type="number" value={settings['ai_daily_limit'] || '100'} min={1} max={10000}
                  onChange={e => update('ai_daily_limit', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Batas Bulanan</label>
                <input type="number" value={settings['ai_monthly_limit'] || '2000'} min={1} max={100000}
                  onChange={e => update('ai_monthly_limit', e.target.value)} className="input-field" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-6 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 space-y-5">
          <h2 className="text-sm font-bold font-display dark:text-white pb-2 border-b border-slate-100 dark:border-zinc-800">Pengaturan Lainnya</h2>
          {otherKeys.map(key => (
            <div key={key}>
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">{key.replace(/_/g, ' ')}</label>
              {key.includes('color') || key.includes('warna') ? (
                <div className="flex gap-2 items-center">
                  <input type="color" value={settings[key] || '#10b981'} onChange={e => update(key, e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer" />
                  <input value={settings[key] || ''} onChange={e => update(key, e.target.value)} className="input-field flex-1" />
                </div>
              ) : key.includes('api_key') || key.includes('secret') || key.includes('password') ? (
                <div className="flex gap-2">
                  <input type={showKeys[key] ? 'text' : 'password'} value={settings[key] || ''}
                    onChange={e => update(key, e.target.value)} className="input-field flex-1 font-mono text-xs" />
                  <button type="button" onClick={() => setShowKeys(s => ({ ...s, [key]: !s[key] }))}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-400">
                    {showKeys[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              ) : (
                <textarea value={settings[key] || ''} onChange={e => update(key, e.target.value)}
                  className="input-field" rows={key.includes('tentang') || key.includes('desc') || key.length > 50 ? 4 : 2} />
              )}
            </div>
          ))}
        </div>

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
