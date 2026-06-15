-- AI Chat History with token tracking
CREATE TABLE IF NOT EXISTS "{schema}".ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  pesan TEXT NOT NULL,
  respons TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  model VARCHAR(50) DEFAULT 'gpt-4o-mini',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI RPS Generation History
CREATE TABLE IF NOT EXISTS "{schema}".ai_rps_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mata_kuliah VARCHAR(255) NOT NULL,
  prodi VARCHAR(255) NOT NULL,
  sks INTEGER NOT NULL,
  semester INTEGER DEFAULT 1,
  capaian_pembelajaran TEXT,
  deskripsi TEXT,
  hasil TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI usage tracking per tenant per hari
CREATE TABLE IF NOT EXISTS "{schema}".ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tgl DATE NOT NULL DEFAULT CURRENT_DATE,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tgl)
);

-- Public settings for AI (support OpenAI + Gemini)
INSERT INTO public.web_settings (setting_key, setting_value) VALUES
  ('ai_provider', 'openai'),
  ('openai_api_key', ''),
  ('gemini_api_key', ''),
  ('ai_model', 'gpt-4o-mini'),
  ('ai_daily_limit', '100'),
  ('ai_monthly_limit', '2000')
ON CONFLICT (setting_key) DO NOTHING;

-- Migration untuk tenant existing: add columns if not exist
DO $$ BEGIN
  ALTER TABLE "{schema}".ai_chat_history ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0;
  ALTER TABLE "{schema}".ai_chat_history ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0;
  ALTER TABLE "{schema}".ai_chat_history ADD COLUMN IF NOT EXISTS model VARCHAR(50) DEFAULT 'gpt-4o-mini';
  ALTER TABLE "{schema}".ai_rps_history ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0;
  ALTER TABLE "{schema}".ai_rps_history ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0;
EXCEPTION WHEN others THEN NULL;
END $$;
