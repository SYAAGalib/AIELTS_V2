CREATE TYPE public.sponsor_tier AS ENUM ('platinum', 'gold', 'silver');

CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier public.sponsor_tier NOT NULL,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  tagline TEXT,
  website_url TEXT,
  logo_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sponsors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsors TO authenticated;
GRANT ALL ON public.sponsors TO service_role;

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY p_sponsors_public_read
  ON public.sponsors FOR SELECT
  USING (active = true);

CREATE POLICY p_sponsors_admin_all
  ON public.sponsors FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_sponsors_tier_sort ON public.sponsors (tier, sort_order);

INSERT INTO public.sponsors (tier, name, initials, tagline, sort_order) VALUES
  ('platinum', 'Lumen Education', 'LE', 'Lighting paths to global universities', 1),
  ('platinum', 'Northwind Capital', 'NW', 'Scholarship fund partner', 2),
  ('platinum', 'Vertex Foundation', 'VF', 'Champion of accessible learning', 3),
  ('gold', 'BrightPath', 'BP', NULL, 1),
  ('gold', 'Helix Labs', 'HL', NULL, 2),
  ('gold', 'Orbital Group', 'OG', NULL, 3),
  ('gold', 'Cobalt Studio', 'CS', NULL, 4),
  ('silver', 'Pulse Academy', 'PA', NULL, 1),
  ('silver', 'Skybridge', 'SB', NULL, 2),
  ('silver', 'Inkwell Press', 'IP', NULL, 3),
  ('silver', 'Nimbus Learning', 'NL', NULL, 4),
  ('silver', 'Atlas Tutors', 'AT', NULL, 5),
  ('silver', 'Foundry & Co.', 'FC', NULL, 6),
  ('silver', 'Mentors Hub', 'MH', NULL, 7),
  ('silver', 'Linguify', 'LF', NULL, 8);