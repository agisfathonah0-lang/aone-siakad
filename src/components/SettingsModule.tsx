import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useToast } from './Toast';
import {
  Sliders, Shield, Calendar, Mail, MessageSquare, Laptop, CheckCircle2,
  Lock, RefreshCw, Send, Check, Phone, Eye, Save, AlertCircle
} from 'lucide-react';

interface SettingsModuleProps {
  isDark: boolean;
}

export default function SettingsModule({ isDark }: SettingsModuleProps) {
  const { toast } = useToast();
  // SMTP credentials simulated configurations
  const [smtpServer, setSmtpServer] = useState('smtp.aone-project.id');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('notifications@aone-project.id');
  const [isSmtpTested, setIsSmtpTested] = useState<'IDLE' | 'TESTING' | 'SUCCESS'>('IDLE');

  // WA Gateway credentials simulated configurations
  const [waToken, setWaToken] = useState('WA_TOKEN_AONE_92XJ');
  const [waNumber, setWaNumber] = useState('+62 821-2345-6789');
  const [isWaTested, setIsWaTested] = useState<'IDLE' | 'TESTING' | 'SUCCESS'>('IDLE');

  // Academic year toggles
  const [academicYears, setAcademicYears] = useState([
    { year: '2024/2025 Genap', status: 'Selesai' },
    { year: '2025/2026 Ganjil', status: 'Aktif' },
    { year: '2025/2026 Genap', status: 'Draf' }
  ]);

  const handleTestSmtp = () => {
    setIsSmtpTested('TESTING');
    setTimeout(() => {
      setIsSmtpTested('SUCCESS');
    }, 1200);
  };

  const handleTestWa = () => {
    setIsWaTested('TESTING');
    setTimeout(() => {
      setIsWaTested('SUCCESS');
    }, 1200);
  };

  const handleToggleAcademicYearStatus = (selectedYearName: string) => {
    setAcademicYears(academicYears.map(ay => {
      if (ay.year === selectedYearName) {
        return { ...ay, status: 'Aktif' };
      } else if (ay.status === 'Aktif') {
        return { ...ay, status: 'Selesai' };
      }
      return ay;
    }));
    toast(`Tahun Akademik Terpilih: ${selectedYearName} sekarang diatur menjadi status AKTIF Utama!`, 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER PORTAL */}
      <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
        <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">DASHBOARD KONFIGURASI EXECUTIVE</span>
        <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Pengaturan & Konfigurasi Sistem</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Modifikasi hak akses role admisi, parameter mail SMTP, interlocks WhatsApp Gateway, and kalender tahun akademik.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Academic term setup  */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200'} lg:col-span-2 space-y-4`}>
          <div className="flex gap-2 items-center">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm font-display leading-none">Manajemen Tahun Akademik Actif</h3>
          </div>
          
          <p className="text-xs text-slate-500">
            Mengubah tahun akademik aktif akan mempengaruhi sebaran pengisian KRS mahasiswa and rilis kalender dosen wali di seluruh fakultas secara terpusat.
          </p>

          <div className="border border-slate-100 dark:border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950 font-bold border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Periode Tahun Akademik</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Navigasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                {academicYears.map((ay, i) => (
                  <tr key={i}>
                    <td className="p-3 font-semibold">{ay.year}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ay.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                        {ay.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {ay.status !== 'Aktif' && (
                        <button
                          onClick={() => handleToggleAcademicYearStatus(ay.year)}
                          className="px-2.5 py-1 text-[11px] font-bold border rounded bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 transition"
                        >
                          Aktifkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Branding preferences setup panel */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200'} space-y-4 h-fit`}>
          <div className="flex gap-2 items-center">
            <Sliders className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm font-display leading-none">Branding & Logo Kampus Custom</h3>
          </div>
          
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-500 font-semibold mb-1 block">Nama Instansi Pendidikan</label>
              <input
                type="text"
                defaultValue="AONE SIAKAD"
                className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none focus:border-indigo-500 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
              />
            </div>

            <div>
              <label className="text-slate-500 font-semibold mb-1 block">Warna Tema Utama (Primary Hex)</label>
              <div className="flex gap-2 items-center mt-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 border border-slate-200" />
                <input
                  type="text"
                  defaultValue="#4F46E5(Deep Indigo)"
                  className={`flex-1 p-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                />
              </div>
            </div>

            <button
              onClick={() => toast('Konfigurasi branding kampus visual sukses disimpan!', 'success')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-1 transition text-xs"
            >
              <Save className="w-4 h-4" />
              Simpan Branding
            </button>
          </div>
        </div>

      </div>

      {/* Communications setup panels (SMTP and WhatsApp Gateway side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SMTP Gateway Configuration panel */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200'} space-y-4`}>
          <div className="flex gap-2 items-center">
            <Mail className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm font-display leading-none">Kunci Gerbang Mail (SMTP Config)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-slate-500 font-semibold mb-1 block">Server Host SMTP</label>
                <input
                  type="text"
                  value={smtpServer}
                  onChange={(e) => setSmtpServer(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none focus:border-indigo-500 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold mb-1 block">Port SMTP</label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none focus:border-indigo-500 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 font-semibold mb-1 block">Alamat Email Pengirim Utama</label>
              <input
                type="email"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none focus:border-indigo-500 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
              />
            </div>

            {isSmtpTested === 'SUCCESS' && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex gap-2 items-center text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Uji Koneksi SMTP Berhasil! Email tester rilis tuntas.</span>
              </div>
            )}

            <button
              onClick={handleTestSmtp}
              disabled={isSmtpTested === 'TESTING'}
              className="py-2 px-4 bg-slate-900 text-white dark:bg-zinc-800 hover:opacity-80 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSmtpTested === 'TESTING' ? 'animate-spin' : ''}`} />
              {isSmtpTested === 'TESTING' ? 'Menguji SMTP...' : 'Uji Koneksi SMTP'}
            </button>
          </div>
        </div>

        {/* WhatsApp Gateway Integration panel */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200'} space-y-4`}>
          <div className="flex gap-2 items-center">
            <Phone className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm font-display leading-none">Interlocks WhatsApp API Gateway</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-500 font-semibold mb-1 block">Token Integrasi API WA</label>
              <input
                type="text"
                value={waToken}
                onChange={(e) => setWaToken(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none focus:border-indigo-500 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
              />
            </div>

            <div>
              <label className="text-slate-500 font-semibold mb-1 block">Nomor Masking Pengirim</label>
              <input
                type="text"
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none focus:border-indigo-500 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
              />
            </div>

            {isWaTested === 'SUCCESS' && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex gap-2 items-center text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Uji Gateway WA Berhasil! Sesi API terverifikasi online.</span>
              </div>
            )}

            <button
              onClick={handleTestWa}
              disabled={isWaTested === 'TESTING'}
              className="py-2 px-4 bg-slate-900 text-white dark:bg-zinc-800 hover:opacity-80 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isWaTested === 'TESTING' ? 'animate-spin' : ''}`} />
              {isWaTested === 'TESTING' ? 'Mengkonfirmasi Token...' : 'Uji WA Gateway'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
