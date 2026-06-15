-- 002_tenant_template.sql
-- Template schema untuk setiap tenant (kampus)
-- {schema} akan direplace dengan nama schema yang sebenarnya

-- 1. Users
CREATE TABLE IF NOT EXISTS {schema}.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  nip VARCHAR(50),
  nim VARCHAR(50),
  nidn VARCHAR(50),
  nik VARCHAR(50),
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  jenis_kelamin VARCHAR(20),
  alamat TEXT,
  no_hp VARCHAR(30),
  foto_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  must_change_password BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Program studi
CREATE TABLE IF NOT EXISTS {schema}.program_studi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  jenjang VARCHAR(10) NOT NULL,
  fakultas VARCHAR(255),
  akreditasi VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Mahasiswa
CREATE TABLE IF NOT EXISTS {schema}.mahasiswa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES {schema}.users(id) ON DELETE CASCADE,
  nim VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  program_studi_id UUID REFERENCES {schema}.program_studi(id),
  angkatan INTEGER,
  semester INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'aktif',
  dosen_wali_id UUID,
  ukt_golongan VARCHAR(10),
  ukt_nominal NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Dosen
CREATE TABLE IF NOT EXISTS {schema}.dosen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES {schema}.users(id) ON DELETE CASCADE,
  nidn VARCHAR(50) UNIQUE,
  nama VARCHAR(255) NOT NULL,
  program_studi_id UUID REFERENCES {schema}.program_studi(id),
  is_dosen_wali BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Mata kuliah
CREATE TABLE IF NOT EXISTS {schema}.mata_kuliah (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  sks INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  program_studi_id UUID REFERENCES {schema}.program_studi(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Jadwal kuliah
CREATE TABLE IF NOT EXISTS {schema}.jadwal_kuliah (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mata_kuliah_id UUID NOT NULL REFERENCES {schema}.mata_kuliah(id),
  dosen_id UUID NOT NULL REFERENCES {schema}.dosen(id),
  hari VARCHAR(20) NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  ruangan VARCHAR(100),
  kelas VARCHAR(50),
  kuota INTEGER DEFAULT 40,
  tahun_akademik VARCHAR(20) NOT NULL,
  semester VARCHAR(10) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. KRS
CREATE TABLE IF NOT EXISTS {schema}.krs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mahasiswa_id UUID NOT NULL REFERENCES {schema}.mahasiswa(id),
  jadwal_id UUID NOT NULL REFERENCES {schema}.jadwal_kuliah(id),
  tahun_akademik VARCHAR(20) NOT NULL,
  semester VARCHAR(10) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  approved_by UUID REFERENCES {schema}.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mahasiswa_id, jadwal_id, tahun_akademik, semester)
);

-- 8. Absensi
CREATE TABLE IF NOT EXISTS {schema}.absensi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jadwal_id UUID NOT NULL REFERENCES {schema}.jadwal_kuliah(id),
  mahasiswa_id UUID NOT NULL REFERENCES {schema}.mahasiswa(id),
  pertemuan INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'hadir',
  tanggal DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(jadwal_id, mahasiswa_id, pertemuan)
);

-- 9. Nilai
CREATE TABLE IF NOT EXISTS {schema}.nilai (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  krs_id UUID NOT NULL REFERENCES {schema}.krs(id) ON DELETE CASCADE,
  nilai_tugas NUMERIC(5,2) DEFAULT 0,
  nilai_uts NUMERIC(5,2) DEFAULT 0,
  nilai_uas NUMERIC(5,2) DEFAULT 0,
  nilai_akhir NUMERIC(5,2),
  nilai_huruf VARCHAR(5),
  bobot_tugas NUMERIC(3,2) DEFAULT 0.20,
  bobot_uts NUMERIC(3,2) DEFAULT 0.35,
  bobot_uas NUMERIC(3,2) DEFAULT 0.45,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PPDB
CREATE TABLE IF NOT EXISTS {schema}.ppdb_pendaftar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES {schema}.users(id),
  nomor_daftar VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  program_studi_id UUID REFERENCES {schema}.program_studi(id),
  jalur_pendaftaran VARCHAR(100),
  status VARCHAR(50) DEFAULT 'baru',
  data_pendaftar JSONB DEFAULT '{}',
  dokumen JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tagihan UKT
CREATE TABLE IF NOT EXISTS {schema}.ukt_tagihan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mahasiswa_id UUID NOT NULL REFERENCES {schema}.mahasiswa(id),
  tahun_akademik VARCHAR(20) NOT NULL,
  semester VARCHAR(10) NOT NULL,
  nominal NUMERIC(12,2) NOT NULL,
  jenis VARCHAR(50) DEFAULT 'ukt_semester',
  jumlah_cicilan INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Pembayaran UKT
CREATE TABLE IF NOT EXISTS {schema}.ukt_pembayaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tagihan_id UUID NOT NULL REFERENCES {schema}.ukt_tagihan(id),
  mahasiswa_id UUID NOT NULL REFERENCES {schema}.mahasiswa(id),
  cicilan_ke INTEGER,
  nominal NUMERIC(12,2) NOT NULL,
  metode VARCHAR(50),
  midtrans_order_id VARCHAR(255),
  midtrans_transaction_id VARCHAR(255),
  midtrans_status VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Alumni survey
CREATE TABLE IF NOT EXISTS {schema}.alumni_survey (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES {schema}.users(id),
  tahun_lulus INTEGER NOT NULL,
  pekerjaan VARCHAR(255),
  institusi VARCHAR(255),
  kepuasan INTEGER,
  saran TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PDDIKTI sync logs
CREATE TABLE IF NOT EXISTS {schema}.pddikti_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  action VARCHAR(50),
  status VARCHAR(50),
  response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. CMS sections
CREATE TABLE IF NOT EXISTS {schema}.cms_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255),
  content JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. OJS submissions (local fallback)
CREATE TABLE IF NOT EXISTS {schema}.ojs_submissions (
  id UUID PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  abstract TEXT,
  author VARCHAR(255),
  keywords VARCHAR(255),
  journal_category VARCHAR(255) DEFAULT 'Umum',
  ojs_id VARCHAR(100),
  source VARCHAR(20) DEFAULT 'local',
  ojs_error TEXT,
  created_by UUID REFERENCES {schema}.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON {schema}.users(role);
CREATE INDEX IF NOT EXISTS idx_mahasiswa_nim ON {schema}.mahasiswa(nim);
CREATE INDEX IF NOT EXISTS idx_mahasiswa_prodi ON {schema}.mahasiswa(program_studi_id);
CREATE INDEX IF NOT EXISTS idx_krs_mahasiswa ON {schema}.krs(mahasiswa_id);
CREATE INDEX IF NOT EXISTS idx_krs_status ON {schema}.krs(status);
CREATE INDEX IF NOT EXISTS idx_tagihan_mahasiswa ON {schema}.ukt_tagihan(mahasiswa_id);
CREATE INDEX IF NOT EXISTS idx_ppdb_status ON {schema}.ppdb_pendaftar(status);
CREATE INDEX IF NOT EXISTS idx_ojs_created ON {schema}.ojs_submissions(created_at);
