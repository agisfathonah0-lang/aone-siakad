import { Printer, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { StrukPembayaran } from '../../types';

interface Props {
  struk: StrukPembayaran;
  onClose: () => void;
}

const statusLabel: Record<string, string> = { settlement: 'Lunas', pending: 'Menunggu', expired: 'Kedaluwarsa', deny: 'Ditolak', cancel: 'Dibatalkan' };
const statusIcon: Record<string, typeof CheckCircle> = { settlement: CheckCircle, pending: Clock, expired: AlertCircle, deny: AlertCircle, cancel: AlertCircle };
const statusColor: Record<string, string> = { settlement: 'text-emerald-600 dark:text-emerald-400', pending: 'text-amber-600 dark:text-amber-400', expired: 'text-red-600 dark:text-red-400', deny: 'text-red-600 dark:text-red-400', cancel: 'text-slate-500 dark:text-zinc-400' };

export default function StrukPembayaran({ struk, onClose }: Props) {
  const Icon = statusIcon[struk.status] || Clock;

  const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl shadow-black/10 receipt-print">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/50 dark:border-zinc-700/30 print:hidden">
            <h2 className="font-semibold text-sm text-slate-800 dark:text-zinc-100">Struk Pembayaran</h2>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all">
                <Printer size={14} /> Cetak
              </button>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"><X size={16} /></button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="text-center border-b border-dashed border-slate-200 dark:border-zinc-700 pb-4">
              <h1 className="text-lg font-bold font-display tracking-tight text-emerald-600 dark:text-emerald-400">STRUK PEMBAYARAN</h1>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{struk.receipt_number}</p>
            </div>

            <div className="flex items-center justify-center gap-2 py-2">
              <Icon size={20} className={statusColor[struk.status] || 'text-slate-500'} />
              <span className={`text-sm font-bold ${statusColor[struk.status] || 'text-slate-500'}`}>
                {statusLabel[struk.status] || struk.status}
              </span>
            </div>

            <div className="space-y-2.5 text-sm">
              <Row label="NIM" value={struk.nim} />
              <Row label="Mahasiswa" value={struk.mahasiswa_nama} />
              <Row label="Program Studi" value={struk.prodi} />
              <Row label="Angkatan" value={String(struk.angkatan)} />
              <div className="border-t border-dashed border-slate-200 dark:border-zinc-700 pt-2.5" />
              <Row label="Tahun Akademik" value={struk.tahun_akademik} />
              <Row label="Semester" value={struk.semester} />
              <Row label="Jenis Tagihan" value={struk.jenis_tagihan.replace('_', ' ')} />
              <Row label="Nominal Tagihan" value={rupiah(struk.nominal_tagihan)} />
              <Row label="Nominal Dibayar" value={rupiah(struk.nominal_dibayar)} highlight />
              {struk.cicilan_ke && <Row label="Cicilan Ke-" value={String(struk.cicilan_ke)} />}
              <div className="border-t border-dashed border-slate-200 dark:border-zinc-700 pt-2.5" />
              <Row label="Metode" value={struk.metode === 'midtrans_snap' ? 'Midtrans' : (struk.metode || '-')} />
              <Row label="Tanggal Bayar" value={struk.paid_at ? new Date(struk.paid_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'} />
              {struk.midtrans_order_id && <Row label="Midtrans Order" value={struk.midtrans_order_id} />}
            </div>

            <div className="text-center border-t border-dashed border-slate-200 dark:border-zinc-700 pt-4 text-xs text-slate-400 space-y-1">
              <p>Terima kasih telah melakukan pembayaran tepat waktu.</p>
              <p className="font-mono">{struk.receipt_number}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-500 dark:text-zinc-400">{label}</span>
      <span className={`font-semibold text-right dark:text-white ${highlight ? 'text-emerald-600 dark:text-emerald-400 text-base' : ''}`}>{value}</span>
    </div>
  );
}
