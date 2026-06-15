-- 001_public_schema.sql
-- Schema publik untuk platform multi-tenant AONE SIAKAD

-- 1. Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Vendor users (super admin platform)
CREATE TABLE IF NOT EXISTS public.vendor_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'super_admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tenants (kampus)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  schema_name VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  nama_pt VARCHAR(255) NOT NULL,
  singkatan VARCHAR(50),
  alamat TEXT,
  telepon VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  logo_url VARCHAR(500),
  paket VARCHAR(50) DEFAULT 'basic',
  custom_domain VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tenant settings (key-value JSONB)
CREATE TABLE IF NOT EXISTS public.tenant_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);

-- 5. Migration tracking
CREATE TABLE IF NOT EXISTS public.migrations (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Session / refresh tokens
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_custom_domain ON public.tenants(custom_domain);
CREATE INDEX idx_refresh_tokens_user ON public.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON public.refresh_tokens(token_hash);
