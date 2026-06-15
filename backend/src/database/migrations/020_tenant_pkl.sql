CREATE TABLE IF NOT EXISTS {schema}.pkl (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahasiswa_id UUID NOT NULL REFERENCES {schema}.mahasiswa(id) ON DELETE CASCADE,
  perusahaan VARCHAR(255) NOT NULL,
  alamat_perusahaan TEXT,
  bidang VARCHAR(255),
  dosen_pembimbing UUID REFERENCES {schema}.dosen(id),
  tanggal_mulai DATE,
  tanggal_selesai DATE,
  semester VARCHAR(50),
  tahun_akademik VARCHAR(50),
  status VARCHAR(50) DEFAULT 'direncanakan',
  nilai DECIMAL(5,2),
  laporan_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.pkl_logbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pkl_id UUID NOT NULL REFERENCES {schema}.pkl(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  kegiatan TEXT NOT NULL,
  dokumentasi_url VARCHAR(500),
  catatan_pembimbing TEXT,
  disetujui BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
