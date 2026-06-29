-- 036_tenant_helpdesk.sql
-- Helpdesk / Tiket Internal untuk civitas akademika

CREATE TABLE IF NOT EXISTS {schema}.ticket_kategori (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  icon VARCHAR(50) DEFAULT 'HelpCircle',
  urutan INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.tiket (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  no_tiket VARCHAR(20) NOT NULL,
  user_id UUID NOT NULL REFERENCES {schema}.users(id),
  kategori_id UUID REFERENCES {schema}.ticket_kategori(id),
  subjek VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  prioritas VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (prioritas IN ('rendah', 'normal', 'tinggi', 'urgent')),
  status VARCHAR(20) NOT NULL DEFAULT 'terbuka' CHECK (status IN ('terbuka', 'diproses', 'menunggu', 'selesai', 'ditolak')),
  assigned_to UUID REFERENCES {schema}.users(id),
  lampiran TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS {schema}.tiket_pesan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tiket_id UUID NOT NULL REFERENCES {schema}.tiket(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES {schema}.users(id),
  pesan TEXT NOT NULL,
  lampiran TEXT,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tiket_user ON {schema}.tiket(user_id);
CREATE INDEX IF NOT EXISTS idx_tiket_status ON {schema}.tiket(status);
CREATE INDEX IF NOT EXISTS idx_tiket_assigned ON {schema}.tiket(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tiket_pesan_tiket ON {schema}.tiket_pesan(tiket_id);
CREATE INDEX IF NOT EXISTS idx_tiket_no ON {schema}.tiket(no_tiket);

-- Seed default categories
INSERT INTO {schema}.ticket_kategori (nama, deskripsi, icon, urutan) VALUES
  ('Teknologi Informasi', 'Masalah IT, akun, login, jaringan, laboratorium', 'Monitor', 1),
  ('Akademik', 'KRS, nilai, jadwal, transkrip, cuti akademik', 'BookOpen', 2),
  ('Keuangan', 'UKT, tagihan, pembayaran, beasiswa', 'Wallet', 3),
  ('Sarana & Prasarana', 'Kerusakan ruangan, listrik, AC, kebersihan', 'Building2', 4),
  ('Kemahasiswaan', 'Organisasi, kegiatan, pelanggaran, pembinaan', 'Users', 5),
  ('Umum', 'Lain-lain', 'HelpCircle', 6)
ON CONFLICT DO NOTHING;
