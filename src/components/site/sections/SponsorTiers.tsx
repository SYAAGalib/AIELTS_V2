import { motion } from "framer-motion";
import { Crown, Award, Medal, Heart, Check } from "lucide-react";

const TIERS = [
  {
    tier: "Platinum",
    range: "৳1,00,000+",
    icon: Crown,
    accent: "primary" as const,
    blurb: "Founding partner. Featured spotlight across the site.",
    benefits: [
      "Full-color logo on homepage spotlight",
      "Dedicated quote on Sponsors page",
      "Social media shout-out + newsletter feature",
      "Quarterly impact briefing (1-on-1)",
      "Earmark to a specific program",
    ],
  },
  {
    tier: "Gold",
    range: "৳50,000 – ৳99,999",
    icon: Award,
    accent: "primary" as const,
    blurb: "Powering content, infrastructure, and student support.",
    benefits: [
      "B&W logo + name across site",
      "Mention in monthly newsletter",
      "Sponsor community access",
      "Quarterly transparency report",
    ],
  },
  {
    tier: "Silver",
    range: "৳10,000 – ৳49,999",
    icon: Medal,
    accent: "muted" as const,
    blurb: "Communities and small teams keeping us going.",
    benefits: [
      "Name listed on Sponsors page",
      "Inclusion in rolling marquee",
      "Annual public impact report",
    ],
  },
  {
    tier: "Supporter",
    range: "Under ৳10,000",
    icon: Heart,
    accent: "muted" as const,
    blurb: "Every contribution adds up — individuals welcome.",
    benefits: [
      "Name on the supporters wall",
      "Thank-you email from the team",
      "Annual public impact report",
    ],
  },
];

export function SponsorTiers() {
  return (
    <section className="border-t bg-background py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-2 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              How our tier system works
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              Four contribution tiers, four levels of recognition. Every taka funds a better software experience and keeps the Free tier free for every student.
            </p>
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Annual contribution
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t, i) => {
            const Icon = t.icon;
            const isPrimary = t.accent === "primary";
            return (
              <motion.div
                key={t.tier}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                whileHover={{ y: -3 }}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border p-6 backdrop-blur-sm transition-shadow ${
                  isPrimary
                    ? "border-primary/25 bg-gradient-to-br from-card via-card to-primary/[0.06] hover:shadow-[0_16px_40px_-16px] hover:shadow-primary/30"
                    : "border-border/70 bg-card/40 hover:border-foreground/30 hover:shadow-lg"
                }`}
              >
                {isPrimary && (
                  <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-primary/20 blur-3xl transition-opacity group-hover:opacity-90" />
                )}

                <div className="relative flex items-center justify-between">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl ${
                      isPrimary
                        ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/30"
                        : "border border-border bg-muted text-foreground/70"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tier {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="relative mt-5">
                  <div className="font-display text-xl font-bold tracking-tight text-foreground">{t.tier}</div>
                  <div
                    className={`mt-1 font-display text-lg font-semibold ${
                      isPrimary ? "text-primary" : "text-foreground/70"
                    }`}
                  >
                    {t.range}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.blurb}</p>
                </div>

                <ul className="relative mt-5 flex-1 space-y-2 border-t border-border/60 pt-4">
                  {t.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-foreground/80">
                      <Check
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                          isPrimary ? "text-primary" : "text-foreground/50"
                        }`}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
