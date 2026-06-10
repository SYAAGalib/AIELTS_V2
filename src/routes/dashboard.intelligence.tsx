import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, Area, AreaChart, RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import {
  Brain, Sparkles, Target, TrendingUp, AlertTriangle, CheckCircle2, Clock,
  Headphones, BookOpen, PenLine, Mic, ArrowRight, Filter, History as HistoryIcon,
  ChevronRight, Lightbulb, Flame, Gauge,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/intelligence")({
  head: () => ({
    meta: [
      { title: "Intelligence — AIELTS Dashboard" },
      { name: "description", content: "AI insights on your IELTS strengths, weaknesses, and the fastest path to your target band." },
      { property: "og:title", content: "Intelligence — AIELTS Dashboard" },
      { property: "og:description", content: "AI insights on your IELTS strengths, weaknesses, and the fastest path to your target band." },
      { property: "og:url", content: "/dashboard/intelligence" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: IntelligencePage,
});

/* ───────────── Mock predictive data ───────────── */

type ModuleKey = "listening" | "reading" | "writing" | "speaking";
const MODULES: { key: ModuleKey; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { key: "listening", label: "Listening", icon: Headphones, color: "var(--primary)" },
  { key: "reading", label: "Reading", icon: BookOpen, color: "var(--teal)" },
  { key: "writing", label: "Writing", icon: PenLine, color: "#a855f7" },
  { key: "speaking", label: "Speaking", icon: Mic, color: "#f59e0b" },
];

const predictions: Record<ModuleKey, {
  current: number; target: number; pace: number; days: number; confidence: "Low" | "Medium" | "High";
  trend: { w: string; v: number; projected?: number }[];
  strengths: string[]; weaknesses: string[]; recommend: string[];
  questionTypes: { t: string; v: number }[];
}> = {
  listening: {
    current: 6.5, target: 7.5, pace: 0.18, days: 32, confidence: "High",
    trend: Array.from({ length: 12 }).map((_, i) => ({
      w: `W${i+1}`, v: +(5.5 + i * 0.09).toFixed(2),
      projected: i >= 8 ? +(5.5 + i * 0.13).toFixed(2) : undefined,
    })),
    strengths: ["Section 1 form completion (92%)", "Section 2 map labeling (84%)"],
    weaknesses: ["Section 3 MCQ with paraphrasing (54%)", "Section 4 note completion (61%)"],
    recommend: ["3 targeted MCQ sets", "Paraphrase vocabulary list", "1 full Listening mock"],
    questionTypes: [
      { t: "Form completion", v: 92 }, { t: "Map labeling", v: 84 },
      { t: "MCQ", v: 54 }, { t: "Note completion", v: 61 }, { t: "Matching", v: 71 },
    ],
  },
  reading: {
    current: 6.0, target: 7.5, pace: 0.12, days: 45, confidence: "Medium",
    trend: Array.from({ length: 12 }).map((_, i) => ({
      w: `W${i+1}`, v: +(5.2 + i * 0.07).toFixed(2),
      projected: i >= 8 ? +(5.2 + i * 0.11).toFixed(2) : undefined,
    })),
    strengths: ["Matching headings (81%)", "Skimming for gist (78%)"],
    weaknesses: ["True/False/Not Given (52%)", "Long sentence completion (58%)"],
    recommend: ["5 T/F/NG drills", "Paraphrase patterns", "Academic vocabulary set 4"],
    questionTypes: [
      { t: "Matching headings", v: 81 }, { t: "T/F/NG", v: 52 },
      { t: "Sentence completion", v: 58 }, { t: "MCQ", v: 72 }, { t: "Short answer", v: 68 },
    ],
  },
  writing: {
    current: 6.0, target: 7.0, pace: 0.10, days: 60, confidence: "Medium",
    trend: Array.from({ length: 12 }).map((_, i) => ({
      w: `W${i+1}`, v: +(5.4 + i * 0.06).toFixed(2),
      projected: i >= 8 ? +(5.4 + i * 0.09).toFixed(2) : undefined,
    })),
    strengths: ["Task Response (7.0)", "Idea generation"],
    weaknesses: ["Coherence & Cohesion (5.5)", "Grammatical range (6.0)"],
    recommend: ["Linker phrases drill", "Complex sentence patterns", "1 Task 2 essay/week with AI feedback"],
    questionTypes: [
      { t: "Task Response", v: 78 }, { t: "Coherence", v: 55 },
      { t: "Vocabulary", v: 66 }, { t: "Grammar", v: 60 },
    ],
  },
  speaking: {
    current: 6.0, target: 7.0, pace: 0.14, days: 40, confidence: "High",
    trend: Array.from({ length: 12 }).map((_, i) => ({
      w: `W${i+1}`, v: +(5.3 + i * 0.08).toFixed(2),
      projected: i >= 8 ? +(5.3 + i * 0.12).toFixed(2) : undefined,
    })),
    strengths: ["Pronunciation (7.5)", "Part 1 fluency"],
    weaknesses: ["Part 2 hesitation (5.5)", "Lexical variety (5.5)"],
    recommend: ["Daily 2-min Part 2 prompts", "Idiom & collocation pack", "Shadowing exercises"],
    questionTypes: [
      { t: "Fluency", v: 60 }, { t: "Vocabulary", v: 55 },
      { t: "Grammar", v: 64 }, { t: "Pronunciation", v: 88 },
    ],
  },
};

const history = [
  { id: "T-091", date: "May 14, 2026", type: "Mock Test", module: "Full", raw: "34/40", band: 7.5, status: "up" },
  { id: "T-090", date: "May 12, 2026", type: "Module Test", module: "Reading", raw: "26/40", band: 6.0, status: "down" },
  { id: "T-089", date: "May 10, 2026", type: "Module Test", module: "Listening", raw: "31/40", band: 7.0, status: "up" },
  { id: "T-088", date: "May 08, 2026", type: "Mock Test", module: "Writing", raw: "—", band: 6.5, status: "flat" },
  { id: "T-087", date: "May 06, 2026", type: "Module Test", module: "Speaking", raw: "—", band: 6.0, status: "up" },
  { id: "T-086", date: "May 04, 2026", type: "Module Test", module: "Reading", raw: "24/40", band: 5.5, status: "down" },
];

/* ───────────── helpers ───────────── */

function overallBand(p: typeof predictions) {
  const v = (p.listening.current + p.reading.current + p.writing.current + p.speaking.current) / 4;
  // IELTS rounds to nearest .5
  return Math.round(v * 2) / 2;
}

function Card({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.5 }}
      className={`rounded-2xl border bg-card p-6 ${className}`}>
      {children}
    </motion.div>
  );
}

function ConfBadge({ c }: { c: "Low" | "Medium" | "High" }) {
  const tone = c === "High" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    : c === "Medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
    : "bg-rose-500/10 text-rose-600 border-rose-500/20";
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tone}`}>{c} confidence</span>;
}

/* ───────────── Page ───────────── */

function IntelligencePage() {
  const [tab, setTab] = useState<"predict" | "intel" | "report" | "history">("predict");
  const [active, setActive] = useState<ModuleKey>("listening");
  const overall = useMemo(() => overallBand(predictions), []);
  const targetOverall = 7.5;
  const maxDays = Math.max(...MODULES.map((m) => predictions[m.key].days));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> AI Intelligence
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold">Predictions & Insights</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Personalized band forecast, weakness analysis, and adaptive recommendations powered by your test history.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { k: "predict", l: "Predictions", i: Brain },
            { k: "intel", l: "Where I'm weak", i: Target },
            { k: "report", l: "Reports", i: Gauge },
            { k: "history", l: "History", i: HistoryIcon },
          ].map((t) => (
            <button key={t.k} onClick={() => setTab(t.k as never)}
              className={`relative inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                tab === t.k ? "border-primary/30 bg-primary/10 text-primary" : "hover:bg-accent"}`}>
              <t.i className="h-3.5 w-3.5" /> {t.l}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "predict" && (
          <motion.div key="p" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
            {/* If you take IELTS today */}
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-2">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" /> If you take IELTS today
                  </p>
                  <div className="flex items-baseline gap-3">
                    <motion.span
                      key={overall}
                      initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", damping: 14 }}
                      className="font-display text-6xl font-bold gradient-text">
                      {overall.toFixed(1)}
                    </motion.span>
                    <span className="text-sm text-muted-foreground">estimated overall band</span>
                  </div>
                  <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> +0.5 vs last month · target Band {targetOverall}
                  </p>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4 min-w-[280px]">
                  {MODULES.map((m, i) => {
                    const p = predictions[m.key];
                    return (
                      <motion.div key={m.key}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}
                        className="group relative overflow-hidden rounded-xl border bg-background/60 p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                        <div className="flex items-center justify-between">
                          <span style={{ color: m.color }}><m.icon className="h-4 w-4" /></span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</span>
                        </div>
                        <p className="mt-2 font-display text-3xl font-bold">{p.current.toFixed(1)}</p>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${(p.current / 9) * 100}%` }}
                            viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.2 + i * 0.1 }}
                            className="h-full" style={{ background: m.color }} />
                        </div>
                        <p className="mt-2 text-[11px] text-muted-foreground">target {p.target.toFixed(1)} · ~{p.days}d</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Time-to-goal timeline */}
            <Card delay={0.1}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold">Time to target band</h3>
                  <p className="text-sm text-muted-foreground">At your current learning pace</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Clock className="h-3 w-3" /> ~{maxDays} days to overall {targetOverall}
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {MODULES.map((m, i) => {
                  const p = predictions[m.key];
                  const pct = (p.days / 90) * 100;
                  return (
                    <div key={m.key}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-2 font-medium">
                          <span style={{ color: m.color }}><m.icon className="h-3.5 w-3.5" /></span> {m.label}
                          <ConfBadge c={p.confidence} />
                        </span>
                        <span className="text-muted-foreground">
                          Band {p.current.toFixed(1)} → {p.target.toFixed(1)} · <strong className="text-foreground">~{p.days} days</strong>
                        </span>
                      </div>
                      <div className="relative h-3 overflow-hidden rounded-full bg-muted/60">
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: `${Math.min(pct, 100)}%` }}
                          viewport={{ once: true }} transition={{ duration: 1.4, delay: 0.15 * i, ease: "easeOut" }}
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ background: `linear-gradient(90deg, ${m.color}, color-mix(in oklab, ${m.color} 40%, white))` }}
                        />
                        <motion.div
                          className="absolute inset-y-0 w-12 -skew-x-12 bg-white/30"
                          animate={{ x: ["-3rem", "100%"] }}
                          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Projected improvement chart */}
            <Card delay={0.15}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold">Projected improvement</h3>
                  <p className="text-sm text-muted-foreground">Solid = actual · dashed = forecast</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {MODULES.map((m) => (
                    <button key={m.key} onClick={() => setActive(m.key)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${active === m.key ? "border-primary/30 bg-primary/10 text-primary" : "hover:bg-accent"}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 h-72">
                <ResponsiveContainer>
                  <AreaChart data={predictions[active].trend}>
                    <defs>
                      <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="w" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis domain={[5, 9]} stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                    <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={3} fill="url(#actualFill)" animationDuration={1600} />
                    <Line type="monotone" dataKey="projected" stroke="var(--teal)" strokeWidth={3} strokeDasharray="6 6" dot={false} animationDuration={1800} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        )}

        {tab === "intel" && (
          <motion.div key="i" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
            {/* Top weakness banner */}
            <Card>
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Top priority</p>
                  <h3 className="mt-0.5 font-display text-xl font-semibold">
                    You are weakest in: <span className="text-amber-600">Reading → True/False/Not Given (52%)</span>
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Across 14 attempts, you misinterpret "Not Given" as "False" 68% of the time. Fixing this pattern alone
                    can lift your Reading band by ~0.5.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to="/dashboard/reading" className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                      Start targeted practice <ArrowRight className="h-3 w-3" />
                    </Link>
                    <Link to="/dashboard/vocabulary" className="rounded-full border px-4 py-1.5 text-xs font-semibold hover:bg-accent">
                      Paraphrase vocabulary
                    </Link>
                  </div>
                </div>
              </div>
            </Card>

            {/* Per-module intelligence cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {MODULES.map((m, i) => {
                const p = predictions[m.key];
                return (
                  <motion.div key={m.key}
                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -3 }}
                    className="group relative overflow-hidden rounded-2xl border bg-card p-6">
                    <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-10 blur-2xl transition group-hover:opacity-20"
                      style={{ background: m.color }} />
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: `${m.color}1a`, color: m.color }}>
                          <m.icon className="h-4 w-4" />
                        </span>
                        <h4 className="font-display text-lg font-semibold">{m.label}</h4>
                      </div>
                      <span className="font-display text-2xl font-bold" style={{ color: m.color }}>{p.current.toFixed(1)}</span>
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                      <div>
                        <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Strengths
                        </p>
                        <ul className="space-y-1">
                          {p.strengths.map((s) => <li key={s} className="text-muted-foreground">• {s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600">
                          <AlertTriangle className="h-3 w-3" /> Weaknesses
                        </p>
                        <ul className="space-y-1">
                          {p.weaknesses.map((s) => <li key={s} className="text-muted-foreground">• {s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                          <Lightbulb className="h-3 w-3" /> Recommended this week
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.recommend.map((r) => (
                            <span key={r} className="rounded-full border bg-background px-2.5 py-1 text-xs">{r}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Link to={`/dashboard/${m.key}` as never}
                      className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      Open targeted practice <ChevronRight className="h-3 w-3" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {tab === "report" && (
          <motion.div key="r" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {MODULES.map((m) => (
                <button key={m.key} onClick={() => setActive(m.key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition ${active === m.key ? "border-primary/30 bg-primary/10 text-primary" : "hover:bg-accent"}`}>
                  <m.icon className="h-3.5 w-3.5" /> {m.label}
                </button>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Current estimate</p>
                <div className="mt-3 grid place-items-center">
                  <div className="relative h-56 w-56">
                    <ResponsiveContainer>
                      <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "band", value: (predictions[active].current / 9) * 100 }]} startAngle={90} endAngle={-270}>
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar dataKey="value" cornerRadius={20} fill={MODULES.find(m=>m.key===active)!.color} background={{ fill: "var(--muted)" }} animationDuration={1600} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="text-center">
                        <p className="font-display text-5xl font-bold">{predictions[active].current.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">of 9.0</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-muted-foreground">Pace <strong className="text-foreground">+{predictions[active].pace.toFixed(2)}</strong>/week</p>
                  <p className="text-muted-foreground">ETA to target <strong className="text-foreground">~{predictions[active].days} days</strong></p>
                  <ConfBadge c={predictions[active].confidence} />
                </div>
              </Card>

              <Card className="lg:col-span-2">
                <h3 className="font-display text-lg font-semibold">Score history</h3>
                <div className="mt-3 h-56">
                  <ResponsiveContainer>
                    <LineChart data={predictions[active].trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="w" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis domain={[5, 9]} stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                      <Line type="monotone" dataKey="v" stroke={MODULES.find(m=>m.key===active)!.color} strokeWidth={3} dot={{ r: 3 }} animationDuration={1600} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="lg:col-span-2">
                <h3 className="font-display text-lg font-semibold">Accuracy by question type</h3>
                <div className="mt-3 h-64">
                  <ResponsiveContainer>
                    <BarChart data={predictions[active].questionTypes} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis dataKey="t" type="category" stroke="var(--muted-foreground)" fontSize={12} width={120} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                      <Bar dataKey="v" radius={[0, 8, 8, 0]} animationDuration={1800}>
                        {predictions[active].questionTypes.map((q, i) => (
                          <Cell key={i} fill={q.v < 60 ? "#ef4444" : q.v < 75 ? "#f59e0b" : "var(--teal)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h3 className="font-display text-lg font-semibold inline-flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" /> AI comments
                </h3>
                <ul className="mt-3 space-y-3 text-sm">
                  {predictions[active].weaknesses.map((w, i) => (
                    <motion.li key={w} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="rounded-lg border bg-background/50 p-3">
                      <p className="font-medium">{w}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Pattern detected over the last 6 attempts.</p>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </div>
          </motion.div>
        )}

        {tab === "history" && (
          <motion.div key="h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold inline-flex items-center gap-2">
                    <HistoryIcon className="h-4 w-4 text-primary" /> All attempts
                  </h3>
                  <p className="text-sm text-muted-foreground">{history.length} tests · last 30 days</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs hover:bg-accent">
                    <Filter className="h-3 w-3" /> All modules
                  </button>
                  <button className="rounded-full border px-3 py-1 text-xs hover:bg-accent">All dates</button>
                  <button className="rounded-full border px-3 py-1 text-xs hover:bg-accent">All bands</button>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Module</th>
                      <th className="px-4 py-3">Raw</th>
                      <th className="px-4 py-3">Band</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <motion.tr key={h.id}
                        initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        transition={{ delay: i * 0.04 }}
                        className="border-t transition hover:bg-accent/40">
                        <td className="px-4 py-3 font-mono text-xs">{h.id}</td>
                        <td className="px-4 py-3 text-muted-foreground">{h.date}</td>
                        <td className="px-4 py-3">{h.type}</td>
                        <td className="px-4 py-3">{h.module}</td>
                        <td className="px-4 py-3 font-mono text-xs">{h.raw}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 font-semibold">
                            {h.band}
                            {h.status === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                            {h.status === "down" && <TrendingUp className="h-3 w-3 rotate-180 text-rose-500" />}
                            {h.status === "flat" && <span className="h-px w-3 bg-muted-foreground/40" />}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs hover:border-primary/40 hover:text-primary">
                            Review <ChevronRight className="h-3 w-3" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <h3 className="font-display text-lg font-semibold inline-flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-500" /> Mistake patterns
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="rounded-lg border bg-background/50 p-3">Misread "Not Given" as "False" — <strong>14 times</strong></li>
                  <li className="rounded-lg border bg-background/50 p-3">Lost focus in Listening Section 3 (last 4 attempts)</li>
                  <li className="rounded-lg border bg-background/50 p-3">Repeated basic vocabulary in Speaking Part 2</li>
                </ul>
              </Card>
              <Card>
                <h3 className="font-display text-lg font-semibold">Quick actions</h3>
                <div className="mt-3 grid gap-2">
                  <button className="rounded-lg border bg-background/50 px-4 py-3 text-left text-sm hover:border-primary/40 hover:bg-primary/5">
                    <p className="font-medium">Add all wrong questions to practice list</p>
                    <p className="text-xs text-muted-foreground">23 items queued</p>
                  </button>
                  <button className="rounded-lg border bg-background/50 px-4 py-3 text-left text-sm hover:border-primary/40 hover:bg-primary/5">
                    <p className="font-medium">Add all unknown words to vocabulary</p>
                    <p className="text-xs text-muted-foreground">47 new words</p>
                  </button>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
