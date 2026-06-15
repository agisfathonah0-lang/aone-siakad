CREATE TABLE IF NOT EXISTS {schema}.perwalian_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahasiswa_id UUID NOT NULL REFERENCES {schema}.mahasiswa(id) ON DELETE CASCADE,
  dosen_id UUID REFERENCES {schema}.dosen(id),
  catatan TEXT NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
