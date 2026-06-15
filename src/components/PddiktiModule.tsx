import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Info,
  Cpu, Activity, Clock, ToggleLeft, ToggleRight, Sparkles, AlertCircle
} from 'lucide-react';

interface PddiktiModuleProps {
  currentView: string;
  isDark: boolean;
}

export default function PddiktiModule({ currentView, isDark }: PddiktiModuleProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [syncingType, setSyncingType] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    api.getSyncLogs().then(setLogs).catch(() => {});
    api.get<any[]>('/pddikti/validate').then(setValidationErrors).catch(() => {});
    api.get<any>('/pddikti/stats').then(setStats).catch(() => {});
  }, []);

  const triggerSync = async (type: string) => {
    setSyncingType(type);
    setSyncProgress(0);

    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + 5;
      });
    }, 200);

    try {
      const result = await api.post<any>('/pddikti/sync', { type });
      clearInterval(interval);
      setSyncProgress(100);
      setTimeout(() => {
        setLogs(prev => [result, ...prev]);
        setSyncingType(null);
        setSyncProgress(0);
        api.get<any[]>('/pddikti/validate').then(setValidationErrors).catch(() => {});
        api.get<any>('/pddikti/stats').then(setStats).catch(() => {});
      }, 600);
    } catch {
      clearInterval(interval);
      setSyncingType(null);
      setSyncProgress(0);
    }
  };

  const handleResolveValidationError = async (id: string) => {
    setValidationErrors(prev => prev.filter(err => err.id !== id));
  };

  const ratio = stats?.ratio || '99.8%';
  const errorCount = validationErrors.length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER PORTAL */}
      <div>
        <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">PORTAL INTEGRASI PDDIKTI RI</span>
        <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Pusat Sinkronisasi PDDIKTI</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Hubungkan data Feeder Neo-PDDIKTI secara real-time. Kelola validasi pelaporan semesteran langsung.</p>
      </div>

      {/* Sync Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <p className="text-slate-400 text-[10px] uppercase font-bold">Rasio Keberhasilan Sync</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono">{ratio}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${parseFloat(ratio) >= 99 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {parseFloat(ratio) >= 99 ? 'UNGGUL' : 'SEDANG'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Evaluasi feeder 30 hari terakhir</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <p className="text-slate-400 text-[10px] uppercase font-bold">Menunggu Validasi</p>
          <h3 className={`text-2xl font-extrabold font-mono mt-2 ${errorCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{errorCount} Berita</h3>
          <p className="text-[10px] text-slate-400 mt-2">Data tidak sinkron sebelum terkirim</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <p className="text-slate-400 text-[10px] uppercase font-bold">Pelaporan Masuk Semester</p>
          <h3 className="text-2xl font-extrabold mt-2">20251 (Ganjil)</h3>
          <p className="text-[10px] text-indigo-500 font-bold mt-2">Selesai Sinkronisasi KRS online</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <p className="text-slate-400 text-[10px] uppercase font-bold">Penjadwal Otomatis (Auto Sync)</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-bold">{isAutoSync ? 'AKTIF SETIAP 24H' : 'MATI (MANUAL ONLY)'}</span>
            <button onClick={() => setIsAutoSync(!isAutoSync)} className="text-indigo-500 hover:text-indigo-600 transition">
              {isAutoSync ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 opacity-60" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sync trigger progress overlay */}
      <AnimatePresence>
        {syncingType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-50/10 dark:bg-zinc-900/60"
          >
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-indigo-500 animate-pulse flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Mengekstrak Feeder API PDDIKTI: {syncingType}...
              </span>
              <span className="font-mono font-bold text-indigo-500">{syncProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full transition-all duration-150" style={{ width: `${syncProgress}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sync Initiator Column */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <h3 className="font-bold text-sm font-display mb-4">Pemicu Sinkronisasi Manual (Sync Neo Feeder)</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: 'Mahasiswa', label: 'Sinkronisasi Mahasiswa', desc: 'Biodata, NIM, NIK, semester, status aktif', countKey: 'Mahasiswa' },
              { type: 'Dosen', label: 'Sinkronisasi Dosen', desc: 'NIDN, NIP, jabatan fungsional, beban kerja', countKey: 'Dosen' },
              { type: 'KRS', label: 'Sinkronisasi KRS', desc: 'Pengambilan kelas, sebaran SKS, jadwal', countKey: 'KRS' },
              { type: 'Nilai', label: 'Sinkronisasi Nilai', desc: 'Nilai UTS, UAS, indeks prestasi, bobot SKS', countKey: 'Nilai' },
            ].map((btn, i) => {
              const recordCount = stats?.recordCounts?.[btn.countKey] ?? 0;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => triggerSync(btn.type)}
                  disabled={syncingType !== null}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950/20 dark:hover:bg-zinc-900 text-left transition duration-150 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold">{btn.label}</span>
                    <div className="flex items-center gap-2">
                      {recordCount > 0 && <span className="text-[9px] font-mono text-slate-400">{recordCount} data</span>}
                      <RefreshCw className={`w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition duration-300 ${syncingType === btn.type ? 'animate-spin' : ''}`} />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{btn.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation Errors Center Column */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <h3 className="font-bold text-sm font-display mb-4">Validation Center & Filter Error</h3>
          
          {validationErrors.length === 0 ? (
            <div className="text-center py-6 text-slate-400 bg-emerald-500/10 rounded-xl border border-emerald-500/15">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-emerald-500">Seluruh Berita Data Bersih & Siap Lapor!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {validationErrors.map((err) => (
                <div key={err.id}
                  className={`p-3.5 rounded-xl border flex justify-between items-start ${err.priority === 'Tinggi' ? 'border-rose-500/20 bg-rose-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}
                >
                  <div className="flex gap-2 min-w-0">
                    <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${err.priority === 'Tinggi' ? 'text-rose-500' : 'text-amber-500'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-none mb-1">{err.message}</p>
                      <p className="text-[9px] text-slate-400">Modul: {err.type} • Field: {err.field}</p>
                    </div>
                  </div>
                  <button onClick={() => handleResolveValidationError(err.id)}
                    className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-0.5 rounded font-semibold whitespace-nowrap ml-2 shrink-0">
                    Perbaiki
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sync history logs table */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-sm font-display mb-4">Log Riwayat Sinkronisasi Neo Feeder</h3>
        <div className="border border-slate-100 dark:border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-left font-sans text-xs">
            <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-900/60 text-zinc-400 border-b border-zinc-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}`}>
              <tr>
                <th className="p-3">Waktu Sync</th>
                <th className="p-3">Kategori Data</th>
                <th className="p-3">Jumlah Lapor Sukses</th>
                <th className="p-3">Jumlah Gagal</th>
                <th className="p-3 text-right">Status Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="p-3 font-mono text-slate-400">{log.timestamp}</td>
                  <td className="p-3 font-bold">{log.type}</td>
                  <td className="p-3 font-mono font-semibold text-emerald-500">{log.recordsSynced} records</td>
                  <td className="p-3 font-mono font-semibold text-rose-500">{log.recordsFailed} records</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${log.status === 'Sukses' ? 'bg-emerald-500/10 text-emerald-500' : log.status === 'Peringatan' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
