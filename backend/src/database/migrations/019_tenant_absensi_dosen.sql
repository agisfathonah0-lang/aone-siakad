CREATE TABLE IF NOT EXISTS {schema}.absensi_dosen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dosen_id UUID NOT NULL REFERENCES {schema}.dosen(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  jam_masuk TIME,
  jam_keluar TIME,
  status VARCHAR(50) DEFAULT 'hadir',
  keterangan TEXT,
  lokasi VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dosen_id, tanggal)
);
