-- 018_tenant_ojs_config.sql
-- OJS configuration and sync log tables

CREATE TABLE IF NOT EXISTS {schema}.ojs_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_url VARCHAR(500) NOT NULL DEFAULT 'http://localhost/ojs-v3',
  api_key VARCHAR(500),
  journal_id INTEGER DEFAULT 1,
  sync_interval INTEGER DEFAULT 3600,
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.ojs_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  records_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
