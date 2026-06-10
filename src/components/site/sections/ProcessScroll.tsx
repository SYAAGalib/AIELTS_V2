import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useRef, useState } from "react";
import { ScanLine, CalendarDays, Target, TrendingUp } from "lucide-react";
import step03Img from "@/assets/process-step-03.jpg";
import step04Img from "@/assets/process-step-04.jpg";

const steps = [
  {
    n: "01",
    icon: ScanLine,
    title: "Take a 10-minute diagnostic.",
    body: "We sample every question type — pick a band, map your weak spots, and predict where you'd land today.",
    img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=70",
  },
  {
    n: "02",
    icon: CalendarDays,
    title: "Get your personalised plan.",
    body: "12-week, day-by-day plan tuned to your exam date and target band — every task chosen for your weakest criterion.",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=70",
  },
  {
    n: "03",
    icon: Target,
    title: "Practise with the AI examiner.",
    body: "Submit Writing or speak into your mic — get a four-criterion band in under a minute, with rewrites and rubric notes.",
    img: step03Img,
  },
  {
    n: "04",
    icon: TrendingUp,
    title: "Watch your predicted band rise.",
    body: "Every drill updates the prediction within ±0.5 of test day. See exactly which skill is moving — and which still needs work.",
    img: step04Img,
  },
];

export function ProcessScroll() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(steps.length - 1, Math.max(0, Math.floor(p * steps.length)));
    setActive(i);
  });

  return (
    <section ref={ref} className="relative" style={{ height: `${steps.length * 110}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="absolute inset-0 -z-10 dot-bg opacity-40" />
        <div className="absolute right-0 top-1/2 -z-10 h-[40rem] w-[40rem] -translate-y-1/2 animate-blob-morph" style={{ background: "color-mix(in oklab, var(--primary) 14%, transparent)", filter: "blur(80px)" }} />

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-12 md:px-8">
          {/* Left column: step text */}
          <div className="md:col-span-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">How it works</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">
              Four steps. <br/>
              <span className="text-flow-gradient">One band leap.</span>
            </h2>

            <div className="mt-10 space-y-4 border-l border-border/60 pl-6">
              {steps.map((s, i) => {
                const isActive = i === active;
                const isPast = i < active;
                return (
                  <motion.div
                    key={s.n}
                    animate={{
                      opacity: isActive ? 1 : isPast ? 0.45 : 0.3,
                      x: isActive ? 0 : -4,
                      scale: isActive ? 1 : 0.985,
                    }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="relative rounded-2xl p-4 transition-colors"
                    style={{
                      background: isActive
                        ? "color-mix(in oklab, var(--primary) 6%, transparent)"
                        : "transparent",
                    }}
                  >
                    {/* active rail marker */}
                    <motion.span
                      aria-hidden
                      initial={false}
                      animate={{
                        height: isActive ? "100%" : "0%",
                        opacity: isActive ? 1 : 0,
                      }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute -left-[25px] top-0 w-[2px] rounded-full bg-primary"
                    />
                    <motion.span
                      animate={{
                        scale: isActive ? 1.15 : 1,
                        backgroundColor: isActive
                          ? "var(--primary)"
                          : isPast
                            ? "color-mix(in oklab, var(--primary) 35%, var(--background))"
                            : "var(--background)",
                        color: isActive || isPast ? "var(--primary-foreground)" : "var(--muted-foreground)",
                        borderColor: isActive ? "var(--primary)" : "var(--border)",
                      }}
                      transition={{ duration: 0.35 }}
                      className="absolute -left-[37px] top-4 grid h-7 w-7 place-items-center rounded-full border text-[11px] font-bold shadow-sm"
                    >
                      {isPast ? "✓" : i + 1}
                    </motion.span>
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                      <s.icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : ""}`} /> Step {s.n}
                    </div>
                    <h3 className={`mt-1 font-display text-2xl font-semibold leading-tight md:text-[28px] ${isActive ? "text-foreground" : "text-foreground/70"}`}>
                      {s.title}
                    </h3>
                    <motion.p
                      initial={false}
                      animate={{
                        height: isActive ? "auto" : 0,
                        opacity: isActive ? 1 : 0,
                        marginTop: isActive ? 8 : 0,
                      }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="max-w-md overflow-hidden text-sm leading-relaxed text-muted-foreground"
                    >
                      {s.body}
                    </motion.p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right column: image stack with swap */}
          <div className="relative md:col-span-6">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border bg-card shadow-2xl shadow-primary/10">
              {steps.map((s, i) => {
                const isActive = i === active;
                return (
                  <motion.div
                    key={s.n}
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <motion.img
                      initial={false}
                      animate={{ scale: isActive ? 1 : 1.08 }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      src={s.img}
                      alt={s.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="rounded-2xl border bg-card/85 p-4 backdrop-blur">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">{s.n}</p>
                        <p className="mt-1 font-display text-base font-semibold">{s.title}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress ring */}
            <div className="absolute -bottom-6 -right-6 hidden md:block">
              <div className="relative h-24 w-24 rounded-full border-2 border-border bg-card/80 backdrop-blur">
                <motion.div
                  className="absolute inset-1 rounded-full"
                  style={{
                    background: useTransform(
                      scrollYProgress,
                      (p) => `conic-gradient(var(--primary) ${p * 360}deg, color-mix(in oklab, var(--primary) 10%, transparent) 0)`,
                    ),
                    mask: "radial-gradient(transparent 55%, #000 56%)",
                    WebkitMask: "radial-gradient(transparent 55%, #000 56%)",
                  }}
                />
                <div className="absolute inset-0 grid place-items-center font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {active + 1}/{steps.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
