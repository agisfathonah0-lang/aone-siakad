-- TTE (Tanda Tangan Elektronik) dengan RSA digital signature
CREATE TABLE IF NOT EXISTS {schema}.tte_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label VARCHAR(100) DEFAULT 'Default',
  public_key TEXT NOT NULL,
  private_key_encrypted TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS {schema}.tte_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  signer_user_id UUID NOT NULL,
  signer_nama VARCHAR(255),
  signer_jabatan VARCHAR(255),
  hash_sha256 VARCHAR(64) NOT NULL,
  signature TEXT NOT NULL,
  key_id UUID REFERENCES {schema}.tte_keys(id),
  algorithm VARCHAR(20) DEFAULT 'RSA-SHA256',
  tte_type VARCHAR(20) DEFAULT 'tersertifikasi',
  metadata JSONB DEFAULT '{}',
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  verified_count INTEGER DEFAULT 0,
  last_verified_at TIMESTAMPTZ,
  is_revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_alasan TEXT
);

CREATE INDEX IF NOT EXISTS idx_tte_signatures_doc ON {schema}.tte_signatures(document_id, document_type);
CREATE INDEX IF NOT EXISTS idx_tte_signatures_signer ON {schema}.tte_signatures(signer_user_id);
CREATE INDEX IF NOT EXISTS idx_tte_keys_user ON {schema}.tte_keys(user_id);
