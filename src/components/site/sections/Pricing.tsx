import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicPricingPlans, type PricingPlan } from "@/lib/pricing.functions";

const FALLBACK: PricingPlan[] = [
  { id: "f1", slug: "starter", name: "Starter", description: "Try the AI tutor with daily limits.", price_cents: 0, currency: "USD", cycle: "monthly", per_label: null, features: ["10 listening drills/day","2 essays/week","Community Discord","Band predictor"], trial_days: 0, cta_label: "Get started", highlight: false, active: true, sort_order: 1 },
  { id: "f2", slug: "pro", name: "Pro", description: "Everything you need for a Band 8.", price_cents: 1900, currency: "USD", cycle: "monthly", per_label: "/mo", features: ["Unlimited drills & mocks","Unlimited essay scoring","AI speaking coach","12-week study plan","Priority email support"], trial_days: 7, cta_label: "Start 7-day trial", highlight: true, active: true, sort_order: 2 },
  { id: "f3", slug: "business", name: "Business", description: "For schools and coaching centres — coming soon.", price_cents: 0, currency: "USD", cycle: "monthly", per_label: null, features: ["Everything in Pro","Cohort analytics","Custom branding","Dedicated success manager"], trial_days: 0, cta_label: "Coming soon", highlight: false, active: true, sort_order: 3 },
];

function formatPrice(p: PricingPlan): string {
  if (p.price_cents === 0) return "Free";
  const symbol = p.currency === "USD" ? "$" : `${p.currency} `;
  const amount = p.price_cents % 100 === 0 ? (p.price_cents / 100).toString() : (p.price_cents / 100).toFixed(2);
  return `${symbol}${amount}`;
}

export function Pricing() {
  const fetchPlans = useServerFn(listPublicPricingPlans);
  const { data } = useQuery({
    queryKey: ["public-pricing-plans"],
    queryFn: () => fetchPlans(),
  });
  const plans = (data && data.length > 0 ? data : FALLBACK);
  return (
    <section id="pricing" className="relative bg-muted/30 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Pricing</p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">
            Simple plans. <span className="text-gradient-brand">Cheaper than one tutor session.</span>
          </h2>
        </motion.div>
        <div className="mt-14 grid items-stretch gap-6 md:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              whileHover={{ y: -8, rotateX: 2, rotateY: -2 }}
              className={`relative flex flex-col rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-2xl ${
                p.highlight ? "md:scale-105 border-primary/50 glow-primary" : ""
              }`}
            >
              {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-brand px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-5 flex items-baseline gap-1">
                {p.slug === "business" ? (
                  <span className="font-display text-3xl font-extrabold text-muted-foreground">Coming soon</span>
                ) : (
                  <>
                    <span className="font-display text-5xl font-extrabold">{formatPrice(p)}</span>
                    {p.per_label && <span className="text-sm text-muted-foreground">{p.per_label}</span>}
                  </>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--teal)" }} /> {f}
                  </li>
                ))}
              </ul>
              <Button
                disabled={p.slug === "business"}
                className={`mt-8 w-full ${p.highlight ? "gradient-brand text-white hover:opacity-90" : ""}`}
                variant={p.highlight ? "default" : "outline"}
              >
                {p.cta_label}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
