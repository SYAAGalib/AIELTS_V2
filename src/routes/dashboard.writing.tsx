import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Clock, Save, Sparkles } from "lucide-react";
import { ModulePager } from "@/components/app/ModulePager";
import { ReadyDialog } from "@/components/app/ReadyDialog";
import { WRITING_MODULES } from "@/data/writing-modules";

export const Route = createFileRoute("/dashboard/writing")({
  head: () => ({
    meta: [
      { title: "IELTS Writing Practice — AIELTS" },
      { name: "description", content: "Practice IELTS Task 1 and Task 2 with instant AI essay scoring and band-9 model rewrites." },
      { property: "og:title", content: "IELTS Writing Practice — AIELTS" },
      { property: "og:description", content: "Practice IELTS Task 1 and Task 2 with instant AI essay scoring and band-9 model rewrites." },
      { property: "og:url", content: "/dashboard/writing" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WritingPage,
});

const breakdown = [
  { l: "Task Response", v: 7.0 },
  { l: "Coherence & Cohesion", v: 7.5 },
  { l: "Lexical Resource", v: 7.0 },
  { l: "Grammar", v: 6.5 },
];

function WritingPage() {
  const [module, setModule] = useState(1);
  const mod = WRITING_MODULES[module - 1];
  const [text, setText] = useState("");
  const [displayCount, setDisplayCount] = useState(0);
  const [secs, setSecs] = useState(mod.minutes * 60);
  const [saved, setSaved] = useState("Saved");
  const [feedback, setFeedback] = useState(false);
  const [started, setStarted] = useState(false);
  const target = text.trim() ? text.trim().split(/\s+/).length : 0;

  useEffect(() => {
    const start = displayCount;
    const diff = target - start;
    if (diff === 0) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 400);
      setDisplayCount(Math.round(start + diff * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  useEffect(() => {
    if (!started) return;
    const id = window.setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [started]);

  useEffect(() => {
    if (!text) return;
    setSaved("Saving…");
    const id = window.setTimeout(() => setSaved("Saved"), 600);
    return () => clearTimeout(id);
  }, [text]);

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="space-y-6">
      <ReadyDialog
        open={!started}
        title={`Module ${module} • ${mod.task}`}
        description={`You'll have ${mod.minutes} minutes to write at least ${mod.words} words. The timer starts when you click Ready.`}
        onReady={() => setStarted(true)}
      />
      {started && (
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border bg-card p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{mod.set} • {mod.task} • {mod.minutes} min • {mod.words}+ words</p>
          <h2 className="mt-1 font-display text-lg font-semibold leading-snug">
            {mod.prompt}
          </h2>
          {mod.image && (
            <figure className="mt-4 overflow-hidden rounded-xl border bg-background">
              <img src={mod.image.url} alt={mod.image.caption ?? "Task visual"} loading="lazy" className="w-full" />
              {mod.image.caption && <figcaption className="border-t bg-muted/30 p-2 text-xs text-muted-foreground">{mod.image.caption}</figcaption>}
            </figure>
          )}
          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            <p>You should:</p>
            <ul className="list-disc pl-5 space-y-1">
              {(mod.bullets ?? [
                "Give your opinion and support it with reasons",
                "Provide concrete examples from your experience",
                "Address counter-arguments where relevant",
              ]).map((b) => <li key={b}>{b}</li>)}
            </ul>
          </div>
          <div className="mt-6 rounded-xl border bg-gradient-to-br from-primary/5 to-[var(--teal)]/5 p-4">
            <p className="text-xs uppercase tracking-wider text-primary">Band-9 model phrases</p>
            <ul className="mt-2 grid grid-cols-1 gap-1.5 text-sm">
              {["It is widely acknowledged that…", "While there is some merit to…", "A compelling counter-argument is…", "By way of illustration,…"].map((p) => (
                <li key={p} className="rounded-md bg-background/60 px-2 py-1 text-muted-foreground">{p}</li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Time left <span className="font-display font-bold tabular-nums text-foreground">{fmt(secs)}</span></span>
            <span className="flex items-center gap-1.5 text-[var(--teal)]"><Save className="h-3.5 w-3.5" /> {saved}</span>
          </div>
          <motion.textarea
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Start typing your essay…"
            className="mt-4 h-[420px] w-full resize-none rounded-lg border bg-background p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Word count: <span className="font-display text-lg font-bold text-foreground">{displayCount}</span> / {mod.words}</span>
            <button onClick={() => setFeedback(true)}
              className="rounded-lg gradient-brand px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
              Score my essay
            </button>
          </div>
        </motion.div>
      </div>
      )}

      <ModulePager
        total={WRITING_MODULES.length}
        current={module}
        onChange={(n) => { setModule(n); setText(""); setSecs(WRITING_MODULES[n - 1].minutes * 60); setFeedback(false); setStarted(false); }}
        label="Writing module"
      />


      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">AI feedback</p>
                <h3 className="font-display text-2xl font-bold">Overall Band <span className="text-primary">7.0</span></h3>
              </div>
              <button onClick={() => setFeedback(false)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {breakdown.map((b, i) => (
                <motion.div key={b.l}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.07 }}
                  className="rounded-xl border bg-background p-4">
                  <p className="text-xs text-muted-foreground">{b.l}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-primary">{b.v}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Highlighted mistakes</p>
              <p className="mt-3 text-sm leading-7">
                Technology, in many ways,{" "}
                <Highlight tone="warn">have changed</Highlight> the way we communicate with each other.
                {" "}It is true that{" "}
                <Highlight tone="warn">peoples</Highlight> spend more time on their phones than with friends.
                {" "}However, social media{" "}
                <Highlight tone="ok">also enables</Highlight> us to maintain long-distance relationships,
                which{" "}
                <Highlight tone="warn">was impossible decade ago</Highlight>.
              </p>
            </div>

            <div className="mt-4 rounded-xl border bg-gradient-to-br from-primary/5 to-[var(--teal)]/10 p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary"><Sparkles className="h-3.5 w-3.5" /> Improved essay (intro)</p>
              <p className="mt-2 text-sm leading-relaxed">
                "It is widely acknowledged that digital technology has reshaped the fabric of social interaction. While critics argue that constant connectivity has eroded face-to-face communication, I would contend that technology has, on balance, broadened rather than narrowed our social horizons…"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Highlight({ children, tone }: { children: React.ReactNode; tone: "warn" | "ok" }) {
  const color = tone === "warn" ? "#f59e0b" : "var(--teal)";
  return (
    <span className="relative inline-block">
      {children}
      <motion.span
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute left-0 right-0 -bottom-0.5 h-[3px] origin-left rounded-full"
        style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
    </span>
  );
}
