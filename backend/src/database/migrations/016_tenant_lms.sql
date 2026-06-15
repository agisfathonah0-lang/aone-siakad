CREATE TABLE IF NOT EXISTS {schema}.lms_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL DEFAULT 'moodle',
  base_url VARCHAR(500) NOT NULL,
  api_token VARCHAR(500),
  ws_function VARCHAR(255) DEFAULT 'core_webservice',
  sync_mahasiswa BOOLEAN DEFAULT false,
  sync_nilai BOOLEAN DEFAULT false,
  sync_jadwal BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.lms_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  records_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
