CREATE TABLE IF NOT EXISTS {schema}.kurikulum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode VARCHAR(50) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  program_studi_id UUID REFERENCES {schema}.program_studi(id) ON DELETE CASCADE,
  tahun_mulai INTEGER NOT NULL,
  tahun_selesai INTEGER,
  total_sks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.kurikulum_matakuliah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kurikulum_id UUID NOT NULL REFERENCES {schema}.kurikulum(id) ON DELETE CASCADE,
  mata_kuliah_id UUID NOT NULL REFERENCES {schema}.mata_kuliah(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL,
  wajib BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.rps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jadwal_id UUID NOT NULL REFERENCES {schema}.jadwal_kuliah(id) ON DELETE CASCADE,
  pertemuan INTEGER NOT NULL,
  materi VARCHAR(500) NOT NULL,
  capaian_pembelajaran TEXT,
  metode VARCHAR(255),
  durasi_menit INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.bap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jadwal_id UUID NOT NULL REFERENCES {schema}.jadwal_kuliah(id) ON DELETE CASCADE,
  pertemuan INTEGER NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  materi VARCHAR(500),
  jumlah_mahasiswa_hadir INTEGER DEFAULT 0,
  jumlah_mahasiswa_terdaftar INTEGER DEFAULT 0,
  catatan TEXT,
  dosen_pengganti VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
