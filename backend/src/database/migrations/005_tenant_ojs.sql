-- 005_tenant_ojs.sql
-- OJS submissions table (re-creation for tenants that missed it in 002)

CREATE TABLE IF NOT EXISTS {schema}.ojs_submissions (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  abstract TEXT,
  author VARCHAR(255),
  keywords TEXT,
  journal_category VARCHAR(100) DEFAULT 'Umum',
  ojs_id VARCHAR(50),
  source VARCHAR(20) DEFAULT 'local',
  ojs_error TEXT,
  status VARCHAR(50) DEFAULT 'Dalam Reviewer',
  created_by UUID,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ojs_created ON {schema}.ojs_submissions(created_at);
