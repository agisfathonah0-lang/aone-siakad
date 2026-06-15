import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Globe, ExternalLink, Users, BookOpen, Building, Search, Activity, Wifi, WifiOff, Edit, Server, Monitor, RefreshCw } from 'lucide-react';
import { api } from '../api';

interface CampusMonitorProps {
  isDark: boolean;
  onEditCampus: (campusId: string) => void;
}

export default function CampusMonitor({ isDark, onEditCampus }: CampusMonitorProps) {
  const [campuses, setCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getCampusStats().then(data => {
      setCampuses(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = campuses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.subdomain || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-xs text-slate-400">Memuat data kampus...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 font-mono">MANAJEMEN TENANT</span>
        <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Web Kampus & Tenant</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Kelola subdomain, pantau penggunaan, dan akses web masing-masing kampus.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <Building className="w-5 h-5 text-indigo-500 mb-2" />
          <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Total Kampus</p>
          <span className="text-2xl font-extrabold font-display">{campuses.length}</span>
        </div>
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <Activity className="w-5 h-5 text-emerald-500 mb-2" />
          <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Aktif</p>
          <span className="text-2xl font-extrabold font-display text-emerald-500">{campuses.filter(c => c.status === 'Aktif').length}</span>
        </div>
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <Users className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Total Mahasiswa</p>
          <span className="text-2xl font-extrabold font-display">{campuses.reduce((a, c) => a + (c.students || 0), 0).toLocaleString()}</span>
        </div>
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <Server className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Total Dosen</p>
          <span className="text-2xl font-extrabold font-display">{campuses.reduce((a, c) => a + (c.lecturers || 0), 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs outline-none focus:border-emerald-500 ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200'}`}
          placeholder="Cari kampus, subdomain, lokasi..."
        />
      </div>

      {/* Campus Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((campus, idx) => (
          <motion.div
            key={campus.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-5 rounded-2xl border transition hover:shadow-md ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${campus.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-zinc-800 text-slate-400'}`}>
                  {campus.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{campus.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{campus.code} &middot; {campus.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {campus.status === 'Aktif' ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-bold"><Wifi className="w-3 h-3" /> Aktif</span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[9px] font-bold"><WifiOff className="w-3 h-3" /> Nonaktif</span>
                )}
              </div>
            </div>

            {/* Subdomain & URL */}
            <div className={`p-3 rounded-xl mb-3 ${isDark ? 'bg-zinc-800/50' : 'bg-slate-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-mono">
                    {campus.subdomain ? (
                      <span className="text-emerald-600 dark:text-emerald-400">{campus.subdomain}.aone-project.id</span>
                    ) : (
                      <span className="text-slate-400">Subdomain belum diatur</span>
                    )}
                  </span>
                </div>
                <a href={`?campus=${campus.id}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700" title="Buka halaman kampus">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className={`p-2.5 rounded-xl ${isDark ? 'bg-zinc-800/50' : 'bg-slate-50'}`}>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mahasiswa</p>
                <span className="text-sm font-bold">{campus._studentCount || campus.students?.toLocaleString() || 0}</span>
              </div>
              <div className={`p-2.5 rounded-xl ${isDark ? 'bg-zinc-800/50' : 'bg-slate-50'}`}>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Dosen</p>
                <span className="text-sm font-bold">{campus._lecturerCount || campus.lecturers?.toLocaleString() || 0}</span>
              </div>
              <div className={`p-2.5 rounded-xl ${isDark ? 'bg-zinc-800/50' : 'bg-slate-50'}`}>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Program</p>
                <span className="text-sm font-bold">{campus.programs || 0}</span>
              </div>
            </div>

            {/* Package & Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${campus.package?.includes('Platinum') ? 'bg-purple-500/10 text-purple-500' : campus.package?.includes('Gold') ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {campus.package}
                </span>
                <span className="text-[10px] text-slate-400">Exp: {campus.expiresAt}</span>
              </div>
              <button
                onClick={() => onEditCampus(campus.id)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Atur Web
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Monitor className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-semibold">Tidak ada kampus ditemukan</p>
          <p className="text-xs mt-1">Coba ubah kata kunci pencarian.</p>
        </div>
      )}
    </div>
  );
}
