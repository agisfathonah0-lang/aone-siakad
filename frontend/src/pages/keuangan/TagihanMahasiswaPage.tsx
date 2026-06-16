import { useState, useEffect } from 'react';
import { get, post } from '../../api/client';
import type { Tagihan } from '../../types';
import Badge from '../../components/ui/Badge';
import { CreditCard, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const statusBadge: Record<string, 'warning' | 'success' | 'danger'> = { pending: 'warning', lunas: 'success', overdue: 'danger' };
const statusIcon: Record<string, typeof Clock> = { pending: Clock, lunas: CheckCircle, overdue: AlertCircle };
const statusLabel: Record<string, string> = { pending: 'Belum Dibayar', lunas: 'Lunas', overdue: 'Terlambat' };

export default function TagihanMahasiswaPage() {
  const [tagihanList, setTagihanList] = useState<Tagihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', 'SB-Mid-client-YOUR_KEY');
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const data = await get<Tagihan[]>('/keuangan/tagihan/me');
      setTagihanList(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const handleBayar = async (tagihan: Tagihan) => {
    setPayingId(tagihan.id);
    try {
      const result = await post<{ snap_token: string }>('/keuangan/pembayaran/midtrans-snap', {
        tagihan_id: tagihan.id,
        mahasiswa_id: tagihan.mahasiswa_id,
        nominal: tagihan.nominal,
      });
      (window as any).snap.pay(result.snap_token, {
        onSuccess: () => fetchData(),
        onPending: () => fetchData(),
        onError: () => fetchData(),
        onClose: () => { setPayingId(null); },
      });
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
      setPayingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <Loader2 className="w-5 h-5 animate-spin mr-2" />
      <span className="text-sm font-medium">Memuat tagihan...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-red-400">
      <AlertCircle className="w-8 h-8 mb-2" />
      <p className="text-sm font-medium">Gagal memuat tagihan</p>
      <p className="text-xs mt-1">{error}</p>
      <button onClick={fetchData} className="mt-3 text-xs text-indigo-500 hover:underline">Coba Lagi</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Tagihan Saya</h1>
        <button onClick={fetchData} className="text-xs text-indigo-500 hover:underline">Refresh</button>
      </div>

      {tagihanList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <CheckCircle className="w-10 h-10 mb-3 text-emerald-400" />
          <p className="text-sm font-medium">Tidak ada tagihan</p>
          <p className="text-xs mt-1">Semua tagihan Anda sudah lunas</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tagihanList.map((t) => {
            const Icon = statusIcon[t.status as keyof typeof statusIcon] || Clock;
            return (
              <div key={t.id} className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mb-0.5">
                      {t.tahun_akademik} - Semester {t.semester}
                    </p>
                    <p className="text-sm font-semibold dark:text-white capitalize">{t.jenis.replace('_', ' ')}</p>
                  </div>
                  <Badge variant={statusBadge[t.status as keyof typeof statusBadge] || 'default'}>
                    {statusLabel[t.status as keyof typeof statusLabel] || t.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold font-display tracking-tight text-emerald-600 dark:text-emerald-400">
                    {rupiah(t.nominal)}
                  </p>
                  {t.status !== 'lunas' && (
                    <button
                      onClick={() => handleBayar(t)}
                      disabled={payingId === t.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20"
                    >
                      {payingId === t.id ? (
                        <><Loader2 size={14} className="animate-spin" /> Memproses</>
                      ) : (
                        <><CreditCard size={14} /> Bayar Sekarang</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
