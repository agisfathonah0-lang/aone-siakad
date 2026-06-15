-- 003_tenant_pddikti.sql
-- PDDIKTI sync summary runs per tenant
-- {schema} akan direplace dengan nama schema yang sebenarnya

CREATE TABLE IF NOT EXISTS {schema}.pddikti_sync_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(100) NOT NULL,
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Diproses',
  errors JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_runs_type ON {schema}.pddikti_sync_runs(entity_type);
CREATE INDEX IF NOT EXISTS idx_sync_runs_status ON {schema}.pddikti_sync_runs(status);
CREATE INDEX IF NOT EXISTS idx_sync_runs_started ON {schema}.pddikti_sync_runs(started_at);
