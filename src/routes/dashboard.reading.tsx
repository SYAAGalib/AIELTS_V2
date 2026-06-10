import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useSubscription } from "@/lib/subscription";
import { UsageMeter } from "@/components/app/TrialBanner";
import { Paywall, LockedBanner } from "@/components/app/Paywall";
import { ModulePager } from "@/components/app/ModulePager";
import { ReadyDialog } from "@/components/app/ReadyDialog";
import { READING_MODULES } from "@/data/reading-modules";

export const Route = createFileRoute("/dashboard/reading")({
  head: () => ({
    meta: [
      { title: "IELTS Reading Practice — AIELTS" },
      { name: "description", content: "Practice IELTS Academic and General Reading with timed passages and AI explanations." },
      { property: "og:title", content: "IELTS Reading Practice — AIELTS" },
      { property: "og:description", content: "Practice IELTS Academic and General Reading with timed passages and AI explanations." },
      { property: "og:url", content: "/dashboard/reading" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ReadingPage,
});

const accuracy = Array.from({ length: 8 }).map((_, i) => ({ w: `W${i+1}`, v: 60 + i*4 + (i%2?2:-2) }));

function ReadingPage() {
  const { isPro, canUse, recordUse, remaining } = useSubscription();
  const [scrollY, setScrollY] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [module, setModule] = useState(1);
  const [started, setStarted] = useState(false);
  const [secs, setSecs] = useState(14 * 60);
  const mod = READING_MODULES[module - 1];
  const passageLocked = !isPro;

  useEffect(() => {
    if (!started) return;
    const id = window.setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [started]);

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const handleSubmit = () => {
    if (!canUse("reading")) { setPaywall(true); return; }
    recordUse("reading");
    setShowResults(true);
  };
  return (
    <div className="space-y-6">
      <ReadyDialog
        open={!started}
        title={`Module ${module} • Reading`}
        description={`You'll have 14 minutes to read the passage and answer all questions. The timer starts when you click Ready.`}
        onReady={() => { setStarted(true); setSecs(14 * 60); }}
      />
      <Paywall open={paywall} onClose={() => setPaywall(false)}
        feature="Reading (Passage 2 & weekly limit)"
        description="Free plan includes Passage 1 only with 2 attempts per week." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <UsageMeter module="reading" label="Reading tests" />
        <div className="flex items-center gap-3">
          {started && (
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 text-primary" /> Time left{" "}
              <span className="font-display font-bold tabular-nums text-foreground">{fmt(secs)}</span>
            </span>
          )}
          {!isPro && <p className="text-xs text-muted-foreground">{remaining("reading") === 0 ? "Limit reached — resets Monday" : `${remaining("reading")} attempt${remaining("reading") === 1 ? "" : "s"} left this week`}</p>}
        </div>
      </div>
      {passageLocked && <LockedBanner feature="Passages 2 & 3 + Advanced Reading" onUpgrade={() => setPaywall(true)} />}
      {started && (
        <div className="grid gap-6 lg:grid-cols-5">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            onScroll={(e) => setScrollY((e.target as HTMLDivElement).scrollTop)}
            className="relative lg:col-span-3 max-h-[640px] overflow-y-auto rounded-2xl border bg-card p-6">
            <motion.div className="pointer-events-none absolute inset-x-0 -top-10 h-40 bg-gradient-to-b from-primary/10 to-transparent blur-xl"
              style={{ y: scrollY * -0.3 }} aria-hidden />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{mod.test} • Passage {module} • {mod.topic} • 14 min</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{mod.title}</h2>
            {mod.image && (
              <figure className="mt-4 overflow-hidden rounded-xl border bg-background">
                <img src={mod.image.url} alt={mod.image.caption ?? mod.title} loading="lazy" className="w-full" />
                {mod.image.caption && <figcaption className="border-t bg-muted/30 p-2 text-xs text-muted-foreground">{mod.image.caption}</figcaption>}
              </figure>
            )}
            <div className="prose prose-sm mt-4 max-w-none text-foreground/90">
              {mod.passage.split("\n\n").map((p, i) => (
                <motion.p key={i}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08 }}
                  className="mb-4 leading-7">{p}</motion.p>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-3">
            {mod.questions.map((q, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl border bg-card p-4">
                <p className="text-xs text-muted-foreground">Question {i+1} • {q.t.toUpperCase()}</p>
                <p className="mt-1 text-sm font-medium">{q.q}</p>
                {(q.t === "mcq" || q.t === "tfn") && q.opts ? (
                  <div className="mt-3 grid gap-2">
                    {q.opts.map((o) => (
                      <label key={o} className="flex items-center gap-2 rounded-md border p-2 text-sm hover:border-primary/40 cursor-pointer">
                        <input type="radio" name={`rq-${module}-${i}`} className="accent-[var(--primary)]" /> {o}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input className="mt-3 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Type your answer" />
                )}
                {showResults && (
                  <p className="mt-2 rounded-md bg-[var(--teal)]/10 px-2 py-1 text-xs text-[var(--teal)]">Answer: {q.answer}</p>
                )}
              </motion.div>
            ))}
            <button onClick={handleSubmit}
              disabled={!isPro && remaining("reading") === 0}
              className="w-full rounded-lg gradient-brand py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow disabled:cursor-not-allowed disabled:opacity-50">
              {!isPro && remaining("reading") === 0 ? "Weekly limit reached — Upgrade" : "Submit"}
            </button>
          </motion.div>
        </div>
      )}

      <ModulePager
        total={READING_MODULES.length}
        current={module}
        onChange={(n) => { setModule(n); setShowResults(false); setStarted(false); setSecs(14 * 60); }}
        label="Reading module"
        isLocked={(n) => !isPro && n > 1}
        onLockedClick={() => setPaywall(true)}
      />


      <AnimatePresence>
        {showResults && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Results</p>
                <h3 className="font-display text-2xl font-bold">36 / 40 → Band <span className="text-primary">8.0</span></h3>
                <p className="mt-1 text-sm text-muted-foreground">Accuracy 90% — strongest on MCQ, weakest on matching headings.</p>
              </div>
              <button onClick={() => setShowResults(false)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer>
                <LineChart data={accuracy}>
                  <defs>
                    <linearGradient id="rline" x1="0" x2="1">
                      <stop offset="0%" stopColor="var(--primary)" /><stop offset="100%" stopColor="var(--teal)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="w" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[40, 100]} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="v" stroke="url(#rline)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)" }} animationDuration={2000} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
