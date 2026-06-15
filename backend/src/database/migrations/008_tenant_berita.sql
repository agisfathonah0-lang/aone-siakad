-- 008_berita.sql
CREATE TABLE IF NOT EXISTS {schema}.berita (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  konten TEXT,
  ringkasan VARCHAR(500),
  gambar VARCHAR(500),
  penulis VARCHAR(100),
  status VARCHAR(20) DEFAULT 'draft',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_berita_status ON {schema}.berita(status);
CREATE INDEX IF NOT EXISTS idx_berita_published ON {schema}.berita(published_at) WHERE is_published = true;
