import React, { useState } from 'react';
import { INVOICE_LIST } from '../mockData';
import { Invoice } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard, FileCheck, ShieldAlert, CheckCircle2, TrendingUp, Search, Info,
  DollarSign, FileSpreadsheet, Plus, MessageSquare, AlertTriangle, Printer,
  Building, Check, X, QrCode, ClipboardList, Send, Percent, Coins, RotateCw
} from 'lucide-react';

interface FinanceModuleProps {
  currentView: string;
  isDark: boolean;
}

export default function FinanceModule({ currentView, isDark }: FinanceModuleProps) {
  // Local CRUD invoice list
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICE_LIST);
  const [searchInvoiceQuery, setSearchInvoiceQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Student billing interactive simulation states
  const [studentInvoice, setStudentInvoice] = useState<Invoice>({
    id: 'INV-2026-889',
    nim: '20220801001',
    studentName: 'Ahmad Fauzi',
    prodi: 'Sistem Informasi',
    amount: 7500000,
    type: 'UKT Semester Ganjil 2025/2026',
    status: 'Belum Bayar',
    dueDate: '2026-07-31',
    payments: []
  });
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [simulatedPaymentStep, setSimulatedPaymentStep] = useState<'SELECT' | 'VA' | 'PAID'>('SELECT');
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [copiedVa, setCopiedVa] = useState(false);

  // Manual payment verification slips
  const [manualSlips, setManualSlips] = useState([
    { id: 'SLP-001', nim: '20210202022', name: 'Nur Aisyah', amount: 5000000, bank: 'BSI (Bank Syariah Indonesia)', time: '2026-06-02 09:12', slipUrl: '#', notes: 'Pembayaran UKT PGMI Semester 6', status: 'Pending' },
    { id: 'SLP-002', nim: '20210103009', name: 'Dedi Saputra', amount: 3000000, bank: 'Mandiri Transfer', time: '2026-06-01 15:44', slipUrl: '#', notes: 'Cicilan UKT ke-1 Syariah', status: 'Pending' }
  ]);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Scholarship/Installment control states
  const [scholarshipList, setScholarshipList] = useState([
    { id: 'SCH-01', name: 'Ahmad Fauzi', prodi: 'Sistem Informasi', scheme: 'KIP Kuliah Kemendikbud', coverage: 'Full (100%)', status: 'Aktif' },
    { id: 'SCH-02', name: 'Siti Rahmawati', prodi: 'Ekonomi Syariah', scheme: 'Beasiswa Tahfidz Al-Quran', coverage: 'Full (100%)', status: 'Aktif' },
    { id: 'SCH-03', name: 'Nur Aisyah', prodi: 'PGMI', scheme: 'Prestasi Akademik Rektorat', coverage: 'Parsial (50%)', status: 'Disetujui' }
  ]);
  const [newSchName, setNewSchName] = useState('');
  const [newSchScheme, setNewSchScheme] = useState('KIP Kuliah Kemendikbud');
  const [newSchProdi, setNewSchProdi] = useState('Sistem Informasi');
  const [newSchCoverage, setNewSchCoverage] = useState('Full (100%)');
  const [showAddSchForm, setShowAddSchForm] = useState(false);

  const handleVerifyInvoicePayment = (id: string) => {
    setInvoices(invoices.map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          status: 'Lunas',
          payments: [
            { date: '2026-06-02', amount: inv.amount, method: 'Virtual Account Mandiri (Verified SaaS)' }
          ]
        };
      }
      return inv;
    }));
    
    // Update local selected state
    if (selectedInvoice?.id === id) {
      setSelectedInvoice({
        ...selectedInvoice,
        status: 'Lunas',
        payments: [
          { date: '2026-06-02', amount: selectedInvoice.amount, method: 'Virtual Account Mandiri (Verified SaaS)' }
        ]
      });
    }
  };

  const handleGiveScholarship = (id: string) => {
    setInvoices(invoices.map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          status: 'Lunas',
          payments: [
            { date: '2026-06-02', amount: inv.amount, method: 'Beasiswa Unggulan Pemda RI' }
          ]
        };
      }
      return inv;
    }));
    
    if (selectedInvoice?.id === id) {
      setSelectedInvoice({
        ...selectedInvoice,
        status: 'Lunas',
        payments: [
          { date: '2026-06-02', amount: selectedInvoice.amount, method: 'Beasiswa Unggulan Pemda RI' }
        ]
      });
    }
  };

  const handleApproveSlip = (slipId: string) => {
    setManualSlips(manualSlips.map(slp => {
      if (slp.id === slipId) {
        return { ...slp, status: 'Disetujui' };
      }
      return slp;
    }));
    setFeedbackMsg(`Pembayaran slip #${slipId} telah berhasil diverifikasi SAH! Rekening koran sinkron.`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleRejectSlip = (slipId: string) => {
    setManualSlips(manualSlips.map(slp => {
      if (slp.id === slipId) {
        return { ...slp, status: 'Ditolak' };
      }
      return slp;
    }));
    setFeedbackMsg(`Bukti setoran slip #${slipId} ditolak. Notifikasi perbaikan terkirim ke pendaftar.`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleAddScholarship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchName) return;

    const fresh = {
      id: 'SCH-' + String(scholarshipList.length + 1).padStart(2, '0'),
      name: newSchName,
      prodi: newSchProdi,
      scheme: newSchScheme,
      coverage: newSchCoverage,
      status: 'Aktif'
    };

    setScholarshipList([fresh, ...scholarshipList]);
    setNewSchName('');
    setShowAddSchForm(false);
    setFeedbackMsg(`Skema penerima Beasiswa baru bagi ${fresh.name} sukses didaftarkan!`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const simulateStudentPayment = () => {
    setIsProcessingPay(true);
    setTimeout(() => {
      setIsProcessingPay(false);
      setSimulatedPaymentStep('PAID');
      setStudentInvoice({
        ...studentInvoice,
        status: 'Lunas',
        payments: [{
          date: '2026-06-02',
          amount: studentInvoice.amount,
          method: `Virtual Account ${selectedBank?.toUpperCase() || 'BSI'}`,
          receiptUrl: '#'
        }]
      });
      // Also update INVOICE_LIST values if any matches Ahmad Fauzi
      setInvoices(invoices.map(inv => {
        if (inv.nim === studentInvoice.nim) {
          return {
            ...inv,
            status: 'Lunas',
            payments: [{ date: '2026-06-02', amount: inv.amount, method: `VA ${selectedBank}`, receiptUrl: '#' }]
          };
        }
        return inv;
      }));
    }, 1500);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv =>
    inv.studentName.toLowerCase().includes(searchInvoiceQuery.toLowerCase()) ||
    inv.nim.includes(searchInvoiceQuery) ||
    inv.id.includes(searchInvoiceQuery)
  );

  const totalRevenue = invoices.filter(i => i.status === 'Lunas').reduce((sum, i) => sum + i.amount, 0);
  const totalArrears = invoices.filter(i => i.status === 'Belum Bayar' || i.status === 'Terlambat').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6 font-sans">
      {feedbackMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-155">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{feedbackMsg}</span>
          </div>
          <button 
            onClick={() => setFeedbackMsg('')}
            className="text-emerald-450 hover:text-emerald-500 font-extrabold uppercase text-[10px]"
          >
            Tutup [X]
          </button>
        </div>
      )}
      
      {/* KEUANGAN DASHBOARD OVERVIEWS */}
      {currentView === 'keuangan_dashboard' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">MODUL KEUANGAN & UKT</span>
            <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Dashboard Finansial Perguruan Tinggi</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Ikhtisar real-time tagihan mahasiswa, sisa piutang UKT tertunggak, dan pendapatan operasional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pendapatan UKT Masuk</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 font-mono mt-2">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
              <p className="text-[10px] text-slate-400 mt-2">Akumulasi VA Lunas semester ini</p>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Piutang / Penunggakan UKT</p>
              <h3 className="text-2xl font-extrabold text-rose-500 font-mono mt-2">Rp {totalArrears.toLocaleString('id-ID')}</h3>
              <p className="text-[10px] text-slate-400 mt-2">Tagihan jatuh tempo belum diselesaikan</p>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Penerima Beasiswa Kampus</p>
              <h3 className="text-2xl font-extrabold mt-2 text-indigo-500">240 Mahasiswa</h3>
              <p className="text-[10px] text-slate-400 mt-2">Total subsidi UKT: Rp 1.2 Miliar</p>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200'}`}>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Success Rate Pembayaran</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 font-mono mt-2">78.2%</h3>
              <p className="text-[10px] text-slate-400 mt-2">Grafik meningkat drastis dibanding bulan lalu</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Visual breakdown of payment methods chart */}
            <div className={`p-6 rounded-2xl border lg:col-span-2 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <h3 className="font-bold text-sm font-display mb-4">Metode Bayar Paling Diminati</h3>
              <div className="space-y-4">
                {[
                  { method: 'Virtual Account Bank BSI', share: '45%', amount: 'Rp 6.3 Miliar', bg: 'bg-emerald-600' },
                  { method: 'Virtual Account Bank Mandiri', share: '30%', amount: 'Rp 4.2 Miliar', bg: 'bg-indigo-600' },
                  { method: 'Virtual Account Bank BNI', share: '15%', amount: 'Rp 2.1 Miliar', bg: 'bg-indigo-505' },
                  { method: 'Pemotongan Beasiswa & Subsidi', share: '10%', amount: 'Rp 1.4 Miliar', bg: 'bg-amber-500' }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{item.method}</span>
                      <span className="font-mono text-slate-400">{item.amount} ({item.share})</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.bg} rounded-full`} style={{ width: item.share }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial alert center */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-200'}`}>
              <h3 className="font-bold text-sm font-display mb-4">Pusat Alert & Kebijakan Billing</h3>
              <div className="space-y-4">
                <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/15 rounded-xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-yellow-600">Pemberitahuan KIP Kuliah Gantung</h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Sesi rekonsiliasi data beasiswa KIP dengan LLDIKTI selesai. 45 kouta disiapkan rilis.</p>
                  </div>
                </div>
                
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/15 rounded-xl flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-600">Automasi Pembukuan VA Aktif</h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Log transaksi Virtual Account BNI & BSI terhubung aman dengan SLA respon &lt; 2 detik.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ADMIN TABLE: LIST INVOICES */}
      {currentView === 'tagihan_mhs' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-2xl font-bold font-display tracking-tight">Tagihan & Rekap Billing UKT</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Kelola master invoice, tagihan rilis, Virtual Account bank, dan ekspor data tagihan prodi.</p>
          </div>

          <div className="flex gap-4">
            <div className={`flex-1 relative border rounded-xl overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchInvoiceQuery}
                onChange={(e) => setSearchInvoiceQuery(e.target.value)}
                placeholder="Cari tagihan berdasarkan NIM, ID Invoice, atau nama mahasiswa..."
                className="w-full pl-10 pr-4 py-2.5 bg-transparent outline-none text-xs"
              />
            </div>
            
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-750 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
              <Plus className="w-4 h-4" />
              Rilis Tagihan Baru
            </button>
          </div>

          {selectedInvoice && (
            <div className={`p-6 rounded-2xl border relative ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute right-4 top-4 hover:opacity-75 text-xs font-bold"
              >
                Tutup [X]
              </button>

              <div className="flex gap-4 items-center mb-6">
                <div className="w-10 h-10 bg-indigo-600 font-bold text-white rounded-xl flex items-center justify-center">INV</div>
                <div>
                  <h3 className="font-bold text-sm font-display">Rincian Invoice: #{selectedInvoice.id}</h3>
                  <p className="text-xs text-slate-500">{selectedInvoice.studentName} (NIM: {selectedInvoice.nim}) | {selectedInvoice.prodi}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-indigo-500/10 mb-4 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Jumlah Tagihan</span>
                  <p className="text-sm font-extrabold mt-0.5">Rp {selectedInvoice.amount.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Kategori Tagihan</span>
                  <p className="text-sm font-bold mt-0.5">{selectedInvoice.type}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Jatuh Tempo</span>
                  <p className="text-sm font-bold mt-0.5">{selectedInvoice.dueDate}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Status Veriv</span>
                  <p className={`text-sm font-extrabold mt-0.5 ${selectedInvoice.status === 'Lunas' ? 'text-emerald-500' : 'text-rose-500'}`}>{selectedInvoice.status}</p>
                </div>
              </div>

              {selectedInvoice.payments.length > 0 ? (
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold uppercase text-slate-400">Riwayat Setoran Pembayaran</h4>
                  <div className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-xl mt-2 text-xs">
                    <p className="font-semibold">{selectedInvoice.payments[0].method}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Waktu Verifikasi: {selectedInvoice.payments[0].date} - Jumlah: <b>Rp {selectedInvoice.payments[0].amount.toLocaleString('id-ID')}</b></p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-rose-500/10 border border-rose-500/15 rounded-xl text-xs text-rose-500 mb-6 flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Belum ada aktivitas setoran masuk dari Virtual Account pendaftar.</p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                {selectedInvoice.status !== 'Lunas' && (
                  <>
                    <button
                      onClick={() => handleVerifyInvoicePayment(selectedInvoice.id)}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      Verifikasi Lunas Manual
                    </button>
                    <button
                      onClick={() => handleGiveScholarship(selectedInvoice.id)}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-bold"
                    >
                      Beri Subsidi Beasiswa (100%)
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setFeedbackMsg(`Sistem premium aktif: Berhasil mengompilasi draf cetak PDF kuitansi transaksi #${selectedInvoice.id} ke folder download!`);
                    setTimeout(() => setFeedbackMsg(''), 5000);
                  }}
                  className="px-4 py-1.5 border border-slate-350 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Invoice PDF
                </button>
              </div>

            </div>
          )}

          {/* Grid list table */}
          <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? 'bg-zinc-900 border-zinc-805' : 'bg-white border-slate-205'}`}>
            <table className="w-full text-left font-sans">
              <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-950 text-zinc-400 border-b border-zinc-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}`}>
                <tr>
                  <th className="p-4">No. Invoice</th>
                  <th className="p-4">Mahasiswa</th>
                  <th className="p-4">Program Studi</th>
                  <th className="p-4">Jumlah Billing</th>
                  <th className="p-4">Jenis Tagihan</th>
                  <th className="p-4">Status Bayar</th>
                  <th className="p-4 text-right">Navigasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-850 text-xs">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-zinc-850/40">
                    <td className="p-4 font-mono font-bold text-slate-400">{inv.id}</td>
                    <td className="p-4">
                      <p className="font-bold">{inv.studentName}</p>
                      <p className="text-[10px] font-mono text-slate-500">NIM: {inv.nim}</p>
                    </td>
                    <td className="p-4">{inv.prodi}</td>
                    <td className="p-4 font-mono font-bold text-emerald-600">Rp {inv.amount.toLocaleString('id-ID')}</td>
                    <td className="p-4 font-semibold text-slate-400">{inv.type}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${inv.status === 'Lunas' ? 'bg-emerald-500/10 text-emerald-500' : inv.status === 'Dicicil' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100'}`}
                      >
                        Kelola VA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* STUDENT INDIVIDUAL UKT VIEW (mhs_tagihan) */}
      {currentView === 'mhs_tagihan' && (
        <div className="space-y-6 animate-in fade-in max-w-4xl">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-500 font-mono">PORTAL MAHASISWA & RENCANA BELAJAR</span>
            <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Tagihan & Portal Pembayaran UKT Anda</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Silakan melunasi tagihan registrasi semester agar dapat mengisi atau mengajukan Kartu Rencana Studi (KRS).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Invoice card detail */}
            <div className={`p-6 rounded-2xl border md:col-span-2 space-y-4 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono font-bold text-slate-400">{studentInvoice.id}</span>
                  <h3 className="font-bold text-lg font-display mt-1">{studentInvoice.type}</h3>
                  <p className="text-xs text-slate-400">Atas nama: <b>{studentInvoice.studentName} ({studentInvoice.nim})</b></p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${studentInvoice.status === 'Lunas' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {studentInvoice.status === 'Lunas' ? 'LUNAS TERVERIFIKASI' : 'BELUM DIBAYAR'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Beban UKT Pokok</span>
                  <span className="font-semibold">Rp {studentInvoice.amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Subsidi / Beasiswa</span>
                  <span className="text-emerald-500 font-semibold">- Rp 0</span>
                </div>
                <div className="border-t border-slate-200 dark:border-zinc-800 pt-2 flex justify-between text-xs font-bold">
                  <span>Total Tagihan Bayar</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">Rp {studentInvoice.amount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {studentInvoice.status === 'Lunas' ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Tagihan Selesai Diposkan</span>
                  </div>
                  <p>Terima kasih. Dana Virtual Account VA Anda sebesar <b>Rp {studentInvoice.amount.toLocaleString('id-ID')}</b> telah tuntas masuk ke Rektorat Bank Mandiri.</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-2">Diverifikasi tanggal: {studentInvoice.payments[0]?.date} - VA code: MHS-88019-92X106</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {simulatedPaymentStep === 'SELECT' ? (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-500">Pilih Saluran Pembayaran Virtual Account:</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'bsi', name: 'Bank Syariah Indonesia (BSI)', image: 'BSI' },
                          { key: 'bni', name: 'Bank Negara Indonesia (BNI)', image: 'BNI' },
                          { key: 'mandiri', name: 'Bank Mandiri', image: 'MND' },
                          { key: 'bri', name: 'Bank Rakyat Indonesia (BRI)', image: 'BRI' }
                        ].map((bank) => (
                          <button
                            key={bank.key}
                            onClick={() => setSelectedBank(bank.key)}
                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${selectedBank === bank.key ? 'border-emerald-600 bg-emerald-50/10 dark:bg-zinc-800/60 dark:border-emerald-500' : 'border-slate-200 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40'}`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-650/10 font-bold text-sm text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                              {bank.image}
                            </div>
                            <div>
                              <p className="text-xs font-bold leading-none">{bank.name}</p>
                              <p className="text-[9px] text-slate-400 mt-1">Interlock instan</p>
                            </div>
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          if (!selectedBank) {
                            setFeedbackMsg('Silakan pilih salah satu Bank Virtual Account.');
                            setTimeout(() => setFeedbackMsg(''), 5000);
                            return;
                          }
                          setSimulatedPaymentStep('VA');
                        }}
                        className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition"
                      >
                        Buka Virtual Account
                      </button>
                    </div>
                  ) : simulatedPaymentStep === 'VA' ? (
                    <div className="p-5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <p className="text-slate-400">Rincian Saluran VA Utama:</p>
                          <p className="font-bold text-indigo-500 uppercase mt-1">Bank {selectedBank?.toUpperCase()}</p>
                        </div>
                        <QrCode className="w-8 h-8 text-slate-400" />
                      </div>

                      <div className="p-4 bg-slate-100/50 dark:bg-zinc-900 rounded-xl text-center space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kode Virtual Account (VA)</p>
                        <h4 className="text-xl font-mono font-extrabold text-indigo-600 tracking-wider">
                          {selectedBank === 'bsi' ? '880520220801001' : selectedBank === 'bni' ? '988520220801001' : '880190220801001'}
                        </h4>
                        <button
                          onClick={() => {
                            setCopiedVa(true);
                            setTimeout(() => setCopiedVa(false), 2000);
                          }}
                          className="text-[10px] text-emerald-500 font-bold hover:underline"
                        >
                          {copiedVa ? 'Salin Sukses!' : 'Klik untuk Salin Kode'}
                        </button>
                      </div>

                      <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center gap-2 font-bold mb-1">
                          <RotateCw className="w-4 h-4 text-indigo-400 animate-spin" />
                          <span>Simulasi Sandbox Gerbang Kampus:</span>
                        </div>
                        <p className="leading-relaxed">Klik tombol di bawah ini untuk mensimulasikan transfer VA bank secara otomatis seolah Anda sudah menyelesaikan setoran ATM/M-Banking!</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSimulatedPaymentStep('SELECT')}
                          className="px-4 py-2 border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 rounded-xl text-xs font-bold"
                        >
                          Ganti Metode
                        </button>
                        
                        <button
                          onClick={simulateStudentPayment}
                          disabled={isProcessingPay}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-750 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          {isProcessingPay ? 'Menghubungkan Gate...' : 'Eksekusi Simulasi Bayar VA'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Instruction column */}
            <div className={`p-6 rounded-2xl border h-fit space-y-4 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-1.5 border-b border-slate-150 pb-2">
                <Info className="w-4 h-4 text-emerald-500" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Petunjuk Cara Bayar</h4>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <h5 className="font-bold">1. Melalui M-Banking Kampus:</h5>
                  <p className="text-slate-400 text-[11px] mt-0.5">Buka aplikasi mobile banking Anda, pilih menu Transfer &gt; Virtual Account, masukkan kode VA Anda, lalu ketik jumlah bayar penuh.</p>
                </div>
                <div>
                  <h5 className="font-bold">2. Melalui Transfer ATM Bersama:</h5>
                  <p className="text-slate-400 text-[11px] mt-0.5">Gunakan ATM terdekat, pilih Transfer Antar Bank, masukkan kode Bank tujuan followed by Virtual Account number.</p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-rose-500 font-semibold leading-relaxed">
                  *Penting: Jangan mengubah nominal tagihan transfer agar server sinkronisasi PDDIKTI dapat memverifikasi status Anda dalam waktu detik secara otomatis.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VERIFIKASI PEMBAYARAN MANUAL (Accountant checking ledger) */}
      {currentView === 'verifikasi_pembayaran' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">FINANCIAL AUDIT DIVISION</span>
            <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Verifikasi Setoran Manual & Slip Slip Transfer</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Verifikasikan bukti transfer yang diunggah oleh pendaftar PMB jalur Mandiri atau mahasiswa di luar kanal integrasi VA.</p>
          </div>

          {feedbackMsg && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 rounded-xl text-xs font-semibold">
              {feedbackMsg}
            </div>
          )}

          <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-205'}`}>
            <table className="w-full text-left font-sans">
              <thead className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-950 text-zinc-400 border-b border-zinc-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'}`}>
                <tr>
                  <th className="p-4">Kode Slip</th>
                  <th className="p-4">Mahasiswa / NIM</th>
                  <th className="p-4">Tujuan Bank / Catatan</th>
                  <th className="p-4">Nominal Dilaporkan</th>
                  <th className="p-4">Waktu Setor</th>
                  <th className="p-4">Status Veriv</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-850 text-xs">
                {manualSlips.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-zinc-850/40">
                    <td className="p-4 font-mono font-bold text-slate-400">{item.id}</td>
                    <td className="p-4">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">NIM: {item.nim}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold">{item.bank}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 italic">"{item.notes}"</p>
                    </td>
                    <td className="p-4 font-mono font-bold">Rp {item.amount.toLocaleString('id-ID')}</td>
                    <td className="p-4 text-slate-400 font-mono">{item.time}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${item.status === 'Disetujui' ? 'bg-emerald-500/10 text-emerald-500' : item.status === 'Ditolak' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {item.status === 'Pending' ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleApproveSlip(item.id)}
                            className="p-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold flex items-center gap-1 transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Sah
                          </button>
                          <button
                            onClick={() => handleRejectSlip(item.id)}
                            className="p-1 px-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-bold flex items-center gap-1 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Selesai diperiksa</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CICILAN & BEASISWA CONTROL BOARD */}
      {currentView === 'cicilan_beasiswa' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">FINANCIAL WELFARE PANEL</span>
              <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Cicilan & Database Beasiswa Mahasiswa</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Daftarkan peserta beasiswa bidikmisi, beasiswa yayasan, serta konfigurasikan cicilan UKT mahasiswa (Dispensasi).</p>
            </div>

            <button
              onClick={() => setShowAddSchForm(!showAddSchForm)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Daftarkan Syarat Beasiswa
            </button>
          </div>

          {feedbackMsg && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 rounded-xl text-xs font-semibold animate-bounce">
              {feedbackMsg}
            </div>
          )}

          {showAddSchForm && (
            <form onSubmit={handleAddScholarship} className={`p-6 rounded-2xl border space-y-4 max-w-2xl animate-in slide-in-from-top-4 duration-150 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <h3 className="font-bold text-sm font-display">Hubungkan Penerima Beasiswa Baru:</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-500 font-semibold mb-1 block">Nama Mahasiswa</label>
                  <input
                    type="text"
                    required
                    value={newSchName}
                    onChange={(e) => setNewSchName(e.target.value)}
                    placeholder="cth: Muhammad Rizki"
                    className={`w-full p-2.5 rounded-xl border mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold mb-1 block">Lembaga Beasiswa / Skema</label>
                  <select
                    value={newSchScheme}
                    onChange={(e) => setNewSchScheme(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                  >
                    <option value="KIP Kuliah Kemendikbud">KIP Kuliah Kemendikbud</option>
                    <option value="Beasiswa Tahfidz Al-Quran">Beasiswa Tahfidz Al-Quran</option>
                    <option value="Prestasi Akademik Rektorat">Prestasi Akademik Rektorat</option>
                    <option value="Beasiswa Indonesia Bangkit (Kemenag)">Beasiswa Indonesia Bangkit (Kemenag)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 font-semibold mb-1 block">Program Studi Mahasiswa</label>
                  <input
                    type="text"
                    value={newSchProdi}
                    onChange={(e) => setNewSchProdi(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold mb-1 block">Cakupan Subsidi Potongan</label>
                  <select
                    value={newSchCoverage}
                    onChange={(e) => setNewSchCoverage(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border mt-1 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50'}`}
                  >
                    <option value="Full (100%)">Gratis Penuh (100% Core)</option>
                    <option value="Parsial (75%)">Subsidi Tinggi (75%)</option>
                    <option value="Parsial (50%)">Subsidi Sedang (50%)</option>
                    <option value="Parsial (25%)">Subsidi Ringan (25%)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddSchForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold"
                >
                  Daftarkan Skema
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Active scholarship list */}
            <div className={`md:col-span-2 border rounded-2xl overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-205'}`}>
              <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-950/20">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Database Penerima Beasiswa Aktif</h3>
                <span className="text-[10px] font-mono text-slate-400">{scholarshipList.length} Penerima</span>
              </div>
              
              <table className="w-full text-left font-sans text-xs">
                <thead className={`text-[10px] font-bold uppercase tracking-wider border-b ${isDark ? 'bg-zinc-950 text-zinc-400 border-zinc-800' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  <tr>
                    <th className="p-3">Nama Mahasiswa</th>
                    <th className="p-3">Program Studi</th>
                    <th className="p-3">Kategori Beasiswa</th>
                    <th className="p-3">Cakupan Potong</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                  {scholarshipList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/10">
                      <td className="p-3 font-bold">{item.name}</td>
                      <td className="p-3 text-slate-400">{item.prodi}</td>
                      <td className="p-3 font-semibold text-indigo-500">{item.scheme}</td>
                      <td className="p-3 font-bold text-emerald-500">{item.coverage}</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 font-bold">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dispensasi Cicilan Info cards */}
            <div className={`p-6 rounded-2xl border space-y-4 h-fit ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex gap-2 items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
                <Coins className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Regulasi Dispensasi Cicilan</h3>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                Universitas memberi kelonggaran pembayaran UKT mahasiswa menjadi maksimal 3 kali cicilan terstruktur dalam jangka waktu semester berjalan.
              </p>

              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-indigo-50/20 dark:bg-zinc-950 rounded-xl">
                  <h5 className="font-bold text-xs">Cicilan ke-1 (Maks 50%)</h5>
                  <p className="text-[11px] text-slate-400 mt-1">Lunas sebelum pekan Kartu Rencana Studi (KRS) dimulai.</p>
                </div>
                <div className="p-3 bg-indigo-50/20 dark:bg-zinc-950 rounded-xl">
                  <h5 className="font-bold text-xs">Cicilan ke-2 (Sisa 25%)</h5>
                  <p className="text-[11px] text-slate-400 mt-1">Lunas H-7 sebelum Ujian Tengah Semester (UTS).</p>
                </div>
                <div className="p-3 bg-indigo-50/20 dark:bg-zinc-950 rounded-xl">
                  <h5 className="font-bold text-xs">Cicilan ke-3 (Sisa 25%)</h5>
                  <p className="text-[11px] text-slate-400 mt-1">Lunas H-7 sebelum Ujian Akhir Semester (UAS).</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DETAILED FINANCIAL LAPORAN CHARTS (laporan_pendapatan) */}
      {currentView === 'laporan_pendapatan' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-500 font-mono">REKTORAT FINANCIAL ANALYTICS</span>
              <h2 className="text-2xl font-bold font-display tracking-tight mt-0.5">Analisa Laporan Pendapatan</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Analisa pembukuan keuangan bulanan, realisasi anggaran, target per fakultas, dan ekspor data.</p>
            </div>

            <button
              onClick={() => {
                setFeedbackMsg('Fitur premium SaaS aktif: Mengunduh Laporan Keuangan format Excel (.xlsx) dengan bagan grafik neraca... Sinkronisasi rukun keuangan selesai!');
                setTimeout(() => setFeedbackMsg(''), 6000);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Ekspor Buku Laporan CSV
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Faculty Target breakdown visual meter rows */}
            <div className={`p-6 rounded-2xl border md:col-span-2 space-y-5 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <h3 className="font-bold text-sm font-display border-b border-slate-100 dark:border-zinc-800 pb-2">Kolektifitas Target Anggaran per Fakultas</h3>
              
              <div className="space-y-4 text-xs font-sans">
                {[
                  { faculty: 'Fakultas Sains & Teknologi (FST)', percent: 88, collected: 'Rp 4.4 M', target: 'Rp 5.0 M', color: 'bg-emerald-500' },
                  { faculty: 'Fakultas Ekonomi & Bisnis Islam (FEBI)', percent: 75, collected: 'Rp 2.2 M', target: 'Rp 3.0 M', color: 'bg-indigo-500' },
                  { faculty: 'Fakultas Ilmu Tarbiyah & Keguruan (FITK)', percent: 92, collected: 'Rp 2.7 M', target: 'Rp 3.0 M', color: 'bg-teal-500' },
                  { faculty: 'Fakultas Syariah (FS)', percent: 60, collected: 'Rp 1.2 M', target: 'Rp 2.0 M', color: 'bg-amber-500' }
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold">{item.faculty}</span>
                      <span className="font-mono text-slate-400">{item.collected} / {item.target} (<b>{item.percent}%</b>)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inflow ledger checklist */}
            <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <h3 className="font-bold text-sm font-display border-b border-slate-100 dark:border-zinc-800 pb-2">Rencana Anggaran & Realisasi</h3>
              
              <div className="space-y-3 font-sans text-xs">
                <div className="flex justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/20">
                  <span className="text-slate-400">Biaya Gaji Pegawai & Dosen</span>
                  <span className="font-bold">Rp 1.4 M / bulan</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/20">
                  <span className="text-slate-400">Infrastruktur Server Cloud & LMS</span>
                  <span className="font-bold text-indigo-500">Rp 180 Juta / bulan</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/20">
                  <span className="text-slate-400">Operasional Laboratorium & Sarana</span>
                  <span className="font-bold">Rp 350 Juta / bulan</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/20">
                  <span className="text-slate-400">Subsidi Kegiatan Kemahasiswaan</span>
                  <span className="font-bold">Rp 120 Juta / bulan</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
