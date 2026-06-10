
CREATE TABLE public.yt_channel_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_input text NOT NULL,
  note text,
  suggested_skill text NOT NULL DEFAULT 'listening',
  requester_user_id uuid,
  requester_email text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.yt_channel_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY p_yt_requests_admin
  ON public.yt_channel_requests
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY p_yt_requests_public_insert
  ON public.yt_channel_requests
  FOR INSERT
  WITH CHECK (status = 'pending');

CREATE INDEX idx_yt_channel_requests_status ON public.yt_channel_requests(status, created_at DESC);

CREATE TRIGGER trg_yt_channel_requests_updated_at
  BEFORE UPDATE ON public.yt_channel_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
