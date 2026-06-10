UPDATE public.pricing_plans
SET slug='business',
    name='Business',
    description='For schools and coaching centres — coming soon.',
    features='["Everything in Pro","Cohort analytics","Custom branding","Dedicated success manager"]'::jsonb,
    cta_label='Coming soon',
    highlight=false,
    price_cents=0,
    per_label=NULL
WHERE slug='teams';