import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Mic, Square, RefreshCcw, Sparkles, Lock, Zap, ZapOff, ChevronLeft, ChevronRight } from "lucide-react";
import { useSubscription } from "@/lib/subscription";
import { UsageMeter } from "@/components/app/TrialBanner";
import { Paywall } from "@/components/app/Paywall";

export const Route = createFileRoute("/dashboard/speaking")({
  head: () => ({
    meta: [
      { title: "IELTS Speaking Practice — AIELTS" },
      { name: "description", content: "Practice IELTS Speaking with our voice AI examiner and get scored on fluency, vocabulary, grammar, and pronunciation." },
      { property: "og:title", content: "IELTS Speaking Practice — AIELTS" },
      { property: "og:description", content: "Practice IELTS Speaking with our voice AI examiner and get scored on fluency, vocabulary, grammar, and pronunciation." },
      { property: "og:url", content: "/dashboard/speaking" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SpeakingPage,
});

const parts = [
  { p: "Part 1", q: "Tell me about your hometown.", time: 60 },
  { p: "Part 2", q: "Describe a place you would like to visit.", time: 120 },
  { p: "Part 3", q: "How has tourism changed your country?", time: 300 },
];

const breakdown = [
  { l: "Fluency & Coherence", v: 7.5, note: "Good rhythm, minor hesitations on connectors." },
  { l: "Lexical Resource",    v: 7.0, note: "Use more topic-specific collocations." },
  { l: "Grammatical Range",   v: 6.5, note: "Try more conditional & relative clauses." },
  { l: "Pronunciation",       v: 8.0, note: "Clear articulation and natural intonation." },
];

function SpeakingPage() {
  const { isPro, canUse, recordUse, remaining } = useSubscription();
  const systemReduce = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const v = localStorage.getItem("spk:reduce-motion");
    return v ? v === "1" : !!systemReduce;
  });
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("spk:reduce-motion", reduceMotion ? "1" : "0");
  }, [reduceMotion]);

  const [partIdx, setPartIdx] = useState(0);
  const [rec, setRec] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(28).fill(8));
  const [feedback, setFeedback] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const audioRef = useRef<number | null>(null);
  const timeRef = useRef<number | null>(null);
  const partLocked = !isPro && partIdx > 0;

  useEffect(() => {
    if (rec) {
      const interval = reduceMotion ? 260 : 90;
      audioRef.current = window.setInterval(
        () => setBars((b) => b.map(() => (reduceMotion ? 12 + Math.random() * 24 : 6 + Math.random() * 60))),
        interval,
      );
      timeRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      setBars(Array(28).fill(8));
    }
    return () => {
      if (audioRef.current) clearInterval(audioRef.current);
      if (timeRef.current) clearInterval(timeRef.current);
    };
  }, [rec, reduceMotion]);

  const stop = () => { setRec(false); recordUse("speaking"); setFeedback(true); };
  const retry = () => { setFeedback(false); setElapsed(0); };
  const startRec = () => {
    if (partLocked) { setPaywall(true); return; }
    if (!canUse("speaking")) { setPaywall(true); return; }
    setRec(true);
  };

  const goPart = (i: number) => {
    const next = Math.max(0, Math.min(parts.length - 1, i));
    if (next === partIdx) return;
    setPartIdx(next);
    retry();
    if (!isPro && next > 0) setPaywall(true);
  };

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Paywall open={paywall} onClose={() => setPaywall(false)}
        feature="Speaking AI examiner"
        description="Free plan includes Part 1 only with 1 attempt per week." />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <UsageMeter module="speaking" label="Speaking sessions" />
        <div className="flex items-center gap-3">
          {!isPro && <p className="text-[11px] sm:text-xs text-muted-foreground">{remaining("speaking") === 0 ? "Limit reached — resets Monday" : `${remaining("speaking")} left this week`}</p>}
          <button
            onClick={() => setReduceMotion((v) => !v)}
            aria-pressed={reduceMotion}
            title="Toggle calm mode (reduce motion)"
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${reduceMotion ? "border-primary/40 bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            {reduceMotion ? <ZapOff className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
            Calm mode
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goPart(partIdx - 1)}
            disabled={partIdx === 0}
            aria-label="Previous part"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-card text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div
            className="flex flex-1 gap-2 overflow-x-auto px-1 pb-1 snap-x snap-mandatory"
            onTouchStart={(e) => { (e.currentTarget as any)._x = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              const start = (e.currentTarget as any)._x as number | undefined;
              if (start == null) return;
              const dx = e.changedTouches[0].clientX - start;
              if (Math.abs(dx) > 40) goPart(partIdx + (dx < 0 ? 1 : -1));
            }}
          >
            {parts.map((p, i) => {
              const locked = !isPro && i > 0;
              const active = partIdx === i;
              return (
                <button key={p.p} onClick={() => goPart(i)}
                  aria-current={active ? "step" : undefined}
                  className={`relative inline-flex shrink-0 snap-center items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    active ? "text-white ring-2 ring-primary/40 ring-offset-2 ring-offset-background" : "text-muted-foreground hover:text-foreground border"
                  }`}>
                  {active && <motion.span layoutId="spk-part" transition={reduceMotion ? { duration: 0 } : undefined} className="absolute inset-0 -z-10 rounded-full gradient-brand" />}
                  {locked && <Lock className="h-3 w-3" />}
                  {p.p}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => goPart(partIdx + 1)}
            disabled={partIdx === parts.length - 1}
            aria-label="Next part"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-card text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-1.5 sm:hidden">
          {parts.map((_, i) => (
            <button key={i} onClick={() => goPart(i)} aria-label={`Go to part ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${partIdx === i ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"}`} />
          ))}
        </div>
        <p className="text-center text-[10px] text-muted-foreground sm:hidden">Swipe to switch parts</p>
      </div>


      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-4 sm:space-y-6">

          <div className="rounded-2xl border bg-card p-4 sm:p-6">
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground">Examiner says…</p>
            <h2 className="mt-1 font-display text-xl sm:text-2xl font-semibold">{parts[partIdx].q}</h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">Suggested time: {fmt(parts[partIdx].time)}</p>
          </div>

          <div className="rounded-2xl border bg-card p-5 sm:p-8 text-center">
            <div className="flex h-24 sm:h-32 items-end justify-center gap-1">
              {bars.map((h, i) =>
                reduceMotion ? (
                  <div key={i} className="w-1.5 rounded-full" style={{ height: h, background: i % 2 ? "var(--primary)" : "var(--teal)" }} />
                ) : (
                  <motion.div key={i} animate={{ height: h }} transition={{ duration: 0.1 }}
                    className="w-1.5 rounded-full"
                    style={{ background: i % 2 ? "var(--primary)" : "var(--teal)" }} />
                )
              )}
            </div>
            <div className="mt-4 font-display text-2xl font-bold tabular-nums">{fmt(elapsed)}</div>
            <p className="text-xs text-muted-foreground">{rec ? "Recording…" : "Tap to record your response"}</p>
            <div className="mt-5 flex justify-center gap-3">
              {!rec ? (
                <motion.button onClick={startRec} whileTap={{ scale: 0.95 }}
                  disabled={!isPro && remaining("speaking") === 0}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full gradient-brand px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow disabled:cursor-not-allowed disabled:opacity-50">
                  {partLocked ? <Lock className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {partLocked ? "Pro required" : (!isPro && remaining("speaking") === 0 ? "Weekly limit reached" : "Start recording")}
                </motion.button>
              ) : (
                <motion.button onClick={stop} whileTap={{ scale: 0.95 }}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-destructive px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg">
                  <Square className="h-4 w-4" /> Stop & get feedback
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.aside initial={reduceMotion ? false : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border bg-card p-4 sm:p-6 h-fit">
          <h3 className="font-display text-base sm:text-lg font-semibold">Live coaching</h3>
          <div className="mt-4 space-y-3 text-sm">
            {breakdown.map((c) => (
              <div key={c.l}>
                <div className="mb-1 flex justify-between text-xs"><span className="truncate pr-2">{c.l}</span><span className="font-bold text-primary">{c.v}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.v*10}%` }} transition={{ duration: 1 }} className="h-full gradient-brand" />
                </div>
              </div>
            ))}
          </div>
        </motion.aside>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground">AI feedback</p>
                <h3 className="font-display text-xl sm:text-2xl font-bold">Overall Band <span className="text-primary">7.5</span></h3>
              </div>
              <button onClick={retry}
                className="group inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-semibold transition hover:border-primary/40 hover:shadow-[0_0_20px_var(--primary)]">
                <RefreshCcw className="h-4 w-4 transition group-hover:rotate-180" /> Retry
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {breakdown.map((b, i) => (
                <motion.div key={b.l}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                  className="rounded-xl border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{b.l}</p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{b.v}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{b.note}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border bg-gradient-to-br from-primary/5 to-[var(--teal)]/10 p-4 sm:p-5">
              <p className="flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-wider text-primary"><Sparkles className="h-3.5 w-3.5" /> Suggested improved answer</p>
              <p className="mt-2 text-sm leading-relaxed">
                "One place I've always longed to visit is Kyoto. I came across it through a travel documentary that captured its serene temples and vibrant cherry blossoms. If I had the chance, I'd wander through the bamboo groves of Arashiyama, immerse myself in a traditional tea ceremony, and try to understand the cultural fusion of tradition and modernity that defines the city…"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
