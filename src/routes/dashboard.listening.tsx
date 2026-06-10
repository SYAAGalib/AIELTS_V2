import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, ChevronDown, CheckCircle2, Lock } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { useSubscription } from "@/lib/subscription";
import { UsageMeter } from "@/components/app/TrialBanner";
import { Paywall, LockedBanner } from "@/components/app/Paywall";
import { ModulePager } from "@/components/app/ModulePager";

const LISTENING_MODULES = [
  { title: "Sustainable Architecture in Coastal Cities", section: "Section 3", topic: "University discussion" },
  { title: "Booking a holiday apartment", section: "Section 1", topic: "Social conversation" },
  { title: "City tour information", section: "Section 2", topic: "Monologue" },
  { title: "Renewable energy lecture", section: "Section 4", topic: "Academic lecture" },
  { title: "Job interview preparation", section: "Section 3", topic: "Tutorial discussion" },
];

export const Route = createFileRoute("/dashboard/listening")({
  head: () => ({
    meta: [
      { title: "IELTS Listening Practice — AIELTS" },
      { name: "description", content: "Practice IELTS Listening with AI-scored sections, accent variety, and instant transcript review." },
      { property: "og:title", content: "IELTS Listening Practice — AIELTS" },
      { property: "og:description", content: "Practice IELTS Listening with AI-scored sections, accent variety, and instant transcript review." },
      { property: "og:url", content: "/dashboard/listening" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ListeningPage,
});

const sections = [
  { n: "Section 1", topic: "Social conversation: Booking accommodation",
    qs: [{ t: "mcq", q: "What is the cost of the deposit?", opts: ["£50","£100","£150"] },
         { t: "fill", q: "Check-in time: ___" },
         { t: "match", q: "Match each amenity to its location." }] },
  { n: "Section 2", topic: "Monologue: City tour information",
    qs: [{ t: "mcq", q: "The tour starts at ___", opts: ["9 am","10 am","11 am"] },
         { t: "fill", q: "Meeting point is near the ___" }] },
  { n: "Section 3", topic: "University discussion: Coastal Architecture",
    qs: [{ t: "short", q: "What is the main argument of the researcher?" },
         { t: "mcq", q: "The professor recommends focusing on ___", opts: ["materials","cost","climate"] }] },
  { n: "Section 4", topic: "Academic lecture: Renewable energy",
    qs: [{ t: "fill", q: "Solar adoption grew by ___% last decade" },
         { t: "fill", q: "Largest barrier mentioned: ___" }] },
];

const weak = [
  { t: "Multiple choice", v: 78 },
  { t: "Fill blanks", v: 64 },
  { t: "Matching", v: 52 },
  { t: "Short answer", v: 71 },
];

function ListeningPage() {
  const { isPro, canUse, recordUse, remaining } = useSubscription();
  const [module, setModule] = useState(1);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [openSec, setOpenSec] = useState<string | null>("Section 1");
  const [showResults, setShowResults] = useState(false);
  const [paywall, setPaywall] = useState<null | string>(null);
  const ref = useRef<number | null>(null);
  const mod = LISTENING_MODULES[module - 1];

  useEffect(() => {
    if (playing) ref.current = window.setInterval(() => setT((s) => (s + 1) % 180), 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [playing]);

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const isLocked = (n: string) => !isPro && (n === "Section 3" || n === "Section 4");

  const handleSubmit = () => {
    if (!canUse("listening")) { setPaywall("Listening (weekly limit reached)"); return; }
    recordUse("listening");
    setShowResults(true);
  };

  return (
    <div className="space-y-6">
      <Paywall
        open={paywall !== null}
        onClose={() => setPaywall(null)}
        feature={paywall ?? ""}
        description="You've used your free Listening attempts this week, or this section is Pro-only."
      />
      <div className="flex items-center justify-between gap-3">
        <UsageMeter module="listening" label="Listening tests" />
        {!isPro && (
          <p className="text-xs text-muted-foreground">{remaining("listening") === 0 ? "Limit reached — resets Monday" : `${remaining("listening")} attempt${remaining("listening") === 1 ? "" : "s"} left this week`}</p>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Module {module} • {mod.section} • {mod.topic}</p>
                <h2 className="mt-1 font-display text-xl font-semibold">{mod.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Read all {sections.reduce((a, s) => a + s.qs.length, 0)} questions below first. Press play when you're ready.</p>
              </div>

            </div>
          </motion.div>

          {/* Sticky bottom audio bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-x-0 bottom-0 z-40 pointer-events-none"
          >
            <div className="mx-auto max-w-3xl px-4 pb-4 pointer-events-auto">
              <div className="relative">
                {/* Echo / pulse rings while playing */}
                {playing && (
                  <>
                    <motion.div
                      aria-hidden
                      initial={{ opacity: 0.5, scale: 0.9 }}
                      animate={{ opacity: 0, scale: 1.15 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                    />
                    <motion.div
                      aria-hidden
                      initial={{ opacity: 0.4, scale: 0.95 }}
                      animate={{ opacity: 0, scale: 1.1 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                      className="absolute inset-0 rounded-full bg-[var(--teal)]/20 blur-2xl"
                    />
                  </>
                )}

                {!ready ? (
                  <button
                    onClick={() => { setReady(true); setPlaying(true); }}
                    aria-label="Start audio"
                    className="relative w-full flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/40 px-6 py-3 text-sm font-semibold text-foreground shadow-2xl backdrop-blur-xl hover:bg-background/60 hover:border-primary/40 transition"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </span>
                    Start audio
                  </button>
                ) : (
                  <div className="relative flex items-center gap-3 rounded-full border border-border/50 bg-background/30 px-3 py-2 shadow-2xl backdrop-blur-xl">
                    <button
                      onClick={() => setT((s) => Math.max(0, s-10))}
                      aria-label="Back 10s"
                      className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition"
                    ><SkipBack className="h-4 w-4" /></button>
                    <button
                      onClick={() => setPlaying((p) => !p)}
                      aria-label={playing ? "Pause" : "Play"}
                      className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground hover:scale-105 transition shadow-lg shadow-primary/40"
                    >
                      {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                    </button>
                    <button
                      onClick={() => setT((s) => Math.min(180, s+10))}
                      aria-label="Forward 10s"
                      className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition"
                    ><SkipForward className="h-4 w-4" /></button>

                    <div className="flex flex-1 items-center gap-3 px-2">
                      <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-foreground/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-[var(--teal)] transition-all" style={{ width: `${(t/180)*100}%` }} />
                      </div>
                      <span className="font-mono text-[11px] tabular-nums text-muted-foreground shrink-0">{fmt(t)} / 03:00</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>



          <div className="space-y-3">
            {sections.map((s, i) => {
              const open = openSec === s.n;
              const locked = isLocked(s.n);
              return (
                <motion.div key={s.n}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className={`overflow-hidden rounded-2xl border bg-card ${locked ? "opacity-90" : ""}`}>
                  <button onClick={() => locked ? setPaywall(`${s.n} — Advanced Listening`) : setOpenSec(open ? null : s.n)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left">
                    <div className="flex items-center gap-3">
                      {locked && <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary"><Lock className="h-3.5 w-3.5" /></span>}
                      <div>
                        <p className="font-display font-semibold">{s.n} {locked && <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">PRO</span>}</p>
                        <p className="text-xs text-muted-foreground">{s.topic}</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${open && !locked ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && !locked && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }} className="overflow-hidden">
                        <div className="space-y-3 border-t p-5">
                          {s.qs.map((q, qi) => (
                            <motion.div key={qi}
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.1 }}
                              className="rounded-lg border p-4">
                              <p className="text-sm font-medium">{q.q}</p>
                              {q.t === "mcq" && (
                                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                  {q.opts!.map((o) => (
                                    <label key={o} className="flex items-center gap-2 rounded-md border p-2 text-sm hover:border-primary/40 cursor-pointer">
                                      <input type="radio" name={`${s.n}-${qi}`} className="accent-[var(--primary)]" /> {o}
                                    </label>
                                  ))}
                                </div>
                              )}
                              {(q.t === "fill" || q.t === "short" || q.t === "match") && (
                                <input className="mt-3 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                  placeholder={q.t === "short" ? "Write 1–2 sentences…" : "Type your answer"} />
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
            {!isPro && <LockedBanner feature="Sections 3 & 4 + unlimited Listening" onUpgrade={() => setPaywall("Advanced Listening")} />}
            <button onClick={handleSubmit}
              disabled={!isPro && remaining("listening") === 0}
              className="w-full rounded-lg gradient-brand py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow disabled:cursor-not-allowed disabled:opacity-50">
              {!isPro && remaining("listening") === 0 ? "Weekly limit reached — Upgrade" : "Submit & see results"}
            </button>
          </div>
        </div>

        <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="space-y-4">
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-display text-lg font-semibold">Tips</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Read all questions before audio starts.</li>
              <li>• Listen for paraphrasing.</li>
              <li>• Watch out for distractors and corrections.</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Mock progress</p>
            <p className="mt-2 font-display text-3xl font-bold">7 / 10</p>
            <p className="text-xs text-muted-foreground">questions attempted</p>
          </div>
        </motion.aside>
      </div>

      <ModulePager
        total={LISTENING_MODULES.length}
        current={module}
        onChange={(n) => { setModule(n); setReady(false); setPlaying(false); setT(0); setShowResults(false); }}
        label="Listening module"
        isLocked={(n) => !isPro && n > 2}
        onLockedClick={(n) => setPaywall(`Module ${n} — Advanced Listening`)}
      />


      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Results</p>
                <h3 className="font-display text-2xl font-bold">Raw 32/40 → Band <span className="text-primary">7.5</span></h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-[var(--teal)]"><CheckCircle2 className="h-4 w-4" /> 8 correct answers highlighted in the transcript</p>
              </div>
              <button onClick={() => setShowResults(false)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer>
                <BarChart data={weak}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="t" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Bar dataKey="v" radius={[10, 10, 0, 0]} animationDuration={1800}>
                    {weak.map((w, i) => (
                      <Cell key={i} fill={w.v < 65 ? "#f59e0b" : i % 2 ? "var(--teal)" : "var(--primary)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
