CREATE TABLE IF NOT EXISTS {schema}.surat_kategori (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  kode VARCHAR(50) UNIQUE NOT NULL,
  deskripsi TEXT,
  template TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO {schema}.surat_kategori (kode, nama, deskripsi) VALUES
  ('SKCK', 'Surat Keterangan Kuliah', 'Surat keterangan aktif kuliah untuk mahasiswa'),
  ('SKP', 'Surat Keterangan Lulus', 'Surat keterangan telah lulus'),
  ('SP', 'Surat Permohonan', 'Surat permohonan data/izin'),
  ('SU', 'Surat Undangan', 'Undangan kegiatan akademik'),
  ('ST', 'Surat Tugas', 'Surat penugasan dosen/karyawan'),
  ('SI', 'Surat Izin', 'Surat izin kegiatan'),
  ('SD', 'Surat Disposisi', 'Disposisi pimpinan'),
  ('LAIN', 'Lainnya', 'Kategori surat lainnya')
ON CONFLICT (kode) DO NOTHING;

CREATE TABLE IF NOT EXISTS {schema}.surat_masuk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_surat VARCHAR(100) NOT NULL,
  tanggal_surat DATE NOT NULL DEFAULT CURRENT_DATE,
  tanggal_terima DATE NOT NULL DEFAULT CURRENT_DATE,
  asal VARCHAR(255) NOT NULL,
  perihal VARCHAR(500) NOT NULL,
  lampiran TEXT,
  penerima VARCHAR(255),
  kategori_id UUID REFERENCES {schema}.surat_kategori(id),
  file_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'diterima',  -- diterima, didisposisikan, selesai
  catatan TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.surat_keluar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_surat VARCHAR(100) NOT NULL,
  tanggal_surat DATE NOT NULL DEFAULT CURRENT_DATE,
  tujuan VARCHAR(255) NOT NULL,
  perihal VARCHAR(500) NOT NULL,
  lampiran TEXT,
  kategori_id UUID REFERENCES {schema}.surat_kategori(id),
  file_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'draft',  -- draft, dikirim, ditandatangani
  pengirim VARCHAR(255),
  penandatangan VARCHAR(255),
  catatan TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.surat_disposisi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surat_masuk_id UUID NOT NULL REFERENCES {schema}.surat_masuk(id) ON DELETE CASCADE,
  dari_jabatan VARCHAR(255) NOT NULL,
  ke_jabatan VARCHAR(255) NOT NULL,
  instruksi TEXT,
  catatan TEXT,
  batas_waktu DATE,
  status VARCHAR(50) DEFAULT 'diteruskan',  -- diteruskan, ditindaklanjuti, selesai
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.surat_pengajuan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahasiswa_id UUID REFERENCES {schema}.mahasiswa(id) ON DELETE CASCADE,
  kategori_id UUID REFERENCES {schema}.surat_kategori(id),
  keperluan TEXT NOT NULL,
  tujuan VARCHAR(255),
  status VARCHAR(50) DEFAULT 'diajukan',  -- diajukan, diproses, selesai, ditolak
  nomor_surat VARCHAR(100),
  file_url VARCHAR(500),
  catatan_penolakan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
