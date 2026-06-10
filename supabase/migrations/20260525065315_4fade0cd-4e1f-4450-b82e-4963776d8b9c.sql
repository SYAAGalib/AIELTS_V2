
CREATE TABLE public.yt_channel_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  subscriber_count integer,
  video_count integer,
  matched_queries text[] NOT NULL DEFAULT '{}',
  score integer NOT NULL DEFAULT 0,
  suggested_skill text NOT NULL DEFAULT 'listening',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','added','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_yt_suggestions_status_score ON public.yt_channel_suggestions (status, score DESC);

ALTER TABLE public.yt_channel_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "p_yt_suggestions_admin"
ON public.yt_channel_suggestions
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_yt_suggestions_updated
BEFORE UPDATE ON public.yt_channel_suggestions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.yt_channel_dismissed (
  channel_id text PRIMARY KEY,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.yt_channel_dismissed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "p_yt_dismissed_admin"
ON public.yt_channel_dismissed
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
