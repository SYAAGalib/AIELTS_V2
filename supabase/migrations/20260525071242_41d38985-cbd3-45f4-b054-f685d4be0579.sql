ALTER TABLE public.youtube_sync_sources ALTER COLUMN max_results SET DEFAULT 0;
UPDATE public.youtube_sync_sources SET max_results = 0;