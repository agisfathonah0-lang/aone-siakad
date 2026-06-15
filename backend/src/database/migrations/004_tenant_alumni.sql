-- 004_tenant_alumni.sql
-- Alumni tracer study table per tenant
-- {schema} akan direplace dengan nama schema yang sebenarnya

CREATE TABLE IF NOT EXISTS {schema}.alumni_tracer (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES {schema}.users(id),
  tahun_lulus INTEGER NOT NULL,
  institusi VARCHAR(255),
  pekerjaan VARCHAR(255),
  gaji NUMERIC(12,2),
  masa_tunggu NUMERIC(5,1),
  kesesuaian VARCHAR(50),
  kepuasan INTEGER,
  saran TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alumni_tracer_user ON {schema}.alumni_tracer(user_id);
CREATE INDEX IF NOT EXISTS idx_alumni_tracer_tahun ON {schema}.alumni_tracer(tahun_lulus);
