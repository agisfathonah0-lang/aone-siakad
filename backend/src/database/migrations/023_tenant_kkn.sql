CREATE TABLE IF NOT EXISTS {schema}.kkn (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahasiswa_id UUID NOT NULL REFERENCES {schema}.mahasiswa(id) ON DELETE CASCADE,
  lokasi VARCHAR(255) NOT NULL,
  kelompok VARCHAR(100),
  dosen_pembimbing UUID REFERENCES {schema}.dosen(id),
  tema VARCHAR(255),
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

CREATE TABLE IF NOT EXISTS {schema}.kkn_logbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kkn_id UUID NOT NULL REFERENCES {schema}.kkn(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  kegiatan TEXT NOT NULL,
  dokumentasi_url VARCHAR(500),
  catatan_pembimbing TEXT,
  disetujui BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.kkn_kelompok (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  lokasi VARCHAR(255),
  dosen_pembimbing UUID REFERENCES {schema}.dosen(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.kkn_anggota_kelompok (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kelompok_id UUID NOT NULL REFERENCES {schema}.kkn_kelompok(id) ON DELETE CASCADE,
  mahasiswa_id UUID NOT NULL REFERENCES {schema}.mahasiswa(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kelompok_id, mahasiswa_id)
);
