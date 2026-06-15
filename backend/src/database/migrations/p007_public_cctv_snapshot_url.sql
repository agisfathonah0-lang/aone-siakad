ALTER TABLE public.cctv_cameras ADD COLUMN IF NOT EXISTS snapshot_url TEXT DEFAULT '';
