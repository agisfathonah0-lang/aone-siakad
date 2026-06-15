import React, { useState } from 'react';
import { LMS_COURSES, STUDENT_LIST } from '../mockData';
import { LMSCourse } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Video, FileText, CheckCircle2, ChevronRight, MessageSquare,
  HelpCircle, Award, Compass, Sparkles, Send, Upload, Star, Plus, RefreshCw, Eye
} from 'lucide-react';

interface LmsModuleProps {
  currentView: string;
  isDark: boolean;
}

export default function LmsModule({ currentView, isDark }: LmsModuleProps) {
  const [courses, setCourses] = useState<LMSCourse[]>(LMS_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<LMSCourse | null>(LMS_COURSES[0]);
  
  // Perspective control inside LMS to easily demo both lecturer and student sides!
  const [rolePerspective, setRolePerspective] = useState<'STUDENT' | 'LECTURER'>('STUDENT');
  const [activeTab, setActiveTab] = useState<'materi' | 'tugas' | 'kuis' | 'diskusi'>('materi');

  // Submit assignments modal/simulation
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [lmsFeedback, setLmsFeedback] = useState<string | null>(null);

  // Take kuis clicker simulation state
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmittedScore, setQuizSubmittedScore] = useState<number | null>(null);

  // New materials state
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialType, setNewMaterialType] = useState<'pdf' | 'video' | 'link'>('pdf');

  // Forum reply simulation
  const [chatInputs, setChatInputs] = useState('');

  const handleToggleCompletedMaterial = (courseId: string, materialId: string) => {
    // Standard visual feedback tracking
  };

  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialTitle || !selectedCourse) return;

    const freshMat = {
      id: 'MAT' + String(selectedCourse.materials.length + 5).padStart(3, '0'),
      title: newMaterialTitle,
      type: newMaterialType,
      url: '#',
      postedAt: '2026-06-02'
    };

    setCourses(courses.map(c => {
      if (c.id === selectedCourse.id) {
        return { ...c, materials: [...c.materials, freshMat] };
      }
      return c;
    }));

    // Update local selected state
    setSelectedCourse({
      ...selectedCourse,
      materials: [...selectedCourse.materials, freshMat]
    });

    setNewMaterialTitle('');
  };

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !selectedAssignmentId) return;

    setCourses(courses.map(c => {
      if (c.id === selectedCourse.id) {
        return {
          ...c,
          assignments: c.assignments.map(asm => {
            if (asm.id === selectedAssignmentId) {
              return { ...asm, submitted: true, submissionDate: '2026-06-02', grade: 94 };
            }
            return asm;
          })
        };
      }
      return c;
    }));

    // Update local selective
    setSelectedCourse({
      ...selectedCourse,
      assignments: selectedCourse.assignments.map(asm => {
        if (asm.id === selectedAssignmentId) {
          return { ...asm, submitted: true, submissionDate: '2026-06-02', grade: 94 };
        }
        return asm;
      })
    });

    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
      setSelectedAssignmentId(null);
      setGithubUrl('');
    }, 1500);
  };

  const submitQuizAnswers = () => {
    if (!selectedCourse || !selectedQuizId) return;
    
    // Grade mock
    const score = 90;
    setCourses(courses.map(c => {
      if (c.id === selectedCourse.id) {
        return {
          ...c,
          quizzes: c.quizzes.map(q => {
            if (q.id === selectedQuizId) {
              return { ...q, taken: true, score };
            }
            return q;
          })
        };
      }
      return c;
    }));

    setSelectedCourse({
      ...selectedCourse,
      quizzes: selectedCourse.quizzes.map(q => {
        if (q.id === selectedQuizId) {
          return { ...q, taken: true, score };
        }
        return q;
      })
    });

    setQuizSubmittedScore(score);
    setTimeout(() => {
      setQuizSubmittedScore(null);
      setSelectedQuizId(null);
      setQuizAnswers({});
    }, 2000);
  };

  const handleCreateForumPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputs || !selectedCourse) return;

    const freshDiscussion = {
      id: 'DSC' + String(selectedCourse.discussions.length + 3).padStart(3, '0'),
      title: chatInputs,
      author: 'Ahmad Fauzi',
      content: 'Mari bersama kita bahas submisi modul koding ini agar lolos standardisasi.',
      replies: 0,
      postedAt: '2026-06-02'
    };

    setCourses(courses.map(c => {
      if (c.id === selectedCourse.id) {
        return { ...c, discussions: [...c.discussions, freshDiscussion] };
      }
      return c;
    }));

    setSelectedCourse({
      ...selectedCourse,
      discussions: [...selectedCourse.discussions, freshDiscussion]
    });

    setChatInputs('');
  };

  return (
    <div className="space-y-6 font-sans">
      {lmsFeedback && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{lmsFeedback}</span>
          </div>
          <button 
            onClick={() => setLmsFeedback(null)}
            className="text-emerald-450 hover:text-emerald-500 font-extrabold uppercase text-[10px]"
          >
            Tutup [X]
          </button>
        </div>
      )}
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-zinc-805 pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">LEARNING MANAGEMENT SYSTEM (LMS)</span>
          <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Sistem Integrasi LMS Kampus</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Model pembelajaran digital setara Canvas LMS & Coursera bagi civitas akademika.</p>
        </div>

        {/* Dynamic perspective swapper */}
        <div className="bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl flex">
          <button
            onClick={() => { setRolePerspective('STUDENT'); setSelectedCourse(courses[0]); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${rolePerspective === 'STUDENT' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Compass className="w-3.5 h-3.5" />
            Portal Mahasiswa
          </button>
          
          <button
            onClick={() => { setRolePerspective('LECTURER'); setSelectedCourse(courses[0]); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${rolePerspective === 'LECTURER' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Course Builder (Dosen)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Course Directory Drawer */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Mata Kuliah Virtual Anda</h3>
          <div className="space-y-1.5">
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourse(c)}
                className={`w-full p-4 rounded-2xl border text-left transition duration-150 flex flex-col justify-between ${selectedCourse?.id === c.id ? (isDark ? 'border-primary-600 bg-zinc-900/80 text-white' : 'border-indigo-600 bg-indigo-50/20 text-indigo-900') : 'border-slate-200 dark:border-zinc-850 hover:bg-slate-50'}`}
              >
                <div>
                  <span className="font-mono text-[9px] font-bold text-slate-400">{c.code}</span>
                  <h4 className="font-bold text-xs mt-1 leading-tight line-clamp-1">{c.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Dosen: {c.lecturer}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active Course View Content */}
        {selectedCourse && (
          <div className="lg:col-span-3 space-y-6">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-base font-display">{selectedCourse.name}</h3>
                  <p className="text-xs text-indigo-500 mt-0.5">Syllabus: {selectedCourse.syllabus}</p>
                </div>
              </div>

              {/* Sub components tabs */}
              <div className="flex border-b border-slate-100 dark:border-zinc-800 pb-2 mb-6 gap-6">
                {(['materi', 'tugas', 'kuis', 'diskusi'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`font-display text-xs font-bold pb-2 transition border-b-2 capitalize ${activeTab === tab ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* PERSPECTIVE TAB CONTENTS */}
              {activeTab === 'materi' && (
                <div className="space-y-4">
                  {rolePerspective === 'LECTURER' && (
                    <form onSubmit={handleAddMaterialSubmit} className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800 mb-6 space-y-3">
                      <h4 className="text-xs font-bold font-display">Upload Materi Perkuliahan Baru</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          required
                          value={newMaterialTitle}
                          onChange={(e) => setNewMaterialTitle(e.target.value)}
                          placeholder="cth: Pertemuan 3 - Pengenalan LLM Agents"
                          className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-200'}`}
                        />
                        <select
                          value={newMaterialType}
                          onChange={(e) => setNewMaterialType(e.target.value as any)}
                          className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-200'}`}
                        >
                          <option value="pdf">Dokumen PDF</option>
                          <option value="video">Streaming Video</option>
                          <option value="link">Tautan Eksternal Web</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Publikasikan Materi
                      </button>
                    </form>
                  )}

                  <div className="space-y-3">
                    {selectedCourse.materials.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Belum ada bahan perkuliahan.</p>
                    ) : (
                      selectedCourse.materials.map((mat) => (
                        <div key={mat.id} className="p-3.5 bg-slate-50 dark:bg-zinc-800/30 border border-slate-100 dark:border-zinc-800 rounded-xl flex justify-between items-center text-xs">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded bg-indigo-100 dark:bg-zinc-800 text-indigo-600">
                              {mat.type === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-bold">{mat.title}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Dirilis tanggal: {mat.postedAt}</p>
                            </div>
                          </div>
                          
                          <button
                            className="text-xs font-bold text-indigo-500 hover:underline"
                            onClick={() => {
                              setLmsFeedback(`Materi Resmi Berhasil Diunduh: "${mat.title}" berhasil disimpan ke direktori lokal Anda.`);
                              setTimeout(() => setLmsFeedback(null), 5050);
                            }}
                          >
                            Unduh Berkas
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'tugas' && (
                <div className="space-y-4">
                  {rolePerspective === 'STUDENT' ? (
                    selectedCourse.assignments.map((asm) => (
                      <div key={asm.id} className="p-4 bg-slate-50 dark:bg-zinc-800/30 border border-slate-250/20 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold">{asm.title}</h4>
                            {asm.submitted && <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-bold">SUBMITTED</span>}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-xl">{asm.instructions}</p>
                          <p className="text-[10px] text-rose-500 font-mono mt-2">Batas Akhir (Deadline): {asm.dueDate}</p>
                        </div>

                        <div className="text-right whitespace-nowrap ml-4">
                          <p className="text-[11px] font-bold text-indigo-500">Nilai: {asm.grade ? `${asm.grade} / ${asm.maxPoints}` : `unsubmitted`}</p>
                          {!asm.submitted && (
                            <button
                              onClick={() => { setSelectedAssignmentId(asm.id); setSubmissionSuccess(false); }}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold mt-2"
                            >
                              Kirim Tugas
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Teacher view of assignment submissions
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Evaluasi Submisi Mahasiswa</h4>
                      {STUDENT_LIST.map((student) => (
                        <div key={student.id} className="p-3.5 bg-slate-50 dark:bg-zinc-800/20 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold">{student.name}</p>
                            <p className="text-[10px] text-slate-400">NIM: {student.nim}</p>
                          </div>
                          <div className="flex gap-4 items-center">
                            <span className="text-emerald-500 font-semibold font-mono">Nilai Tugas: 92/100</span>
                            <button className="px-2.5 py-1 text-[11px] font-semibold border rounded bg-white dark:bg-zinc-900">Edit Nilai</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'kuis' && (
                <div className="space-y-4">
                  {selectedCourse.quizzes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Belum ada evaluasi kuis dirilis.</p>
                  ) : (
                    selectedCourse.quizzes.map((q) => (
                      <div key={q.id} className="p-4 bg-slate-50 dark:bg-zinc-800/10 rounded-xl border flex justify-between items-center text-xs">
                        <div>
                          <h4 className="font-bold">{q.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-1">{q.questionsCount} Pertanyaan Ujian • Durasi: {q.duration} Menit</p>
                        </div>
                        
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${q.taken ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {q.taken ? `SKOR: ${q.score}/100` : 'BELUM DIAMBIL'}
                          </span>
                          {!q.taken && rolePerspective === 'STUDENT' && (
                            <button
                              onClick={() => setSelectedQuizId(q.id)}
                              className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold ml-3"
                            >
                              Mulai Kuis
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'diskusi' && (
                <div className="space-y-4">
                  <form onSubmit={handleCreateForumPost} className="flex gap-3">
                    <input
                      type="text"
                      required
                      value={chatInputs}
                      onChange={(e) => setChatInputs(e.target.value)}
                      placeholder="Tulis sebuah pertanyaan diskusi baru ke forum pengingat rekan kuliah..."
                      className={`flex-1 p-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-200'}`}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                    >
                      Kirim Post
                    </button>
                  </form>

                  <div className="divide-y divide-slate-100 dark:divide-zinc-850">
                    {selectedCourse.discussions.map((disc) => (
                      <div key={disc.id} className="py-4">
                        <h4 className="font-bold text-xs">{disc.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">{disc.content}</p>
                        
                        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Post oleh: <b>{disc.author}</b> • {disc.postedAt}</span>
                          <span className="font-bold text-indigo-500">{disc.replies} Replies</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* SUBMIT ASSIGNMENT MODAL MOCK */}
      {selectedAssignmentId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 ${isDark ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white text-slate-800'}`}>
            <h3 className="font-display font-bold text-base mb-2">Simpan Pembelajaran & Kumpulkan</h3>
            <p className="text-xs text-slate-400 mb-4">Mata Kuliah: {selectedCourse?.name}</p>

            {submissionSuccess ? (
              <div className="text-center py-6 text-emerald-500">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                <p className="text-xs font-bold">Submisi Berhasil Dikirimkan!</p>
              </div>
            ) : (
              <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Link Repository Tugas (GitHub / Drive)</label>
                  <input
                    type="url"
                    required
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none focus:border-indigo-500 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedAssignmentId(null)}
                    className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    Kirim Tugas
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QUIZ INTERACTIVE DIALOG (MCQ) */}
      {selectedQuizId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl p-6 ${isDark ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white text-slate-850'}`}>
            <h3 className="font-display font-bold text-sm mb-4">Simulasi Kuis - Potensi AI & Fuzzy Networks</h3>

            {quizSubmittedScore !== null ? (
              <div className="text-center py-6 text-emerald-500 space-y-2">
                <Star className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                <p className="text-xs font-bold">Kuis Selesai! Skor Anda: {quizSubmittedScore}/100</p>
                <p className="text-[10px] text-slate-400">Hasil ini disingkronkan langsung ke portal Gradebook dosen.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-xs font-bold">1. Siapakah tokoh peletak fondasi kecerdasan buatan Turing Machine?</p>
                  <div className="space-y-1.5 pl-2">
                    {[
                      { key: 'A', text: 'Alan Turing' },
                      { key: 'B', text: 'John McCarthy' },
                      { key: 'C', text: 'Ada Lovelace' }
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setQuizAnswers({ ...quizAnswers, 1: opt.key })}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${quizAnswers[1] === opt.key ? 'border-indigo-600 bg-indigo-50/10' : 'border-slate-200'}`}
                      >
                        <span className="font-bold">{opt.key}.</span> {opt.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedQuizId(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    onClick={submitQuizAnswers}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    Kirim Jawaban
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
