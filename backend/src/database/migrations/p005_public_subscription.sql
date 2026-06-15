ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

UPDATE public.tenants SET subscription_end_date = NOW() + INTERVAL '30 days' WHERE subscription_end_date IS NULL AND is_active = true;
