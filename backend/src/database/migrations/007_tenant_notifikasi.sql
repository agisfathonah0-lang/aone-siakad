-- 007_notifikasi.sql
CREATE TABLE IF NOT EXISTS {schema}.notifikasi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES {schema}.users(id) ON DELETE CASCADE,
  judul VARCHAR(255) NOT NULL,
  pesan TEXT,
  tipe VARCHAR(50) DEFAULT 'info',
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifikasi_user ON {schema}.notifikasi(user_id);
CREATE INDEX IF NOT EXISTS idx_notifikasi_unread ON {schema}.notifikasi(user_id, is_read);
