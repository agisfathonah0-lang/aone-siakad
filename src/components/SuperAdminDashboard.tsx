import React, { useState } from 'react';
import { CAMPUS_LIST, TIKET_LIST, AUDIT_LOG_LIST } from '../mockData';
import { Campus } from '../types';
import { motion } from 'motion/react';
import WebCustomization from './WebCustomization';
import CampusMonitor from './CampusMonitor';
import FirewallMonitor from './FirewallMonitor';
import {
  Server, Cpu, Database, HardDrive, Plus, Search, CheckCircle2,
  XCircle, Filter, Edit, ExternalLink, Calendar, CircleDot,
  Check, AlertTriangle, AlertCircle, Info, RefreshCw, Layers
} from 'lucide-react';

interface SuperAdminDashboardProps {
  currentView: string;
  isDark: boolean;
  onNavigate?: (module: string, view: string) => void;
}

export default function SuperAdminDashboard({ currentView, isDark, onNavigate }: SuperAdminDashboardProps) {
  // Local CRUD state for campus list
  const [campuses, setCampuses] = useState<Campus[]>(CAMPUS_LIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);

  // Modal stats
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCampus, setNewCampus] = useState({
    name: '',
    code: '',
    package: 'Enterprise Platinum',
    expiresAt: '2028-12-31',
    students: 1000,
    lecturers: 50,
    programs: 6,
    location: '',
  });

  const [selectedCampusId, setSelectedCampusId] = useState<string | undefined>(undefined);

  // Ticket states
  const [tickets, setTickets] = useState(TIKET_LIST);

  // Subscription rates
  const [plans, setPlans] = useState([
    { name: 'SaaS Trial', price: 'Rp 0', term: '30 Hari', maxStudents: 1000, active: 1, color: 'border-slate-300 dark:border-zinc-700' },
    { name: 'SaaS Standard', price: 'Rp 14.500.000', term: 'Bulan / Kampus', maxStudents: 5000, active: 1, color: 'border-blue-500' },
    { name: 'SaaS Pro', price: 'Rp 27.000.000', term: 'Bulan / Kampus', maxStudents: 10000, active: 1, color: 'border-emerald-500' },
    { name: 'Enterprise Gold', price: 'Rp 45.000.000', term: 'Bulan / Kampus', maxStudents: 25000, active: 1, color: 'border-amber-500' },
    { name: 'Enterprise Platinum', price: 'Custom Quote', term: 'Annual / Kampus', maxStudents: 100000, active: 2, color: 'border-purple-500 bg-purple-500/5' }
  ]);

  const handleToggleStatus = (id: string) => {
    setCampuses(campuses.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === 'Aktif' ? 'Nonaktif' : 'Aktif' };
      }
      return c;
    }));
  };

  const handleAddCampusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockId = 'UND-' + Math.random().toString(36).substring(2, 5).toUpperCase();
    const created: Campus = {
      id: mockId,
      name: newCampus.name,
      code: newCampus.code,
      status: 'Aktif',
      package: newCampus.package,
      expiresAt: newCampus.expiresAt,
      students: Number(newCampus.students),
      lecturers: Number(newCampus.lecturers),
      programs: Number(newCampus.programs),
      location: newCampus.location,
    };
    setCampuses([...campuses, created]);
    setIsAddModalOpen(false);
    setNewCampus({
      name: '',
      code: '',
      package: 'Enterprise Platinum',
      expiresAt: '2028-12-31',
      students: 1000,
      lecturers: 50,
      programs: 6,
      location: '',
    });
  };

  const handleResolveTicket = (id: string) => {
    setTickets(tickets.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'Selesai' ? 'Terbuka' : 'Selesai' };
      }
      return t;
    }));
  };

  // Filtered lists
  const filteredCampuses = campuses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* RENDER VIEW: DASHBOARD */}
      {currentView === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Header Title */}
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 font-mono">DASHBOARD SERVER SAAS GLOBAL</span>
            <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">AONE SIAKAD - Manajemen Multi-Tenant</h2>
          </div>

          {/* SaaS KPI Widgets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Kampus Pelanggan</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold font-display">{campuses.length}</span>
                <span className="text-[10px] text-emerald-500 font-bold font-mono">+1 Bulan ini</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2">Penyewa cloud aktif yang termonitor</p>
            </div>
            
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Mahasiswa Terdaftar</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold font-display">27,400</span>
                <span className="text-[10px] text-indigo-500 font-bold font-mono">25 Kampus Terpusat</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2">Database Mahasiswa Indonesia UND</p>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-wider">Pendapatan SaaS Berulang (MRR)</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">Rp 148,5 M</span>
                <span className="text-[10px] text-emerald-500 font-bold font-mono">YoY +18%</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2">Annual Recurring Rate (ARR): Rp 1.78 Triliun</p>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-wider">API Core Service SLA</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold font-display text-emerald-600">99.98%</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] text-emerald-500 font-bold">HEALTHY</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2">Uptime 30 hari terakhir. Cloud Run Ingress</p>
            </div>
          </div>

          {/* Infrastructure Health Status */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <h3 className="font-bold text-sm font-display mb-4">Sistem & Infrastruktur Cloud Run</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl flex items-center gap-3">
                <Server className="w-8 h-8 text-indigo-600" />
                <div>
                  <h4 className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-bold">Master Database</h4>
                  <p className="text-xs font-bold mt-1">Google Spanner</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Latency 1.2ms (OK)</p>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl flex items-center gap-3">
                <Cpu className="w-8 h-8 text-emerald-500" />
                <div>
                  <h4 className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-bold">In-Memory Cache</h4>
                  <p className="text-xs font-bold mt-1">Redis Cluster</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Uptime 142 Hari</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl flex items-center gap-3">
                <Database className="w-8 h-8 text-rose-500" />
                <div>
                  <h4 className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-bold">Media Cloud Storage</h4>
                  <p className="text-xs font-bold mt-1">GCS Buckets</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">842 TB / 1.2 PB</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl flex items-center gap-3">
                <HardDrive className="w-8 h-8 text-amber-500" />
                <div>
                  <h4 className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-bold">Dinkes / WS Gateways</h4>
                  <p className="text-xs font-bold mt-1">WA & SMTP Server</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">99.8% Sent Success</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick lists layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Campus Active Subscriptions */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm font-display">Status Tenant Kampus Terkini</h3>
                <span className="text-xs font-semibold text-indigo-500 hover:underline cursor-pointer">Selengkapnya</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {campuses.slice(0, 3).map((camp) => (
                  <div key={camp.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold">{camp.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{camp.location} | {camp.package}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${camp.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {camp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Logs Overview */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm font-display">Aktivitas Sistem Global</h3>
                <span className="text-xs font-bold text-emerald-500 animate-pulse flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Stream
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {AUDIT_LOG_LIST.slice(0, 3).map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">{log.action}</p>
                      <p className="text-[10px] text-slate-500 truncate">{log.actor} - IP: {log.ip}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap ml-2">{log.timestamp.split(' ')[1]}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* RENDER VIEW: DAFTAR KAMPUS */}
      {currentView === 'kampus_list' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold font-display tracking-tight">Penyewa Kampus - Multi-Tenant</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Daftar kampus terafiliasi dengan platform AONE SIAKAD.</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              Daftarkan Kampus Baru
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex-1 relative border rounded-xl overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari universitas berdasarkan nama, kode, atau kota kelembagaan..."
                className="w-full pl-10 pr-4 py-2.5 bg-transparent outline-none text-xs"
              />
            </div>
          </div>

          {/* Details drawer of selected item */}
          {selectedCampus && (
            <div className={`p-6 rounded-2xl border relative ${isDark ? 'bg-zinc-900 border-zinc-800 text-white animate-in fade-in' : 'bg-slate-100 border-slate-200 text-slate-900 animate-in fade-in'}`}>
              <button
                onClick={() => setSelectedCampus(null)}
                className="absolute right-4 top-4 hover:opacity-75 text-sm font-semibold"
              >
                Tutup [X]
              </button>
              <h3 className="font-bold text-base font-display mb-1">{selectedCampus.name}</h3>
              <p className="text-xs text-indigo-500 mb-4">{selectedCampus.location} • Kode ID: {selectedCampus.code}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-t border-b border-indigo-500/10 mb-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Mahasiswa</p>
                  <p className="text-sm font-extrabold mt-0.5">{selectedCampus.students.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Dosen</p>
                  <p className="text-sm font-extrabold mt-0.5">{selectedCampus.lecturers.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Fakultas / Prodi</p>
                  <p className="text-sm font-extrabold mt-0.5">{selectedCampus.programs}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Paket Layanan</p>
                  <p className="text-sm font-extrabold mt-0.5 text-indigo-500">{selectedCampus.package}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleToggleStatus(selectedCampus.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition ${selectedCampus.status === 'Aktif' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                >
                  {selectedCampus.status === 'Aktif' ? 'Nonaktifkan Lisensi' : 'Aktifkan Lisensi'}
                </button>
                <button
                  className="px-3 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-zinc-800"
                >
                  Edit Invoice Bundling
                </button>
              </div>
            </div>
          )}

          {/* Table Data Grid */}
          <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <table className="w-full text-left font-sans">
              <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-900/60 text-zinc-400 border-b border-zinc-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}`}>
                <tr>
                  <th className="p-4">Kode ID</th>
                  <th className="p-4">Nama Universitas</th>
                  <th className="p-4">Lokasi Wilayah</th>
                  <th className="p-4">Jenis Lisensi</th>
                  <th className="p-4">Masa Berlaku</th>
                  <th className="p-4">Status Layanan</th>
                  <th className="p-4 text-right">Navigasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {filteredCampuses.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition">
                    <td className="p-4 font-mono font-bold text-slate-400">{camp.code}</td>
                    <td className="p-4">
                      <p className="font-bold">{camp.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{camp.students} Mahasiswa • {camp.lecturers} Dosen</p>
                    </td>
                    <td className="p-4">{camp.location}</td>
                    <td className="p-4">
                      <span className="font-semibold text-indigo-500">{camp.package}</span>
                    </td>
                    <td className="p-4">{camp.expiresAt}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${camp.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`?campus=${camp.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className={`p-1.5 rounded-lg border inline-flex items-center ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-50'}`}
                          title="Buka Halaman Kampus"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                        </a>
                        <button
                          onClick={() => setSelectedCampus(camp)}
                          className={`p-1.5 rounded-lg border ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-50'}`}
                          title="Detail Profil Kampus"
                        >
                          <Info className="w-3.5 h-3.5 text-indigo-500" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(camp.id)}
                          className={`p-1.5 rounded-lg border ${camp.status === 'Aktif' ? 'border-zinc-700 hover:bg-rose-500/10' : 'border-zinc-700 hover:bg-emerald-500/10'}`}
                          title="Ubah Status"
                        >
                          {camp.status === 'Aktif' ? <XCircle className="w-3.5 h-3.5 text-rose-500" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* New Campus Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white text-slate-800'}`}>
                <h3 className="font-display font-bold text-lg mb-4">Daftarkan Universitas Baru (Lisensi SaaS)</h3>
                
                <form onSubmit={handleAddCampusSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Nama Lengkap Kampus</label>
                      <input
                        type="text"
                        required
                        placeholder="contoh: UND Yogyakarta"
                        value={newCampus.name}
                        onChange={(e) => setNewCampus({ ...newCampus, name: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 mt-1 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Kode Universitas (PDDIKTI)</label>
                      <input
                        type="text"
                        required
                        placeholder="ID-005"
                        value={newCampus.code}
                        onChange={(e) => setNewCampus({ ...newCampus, code: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 mt-1 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Tingkat Lisensi</label>
                      <select
                        value={newCampus.package}
                        onChange={(e) => setNewCampus({ ...newCampus, package: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 mt-1 ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <option value="SaaS Trial">SaaS Trial</option>
                        <option value="SaaS Standard">SaaS Standard</option>
                        <option value="SaaS Pro">SaaS Pro</option>
                        <option value="Enterprise Gold">Enterprise Gold</option>
                        <option value="Enterprise Platinum">Enterprise Platinum</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Lokasi / Kota</label>
                      <input
                        type="text"
                        required
                        placeholder="Sleman, Yogyakarta"
                        value={newCampus.location}
                        onChange={(e) => setNewCampus({ ...newCampus, location: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 mt-1 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Est. Mhs</label>
                      <input
                        type="number"
                        value={newCampus.students}
                        onChange={(e) => setNewCampus({ ...newCampus, students: Number(e.target.value) })}
                        className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Est. Dosen</label>
                      <input
                        type="number"
                        value={newCampus.lecturers}
                        onChange={(e) => setNewCampus({ ...newCampus, lecturers: Number(e.target.value) })}
                        className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Est. Prodi</label>
                      <input
                        type="number"
                        value={newCampus.programs}
                        onChange={(e) => setNewCampus({ ...newCampus, programs: Number(e.target.value) })}
                        className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                    >
                      Simpan Pendaftaran
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* RENDER VIEW: PAKET BERLANGGANAN */}
      {currentView === 'subscription_plans' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-display tracking-tight">Skema Paket Berlangganan SaaS</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Konfigurasi limit billing bulanan, kuota server, dan fitur prioritas tenant universitas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`p-5 rounded-2xl border flex flex-col justify-between transition hover:-translate-y-1 ${plan.color} ${isDark ? 'bg-zinc-900/60' : 'bg-white'}`}>
                <div>
                  <h3 className="font-bold font-display text-sm uppercase tracking-wider">{plan.name}</h3>
                  <div className="mt-4 mb-2">
                    <p className="text-lg font-extrabold">{plan.price}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{plan.term}</p>
                  </div>
                  
                  <div className="space-y-2 mt-6">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Limit: <b>{plan.maxStudents.toLocaleString('id-ID')}</b> Mhs</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-500">
                      <Check className="w-3.5 h-3.5" />
                      <span>Sync PDDIKTI Terintegrasi</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-500">
                      <Check className="w-3.5 h-3.5" />
                      <span>SSO OJS & Akademik</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400">TENANT SEKARANG: </span>
                  <span className="text-xs font-extrabold text-indigo-500 float-right">{plan.active} Aktif</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER VIEW: MONITORING SISTEM */}
      {currentView === 'system_monitor' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-display tracking-tight">Kinerja Node & Cloud Run Server</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Monitoring real-time health checks, beban request server-side, and storage usage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white'}`}>
              <span className="text-xs font-semibold text-slate-400">AVERAGE END-TO-END TIMEOUT</span>
              <p className="text-2xl font-extrabold mt-1">24.5 ms</p>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-emerald-500 h-full w-[24%]" />
              </div>
            </div>
            
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white'}`}>
              <span className="text-xs font-semibold text-slate-400">CONTAINER CONCURRENCY (LOAD)</span>
              <p className="text-2xl font-extrabold mt-1">12.4% CAP</p>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-emerald-500 h-full w-[12%]" />
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white'}`}>
              <span className="text-xs font-semibold text-slate-400">ACTIVE DB CONNECTIONS (SPANNER)</span>
              <p className="text-2xl font-extrabold mt-1">24,810 CQ</p>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-indigo-500 h-full w-[65%]" />
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white'}`}>
              <span className="text-xs font-semibold text-slate-400">BANDWIDTH EXIT THROUGHPUT</span>
              <p className="text-2xl font-extrabold mt-1">4.2 Gbps</p>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-amber-500 h-full w-[42%]" />
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white'}`}>
            <h3 className="font-bold font-display text-sm mb-4">Vite & Node Server Logs Context</h3>
            <div className="p-4 bg-black/90 text-emerald-400 font-mono text-[11px] rounded-xl space-y-1.5 overflow-hidden shadow-inner leading-relaxed">
              <p className="text-slate-500">// Booting system clusters at 2026-06-02T13:08:41Z</p>
              <p>[INFO] Ingress controller up. Redirecting traffic on port :3000</p>
              <p>[DB] Connected PostgreSQL Master pool node 0 and Cloud Spanner cluster ID aone-prod-asia</p>
              <p>[WA-GATEWAY] Connected to provider server. Handshake success with code 300</p>
              <p className="text-indigo-400">[VITE-DEV] Server runs behind reverse proxy with HMR: false</p>
              <p className="text-amber-500">[WARN] Tenant UND-BDG is approaching credit expiry. SMTP gateway warnings scheduled.</p>
              <p>[SYNC-SCHEDULER] PDDIKTI automatic cron scheduled for night sync 23:59:00 GTM+7</p>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: AUDIT LOG */}
      {currentView === 'audit_logs' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-display tracking-tight">Audit Log Keamanan & Akses</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Pelacakan log aktivitas lengkap yang dilakukan oleh segenap administrator kelembagaan kampus.</p>
          </div>

          <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <table className="w-full text-left">
              <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-900/60 text-zinc-400 border-b border-zinc-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}`}>
                <tr>
                  <th className="p-4">ID Log</th>
                  <th className="p-4">Pengguna (Actor)</th>
                  <th className="p-4">Aksi Operator</th>
                  <th className="p-4">Alamat IP</th>
                  <th className="p-4">Stempel Waktu (Timestamp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {AUDIT_LOG_LIST.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/10">
                    <td className="p-4 font-mono font-semibold text-slate-400">{log.id}</td>
                    <td className="p-4 font-bold">{log.actor}</td>
                    <td className="p-4">{log.action}</td>
                    <td className="p-4 font-mono text-indigo-500">{log.ip}</td>
                    <td className="p-4 text-slate-500">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER VIEW: WEB KAMPUS (CAMPUS MONITOR) */}
      {currentView === 'kampus-web' && (
        <CampusMonitor isDark={isDark} onEditCampus={(id) => { setSelectedCampusId(id); onNavigate('SUPER_ADMIN', 'web_customization'); }} />
      )}

      {/* RENDER VIEW: KUSTOMISASI WEB */}
      {currentView === 'web_customization' && (
        <WebCustomization isDark={isDark} campusId={selectedCampusId} />
      )}

      {/* RENDER VIEW: FIREWALL MONITOR */}
      {currentView === 'firewall_monitor' && (
        <FirewallMonitor isDark={isDark} />
      )}

      {/* RENDER VIEW: SUPPORT TICKETS */}
      {currentView === 'support_tickets' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-display tracking-tight">Manajemen Tiket Layanan (Helpdesk)</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Dukungan teknis premium bagi admin universitas. Tindak lanjuti laporan bug and kendala sinkronisasi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tickets.map((t) => (
              <div key={t.id} className={`p-5 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200'}`}>
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-slate-400">{t.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${t.priority === 'Tinggi' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {t.priority}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs mt-3 font-display">{t.title}</h3>
                  <p className="text-[10px] text-indigo-500 mt-1">{t.campus} • Divisi {t.category}</p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${t.status === 'Selesai' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                    {t.status}
                  </span>
                  
                  <button
                    onClick={() => handleResolveTicket(t.id)}
                    className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded"
                  >
                    {t.status === 'Selesai' ? 'Buka Kembali' : 'Selesaikan Tiket'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
