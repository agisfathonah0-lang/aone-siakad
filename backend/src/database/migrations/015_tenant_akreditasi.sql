CREATE TABLE IF NOT EXISTS {schema}.akreditasi_institusi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_studi_id UUID REFERENCES {schema}.program_studi(id) ON DELETE SET NULL,
  jenis VARCHAR(50) NOT NULL DEFAULT 'institusi',
  peringkat VARCHAR(10),
  skor DECIMAL(5,2),
  nomor_sk VARCHAR(255),
  tanggal_sk DATE,
  tanggal_kadaluarsa DATE,
  file_sk VARCHAR(500),
  tahun_akreditasi INTEGER NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.standar_akreditasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  kode VARCHAR(50) NOT NULL,
  deskripsi TEXT,
  bobot DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.dokumen_akreditasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  akreditasi_id UUID NOT NULL REFERENCES {schema}.akreditasi_institusi(id) ON DELETE CASCADE,
  standar_id UUID REFERENCES {schema}.standar_akreditasi(id) ON DELETE SET NULL,
  nama_dokumen VARCHAR(500) NOT NULL,
  file_url VARCHAR(500),
  keterangan TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO {schema}.standar_akreditasi (id, kode, nama, bobot) VALUES
  (gen_random_uuid(), 'SN1', 'Visi, Misi, Tujuan dan Strategi', 5),
  (gen_random_uuid(), 'SN2', 'Tata Pamong, Tata Kelola dan Kerjasama', 10),
  (gen_random_uuid(), 'SN3', 'Mahasiswa', 10),
  (gen_random_uuid(), 'SN4', 'Sumber Daya Manusia', 15),
  (gen_random_uuid(), 'SN5', 'Keuangan, Sarana dan Prasarana', 10),
  (gen_random_uuid(), 'SN6', 'Pendidikan', 20),
  (gen_random_uuid(), 'SN7', 'Penelitian', 15),
  (gen_random_uuid(), 'SN8', 'Pengabdian kepada Masyarakat', 10),
  (gen_random_uuid(), 'SN9', 'Luaran dan Capaian Tridharma', 5)
ON CONFLICT DO NOTHING;
