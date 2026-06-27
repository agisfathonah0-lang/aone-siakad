export enum Role {
  SUPER_ADMIN = 'super_admin',
  REKTOR = 'rektor',
  ADMIN = 'admin',
  DEKAN = 'dekan',
  AKADEMIK = 'akademik',
  KAPRODI = 'kaprodi',
  KEUANGAN = 'keuangan',
  PUSTAKAWAN = 'pustakawan',
  DOSEN = 'dosen',
  MAHASISWA = 'mahasiswa',
  CALON_MAHASISWA = 'calon_mahasiswa',
  ALUMNI = 'alumni',
  HUMAS = 'humas',
}

export enum Paket {
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export enum StatusPendaftaran {
  BARU = 'baru',
  VERIFIKASI = 'verifikasi',
  DITERIMA = 'diterima',
  DITOLAK = 'ditolak',
  DAFTAR_ULANG = 'daftar_ulang',
}

export enum StatusPembayaran {
  PENDING = 'pending',
  SETTLEMENT = 'settlement',
  EXPIRED = 'expired',
  DENY = 'deny',
  CANCEL = 'cancel',
}

export enum JenisTagihan {
  UKT_SEMESTER = 'ukt_semester',
  UKT_CICILAN = 'ukt_cicilan',
  PPDB = 'ppdb',
}
