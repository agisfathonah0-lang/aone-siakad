-- 037_tenant_kelas_room_prodi.sql
-- Add program_studi_id column to kelas_room

ALTER TABLE {schema}.kelas_room
ADD COLUMN IF NOT EXISTS program_studi_id UUID REFERENCES {schema}.program_studi(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kelas_room_prodi ON {schema}.kelas_room(program_studi_id);
