CREATE TABLE IF NOT EXISTS {schema}.ebook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul VARCHAR(500) NOT NULL,
  penulis VARCHAR(255),
  deskripsi TEXT,
  kategori VARCHAR(100),
  file_url VARCHAR(500),
  cover_image VARCHAR(500),
  tahun_terbit INTEGER,
  jumlah_download INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.repositori_karya (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul VARCHAR(500) NOT NULL,
  penulis VARCHAR(255) NOT NULL,
  nim VARCHAR(50),
  pembimbing VARCHAR(255),
  jenis VARCHAR(50) NOT NULL DEFAULT 'skripsi',
  prodi_id UUID REFERENCES {schema}.program_studi(id) ON DELETE SET NULL,
  tahun INTEGER,
  abstrak TEXT,
  file_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
