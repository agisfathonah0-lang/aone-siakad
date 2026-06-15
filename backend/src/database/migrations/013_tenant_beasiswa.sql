CREATE TABLE IF NOT EXISTS {schema}.beasiswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  jenis VARCHAR(100) NOT NULL,
  penyelenggara VARCHAR(255),
  nominal DECIMAL(15,2) NOT NULL DEFAULT 0,
  kuota INTEGER DEFAULT 0,
  tahun_akademik VARCHAR(50) NOT NULL,
  tanggal_mulai DATE,
  tanggal_selesai DATE,
  deskripsi TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.beasiswa_penerima (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beasiswa_id UUID NOT NULL REFERENCES {schema}.beasiswa(id) ON DELETE CASCADE,
  mahasiswa_id UUID NOT NULL REFERENCES {schema}.mahasiswa(id) ON DELETE CASCADE,
  tanggal_daftar DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'pending',
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(beasiswa_id, mahasiswa_id)
);

CREATE TABLE IF NOT EXISTS {schema}.beasiswa_pencairan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  penerima_id UUID NOT NULL REFERENCES {schema}.beasiswa_penerima(id) ON DELETE CASCADE,
  nominal DECIMAL(15,2) NOT NULL,
  tanggal_cair DATE NOT NULL DEFAULT CURRENT_DATE,
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
