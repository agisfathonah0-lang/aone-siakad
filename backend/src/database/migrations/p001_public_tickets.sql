-- 006_public_tickets.sql
-- Support tickets for vendor super admin

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  priority VARCHAR(20) NOT NULL DEFAULT 'Sedang',
  category VARCHAR(50) NOT NULL DEFAULT 'Umum',
  status VARCHAR(20) NOT NULL DEFAULT 'Terbuka',
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_tenant ON public.tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
