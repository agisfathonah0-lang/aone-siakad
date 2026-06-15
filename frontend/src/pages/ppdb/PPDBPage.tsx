import { useState, useEffect, useCallback } from 'react';
import { get, post } from '../../api/client';
import type { PPDB } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Search, Eye, Upload } from 'lucide-react';

const statusBadge: Record<string, 'warning' | 'info' | 'success' | 'danger'> = { baru: 'warning', verifikasi: 'info', diterima: 'success', ditolak: 'danger', daftar_ulang: 'success' };

export default function PPDBPage() {
  const [data, setData] = useState<PPDB[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [detail, setDetail] = useState<PPDB | null>(null);
  const [detailModal, setDetailModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadPendaftar, setUploadPendaftar] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({ nama: '', url: '' });

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try { const res = await get<PPDB[]>('/ppdb'); setData(res || []); }
    catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = async (id: string) => {
    try { const r = await get<PPDB>(`/ppdb/${id}`); setDetail(r); setDetailModal(true); }
    catch (err: any) { alert(err.message); }
  };

  const openUpload = (id: string) => { setUploadPendaftar(id); setUploadForm({ nama: '', url: '' }); setUploadModal(true); };

  const submitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPendaftar) return;
    try {
      await post(`/ppdb/${uploadPendaftar}/upload-dokumen`, { dokumen: [uploadForm] });
      setUploadModal(false);
      if (detail?.id === uploadPendaftar) { const r = await get<PPDB>(`/ppdb/${uploadPendaftar}`); setDetail(r); }
    } catch (err: any) { alert(err.response?.data?.message || 'Gagal upload dokumen'); }
  };

  const updateStatus = async (id: string, status: string) => {
    try { await post(`/ppdb/${id}/status`, { status }); fetchData(); setDetailModal(false); }
    catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const columns = [
    { key: 'nomor_daftar', label: 'No. Daftar' }, { key: 'nama', label: 'Nama' },
    { key: 'prodi_nama', label: 'Prodi' }, { key: 'jalur_pendaftaran', label: 'Jalur' },
    { key: 'status', label: 'Status', render: (r: PPDB) => <Badge variant={statusBadge[r.status as keyof typeof statusBadge] || 'default'}>{r.status}</Badge> },
    { key: 'id', label: '', render: (r: PPDB) => <button onClick={() => openDetail(r.id)} className="text-indigo-500 hover:underline text-xs font-bold flex items-center gap-1"><Eye size={14} /> Detail</button> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">PPDB</h1>
      </div>
      <DataTable columns={columns} data={data} loading={loading} error={error} onRefresh={fetchData} emptyMessage="Belum ada pendaftar" />
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title="Detail Pendaftar" size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400 dark:text-zinc-500 text-xs">No. Daftar</span><p className="font-bold dark:text-white">{detail.nomor_daftar}</p></div>
              <div><span className="text-slate-400 dark:text-zinc-500 text-xs">Status</span><p><Badge variant={statusBadge[detail.status as keyof typeof statusBadge] || 'default'}>{detail.status}</Badge></p></div>
              <div><span className="text-slate-400 dark:text-zinc-500 text-xs">Nama</span><p className="font-bold dark:text-white">{detail.nama}</p></div>
              <div><span className="text-slate-400 dark:text-zinc-500 text-xs">Prodi</span><p className="dark:text-zinc-300">{detail.prodi_nama || '-'}</p></div>
              <div><span className="text-slate-400 dark:text-zinc-500 text-xs">Jalur</span><p className="dark:text-zinc-300">{detail.jalur_pendaftaran || '-'}</p></div>
            </div>
            {detail.dokumen && detail.dokumen.length > 0 && (
              <div><h4 className="text-xs font-bold text-slate-500 mb-2">Dokumen</h4><div className="space-y-1">{detail.dokumen.map((d: any, i: number) => <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-indigo-600 dark:text-indigo-400 hover:underline">{d.nama}</a>)}</div></div>
            )}
            <button onClick={() => openUpload(detail.id)} className="w-full py-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition flex items-center justify-center gap-1.5"><Upload size={14} /> Upload Dokumen</button>
            {detail.data_pendaftar && Object.keys(detail.data_pendaftar).length > 0 && (
              <div><h4 className="text-xs font-bold text-slate-500 mb-2">Data Pendaftar</h4><pre className="text-xs bg-slate-50 dark:bg-zinc-800 p-3 rounded-xl overflow-auto max-h-40">{JSON.stringify(detail.data_pendaftar, null, 2)}</pre></div>
            )}
            {detail.status === 'baru' && (
              <div className="flex gap-2 pt-2">
                <button onClick={() => updateStatus(detail.id, 'verifikasi')} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700">Verifikasi</button>
              </div>
            )}
            {detail.status === 'verifikasi' && (
              <div className="flex gap-2 pt-2">
                <button onClick={() => updateStatus(detail.id, 'diterima')} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">Terima</button>
                <button onClick={() => updateStatus(detail.id, 'ditolak')} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700">Tolak</button>
              </div>
            )}
            {detail.status === 'diterima' && (
              <div className="flex gap-2 pt-2">
                <button onClick={() => updateStatus(detail.id, 'daftar_ulang')} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">Daftar Ulang</button>
              </div>
            )}
          </div>
        )}
      </Modal>
      <Modal open={uploadModal} onClose={() => setUploadModal(false)} title="Upload Dokumen">
        <form onSubmit={submitUpload} className="space-y-3">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Nama Dokumen</label><input required value={uploadForm.nama} onChange={e => setUploadForm({ ...uploadForm, nama: e.target.value })} placeholder="Ijazah, Rapor, dll" className="input-field" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">URL Dokumen</label><input required value={uploadForm.url} onChange={e => setUploadForm({ ...uploadForm, url: e.target.value })} placeholder="https://..." className="input-field" /></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-1.5"><Upload size={15} /> Upload</button>
        </form>
      </Modal>
    </div>
  );
}
