-- 006_kalender_akademik.sql
CREATE TABLE IF NOT EXISTS {schema}.kalender_akademik (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul VARCHAR(255) NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE,
  tipe VARCHAR(50) DEFAULT 'umum',
  deskripsi TEXT,
  warna VARCHAR(20) DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kalender_tanggal ON {schema}.kalender_akademik(tanggal_mulai);
