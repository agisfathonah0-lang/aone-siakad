import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';
import {
  Award, FileCheck, Sliders, Laptop, ChevronRight, Activity, Cpu, CheckCircle2,
  Trash2, Plus, Info, Sparkles, Printer, Lock, Download, UploadCloud
} from 'lucide-react';

interface AkredetasiModuleProps {
  isDark: boolean;
}

export default function AkredetasiModule({ isDark }: AkredetasiModuleProps) {
  const { toast } = useToast();
  // Criterion audit documentation lists
  const [criteria, setCriteria] = useState([
    { id: 'C01', criterion: 'Kriteria 1', name: 'Visi, Misi, Tujuan, dan Strategi Kampus', status: 'Lengkap', filesCount: 4, auditor: 'Prof. Dr. Ir. H. M. Zainuri' },
    { id: 'C02', criterion: 'Kriteria 2', name: 'Tata Pamong, Tata Kelola, dan Kerjasama', status: 'Lengkap', filesCount: 3, auditor: 'Prof. Dr. Ir. H. M. Zainuri' },
    { id: 'C03', criterion: 'Kriteria 3', name: 'Mahasiswa, Rekrutmen & Layanan Akademik', status: 'Evaluasi', filesCount: 2, auditor: 'Dr. Rina Kartika' },
    { id: 'C04', criterion: 'Kriteria 4', name: 'Sumber Daya Manusia (SDM & Keahlian Dosen)', status: 'Lengkap', filesCount: 8, auditor: 'Prof. Zainal Abidin' },
    { id: 'C05', criterion: 'Kriteria 5', name: 'Keuangan, Sarana, dan Prasarana Mutu', status: 'Kurang Berkas', filesCount: 1, auditor: 'Dr. Rina Kartika' }
  ]);

  const [activeCriterionId, setActiveCriterionId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleSimulateDocumentUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            
            // Increment files count and set to Complete
            setCriteria(criteria.map(c => {
              if (c.id === activeCriterionId) {
                return { ...c, status: 'Lengkap' as const, filesCount: c.filesCount + 1 };
              }
              return c;
            }));
            toast('File LED akreditasi berhasil diunggah dan diverifikasi!', 'success');
          }, 600);
          return 100;
        }
        return prev + 20;
      });
    }, 100);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">STANDARISASI MUTU BAN-PT</span>
          <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Sistem Akreditasi 9 Kriteria</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Pusat Laporan Evaluasi Diri (LED) & Dokumen Kinerja Program Studi (DKPS) institusi.</p>
        </div>

        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-display flex items-center gap-1.5 transition whitespace-nowrap shadow-md">
          <Award className="w-4 h-4" />
          Kalkulator BAN-PT AI
        </button>
      </div>

      {/* Akreditasi KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <p className="text-slate-400 text-[10px] uppercase font-bold">Peringkat Akreditasi Utama</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-emerald-500 font-display">UNGGUL</span>
            <span className="text-xs text-slate-400 font-bold">Skor: 382</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Berlaku s/d Desember 2030</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <p className="text-slate-400 text-[10px] uppercase font-bold">SDM Bersertifikasi (S3/LeKTOR)</p>
          <h3 className="text-3xl font-extrabold font-mono text-indigo-500 mt-2">84.2%</h3>
          <p className="text-[10px] text-emerald-500 font-semibold mt-2">Telah lolos audit kecukupan BAN-PT</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <p className="text-slate-400 text-[10px] uppercase font-bold">Kelulusan Tepat Waktu</p>
          <h3 className="text-3xl font-extrabold font-mono mt-2">91.8%</h3>
          <p className="text-[10px] text-slate-400 mt-2">Indeks efektivitas pendaftaran luar biasa</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <p className="text-slate-400 text-[10px] uppercase font-bold">Rasio Dosen : Mahasiswa</p>
          <h3 className="text-3xl font-extrabold mt-2 font-mono text-emerald-500">1:21</h3>
          <p className="text-[10px] text-slate-400 mt-2">Standard ideal BAN-PT SNTOD: 1:30</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 9 Criteria checklist */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">9 Kriteria Evaluasi Diri</h3>
          
          <div className="space-y-2">
            {criteria.map((item) => (
              <div
                key={item.id}
                onClick={() => { setActiveCriterionId(item.id); setUploadProgress(null); }}
                className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-center ${activeCriterionId === item.id ? 'border-indigo-600 bg-indigo-50/10 dark:border-indigo-500' : 'border-slate-200 dark:border-zinc-850 hover:bg-slate-50'}`}
              >
                <div className="min-w-0">
                  <span className="font-mono text-[9px] font-bold text-slate-400 uppercase">{item.criterion}</span>
                  <h4 className="font-bold text-xs mt-1 leading-tight">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-2">Reviewer: {item.auditor} • Jumlah Dokumen: <b>{item.filesCount} berkas</b></p>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase whitespace-nowrap ml-4 ${item.status === 'Lengkap' ? 'bg-emerald-500/10 text-emerald-500' : item.status === 'Evaluasi' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Document Audit detail side sheet */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} h-fit`}>
          {activeCriterionId ? (
            <div className="space-y-4">
              <h3 className="font-bold text-sm font-display mb-1">
                Kriteria Kejelasan: {criteria.find(c => c.id === activeCriterionId)?.criterion}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Silakan melampirkan berkas penunjang dokumen IAPS 4.0 atau draf LED di bawah untuk dievaluasi kelayakannya oleh tim audit BAN-PT.
              </p>

              {uploadProgress !== null ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-indigo-500">
                    <span className="animate-pulse">Mengunggah ke Repositori...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSimulateDocumentUpload}
                  className="w-full py-4 border-2 border-dashed border-slate-350 dark:border-zinc-700 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center gap-2 group transition text-xs"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition shrink-0" />
                  <span className="font-bold">Pilih / Seret Dokumen PDF LED</span>
                  <span className="text-[10px] text-slate-400">PDF Maksimal 20MB</span>
                </button>
              )}

              <div className="border-t border-slate-200 dark:border-zinc-800 pt-4 space-y-2 text-xs">
                <p className="font-bold">Ketentuan Kepatuhan Audit:</p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400 leading-relaxed">
                  <li>Dokumen LED wajib ditandatangani oleh Ketua Program Studi yang bersangkutan.</li>
                  <li>Melampirkan draf standar SPMI internal perguruan tinggi secara terpisah.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold">Harap Pilih Salah Satu Kriteria</p>
              <p className="text-[10px]">Klik salah satu kriteria di sebelah kiri untuk mengunggah dokumen LED.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
