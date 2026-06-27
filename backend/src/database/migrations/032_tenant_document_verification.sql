-- 032_tenant_document_verification.sql — Blockchain-style document verification
CREATE TABLE IF NOT EXISTS {schema}.document_verification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surat_id UUID NOT NULL,
  surat_type VARCHAR(20) NOT NULL,
  hash VARCHAR(64) NOT NULL,
  prev_hash VARCHAR(64),
  verification_code VARCHAR(10) UNIQUE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_count INTEGER DEFAULT 0,
  last_verified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_docver_surat ON {schema}.document_verification(surat_id, surat_type);
CREATE INDEX IF NOT EXISTS idx_docver_code ON {schema}.document_verification(verification_code);
