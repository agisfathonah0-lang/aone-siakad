-- 007_public_firewall.sql
-- Firewall logs & blocked IPs for vendor

CREATE TABLE IF NOT EXISTS public.firewall_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  source_ip VARCHAR(45) NOT NULL,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  path TEXT,
  user_agent TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'BLOCKED',
  action VARCHAR(20) NOT NULL DEFAULT 'BLOCK',
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_firewall_timestamp ON public.firewall_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_firewall_type ON public.firewall_logs(type);
CREATE INDEX IF NOT EXISTS idx_firewall_severity ON public.firewall_logs(severity);

CREATE TABLE IF NOT EXISTS public.blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip VARCHAR(45) NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_by VARCHAR(100),
  expires_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_status ON public.blocked_ips(status);
