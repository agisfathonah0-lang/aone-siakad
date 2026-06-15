CREATE TABLE IF NOT EXISTS {schema}.edom_kuisioner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pertanyaan TEXT NOT NULL,
  aspek VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.edom_periode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  tahun_akademik VARCHAR(50) NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.edom_jadwal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periode_id UUID NOT NULL REFERENCES {schema}.edom_periode(id) ON DELETE CASCADE,
  jadwal_id UUID NOT NULL REFERENCES {schema}.jadwal_kuliah(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(periode_id, jadwal_id)
);

CREATE TABLE IF NOT EXISTS {schema}.edom_jawaban (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edom_jadwal_id UUID NOT NULL REFERENCES {schema}.edom_jadwal(id) ON DELETE CASCADE,
  kuisioner_id UUID NOT NULL REFERENCES {schema}.edom_kuisioner(id) ON DELETE CASCADE,
  mahasiswa_id UUID NOT NULL REFERENCES {schema}.mahasiswa(id) ON DELETE CASCADE,
  nilai INTEGER NOT NULL CHECK (nilai >= 1 AND nilai <= 5),
  saran TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(edom_jadwal_id, kuisioner_id, mahasiswa_id)
);
