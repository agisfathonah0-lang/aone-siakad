CREATE TABLE IF NOT EXISTS {schema}.seminar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahasiswa_id UUID NOT NULL REFERENCES {schema}.mahasiswa(id) ON DELETE CASCADE,
  judul VARCHAR(500) NOT NULL,
  jenis VARCHAR(50) NOT NULL,
  dosen_pembimbing_1 UUID REFERENCES {schema}.dosen(id),
  dosen_pembimbing_2 UUID REFERENCES {schema}.dosen(id),
  dosen_penguji_1 UUID REFERENCES {schema}.dosen(id),
  dosen_penguji_2 UUID REFERENCES {schema}.dosen(id),
  tanggal DATE,
  jam_mulai TIME,
  jam_selesai TIME,
  ruangan VARCHAR(100),
  semester VARCHAR(50),
  tahun_akademik VARCHAR(50),
  nilai DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'dijadwalkan',
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.seminar_peserta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seminar_id UUID NOT NULL REFERENCES {schema}.seminar(id) ON DELETE CASCADE,
  mahasiswa_id UUID REFERENCES {schema}.mahasiswa(id) ON DELETE CASCADE,
  dosen_id UUID REFERENCES {schema}.dosen(id) ON DELETE CASCADE,
  kehadiran BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
