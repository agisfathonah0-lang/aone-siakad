-- 008_public_cctv.sql
-- CCTV cameras for vendor

CREATE TABLE IF NOT EXISTS public.cctv_cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  rtsp_url TEXT DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'Aktif',
  snapshot TEXT DEFAULT '',
  snapshot_at TIMESTAMPTZ,
  is_broadcasting BOOLEAN DEFAULT FALSE,
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cctv_tenant ON public.cctv_cameras(tenant_id);
