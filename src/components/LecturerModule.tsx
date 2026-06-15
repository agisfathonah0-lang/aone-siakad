import React, { useState, useEffect } from 'react';
import { STUDENT_LIST } from '../mockData';
import { Student } from '../types';
import { motion } from 'motion/react';
import {
  Calendar, Check, UserCheck, Eye, Edit3, ClipboardList, Save, Sparkles,
  AlertCircle, ChevronRight, BookOpen, Clock, FileCheck, LogIn, LogOut,
  History, BarChart3, MapPin, BadgeCheck, X, RefreshCw
} from 'lucide-react';
import { api } from '../api';

interface LecturerModuleProps {
  currentView: string;
  isDark: boolean;
}

export default function LecturerModule({ currentView, isDark }: LecturerModuleProps) {
  // Mock Lecturer Context
  const schedules = [
    { id: 'SC001', day: 'Senin', time: '08:00 - 10:30', course: 'Kecerdasan Buatan', room: 'Lab Komputasi A', class: 'IF-A', studentsCount: 44 },
    { id: 'SC005', day: 'Kamis', time: '13:00 - 15:30', course: 'Pemrograman Web Enterprise', room: 'Lab RPL', class: 'IF-B', studentsCount: 42 }
  ];

  // Attendance clicker states
  const [selectedScheduleForPresensi, setSelectedScheduleForPresensi] = useState<string | null>(null);
  const [attendanceList, setAttendanceList] = useState<Record<string, 'HADIR' | 'ALFA' | 'IZIN'>>({
    'S001': 'HADIR', 'S002': 'HADIR', 'S003': 'IZIN', 'S004': 'HADIR', 'S005': 'ALFA'
  });
  const [presensiFeedback, setPresensiFeedback] = useState('');

  // Sesi Pertemuan Input
  const [sessionTopic, setSessionTopic] = useState('Pembahasan Algoritma Multi-Layer Perceptron');
  const [sessionNumber, setSessionNumber] = useState(10);

  // Grades entry state
  const [selectedClassForGrade, setSelectedClassForGrade] = useState<string | null>(null);
  const [studentGrades, setStudentGrades] = useState<Record<string, { tugas: number; uts: number; uas: number }>>({
    'S001': { tugas: 90, uts: 85, uas: 88 },
    'S002': { tugas: 80, uts: 78, uas: 83 },
    'S003': { tugas: 95, uts: 92, uas: 96 },
    'S004': { tugas: 85, uts: 80, uas: 82 },
    'S005': { tugas: 0, uts: 0, uas: 0 } // cuti
  });
  const [gradeFeedback, setGradeFeedback] = useState('');

  const handleToggleAttendance = (studentId: string, status: 'HADIR' | 'ALFA' | 'IZIN') => {
    setAttendanceList({
      ...attendanceList,
      [studentId]: status
    });
  };

  const handleSaveAttendance = () => {
    setPresensiFeedback('Presensi Kehadiran berhasil disimpan dan disingkronkan ke database lokal!');
    setTimeout(() => {
      setPresensiFeedback('');
      setSelectedScheduleForPresensi(null);
    }, 1500);
  };

  const handleUpdateGrade = (studentId: string, field: 'tugas' | 'uts' | 'uas', val: number) => {
    if (val < 0 || val > 100) return;
    setStudentGrades({
      ...studentGrades,
      [studentId]: {
        ...studentGrades[studentId],
        [field]: val
      }
    });
  };

  const calculateGradeLabel = (scores: { tugas: number; uts: number; uas: number }) => {
    const total = (scores.tugas * 0.3) + (scores.uts * 0.3) + (scores.uas * 0.4);
    if (total >= 85) return { label: 'A', color: 'text-emerald-500' };
    if (total >= 75) return { label: 'B+', color: 'text-indigo-500' };
    if (total >= 65) return { label: 'B', color: 'text-indigo-600' };
    if (total >= 50) return { label: 'C', color: 'text-amber-500' };
    return { label: 'E', color: 'text-rose-500' };
  };

  const handleSaveGrades = () => {
    setGradeFeedback('Nilai Gradebook kelas berhasil diperbarui dan dikirim ke evaluasi KRS!');
    setTimeout(() => {
      setGradeFeedback('');
      setSelectedClassForGrade(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* JADWAL & ATTENDANCE CLICKER */}
      {currentView === 'dosen_jadwal' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">PANEL PENGAJARAN DOSEN</span>
            <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Jadwal Mengajar & Berita Acara Presensi</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Silakan klik salah satu jadwal kelas aktif di bawah untuk melakukan presensi kehadiran mahasiswa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((sched) => (
              <div key={sched.id} className={`p-5 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-bold uppercase">{sched.time}</span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{sched.room}</span>
                  </div>
                  <h3 className="font-bold text-base font-display mt-3">{sched.course}</h3>
                  <p className="text-xs text-indigo-500 font-bold mt-1">Kelas {sched.class} • {sched.studentsCount} Mahasiswa</p>
                </div>
                
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-bold">MUTU: {sched.day}</span>
                  <button
                    onClick={() => setSelectedScheduleForPresensi(sched.id)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    Buka Presensi
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Presensi Student Clicker Box */}
          {selectedScheduleForPresensi && (
            <div className={`p-6 rounded-2xl border relative ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
              <button
                onClick={() => setSelectedScheduleForPresensi(null)}
                className="absolute right-4 top-4 hover:opacity-70 text-xs font-bold"
              >
                Kembali [X]
              </button>
              
              <div className="mb-6">
                <h3 className="font-bold text-sm font-display mb-1">Berita Acara & Presensi Kelas</h3>
                <p className="text-xs text-indigo-500">Mata Kuliah: {schedules.find(s => s.id === selectedScheduleForPresensi)?.course} ({schedules.find(s => s.id === selectedScheduleForPresensi)?.class})</p>
              </div>

              {presensiFeedback && (
                <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 rounded-lg text-xs font-semibold">
                  {presensiFeedback}
                </div>
              )}

              {/* Form bap inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Tema/Pembahasan Pertemuan</label>
                  <input
                    type="text"
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none focus:border-indigo-500 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Pertemuan Ke-</label>
                  <input
                    type="number"
                    value={sessionNumber}
                    onChange={(e) => setSessionNumber(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none focus:border-indigo-500 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'}`}
                  />
                </div>
              </div>

              {/* Attendance student toggles */}
              <div className="border border-slate-200/60 dark:border-zinc-800 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-left font-sans">
                  <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-900/60 text-zinc-400 border-b border-zinc-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}`}>
                    <tr>
                      <th className="p-3">NIM</th>
                      <th className="p-3">Nama Mahasiswa</th>
                      <th className="p-3">Prodi</th>
                      <th className="p-3 text-right">Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-850 text-xs">
                    {STUDENT_LIST.map((student) => {
                      const currentStatus = attendanceList[student.id] || 'HADIR';
                      return (
                        <tr key={student.id}>
                          <td className="p-3 font-mono text-slate-400">{student.nim}</td>
                          <td className="p-3 font-bold">{student.name}</td>
                          <td className="p-3 text-slate-500">{student.prodi}</td>
                          <td className="p-3 text-right">
                            <div className="inline-flex gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
                              {(['HADIR', 'IZIN', 'ALFA'] as const).map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleToggleAttendance(student.id, opt)}
                                  className={`px-2 py-1 rounded text-[9px] font-bold transition duration-150 ${currentStatus === opt ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedScheduleForPresensi(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Simpan Presensi
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ABSEN DOSEN */}
      {currentView === 'dosen_absen' && (
        <DosenAbsen isDark={isDark} />
      )}

      {/* INPUT NILAI (GRADEBOOK) */}
      {currentView === 'dosen_grades' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">DASHBOARD NILAI MAHASISWA</span>
            <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Pusat Input & Rekap Nilai Evaluasi (Gradebook)</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Pilih modul kelas kuliah di bawah untuk menginput bobot nilai UTS, UAS, dan tugas terstruktur.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((sched) => (
              <div
                key={sched.id}
                onClick={() => setSelectedClassForGrade(sched.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition ${selectedClassForGrade === sched.id ? 'border-indigo-600 bg-indigo-50/10 dark:border-indigo-500' : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50'}`}
              >
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-indigo-600">{sched.class}</span>
                  <span className="font-mono text-[10px] font-bold text-slate-400">{sched.room}</span>
                </div>
                <h3 className="font-bold text-sm mt-3">{sched.course}</h3>
                <p className="text-[10px] text-slate-400 mt-1">SKS: 3 SKS • Evaluator: Dosen Utama</p>
              </div>
            ))}
          </div>

          {selectedClassForGrade && (
            <div className={`p-6 rounded-2xl border relative ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
              <button
                onClick={() => setSelectedClassForGrade(null)}
                className="absolute right-4 top-4 hover:opacity-75 text-xs font-bold"
              >
                Kembali [X]
              </button>

              <div className="mb-6">
                <h3 className="font-bold text-sm font-display mb-1">Evaluasi Gradebook Kelas</h3>
                <p className="text-xs text-indigo-500">Mata Kuliah: {schedules.find(s => s.id === selectedClassForGrade)?.course}</p>
              </div>

              {gradeFeedback && (
                <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 rounded-lg text-xs font-semibold">
                  {gradeFeedback}
                </div>
              )}

              {/* Grades sheet spreadsheet mock */}
              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-left text-xs font-sans">
                  <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-900/60 text-zinc-400 border-b border-zinc-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}`}>
                    <tr>
                      <th className="p-3">Nama Mahasiswa</th>
                      <th className="p-3">Tugas (30%)</th>
                      <th className="p-3">UTS (30%)</th>
                      <th className="p-3">UAS (40%)</th>
                      <th className="p-3 text-right">Grade Huruf</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                    {STUDENT_LIST.map((student) => {
                      const scores = studentGrades[student.id] || { tugas: 0, uts: 0, uas: 0 };
                      const gradeObj = calculateGradeLabel(scores);
                      return (
                        <tr key={student.id}>
                          <td className="p-3">
                            <p className="font-bold">{student.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{student.nim}</p>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={scores.tugas}
                              onChange={(e) => handleUpdateGrade(student.id, 'tugas', Number(e.target.value))}
                              className={`w-16 p-1.5 text-center font-bold font-mono border rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'}`}
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={scores.uts}
                              onChange={(e) => handleUpdateGrade(student.id, 'uts', Number(e.target.value))}
                              className={`w-16 p-1.5 text-center font-bold font-mono border rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'}`}
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={scores.uas}
                              onChange={(e) => handleUpdateGrade(student.id, 'uas', Number(e.target.value))}
                              className={`w-16 p-1.5 text-center font-bold font-mono border rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'}`}
                            />
                          </td>
                          <td className="p-3 text-right">
                            <span className={`font-extrabold text-sm ${gradeObj.color}`}>{gradeObj.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedClassForGrade(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveGrades}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan & Rilis Nilai Nilai
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}

function DosenAbsen({ isDark }: { isDark: boolean }) {
  const [nip, setNip] = useState('198912152015042004');
  const [dosenName, setDosenName] = useState('Dr. Rina Kartika, M.T.');
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [rekap, setRekap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [activeTab, setActiveTab] = useState<'checkin' | 'history' | 'rekap'>('checkin');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const dosenProfiles = [
    { nip: '198912152015042004', name: 'Dr. Rina Kartika, M.T.', prodi: 'Teknik Informatika' },
    { nip: '197805122004121001', name: 'Dr. Ahmad Syukri, M.Ag.', prodi: 'Hukum Keluarga Islam' },
    { nip: '198210202008102002', name: 'Dr. Nurhayati, M.Pd.', prodi: 'PGMI' },
    { nip: '198504032012011003', name: 'Dr. Muhammad Fadli, M.E.I.', prodi: 'Ekonomi Syariah' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attendanceData, summaryData, rekapData] = await Promise.all([
        api.getAttendance({ nip }),
        api.getAttendanceSummary(),
        api.getAttendanceRekap(selectedMonth),
      ]);
      setHistory(attendanceData);
      setSummary(summaryData);
      setRekap(rekapData);
      const today = new Date().toISOString().slice(0, 10);
      const todayRec = attendanceData.find((r: any) => r.date === today);
      setTodayStatus(todayRec || null);
      if (todayRec) {
        setCheckInTime(todayRec.checkIn || '');
        setCheckOutTime(todayRec.checkOut || '');
      }
    } catch (err: any) {
      setMessage(err.message || 'Gagal memuat data');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [nip, selectedMonth]);

  const handleCheckin = async () => {
    try {
      const res = await api.checkinAttendance({ nip, name: dosenName });
      setMessage(res.message);
      setMessageType('success');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Gagal check-in');
      setMessageType('error');
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await api.checkoutAttendance({ nip });
      setMessage(res.message);
      setMessageType('success');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Gagal check-out');
      setMessageType('error');
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      HADIR: { label: 'Hadir', color: 'bg-emerald-500 text-white' },
      IZIN: { label: 'Izin', color: 'bg-amber-500 text-white' },
      SAKIT: { label: 'Sakit', color: 'bg-rose-500 text-white' },
      ALFA: { label: 'Alfa', color: 'bg-red-600 text-white' },
      BELUM_ABSEN: { label: 'Belum Absen', color: 'bg-slate-400 text-white' },
    };
    const m = map[status] || { label: status, color: 'bg-slate-300 text-white' };
    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${m.color}`}>{m.label}</span>;
  };

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-zinc-900">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono tracking-widest">ABSENSI DOSEN</span>
          <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Presensi Kehadiran Dosen</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Check-in / Check-out harian dan riwayat kehadiran dosen</p>
        </div>
        <select
          value={nip}
          onChange={(e) => {
            const profile = dosenProfiles.find(p => p.nip === e.target.value);
            setNip(e.target.value);
            setDosenName(profile?.name || '');
          }}
          className={`p-2 rounded-xl border text-xs outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'}`}
        >
          {dosenProfiles.map(p => (
            <option key={p.nip} value={p.nip}>{p.name}</option>
          ))}
        </select>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${messageType === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'}`}>
          <span>{messageType === 'success' ? '✓ ' : '✕ '}{message}</span>
          <button onClick={() => setMessage('')} className="hover:opacity-70"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Dosen', value: summary.total, color: 'text-slate-900 dark:text-white' },
            { label: 'Hadir Hari Ini', value: summary.hadir, color: 'text-emerald-500' },
            { label: 'Izin', value: summary.izin, color: 'text-amber-500' },
            { label: 'Sakit', value: summary.sakit, color: 'text-rose-500' },
            { label: 'Belum Absen', value: summary.belumAbsen, color: 'text-slate-400' },
          ].map((s, i) => (
            <div key={i} className={`p-3 rounded-xl border text-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-slate-400 font-semibold uppercase mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 border-b border-slate-200 dark:border-zinc-800">
        {[
          { key: 'checkin', label: 'Check-in/out', icon: LogIn },
          { key: 'history', label: 'Riwayat', icon: History },
          { key: 'rekap', label: 'Rekap Bulanan', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === tab.key
                ? 'border-indigo-500 text-indigo-500'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
        <button onClick={fetchData} className="ml-auto px-3 py-2 text-xs text-slate-400 hover:text-indigo-500">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {activeTab === 'checkin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} space-y-5`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm font-display flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-500" />
                Absen Hari Ini
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">{today}</span>
            </div>

            <div className={`p-4 rounded-xl border text-center space-y-3 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto">
                <UserCheck className={`w-7 h-7 ${todayStatus?.checkIn ? 'text-emerald-500' : 'text-indigo-400'}`} />
              </div>
              <div>
                <p className="font-bold text-sm">{dosenName}</p>
                <p className="text-[10px] text-slate-400 font-mono">NIP: {nip}</p>
              </div>
              {todayStatus && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10">
                  {statusBadge(todayStatus.status)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <Clock className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <p className="text-[9px] text-slate-400 uppercase font-bold">Check-in</p>
                <p className={`font-mono font-extrabold text-sm ${checkInTime ? 'text-emerald-500' : 'text-slate-300'}`}>
                  {checkInTime || '--:--'}
                </p>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <LogOut className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="text-[9px] text-slate-400 uppercase font-bold">Check-out</p>
                <p className={`font-mono font-extrabold text-sm ${checkOutTime ? 'text-amber-500' : 'text-slate-300'}`}>
                  {checkOutTime || '--:--'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheckin}
                disabled={!!checkInTime}
                className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-40 ${
                  checkInTime
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                }`}
              >
                <LogIn className="w-4 h-4" />
                {checkInTime ? 'Sudah Check-in' : 'Check-in Sekarang'}
              </button>
              <button
                onClick={handleCheckout}
                disabled={!checkInTime || !!checkOutTime}
                className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-40 ${
                  checkOutTime
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                    : checkInTime
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <LogOut className="w-4 h-4" />
                {checkOutTime ? 'Sudah Check-out' : 'Check-out'}
              </button>
            </div>

            {todayStatus?.note && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border text-xs text-slate-500">
                <span className="font-bold">Catatan: </span>{todayStatus.note}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm font-display flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-500" />
              Rekap Kehadiran Bulan Ini
            </h3>
            {rekap.filter((r: any) => r.lecturerNip === nip).map((r: any) => (
              <div key={r.lecturerNip} className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-sm">{r.lecturerName}</span>
                  <span className="text-[10px] text-slate-400">Total: {r.total} hari</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Hadir', value: r.hadir, pct: r.total > 0 ? Math.round(r.hadir / r.total * 100) : 0, color: 'bg-emerald-500' },
                    { label: 'Izin', value: r.izin, pct: r.total > 0 ? Math.round(r.izin / r.total * 100) : 0, color: 'bg-amber-500' },
                    { label: 'Sakit', value: r.sakit, pct: r.total > 0 ? Math.round(r.sakit / r.total * 100) : 0, color: 'bg-rose-500' },
                    { label: 'Alfa', value: r.alfa, pct: r.total > 0 ? Math.round(r.alfa / r.total * 100) : 0, color: 'bg-red-600' },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="text-lg font-extrabold">{s.value}</p>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-950 text-zinc-400 border-b border-zinc-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}`}>
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Check-in</th>
                  <th className="p-3">Check-out</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Mata Kuliah</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {history.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="p-3 font-mono font-bold">{r.date}</td>
                    <td className="p-3 font-mono">{r.checkIn || '-'}</td>
                    <td className="p-3 font-mono">{r.checkOut || '-'}</td>
                    <td className="p-3">{statusBadge(r.status)}</td>
                    <td className="p-3 text-slate-500">{r.course || '-'}</td>
                    <td className="p-3 text-slate-500">{r.class || '-'}</td>
                    <td className="p-3 text-slate-400 max-w-[200px] truncate">{r.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rekap' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`p-2 rounded-xl border text-xs outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'}`}
            />
          </div>
          <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-950 text-zinc-400 border-b border-zinc-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}`}>
                  <tr>
                    <th className="p-3">Nama Dosen</th>
                    <th className="p-3 text-center">Total</th>
                    <th className="p-3 text-center">Hadir</th>
                    <th className="p-3 text-center">Izin</th>
                    <th className="p-3 text-center">Sakit</th>
                    <th className="p-3 text-center">Alfa</th>
                    <th className="p-3 text-center">% Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {rekap.map((r: any) => (
                    <tr key={r.lecturerNip} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                      <td className="p-3 font-bold">{r.lecturerName}</td>
                      <td className="p-3 text-center">{r.total}</td>
                      <td className="p-3 text-center">
                        <span className="text-emerald-500 font-bold">{r.hadir}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-amber-500 font-bold">{r.izin}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-rose-500 font-bold">{r.sakit}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-red-600 font-bold">{r.alfa}</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`font-extrabold ${r.total > 0 && r.hadir / r.total >= 0.8 ? 'text-emerald-500' : r.total > 0 && r.hadir / r.total >= 0.6 ? 'text-amber-500' : 'text-rose-500'}`}>
                            {r.total > 0 ? Math.round(r.hadir / r.total * 100) : 0}%
                          </span>
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full">
                            <div
                              className={`h-full rounded-full ${r.total > 0 && r.hadir / r.total >= 0.8 ? 'bg-emerald-500' : r.total > 0 && r.hadir / r.total >= 0.6 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${r.total > 0 ? Math.round(r.hadir / r.total * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
