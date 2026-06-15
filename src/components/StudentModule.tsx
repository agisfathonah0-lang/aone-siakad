import React, { useState } from 'react';
import { COURSE_LIST } from '../mockData';
import { Course } from '../types';
import { motion } from 'motion/react';
import {
  FileText, CheckCircle2, AlertCircle, PlusCircle, MinusCircle, BookOpen,
  Award, TrendingUp, HelpCircle, Sparkles, Send, MapPin, Printer
} from 'lucide-react';

interface StudentModuleProps {
  currentView: string;
  isDark: boolean;
}

export default function StudentModule({ currentView, isDark }: StudentModuleProps) {
  // KRS States
  const [selectedKrs, setSelectedKrs] = useState<string[]>(['MK001', 'MK002', 'MK004']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const maxSks = 24;
  
  // Calculate current SKS taken
  const krsCourses = COURSE_LIST.filter(c => selectedKrs.includes(c.id));
  const currentSksTotal = krsCourses.reduce((sum, c) => sum + c.sks, 0);

  // Take course toggle
  const handleToggleCourseKrs = (courseId: string) => {
    const course = COURSE_LIST.find(c => c.id === courseId);
    if (!course) return;

    if (selectedKrs.includes(courseId)) {
      setSelectedKrs(selectedKrs.filter(id => id !== courseId));
    } else {
      if (currentSksTotal + course.sks > maxSks) {
        setErrorMessage('Gagal mengambil mata kuliah! Batas SKS maksimum semester akademik Anda adalah 24 SKS.');
        setTimeout(() => setErrorMessage(null), 5000);
        return;
      }
      setSelectedKrs([...selectedKrs, courseId]);
    }
  };

  const [activeKhsSemester, setActiveKhsSemester] = useState<number>(4);

  // KHS data mock
  const khsRecords: Record<number, { course: string; code: string; sks: number; grade: string; points: number }[]> = {
    1: [
      { course: 'Algoritma & Pemrograman', code: 'INF1201', sks: 3, grade: 'A', points: 4.0 },
      { course: 'Pendidikan Guru Agama Islam', code: 'FIT1100', sks: 2, grade: 'A-', points: 3.75 },
      { course: 'Matematika Diskrit Dasar', code: 'INF1210', sks: 3, grade: 'B+', points: 3.5 }
    ],
    2: [
      { course: 'Alur Sistem Struktur Organisasi', code: 'SYS2101', sks: 3, grade: 'A', points: 4.0 },
      { course: 'Perkembangan Peserta Didik', code: 'FIT2211', sks: 3, grade: 'A', points: 4.0 },
      { course: 'Desain Layout Kreatif', code: 'FIT2212', sks: 2, grade: 'B+', points: 3.5 }
    ],
    3: [
      { course: 'Database Sistem & NoSQL', code: 'INF2402', sks: 3, grade: 'A', points: 4.0 },
      { course: 'Analisis Desain Sistem', code: 'SYS2203', sks: 3, grade: 'A-', points: 3.75 },
      { course: 'Fiqh Munakahat II', code: 'HUK2104', sks: 3, grade: 'A', points: 4.0 }
    ],
    4: [
      { course: 'Kecerdasan Buatan', code: 'INF3210', sks: 3, grade: 'A', points: 4.0 },
      { course: 'Web Enterprise Project', code: 'INF4112', sks: 3, grade: 'B+', points: 3.5 },
      { course: 'Etika Syariah & Profesi', code: 'EKO2110', sks: 2, grade: 'A', points: 4.0 }
    ]
  };

  const currentKhsList = khsRecords[activeKhsSemester] || [];
  const currentSemesterIps = currentKhsList.reduce((sum, item) => sum + (item.points * item.sks), 0) / currentKhsList.reduce((sum, item) => sum + item.sks, 0) || 0.0;

  return (
    <div className="space-y-6 font-sans">
      
      {/* KRS ONLINE SCREEN */}
      {currentView === 'mhs_krs' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">PORTAL RENCANA STUDI MAHASISWA</span>
              <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Kartu Rencana Studi (KRS Online)</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Silakan pilih mata kuliah yang ditawarkan untuk Semester Ganjil 2025/2026.</p>
            </div>
            
            <div className={`p-4 rounded-xl border flex items-center gap-4 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-indigo-50 border-indigo-100'}`}>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Ringkasan SKS Diambil</span>
                <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {currentSksTotal} <span className="text-xs font-semibold text-slate-500">/ {maxSks} SKS Max</span>
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">Disetujui Dosen Wali</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/15 text-rose-500 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
              <button 
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-500 font-extrabold uppercase text-[10px]"
              >
                Tutup [X]
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KRS Choices Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-sm font-display">Mata Kuliah Ditawarkan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COURSE_LIST.map((course) => {
                  const isChecked = selectedKrs.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      onClick={() => handleToggleCourseKrs(course.id)}
                      className={`p-4 rounded-2xl border transition duration-150 cursor-pointer flex flex-col justify-between ${isChecked ? 'border-indigo-600 bg-indigo-50/10 dark:bg-zinc-800/80 dark:border-indigo-500' : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50'}`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[9px] font-bold text-slate-400">{course.code}</span>
                          {isChecked ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <PlusCircle className="w-4 h-4 text-slate-300" />}
                        </div>
                        <h4 className="font-bold text-xs mt-2 leading-tight">{course.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{course.description}</p>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex justify-between items-center text-[10px] font-bold">
                        <span className="text-indigo-500">Semester {course.semester}</span>
                        <span className="text-slate-400">{course.sks} SKS • {course.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Study Cart summary receipt panel */}
            <div className={`p-6 rounded-2xl border h-fit ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <h3 className="font-bold text-sm font-display mb-4">Kartu KRS Sementara</h3>
              
              {currentSksTotal === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Belum ada mata kuliah yang Anda ambil.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="divide-y divide-slate-100 dark:divide-zinc-850">
                    {krsCourses.map((c) => (
                      <div key={c.id} className="py-2.5 flex justify-between items-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{c.name}</p>
                          <p className="text-[9px] font-mono text-slate-400 mt-0.5">{c.code} • Sem {c.semester}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold whitespace-nowrap">{c.sks} SKS</span>
                          <button
                            onClick={() => handleToggleCourseKrs(c.id)}
                            className="text-rose-500 hover:text-rose-600"
                            title="Hapus"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 space-y-3">
                    <div className="flex justify-between text-xs font-display">
                      <span className="font-bold">Total SKS Terdaftar</span>
                      <span className="font-extrabold text-indigo-500">{currentSksTotal} SKS</span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      SKS dihitung secara otomatis sebagai prasyarat IPK Anda. Klik kirim persetujuan untuk mengirimkan draf KRS ini ke dosen pembimbing akademik Anda.
                    </p>

                    <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md">
                      <Send className="w-3.5 h-3.5" />
                      Kirim ke Dosen Wali Wali
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* RENDER VIEW: KHS SCREEN */}
      {currentView === 'mhs_khs' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">DOKUMEN NILAI SEMESTER</span>
              <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Kartu Hasil Studi (KHS Online)</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Pilih semester di bawah ini untuk mengunduh rekap nilai perkuliahan Anda.</p>
            </div>

            <div className="flex gap-2">
              {[1, 2, 3, 4].map((sem) => (
                <button
                  key={sem}
                  onClick={() => setActiveKhsSemester(sem)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeKhsSemester === sem ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'}`}
                >
                  Smt {sem}
                </button>
              ))}
            </div>
          </div>

          {/* Stats widget cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Indeks Prestasi Semester (IPS)</p>
              <h3 className="text-3xl font-extrabold text-indigo-500 font-mono mt-2">{currentSemesterIps.toFixed(2)}</h3>
              <p className="text-[10px] text-slate-400 mt-2">Dihitung berdasarkan pembagian bobot sks tiap mata kuliah.</p>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">SKS Terselesaikan</p>
              <h3 className="text-3xl font-extrabold mt-2">{currentKhsList.reduce((sum, item) => sum + item.sks, 0)} SKS</h3>
              <p className="text-[10px] text-slate-400 mt-2">Seluruh mata kuliah wajib pada semester {activeKhsSemester} ini lulus.</p>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Status Kelulusan Semester</p>
              <h3 className="text-3xl font-extrabold text-emerald-500 font-display mt-2">TUNTAS</h3>
              <p className="text-[10px] text-slate-400 mt-2">Tidak ada mata kuliah yang mengulang atau di bawah poin C.</p>
            </div>
          </div>

          {/* Grades Table Grid */}
          <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <table className="w-full text-left">
              <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-900/60 text-zinc-400 border-b border-zinc-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}`}>
                <tr>
                  <th className="p-4">Kode MK</th>
                  <th className="p-4">Mata Kuliah Utama</th>
                  <th className="p-4">SKS</th>
                  <th className="p-4">Grade Huruf</th>
                  <th className="p-4 text-right">Poin Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {currentKhsList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-800/10">
                    <td className="p-4 font-mono font-bold text-slate-400">{item.code}</td>
                    <td className="p-4 font-bold">{item.course}</td>
                    <td className="p-4 font-semibold">{item.sks} SKS</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-indigo-50 dark:bg-zinc-800 font-bold text-indigo-600 dark:text-indigo-400">
                        {item.grade}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-bold">{item.points.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER VIEW: TRANSKRIP SCREEN */}
      {currentView === 'mhs_transkrip' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">DOKUMEN RESMI AKADEMIK</span>
              <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Transkrip Nilai Akademik Terpusat</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Rekapitulasi resmi perolehan nilai mata kuliah sejak awal masa perkuliahan.</p>
            </div>

            <button className="px-4 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-zinc-800 team-button text-xs font-bold text-white rounded-xl flex items-center gap-1.5 transition">
              <Printer className="w-3.5 h-3.5" />
              Cetak PDF Transkrip
            </button>
          </div>

          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-850'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Nama Mahasiswa</span>
                <p className="text-sm font-bold mt-0.5">Ahmad Fauzi</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Nomor Induk (NIM)</span>
                <p className="text-sm font-bold mt-0.5 font-mono">20220801001</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Program Studi</span>
                <p className="text-sm font-bold mt-0.5">Sistem Informasi</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">IPK Akumulatif</span>
                <p className="text-sm font-extrabold mt-0.5 text-emerald-600 dark:text-emerald-400 font-mono">3.82</p>
              </div>
            </div>

            {/* Structured Table listing all semesters items */}
            <div className="space-y-6">
              {[1, 2, 3, 4].map((sem) => (
                <div key={sem} className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase font-display text-indigo-500 tracking-wider">Hasil Semester {sem}</h3>
                  <div className="border border-slate-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 dark:bg-zinc-900 font-bold border-b border-slate-100 dark:border-zinc-800">
                        <tr>
                          <th className="p-3">Kode</th>
                          <th className="p-3">Nama Lengkap Mata Kuliah</th>
                          <th className="p-3">SKS</th>
                          <th className="p-3 text-right">Nilai</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                        {(khsRecords[sem] || []).map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-mono text-slate-400">{item.code}</td>
                            <td className="p-3 font-semibold">{item.course}</td>
                            <td className="p-3">{item.sks} SKS</td>
                            <td className="p-3 text-right font-bold text-indigo-500">{item.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
