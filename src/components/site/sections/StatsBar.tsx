import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicStats } from "@/lib/homepage.functions";
import { BookOpen, Video, Users, Sparkles } from "lucide-react";
import { DEFAULT_CONFIG, type StatsConfig } from "@/lib/homepage-config";

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

const iconByIndex = [Video, BookOpen, Users, Sparkles];

export function StatsBar({ config = DEFAULT_CONFIG.stats }: { config?: StatsConfig } = {}) {
  const fetchFn = useServerFn(getPublicStats);
  const { data } = useQuery({
    queryKey: ["public-stats"],
    queryFn: () => fetchFn(),
    staleTime: 5 * 60_000,
  });

  const items = config.items.map((it, i) => {
    let value = it.value;
    if (it.source === "videos") value = data?.videos ?? it.value;
    else if (it.source === "modules") value = data?.modules ?? it.value;
    else if (it.source === "testimonials") value = data?.testimonials ?? it.value;
    return { Icon: iconByIndex[i] ?? Sparkles, label: it.label, value, suffix: it.suffix };
  });

  return (
    <section className="relative border-y bg-card/40 py-14 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4 md:px-8">
        {items.map(({ Icon, label, value, suffix }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex flex-col items-start"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              <CountUp value={value} suffix={suffix ? ` ${suffix}` : ""} />
              <span className="text-primary">+</span>
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
