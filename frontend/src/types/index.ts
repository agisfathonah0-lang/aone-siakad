export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: { rows: T[]; pagination: Pagination };
  message?: string;
}

export type Role = 'vendor_super_admin' | 'super_admin' | 'rektor' | 'admin' | 'dekan' | 'akademik' | 'kaprodi' | 'keuangan' | 'pustakawan' | 'dosen' | 'mahasiswa' | 'calon_mahasiswa' | 'alumni';

export interface User {
  id: string;
  email: string;
  role: Role;
  nama: string;
  tenantId: string | null;
  vendorUserId?: string;
}

export interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  program_studi_id?: string;
  angkatan?: number;
  semester?: number;
  status?: string;
  ukt_golongan?: string;
  ukt_nominal?: number;
  email?: string;
  no_hp?: string;
  dosen_wali_id?: string;
  prodi_nama?: string;
  prodi_jenjang?: string;
  created_at?: string;
}

export interface Dosen {
  id: string;
  nidn?: string;
  nama: string;
  program_studi_id?: string;
  is_dosen_wali?: boolean;
  email?: string;
  no_hp?: string;
  prodi_nama?: string;
}

export interface MataKuliah {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  program_studi_id?: string;
  is_active?: boolean;
}

export interface Jadwal {
  id: string;
  mata_kuliah_id: string;
  dosen_id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  ruangan?: string;
  kelas?: string;
  kuota?: number;
  tahun_akademik: string;
  semester: string;
  is_active?: boolean;
  mk_nama?: string;
  mk_kode?: string;
  dosen_nama?: string;
  sks?: number;
}

export interface KRS {
  id: string;
  mahasiswa_id: string;
  jadwal_id: string;
  tahun_akademik: string;
  semester: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  mk_nama?: string;
  mk_kode?: string;
  sks?: number;
  dosen_nama?: string;
  hari?: string;
  jam_mulai?: string;
  jam_selesai?: string;
}

export interface Absensi {
  id: string;
  jadwal_id: string;
  mahasiswa_id: string;
  pertemuan: number;
  status: string;
  tanggal: string;
  mahasiswa_nama?: string;
  nim?: string;
}

export interface Nilai {
  id: string;
  krs_id: string;
  nilai_tugas?: number;
  nilai_uts?: number;
  nilai_uas?: number;
  nilai_akhir?: number;
  nilai_huruf?: string;
  bobot_tugas?: number;
  bobot_uts?: number;
  bobot_uas?: number;
  mk_nama?: string;
  mk_kode?: string;
  sks?: number;
  mahasiswa_nama?: string;
  nim?: string;
}

export interface Tagihan {
  id: string;
  mahasiswa_id: string;
  tahun_akademik: string;
  semester: string;
  nominal: number;
  jenis: string;
  status: string;
  mahasiswa_nama?: string;
  nim?: string;
}

export interface Pembayaran {
  id: string;
  tagihan_id: string;
  mahasiswa_id: string;
  nominal: number;
  metode?: string;
  status: string;
  paid_at?: string;
  mahasiswa_nama?: string;
  nim?: string;
}

export interface CmsSection {
  key: string;
  title?: string;
  content: Record<string, unknown>;
  is_published?: boolean;
}

export interface PPDB {
  id: string;
  nomor_daftar: string;
  nama: string;
  program_studi_id?: string;
  jalur_pendaftaran?: string;
  status: string;
  data_pendaftar?: Record<string, unknown>;
  dokumen?: Array<{ nama: string; url: string }>;
  prodi_nama?: string;
}

export interface Submission {
  id: string;
  title: string;
  abstract?: string;
  author?: string;
  keywords?: string;
  journal_category?: string;
  ojs_id?: string;
  source?: string;
  ojs_error?: string;
  status?: string;
}

export interface SyncRun {
  id: string;
  entity_type: string;
  records_synced: number;
  records_failed: number;
  status: string;
  errors?: unknown[];
  started_at: string;
  finished_at?: string;
}

export interface SyncStats {
  totalLogs: number;
  sukses: number;
  gagal: number;
  peringatan: number;
  ratio: string;
  totalSynced: number;
  totalFailed: number;
  recordCounts: Record<string, number>;
}

export interface AlumniTracer {
  id: string;
  user_id?: string;
  tahun_lulus: number;
  institusi?: string;
  pekerjaan?: string;
  gaji?: number;
  masa_tunggu?: number;
  kesesuaian?: string;
  kepuasan?: number;
  saran?: string;
  nama?: string;
  email?: string;
  nim?: string;
}

