
-- YouTube sync sources
CREATE TABLE public.youtube_sync_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('channel','playlist')),
  source_id text NOT NULL,
  label text NOT NULL,
  default_skill text NOT NULL DEFAULT 'listening',
  max_results integer NOT NULL DEFAULT 25,
  enabled boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz,
  last_error text,
  last_imported_count integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, source_id)
);

ALTER TABLE public.youtube_sync_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY p_yt_sources_admin ON public.youtube_sync_sources
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE TRIGGER trg_yt_sources_updated
  BEFORE UPDATE ON public.youtube_sync_sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Extend videos table for sync dedupe + ordering
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS youtube_id text,
  ADD COLUMN IF NOT EXISTS source_id uuid REFERENCES public.youtube_sync_sources(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS videos_youtube_id_key
  ON public.videos (youtube_id) WHERE youtube_id IS NOT NULL;
