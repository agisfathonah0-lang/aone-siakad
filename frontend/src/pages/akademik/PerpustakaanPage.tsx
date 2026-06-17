import { useState, useEffect, useCallback } from 'react';
import { get, getPaginated, post, put, del as apiDel } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { Buku, AnggotaPerpustakaan, PeminjamanBuku, Mahasiswa } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import FileUpload from '../../components/ui/FileUpload';
import Badge from '../../components/ui/Badge';
import { Plus, Pencil, Trash2, Book, Search, UserCheck, UserX, BookOpen, BookMarked, Clock, DollarSign, RefreshCw, Download, FileText, ExternalLink, ArrowLeft, Library } from 'lucide-react';

const kategoriList = ['Referensi', 'Fiksi', 'Pendidikan', 'Jurnal', 'Skripsi', 'Lainnya'];

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  dipinjam: 'warning',
  dikembalikan: 'success',
  terlambat: 'danger',
};

export default function PerpustakaanPage() {
  const { user } = useAuth();
  const isMahasiswa = user?.role === 'mahasiswa';

  const [tab, setTab] = useState<'buku' | 'anggota' | 'peminjaman' | 'ebook' | 'repositori' | 'mahasiswa-buku' | 'mahasiswa-pinjamanku'>('buku');

  if (isMahasiswa) {
    const mTabs = [
      { key: 'mahasiswa-buku' as const, label: 'Cari Buku', icon: Search },
      { key: 'mahasiswa-pinjamanku' as const, label: 'Pinjamanku', icon: BookMarked },
      { key: 'ebook' as const, label: 'E-Book', icon: Download },
    ];
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Perpustakaan Digital</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-500">Katalog online dan peminjaman mandiri</p>
          </div>
        </div>
        <div className="flex gap-1 border-b border-slate-200 dark:border-zinc-700/30 overflow-x-auto no-scrollbar">
          {mTabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] whitespace-nowrap ${
                tab === t.key ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
        {tab === 'mahasiswa-buku' && <MahasiswaBukuSection />}
        {tab === 'mahasiswa-pinjamanku' && <MahasiswaPinjamankuSection />}
        {tab === 'ebook' && <EbookSection />}
      </div>
    );
  }

  const tabs = [
    { key: 'buku' as const, label: 'Buku', icon: Book },
    { key: 'anggota' as const, label: 'Anggota', icon: UserCheck },
    { key: 'peminjaman' as const, label: 'Peminjaman', icon: BookMarked },
    { key: 'ebook' as const, label: 'E-Book', icon: Download },
    { key: 'repositori' as const, label: 'Repository', icon: FileText },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Perpustakaan Digital</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Katalog online, e-book, repositori karya ilmiah, dan manajemen peminjaman</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-zinc-700/30 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] whitespace-nowrap ${
              tab === t.key ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'buku' && <BukuSection />}
      {tab === 'anggota' && <AnggotaSection />}
      {tab === 'peminjaman' && <PeminjamanSection />}
      {tab === 'ebook' && <EbookSection />}
      {tab === 'repositori' && <RepositoriSection />}
    </div>
  );
}