export interface EdomKuisioner {
  id: string;
  pertanyaan: string;
  aspek: string;
  is_active: boolean;
  urutan: number;
}

export interface EdomPeriode {
  id: string;
  nama: string;
  semester: string;
  tahun_akademik: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  is_active: boolean;
}

export interface EdomJadwal {
  id: string;
  periode_id: string;
  jadwal_id: string;
  mk_nama?: string;
  mk_kode?: string;
  dosen_nama?: string;
}

export interface EdomJawaban {
  edom_jadwal_id: string;
  kuisioner_id: string;
  mahasiswa_id: string;
  nilai: number;
  saran?: string;
}

export interface EdomRekapDosen {
  aspek: string;
  rata_rata: number;
  jumlah_jawaban: number;
  total_responden: number;
}

export interface EdomRingkasan {
  aspek: string;
  rata_rata: number;
  total_responden: number;
  total_jawaban: number;
}

export interface AlumniStats {
  total: number;
  avgGaji: number;
  avgMasaTunggu: number;
  kesesuaian: Array<{ kesesuaian: string; count: number }>;
}

export interface Buku {
  id: string;
  judul: string;
  penulis?: string;
  penerbit?: string;
  isbn?: string;
  tahun_terbit?: number;
  edisi?: string;
  kategori?: string;
  lokasi?: string;
  jumlah_total: number;
  jumlah_tersedia: number;
  deskripsi?: string;
}

export interface AnggotaPerpustakaan {
  id: string;
  mahasiswa_id: string;
  kode_anggota: string;
  is_active: boolean;
  nim?: string;
  mahasiswa_nama?: string;
}

export interface PeminjamanBuku {
  id: string;
  buku_id: string;
  anggota_id: string;
  tanggal_pinjam: string;
  tanggal_jatuh_tempo: string;
  tanggal_kembali?: string;
  status: string;
  denda?: number;
  judul_buku?: string;
  anggota_nama?: string;
  nim?: string;
}

export interface Akreditasi {
  id: string;
  program_studi_id?: string;
  jenis: string;
  peringkat?: string;
  skor?: number;
  nomor_sk?: string;
  tanggal_sk?: string;
  tanggal_kadaluarsa?: string;
  file_sk?: string;
  tahun_akreditasi: number;
  is_current: boolean;
  prodi_nama?: string;
  prodi_jenjang?: string;
}

export interface StandarAkreditasi {
  id: string;
  kode: string;
  nama: string;
  deskripsi?: string;
  bobot: number;
}

export interface DokumenAkreditasi {
  id: string;
  akreditasi_id: string;
  standar_id?: string;
  nama_dokumen: string;
  file_url?: string;
  keterangan?: string;
  status: string;
  standar_nama?: string;
  standar_kode?: string;
}

