import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, RotateCcw, Eye, Globe, Palette, Text, BookOpen, Image, Upload, X, Building, Wifi, ExternalLink } from 'lucide-react';
import { api } from '../api';

interface WebCustomizationProps {
  isDark: boolean;
  campusId?: string;
}

export default function WebCustomization({ isDark, campusId }: WebCustomizationProps) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [campus, setCampus] = useState<any>(null);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [selectedCampusId, setSelectedCampusId] = useState<string>(campusId || '');
  const [campusLogo, setCampusLogo] = useState<string>('');
  const [subdomain, setSubdomain] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const fetchData = async () => {
    setLoading(true);
    try {
      const campusesData = await api.getCampuses();
      setCampuses(campusesData);
      const targetId = selectedCampusId || campusId || (campusesData[0]?.id || '');
      setSelectedCampusId(targetId);
      if (targetId) {
        const campusData = campusesData.find((c: any) => c.id === targetId);
        if (campusData) {
          setCampus(campusData);
          setCampusLogo(campusData.logo || '');
          setSubdomain(campusData.subdomain || '');
          const ws = campusData.webSettings || {};
          setSettings(ws);
        }
      }
    } catch {
      setMessage('Gagal memuat data');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedCampusId) {
      const c = campuses.find((c: any) => c.id === selectedCampusId);
      if (c) {
        setCampus(c);
        setCampusLogo(c.logo || '');
        setSubdomain(c.subdomain || '');
        setSettings(c.webSettings || {});
      }
    }
  }, [selectedCampusId, campuses]);

  const handleSave = async () => {
    if (!selectedCampusId) return;
    setSaving(true);
    try {
      await Promise.all([
        api.updateCampusWebSettings(selectedCampusId, settings),
        api.updateCampus(selectedCampusId, { logo: campusLogo, subdomain }),
      ]);
      setMessage('Pengaturan web kampus berhasil disimpan');
      setMessageType('success');
    } catch {
      setMessage('Gagal menyimpan pengaturan');
      setMessageType('error');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleReset = () => {
    fetchData();
    setMessage('Pengaturan direset ke versi tersimpan');
    setMessageType('success');
    setTimeout(() => setMessage(''), 3000);
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const inputClass = `w-full p-2.5 rounded-xl border text-xs outline-none focus:border-emerald-500 transition mt-1 ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`;
  const labelClass = 'text-xs font-semibold text-slate-500 dark:text-zinc-400';
  const selectClass = `w-full p-2.5 rounded-xl border text-xs outline-none focus:border-emerald-500 transition ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-xs text-slate-400">Memuat pengaturan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 font-mono">KUSTOMISASI WEB KAMPUS</span>
          <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Atur Tampilan Web {campus?.name || ''}</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Sesuaikan tampilan portal web untuk kampus ini.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button onClick={handleSave} disabled={saving || !selectedCampusId} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`px-4 py-3 rounded-xl text-xs font-bold ${messageType === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
          {message}
        </motion.div>
      )}

      {/* Campus Selector (only when no campusId prop) */}
      {!campusId && (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <h3 className="font-bold text-sm font-display mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-500" />
            Pilih Kampus
          </h3>
          <select value={selectedCampusId} onChange={e => setSelectedCampusId(e.target.value)} className={selectClass}>
            {campuses.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
          {campus && (
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 ${campus.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                <Wifi className="w-3 h-3" /> {campus.status}
              </span>
              <span>{campus.location}</span>
              <span className="font-mono">{campus.package}</span>
            </div>
          )}
        </div>
      )}

      {/* Subdomain */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-sm font-display mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-500" />
          Subdomain & URL Web
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={subdomain}
            onChange={e => setSubdomain(e.target.value)}
            className={`flex-1 p-2.5 rounded-xl border text-xs outline-none focus:border-emerald-500 transition font-mono ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            placeholder="und-jkt"
          />
          <span className="text-xs text-slate-400 font-mono">.aone-project.id</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">Subdomain akan digunakan sebagai URL web publik kampus ini. Contoh: <strong>und-jkt.aone-project.id</strong></p>
        {selectedCampusId && (
          <a
            href={`?campus=${selectedCampusId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition"
          >
            <ExternalLink className="w-3 h-3" />
            Kunjungi Halaman Kampus
          </a>
        )}
      </div>

      {/* Logo */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-sm font-display mb-4 flex items-center gap-2">
          <Image className="w-4 h-4 text-indigo-500" />
          Logo Kampus — <span className="text-indigo-500">{campus?.name || '-'}</span>
        </h3>
        <div className="flex items-start gap-4">
          <div className={`w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden shrink-0 ${isDark ? 'border-zinc-700 bg-zinc-800/50' : 'border-slate-300 bg-slate-50'}`}>
            {campusLogo ? (
              <img src={campusLogo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Image className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <textarea rows={3} value={campusLogo} onChange={e => setCampusLogo(e.target.value)} className={inputClass} placeholder="Tempel URL logo atau data:image/base64..." />
            <div className="flex gap-2">
              <label className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer border ${isDark ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' : 'border-slate-300 hover:bg-slate-100 text-slate-600'}`}>
                <Upload className="w-3.5 h-3.5 inline mr-1" />
                Upload File
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => { const r = ev.target?.result as string; if (r) setCampusLogo(r); };
                  reader.readAsDataURL(file);
                }} />
              </label>
              {campusLogo && (
                <button onClick={() => setCampusLogo('')} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-rose-500 border border-rose-300 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/20">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-sm font-display mb-4 flex items-center gap-2">
          <Text className="w-4 h-4 text-indigo-500" />
          Hero Section
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Judul Hero</label>
            <input type="text" value={settings.hero_title || ''} onChange={e => updateSetting('hero_title', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Subjudul Hero</label>
            <textarea rows={3} value={settings.hero_subtitle || ''} onChange={e => updateSetting('hero_subtitle', e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-sm font-display mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          Banner PPDB
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Judul Banner</label>
            <input type="text" value={settings.ppdb_banner_title || ''} onChange={e => updateSetting('ppdb_banner_title', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Subjudul Banner</label>
            <input type="text" value={settings.ppdb_banner_subtitle || ''} onChange={e => updateSetting('ppdb_banner_subtitle', e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-sm font-display mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-500" />
          Tema & Footer
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Warna Utama</label>
            <div className="flex items-center gap-3 mt-1">
              <input type="color" value={settings.primary_color || '#059669'} onChange={e => updateSetting('primary_color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border" />
              <input type="text" value={settings.primary_color || '#059669'} onChange={e => updateSetting('primary_color', e.target.value)} className={`flex-1 p-2.5 rounded-xl border text-xs outline-none font-mono focus:border-emerald-500 ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200'}`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Teks Footer</label>
            <textarea rows={2} value={settings.footer_text || ''} onChange={e => updateSetting('footer_text', e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-sm font-display mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-500" />
          Pratinjau Langsung
        </h3>
        <div className={`p-6 rounded-xl border-2 border-dashed ${isDark ? 'border-zinc-700 bg-zinc-800/50' : 'border-slate-300 bg-slate-50'}`}>
          <div style={{ borderColor: settings.primary_color || '#059669' }} className="rounded-xl border-2 overflow-hidden">
            <div className="px-5 py-3 text-white font-bold text-sm font-display tracking-tight" style={{ backgroundColor: settings.primary_color || '#059669' }}>
              {campus?.name || 'Nama Kampus'}
            </div>
            <div className={`p-5 space-y-3 ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
              <h4 className="text-lg font-extrabold font-display" style={{ color: settings.primary_color || '#059669' }}>
                {settings.hero_title || 'Judul Hero'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">{settings.hero_subtitle || 'Subjudul hero...'}</p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-zinc-700">
                <span className="text-[10px] font-bold" style={{ color: settings.primary_color || '#059669' }}>
                  {settings.ppdb_banner_title || 'PPDB Dibuka!'}
                </span>
                <button className="px-3 py-1.5 rounded-lg text-[11px] font-extrabold text-white" style={{ backgroundColor: settings.primary_color || '#059669' }}>
                  Daftar Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
