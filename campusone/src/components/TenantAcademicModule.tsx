import React, { useState, useEffect, useCallback } from 'react';
import { STUDENT_LIST } from '../mockData';
import { Student, Lecturer, Course } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Award, BookOpen, Clock, Calendar, Plus, Search, Eye, Edit3, Trash2, Check,
  X, ShieldAlert, GraduationCap, ChevronRight, FileText, ArrowRight, Save, Info, Sparkles
} from 'lucide-react';
import { api } from '../api';
import { useToast } from './Toast';

interface TenantAcademicModuleProps {
  currentView: string;
  isDark: boolean;
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const PRODI_LIST = ['Sistem Informasi', 'Teknik Informatika', 'Ekonomi Syariah', 'Hukum Keluarga Islam', 'Pendidikan Guru MI'];
const FAKULTAS_LIST = ['Fakultas Sains & Teknologi', 'Fakultas Ekonomi & Bisnis Islam', 'Fakultas Syariah', 'Fakultas Tarbiyah'];
const RUANGAN_LIST = ['Lab Komputasi A', 'Lab Komputasi B', 'Lab Rekayasa PL', 'R. Seminar FEBI', 'AULA FITK Lt. 3', 'Ruang Peradilan Semu', 'R. Kelas A Lt.2', 'R. Kelas B Lt.3'];

export default function TenantAcademicModule({ currentView, isDark }: TenantAcademicModuleProps) {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>(STUDENT_LIST);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  const fetchAll = useCallback(() => {
    api.getLecturers().then(setLecturers).catch(() => {});
    api.getCourses().then(setCourses).catch(() => {});
    api.getSchedules().then(setSchedules).catch(() => {});
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Student CRUD state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    id: '', nim: '', name: '', email: '', prodi: 'Sistem Informasi', fakultas: 'Fakultas Sains & Teknologi',
    semester: 4, ipk: 3.5, phone: '', address: '', status: 'Aktif' as 'Aktif' | 'Cuti' | 'Lulus' | 'Non-Aktif'
  });

  // Lecturer CRUD state
  const [selectedLecturer, setSelectedLecturer] = useState<any>(null);
  const [showDosenForm, setShowDosenForm] = useState(false);
  const [editingDosen, setEditingDosen] = useState<any>(null);
  const [dosenForm, setDosenForm] = useState({ nip: '', nidn: '', name: '', email: '', prodi: 'Sistem Informasi', fakultas: 'Fakultas Sains & Teknologi', status: 'Aktif' });

  // Course CRUD state
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [courseForm, setCourseForm] = useState({ code: '', name: '', sks: 3, semester: 1, type: 'Wajib', description: '' });

  // Schedule CRUD state
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [scheduleForm, setScheduleForm] = useState({ day: 'Senin', time: '', course: '', lecturer: '', room: '', class: '' });

  const calendarEvents = [
    { date: '1 Juni - 30 Juni 2026', title: 'Pembayaran UKT Semester Ganjil 2026/2027', category: 'Administrasi' },
    { date: '15 Juni - 10 Juli 2026', title: 'Registrasi Ulang Calon Mahasiswa Baru (PMB) Jalur Beasiswa', category: 'PMB' },
    { date: '1 Juli - 15 Juli 2026', title: 'Pengisian KRS Online Online Mahasiswa Aktif', category: 'Akademik' },
    { date: '1 September 2026', title: 'Kuliah Perdana Semester Ganjil TA 2026/2027', category: 'Perkuliahan' },
  ];

  // Lecturer CRUD handlers
  const handleOpenAddDosen = () => {
    setEditingDosen(null);
    setDosenForm({ nip: '', nidn: '', name: '', email: '', prodi: 'Sistem Informasi', fakultas: 'Fakultas Sains & Teknologi', status: 'Aktif' });
    setShowDosenForm(true);
  };

  const handleOpenEditDosen = (d: any) => {
    setEditingDosen(d);
    setDosenForm({ nip: d.nip, nidn: d.nidn, name: d.name, email: d.email, prodi: d.prodi, fakultas: d.fakultas, status: d.status });
    setShowDosenForm(true);
  };

  const handleDeleteDosen = async (id: string) => {
    try { await api.deleteLecturer(id); fetchAll(); if (selectedLecturer?.id === id) setSelectedLecturer(null); }
    catch (e: any) { toast(e.message, 'error'); }
  };

  const handleSaveDosen = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDosen) {
        await api.updateLecturer(editingDosen.id, dosenForm);
      } else {
        const nidn = dosenForm.nidn || dosenForm.nip;
        await api.createLecturer({ ...dosenForm, nidn });
      }
      setShowDosenForm(false);
      setEditingDosen(null);
      fetchAll();
    } catch (err: any) { toast(err.message, 'error'); }
  };

  // Course CRUD handlers
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({ code: '', name: '', sks: 3, semester: 1, type: 'Wajib', description: '' });
    setShowCourseForm(true);
  };

  const handleOpenEditCourse = (c: any) => {
    setEditingCourse(c);
    setCourseForm({ code: c.code, name: c.name, sks: c.sks, semester: c.semester, type: c.type, description: c.description || '' });
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (id: string) => {
    try { await api.deleteCourse(id); fetchAll(); } catch (e: any) { toast(e.message, 'error'); }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.updateCourse(editingCourse.id, courseForm);
      } else {
        await api.createCourse(courseForm);
      }
      setShowCourseForm(false);
      setEditingCourse(null);
      fetchAll();
    } catch (err: any) { toast(err.message, 'error'); }
  };

  // Schedule CRUD handlers
  const handleOpenAddSchedule = () => {
    setEditingSchedule(null);
    setScheduleForm({ day: 'Senin', time: '', course: '', lecturer: '', room: '', class: '' });
    setShowScheduleForm(true);
  };

  const handleOpenEditSchedule = (s: any) => {
    setEditingSchedule(s);
    setScheduleForm({ day: s.day, time: s.time, course: s.course, lecturer: s.lecturer, room: s.room, class: s.class });
    setShowScheduleForm(true);
  };

  const handleDeleteSchedule = async (id: string) => {
    try { await api.deleteSchedule(id); fetchAll(); } catch (e: any) { toast(e.message, 'error'); }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await api.updateSchedule(editingSchedule.id, scheduleForm);
      } else {
        await api.createSchedule(scheduleForm);
      }
      setShowScheduleForm(false);
      setEditingSchedule(null);
      fetchAll();
    } catch (err: any) { toast(err.message, 'error'); }
  };

  // Student CRUD handlers (unchanged from original)
  const handleOpenEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentForm({
      id: student.id, nim: student.nim, name: student.name, email: student.email,
      prodi: student.prodi, fakultas: student.fakultas, semester: student.semester,
      ipk: student.ipk, phone: student.phone, address: student.address, status: student.status
    });
    setIsEditingStudent(true);
  };

  const handleOpenAddStudent = () => {
    const nextNim = '20220801' + String(students.length + 1).padStart(3, '0');
    setStudentForm({
      id: 'S' + String(students.length + 1).padStart(3, '0'), nim: nextNim, name: '', email: '',
      prodi: 'Sistem Informasi', fakultas: 'Fakultas Sains & Teknologi', semester: 1, ipk: 0.0,
      phone: '', address: '', status: 'Aktif'
    });
    setIsAddingStudent(true);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
    if (selectedStudent?.id === id) setSelectedStudent(null);
  };

  const handleSaveStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingStudent) {
      setStudents(students.map(s => {
        if (s.id === studentForm.id) {
          return { ...s, name: studentForm.name, email: studentForm.email, prodi: studentForm.prodi,
            fakultas: ['Sistem Informasi','Teknik Informatika'].includes(studentForm.prodi) ? 'Fakultas Sains & Teknologi' : 'Fakultas Ekonomi & Bisnis Islam',
            semester: Number(studentForm.semester), ipk: Number(studentForm.ipk), phone: studentForm.phone,
            address: studentForm.address, status: studentForm.status };
        } return s;
      }));
      setIsEditingStudent(false); setSelectedStudent(null);
    } else if (isAddingStudent) {
      const added: Student = { id: studentForm.id, nim: studentForm.nim, name: studentForm.name,
        email: studentForm.email, prodi: studentForm.prodi,
        fakultas: ['Sistem Informasi','Teknik Informatika'].includes(studentForm.prodi) ? 'Fakultas Sains & Teknologi' : 'Fakultas Syariah',
        semester: Number(studentForm.semester), ipk: Number(studentForm.ipk), status: 'Aktif',
        phone: studentForm.phone, address: studentForm.address, ips: [3.5],
        academicHistory: [{ semester: 1, sks: 20, ips: Number(studentForm.ipk) || 3.5, status: 'Aktif' }] };
      setStudents([...students, added]);
      setIsAddingStudent(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
    s.nim.includes(searchStudentQuery) ||
    s.prodi.toLowerCase().includes(searchStudentQuery.toLowerCase())
  );

  const formBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200';
  const formInput = isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200';

  return (
    <div className="space-y-6 font-sans">

      {/* OVERVIEW DASHBOARD */}
      {currentView === 'dashboard_campus' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">DASHBOARD INSTITUSI</span>
            <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Kampus Jakarta - AONE SIAKAD</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Mahasiswa Aktif', icon: Users, value: `${students.filter(s => s.status === 'Aktif').length} orang`, sub: `Cuti: ${students.filter(s => s.status === 'Cuti').length} • Lulus: ${students.filter(s => s.status === 'Lulus').length}`, color: 'text-indigo-500' },
              { label: 'Tenaga Dosen', icon: Award, value: `${lecturers.length} orang`, sub: 'Dosen Tetap Nasional (NIDN)', color: 'text-emerald-500' },
              { label: 'Mata Kuliah', icon: BookOpen, value: `${courses.length} MK`, sub: 'Terdaftar Aktif', color: 'text-amber-500' },
              { label: 'Kelas Aktif', icon: Clock, value: `${schedules.length} Sesi`, sub: 'Penugasan ruang kuliah', color: 'text-purple-500' },
              { label: 'Jadwal Kuliah', icon: Calendar, value: 'Hari ini', sub: '5 Sesi Aktif Berjalan', color: 'text-indigo-500' },
            ].map((item, i) => (
              <div key={i} className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-start">
                  <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider">{item.label}</p>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <h3 className="text-2xl font-extrabold mt-3">{item.value}</h3>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border lg:col-span-2 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-sm font-display">Statistik Distribusi Program Studi</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Jumlah persebaran mahasiswa aktif per-prodi.</p>
                </div>
                <span className="w-3 h-3 bg-indigo-500 rounded-full" />
              </div>
              <div className="space-y-4">
                {[
                  { prodi: 'Teknik Informatika', count: 8520, percent: 'w-[85%]', bg: 'bg-indigo-600' },
                  { prodi: 'Sistem Informasi', count: 6420, percent: 'w-[64%]', bg: 'bg-indigo-500' },
                  { prodi: 'Ekonomi Syariah', count: 3200, percent: 'w-[32%]', bg: 'bg-emerald-500' },
                  { prodi: 'Hukum Keluarga Islam', count: 1850, percent: 'w-[18%]', bg: 'bg-amber-500' },
                  { prodi: 'Pendidikan Guru MI', count: 1200, percent: 'w-[12%]', bg: 'bg-rose-500' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">{item.prodi}</span>
                      <span className="font-mono text-slate-400">{item.count.toLocaleString('id-ID')} Mahasiswa</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                      <div className={`h-full ${item.bg} ${item.percent} rounded-full transition-all duration-1000`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <h3 className="font-bold text-sm font-display mb-4">Pengumuman & Task Akademik</h3>
              <div className="space-y-4">
                <div className="p-3 bg-red-500/10 border border-red-500/15 rounded-xl">
                  <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold uppercase tracking-wider mb-1">
                    <ShieldAlert className="w-4 h-4" /> Batas Sinkron PDDIKTI
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400">Pelaporan data mahasiswa semester lalu wajib diselesaikan selambat-lambatnya 15 Juni 2026.</p>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-xl">
                  <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" /> Penetapan Akreditasi
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400">Pusat Jaminan Mutu mengundang rapat Rektorat persiapan reakreditasi Fakultas Syariah.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <h3 className="font-bold text-sm font-display mb-4">Agenda Pembelajaran Aktif Hari Ini</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {schedules.slice(0, 3).map((sched: any) => (
                <div key={sched.id} className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase">{sched.time}</span>
                  <p className="text-xs font-bold mt-1.5 leading-tight">{sched.course}</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">{sched.lecturer}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/80 pt-2.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 font-bold text-indigo-500">{sched.class}</span>
                    <span className="text-[10px] font-mono text-slate-400">{sched.room}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAHASISWA CRUD */}
      {currentView === 'mhs_list' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold font-display tracking-tight">Manajemen Data Mahasiswa</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Daftarkan mahasiswa baru, kelola status akademik, riwayat registrasi, dan her-registrasi.</p>
            </div>
            <button onClick={handleOpenAddStudent} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
              <Plus className="w-4 h-4" /> Tambah Mahasiswa Baru
            </button>
          </div>

          <div className="flex gap-4">
            <div className={`flex-1 relative border rounded-xl overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input type="text" value={searchStudentQuery} onChange={(e) => setSearchStudentQuery(e.target.value)}
                placeholder="Cari mahasiswa berdasarkan NIM, nama lengkap, atau program studi..." className="w-full pl-10 pr-4 py-2.5 bg-transparent outline-none text-xs" />
            </div>
          </div>

          {selectedStudent && (
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}>
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-indigo-600 text-white text-lg font-bold rounded-2xl flex items-center justify-center">{selectedStudent.name.charAt(0)}</div>
                  <div>
                    <h3 className="font-bold text-base font-display">{selectedStudent.name}</h3>
                    <p className="text-xs text-slate-500">NIM: <b className="font-mono text-indigo-500">{selectedStudent.nim}</b> | {selectedStudent.prodi}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenEditStudent(selectedStudent)} className="p-2 border rounded-xl bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 text-xs font-bold">Edit Data</button>
                  <button onClick={() => setSelectedStudent(null)} className="p-2 text-xs font-bold">Tutup [X]</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Informasi Kontak</h4>
                  <p className="text-xs">Email: <b>{selectedStudent.email}</b></p>
                  <p className="text-xs">Telepon: <b>{selectedStudent.phone}</b></p>
                  <p className="text-xs">Alamat: <span className="text-slate-500">{selectedStudent.address}</span></p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Indeks Prestasi</h4>
                  <p className="text-xs">Semester Sekarang: <b>Semester {selectedStudent.semester}</b></p>
                  <p className="text-xs">IPK Kumulatif: <b className="text-emerald-500 font-mono text-sm">{selectedStudent.ipk.toFixed(2)}</b></p>
                  <p className="text-xs">IPS Terakhir: <b>{selectedStudent.ips[selectedStudent.ips.length - 1] || '0.00'}</b></p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Riwayat Registrasi</h4>
                  <div className="space-y-1.5">
                    {selectedStudent.academicHistory.map((h: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-[11px] bg-slate-200/50 dark:bg-zinc-800 p-1.5 px-3 rounded-lg">
                        <span>Sem {h.semester} ({h.sks} SKS)</span>
                        <span className="font-bold text-emerald-500">IPS: {h.ips.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <table className="w-full text-left font-sans">
              <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-900/60 text-zinc-400 border-b border-zinc-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}`}>
                <tr><th className="p-4">NIM</th><th className="p-4">Nama Lengkap</th><th className="p-4">Program Studi</th><th className="p-4">Semester</th><th className="p-4">IPK</th><th className="p-4">Status</th><th className="p-4 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {filteredStudents.map(stud => (
                  <tr key={stud.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/10">
                    <td className="p-4 font-mono font-bold text-slate-400">{stud.nim}</td>
                    <td className="p-4 font-bold">{stud.name}</td>
                    <td className="p-4"><p className="font-semibold">{stud.prodi}</p><p className="text-[10px] text-slate-400">{stud.fakultas}</p></td>
                    <td className="p-4">Semester {stud.semester}</td>
                    <td className="p-4 font-mono font-bold text-indigo-500">{stud.ipk.toFixed(2)}</td>
                    <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stud.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{stud.status}</span></td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => setSelectedStudent(stud)} className={`p-1.5 rounded-lg border ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100'}`}><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleOpenEditStudent(stud)} className={`p-1.5 rounded-lg border ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100'}`}><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteStudent(stud.id)} className="p-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(isEditingStudent || isAddingStudent) && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white text-slate-800'}`}>
                <h3 className="font-display font-bold text-lg mb-4">{isEditingStudent ? 'Edit Biodata Mahasiswa' : 'Penerimaan Mahasiswa Baru Mandiri'}</h3>
                <form onSubmit={handleSaveStudentSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Nama Lengkap</label><input type="text" required placeholder="Masukkan nama lengkap" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 mt-1 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">NIM Kampus</label><input type="text" required value={studentForm.nim} onChange={(e) => setStudentForm({ ...studentForm, nim: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Alamat Email</label><input type="email" required placeholder="fauzi@student.aone-project.id" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">No. Telepon</label><input type="text" required placeholder="0812..." value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Program Studi</label>
                      <select value={studentForm.prodi} onChange={(e) => setStudentForm({ ...studentForm, prodi: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
                        {PRODI_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Status Keaktifan</label>
                      <select value={studentForm.status} onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })} className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
                        <option value="Aktif">Aktif</option><option value="Cuti">Cuti</option><option value="Lulus">Lulus</option><option value="Non-Aktif">Non-Aktif</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Semester</label><input type="number" value={studentForm.semester} onChange={(e) => setStudentForm({ ...studentForm, semester: Number(e.target.value) })} className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Est. IPK Kumulatif</label><input type="number" step="0.01" value={studentForm.ipk} onChange={(e) => setStudentForm({ ...studentForm, ipk: Number(e.target.value) })} className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`} /></div>
                  </div>
                  <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Alamat Tempat Tinggal</label><textarea value={studentForm.address} onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none h-16 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`} /></div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setIsEditingStudent(false); setIsAddingStudent(false); }} className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">Simpan Perubahan</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DOSEN CRUD */}
      {currentView === 'dosen_list' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold font-display tracking-tight">Pusat Tenaga Pengajar (Dosen)</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Kelola data dosen, NIDN, dan status keaktifan.</p>
            </div>
            <button onClick={handleOpenAddDosen} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
              <Plus className="w-4 h-4" /> Tambah Dosen
            </button>
          </div>

          {selectedLecturer && (
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center">L</div>
                  <div>
                    <h3 className="font-bold text-sm font-display">{selectedLecturer.name}</h3>
                    <p className="text-xs text-slate-500">NIDN: {selectedLecturer.nidn} | NIP: {selectedLecturer.nip}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLecturer(null)} className="text-xs font-bold">Tutup [X]</button>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Beban Mengajar Semester Ini</h4>
                <div className="mt-3 space-y-2">
                  {(selectedLecturer.teachingLoads || []).map((load: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs bg-slate-200/50 dark:bg-zinc-800 p-2.5 rounded-lg">
                      <div><p className="font-bold">{load.course}</p><p className="text-[10px] text-slate-500">Kelas: {load.class} • SKS: {load.sks}</p></div>
                      <span className="font-semibold text-emerald-500 self-center">{load.students} Mahasiswa</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lecturers.map((doc: any) => (
              <div key={doc.id} className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] text-indigo-500 font-bold">{doc.nip}</span>
                    <h3 className="font-bold text-sm mt-1">{doc.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{doc.prodi} • {doc.fakultas}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${doc.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{doc.status}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">BEBAN: {(doc.teachingLoads || []).length} KELAS</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setSelectedLecturer(doc)} className="text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">Detail <ChevronRight className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleOpenEditDosen(doc)} className="p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteDosen(doc.id)} className="p-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showDosenForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white text-slate-800'}`}>
                <h3 className="font-display font-bold text-lg mb-4">{editingDosen ? 'Edit Data Dosen' : 'Tambah Dosen Baru'}</h3>
                <form onSubmit={handleSaveDosen} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">NIP</label><input type="text" required value={dosenForm.nip} onChange={(e) => setDosenForm({ ...dosenForm, nip: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 ${formInput}`} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">NIDN</label><input type="text" value={dosenForm.nidn} onChange={(e) => setDosenForm({ ...dosenForm, nidn: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 ${formInput}`} /></div>
                  </div>
                  <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Nama Lengkap</label><input type="text" required value={dosenForm.name} onChange={(e) => setDosenForm({ ...dosenForm, name: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 ${formInput}`} /></div>
                  <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Email</label><input type="email" required value={dosenForm.email} onChange={(e) => setDosenForm({ ...dosenForm, email: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 ${formInput}`} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Program Studi</label>
                      <select value={dosenForm.prodi} onChange={(e) => setDosenForm({ ...dosenForm, prodi: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${formInput}`}>
                        {PRODI_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Fakultas</label>
                      <select value={dosenForm.fakultas} onChange={(e) => setDosenForm({ ...dosenForm, fakultas: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${formInput}`}>
                        {FAKULTAS_LIST.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Status</label>
                    <select value={dosenForm.status} onChange={(e) => setDosenForm({ ...dosenForm, status: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${formInput}`}>
                      <option value="Aktif">Aktif</option><option value="Sabbatical">Sabbatical</option><option value="Pensiun">Pensiun</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setShowDosenForm(false); setEditingDosen(null); }} className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Simpan</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MATA KULIAH CRUD */}
      {currentView === 'kurikulum_list' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold font-display tracking-tight">Kurikulum & Daftar Mata Kuliah</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Arsip rujukan rencana studi, sebaran beban materi perkuliahan, dan kodefikasi PDDIKTI.</p>
            </div>
            <button onClick={handleOpenAddCourse} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
              <Plus className="w-4 h-4" /> Tambah Mata Kuliah
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((c: any) => (
              <div key={c.id} className={`p-5 rounded-2xl border relative ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
                <span className="font-mono text-[10px] font-bold text-slate-400">{c.code}</span>
                <h3 className="font-bold text-sm mt-1 leading-tight">{c.name}</h3>
                <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">{c.description || '-'}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="text-[10px] font-bold text-indigo-500 space-x-2">
                    <span>Sem {c.semester}</span><span>{c.sks} SKS</span><span>{c.type}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenEditCourse(c)} className="p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800"><Edit3 className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteCourse(c.id)} className="p-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10"><Trash2 className="w-3 h-3 text-rose-500" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showCourseForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white text-slate-800'}`}>
                <h3 className="font-display font-bold text-lg mb-4">{editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}</h3>
                <form onSubmit={handleSaveCourse} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Kode MK</label><input type="text" required value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 ${formInput}`} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Nama Mata Kuliah</label><input type="text" required value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 ${formInput}`} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">SKS</label><input type="number" min={1} max={6} value={courseForm.sks} onChange={(e) => setCourseForm({ ...courseForm, sks: Number(e.target.value) })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 ${formInput}`} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Semester</label><input type="number" min={1} max={14} value={courseForm.semester} onChange={(e) => setCourseForm({ ...courseForm, semester: Number(e.target.value) })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 ${formInput}`} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Tipe</label>
                      <select value={courseForm.type} onChange={(e) => setCourseForm({ ...courseForm, type: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${formInput}`}>
                        <option value="Wajib">Wajib</option><option value="Pilihan">Pilihan</option>
                      </select>
                    </div>
                  </div>
                  <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Deskripsi</label><textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 h-20 ${formInput}`} /></div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setShowCourseForm(false); setEditingCourse(null); }} className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold">Simpan</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* JADWAL CRUD */}
      {currentView === 'jadwal_list' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold font-display tracking-tight">Alokasi Kelas & Jadwal Pekanan</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Rapat penugasan sebaran jam ruang, sarana lab komputasi, dan fungsional tatap muka akademik.</p>
            </div>
            <button onClick={handleOpenAddSchedule} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
              <Plus className="w-4 h-4" /> Tambah Jadwal
            </button>
          </div>

          <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <table className="w-full text-left font-sans">
              <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-900/60 text-zinc-400 border-b border-zinc-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}`}>
                <tr><th className="p-4">Hari / Waktu</th><th className="p-4">Mata Kuliah</th><th className="p-4">Dosen Pengampu</th><th className="p-4">Ruangan</th><th className="p-4">Kelas</th><th className="p-4 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {schedules.map((sched: any) => (
                  <tr key={sched.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/10">
                    <td className="p-4 font-bold"><p>{sched.day}</p><p className="text-[10px] text-slate-400 mt-0.5">{sched.time}</p></td>
                    <td className="p-4 font-semibold">{sched.course}</td>
                    <td className="p-4">{sched.lecturer}</td>
                    <td className="p-4 font-mono text-indigo-500">{sched.room}</td>
                    <td className="p-4 font-bold text-slate-400">{sched.class}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => handleOpenEditSchedule(sched)} className={`p-1.5 rounded-lg border ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100'}`}><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteSchedule(sched.id)} className="p-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showScheduleForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white text-slate-800'}`}>
                <h3 className="font-display font-bold text-lg mb-4">{editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h3>
                <form onSubmit={handleSaveSchedule} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Hari</label>
                      <select value={scheduleForm.day} onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 ${formInput}`}>
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Waktu</label><input type="text" required placeholder="08:00-10:30" value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 ${formInput}`} /></div>
                  </div>
                  <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Mata Kuliah</label>
                    <select value={scheduleForm.course} onChange={(e) => setScheduleForm({ ...scheduleForm, course: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 ${formInput}`}>
                      <option value="">-- Pilih MK --</option>
                      {courses.map((c: any) => <option key={c.id} value={c.name}>{c.code} - {c.name}</option>)}
                    </select>
                  </div>
                  <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Dosen Pengampu</label>
                    <select value={scheduleForm.lecturer} onChange={(e) => setScheduleForm({ ...scheduleForm, lecturer: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 ${formInput}`}>
                      <option value="">-- Pilih Dosen --</option>
                      {lecturers.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Ruangan</label>
                      <select value={scheduleForm.room} onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 ${formInput}`}>
                        <option value="">-- Pilih Ruang --</option>
                        {RUANGAN_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Kelas</label><input type="text" required placeholder="IF-A" value={scheduleForm.class} onChange={(e) => setScheduleForm({ ...scheduleForm, class: e.target.value })} className={`w-full p-2.5 rounded-xl border text-xs outline-none mt-1 ${formInput}`} /></div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setShowScheduleForm(false); setEditingSchedule(null); }} className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">Simpan</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KALENDER AKADEMIK */}
      {currentView === 'kalender_akademik' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-2xl font-bold font-display tracking-tight">Kalender Kegiatan Akademik (Ganjil)</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Agenda terstruktur pembagian administrasi keuangan, PMB, pengisian Kartu KRS, dan perkuliahan.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {calendarEvents.map((evt, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
                  <div>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-500 font-bold px-2 py-0.5 rounded-full">{evt.category}</span>
                    <h3 className="font-bold text-xs mt-2">{evt.title}</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono text-right ml-4">{evt.date}</p>
                </div>
              ))}
            </div>
            <div className={`p-6 rounded-2xl border flex flex-col justify-center text-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <Calendar className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
              <h3 className="font-bold text-sm font-display mb-1">Mulai Semester Depan</h3>
              <p className="text-xs text-slate-400">Semua administrasi pembayaran UKT dan pengisian KRS dilakukan digital penuh di aplikasi portal mahasiswa.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
