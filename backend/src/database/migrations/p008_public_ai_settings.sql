-- Public AI settings for all tenants
INSERT INTO public.web_settings (setting_key, setting_value) VALUES
  ('ai_provider', 'openai'),
  ('openai_api_key', ''),
  ('gemini_api_key', ''),
  ('ai_model', 'gpt-4o-mini'),
  ('ai_daily_limit', '100'),
  ('ai_monthly_limit', '2000')
ON CONFLICT (setting_key) DO NOTHING;
