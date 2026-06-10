import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ListChecks, MessageSquare, RefreshCw } from "lucide-react";

export function Demo() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-40, 60]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-4, 4]);

  return (
    <section id="demo" ref={ref} className="relative overflow-hidden py-28 md:py-36">
      <div className="absolute inset-0 -z-10 grid-bg mask-radial-fade opacity-50" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 md:grid-cols-2 md:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">A look inside</p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Submit. Get a band. Improve. Repeat.
          </h2>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Drop in your Task 2 essay and watch the AI break it down across all four criteria with a precise band — and a rewrite plan you can actually use.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { icon: ListChecks, t: "Examiner-grade rubric", d: "TR · CC · LR · GRA — same four bands you'll get on test day." },
              { icon: MessageSquare, t: "Rewrite suggestions inline", d: "See the exact sentence that cost you 0.5 — and how to fix it." },
              { icon: RefreshCw, t: "Auto-updates your study plan", d: "Weak on cohesion? Tomorrow's plan adds two cohesion drills." },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display font-semibold">{t}</p>
                  <p className="text-sm text-muted-foreground">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <motion.div style={{ y: y1, rotate }} className="ml-auto w-[88%] rounded-3xl border bg-card p-6 shadow-xl shadow-primary/5">
            <div className="flex items-center justify-between text-xs">
              <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-muted-foreground">task-2.docx</span>
              <span className="font-mono text-emerald-600">Scored in 38s</span>
            </div>
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/80">
              <p>Many people argue that international tourism brings more harm than good to the local community...</p>
              <p className="rounded-md bg-amber-100/50 px-1 py-0.5 text-foreground/70">However, the recent increase in <u className="decoration-amber-500">tourism activities</u> have <u className="decoration-amber-500">brung</u> economic benefit.</p>
              <p className="text-foreground/55">→ AI: subject-verb agreement; consider "have brought".</p>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2 text-center">
              {["TR", "CC", "LR", "GRA"].map((k, i) => (
                <div key={k} className="rounded-xl border bg-secondary/50 py-2">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground">{k}</div>
                  <div className="font-display text-lg font-bold">{[7.5, 8.0, 7.0, 6.5][i]}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div style={{ y: y2 }} className="absolute -left-4 -bottom-8 w-56 rounded-2xl border bg-foreground p-5 text-background shadow-2xl">
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Predicted overall</div>
            <div className="mt-1 font-display text-5xl font-bold">7.5</div>
            <div className="mt-1 text-xs text-emerald-300">▲ up from 7.0 last week</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
