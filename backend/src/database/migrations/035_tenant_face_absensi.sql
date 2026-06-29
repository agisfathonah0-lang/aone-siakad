-- Face Recognition for Absensi
-- Add face_descriptor (128-dim vector from face-api.js) to mahasiswa
ALTER TABLE {schema}.mahasiswa ADD COLUMN IF NOT EXISTS face_descriptor JSONB DEFAULT NULL;
ALTER TABLE {schema}.mahasiswa ADD COLUMN IF NOT EXISTS face_descriptor_updated_at TIMESTAMPTZ;

-- Add metode tracking to absensi (manual / face)
ALTER TABLE {schema}.absensi ADD COLUMN IF NOT EXISTS metode VARCHAR(50) DEFAULT 'manual';
ALTER TABLE {schema}.absensi ADD COLUMN IF NOT EXISTS confidence NUMERIC(5,4) DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_absensi_metode ON {schema}.absensi(metode);