export interface Beasiswa {
  id: string;
  nama: string;
  jenis: string;
  penyelenggara?: string;
  nominal: number;
  kuota?: number;
  tahun_akademik: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  deskripsi?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface BeasiswaPenerima {
  id: string;
  beasiswa_id: string;
  mahasiswa_id: string;
  tanggal_daftar: string;
  status: string;
  keterangan?: string;
  nim?: string;
  mahasiswa_nama?: string;
  beasiswa_nama?: string;
}

export interface LmsConfig {
  id?: string;
  platform: string;
  base_url: string;
  api_token?: string;
  sync_mahasiswa?: boolean;
  sync_nilai?: boolean;
  sync_jadwal?: boolean;
  is_active?: boolean;
  last_sync_at?: string;
}

export interface LmsSyncLog {
  id: string;
  entity_type: string;
  action: string;
  status: string;
  records_count: number;
  error_message?: string;
  created_at: string;
}

export interface AbsensiDosen {
  id: string;
  dosen_id: string;
  tanggal: string;
  jam_masuk?: string;
  jam_keluar?: string;
  status: string;
  keterangan?: string;
  lokasi?: string;
  dosen_nama?: string;
  nidn?: string;
}

export interface BeasiswaPencairan {
  id: string;
  penerima_id: string;
  nominal: number;
  tanggal_cair: string;
  keterangan?: string;
  created_at?: string;
}

export interface SuratKategori {
  id: string;
  nama: string;
  kode: string;
  deskripsi?: string;
  template?: string;
}

export interface SuratMasuk {
  id: string;
  nomor_surat: string;
  tanggal_surat: string;
  tanggal_terima: string;
  asal: string;
  perihal: string;
  lampiran?: string;
  penerima?: string;
  kategori_id?: string;
  file_url?: string;
  status: string;
  catatan?: string;
  kategori_nama?: string;
  kategori_kode?: string;
  disposisi?: SuratDisposisi[];
}

export interface SuratKeluar {
  id: string;
  nomor_surat: string;
  tanggal_surat: string;
  tujuan: string;
  perihal: string;
  lampiran?: string;
  kategori_id?: string;
  file_url?: string;
  status: string;
  pengirim?: string;
  penandatangan?: string;
  catatan?: string;
  kategori_nama?: string;
  kategori_kode?: string;
}

export interface SuratDisposisi {
  id: string;
  surat_masuk_id: string;
  dari_jabatan: string;
  ke_jabatan: string;
  instruksi?: string;
  catatan?: string;
  batas_waktu?: string;
  status: string;
}

export interface Sidang {
  id: string;
  mahasiswa_id: string;
  judul_skripsi: string;
  dosen_pembimbing_1?: string;
  dosen_pembimbing_2?: string;
  dosen_penguji_1?: string;
  dosen_penguji_2?: string;
  dosen_penguji_3?: string;
  tanggal?: string;
  jam_mulai?: string;
  jam_selesai?: string;
  ruangan?: string;
  semester?: string;
  tahun_akademik?: string;
  nilai_angka?: number;
  nilai_huruf?: string;
  status: string;
  revisi?: string;
  catatan?: string;
  mahasiswa_nama?: string;
  nim?: string;
  pembimbing_1_nama?: string;
  pembimbing_2_nama?: string;
  penguji_1_nama?: string;
  penguji_2_nama?: string;
  penguji_3_nama?: string;
}

export interface PKL {
  id: string;
  mahasiswa_id: string;
  perusahaan: string;
  alamat_perusahaan?: string;
  bidang?: string;
  dosen_pembimbing?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  semester?: string;
  tahun_akademik?: string;
  status: string;
  nilai?: number;
  laporan_url?: string;
  mahasiswa_nama?: string;
  nim?: string;
  pembimbing_nama?: string;
}

export interface PKLLogbook {
  id: string;
  pkl_id: string;
  tanggal: string;
  kegiatan: string;
  dokumentasi_url?: string;
  catatan_pembimbing?: string;
  disetujui: boolean;
}

export interface KKN {
  id: string;
  mahasiswa_id: string;
  lokasi: string;
  kelompok?: string;
  dosen_pembimbing?: string;
  tema?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  semester?: string;
  tahun_akademik?: string;
  status: string;
  nilai?: number;
  laporan_url?: string;
  mahasiswa_nama?: string;
  nim?: string;
  pembimbing_nama?: string;
}

export interface KKNLogbook {
  id: string;
  kkn_id: string;
  tanggal: string;
  kegiatan: string;
  dokumentasi_url?: string;
  catatan_pembimbing?: string;
  disetujui: boolean;
}

export interface KKNKelompok {
  id: string;
  nama: string;
  lokasi?: string;
  dosen_pembimbing?: string;
  jumlah_anggota?: number;
  pembimbing_nama?: string;
}

export interface Seminar {
  id: string;
  mahasiswa_id: string;
  judul: string;
  jenis: string;
  dosen_pembimbing_1?: string;
  dosen_pembimbing_2?: string;
  dosen_penguji_1?: string;
  dosen_penguji_2?: string;
  tanggal?: string;
  jam_mulai?: string;
  jam_selesai?: string;
  ruangan?: string;
  semester?: string;
  tahun_akademik?: string;
  nilai?: number;
  status: string;
  catatan?: string;
  mahasiswa_nama?: string;
  nim?: string;
  pembimbing_1_nama?: string;
  pembimbing_2_nama?: string;
  penguji_1_nama?: string;
  penguji_2_nama?: string;
}

export interface SeminarPeserta {
  id: string;
  seminar_id: string;
  mahasiswa_id?: string;
  dosen_id?: string;
  kehadiran: boolean;
  mahasiswa_nama?: string;
  nim?: string;
  dosen_nama?: string;
}

export interface SuratPengajuan {
  id: string;
  mahasiswa_id?: string;
  kategori_id?: string;
  keperluan: string;
  tujuan?: string;
  status: string;
  nomor_surat?: string;
  file_url?: string;
  catatan_penolakan?: string;
  kategori_nama?: string;
  kategori_kode?: string;
}
