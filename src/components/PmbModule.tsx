import React, { useState, useEffect } from 'react';
import { PMB_APPLICANTS } from '../mockData';
import { PMBApplicant, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Laptop, CheckCircle2, Circle, Clock, ClipboardList, CreditCard,
  BookOpen, Star, Sparkles, Send, FileCheck, Award, MessageSquare, Printer, Phone,
  ChevronRight, Calendar, UserCheck, ShieldCheck, AlertCircle, RefreshCw, UploadCloud, FileText, Check
} from 'lucide-react';

interface PmbModuleProps {
  currentView: string;
  isDark: boolean;
  user?: User;
}

export default function PmbModule({ currentView, isDark, user }: PmbModuleProps) {
  // Candidate pool synchronized with shared mock data
  const [candidates, setCandidates] = useState<PMBApplicant[]>(PMB_APPLICANTS);
  const [selectedCandidate, setSelectedCandidate] = useState<PMBApplicant | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Synchronize candidates on mount/updates
  useEffect(() => {
    setCandidates([...PMB_APPLICANTS]);
  }, [currentView]);

  // Active step selection state for applicant portal
  const [activeStepIndex, setActiveStepIndex] = useState<number>(2); // Default on Biodata step for new ones

  // Applicant interactive states
  const isBayu = user?.name === 'Bayu Nugroho' || user?.email === 'bayu.nugroho@gmail.com';
  
  const [fatherName, setFatherName] = useState<string>(isBayu ? 'Suryadi Nugroho' : '');
  const [motherName, setMotherName] = useState<string>(isBayu ? 'Siti Aminah' : '');
  const [fatherJob, setFatherJob] = useState<string>(isBayu ? 'PNS Kemenkeu RI' : '');
  const [isBiodataSaved, setIsBiodataSaved] = useState<boolean>(isBayu);

  const [schoolName, setSchoolName] = useState<string>(isBayu ? 'SMAN 8 Jakarta' : '');
  const [schoolGpa, setSchoolGpa] = useState<number>(isBayu ? 89.5 : 0);
  const [isSchoolSaved, setIsSchoolSaved] = useState<boolean>(isBayu);

  const [uploadedDocName, setUploadedDocName] = useState<string>(isBayu ? 'KTP_FOTO_BAYU_LARIS.zip' : '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [isFeePaid, setIsFeePaid] = useState<boolean>(isBayu);
  const [isCbtTestSubmitted, setIsCbtTestSubmitted] = useState<boolean>(isBayu);
  const [cbtScore, setCbtScore] = useState<number | undefined>(isBayu ? 85 : undefined);
  const [cbtAnswers, setCbtAnswers] = useState<Record<number, string>>({});

  const [isInterviewSubmitted, setIsInterviewSubmitted] = useState<boolean>(isBayu);
  const [interviewAnswer, setInterviewAnswer] = useState<string>(isBayu ? 'Sangat Termotivasi' : '');

  const [isUktPaid, setIsUktPaid] = useState<boolean>(false);
  const [assignedNim, setAssignedNim] = useState<string>('');

  // Auto focus step 9 when candidate solves all preconditions
  useEffect(() => {
    if (isBiodataSaved && isSchoolSaved && uploadedDocName && isFeePaid && isCbtTestSubmitted && isInterviewSubmitted) {
      if (activeStepIndex < 8) {
        setActiveStepIndex(8); // Automatically shift to Kelulusan/SK Letter step
      }
    }
  }, [isBiodataSaved, isSchoolSaved, uploadedDocName, isFeePaid, isCbtTestSubmitted, isInterviewSubmitted]);

  // 10 Steps validation mapper
  const getStepStatus = (index: number) => {
    if (index === 0) return 'Lolos'; // SSO account creation is done
    if (index === 1) return 'Lolos'; // Email verification is done
    if (index === 2) return isBiodataSaved ? 'Lolos' : (activeStepIndex === 2 ? 'Aktif' : 'Pending');
    if (index === 3) {
      if (!isBiodataSaved) return 'Pending';
      return isSchoolSaved ? 'Lolos' : (activeStepIndex === 3 ? 'Aktif' : 'Pending');
    }
    if (index === 4) {
      if (!isSchoolSaved) return 'Pending';
      return uploadedDocName ? 'Lolos' : (activeStepIndex === 4 ? 'Aktif' : 'Pending');
    }
    if (index === 5) {
      if (!uploadedDocName) return 'Pending';
      return isFeePaid ? 'Lolos' : (activeStepIndex === 5 ? 'Aktif' : 'Pending');
    }
    if (index === 6) {
      if (!isFeePaid) return 'Pending';
      return isCbtTestSubmitted ? 'Lolos' : (activeStepIndex === 6 ? 'Aktif' : 'Pending');
    }
    if (index === 7) {
      if (!isCbtTestSubmitted) return 'Pending';
      return isInterviewSubmitted ? 'Lolos' : (activeStepIndex === 7 ? 'Aktif' : 'Pending');
    }
    if (index === 8) {
      if (!isInterviewSubmitted) return 'Pending';
      return isUktPaid ? 'Lolos' : (activeStepIndex === 8 ? 'Aktif' : 'Pending');
    }
    if (index === 9) {
      if (isUktPaid) return 'Lolos';
      return isUktPaid ? 'Lolos' : (activeStepIndex === 9 ? 'Aktif' : 'Pending');
    }
    return 'Pending';
  };

  const portalSteps = [
    { title: 'Registrasi Akun SSO', desc: 'Pembuatan akun SSO terintegrasi sistem Cloud.' },
    { title: 'Verifikasi Email Terdaftar', desc: 'Aktivasi security token via login pendaftar.' },
    { title: 'Biodata Diri & Orang Tua', desc: 'Sertifikasi informasi legal kependudukan.' },
    { title: 'Riwayat & Nilai Sekolah', desc: 'Input GPA sekolah asal & raport kelulusan.' },
    { title: 'Upload Dokumen Legal', desc: 'Melampirkan scan KTP, Ijazah, dan Pasfoto.' },
    { title: 'Pembayaran Uang Seleksi', desc: 'Kontribusi biaya administrasi Rp 350.000.' },
    { title: 'Tes Potensi Akademik CBT', desc: 'Ujian seleksi berbasis komputer real-time.' },
    { title: 'Wawancara Kebangsaan', desc: 'Klarifikasi motivasi & komitmen akademis.' },
    { title: 'Pengumuman SK Admisi', desc: 'Surat Keputusan Rektorat & nominal ukt.' },
    { title: 'Daftar Ulang & Klaim NIM', desc: 'Pembayaran UKT semester 1 & rilis Nomor NIM.' }
  ];

  // Callback to update state for admins
  const handleUpdateCandidateStatus = (id: string, newStatus: PMBApplicant['status']) => {
    const updated = PMB_APPLICANTS.map(c => {
      if (c.id === id) {
        return { ...c, status: newStatus };
      }
      return c;
    });
    // Mutate global mock array
    PMB_APPLICANTS.length = 0;
    PMB_APPLICANTS.push(...updated);
    
    setCandidates([...updated]);
    if (selectedCandidate?.id === id) {
      setSelectedCandidate({ ...selectedCandidate, status: newStatus });
    }
  };

  const handleCandidateScoreChange = (id: string, score: number) => {
    const updated = PMB_APPLICANTS.map(c => {
      if (c.id === id) return { ...c, score };
      return c;
    });
    // Mutate global mock array
    PMB_APPLICANTS.length = 0;
    PMB_APPLICANTS.push(...updated);

    setCandidates([...updated]);
    if (selectedCandidate?.id === id) {
      setSelectedCandidate({ ...selectedCandidate, score });
    }
  };

  // Upload simulation
  const handleUploadClick = () => {
    setIsUploading(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedDocName('DOK_PMB_' + (user?.name || 'GENERIC').toUpperCase().replace(/ /g, '_') + '_VERIFIED.zip');
          return 100;
        }
        return prev + 30;
      });
    }, 300);
  };

  // Mock quiz answers
  const handleCbtQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let score = 0;
    if (cbtAnswers[1] === 'B') score += 33;
    if (cbtAnswers[2] === 'B') score += 34;
    if (cbtAnswers[3] === 'B') score += 33;

    setCbtScore(score);
    setIsCbtTestSubmitted(true);
    
    // Add real score to mock array as well
    const matched = PMB_APPLICANTS.find(x => x.email === user?.email);
    if (matched) {
      matched.score = score;
      matched.status = 'Wawancara';
    }
  };

  // Interview response
  const handleInterviewSubmit = () => {
    setIsInterviewSubmitted(true);
    
    const matched = PMB_APPLICANTS.find(x => x.email === user?.email);
    if (matched) {
      matched.status = 'Lolos';
      matched.wawancaraNote = 'Calon mahasiswa menunjukkan integritas tinggi dan visi akademik terstruktur.';
    }
  };

  // Re-registration & UKT Payment
  const handlePayUktSemester = () => {
    setIsUktPaid(true);
    const mintedNim = '2026' + String(Math.floor(100000 + Math.random() * 900000));
    setAssignedNim(mintedNim);

    // Update global PMB listing
    const matched = PMB_APPLICANTS.find(x => x.email === user?.email);
    if (matched) {
      matched.status = 'Daftar Ulang';
      matched.pembayaranStatus = 'Lunas';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* PERSPECTIVE A: APPLICANT PORTAL JOURNEY */}
      {currentView === 'pmb_portal_steps' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-zinc-900">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-500 font-mono tracking-widest">PORTAL CALON MAHASISWA BARU 2026</span>
              <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Alur Seleksi Penerimaan Universitas</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Selamat datang, <strong className="text-slate-800 dark:text-zinc-100">{user?.name}</strong>. Ikuti 10 tahapan interaktif di bawah untuk resmi terdaftar.</p>
            </div>
            
            {/* Applicant brief credentials badge */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                {(user?.name || 'C').charAt(0)}
              </div>
              <div className="text-left font-mono">
                <p className="text-[10px] text-slate-400 leading-none">NO. SELEKSI REGISTRASI</p>
                <p className="text-xs font-bold text-emerald-600 mt-1">PMB26{user?.id ? user.id.slice(-4) : '3104'}</p>
              </div>
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
                className="text-rose-450 hover:text-rose-500 font-extrabold uppercase text-[10px]"
              >
                Tutup [X]
              </button>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
              <button 
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-450 hover:text-emerald-500 font-extrabold uppercase text-[10px]"
              >
                Tutup [X]
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 10-step list navigation */}
            <div className="lg:col-span-5 space-y-2">
              {portalSteps.map((step, idx) => {
                const status = getStepStatus(idx);
                const isActive = activeStepIndex === idx;
                
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      // Allow selecting steps and opening their config widgets
                      if (idx >= 0) {
                        setActiveStepIndex(idx);
                      }
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer overflow-hidden relative ${
                      isActive 
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/10' 
                        : (status === 'Lolos' 
                            ? 'bg-slate-50 dark:bg-zinc-900 border-emerald-500/20 text-slate-700 dark:text-zinc-300' 
                            : 'bg-white dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-50')
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {status === 'Lolos' ? (
                        <CheckCircle2 className={`w-5 h-5 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                      ) : status === 'Aktif' ? (
                        <div className={`w-5 h-5 rounded-full border-2 ${isActive ? 'border-white text-white' : 'border-indigo-500 text-indigo-500'} flex items-center justify-center text-[10px] font-bold animate-pulse`}>
                          {idx + 1}
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-zinc-700 hover:text-emerald-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-bold text-xs leading-tight">{idx + 1}. {step.title}</h4>
                      <p className={`text-[10px] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {step.desc}
                      </p>
                    </div>

                    {status === 'Lolos' && (
                      <span className={`absolute right-3 top-3 text-[8px] font-extrabold px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        OK
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Interactive Selection widget body */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} shadow-sm`}>
                
                <h3 className="font-display font-extrabold text-sm border-b pb-3 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Penyelesaian Langkah {activeStepIndex + 1}: {portalSteps[activeStepIndex].title}
                </h3>

                <AnimatePresence mode="wait">
                  
                  {/* Step 1 & 2 */}
                  {(activeStepIndex === 0 || activeStepIndex === 1) && (
                    <motion.div
                      key="step1-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 text-center py-6"
                    >
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm">Akun Terverifikasi Secara Otomatis</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                          Anda telah berhasil masuk menggunakan akun SSO registrasi AONE SIAKAD secara aman.
                        </p>
                      </div>
                      <button 
                        onClick={() => setActiveStepIndex(2)}
                        className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-100 text-xs font-bold rounded-lg transition"
                      >
                        Tahap Selanjutnya &rarr;
                      </button>
                    </motion.div>
                  )}

                  {/* Step 3: Biodata */}
                  {activeStepIndex === 2 && (
                    <motion.div
                      key="step-biodata"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {isBiodataSaved ? (
                        <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-2">
                          <p className="text-xs text-emerald-500 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Data Biodata Tersimpan!</p>
                          <p className="text-xs text-slate-400">Pekerjaan Ayah/Wali: <strong>{fatherJob}</strong></p>
                          <p className="text-xs text-slate-400">Nama Lengkap Ibu: <strong>{motherName}</strong></p>
                          <button
                            onClick={() => setIsBiodataSaved(false)}
                            className="mt-2 text-[10px] text-slate-400 hover:underline hover:text-emerald-500"
                          >
                            Edit Kembali Data
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs text-slate-400 leading-relaxed">Isi kependudukan legal ayah dan ibu calon mahasiswa baru di bawah:</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Lengkap Ayah</label>
                              <input
                                type="text"
                                value={fatherName}
                                onChange={(e) => setFatherName(e.target.value)}
                                className={`w-full p-2.5 rounded-lg border text-xs outline-none ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50'}`}
                                placeholder="Suryadi Nugroho"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Lengkap Ibu</label>
                              <input
                                type="text"
                                value={motherName}
                                onChange={(e) => setMotherName(e.target.value)}
                                className={`w-full p-2.5 rounded-lg border text-xs outline-none ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50'}`}
                                placeholder="Siti Aminah"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pekerjaan Utama Ayah/Wali</label>
                            <input
                              type="text"
                              value={fatherJob}
                              onChange={(e) => setFatherJob(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border text-xs outline-none ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50'}`}
                              placeholder="Karyawan Swasta / PNS"
                            />
                          </div>
                          <button
                            onClick={() => {
                              if (!fatherName || !motherName) {
                                setErrorMessage('Harap isi minimal Nama Ayah dan Nama Ibu.');
                                setTimeout(() => setErrorMessage(null), 5000);
                                return;
                              }
                              setIsBiodataSaved(true);
                              setActiveStepIndex(3);
                            }}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                          >
                            Simpan Data Biodata &raquo;
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 4: Riwayat Sekolah */}
                  {activeStepIndex === 3 && (
                    <motion.div
                      key="step-school"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {isSchoolSaved ? (
                        <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-2">
                          <p className="text-xs text-emerald-500 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Asal Sekolah Terkonfirmasi!</p>
                          <p className="text-xs text-slate-400">Asal SMA/MA: <strong>{schoolName}</strong></p>
                          <p className="text-xs text-slate-400">Target Raport: <strong>{schoolGpa} Poin</strong></p>
                          <button
                            onClick={() => setIsSchoolSaved(false)}
                            className="mt-2 text-[10px] text-slate-400 hover:underline hover:text-emerald-500"
                          >
                            Ubah Asal Sekolah
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs text-slate-400">Kelengkapan kualifikasi asal sekolah menengah asal:</p>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Asal Sekolah (SMA/SMK/MA/Pondok)</label>
                            <input
                              type="text"
                              value={schoolName}
                              onChange={(e) => setSchoolName(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border text-xs outline-none ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50'}`}
                              placeholder="SMAN 1 Jakarta"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rata-rata Nilai Rapor Akhir (Skala 10 - 100)</label>
                            <input
                              type="number"
                              value={schoolGpa || ''}
                              onChange={(e) => setSchoolGpa(Number(e.target.value))}
                              className={`w-full p-2.5 rounded-lg border text-xs outline-none ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50'}`}
                              placeholder="contoh: 89"
                            />
                          </div>
                          <button
                            onClick={() => {
                              if (!schoolName || !schoolGpa) {
                                setErrorMessage('Harap isi nama asal sekolah dan nilai akhir.');
                                setTimeout(() => setErrorMessage(null), 5000);
                                return;
                              }
                              setIsSchoolSaved(true);
                              setActiveStepIndex(4);
                            }}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                          >
                            Simpan Nilai & Sekolah &raquo;
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 5: Upload Dokumen */}
                  {activeStepIndex === 4 && (
                    <motion.div
                      key="step-docs"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {uploadedDocName ? (
                        <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-2">
                          <p className="text-xs text-emerald-500 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Dokumen Diunggah Berhasil!</p>
                          <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-zinc-850 p-2 rounded-lg">
                            <FileText className="w-4 h-4 text-emerald-500" />
                            <span className="font-mono text-[10px] text-slate-500 truncate">{uploadedDocName}</span>
                          </div>
                          <button
                            onClick={() => setUploadedDocName('')}
                            className="mt-2 text-[10px] text-[#E11D48] hover:underline"
                          >
                            Hapus & Unggah Ulang
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs text-slate-400">Silakan unggah pindaian KTP, Kartu Keluarga, dan Ijazah sekolah dalam 1 berkas ZIP:</p>
                          
                          <div 
                            onClick={handleUploadClick}
                            className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-zinc-800 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center gap-2 group transition cursor-pointer text-xs bg-slate-50/50 dark:bg-zinc-900/10"
                          >
                            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition shrink-0" />
                            <span className="font-bold">Klik di sini untuk Simulasikan Upload</span>
                            <span className="text-[10px] text-slate-400">Format ZIP/RAR (Maks 10MB)</span>
                          </div>

                          {isUploading && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-bold text-emerald-500">
                                <span>Mengunggah Berkas ke Secure Engine...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 6: Pembayaran Tagihan Seleksi */}
                  {activeStepIndex === 5 && (
                    <motion.div
                      key="step-payment"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {isFeePaid ? (
                        <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-2">
                          <p className="text-xs text-emerald-500 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Tagihan Pembayaran LUNAS!</p>
                          <p className="text-xs text-slate-400">Metode Tagihan: <strong className="text-emerald-600 font-mono">BSI VIRTUAL ACCOUNT</strong></p>
                          <p className="text-xs text-slate-400">Status Invoice: <strong className="text-emerald-600">PAID (Lunas)</strong></p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs text-slate-400">Silakan lakukan pelunasan biaya registrasi seleksi formulir mahasiswa baru:</p>
                          
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Nomor Virtual Account (BSI):</span>
                              <span className="font-mono font-bold">1039-0812-1111-2222</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Total Pembayaran Seleksi:</span>
                              <span className="font-bold text-emerald-500">Rp 350.000</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setIsFeePaid(true);
                              setActiveStepIndex(6);
                            }}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1"
                          >
                            <CreditCard className="w-4 h-4" />
                            Simulasikan Bayar VA Tagihan Formulir
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 7: Tes CBT */}
                  {activeStepIndex === 6 && (
                    <motion.div
                      key="step-cbt"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {isCbtTestSubmitted ? (
                        <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-2">
                          <p className="text-xs text-emerald-500 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Evaluasi CBT Selesai Disubmit!</p>
                          <p className="text-xs text-slate-400">Nilai Kelayakan Potensi Akademik: <strong className="text-emerald-600 font-mono text-base">{cbtScore || 90} Poin</strong></p>
                          <p className="text-xs text-slate-400">Status evaluasi CBT: <strong className="text-emerald-600 font-mono">MEMENUHI SYARAT (PASS)</strong></p>
                        </div>
                      ) : (
                        <form onSubmit={handleCbtQuizSubmit} className="space-y-4">
                          <p className="text-xs text-slate-400 border-b pb-1 font-bold">Ujian Potensi Akademik Mini CBT:</p>
                          
                          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                            {/* Question 1 */}
                            <div className="space-y-1 text-xs">
                              <p className="font-bold">1. Solusi ERP AONE SIAKAD mengadopsi pilar cloud bernama...?</p>
                              <div className="flex flex-col gap-1.5 pl-2 mt-1">
                                <label className="flex items-center gap-2">
                                  <input type="radio" name="q1" value="A" onChange={() => setCbtAnswers({ ...cbtAnswers, 1: 'A' })} required />
                                  <span>A. On-Premise fisik lokal server</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input type="radio" name="q1" value="B" onChange={() => setCbtAnswers({ ...cbtAnswers, 1: 'B' })} />
                                  <span className="font-semibold text-emerald-600">B. Integrated Single-Tenant Cloud Terpadu</span>
                                </label>
                              </div>
                            </div>

                            {/* Question 2 */}
                            <div className="space-y-1 text-xs border-t pt-2">
                              <p className="font-bold">2. Akreditasi kelembagaan BAN-PT yang disandang UND adalah...?</p>
                              <div className="flex flex-col gap-1.5 pl-2 mt-1">
                                <label className="flex items-center gap-2">
                                  <input type="radio" name="q2" value="A" onChange={() => setCbtAnswers({ ...cbtAnswers, 2: 'A' })} required />
                                  <span>A. Cukup Baik</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input type="radio" name="q2" value="B" onChange={() => setCbtAnswers({ ...cbtAnswers, 2: 'B' })} />
                                  <span className="font-semibold text-emerald-600">B. Akreditasi UNGGUL Terhormat</span>
                                </label>
                              </div>
                            </div>

                            {/* Question 3 */}
                            <div className="space-y-1 text-xs border-t pt-2">
                              <p className="font-bold">3. Berapa hasil dari kalkulasi matematika dasar 2 + 2 * 3?</p>
                              <div className="flex flex-col gap-1.5 pl-2 mt-1">
                                <label className="flex items-center gap-2">
                                  <input type="radio" name="q3" value="A" onChange={() => setCbtAnswers({ ...cbtAnswers, 3: 'A' })} required />
                                  <span>A. 12</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input type="radio" name="q3" value="B" onChange={() => setCbtAnswers({ ...cbtAnswers, 3: 'B' })} />
                                  <span className="font-semibold text-emerald-600">B. 8 (Urutan Operasi Kabataku)</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                          >
                            Kirim Jawaban CBT & Hitung Nilai
                          </button>
                        </form>
                      )}
                    </motion.div>
                  )}

                  {/* Step 8: Wawancara */}
                  {activeStepIndex === 7 && (
                    <motion.div
                      key="step-interview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {isInterviewSubmitted ? (
                        <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-2">
                          <p className="text-xs text-emerald-500 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Evaluasi Wawancara Selesai!</p>
                          <p className="text-xs text-slate-400">Pernyataan Komitmen: <strong className="text-slate-800 dark:text-zinc-200">"{interviewAnswer}"</strong></p>
                          <p className="text-xs text-slate-400">Catatan Penguji: <span className="italic text-emerald-600 font-serif">"Rekomendasi beasiswa sangat mumpuni."</span></p>
                        </div>
                      ) : (
                        <div className="space-y-4 text-xs">
                          <p className="text-slate-400">Silakan pilih komitmen visi akademik Anda untuk menyelesaikan wawancara kebangsaan:</p>
                          
                          <div className="space-y-2">
                            {[
                              'Saya ingin membaktikan keimanan sains saya untuk akselerasi startup nasional RI.',
                              'Saya berupaya meningkatkan perekonomian umat melalui inovasi perbankan syariah terjangkau.',
                              'Saya ingin menjadi pendidik berdaya saing global demi kemajuan madrasah nusantara.'
                            ].map((ans, key) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setInterviewAnswer(ans)}
                                className={`w-full p-3 rounded-xl border text-left font-semibold transition hover:border-emerald-500 ${interviewAnswer === ans ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500 dark:text-emerald-400' : 'border-slate-200 dark:border-zinc-800'}`}
                              >
                                {ans}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={handleInterviewSubmit}
                            disabled={!interviewAnswer}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
                          >
                            Kirim Jawaban Wawancara Admisi
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 9: Surat Kelulusan */}
                  {activeStepIndex === 8 && (
                    <motion.div
                      key="step-sk"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Admission Letter Display - dynamic based on active state */}
                      <div className={`p-5 rounded-2xl border bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 text-white border-zinc-850 h-fit space-y-4`}>
                        <div className="flex justify-between items-start">
                          <div className="p-2 bg-emerald-500 rounded-xl">
                            <Star className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-400 uppercase">AKREDITASI INSTITUSI: UNGGUL</span>
                        </div>
                        
                        <h3 className="font-display font-bold text-center text-base uppercase pb-2 border-b border-zinc-800 tracking-tight leading-snug">Surat Keputusan Kelulusan Seleksi PMB Ganjil 2026</h3>
                        <p className="text-[10px] text-slate-400 mt-2">Menyatakan bahwa Calon Mahasiswa:</p>
                        
                        <div className="bg-white/10 p-3.5 rounded-xl border border-white/10 space-y-1 font-mono text-xs">
                          <p className="font-bold uppercase tracking-wide text-white">{user?.name || 'Bayu Nugroho'}</p>
                          <p className="text-[10px] text-slate-300">No. Seleksi: PMB26{user?.id ? user.id.slice(-4) : '3104'}</p>
                          <p className="text-[11px] text-emerald-400 font-extrabold text-xs mt-1 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
                            Lolos: S1 {user?.prodi || 'Teknik Informatika'} (Kelas Reguler)
                          </p>
                        </div>

                        <p className="text-[10px] leading-relaxed text-slate-300">
                          Kami ucapkan selamat bergabung di keluarga besar Universitas Nusantara Digital. Silakan lakukan proses daftar ulang dengan mengeklik langkah 10 di samping untuk melakukan pembayaran UKT Virtual Account demi mendapatkan Nomor Induk Mahasiswa (NIM) resmi.
                        </p>

                        <button 
                          onClick={() => {
                            setSuccessMessage('Fitur premium generator berkas aktif: Mengompilasi Surat Keputusan Rektorat format PDF... Unduhan SK_ADMISI_2026.pdf sukses otomatis!');
                            setTimeout(() => setSuccessMessage(null), 6000);
                          }}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                        >
                          <Printer className="w-4 h-4" />
                          Download Surat Keputusan.pdf
                        </button>
                      </div>

                      <div className="text-center">
                        <button
                          onClick={() => setActiveStepIndex(9)}
                          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
                        >
                          Lanjut Langkah 10 (Daftar Ulang) &raquo;
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 10: Daftar Ulang */}
                  {activeStepIndex === 9 && (
                    <motion.div
                      key="step-re-register"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 animate-in fade-in"
                    >
                      {isUktPaid ? (
                        <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/25 space-y-4 text-center">
                          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <Check className="w-6 h-6" />
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Selamat! Anda Resmi Menjadi Mahasiswa UND!</h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">Proses kliring keuangan semester 1 selesai disinkronkan otomatis.</p>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-950 text-white border text-left max-w-xs mx-auto space-y-1.5 font-mono text-xs">
                            <div className="flex justify-between border-b border-zinc-800 pb-1.5 mb-1.5">
                              <span className="text-slate-400">Prodi Baru:</span>
                              <span className="font-bold text-slate-100">S1 {user?.prodi || 'Teknik Informatika'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">NAMA MAHASISWA:</span>
                              <span className="font-bold text-slate-100">{user?.name}</span>
                            </div>
                            <div className="flex justify-between text-yellow-400 font-bold">
                              <span>NIM RESMI:</span>
                              <span>{assignedNim || '20261942080'}</span>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                            💡 NIM di atas sekarang dapat digunakan untuk login ke portal internal Akademik Mahasiswa, mengisi Kartu Rencana Studi (KRS), serta mengakses Moodle LMS AONE SIAKAD!
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs text-slate-400">Klaim akreditasi mahasiswa dan perolehan NIM Anda dengan melunasi UKT semester pertama pertama:</p>

                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Program Studi:</span>
                              <span className="font-bold">S1 {user?.prodi || 'Teknik Informatika'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Besaran UKT Semester 1:</span>
                              <span className="font-extrabold text-emerald-500 font-mono">Rp 4.500.000</span>
                            </div>
                            <div className="flex justify-between text-xs border-t border-dashed border-slate-300 dark:border-zinc-800 pt-2 text-[10px] text-slate-400">
                              <span>Ketentuan Subsidi:</span>
                              <span className="font-medium text-emerald-600">Disubsidi Beasiswa PMB</span>
                            </div>
                          </div>

                          <button
                            onClick={handlePayUktSemester}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-1"
                          >
                            <Award className="w-4 h-4 text-white" />
                            Bayar UKT Semester 1 & Lulus Menjadi Mahasiswa
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                </AnimatePresence>

              </div>
              
              {/* Informative tips box */}
              <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400 leading-relaxed">
                🚀 <strong>Petunjuk Selangkah</strong>: Anda dapat melengkapi ataupun menyunting formulir di langkah yang aktif untuk memajukan seleksi admisi Anda di portal. Pemuatan instansi rektorat akan menyaring kelulusan profil Anda di tabel pendaftar panitia.
              </div>

            </div>

          </div>
        </div>
      )}

      {/* PERSPECTIVE B: ADMIN SELECTION PORTAL */}
      {currentView === 'pmb_admin_dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-500 font-mono tracking-widest">DASHBOARD PANITIA ADMISI</span>
            <h2 className="text-2xl font-bold font-display tracking-tight">Pusat Seleksi PMB (Keputusan Admisi)</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Verifikasi berkas calon pendaftar, edit nilai seleksi kualifikasi, saring hasil beasiswa wawancara.</p>
          </div>

          {/* PMB Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Total Pendaftar Terlaporkan</p>
              <h3 className="text-2xl font-extrabold mt-1.5">{candidates.length} orang</h3>
              <p className="text-[9px] text-emerald-500 mt-1 font-bold">YoY +12% dibanding semester lalu</p>
            </div>
            
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Pendaftar Lolos Seleksi</p>
              <h3 className="text-2xl font-extrabold mt-1.5">
                {candidates.filter(c => c.status === 'Lolos' || c.status === 'Daftar Ulang').length} orang
              </h3>
              <p className="text-[9px] text-indigo-500 mt-1">Selesai bayar UKT: {candidates.filter(c => c.status === 'Daftar Ulang').length} orang</p>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Jalur Pendaftaran Aktif</p>
              <h3 className="text-2xl font-extrabold mt-1.5">5 Jalur</h3>
              <p className="text-[9px] text-slate-400 mt-1">Rata-rata nasional: 2 Jalur (Unggul)</p>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Dana PMB Terkumpul</p>
              <h3 className="text-xl font-extrabold text-emerald-600 mt-1.5">Rp {candidates.filter(c => c.pembayaranStatus === 'Lunas').length * 350000 + (candidates.filter(c => c.status === 'Daftar Ulang').length * 4500000) === 0 ? '434 JUTA' : (candidates.filter(c => c.pembayaranStatus === 'Lunas').length * 350000 + (candidates.filter(c => c.status === 'Daftar Ulang').length * 4500000)).toLocaleString('id-ID')}</h3>
              <p className="text-[9px] text-slate-400 mt-1">UKT daftar ulang menyusul</p>
            </div>
          </div>

          {selectedCandidate && (
            <div className={`p-6 rounded-2xl border relative ${isDark ? 'bg-zinc-900/60 border-zinc-800 text-white animate-in' : 'bg-slate-50 border-slate-200 text-slate-900 animate-in'}`}>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="absolute right-4 top-4 hover:opacity-75 text-xs font-bold bg-slate-200 dark:bg-zinc-850 p-1.5 px-3 rounded-xl cursor-pointer"
              >
                Tutup [X]
              </button>
              
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center font-display">
                  {selectedCandidate.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm font-display">{selectedCandidate.name}</h3>
                  <p className="text-xs text-slate-500">No.PMB: {selectedCandidate.applicantNumber} | {selectedCandidate.selectionPath}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-slate-100 dark:border-zinc-800 my-4">
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Jurusan Pilihan 1</label>
                  <p className="text-xs font-bold mt-1">{selectedCandidate.firstChoice}</p>
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Nilai Potensi Ujian</label>
                  <input
                    type="number"
                    value={selectedCandidate.score || 0}
                    onChange={(e) => handleCandidateScoreChange(selectedCandidate.id, Number(e.target.value))}
                    className={`w-16 p-1 text-center font-bold font-mono text-xs border rounded-lg mt-0.5 ${isDark ? 'bg-zinc-850 border-zinc-700' : 'bg-white border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Status Evaluasi</label>
                  <p className="text-xs font-bold mt-1 text-emerald-500">{selectedCandidate.status}</p>
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Biaya Formulir</label>
                  <p className="text-xs font-bold mt-1 text-emerald-500">{selectedCandidate.pembayaranStatus}</p>
                </div>
              </div>

              {selectedCandidate.wawancaraNote && (
                <div className="p-3 bg-emerald-50 dark:bg-zinc-800 rounded-xl text-xs flex gap-2 items-start mb-4">
                  <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="italic text-slate-600 dark:text-zinc-400">"{selectedCandidate.wawancaraNote}"</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateCandidateStatus(selectedCandidate.id, 'Lolos')}
                  className="px-3.5 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold"
                >
                  Loloskan Admisi
                </button>
                <button
                  onClick={() => handleUpdateCandidateStatus(selectedCandidate.id, 'Ditolak')}
                  className="px-3.5 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold"
                >
                  Tolak Admisi
                </button>
                <button
                  onClick={() => handleUpdateCandidateStatus(selectedCandidate.id, 'Tes Masuk')}
                  className="px-3.5 py-1.5 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                >
                  Atur Tes Ulang
                </button>
              </div>

            </div>
          )}

          {/* Candidates table */}
          <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <table className="w-full text-left font-sans">
              <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-900/60 text-zinc-400 border-b border-zinc-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}`}>
                <tr>
                  <th className="p-4">No. Registrasi</th>
                  <th className="p-4">Calon Mahasiswa</th>
                  <th className="p-4">Opsi Prodi</th>
                  <th className="p-4">Jalur Seleksi</th>
                  <th className="p-4">Bobot Skrin</th>
                  <th className="p-4">Status Portal</th>
                  <th className="p-4 text-right">Navigasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-850 text-xs">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/10">
                    <td className="p-4 font-mono font-bold text-slate-400">{c.applicantNumber}</td>
                    <td className="p-4 font-bold">{c.name}</td>
                    <td className="p-4">
                      <p className="font-semibold">{c.firstChoice}</p>
                      {c.secondChoice && <p className="text-[10px] text-slate-400">Pilihan 2: {c.secondChoice}</p>}
                    </td>
                    <td className="p-4">{c.selectionPath}</td>
                    <td className="p-4 font-mono font-bold text-emerald-500">{c.score ? `${c.score} Poin` : 'Belum Tes'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        c.status === 'Lolos' || c.status === 'Daftar Ulang' ? 'bg-emerald-500/10 text-emerald-500' : c.status === 'Ditolak' ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedCandidate(c)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100'}`}
                      >
                        Kelola
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
