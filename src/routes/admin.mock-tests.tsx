import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Plus, Eye, Pencil, Trash2, X, Check, Headphones, BookOpen,
  PenLine, Mic, Sparkles, Clock, Layers, BarChart3,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export const Route = createFileRoute("/admin/mock-tests")({
  head: () => ({
    meta: [
      { title: "Mock Tests — AIELTS Admin" },
      { name: "description", content: "Create and manage AIELTS mock tests across all four skills." },
      { property: "og:title", content: "Mock Tests — AIELTS Admin" },
      { property: "og:description", content: "Create and manage AIELTS mock tests across all four skills." },
      { property: "og:url", content: "/admin/mock-tests" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminMockTests,
});

type ModuleKey = "listening" | "reading" | "writing" | "speaking";
type MockType = "full" | "individual" | "custom";
type MockTest = {
  id: string;
  name: string;
  type: MockType;
  difficulty: "Easy" | "Medium" | "Hard";
  duration: number;
  description: string;
  modules: ModuleKey[];
  attached: Partial<Record<ModuleKey, string>>;
  reviewAnswers: boolean;
  aiFeedback: boolean;
  retakes: "unlimited" | "limited" | "none";
  retakeLimit: number;
  published: boolean;
  attempts: number;
  avgBand: number;
  tags: string[];
};

const SEED: MockTest[] = [
  {
    id: "mt-1", name: "Cambridge 19 Full Test", type: "full", difficulty: "Hard",
    duration: 165, description: "Full official-style mock — all 4 modules.",
    modules: ["listening", "reading", "writing", "speaking"],
    attached: { listening: "Listening Module 12", reading: "Reading Module 7", writing: "Writing Task Set 3", speaking: "Speaking Set 5" },
    reviewAnswers: true, aiFeedback: true, retakes: "limited", retakeLimit: 2,
    published: true, attempts: 1284, avgBand: 7.1, tags: ["academic", "official"],
  },
  {
    id: "mt-2", name: "Speaking Sprint — Cue Cards", type: "individual", difficulty: "Medium",
    duration: 14, description: "Focused Speaking Part 2 + 3 simulation.",
    modules: ["speaking"], attached: { speaking: "Speaking Set 8" },
    reviewAnswers: true, aiFeedback: true, retakes: "unlimited", retakeLimit: 0,
    published: true, attempts: 612, avgBand: 6.8, tags: ["speaking"],
  },
  {
    id: "mt-3", name: "Custom — Writing + Reading", type: "custom", difficulty: "Medium",
    duration: 120, description: "Combined practice for academic candidates.",
    modules: ["writing", "reading"], attached: { writing: "Writing Task Set 4", reading: "Reading Module 9" },
    reviewAnswers: false, aiFeedback: true, retakes: "none", retakeLimit: 0,
    published: false, attempts: 0, avgBand: 0, tags: ["draft"],
  },
];

const MODULE_META: Record<ModuleKey, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  listening: { label: "Listening", icon: Headphones, color: "#2563EB" },
  reading: { label: "Reading", icon: BookOpen, color: "#14B8A6" },
  writing: { label: "Writing", icon: PenLine, color: "#a78bfa" },
  speaking: { label: "Speaking", icon: Mic, color: "#f59e0b" },
};

const MODULE_BANK: Record<ModuleKey, string[]> = {
  listening: ["Listening Module 10", "Listening Module 11", "Listening Module 12"],
  reading: ["Reading Module 6", "Reading Module 7", "Reading Module 9"],
  writing: ["Writing Task Set 3", "Writing Task Set 4"],
  speaking: ["Speaking Set 5", "Speaking Set 8"],
};

function AdminMockTests() {
  const [tests, setTests] = useState<MockTest[]>(SEED);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<MockTest | null>(null);
  const [editing, setEditing] = useState<MockTest | null>(null);
  const [tab, setTab] = useState<"list" | "analytics">("list");

  const saveTest = (t: MockTest) => {
    setTests((s) => {
      const exists = s.find((x) => x.id === t.id);
      return exists ? s.map((x) => (x.id === t.id ? t : x)) : [t, ...s];
    });
    setOpen(false); setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Assessment</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Mock Tests</h2>
          <p className="text-sm text-white/60">Create, configure, publish and analyze mock tests.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-white/10 bg-white/5 p-1 text-sm">
            {(["list", "analytics"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`relative rounded-md px-3 py-1.5 capitalize ${tab === t ? "text-white" : "text-white/60 hover:text-white"}`}>
                {tab === t && <motion.span layoutId="mt-tab" className="absolute inset-0 rounded-md bg-white/10" />}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>
          <button onClick={() => { setEditing(null); setOpen(true); }}
            className="inline-flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:shadow-primary/50">
            <Plus className="h-4 w-4" /> Create Mock Test
          </button>
        </div>
      </div>

      {tab === "list" ? (
        <TestList
          tests={tests}
          onPreview={setPreview}
          onEdit={(t) => { setEditing(t); setOpen(true); }}
          onTogglePublish={(id) => setTests((s) => s.map((x) => x.id === id ? { ...x, published: !x.published } : x))}
          onDelete={(id) => setTests((s) => s.filter((x) => x.id !== id))}
        />
      ) : (
        <Analytics tests={tests} />
      )}

      <AnimatePresence>
        {open && <TestEditor existing={editing} onClose={() => { setOpen(false); setEditing(null); }} onSave={saveTest} />}
      </AnimatePresence>
      <AnimatePresence>
        {preview && <PreviewModal test={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </div>
  );
}

function TestList({
  tests, onPreview, onEdit, onTogglePublish, onDelete,
}: {
  tests: MockTest[];
  onPreview: (t: MockTest) => void;
  onEdit: (t: MockTest) => void;
  onTogglePublish: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tests.map((t, i) => (
        <motion.div key={t.id}
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {t.type === "full" ? "Full test" : t.type === "individual" ? "Module" : "Custom"}
              </span>
              <h3 className="mt-2 font-display text-lg font-bold">{t.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-white/60">{t.description}</p>
            </div>
            <button onClick={() => onTogglePublish(t.id)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${t.published ? "bg-[var(--teal)]" : "bg-white/15"}`}
              aria-label="Toggle publish">
              <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                style={{ left: t.published ? "calc(100% - 22px)" : "2px" }} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {t.modules.map((m) => {
              const meta = MODULE_META[m];
              return (
                <span key={m} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px]" style={{ color: meta.color }}>
                  <meta.icon className="h-3 w-3" />
                  <span className="text-white/80">{meta.label}</span>
                </span>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
            <Stat label="Duration" value={`${t.duration}m`} />
            <Stat label="Attempts" value={t.attempts.toLocaleString()} />
            <Stat label="Avg band" value={t.avgBand ? t.avgBand.toFixed(1) : "—"} />
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${t.published ? "text-[var(--teal)]" : "text-amber-400"}`}>
              {t.published ? "● Published" : "○ Draft"}
            </span>
            <div className="flex items-center gap-1">
              <IconBtn onClick={() => onPreview(t)} title="Preview"><Eye className="h-4 w-4" /></IconBtn>
              <IconBtn onClick={() => onEdit(t)} title="Edit"><Pencil className="h-4 w-4" /></IconBtn>
              <IconBtn onClick={() => onDelete(t.id)} title="Delete" danger><Trash2 className="h-4 w-4" /></IconBtn>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-wider text-white/50">{label}</p>
      <p className="font-display text-sm font-bold">{value}</p>
    </div>
  );
}

function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button onClick={onClick} title={title}
      className={`grid h-8 w-8 place-items-center rounded-md border border-white/10 transition hover:bg-white/10 ${danger ? "hover:border-red-400/40 hover:text-red-400" : "hover:border-primary/40 hover:text-primary"}`}>
      {children}
    </button>
  );
}

function TestEditor({ existing, onClose, onSave }: { existing: MockTest | null; onClose: () => void; onSave: (t: MockTest) => void }) {
  const [t, setT] = useState<MockTest>(() => existing ?? {
    id: `mt-${Math.random().toString(36).slice(2, 8)}`,
    name: "", type: "full", difficulty: "Medium", duration: 60, description: "",
    modules: ["listening", "reading", "writing", "speaking"], attached: {},
    reviewAnswers: true, aiFeedback: true, retakes: "limited", retakeLimit: 2,
    published: false, attempts: 0, avgBand: 0, tags: [],
  });

  const toggleModule = (m: ModuleKey) => {
    setT((s) => ({ ...s, modules: s.modules.includes(m) ? s.modules.filter((x) => x !== m) : [...s.modules, m] }));
  };

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 24 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-x-2 top-6 z-50 mx-auto max-h-[92vh] max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0F172A] shadow-2xl md:inset-x-auto md:left-1/2 md:-translate-x-1/2"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h3 className="font-display text-xl font-bold">{existing ? "Edit Mock Test" : "Create Mock Test"}</h3>
            <p className="text-xs text-white/50">Configure structure, attached modules and rules.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-2 hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (t.name.trim()) onSave(t); }} className="space-y-6 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Test name">
              <input required maxLength={120} value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} className={inputCls} placeholder="e.g. Cambridge 19 Full Test" />
            </FormField>
            <FormField label="Type">
              <select value={t.type} onChange={(e) => setT({ ...t, type: e.target.value as MockType })} className={inputCls}>
                <option value="full">Full Mock Test</option>
                <option value="individual">Individual Module</option>
                <option value="custom">Custom</option>
              </select>
            </FormField>
            <FormField label="Difficulty">
              <select value={t.difficulty} onChange={(e) => setT({ ...t, difficulty: e.target.value as MockTest["difficulty"] })} className={inputCls}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </FormField>
            <FormField label="Estimated duration (minutes)">
              <input type="number" min={5} max={240} value={t.duration} onChange={(e) => setT({ ...t, duration: +e.target.value })} className={inputCls} />
            </FormField>
            <FormField label="Tags (comma separated)" className="sm:col-span-2">
              <input value={t.tags.join(", ")} onChange={(e) => setT({ ...t, tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} className={inputCls} placeholder="academic, official" />
            </FormField>
            <FormField label="Description" className="sm:col-span-2">
              <textarea rows={2} maxLength={500} value={t.description} onChange={(e) => setT({ ...t, description: e.target.value })} className={inputCls} />
            </FormField>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">Modules included</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(MODULE_META) as ModuleKey[]).map((m) => {
                const meta = MODULE_META[m];
                const on = t.modules.includes(m);
                return (
                  <motion.button type="button" key={m} onClick={() => toggleModule(m)}
                    whileHover={{ y: -2, rotateX: 2, rotateY: -2 }}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${on ? "border-primary/60 bg-primary/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                    <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ backgroundColor: `${meta.color}25`, color: meta.color }}>
                      <meta.icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{meta.label}</p>
                      {on && (
                        <select value={t.attached[m] ?? ""} onChange={(e) => setT({ ...t, attached: { ...t.attached, [m]: e.target.value } })}
                          className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs">
                          <option value="">Select source module…</option>
                          {MODULE_BANK[m].map((b) => <option key={b}>{b}</option>)}
                        </select>
                      )}
                    </div>
                    {on && <Check className="h-4 w-4 text-primary" />}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SwitchRow label="Allow answer review" desc="Students can revisit answers post-test" on={t.reviewAnswers} onChange={(v) => setT({ ...t, reviewAnswers: v })} />
            <SwitchRow label="AI feedback" desc="Generate writing/speaking analysis" on={t.aiFeedback} onChange={(v) => setT({ ...t, aiFeedback: v })} />
            <FormField label="Retakes">
              <select value={t.retakes} onChange={(e) => setT({ ...t, retakes: e.target.value as MockTest["retakes"] })} className={inputCls}>
                <option value="unlimited">Unlimited</option>
                <option value="limited">Limited</option>
                <option value="none">None</option>
              </select>
            </FormField>
            {t.retakes === "limited" && (
              <FormField label="Retake limit">
                <input type="number" min={1} max={20} value={t.retakeLimit} onChange={(e) => setT({ ...t, retakeLimit: +e.target.value })} className={inputCls} />
              </FormField>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
            <button type="submit" className="rounded-lg bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-[#062b29] shadow-lg transition hover:shadow-[0_0_22px_var(--teal)]">
              Save Mock Test
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

const inputCls = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

function FormField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-white/60">{label}</span>
      {children}
    </label>
  );
}

function SwitchRow({ label, desc, on, onChange }: { label: string; desc: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-white/50">{desc}</p>
      </div>
      <button type="button" onClick={() => onChange(!on)}
        className={`relative h-6 w-11 rounded-full transition ${on ? "bg-primary" : "bg-white/15"}`}>
        <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
          style={{ left: on ? "calc(100% - 22px)" : "2px" }} />
      </button>
    </div>
  );
}

function PreviewModal({ test, onClose }: { test: MockTest; onClose: () => void }) {
  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
        className="fixed inset-4 z-50 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1530] via-[#0F172A] to-[#08111f] shadow-2xl"
      >
        {/* WebGL-ish background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {["📘", "🎧", "✍️", "🗣️", "📝", "🎓"].map((c, i) => (
            <motion.span key={i} className="absolute text-6xl opacity-[0.06]"
              style={{ left: `${(i * 17 + 5) % 90}%`, top: `${(i * 23 + 10) % 80}%` }}
              animate={{ y: [0, -20, 0], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 9 + i, repeat: Infinity }}>{c}</motion.span>
          ))}
        </div>

        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-white/10 px-6 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">Preview</p>
              <h3 className="font-display text-2xl font-bold">{test.name}</h3>
              <p className="mt-1 text-sm text-white/60">{test.description}</p>
            </div>
            <button onClick={onClose} className="rounded-md p-2 hover:bg-white/10"><X className="h-4 w-4" /></button>
          </div>

          <div className="grid flex-1 gap-4 overflow-y-auto p-6 md:grid-cols-2">
            {test.modules.map((m, i) => {
              const meta = MODULE_META[m];
              return (
                <motion.div key={m} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg" style={{ backgroundColor: `${meta.color}25`, color: meta.color }}>
                      <meta.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-display text-lg font-bold">{meta.label}</p>
                      <p className="text-xs text-white/50">{test.attached[m] ?? "No source attached"}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
                    <Chip><Clock className="h-3 w-3" /> {Math.round(test.duration / test.modules.length)} min</Chip>
                    <Chip><Layers className="h-3 w-3" /> {test.difficulty}</Chip>
                    {test.aiFeedback && <Chip><Sparkles className="h-3 w-3" /> AI feedback</Chip>}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-6 py-3 text-xs text-white/60">
            <span>{test.modules.length} module{test.modules.length === 1 ? "" : "s"} · {test.duration} min · {test.difficulty}</span>
            <span className={test.published ? "text-[var(--teal)]" : "text-amber-400"}>{test.published ? "Published" : "Draft"}</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">{children}</span>;
}

function Analytics({ tests }: { tests: MockTest[] }) {
  const attemptsTrend = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    w: `W${i + 1}`, attempts: 40 + Math.round(Math.sin(i / 2) * 18 + i * 6),
  })), []);
  const moduleDifficulty = [
    { m: "Listening", v: 72 }, { m: "Reading", v: 64 }, { m: "Writing", v: 58 }, { m: "Speaking", v: 69 },
  ];
  const completion = [
    { name: "Completed", value: 71, color: "#14B8A6" },
    { name: "Quit mid-way", value: 18, color: "#f59e0b" },
    { name: "Not started", value: 11, color: "#475569" },
  ];
  const weakAreas = [
    { t: "Matching headings", v: 41 }, { t: "Map labeling", v: 47 },
    { t: "T/F/NG", v: 54 }, { t: "Sentence completion", v: 58 }, { t: "Short answer", v: 62 },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <KPI label="Total mock tests" value={tests.length} sub={`${tests.filter((t) => t.published).length} published`} />
      <KPI label="Total attempts" value={tests.reduce((a, b) => a + b.attempts, 0).toLocaleString()} sub="last 30 days" />
      <KPI label="Avg band score" value={(tests.filter((t) => t.avgBand).reduce((a, b) => a + b.avgBand, 0) / Math.max(1, tests.filter((t) => t.avgBand).length)).toFixed(1)} sub="across published tests" />

      <ChartCard title="Attempts over time" className="xl:col-span-2">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={attemptsTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="w" stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            <Line type="monotone" dataKey="attempts" stroke="#2563EB" strokeWidth={3} dot={{ r: 3, fill: "#14B8A6" }} animationDuration={1800} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Completion rate">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={completion} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3} animationDuration={1400}>
              {completion.map((c) => <Cell key={c.name} fill={c.color} />)}
            </Pie>
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Module difficulty (avg %)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={moduleDifficulty}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="m" stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            <Bar dataKey="v" fill="#2563EB" radius={[8, 8, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Weakest question types" className="xl:col-span-2">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weakAreas} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <YAxis dataKey="t" type="category" width={140} stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            <Bar dataKey="v" fill="#14B8A6" radius={[0, 8, 8, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function KPI({ label, value, sub }: { label: string; value: React.ReactNode; sub: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-white/50">{sub}</p>
    </motion.div>
  );
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
      className={`rounded-2xl border border-white/10 bg-white/5 p-5 ${className}`}>
      <div className="mb-2 flex items-center gap-2 text-white/70">
        <BarChart3 className="h-4 w-4" />
        <p className="font-display text-sm font-semibold">{title}</p>
      </div>
      {children}
    </motion.div>
  );
}
