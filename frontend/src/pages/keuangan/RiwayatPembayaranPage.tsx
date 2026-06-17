import { useState, useEffect } from 'react';
import { getPaginated, get } from '../../api/client';
import { toast } from '../../context/ToastContext';
import type { Pembayaran, StrukPembayaran } from '../../types';
import Badge from '../../components/ui/Badge';
import StrukPembayaranModal from '../../components/keuangan/StrukPembayaran';
import DataTable from '../../components/ui/DataTable';
import { Search, Eye, CreditCard } from 'lucide-react';

const statusBadge: Record<string, 'success' | 'warning' | 'danger'> = { settlement: 'success', pending: 'warning', expired: 'danger', deny: 'danger', cancel: 'danger' };

export default function RiwayatPembayaranPage() {
  const [data, setData] = useState<Pembayaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterSearch, setFilterSearch] = useState('');
  const [receiptStruk, setReceiptStruk] = useState<StrukPembayaran | null>(null);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      let url = `/keuangan/pembayaran/me?page=${page}`;
      if (filterSearch) url += `&search=${filterSearch}`;
      const res = await getPaginated<Pembayaran>(url);
      setData(res?.rows || []);
      setTotalPages(res?.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, filterSearch]);
  useEffect(() => { setPage(1); }, [filterSearch]);

  const showStruk = async (id: string) => {
    try {
      const struk = await get<StrukPembayaran>(`/keuangan/pembayaran/${id}/struk`);
      setReceiptStruk(struk);
    } catch (err: any) {
      toast(err.response?.data?.message || err.message, 'error');
    }
  };

  const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const columns = [
    { key: 'created_at', label: 'Tanggal', render: (r: Pembayaran) => r.created_at ? new Date(r.created_at).toLocaleDateString('id') : '-' },
    { key: 'tahun_akademik', label: 'TA' },
    { key: 'semester', label: 'Sem' },
    { key: 'jenis', label: 'Jenis', render: (r: Pembayaran) => (r.jenis || '').replace('_', ' ') },
    { key: 'nominal', label: 'Nominal', render: (r: Pembayaran) => rupiah(r.nominal) },
    { key: 'metode', label: 'Metode', render: (r: Pembayaran) => r.metode === 'midtrans_snap' ? 'Midtrans' : (r.metode || '-') },
    { key: 'status', label: 'Status', render: (r: Pembayaran) => <Badge variant={statusBadge[r.status as keyof typeof statusBadge] || 'default'}>{r.status}</Badge> },
    { key: 'struk', label: '', render: (r: Pembayaran) => (
      <button onClick={() => showStruk(r.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg" title="Lihat Struk"><Eye size={14} /></button>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Riwayat Pembayaran</h1>
      </div>
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} placeholder="Cari..." className="input-field pl-9 pr-3 py-1.5 text-xs" />
      </div>
      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />
      {receiptStruk && <StrukPembayaranModal struk={receiptStruk} onClose={() => setReceiptStruk(null)} />}
    </div>
  );
}
