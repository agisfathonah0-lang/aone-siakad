-- 026_tenant_pddikti_config.sql
-- Per-tenant PDDIKTI Feeder configuration
CREATE TABLE IF NOT EXISTS {schema}.pddikti_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feeder_url VARCHAR(500) DEFAULT 'http://localhost:8085',
  username VARCHAR(200) DEFAULT '',
  password TEXT DEFAULT '',
  database_name VARCHAR(200) DEFAULT '',
  is_active BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE {schema}.pddikti_sync_runs ADD COLUMN IF NOT EXISTS error_detail TEXT;
