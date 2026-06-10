import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play, Headphones, BookOpen, PenLine, Mic, Shuffle, Sparkles,
  Clock, ChevronRight, X, History, Trophy, AlertTriangle, Check,
  RotateCcw, ArrowRight, Sliders,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/dashboard/mock-tests")({
  head: () => ({
    meta: [
      { title: "IELTS Mock Tests — AIELTS" },
      { name: "description", content: "Take full-length AI-scored IELTS mock tests with a predicted overall band." },
      { property: "og:title", content: "IELTS Mock Tests — AIELTS" },
      { property: "og:description", content: "Take full-length AI-scored IELTS mock tests with a predicted overall band." },
      { property: "og:url", content: "/dashboard/mock-tests" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StudentMockTests,
});

type ModuleKey = "listening" | "reading" | "writing" | "speaking";
const MODULES: { k: ModuleKey; label: string; icon: React.ComponentType<{ className?: string }>; color: string; min: number }[] = [
  { k: "listening", label: "Listening", icon: Headphones, color: "#2563EB", min: 30 },
  { k: "reading", label: "Reading", icon: BookOpen, color: "#14B8A6", min: 60 },
  { k: "writing", label: "Writing", icon: PenLine, color: "#a78bfa", min: 60 },
  { k: "speaking", label: "Speaking", icon: Mic, color: "#f59e0b", min: 15 },
];

type Catalog = { id: string; name: string; type: "full" | "individual" | "custom"; modules: ModuleKey[]; difficulty: "Easy" | "Medium" | "Hard"; duration: number; tag: string };
const CATALOG: Catalog[] = [
  { id: "c-full", name: "Cambridge 19 Full Test", type: "full", modules: ["listening", "reading", "writing", "speaking"], difficulty: "Hard", duration: 165, tag: "Official-style" },
  { id: "c-list", name: "Listening Mock 12", type: "individual", modules: ["listening"], difficulty: "Medium", duration: 30, tag: "Recent" },
  { id: "c-read", name: "Reading Mock 7", type: "individual", modules: ["reading"], difficulty: "Hard", duration: 60, tag: "Academic" },
  { id: "c-write", name: "Writing Mock Set 3", type: "individual", modules: ["writing"], difficulty: "Medium", duration: 60, tag: "AI feedback" },
  { id: "c-speak", name: "Speaking Mock Set 5", type: "individual", modules: ["speaking"], difficulty: "Medium", duration: 14, tag: "Live AI" },
];
const RECOMMENDED = [
  { id: "r-1", name: "Reading: T/F/NG Drill", reason: "Accuracy below 60% last week" },
  { id: "r-2", name: "Writing Task 2 — Coherence", reason: "Lowest sub-score: 6.0" },
  { id: "r-3", name: "Listening: Map Labelling", reason: "Frequently missed type" },
];

type ExamState =
  | { kind: "idle" }
  | { kind: "selecting-custom" }
  | { kind: "running"; modules: ModuleKey[]; idx: number; secondsLeft: number; name: string; total: number }
  | { kind: "results"; modules: ModuleKey[]; name: string; bands: Record<ModuleKey, number> };

function StudentMockTests() {
  const [exam, setExam] = useState<ExamState>({ kind: "idle" });
  const [history, setHistory] = useState<{ id: string; name: string; date: string; band: number; modules: ModuleKey[]; duration: number }[]>([
    { id: "h-1", name: "Cambridge 18 Full Test", date: "May 10", band: 6.8, modules: ["listening", "reading", "writing", "speaking"], duration: 165 },
    { id: "h-2", name: "Reading Mock 6", date: "May 8", band: 7.0, modules: ["reading"], duration: 60 },
    { id: "h-3", name: "Speaking Mock Set 4", date: "May 5", band: 6.5, modules: ["speaking"], duration: 14 },
  ]);

  const start = (c: Pick<Catalog, "name" | "modules" | "duration">) => {
    setExam({ kind: "running", name: c.name, modules: c.modules, idx: 0, secondsLeft: c.duration * 60, total: c.duration * 60 });
  };
  const finish = (modules: ModuleKey[], name: string) => {
    const bands = modules.reduce<Record<ModuleKey, number>>((acc, m) => {
      acc[m] = +(5.5 + Math.random() * 2.5).toFixed(1);
      return acc;
    }, {} as Record<ModuleKey, number>);
    const overall = +(Object.values(bands).reduce((a, b) => a + b, 0) / modules.length).toFixed(1);
    setHistory((s) => [{ id: `h-${Date.now()}`, name, date: "Today", band: overall, modules, duration: Math.round((Object.values(bands).length) * 30) }, ...s]);
    setExam({ kind: "results", modules, name, bands });
  };
  const random = () => {
    const c = CATALOG[Math.floor(Math.random() * CATALOG.length)];
    start({ name: `Random · ${c.name}`, modules: c.modules, duration: c.duration });
  };

  return (
    <>
      <AnimatePresence>
        {exam.kind === "running" && (
          <ExamMode state={exam} onTick={(s) => setExam(s)} onFinish={() => finish(exam.modules, exam.name)} onAbort={() => setExam({ kind: "idle" })} />
        )}
        {exam.kind === "results" && (
          <ResultsModal name={exam.name} modules={exam.modules} bands={exam.bands} onClose={() => setExam({ kind: "idle" })} onRetake={() => {
            const c = CATALOG.find((x) => x.name === exam.name.replace(/^Random · /, ""));
            if (c) start(c); else setExam({ kind: "idle" });
          }} />
        )}
        {exam.kind === "selecting-custom" && (
          <CustomBuilder onClose={() => setExam({ kind: "idle" })} onStart={(cfg) => start(cfg)} />
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-[var(--teal)]/10 p-6 md:p-8">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Exam practice</p>
            <h2 className="mt-1 font-display text-3xl font-bold md:text-4xl">Mock Tests</h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Take real-exam simulations with timer, auto-save, and AI feedback for Writing &amp; Speaking.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={() => start(CATALOG[0])}
                className="inline-flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:shadow-primary/50">
                <Play className="h-4 w-4" /> Start Full Mock Test
              </button>
              <button onClick={random}
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-semibold transition hover:border-primary/40 hover:text-primary">
                <Shuffle className="h-4 w-4" /> Random Mock
              </button>
              <button onClick={() => setExam({ kind: "selecting-custom" })}
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-semibold transition hover:border-primary/40 hover:text-primary">
                <Sliders className="h-4 w-4" /> Build Custom
              </button>
            </div>
          </div>
          {/* Floating mini icons */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
            {["📘", "🎧", "✍️", "🗣️"].map((c, i) => (
              <motion.span key={i} className="absolute text-5xl opacity-10"
                style={{ right: `${10 + i * 14}%`, top: `${10 + (i % 2) * 40}%` }}
                animate={{ y: [0, -10, 0], rotate: [0, 6, -6, 0] }}
                transition={{ duration: 6 + i, repeat: Infinity }}>{c}</motion.span>
            ))}
          </div>
        </header>

        <Section title="Featured — Full Mock Test">
          <motion.div whileHover={{ y: -3 }} className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">Full test</span>
                <h3 className="mt-2 font-display text-2xl font-bold">{CATALOG[0].name}</h3>
                <p className="text-sm text-muted-foreground">Listening · Reading · Writing · Speaking, in official IELTS order.</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Chip><Clock className="h-3 w-3" /> {CATALOG[0].duration} min</Chip>
                  <Chip><Sparkles className="h-3 w-3" /> AI feedback</Chip>
                  <Chip>Difficulty · {CATALOG[0].difficulty}</Chip>
                </div>
              </div>
              <button onClick={() => start(CATALOG[0])}
                className="inline-flex items-center gap-2 rounded-lg gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:shadow-primary/50">
                Start now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </Section>

        <Section title="Individual module tests">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATALOG.filter((c) => c.type === "individual").map((c, i) => {
              const m = MODULES.find((x) => x.k === c.modules[0])!;
              return (
                <motion.button key={c.id} onClick={() => start(c)}
                  initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
                  className="group flex flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:shadow-lg hover:shadow-primary/10"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg" style={{ backgroundColor: `${m.color}1f`, color: m.color }}>
                    <m.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.tag} · {c.duration} min · {c.difficulty}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition group-hover:opacity-100">
                    Start <ChevronRight className="h-3 w-3" />
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Section>

        <Section title="Recommended for you" subtitle="Based on your recent performance">
          <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
            {RECOMMENDED.map((r) => (
              <motion.div key={r.id} whileHover={{ y: -3 }}
                className="min-w-[260px] snap-start rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Weak area</span>
                </div>
                <p className="mt-2 font-display text-base font-bold">{r.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.reason}</p>
                <button onClick={() => start({ name: r.name, modules: ["reading"], duration: 20 })}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  Practice now <ChevronRight className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </Section>

        <Section title="History" subtitle="Your past mock attempts">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Test</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Modules</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-right">Band</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <motion.tr key={h.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-t hover:bg-accent/40">
                    <td className="px-4 py-3 font-medium">{h.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{h.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {h.modules.map((m) => {
                          const meta = MODULES.find((x) => x.k === m)!;
                          return <span key={m} style={{ color: meta.color }}><meta.icon className="h-3.5 w-3.5" /></span>;
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{h.duration}m</td>
                    <td className="px-4 py-3 text-right font-display text-base font-bold text-primary">{h.band.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => start({ name: h.name, modules: h.modules, duration: h.duration })}
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:border-primary/40 hover:text-primary">
                        <RotateCcw className="h-3 w-3" /> Retake
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <History className="h-4 w-4" />
              <p className="text-sm font-semibold">Improvement trend</p>
            </div>
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={history.slice().reverse().map((h, i) => ({ x: `T${i + 1}`, v: h.band }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="x" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis domain={[5, 9]} stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)" }} animationDuration={1500} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </Section>
      </div>
    </>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3">
        <h3 className="font-display text-xl font-bold">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5">{children}</span>;
}

/* -------------------- Custom builder -------------------- */

function CustomBuilder({ onClose, onStart }: { onClose: () => void; onStart: (cfg: { name: string; modules: ModuleKey[]; duration: number }) => void }) {
  const [picks, setPicks] = useState<ModuleKey[]>(["listening", "reading"]);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [duration, setDuration] = useState(60);

  const toggle = (m: ModuleKey) => setPicks((s) => s.includes(m) ? s.filter((x) => x !== m) : [...s, m]);

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="fixed inset-x-3 top-10 z-50 mx-auto max-w-xl overflow-hidden rounded-2xl border bg-card shadow-2xl md:left-1/2 md:right-auto md:-translate-x-1/2"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-display text-lg font-bold">Build a custom mock test</h3>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-5 p-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Modules</p>
            <div className="grid grid-cols-2 gap-2">
              {MODULES.map((m) => {
                const on = picks.includes(m.k);
                return (
                  <button key={m.k} onClick={() => toggle(m.k)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left transition ${on ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}>
                    <span className="grid h-8 w-8 place-items-center rounded-md" style={{ backgroundColor: `${m.color}1f`, color: m.color }}>
                      <m.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{m.label}</span>
                    {on && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Difficulty</span>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                className="rounded-lg border bg-background px-3 py-2 text-sm">
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Duration (min)</span>
              <input type="number" min={10} max={240} value={duration} onChange={(e) => setDuration(+e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-sm" />
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
          <button onClick={onClose} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent">Cancel</button>
          <button
            disabled={picks.length === 0}
            onClick={() => onStart({ name: `Custom · ${difficulty}`, modules: picks, duration })}
            className="rounded-lg gradient-brand px-4 py-1.5 text-sm font-semibold text-white shadow disabled:opacity-50">
            Start test
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* -------------------- Exam Mode -------------------- */

function ExamMode({
  state, onTick, onFinish, onAbort,
}: {
  state: Extract<ExamState, { kind: "running" }>;
  onTick: (s: Extract<ExamState, { kind: "running" }>) => void;
  onFinish: () => void;
  onAbort: () => void;
}) {
  const tickRef = useRef<number | null>(null);
  useEffect(() => {
    tickRef.current = window.setInterval(() => {
      onTick({ ...state, secondsLeft: Math.max(0, state.secondsLeft - 1) });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.secondsLeft]);

  useEffect(() => {
    if (state.secondsLeft === 0) onFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.secondsLeft]);

  const current = MODULES.find((m) => m.k === state.modules[state.idx])!;
  const next = () => {
    if (state.idx + 1 < state.modules.length) {
      onTick({ ...state, idx: state.idx + 1 });
    } else {
      onFinish();
    }
  };
  const mm = String(Math.floor(state.secondsLeft / 60)).padStart(2, "0");
  const ss = String(state.secondsLeft % 60).padStart(2, "0");
  const low = state.secondsLeft < 60;
  const progress = ((state.total - state.secondsLeft) / state.total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col bg-[#0b1226] text-white"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ backgroundColor: `${current.color}25`, color: current.color }}>
            <current.icon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/50">Exam mode · {state.name}</p>
            <p className="font-display text-sm font-bold">{current.label} · part {state.idx + 1} / {state.modules.length}</p>
          </div>
        </div>
        <motion.div
          animate={low ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={low ? { duration: 0.8, repeat: Infinity } : undefined}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-lg font-bold ${low ? "border-red-500/50 bg-red-500/10 text-red-300" : "border-white/10 bg-white/5"}`}>
          <Clock className="h-4 w-4" /> {mm}:{ss}
        </motion.div>
        <button onClick={onAbort} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5">Exit</button>
      </div>

      <div className="h-1 w-full bg-white/5">
        <motion.div className="h-full gradient-brand" style={{ width: `${progress}%` }} transition={{ ease: "linear" }} />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <ModulePane mod={current.k} />
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-6 py-3">
        <p className="text-xs text-white/50 flex items-center gap-2">
          <motion.span className="h-2 w-2 rounded-full bg-[var(--teal)]"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
          Auto-saving…
        </p>
        <button onClick={next} className="inline-flex items-center gap-2 rounded-lg gradient-brand px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:shadow-primary/50">
          {state.idx + 1 < state.modules.length ? <>Next module <ArrowRight className="h-4 w-4" /></> : <>Submit test <Check className="h-4 w-4" /></>}
        </button>
      </div>
    </motion.div>
  );
}

function ModulePane({ mod }: { mod: ModuleKey }) {
  if (mod === "listening") return <ListeningPane />;
  if (mod === "reading") return <ReadingPane />;
  if (mod === "writing") return <WritingPane />;
  return <SpeakingPane />;
}

function Waveform({ accent = "#14B8A6" }: { accent?: string }) {
  return (
    <div className="flex h-16 items-end gap-1">
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.span key={i} className="w-1.5 rounded-full" style={{ backgroundColor: accent }}
          animate={{ height: [`${10 + (i % 5) * 8}%`, `${40 + ((i * 7) % 60)}%`, `${10 + (i % 5) * 8}%`] }}
          transition={{ duration: 1 + (i % 5) * 0.15, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

function ListeningPane() {
  const [q, setQ] = useState<Record<number, string>>({});
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-wider text-white/50">Audio · plays once</p>
        <div className="mt-3"><Waveform /></div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm">{i}. The speaker is mainly discussing…</p>
          <div className="mt-3 grid gap-2">
            {["Urban transport", "Marine biology", "Renewable energy"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5">
                <input type="radio" name={`q${i}`} value={opt} checked={q[i] === opt}
                  onChange={() => setQ({ ...q, [i]: opt })} />{opt}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReadingPane() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-2">
      <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-5 leading-relaxed text-white/80">
        <h3 className="font-display text-lg font-bold text-white">Passage 1 — The Honeybee&apos;s Dance</h3>
        <p className="mt-2 text-sm">Honeybees communicate the location of food sources using an elaborate dance language…</p>
        <p className="mt-3 text-sm">The waggle dance encodes both distance and direction relative to the sun…</p>
        <p className="mt-3 text-sm">Recent studies suggest the dance also conveys nuance about food quality…</p>
        <p className="mt-3 text-sm">Researchers have built robotic bees to test the limits of this communication system…</p>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm">{i}. TFNG · The dance encodes only distance.</p>
            <div className="mt-2 flex gap-2 text-xs">
              {["True", "False", "Not Given"].map((v) => (
                <button key={v} onClick={() => setAnswers({ ...answers, [i]: v })}
                  className={`rounded-md border px-3 py-1.5 transition ${answers[i] === v ? "border-primary bg-primary/15 text-white" : "border-white/10 hover:bg-white/10"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WritingPane() {
  const [text, setText] = useState("");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-wider text-white/50">Task 2 · 250+ words</p>
        <p className="mt-2 text-sm">Some people think technology has made us less social. To what extent do you agree?</p>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)}
        rows={14} placeholder="Start writing your response…"
        className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed outline-none focus:border-primary" />
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>Words: <span className={words >= 250 ? "text-[var(--teal)]" : "text-amber-300"}>{words}</span> / 250</span>
        <span className="flex items-center gap-1.5">
          <motion.span className="h-2 w-2 rounded-full bg-[var(--teal)]"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} /> Auto-saved
        </span>
      </div>
    </div>
  );
}

function SpeakingPane() {
  return (
    <div className="mx-auto max-w-2xl space-y-5 text-center">
      <motion.div className="mx-auto grid h-28 w-28 place-items-center rounded-full border border-[var(--teal)]/40 bg-[var(--teal)]/10"
        animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
        <Mic className="h-10 w-10 text-[var(--teal)]" />
      </motion.div>
      <p className="text-sm text-white/70">Part 2 cue card · Describe a place you remember from childhood.</p>
      <div className="mx-auto max-w-md">
        <Waveform />
      </div>
      <p className="text-xs text-white/50">Recording… speak naturally for ~2 minutes.</p>
    </div>
  );
}

/* -------------------- Results -------------------- */

function ResultsModal({
  name, modules, bands, onClose, onRetake,
}: {
  name: string;
  modules: ModuleKey[];
  bands: Record<ModuleKey, number>;
  onClose: () => void;
  onRetake: () => void;
}) {
  const overall = useMemo(
    () => +(Object.values(bands).reduce((a, b) => a + b, 0) / modules.length).toFixed(1),
    [bands, modules]
  );
  const chartData = modules.map((m) => ({ name: MODULES.find((x) => x.k === m)!.label, band: bands[m] }));

  return (
    <>
      <motion.div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ type: "spring", damping: 22 }}
        className="fixed inset-x-3 top-6 z-[70] mx-auto max-h-[92vh] max-w-3xl overflow-y-auto rounded-3xl border bg-card shadow-2xl md:left-1/2 md:right-auto md:-translate-x-1/2"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Trophy className="h-5 w-5" /></span>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Mock complete</p>
              <p className="font-display text-lg font-bold">{name}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-2 hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid place-items-center">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="relative grid h-40 w-40 place-items-center rounded-full bg-gradient-to-br from-primary to-[var(--teal)] text-white shadow-xl shadow-primary/30">
              <span className="text-[11px] uppercase tracking-wider opacity-80">Overall</span>
              <span className="font-display text-5xl font-black">{overall.toFixed(1)}</span>
              <motion.span className="absolute inset-0 rounded-full border-2 border-white/30"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }} />
            </motion.div>
          </div>

          <div className="rounded-2xl border bg-background p-4">
            <p className="mb-2 text-sm font-semibold">Module-wise bands</p>
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis domain={[0, 9]} stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Bar dataKey="band" fill="var(--primary)" radius={[8, 8, 0, 0]} animationDuration={1400} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weak areas</p>
              <ul className="mt-2 space-y-2 text-sm">
                {["Matching headings — 41%", "Map labelling — 47%", "Task 2 coherence — 6.0"].map((w) => (
                  <li key={w} className="flex items-center gap-2">
                    <motion.span className="h-2 w-2 rounded-full bg-amber-500"
                      animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested next</p>
              <ul className="mt-2 space-y-2 text-sm">
                {["Reading: Matching headings drill", "Writing Task 2: cohesive devices", "Listening: map labelling pack"].map((s) => (
                  <li key={s} className="flex items-center gap-2 text-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-accent">Close</button>
            <button onClick={onRetake} className="inline-flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30">
              <RotateCcw className="h-4 w-4" /> Retake
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
