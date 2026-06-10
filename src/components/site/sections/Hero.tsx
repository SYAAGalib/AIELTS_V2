import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Mic, PenLine, Headphones, BookOpen } from "lucide-react";

import { useRef, useEffect } from "react";
import { DEFAULT_CONFIG, type HeroConfig } from "@/lib/homepage-config";

const chipIcons: Record<string, typeof Mic> = {
  Listening: Headphones,
  Reading: BookOpen,
  Writing: PenLine,
  Speaking: Mic,
};

export function Hero({ config = DEFAULT_CONFIG.hero }: { config?: HeroConfig } = {}) {
  const headlineWords = config.headline.split(/\s+/);
  const ref = useRef<HTMLElement>(null);

  // Cursor spotlight
  const mx = useMotionValue(50);
  const my = useMotionValue(20);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mx.set(((e.clientX - r.left) / r.width) * 100);
      my.set(((e.clientY - r.top) / r.height) * 100);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  const spotlight = useTransform([sx, sy], ([x, y]) =>
    `radial-gradient(420px circle at ${x}% ${y}%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)`,
  );

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-28 pb-32 md:pt-36 md:pb-40">
      {/* Cinematic video background */}
      <div className="absolute inset-0 -z-10">
        <motion.video
          style={{ scale: 1.05 }}
          autoPlay loop muted playsInline
          className="h-full w-full object-cover opacity-[0.22]"
          aria-hidden
        >
          <source src="https://cdn.coverr.co/videos/coverr-typing-on-a-laptop-7263/1080p.mp4" type="video/mp4" />
        </motion.video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        <div className="absolute inset-0 grid-bg mask-radial-fade opacity-50" />
        {/* Conic aurora orbs */}
        <div className="absolute -top-40 left-1/4 h-[36rem] w-[36rem] animate-conic-spin conic-aurora opacity-60" />
        <div className="absolute -bottom-40 right-1/4 h-[28rem] w-[28rem] animate-blob-morph" style={{ background: "color-mix(in oklab, var(--teal) 22%, transparent)", filter: "blur(80px)" }} />
        {/* Cursor spotlight */}
        <motion.div className="absolute inset-0" style={{ background: spotlight }} />
        <div className="absolute inset-0 noise-overlay" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-12 md:px-8">
        <div className="md:col-span-7">
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-foreground md:text-7xl">
            {headlineWords.map((w, i) => (
              <span
                key={i}
                className={"mr-[0.25em] inline-block " + (w === config.gradientWord ? "text-flow-gradient" : "")}
              >
                {w}
              </span>
            ))}
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {config.sub}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl bg-foreground px-7 text-background hover:bg-foreground/90">
              <a href={config.ctaPrimary.href}>{config.ctaPrimary.label} <ArrowRight className="ml-1 h-4 w-4" /></a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl border-border bg-card/70 px-7 backdrop-blur hover:bg-card">
              <a href={config.ctaSecondary.href}><Play className="mr-1 h-4 w-4" /> {config.ctaSecondary.label}</a>
            </Button>
          </div>

          {/* Skill chips strip */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {config.skillChips.map((l) => {
              const Icon = chipIcons[l] ?? Mic;
              return (
                <span key={l} className="inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1 text-xs font-semibold text-foreground/80 backdrop-blur">
                  <Icon className="h-3 w-3 text-primary" /> {l}
                </span>
              );
            })}
          </div>
        </div>

        <ScoreCard />
      </div>

      {/* Bottom scrolling word-strip */}
      <div className="relative mt-20 overflow-hidden border-y bg-card/60 py-5 backdrop-blur">
        <div className="flex w-max animate-marquee gap-12 font-display text-2xl font-bold tracking-tight text-foreground/30 md:text-3xl">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["Listening", "Reading", "Writing", "Speaking", "Mock Tests", "Vocabulary", "Spik Buddy", "Predicted Band"].map((w, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-12">
                {w}
                <span className="h-2 w-2 rounded-full bg-primary/40" />
              </span>
            )),
          )}
        </div>
      </div>
    </section>
  );
}

function ScoreCard() {
  const bars = [
    { label: "Listening", val: 88 },
    { label: "Reading", val: 81 },
    { label: "Writing", val: 74 },
    { label: "Speaking", val: 85 },
  ];
  const cardRef = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 18 });
  const sry = useSpring(ry, { stiffness: 120, damping: 18 });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
      className="md:col-span-5"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={(e) => {
          const r = cardRef.current!.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          ry.set(px * 14);
          rx.set(-py * 14);
        }}
        onMouseLeave={() => { rx.set(0); ry.set(0); }}
        style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000 }}
        className="relative"
      >
        <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/10 blur-3xl" />
        <div className="relative rounded-[2rem] border bg-card/90 p-7 shadow-xl shadow-primary/10 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Predicted band</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-6xl font-bold tracking-tight">7.5</span>
                <span className="text-sm font-medium text-emerald-500">+0.5 wk</span>
              </div>
            </div>
            <span className="relative inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              <span className="absolute -left-0.5 -top-0.5 h-2 w-2 animate-pulse-ring rounded-full bg-emerald-500" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {bars.map((b, i) => (
              <div key={b.label}>
                <div className="mb-1.5 flex justify-between text-xs font-medium">
                  <span className="text-foreground/80">{b.label}</span>
                  <span className="font-mono text-muted-foreground">{b.val}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${b.val}%` }}
                    transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-teal"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border bg-secondary/60 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AI tutor note</p>
            <p className="mt-1.5 text-sm leading-snug text-foreground/85">
              "Strong cohesion this week. Practise paraphrasing the Task 2 prompt before you write the intro."
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
