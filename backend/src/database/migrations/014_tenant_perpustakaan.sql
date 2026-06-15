CREATE TABLE IF NOT EXISTS {schema}.buku (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul VARCHAR(500) NOT NULL,
  penulis VARCHAR(255),
  penerbit VARCHAR(255),
  isbn VARCHAR(50) UNIQUE,
  tahun_terbit INTEGER,
  edisi VARCHAR(50),
  kategori VARCHAR(100),
  lokasi VARCHAR(100),
  jumlah_total INTEGER DEFAULT 1,
  jumlah_tersedia INTEGER DEFAULT 1,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.anggota_perpustakaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahasiswa_id UUID UNIQUE REFERENCES {schema}.mahasiswa(id) ON DELETE CASCADE,
  kode_anggota VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.peminjaman_buku (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buku_id UUID NOT NULL REFERENCES {schema}.buku(id) ON DELETE CASCADE,
  anggota_id UUID NOT NULL REFERENCES {schema}.anggota_perpustakaan(id) ON DELETE CASCADE,
  tanggal_pinjam DATE NOT NULL DEFAULT CURRENT_DATE,
  tanggal_jatuh_tempo DATE NOT NULL,
  tanggal_kembali DATE,
  status VARCHAR(50) DEFAULT 'dipinjam',
  denda DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.riwayat_denda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peminjaman_id UUID NOT NULL REFERENCES {schema}.peminjaman_buku(id) ON DELETE CASCADE,
  nominal DECIMAL(15,2) NOT NULL,
  tanggal_bayar DATE NOT NULL DEFAULT CURRENT_DATE,
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
