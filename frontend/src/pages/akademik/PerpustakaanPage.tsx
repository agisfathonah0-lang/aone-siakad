import { useState, useEffect, useCallback } from 'react';
import { get, getPaginated, post, put, del as apiDel } from '../../api/client';
import type { Buku, AnggotaPerpustakaan, PeminjamanBuku, Mahasiswa } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Plus, Pencil, Trash2, Book, Search, UserCheck, UserX, BookOpen, BookMarked, Clock, DollarSign, RefreshCw } from 'lucide-react';

const kategoriList = ['Referensi', 'Fiksi', 'Pendidikan', 'Jurnal', 'Skripsi', 'Lainnya'];

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  dipinjam: 'warning',
  dikembalikan: 'success',
  terlambat: 'danger',
};

export default function PerpustakaanPage() {
  const [tab, setTab] = useState<'buku' | 'anggota' | 'peminjaman'>('buku');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight dark:text-white">Perpustakaan</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Manajemen buku, anggota, dan peminjaman</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-zinc-700/30">
        {(['buku', 'anggota', 'peminjaman'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              tab === t ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}>
            {t === 'buku' ? 'Buku' : t === 'anggota' ? 'Anggota' : 'Peminjaman'}
          </button>
        ))}
      </div>

      {tab === 'buku' && <BukuSection />}
      {tab === 'anggota' && <AnggotaSection />}
      {tab === 'peminjaman' && <PeminjamanSection />}
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
