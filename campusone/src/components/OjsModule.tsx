import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useToast } from './Toast';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Star, RefreshCw, Send, CheckCircle2, ShieldAlert,
  Sliders, Laptop, Cpu, Award, Heart, MessageCircle, FileText, AlertCircle, Loader2, ExternalLink, Wifi, WifiOff
} from 'lucide-react';

interface OjsModuleProps {
  currentView: string;
  isDark: boolean;
}

interface Journal {
  id: string;
  title: string;
  author: string;
  journalCategory: string;
  status: string;
  issue: string;
  publishedAt: string;
  impactFactor: number;
}

export default function OjsModule({ currentView, isDark }: OjsModuleProps) {
  const { toast } = useToast();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ojsConnected, setOjsConnected] = useState<boolean | null>(null);
  const [isSsoEnabled, setIsSsoEnabled] = useState(true);
  const [ojsFeedback, setOjsFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newSubmission, setNewSubmission] = useState({
    title: '',
    author: 'Ahmad Fauzi',
    abstract: '',
    keywords: '',
    journalCategory: 'Jurnal Komputer Nasional (JKN)'
  });

  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  useEffect(() => {
    fetchJournals();
    fetchStatus();
  }, []);

  async function fetchJournals() {
    setLoading(true);
    setError(null);
    try {
      const data: any = await api.getOJSJournals();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setJournals(list);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStatus() {
    try {
      const status = await api.getOJSStatus();
      setOjsConnected(status.connected);
    } catch {
      setOjsConnected(false);
    }
  }

  const handleManuscriptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubmission.title || !newSubmission.abstract) return;

    setSubmitting(true);
    setOjsFeedback(null);
    try {
      const result = await api.submitOJSManuscript({
        title: newSubmission.title,
        abstract: newSubmission.abstract,
        author: newSubmission.author,
        keywords: newSubmission.keywords,
        journalCategory: newSubmission.journalCategory,
      });

      if (result.source === 'local') {
        setOjsFeedback(result.message || 'OJS v3 tidak terjangkau. Manuskrip disimpan di database lokal.');
      } else {
        setOjsFeedback(`Berhasil! ID OJS: ${result.ojsId || '-'}`);
      }

      setIsSubmitSuccessful(true);
      await fetchJournals();

      setTimeout(() => {
        setIsSubmitSuccessful(false);
        setOjsFeedback(null);
        setNewSubmission({
          title: '',
          author: 'Ahmad Fauzi',
          abstract: '',
          keywords: '',
          journalCategory: 'Jurnal Komputer Nasional (JKN)'
        });
      }, 3000);
    } catch (err: any) {
      setOjsFeedback(`Gagal: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">

      {/* HEADER PORTAL */}
      <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">PORTAL E-JOURNAL OJS INTEGRASI</span>
          {ojsConnected === true && (
            <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
              <Wifi className="w-3 h-3" /> OJS v3 TERHUBUNG
            </span>
          )}
          {ojsConnected === false && (
            <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
              <WifiOff className="w-3 h-3" /> LOKAL SAJA
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Integrasi Jurnal Ilmiah (OJS)</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Sinkronisasi artikel riset mahasiswa & dosen secara langsung ke repositori Open Journal Systems v3.</p>
      </div>

      {/* Widgets info */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <p className="text-[9px] text-slate-400 uppercase font-bold">Total Publikasi</p>
          <h3 className="text-2xl font-extrabold mt-1.5">{loading ? '...' : journals.length} Jurnal</h3>
          <p className="text-[10px] text-emerald-500 font-bold mt-1">Integrasi OJS v3</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <p className="text-[9px] text-slate-400 uppercase font-bold">Draf Menunggu Review</p>
          <h3 className="text-2xl font-extrabold mt-1.5">{loading ? '...' : journals.filter(j => j.status === 'Dalam Reviewer').length} Manuskrip</h3>
          <p className="text-[10px] text-indigo-500 mt-1">Workflow Peer Review</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <p className="text-[9px] text-slate-400 uppercase font-bold">Integrasi Portal</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-bold">{isSsoEnabled ? 'SSO ON' : 'DISABLED'}</span>
            <button
              onClick={() => setIsSsoEnabled(!isSsoEnabled)}
              className="text-xs text-indigo-500 font-bold hover:underline"
            >
              Toggle
            </button>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <p className="text-[9px] text-slate-400 uppercase font-bold">Koneksi OJS v3</p>
          <div className="flex items-center mt-1.5 gap-1.5">
            <div className={`w-2 h-2 rounded-full ${ojsConnected === true ? 'bg-emerald-500' : ojsConnected === false ? 'bg-amber-500' : 'bg-slate-300'}`} />
            <span className="text-xs font-bold">
              {ojsConnected === true ? 'Terhubung' : ojsConnected === false ? 'Offline (DB Lokal)' : '...'}
            </span>
          </div>
          <button onClick={fetchStatus} className="text-[9px] text-indigo-500 hover:underline mt-1 flex items-center gap-0.5">
            <RefreshCw className="w-3 h-3" /> Cek Koneksi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Author Submit manuscript Column */}
        <div className={`p-6 rounded-2xl border lg:col-span-1 ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-800'} h-fit`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">Ajukan Manuskrip Baru</h3>

          {isSubmitSuccessful ? (
            <div className="text-center py-6 text-emerald-500 bg-emerald-500/10 border border-emerald-500/15 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold">Manuskrip Berhasil Diunggah!</p>
              {ojsFeedback && <p className="text-[10px] text-slate-400 mt-1">{ojsFeedback}</p>}
            </div>
          ) : (
            <form onSubmit={handleManuscriptSubmit} className="space-y-3 text-xs">
              {ojsFeedback && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/15 text-red-500 text-[10px] font-bold">
                  {ojsFeedback}
                </div>
              )}
              <div>
                <label className="text-slate-500 font-semibold mb-1 block">Judul Penelitian</label>
                <input
                  type="text"
                  required
                  value={newSubmission.title}
                  onChange={(e) => setNewSubmission({ ...newSubmission, title: e.target.value })}
                  placeholder="cth: Analisis Skalabilitas Web GIS DIY"
                  className={`w-full p-2.5 rounded-xl border-slate-200 border mt-1 outline-none text-xs ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                />
              </div>

              <div>
                <label className="text-slate-500 font-semibold mb-1 block">Abstrak</label>
                <textarea
                  required
                  rows={3}
                  value={newSubmission.abstract}
                  onChange={(e) => setNewSubmission({ ...newSubmission, abstract: e.target.value })}
                  placeholder="Tulis abstrak maksimal 200 patah kata..."
                  className={`w-full p-2.5 rounded-xl border-slate-200 border mt-1 outline-none text-xs ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                />
              </div>

              <div>
                <label className="text-slate-500 font-semibold mb-1 block">Kategori Jurnal</label>
                <select
                  value={newSubmission.journalCategory}
                  onChange={(e) => setNewSubmission({ ...newSubmission, journalCategory: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border-slate-200 border mt-1 outline-none text-xs ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                >
                  <option value="Jurnal Komputer Nasional (JKN)">Jurnal Komputer Nasional (JKN)</option>
                  <option value="Jurnal Syariah & Pranata Sosial">Jurnal Syariah & Pranata Sosial</option>
                  <option value="Jurnal Keguruan & Pendidikan">Jurnal Keguruan & Pendidikan</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Mengirim...' : 'Unggah Jurnal Ke OJS'}
              </button>
            </form>
          )}
        </div>

        {/* Directory list of published materials */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Arsip Riset Terpublikasi</h3>
            <button
              onClick={fetchJournals}
              className="text-[10px] text-indigo-500 hover:underline flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-xs font-bold">Memuat jurnal...</span>
            </div>
          ) : error ? (
            <div className={`p-6 rounded-2xl border text-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-xs text-red-400 font-bold">Gagal Memuat Data</p>
              <p className="text-[10px] text-slate-400 mt-1">{error}</p>
              <button onClick={fetchJournals} className="mt-3 text-xs text-indigo-500 hover:underline">
                Coba Lagi
              </button>
            </div>
          ) : journals.length === 0 ? (
            <div className={`p-6 rounded-2xl border text-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-bold">Belum ada jurnal</p>
              <p className="text-[10px] text-slate-400 mt-1">Ajukan manuskrip pertama Anda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {journals.map((j) => (
                <div
                  key={j.id}
                  className={`p-4 rounded-2xl border transition hover:bg-slate-50/50 ${isDark ? 'bg-zinc-900 border-zinc-850' : 'bg-white border-slate-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded font-bold">{j.journalCategory}</span>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">Imp. Factor: {j.impactFactor}</span>
                  </div>

                  <h4 className="font-bold text-xs mt-3 leading-tight font-display">{j.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Ditulis oleh: <b>{j.author}</b> &bull; Publikasi: {j.publishedAt} ({j.issue})</p>

                  <div className="border-t border-slate-100 dark:border-zinc-800/80 mt-4 pt-3 flex justify-between items-center text-[10px]">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${j.status === 'Terbit' ? 'bg-emerald-500/10 text-emerald-500' : j.status === 'Ditolak' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {j.status}
                    </span>

                    <button
                      className="text-indigo-500 hover:underline font-bold flex items-center gap-1"
                      onClick={() => toast(`Mengunduh draf naskah PDF: ${j.title}`, 'info')}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Unduh PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
