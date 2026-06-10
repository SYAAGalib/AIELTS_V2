
CREATE TABLE public.homepage_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('draft','published')),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer NOT NULL DEFAULT 1,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  CONSTRAINT homepage_config_status_unique UNIQUE (status)
);

ALTER TABLE public.homepage_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY p_homepage_config_admin_all ON public.homepage_config
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY p_homepage_config_public_read_published ON public.homepage_config
  FOR SELECT USING (status = 'published');

CREATE TRIGGER trg_homepage_config_updated_at
  BEFORE UPDATE ON public.homepage_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.homepage_config (status, config) VALUES
  ('published', '{}'::jsonb),
  ('draft', '{}'::jsonb);
