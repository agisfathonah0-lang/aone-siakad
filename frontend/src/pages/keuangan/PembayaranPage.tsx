import { useState, useEffect, useCallback } from 'react';
import { getPaginated, post, get } from '../../api/client';
import type { Pembayaran, Tagihan, Mahasiswa } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Eye, Search, RefreshCw } from 'lucide-react';

const statusBadge: Record<string, 'success' | 'warning' | 'danger'> = { settlement: 'success', pending: 'warning', expired: 'danger', deny: 'danger', cancel: 'danger' };

export default function PembayaranPage() {
  const [data, setData] = useState<Pembayaran[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState<Pembayaran | null>(null);
  const [form, setForm] = useState({ tagihan_id: '', mahasiswa_id: '', nominal: 0, metode: 'manual' });
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [tagihanList, setTagihanList] = useState<Tagihan[]>([]);
  const [filterSearch, setFilterSearch] = useState('');
  const [midtransLoading, setMidtransLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', 'SB-Mid-client-YOUR_KEY');
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let url = `/keuangan/pembayaran?page=${page}`;
      if (filterSearch) url += `&search=${filterSearch}`;
      const res = await getPaginated<Pembayaran>(url); setData(res?.rows || []); setTotalPages(res?.pagination?.totalPages || 1);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }, [page, filterSearch]);
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => { getPaginated<Mahasiswa>('/akademik/mahasiswa?limit=500').then(r => setMahasiswaList(r?.rows || [])).catch(() => {}); }, []);

  useEffect(() => { setPage(1); }, [filterSearch]);

  const loadTagihan = async (mahasiswaId: string) => {
    if (!mahasiswaId) { setTagihanList([]); return; }
    try {
      const res = await getPaginated<Tagihan>(`/keuangan/tagihan?mahasiswa_id=${mahasiswaId}&limit=100`);
      setTagihanList(res?.rows || []);
    } catch { setTagihanList([]); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await post('/keuangan/pembayaran/manual', form); setModal(false); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const handleMidtrans = async () => {
    if (!form.tagihan_id || !form.mahasiswa_id) { alert('Pilih mahasiswa dan tagihan terlebih dahulu'); return; }
    setMidtransLoading(true);
    try {
      const result = await post<{ snap_token: string }>('/keuangan/pembayaran/midtrans-snap', {
        tagihan_id: form.tagihan_id,
        mahasiswa_id: form.mahasiswa_id,
      });
      (window as any).snap.pay(result.snap_token, {
        onSuccess: () => { fetchData(); setModal(false); },
        onPending: () => { fetchData(); },
        onError: () => { fetchData(); },
        onClose: () => {},
      });
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally { setMidtransLoading(false); }
  };

  const openDetail = (r: Pembayaran) => {
    setDetailItem(r);
    setDetailModal(true);
  };

  const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const columns = [
    { key: 'nim', label: 'NIM' }, { key: 'mahasiswa_nama', label: 'Mahasiswa' },
    { key: 'nominal', label: 'Nominal', render: (r: Pembayaran) => rupiah(r.nominal) },
    { key: 'metode', label: 'Metode' },
    { key: 'status', label: 'Status', render: (r: Pembayaran) => <Badge variant={statusBadge[r.status as keyof typeof statusBadge] || 'default'}>{r.status}</Badge> },
    { key: 'paid_at', label: 'Dibayar', render: (r: Pembayaran) => r.paid_at ? new Date(r.paid_at).toLocaleDateString('id') : '-' },
    { key: 'detail', label: '', render: (r: Pembayaran) => (
      <button onClick={() => openDetail(r)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg" title="Detail"><Eye size={14} /></button>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Pembayaran</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">+ Tambah</button>
      </div>
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} placeholder="Cari NIM/Nama..." className="input-field pl-9 pr-3 py-1.5 text-xs" />
      </div>
      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />
      <Modal open={modal} onClose={() => setModal(false)} title="Tambah Pembayaran">
        <form onSubmit={save} className="space-y-3">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Mahasiswa</label>
            <select required value={form.mahasiswa_id} onChange={(e) => { setForm({ ...form, mahasiswa_id: e.target.value, tagihan_id: '' }); loadTagihan(e.target.value); }} className="input-field">
              <option value="">Pilih Mahasiswa</option>
              {mahasiswaList.map((m) => <option key={m.id} value={m.id}>{m.nim} - {m.nama}</option>)}
            </select>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tagihan</label>
            <select required value={form.tagihan_id} onChange={(e) => setForm({ ...form, tagihan_id: e.target.value })} className="input-field">
              <option value="">Pilih Tagihan</option>
              {tagihanList.map((t) => <option key={t.id} value={t.id}>{rupiah(t.nominal)} - {t.jenis} ({t.status})</option>)}
            </select>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nominal</label><input type="number" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: parseInt(e.target.value) || 0 })} className="input-field" /></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Bayar Manual</button>
          <button type="button" disabled={midtransLoading} onClick={handleMidtrans} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20">
            {midtransLoading ? 'Memproses...' : 'Bayar via Midtrans'}
          </button>
        </form>
      </Modal>
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title="Detail Pembayaran">
        {detailItem && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">NIM</span><span className="font-semibold dark:text-white">{detailItem.nim}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Mahasiswa</span><span className="font-semibold dark:text-white">{detailItem.mahasiswa_nama}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Nominal</span><span className="font-semibold dark:text-white">{rupiah(detailItem.nominal)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Metode</span><span className="font-semibold dark:text-white">{detailItem.metode || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Status</span><Badge variant={statusBadge[detailItem.status as keyof typeof statusBadge] || 'default'}>{detailItem.status}</Badge></div>
            <div className="flex justify-between"><span className="text-slate-500 dark:text-zinc-400">Tanggal Bayar</span><span className="font-semibold dark:text-white">{detailItem.paid_at ? new Date(detailItem.paid_at).toLocaleDateString('id') : '-'}</span></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
