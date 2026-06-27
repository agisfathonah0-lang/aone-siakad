-- 030_tenant_kelas_room.sql — Google Classroom-like feature
CREATE TABLE IF NOT EXISTS {schema}.kelas_room (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jadwal_id UUID REFERENCES {schema}.jadwal(id) ON DELETE SET NULL,
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  kode_enroll VARCHAR(20) UNIQUE,
  cover_url TEXT,
  semester VARCHAR(20), tahun_akademik VARCHAR(20),
  created_by UUID NOT NULL REFERENCES {schema}.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.kelas_room_anggota (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kelas_room_id UUID NOT NULL REFERENCES {schema}.kelas_room(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES {schema}.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'mahasiswa',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kelas_room_id, user_id)
);

CREATE TABLE IF NOT EXISTS {schema}.kelas_materi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kelas_room_id UUID NOT NULL REFERENCES {schema}.kelas_room(id) ON DELETE CASCADE,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  file_url TEXT, file_nama TEXT, file_size INTEGER,
  tipe VARCHAR(50) DEFAULT 'file',
  link_url TEXT,
  created_by UUID NOT NULL REFERENCES {schema}.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.kelas_tugas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kelas_room_id UUID NOT NULL REFERENCES {schema}.kelas_room(id) ON DELETE CASCADE,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  file_url TEXT, file_nama TEXT,
  deadline TIMESTAMPTZ,
  bobot INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES {schema}.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.kelas_tugas_submit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kelas_tugas_id UUID NOT NULL REFERENCES {schema}.kelas_tugas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES {schema}.users(id) ON DELETE CASCADE,
  file_url TEXT, file_nama TEXT, file_size INTEGER,
  catatan TEXT, nilai DECIMAL(5,2), feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  dinilai_at TIMESTAMPTZ,
  UNIQUE(kelas_tugas_id, user_id)
);

CREATE TABLE IF NOT EXISTS {schema}.kelas_pengumuman (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kelas_room_id UUID NOT NULL REFERENCES {schema}.kelas_room(id) ON DELETE CASCADE,
  judul VARCHAR(255) NOT NULL,
  konten TEXT NOT NULL,
  file_url TEXT, file_nama TEXT,
  created_by UUID NOT NULL REFERENCES {schema}.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kr_anggota_user ON {schema}.kelas_room_anggota(user_id);
CREATE INDEX IF NOT EXISTS idx_kr_anggota_room ON {schema}.kelas_room_anggota(kelas_room_id);
CREATE INDEX IF NOT EXISTS idx_kr_materi_room ON {schema}.kelas_materi(kelas_room_id);
CREATE INDEX IF NOT EXISTS idx_kr_tugas_room ON {schema}.kelas_tugas(kelas_room_id);
CREATE INDEX IF NOT EXISTS idx_kr_tugas_submit_tugas ON {schema}.kelas_tugas_submit(kelas_tugas_id);
CREATE INDEX IF NOT EXISTS idx_kr_pengumuman_room ON {schema}.kelas_pengumuman(kelas_room_id);
