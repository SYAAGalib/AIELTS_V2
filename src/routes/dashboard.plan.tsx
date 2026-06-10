import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard/plan")({
  head: () => ({
    meta: [
      { title: "Your 12-Week Study Plan — AIELTS" },
      { name: "description", content: "An adaptive 12-week IELTS study plan tailored to your current band and target." },
      { property: "og:title", content: "Your 12-Week Study Plan — AIELTS" },
      { property: "og:description", content: "An adaptive 12-week IELTS study plan tailored to your current band and target." },
      { property: "og:url", content: "/dashboard/plan" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PlanPage,
});

const quotes = [
  "Small steps every day beat giant leaps once a month.",
  "Your future band score is built one task at a time.",
  "Consistency is the secret weapon of high scorers.",
  "Today's effort = tomorrow's confidence.",
];

const today = new Date();
const monthName = today.toLocaleString(undefined, { month: "long", year: "numeric" });
const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
const firstWeekday = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

const tasksByDay: Record<number, string[]> = {
  [today.getDate()]: ["Listening — Section 3 mock (20 min)", "Writing — Task 2 essay (40 min)", "Speaking — Part 2 cue card (15 min)", "Vocabulary flashcards (10 min)"],
  [today.getDate() + 1]: ["Reading mock (60 min)", "Pronunciation drill (10 min)"],
  [today.getDate() + 2]: ["Listening drill (20 min)", "Writing Task 1 (20 min)"],
  [today.getDate() - 1]: ["Speaking Part 3 (15 min)", "Vocabulary set B (10 min)"],
};

function PlanPage() {
  const quote = useMemo(() => quotes[today.getDate() % quotes.length], []);
  const [selected, setSelected] = useState<number>(today.getDate());
  const [done, setDone] = useState<Record<string, boolean>>({});

  const toggle = (k: string) => setDone((d) => ({ ...d, [k]: !d[k] }));
  const dayTasks = tasksByDay[selected] ?? [];
  const completed = dayTasks.filter((t) => done[`${selected}-${t}`]).length;
  const pct = dayTasks.length ? Math.round((completed / dayTasks.length) * 100) : 0;

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl gradient-brand p-6 text-white shadow-xl shadow-primary/20">
        <div className="relative z-10 flex items-center gap-3">
          <Sparkles className="h-5 w-5" />
          <p className="text-sm opacity-90">Today's quote</p>
        </div>
        <h2 className="relative z-10 mt-2 font-display text-2xl font-bold leading-tight">"{quote}"</h2>
        <motion.div aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/15 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity }} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">{monthName}</h3>
            <p className="text-xs text-muted-foreground">Tap any day to view tasks</p>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const hasTasks = !!tasksByDay[d];
              const isToday = d === today.getDate();
              const isSel = d === selected;
              return (
                <motion.button key={i} onClick={() => setSelected(d)}
                  whileHover={{ y: -2 }}
                  className={`relative h-14 rounded-lg border text-sm transition ${
                    isSel ? "border-primary bg-primary/5 text-foreground shadow-[0_0_18px_color-mix(in_oklab,var(--primary)_25%,transparent)]"
                    : isToday ? "border-[var(--teal)]/50"
                    : "hover:border-primary/30"
                  }`}>
                  <span className={`absolute right-1.5 top-1.5 text-xs ${isSel ? "font-bold text-primary" : "text-muted-foreground"}`}>{d}</span>
                  {hasTasks && <span className={`absolute bottom-1.5 left-1.5 h-1.5 w-1.5 rounded-full ${isToday ? "bg-[var(--teal)]" : "bg-primary"}`} />}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div key={selected} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Day {selected}</p>
              <h3 className="font-display text-lg font-semibold">{dayTasks.length} task{dayTasks.length === 1 ? "" : "s"}</h3>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-primary">{pct}%</p>
              <p className="text-xs text-muted-foreground">complete</p>
            </div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full gradient-brand" animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
          </div>

          <ul className="mt-5 space-y-2">
            <AnimatePresence initial={false}>
              {dayTasks.length === 0 && (
                <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  Free day — review past mistakes or rest.
                </motion.li>
              )}
              {dayTasks.map((t, i) => {
                const k = `${selected}-${t}`;
                const checked = !!done[k];
                return (
                  <motion.li key={t}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <button onClick={() => toggle(k)}
                      className="flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition hover:border-primary/40 hover:bg-accent/40">
                      <motion.span
                        animate={{ scale: checked ? [1, 1.35, 1] : 1, backgroundColor: checked ? "var(--teal)" : "transparent", borderColor: checked ? "var(--teal)" : undefined }}
                        transition={{ duration: 0.35, ease: "backOut" }}
                        className="grid h-5 w-5 place-items-center rounded-md border">
                        <AnimatePresence>
                          {checked && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <Check className="h-3 w-3 text-white" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.span>
                      <span className={checked ? "text-muted-foreground line-through" : ""}>{t}</span>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