function MahasiswaBukuSection() {
  const [data, setData] = useState<Buku[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [borrowing, setBorrowing] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (searchTerm) params.set('search', searchTerm);
      if (filterKategori) params.set('kategori', filterKategori);
      const res = await getPaginated<Buku>(`/akademik/perpustakaan/buku?${params}`);
      setData(res.rows); setTotalPages(res.pagination.totalPages);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, searchTerm, filterKategori]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pinjamBuku = async (buku_id: string) => {
    setBorrowing(buku_id);
    try {
      await post('/akademik/perpustakaan/pinjam', { buku_id });
      alert('Buku berhasil dipinjam!');
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setBorrowing(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} placeholder="Cari judul/penulis/ISBN..." className="input-field pl-8" />
        </div>
        <select value={filterKategori} onChange={e => { setFilterKategori(e.target.value); setPage(1); }} className="input-field max-w-[150px]">
          <option value="">Semua Kategori</option>
          {kategoriList.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><RefreshCw size={16} /></button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Memuat...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Tidak ada buku ditemukan</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map(buku => (
              <div key={buku.id} className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 ring-1 ring-slate-200/50 dark:ring-zinc-800/30">
                <p className="font-bold text-sm dark:text-white truncate">{buku.judul}</p>
                <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">{buku.penulis || '-'}</p>
                <div className="flex items-center gap-2 mt-2">
                  {buku.kategori && <Badge variant="info">{buku.kategori}</Badge>}
                  <span className="text-[10px] text-slate-400 ml-auto">Tersedia: {buku.jumlah_tersedia}/{buku.jumlah_total}</span>
                </div>
                <button
                  onClick={() => pinjamBuku(buku.id)}
                  disabled={borrowing === buku.id || (buku.jumlah_tersedia ?? 0) <= 0}
                  className="w-full mt-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                  <Library size={13} />
                  {borrowing === buku.id ? 'Meminjam...' : (buku.jumlah_tersedia ?? 0) <= 0 ? 'Stok Habis' : 'Pinjam Buku'}
                </button>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MahasiswaPinjamankuSection() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [returning, setReturning] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await get<any[]>('/akademik/perpustakaan/peminjaman/me');
      setData(Array.isArray(res) ? res : []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const kembalikanBuku = async (id: string) => {
    setReturning(id);
    try {
      await put(`/akademik/perpustakaan/peminjaman/${id}/kembali`, {});
      alert('Buku berhasil dikembalikan!');
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
    finally { setReturning(null); }
  };

  if (loading) return <div className="text-center py-12 text-slate-400">Memuat...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{data.length} peminjaman</p>
        <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><RefreshCw size={16} /></button>
      </div>
      {data.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Belum ada peminjaman</div>
      ) : (
        data.map(p => (
          <div key={p.id} className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 ring-1 ring-slate-200/50 dark:ring-zinc-800/30 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm dark:text-white truncate">{p.judul_buku}</p>
              <p className="text-xs text-slate-400">{p.penulis || ''} {p.isbn ? `(${p.isbn})` : ''}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                <span>Pinjam: {new Date(p.created_at).toLocaleDateString('id-ID')}</span>
                <span>Jatuh tempo: {new Date(p.tanggal_jatuh_tempo).toLocaleDateString('id-ID')}</span>
                <Badge variant={statusVariant[p.status] || 'default'}>{p.status}</Badge>
              </div>
              {p.denda > 0 && <p className="text-[10px] text-red-500 mt-1">Denda: Rp{p.denda.toLocaleString('id-ID')}</p>}
            </div>
            {p.status !== 'dikembalikan' && (
              <button
                onClick={() => kembalikanBuku(p.id)}
                disabled={returning === p.id}
                className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50">
                {returning === p.id ? '...' : 'Kembalikan'}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function BukuSection() {
  const [data, setData] = useState<Buku[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Buku | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [form, setForm] = useState<Buku>({ id: '', judul: '', penulis: '', penerbit: '', isbn: '', tahun_terbit: undefined, edisi: '', kategori: '', lokasi: '', jumlah_total: 1, jumlah_tersedia: 1, deskripsi: '' });

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (searchTerm) params.set('search', searchTerm);
      if (filterKategori) params.set('kategori', filterKategori);
      const res = await getPaginated<Buku>(`/akademik/perpustakaan/buku?${params}`);
      setData(res.rows); setTotalPages(res.pagination.totalPages);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, searchTerm, filterKategori]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEdit(null);
    setForm({ id: '', judul: '', penulis: '', penerbit: '', isbn: '', tahun_terbit: new Date().getFullYear(), edisi: '', kategori: '', lokasi: '', jumlah_total: 1, jumlah_tersedia: 1, deskripsi: '' });
    setModal(true);
  };

  const openEdit = (row: Buku) => {
    setEdit(row);
    setForm({ ...row });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (edit) {
        await put(`/akademik/perpustakaan/buku/${edit.id}`, payload);
      } else {
        payload.jumlah_tersedia = payload.jumlah_total;
        await post('/akademik/perpustakaan/buku', payload);
      }
      setModal(false); fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Hapus buku ini?')) return;
    try {
      await apiDel(`/akademik/perpustakaan/buku/${id}`);
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const columns = [
    { key: 'judul', label: 'Judul' },
    { key: 'penulis', label: 'Penulis', render: (r: Buku) => r.penulis || '-' },
    { key: 'penerbit', label: 'Penerbit', render: (r: Buku) => r.penerbit || '-' },
    { key: 'isbn', label: 'ISBN', render: (r: Buku) => r.isbn || '-' },
    { key: 'kategori', label: 'Kategori', render: (r: Buku) => r.kategori ? <Badge variant="info">{r.kategori}</Badge> : '-' },
    { key: 'jumlah_tersedia', label: 'Tersedia/Total', render: (r: Buku) => `${r.jumlah_tersedia}/${r.jumlah_total}` },
    { key: 'id', label: '', render: (r: Buku) => (
      <div className="flex gap-1 justify-end">
        <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => remove(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} placeholder="Cari judul/penulis/isbn..." className="input-field pl-8" />
          </div>
          <select value={filterKategori} onChange={e => { setFilterKategori(e.target.value); setPage(1); }} className="input-field max-w-[160px]">
            <option value="">Semua Kategori</option>
            {kategoriList.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><RefreshCw size={16} /></button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah Buku</button>
        </div>
      </div>

      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Buku' : 'Tambah Buku'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Judul</label><input required value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Penulis</label><input value={form.penulis || ''} onChange={e => setForm({ ...form, penulis: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Penerbit</label><input value={form.penerbit || ''} onChange={e => setForm({ ...form, penerbit: e.target.value })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">ISBN</label><input value={form.isbn || ''} onChange={e => setForm({ ...form, isbn: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun Terbit</label><input type="number" value={form.tahun_terbit || ''} onChange={e => setForm({ ...form, tahun_terbit: parseInt(e.target.value) || undefined })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Edisi</label><input value={form.edisi || ''} onChange={e => setForm({ ...form, edisi: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Kategori</label><select value={form.kategori || ''} onChange={e => setForm({ ...form, kategori: e.target.value })} className="input-field"><option value="">Pilih Kategori</option>{kategoriList.map(k => <option key={k} value={k}>{k}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Lokasi</label><input value={form.lokasi || ''} onChange={e => setForm({ ...form, lokasi: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jumlah Total</label><input type="number" value={form.jumlah_total} onChange={e => setForm({ ...form, jumlah_total: parseInt(e.target.value) || 1 })} className="input-field" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Deskripsi</label><textarea value={form.deskripsi || ''} onChange={e => setForm({ ...form, deskripsi: e.target.value })} className="input-field" rows={3} /></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
    </div>
  );
}

function AnggotaSection() {
  const [data, setData] = useState<AnggotaPerpustakaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [selectedMhsId, setSelectedMhsId] = useState('');

  useEffect(() => {
    get<{ rows: Mahasiswa[] }>('/akademik/mahasiswa?limit=500').then(res => setMahasiswaList(res.rows || [])).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (searchTerm) params.set('search', searchTerm);
      const res = await getPaginated<AnggotaPerpustakaan>(`/akademik/perpustakaan/anggota?${params}`);
      setData(res.rows); setTotalPages(res.pagination.totalPages);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, searchTerm]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createAnggota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMhsId) return;
    try {
      await post('/akademik/perpustakaan/anggota', { mahasiswa_id: selectedMhsId });
      setModal(false); setSelectedMhsId(''); fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const toggleActive = async (row: AnggotaPerpustakaan) => {
    try {
      await put(`/akademik/perpustakaan/anggota/${row.id}`, { is_active: !row.is_active });
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Hapus anggota ini?')) return;
    try {
      await apiDel(`/akademik/perpustakaan/anggota/${id}`);
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const columns = [
    { key: 'kode_anggota', label: 'Kode Anggota' },
    { key: 'nim', label: 'NIM', render: (r: AnggotaPerpustakaan) => r.nim || '-' },
    { key: 'mahasiswa_nama', label: 'Nama', render: (r: AnggotaPerpustakaan) => r.mahasiswa_nama || '-' },
    { key: 'is_active', label: 'Status', render: (r: AnggotaPerpustakaan) => <Badge variant={r.is_active ? 'success' : 'danger'}>{r.is_active ? 'Aktif' : 'Nonaktif'}</Badge> },
    { key: 'id', label: '', render: (r: AnggotaPerpustakaan) => (
      <div className="flex gap-1 justify-end">
        <button onClick={() => toggleActive(r)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors" title={r.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
          {r.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
        </button>
        <button onClick={() => remove(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} placeholder="Cari kode atau nama..." className="input-field pl-8" />
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><RefreshCw size={16} /></button>
          <button onClick={() => setModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah Anggota</button>
        </div>
      </div>

      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />

      <Modal open={modal} onClose={() => setModal(false)} title="Tambah Anggota Perpustakaan">
        <form onSubmit={createAnggota} className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Pilih Mahasiswa</label>
            <select value={selectedMhsId} onChange={e => setSelectedMhsId(e.target.value)} className="input-field" required>
              <option value="">-- Pilih Mahasiswa --</option>
              {mahasiswaList.map(m => <option key={m.id} value={m.id}>{m.nim} - {m.nama}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Tambah</button>
        </form>
      </Modal>
    </div>
  );
}

function PeminjamanSection() {
  const [data, setData] = useState<PeminjamanBuku[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalTambah, setModalTambah] = useState(false);
  const [modalKembali, setModalKembali] = useState<PeminjamanBuku | null>(null);
  const [modalBayarDenda, setModalBayarDenda] = useState<PeminjamanBuku | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [bukuList, setBukuList] = useState<Buku[]>([]);
  const [anggotaList, setAnggotaList] = useState<AnggotaPerpustakaan[]>([]);

  const [formPinjam, setFormPinjam] = useState({ buku_id: '', anggota_id: '', tanggal_jatuh_tempo: '' });
  const [formBayar, setFormBayar] = useState({ nominal: 0, keterangan: '' });

  useEffect(() => {
    get<{ rows: Buku[] }>('/akademik/perpustakaan/buku?limit=500').then(res => setBukuList(res.rows || [])).catch(() => {});
    get<{ rows: AnggotaPerpustakaan[] }>('/akademik/perpustakaan/anggota?limit=500').then(res => setAnggotaList(res.rows || [])).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filterStatus) params.set('status', filterStatus);
      if (searchTerm) params.set('search', searchTerm);
      const res = await getPaginated<PeminjamanBuku>(`/akademik/perpustakaan/peminjaman?${params}`);
      setData(res.rows); setTotalPages(res.pagination.totalPages);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, filterStatus, searchTerm]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createPeminjaman = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await post('/akademik/perpustakaan/peminjaman', formPinjam);
      setModalTambah(false);
      setFormPinjam({ buku_id: '', anggota_id: '', tanggal_jatuh_tempo: '' });
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const kembalikanBuku = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalKembali) return;
    try {
      await put(`/akademik/perpustakaan/peminjaman/${modalKembali.id}/kembali`, {});
      setModalKembali(null);
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const bayarDenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalBayarDenda) return;
    try {
      await post(`/akademik/perpustakaan/denda/${modalBayarDenda.id}`, formBayar);
      setModalBayarDenda(null);
      setFormBayar({ nominal: 0, keterangan: '' });
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const defaultJatuhTempo = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const openTambah = () => {
    setFormPinjam({ buku_id: '', anggota_id: '', tanggal_jatuh_tempo: defaultJatuhTempo() });
    setModalTambah(true);
  };

  const columns = [
    { key: 'judul_buku', label: 'Buku', render: (r: PeminjamanBuku) => r.judul_buku || '-' },
    { key: 'anggota_nama', label: 'Anggota', render: (r: PeminjamanBuku) => r.anggota_nama || '-' },
    { key: 'tanggal_pinjam', label: 'Tgl Pinjam' },
    { key: 'tanggal_jatuh_tempo', label: 'Jatuh Tempo' },
    { key: 'tanggal_kembali', label: 'Tgl Kembali', render: (r: PeminjamanBuku) => r.tanggal_kembali || '-' },
    { key: 'status', label: 'Status', render: (r: PeminjamanBuku) => <Badge variant={statusVariant[r.status] || 'default'}>{r.status}</Badge> },
    { key: 'denda', label: 'Denda', render: (r: PeminjamanBuku) => r.denda && r.denda > 0 ? `Rp${r.denda.toLocaleString()}` : '-' },
    { key: 'id', label: '', render: (r: PeminjamanBuku) => (
      <div className="flex gap-1 justify-end">
        {r.status === 'dipinjam' && (
          <button onClick={() => setModalKembali(r)} className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors" title="Kembalikan"><BookMarked size={14} /></button>
        )}
        {r.status === 'terlambat' && r.denda && r.denda > 0 && (
          <button onClick={() => { setFormBayar({ nominal: r.denda || 0, keterangan: '' }); setModalBayarDenda(r); }} className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors" title="Bayar Denda"><DollarSign size={14} /></button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} placeholder="Cari mahasiswa..." className="input-field pl-8" />
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="input-field max-w-[180px]">
            <option value="">Semua Status</option>
            <option value="dipinjam">Dipinjam</option>
            <option value="dikembalikan">Dikembalikan</option>
            <option value="terlambat">Terlambat</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><RefreshCw size={16} /></button>
          <button onClick={openTambah} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah Peminjaman</button>
        </div>
      </div>

      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />

      <Modal open={modalTambah} onClose={() => setModalTambah(false)} title="Tambah Peminjaman">
        <form onSubmit={createPeminjaman} className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Buku</label>
            <select value={formPinjam.buku_id} onChange={e => setFormPinjam({ ...formPinjam, buku_id: e.target.value })} className="input-field" required>
              <option value="">-- Pilih Buku --</option>
              {bukuList.filter(b => b.jumlah_tersedia > 0).map(b => <option key={b.id} value={b.id}>{b.judul} (sisa {b.jumlah_tersedia})</option>)}
            </select>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Anggota</label>
            <select value={formPinjam.anggota_id} onChange={e => setFormPinjam({ ...formPinjam, anggota_id: e.target.value })} className="input-field" required>
              <option value="">-- Pilih Anggota --</option>
              {anggotaList.filter(a => a.is_active).map(a => <option key={a.id} value={a.id}>{a.kode_anggota} - {a.mahasiswa_nama || a.nim}</option>)}
            </select>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tanggal Jatuh Tempo</label>
            <input type="date" value={formPinjam.tanggal_jatuh_tempo} onChange={e => setFormPinjam({ ...formPinjam, tanggal_jatuh_tempo: e.target.value })} className="input-field" required />
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Simpan</button>
        </form>
      </Modal>

      <Modal open={!!modalKembali} onClose={() => setModalKembali(null)} title="Konfirmasi Pengembalian Buku">
        <form onSubmit={kembalikanBuku} className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Kembalikan buku <strong>{modalKembali?.judul_buku}</strong> oleh <strong>{modalKembali?.anggota_nama}</strong>?
          </p>
          <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20">Ya, Kembalikan</button>
        </form>
      </Modal>

      <Modal open={!!modalBayarDenda} onClose={() => setModalBayarDenda(null)} title="Bayar Denda">
        <form onSubmit={bayarDenda} className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Sisa Denda: Rp{(modalBayarDenda?.denda || 0).toLocaleString()}</label>
            <input type="number" value={formBayar.nominal} onChange={e => setFormBayar({ ...formBayar, nominal: parseInt(e.target.value) || 0 })} className="input-field" required min={1} max={modalBayarDenda?.denda || 0} />
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Keterangan</label>
            <input value={formBayar.keterangan} onChange={e => setFormBayar({ ...formBayar, keterangan: e.target.value })} className="input-field" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20">Bayar</button>
        </form>
      </Modal>
    </div>
  );
}

const ebookKategori = ['Pendidikan', 'Fiksi', 'Non-Fiksi', 'Referensi', 'Jurnal', 'Lainnya'];

interface Ebook {
  id: string; judul: string; penulis?: string; deskripsi?: string;
  kategori?: string; file_url?: string; cover_image?: string;
  tahun_terbit?: number; jumlah_download: number; is_published?: boolean;
}

function EbookSection() {
  const { user } = useAuth();
  const canManage = user && !['mahasiswa', 'dosen'].includes(user.role);
  const [data, setData] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Ebook | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [form, setForm] = useState<Ebook>({ id: '', judul: '', penulis: '', deskripsi: '', kategori: '', file_url: '', cover_image: '', tahun_terbit: new Date().getFullYear(), jumlah_download: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (searchTerm) params.set('search', searchTerm);
      if (filterKategori) params.set('kategori', filterKategori);
      const res = await getPaginated<Ebook>(`/akademik/perpustakaan/ebook?${params}`);
      setData(res.rows); setTotalPages(res.pagination.totalPages);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, searchTerm, filterKategori]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEdit(null);
    setForm({ id: '', judul: '', penulis: '', deskripsi: '', kategori: '', file_url: '', cover_image: '', tahun_terbit: new Date().getFullYear(), jumlah_download: 0 });
    setModal(true);
  };

  const openEdit = (row: Ebook) => { setEdit(row); setForm({ ...row }); setModal(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (edit) {
        await put(`/akademik/perpustakaan/ebook/${edit.id}`, form);
      } else {
        await post('/akademik/perpustakaan/ebook', form);
      }
      setModal(false); fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Hapus e-book ini?')) return;
    try {
      await apiDel(`/akademik/perpustakaan/ebook/${id}`);
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const download = async (row: Ebook) => {
    try {
      const res = await post<{ file_url: string; judul: string }>(`/akademik/perpustakaan/ebook/${row.id}/download`);
      if (res.file_url) window.open(res.file_url, '_blank');
      fetchData();
    } catch { }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} placeholder="Cari judul/penulis..." className="input-field pl-8" />
          </div>
          <select value={filterKategori} onChange={e => { setFilterKategori(e.target.value); setPage(1); }} className="input-field max-w-[160px]">
            <option value="">Semua</option>
            {ebookKategori.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><RefreshCw size={16} /></button>
          {canManage && <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah E-book</button>}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400">Memuat...</div>
      ) : error ? (
        <div className="text-center py-12 text-sm text-red-500">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-400 dark:text-zinc-500">Belum ada e-book</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map(ebook => (
              <div key={ebook.id} className="bg-white dark:bg-zinc-900/50 rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200/50 dark:ring-zinc-800/30 hover:shadow-md transition-all group">
                <div className="h-36 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 flex items-center justify-center">
                  {ebook.cover_image ? (
                    <img src={ebook.cover_image} alt={ebook.judul} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={40} className="text-indigo-300 dark:text-indigo-500/50" />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm dark:text-white truncate">{ebook.judul}</p>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{ebook.penulis || '-'}</p>
                  <div className="flex items-center justify-between mt-2">
                    {ebook.kategori && <Badge variant="info">{ebook.kategori}</Badge>}
                    <span className="text-[9px] text-slate-400">{ebook.jumlah_download} dl</span>
                  </div>
                  <div className="flex gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800/30">
                    {ebook.file_url && (
                      <button onClick={() => download(ebook)} className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-500 hover:text-emerald-600 transition-colors py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                        <Download size={11} /> Download
                      </button>
                    )}
                    {canManage && <button onClick={() => openEdit(ebook)} className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"><Pencil size={13} /></button>}
                    {canManage && <button onClick={() => remove(ebook.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit E-book' : 'Tambah E-book'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Judul</label><input required value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Penulis</label><input value={form.penulis || ''} onChange={e => setForm({ ...form, penulis: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun Terbit</label><input type="number" value={form.tahun_terbit || ''} onChange={e => setForm({ ...form, tahun_terbit: parseInt(e.target.value) || undefined })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Kategori</label><select value={form.kategori || ''} onChange={e => setForm({ ...form, kategori: e.target.value })} className="input-field"><option value="">Pilih</option>{ebookKategori.map(k => <option key={k} value={k}>{k}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Cover Image</label><FileUpload value={form.cover_image || ''} onChange={v => setForm({ ...form, cover_image: v })} accept="image/*" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">File E-book (PDF)</label><FileUpload value={form.file_url || ''} onChange={v => setForm({ ...form, file_url: v })} accept=".pdf" hint="Upload file PDF" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Deskripsi</label><textarea value={form.deskripsi || ''} onChange={e => setForm({ ...form, deskripsi: e.target.value })} className="input-field" rows={3} /></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
    </div>
  );
}

const repositoriJenis = ['skripsi', 'tesis', 'disertasi', 'makalah', 'laporan'];

interface RepositoriKarya {
  id: string; judul: string; penulis: string; nim?: string;
  pembimbing?: string; jenis: string; prodi_id?: string;
  tahun?: number; abstrak?: string; file_url?: string;
  status?: string; prodi_nama?: string;
}

function RepositoriSection() {
  const [data, setData] = useState<RepositoriKarya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<RepositoriKarya | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [prodiList, setProdiList] = useState<{ id: string; nama: string }[]>([]);
  const [form, setForm] = useState<RepositoriKarya>({ id: '', judul: '', penulis: '', nim: '', pembimbing: '', jenis: 'skripsi', prodi_id: '', tahun: new Date().getFullYear(), abstrak: '', file_url: '' });

  useEffect(() => {
    get<{ rows: { id: string; nama: string }[] }>('/akademik/prodi?limit=200').then(res => setProdiList(res.rows || [])).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (searchTerm) params.set('search', searchTerm);
      if (filterJenis) params.set('jenis', filterJenis);
      const res = await getPaginated<RepositoriKarya>(`/akademik/perpustakaan/repositori?${params}`);
      setData(res.rows); setTotalPages(res.pagination.totalPages);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, searchTerm, filterJenis]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEdit(null);
    setForm({ id: '', judul: '', penulis: '', nim: '', pembimbing: '', jenis: 'skripsi', prodi_id: '', tahun: new Date().getFullYear(), abstrak: '', file_url: '' });
    setModal(true);
  };

  const openEdit = (row: RepositoriKarya) => { setEdit(row); setForm({ ...row }); setModal(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (edit) {
        await put(`/akademik/perpustakaan/repositori/${edit.id}`, form);
      } else {
        await post('/akademik/perpustakaan/repositori', form);
      }
      setModal(false); fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Hapus karya ini?')) return;
    try {
      await apiDel(`/akademik/perpustakaan/repositori/${id}`);
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || err.message); }
  };

  const columns = [
    { key: 'judul', label: 'Judul' },
    { key: 'penulis', label: 'Penulis' },
    { key: 'nim', label: 'NIM', render: (r: RepositoriKarya) => r.nim || '-' },
    { key: 'jenis', label: 'Jenis', render: (r: RepositoriKarya) => <Badge variant="info">{r.jenis}</Badge> },
    { key: 'prodi_nama', label: 'Prodi', render: (r: RepositoriKarya) => r.prodi_nama || '-' },
    { key: 'tahun', label: 'Tahun', render: (r: RepositoriKarya) => r.tahun || '-' },
    { key: 'id', label: '', render: (r: RepositoriKarya) => (
      <div className="flex gap-1 justify-end">
        {r.file_url && <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors"><ExternalLink size={14} /></a>}
        <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => remove(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} placeholder="Cari judul/penulis..." className="input-field pl-8" />
          </div>
          <select value={filterJenis} onChange={e => { setFilterJenis(e.target.value); setPage(1); }} className="input-field max-w-[160px]">
            <option value="">Semua Jenis</option>
            {repositoriJenis.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><RefreshCw size={16} /></button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"><Plus size={14} /> Tambah Karya</button>
        </div>
      </div>

      <DataTable columns={columns} data={data} loading={loading} error={error} page={page} totalPages={totalPages} onPageChange={setPage} onRefresh={fetchData} />

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Karya Ilmiah' : 'Tambah Karya Ilmiah'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Judul</label><input required value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Penulis</label><input required value={form.penulis} onChange={e => setForm({ ...form, penulis: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">NIM</label><input value={form.nim || ''} onChange={e => setForm({ ...form, nim: e.target.value })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Pembimbing</label><input value={form.pembimbing || ''} onChange={e => setForm({ ...form, pembimbing: e.target.value })} className="input-field" /></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Tahun</label><input type="number" value={form.tahun || ''} onChange={e => setForm({ ...form, tahun: parseInt(e.target.value) || undefined })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Jenis</label><select value={form.jenis} onChange={e => setForm({ ...form, jenis: e.target.value })} className="input-field">{repositoriJenis.map(j => <option key={j} value={j}>{j}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Program Studi</label><select value={form.prodi_id || ''} onChange={e => setForm({ ...form, prodi_id: e.target.value })} className="input-field"><option value="">Pilih Prodi</option>{prodiList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}</select></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">File Karya</label><FileUpload value={form.file_url || ''} onChange={v => setForm({ ...form, file_url: v })} accept=".pdf" hint="Upload file PDF" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block mb-1.5">Abstrak</label><textarea value={form.abstrak || ''} onChange={e => setForm({ ...form, abstrak: e.target.value })} className="input-field" rows={4} /></div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">{edit ? 'Simpan' : 'Tambah'}</button>
        </form>
      </Modal>
    </div>
  );
}
