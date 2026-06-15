-- 009_public_web_settings.sql
-- Global platform web settings for vendor landing page

CREATE TABLE IF NOT EXISTS public.web_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
