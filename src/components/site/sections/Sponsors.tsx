import { motion } from "framer-motion";
import { Sparkles, Star, Heart, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicSponsors, type Sponsor } from "@/lib/sponsors.functions";

type Tier = "platinum" | "gold" | "silver";


function PlatinumShowcase({
  name,
  initials,
  tagline,
  index,
}: {
  name: string;
  initials: string;
  tagline?: string;
  index: number;
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      {/* Animated gradient ring */}
      <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-primary/40 via-primary/10 to-transparent opacity-60 blur-sm transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-b from-card via-card to-primary/[0.04] p-7 backdrop-blur-sm md:p-8">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:opacity-90" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        {/* Top shimmer */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        {/* Header row */}
        <div className="relative flex items-start justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3 w-3" /> Platinum
          </span>
          <span className="font-display text-3xl font-bold leading-none text-foreground/10 tabular-nums">
            {num}
          </span>
        </div>

        {/* Avatar */}
        <div className="relative mt-8">
          <div className="absolute inset-0 h-24 w-24 rounded-3xl bg-primary/40 blur-2xl" />
          <div className="relative grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-primary to-primary/60 font-display text-3xl font-bold text-primary-foreground shadow-xl shadow-primary/40 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
            {initials}
          </div>
        </div>

        {/* Name + tagline */}
        <div className="relative mt-6 flex-1">
          <div className="font-display text-2xl font-bold tracking-tight text-foreground">{name}</div>
          {tagline && (
            <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{tagline}</div>
          )}
        </div>

        {/* Footer meta */}
        <div className="relative mt-8 flex items-center justify-between border-t border-border/60 pt-5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Founding partner
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
      </div>
    </motion.div>
  );
}

function GoldCard({ name, initials, index }: { name: string; initials: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card/40 p-4 backdrop-blur-sm transition-all hover:border-foreground/30 hover:bg-card hover:shadow-lg"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border bg-gradient-to-br from-muted to-background font-display text-base font-bold text-foreground/70 transition-colors group-hover:text-foreground">
        {initials}
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">{name}</div>
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          <Star className="h-2.5 w-2.5" /> Gold partner
        </div>
      </div>
    </motion.div>
  );
}

function SilverChip({ name, initials }: { name: string; initials: string }) {
  return (
    <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3.5 py-1.5 backdrop-blur-sm transition-colors hover:border-foreground/30 hover:bg-card">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-muted to-background text-[10px] font-bold text-foreground/70">
        {initials}
      </span>
      <span className="text-xs font-medium text-foreground/80">{name}</span>
    </div>
  );
}

export function Sponsors() {
  const fetchSponsors = useServerFn(listPublicSponsors);
  const { data: sponsors = [] } = useQuery<Sponsor[]>({
    queryKey: ["public-sponsors"],
    queryFn: () => fetchSponsors(),
    staleTime: 60_000,
  });

  const platinum = sponsors.filter((s) => s.tier === "platinum");
  const gold = sponsors.filter((s) => s.tier === "gold");
  const silver = sponsors.filter((s) => s.tier === "silver");
  const silverLoop = [...silver, ...silver];

  if (sponsors.length === 0) return null;

  return (
    <section id="sponsors" className="relative overflow-hidden border-y bg-background py-24 md:py-28">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(var(--primary)/0.07),transparent_55%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <Heart className="h-3 w-3 fill-primary" /> Our sponsors
          </span>
          <h2 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Built with the people who believe{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              IELTS prep should be free.
            </span>
          </h2>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">
            Every tier — from founding Platinum partners to grassroots supporters — funds a better software experience and keeps the Free tier free for every student.
          </p>
        </motion.div>







        {/* Platinum — featured + rest */}
        <div className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-foreground/80">
                Platinum partners
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">Founding sponsors making the mission possible</p>
            </div>
            
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {platinum.map((s, i) => (
              <PlatinumShowcase
                key={s.name}
                name={s.name}
                initials={s.initials}
                tagline={s.tagline ?? undefined}
                index={i}
              />
            ))}
          </div>
        </div>

        {/* Gold */}
        <div className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-foreground/80">
                Gold partners
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">Powering content, infrastructure, and student support</p>
            </div>
            
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {gold.map((s, i) => (
              <GoldCard key={s.name} name={s.name} initials={s.initials} index={i} />
            ))}
          </div>
        </div>

        {/* Silver — marquee */}
        <div className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-foreground/80">
                Silver supporters
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">Communities and small teams keeping us going</p>
            </div>
            
          </div>
          <div className="group relative overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />
            <div className="flex w-max animate-marquee gap-3 py-1 group-hover:[animation-play-state:paused]">
              {silverLoop.map((s, i) => (
                <SilverChip key={`${s.name}-${i}`} name={s.name} initials={s.initials} />
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative mt-20 overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 md:p-12"
        >
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" /> Become a sponsor
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Build a better AIELTS — and keep the Free tier free for every student.
              </h3>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                Sponsor a tier, fund a feature, or back a scholarship cohort. Every contribution is recognized publicly.
              </p>
            </div>
            <a
              href="mailto:sponsors@aielts.app"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-[1.03] hover:bg-primary/90"
            >
              Get in touch
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
