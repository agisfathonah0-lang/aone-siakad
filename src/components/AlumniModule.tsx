import React, { useState } from 'react';
import { ALUMNI_SURVEYS } from '../mockData';
import { AlumniSurvey } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';
import {
  Compass, Award, RefreshCw, Send, CheckCircle2, Sliders, Laptop, Cpu,
  MessageSquare, Star, Plus, ShieldAlert, Heart, Info, ClipboardList, TrendingUp,
  Briefcase, GraduationCap, DollarSign, Calendar
} from 'lucide-react';

interface AlumniModuleProps {
  currentView: string;
  isDark: boolean;
}

export default function AlumniModule({ currentView, isDark }: AlumniModuleProps) {
  const { toast } = useToast();
  const [surveys, setSurveys] = useState<AlumniSurvey[]>(ALUMNI_SURVEYS);
  const [activeTab, setActiveTab] = useState<'kpi' | 'responses'>('kpi');
  
  // Student Tracer Study Submit State
  const [studentGradYear, setStudentGradYear] = useState(2025);
  const [studentCompany, setStudentCompany] = useState('');
  const [studentPosition, setStudentPosition] = useState('');
  const [studentSalary, setStudentSalary] = useState(8500000);
  const [studentWaitTime, setStudentWaitTime] = useState(3);
  const [studentRelevance, setStudentRelevance] = useState('Sangat Sesuai');
  const [studentSubmitSuccess, setStudentSubmitSuccess] = useState(false);

  // Sektor alumni chart data
  const outcomes = [
    { sector: 'Bekerja di Sektor Korporasi Multinasional / BUMN', share: '62%', count: '240 orang', bg: 'bg-indigo-600' },
    { sector: 'Menjadi Founder / Wirausaha Digital (Startup)', share: '18%', count: '72 orang', bg: 'bg-emerald-500' },
    { sector: 'Melanjutkan Studi Magister (S2)', share: '12%', count: '48 orang', bg: 'bg-indigo-400' },
    { sector: 'Bekerja di Instansi Pemerintahan / PNS', share: '8%', count: '32 orang', bg: 'bg-amber-500' }
  ];

  const handleStudentTracerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCompany || !studentPosition) {
      toast('Harap lengkapi instansi kerja dan jabatan baru Anda.', 'warning');
      return;
    }

    const freshSurvey: AlumniSurvey = {
      id: 'ALUM-' + String(surveys.length + 1).padStart(3, '0'),
      name: 'Ahmad Fauzi (You)',
      gradYear: studentGradYear,
      company: studentCompany,
      position: studentPosition,
      monthlySalary: studentSalary,
      timeToGetJob: studentWaitTime,
      relevance: studentRelevance as any,
    };

    setSurveys([freshSurvey, ...surveys]);
    setStudentSubmitSuccess(true);
    setTimeout(() => {
      setStudentSubmitSuccess(false);
      // Reset inputs
      setStudentCompany('');
      setStudentPosition('');
    }, 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
        <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">PORTAL DIREKTORI ALUMNI & TRACER STUDY</span>
        <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Tracer Study & Alumni Outcomes</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Analisis keterserapan industri lulusan, masa tunggu kerja, serta pelacakan keselarasan kurikulum akademik.</p>
      </div>

      {/* VIEW 1: ADMIN TRACER ANALYTICS (alumni_dashboard) */}
      {currentView === 'alumni_dashboard' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Alumni Dashboard widgets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-[9px] uppercase font-bold">Total Lulusan Terlacak</p>
              <h3 className="text-2xl font-extrabold mt-1.5">{surveys.length * 10 + 20} Alumni</h3>
              <p className="text-[10px] text-emerald-500 font-bold mt-1">Tracer Study Lengkap: 94%</p>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-[9px] uppercase font-bold">Masa Tunggu Kerja Rerata</p>
              <h3 className="text-2xl font-extrabold mt-1.5">2.4 Bulan</h3>
              <p className="text-[10px] text-indigo-500 font-bold mt-1">SLA BAN-PT Unggul: &lt; 6 Bulan</p>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-[9px] uppercase font-bold">Rasio Gaji Lulusan Pertama</p>
              <h3 className="text-2xl font-extrabold mt-1.5">1.8x UMR</h3>
              <p className="text-[10px] text-emerald-500 font-bold mt-1">Gaji Teratas: IT & Sistem Informasi</p>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-[9px] uppercase font-bold">Keselarasan Bidang Kerja</p>
              <h3 className="text-2xl font-extrabold mt-1.5">85.4% Cap</h3>
              <p className="text-[10px] text-slate-400 mt-1">Sesuai draf kurikulum Merdeka</p>
            </div>
          </div>

          {/* Sub navigation for admin tabs */}
          <div className="flex border-b border-slate-100 dark:border-zinc-800 pb-2 gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('kpi')}
              className={`pb-2 ${activeTab === 'kpi' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
            >
              Sebaran Hasil & Grafik Karir
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`pb-2 ${activeTab === 'responses' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
            >
              Jawaban Responden Terbaru ({surveys.length})
            </button>
          </div>

          {activeTab === 'kpi' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Graduate Outcome bars */}
              <div className={`p-6 rounded-2xl border lg:col-span-2 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
                <h3 className="font-bold text-sm font-display mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Sektor Industri Penempatan Lulusan
                </h3>
                <div className="space-y-4">
                  {outcomes.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{item.sector}</span>
                        <span className="font-mono text-slate-400">{item.count} ({item.share})</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                        <div className={`h-full ${item.bg} rounded-full`} style={{ width: item.share }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General alumni advisory card */}
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-800'} flex flex-col justify-between`}>
                <div>
                  <h3 className="font-bold text-sm font-display mb-3">Tautan Karir & MBKM Kemdikbud</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Sinkronisasikan dashboard pelacakan lulusan langsung ke portal Dikte Kemendikbudristek RI sesuai regulasi IKU 1 (Indikator Kinerja Utama) Perguruan Tinggi.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <button className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-750 transition">
                    Verifikasi Sesuai LLDIKTI
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'responses' && (
            <div className="space-y-3">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-850' : 'bg-white border-slate-200'}`}
                >
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <h4 className="font-bold">{survey.name} (Angkatan {survey.gradYear})</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{survey.company} • {survey.position}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Masa Tunggu: {survey.timeToGetJob} Bulan</span>
                  </div>

                  <div className="mt-3 p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed flex justify-between items-center text-xs">
                    <span>Relevansi Pengajaran: <b className="text-indigo-500">{survey.relevance}</b></span>
                    <span className="font-bold text-emerald-600">Gaji: Rp {survey.monthlySalary.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: STUDENT PORTAL TRACER FILL (mhs_alumni_survey) */}
      {currentView === 'mhs_alumni_survey' && (
        <div className="space-y-6 animate-in fade-in max-w-3xl">
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight">Kuesioner Tracer Study Lulusan</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Silakan kontribusikan info pekerjaan pasca-lulus agar universitas dapat menyempurnakan kurikulum relevansi industri.</p>
          </div>

          {studentSubmitSuccess ? (
            <div className="p-6 rounded-2xl border text-center bg-emerald-500/10 border-emerald-500/15 text-emerald-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto animate-bounce" />
              <p className="text-base font-bold">Tracer Study Anda Sukses Dikirimkan!</p>
              <p className="text-xs text-slate-400">Terima kasih atas bantuan Anda. Kontribusi data ini langsung tercatat di data penilai IKU 1 BAN-PT.</p>
            </div>
          ) : (
            <form onSubmit={handleStudentTracerSubmit} className={`p-6 rounded-2xl border space-y-5 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-205'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Tahun Kelulusan (Tahun Wisuda)</label>
                  <input
                    type="number"
                    value={studentGradYear}
                    onChange={(e) => setStudentGradYear(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                  />
                </div>
                
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Masa Tunggu Mendapat Kerja (Bulan)</label>
                  <input
                    type="number"
                    value={studentWaitTime}
                    onChange={(e) => setStudentWaitTime(Number(e.target.value))}
                    placeholder="cth: 3 (Isi 0 jika sebelum lulus)"
                    className={`w-full p-2.5 rounded-xl border mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Nama Instansi / Perusahaan Kerja</label>
                  <input
                    type="text"
                    required
                    value={studentCompany}
                    onChange={(e) => setStudentCompany(e.target.value)}
                    placeholder="cth: PT Solusi Teknologi Digital"
                    className={`w-full p-2.5 rounded-xl border mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Jabatan / Posisi Kerja</label>
                  <input
                    type="text"
                    required
                    value={studentPosition}
                    onChange={(e) => setStudentPosition(e.target.value)}
                    placeholder="cth: Fullstack Developer"
                    className={`w-full p-2.5 rounded-xl border mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Estimasi Gaji Bulanan (Rupiah)</label>
                  <input
                    type="number"
                    value={studentSalary}
                    onChange={(e) => setStudentSalary(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Kesesuaian dengan Pendidikan Prodi</label>
                  <select
                    value={studentRelevance}
                    onChange={(e) => setStudentRelevance(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                  >
                    <option value="Sangat Sesuai">Sangat Sesuai (Pekerjaan linear dengan modul koding)</option>
                    <option value="Sesuai">Sesuai (Masih bagian dari korporasi TI)</option>
                    <option value="Cukup">Cukup Sesuai</option>
                    <option value="Tidak Sesuai">Tidak Sesuai (Pekerjaan di luar sektor materi kuliah)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 text-xs">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition whitespace-nowrap shadow-md"
                >
                  <Send className="w-4 h-4" />
                  Kirim Data Tracer Study
                </button>
              </div>
            </form>
          )}
        </div>
      )}

    </div>
  );
}
