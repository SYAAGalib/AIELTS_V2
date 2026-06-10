
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  cycle text NOT NULL DEFAULT 'monthly',
  per_label text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  trial_days integer NOT NULL DEFAULT 0,
  cta_label text NOT NULL DEFAULT 'Get started',
  highlight boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_pricing_plans_public_read ON public.pricing_plans;
CREATE POLICY p_pricing_plans_public_read ON public.pricing_plans
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS p_pricing_plans_admin_all ON public.pricing_plans;
CREATE POLICY p_pricing_plans_admin_all ON public.pricing_plans
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS trg_pricing_plans_updated ON public.pricing_plans;
CREATE TRIGGER trg_pricing_plans_updated BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.pricing_plans (slug, name, description, price_cents, cycle, per_label, features, trial_days, cta_label, highlight, sort_order)
VALUES
  ('starter','Starter','Try the AI tutor with daily limits.',0,'monthly',NULL,
   '["10 listening drills/day","2 essays/week","Community Discord","Band predictor"]'::jsonb,0,'Get started',false,1),
  ('pro','Pro','Everything you need for a Band 8.',1900,'monthly','/mo',
   '["Unlimited drills & mocks","Unlimited essay scoring","AI speaking coach","12-week study plan","Priority email support"]'::jsonb,7,'Start 7-day trial',true,2),
  ('teams','Teams','For schools and coaching centres.',4900,'monthly','/seat',
   '["Everything in Pro","Cohort analytics","Custom branding","SSO & API","Dedicated CSM"]'::jsonb,0,'Contact sales',false,3)
ON CONFLICT (slug) DO NOTHING;
