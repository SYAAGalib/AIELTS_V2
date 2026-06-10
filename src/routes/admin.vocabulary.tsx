import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Plus, Volume2, Trash2, Search, Library, X, Save, Tag as TagIcon,
  Sparkles, ListChecks, Filter, ChevronRight, BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/admin/vocabulary")({
  head: () => ({
    meta: [
      { title: "Vocabulary — AIELTS Admin" },
      { name: "description", content: "Manage the AIELTS vocabulary lists and spaced repetition packs." },
      { property: "og:title", content: "Vocabulary — AIELTS Admin" },
      { property: "og:description", content: "Manage the AIELTS vocabulary lists and spaced repetition packs." },
      { property: "og:url", content: "/admin/vocabulary" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminVocabularyPage,
});

type WordRow = {
  id: string; word: string; ipa: string; pos: string; level: string;
  meanings: string[]; examples: string[]; synonyms: string[]; antonyms: string[];
  tags: string[]; situations: string[]; phrases: string[]; idioms: string[]; frequency: number;
};

const SEED: WordRow[] = [
  { id: "1", word: "ubiquitous", ipa: "/juːˈbɪkwɪtəs/", pos: "adjective", level: "C1",
    meanings: ["Present everywhere"], examples: ["Smartphones are ubiquitous."],
    synonyms: ["omnipresent", "pervasive"], antonyms: ["rare"], tags: ["Academic", "IELTS Writing"],
    situations: ["Technology"], phrases: ["a ubiquitous presence"], idioms: [], frequency: 62 },
  { id: "2", word: "mitigate", ipa: "/ˈmɪtɪɡeɪt/", pos: "verb", level: "C1",
    meanings: ["Make less severe"], examples: ["Mitigate the risks."],
    synonyms: ["alleviate", "reduce"], antonyms: ["aggravate"], tags: ["Academic"],
    situations: ["Environment", "Health"], phrases: ["mitigate the impact"], idioms: [], frequency: 78 },
  { id: "3", word: "resilient", ipa: "/rɪˈzɪliənt/", pos: "adjective", level: "B2",
    meanings: ["Able to recover quickly"], examples: ["Children are resilient."],
    synonyms: ["tough", "robust"], antonyms: ["fragile"], tags: ["IELTS Speaking"],
    situations: ["Society", "Health"], phrases: ["resilient economy"], idioms: ["bounce back"], frequency: 81 },
];

const CATEGORIES = ["Most Common", "Most Used IELTS", "Phrases", "Idioms", "Education", "Environment", "Technology", "Health", "Society", "Work", "Travel", "Culture"];
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

function googleTTS(w: string) { return `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(w)}`; }
function play(w: string) { try { new Audio(googleTTS(w)).play().catch(() => {}); } catch { /* noop */ } }

function AdminVocabularyPage() {
  const [rows, setRows] = useState<WordRow[]>(SEED);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("All");
  const [tab, setTab] = useState<"library" | "quizzes">("library");
  const [editing, setEditing] = useState<WordRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => rows.filter(r =>
    (level === "All" || r.level === level) &&
    (q === "" || r.word.toLowerCase().includes(q.toLowerCase()))
  ), [rows, q, level]);

  const upsert = (w: WordRow) => {
    setRows(prev => prev.some(r => r.id === w.id) ? prev.map(r => r.id === w.id ? w : r) : [w, ...prev]);
    setToast(`Saved "${w.word}"`);
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">Vocabulary</p>
          <h2 className="font-display text-3xl font-bold">Word library &amp; quizzes</h2>
          <p className="text-sm text-white/60">Manage entries with Google pronunciation, synonyms, antonyms, idioms and topic tags.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditing(blankWord()); setCreating(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--teal)] px-3 py-2 text-sm font-semibold text-[#0F172A] shadow">
            <Plus className="h-4 w-4" /> New word
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
        {(["library", "quizzes"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`relative rounded-lg px-4 py-1.5 text-sm transition ${tab === t ? "text-white" : "text-white/60 hover:text-white"}`}>
            {tab === t && <motion.span layoutId="vocab-tab" className="absolute inset-0 -z-10 rounded-lg bg-white/10" />}
            {t === "library" ? "Library" : "Quizzes"}
          </button>
        ))}
      </div>

      {tab === "library" ? (
        <>
          {/* Filters */}
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur md:grid-cols-[1fr_auto_auto]">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <Search className="h-4 w-4 text-white/50" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search words…" className="w-full bg-transparent text-sm outline-none placeholder:text-white/40" />
            </div>
            <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-white/50" />
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="rounded-lg border border-white/10 bg-[#0B1224] px-3 py-2 text-sm">
                <option value="All">All levels</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.slice(0, 5).map(c => <span key={c} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">{c}</span>)}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <th className="px-4 py-3">Word</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Freq</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((r, i) => (
                    <motion.tr key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => play(r.word)} className="relative grid h-8 w-8 place-items-center rounded-full bg-[var(--teal)]/20 text-[var(--teal)] hover:bg-[var(--teal)]/30">
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                          <div>
                            <p className="font-semibold">{r.word}</p>
                            <p className="text-xs text-white/50">{r.ipa} · {r.pos}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="rounded-full border border-white/10 px-2 py-0.5 text-xs">{r.level}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {[...r.tags, ...r.situations].slice(0, 3).map((t, j) => <span key={j} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{t}</span>)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/70">{r.frequency}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setEditing(r); setCreating(false); }} className="rounded-lg border border-white/10 px-2.5 py-1 text-xs hover:bg-white/10">Edit</button>
                        <button onClick={() => setRows(prev => prev.filter(x => x.id !== r.id))} className="ml-2 rounded-lg border border-white/10 p-1.5 text-rose-400 hover:bg-rose-500/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <QuizzesPanel />
      )}

      <AnimatePresence>
        {editing && (
          <WordEditor word={editing} creating={creating} onClose={() => setEditing(null)}
            onSave={(w) => { upsert(w); setEditing(null); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function blankWord(): WordRow {
  return { id: crypto.randomUUID(), word: "", ipa: "", pos: "noun", level: "B1",
    meanings: [""], examples: [""], synonyms: [], antonyms: [], tags: [], situations: [],
    phrases: [], idioms: [], frequency: 50 };
}

function WordEditor({ word, creating, onClose, onSave }: { word: WordRow; creating: boolean; onClose: () => void; onSave: (w: WordRow) => void }) {
  const [w, setW] = useState<WordRow>(word);
  const set = <K extends keyof WordRow>(k: K, v: WordRow[K]) => setW(s => ({ ...s, [k]: v }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center">
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", damping: 22 }}
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1224] p-6 text-white shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/10 hover:bg-white/10"><X className="h-4 w-4" /></button>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{creating ? "Add new word" : "Edit word"}</p>
        <h3 className="font-display text-2xl font-bold">{w.word || "New entry"}</h3>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Word">
            <input value={w.word} onChange={(e) => set("word", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm" />
          </Field>
          <Field label="IPA pronunciation">
            <div className="flex gap-2">
              <input value={w.ipa} onChange={(e) => set("ipa", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm" />
              <button onClick={() => w.word && play(w.word)} className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--teal)]/20 text-[var(--teal)]"><Volume2 className="h-4 w-4" /></button>
            </div>
            <p className="mt-1 text-[11px] text-white/40">Google pronunciation auto-generated — tap speaker to preview.</p>
          </Field>
          <Field label="Part of speech">
            <input value={w.pos} onChange={(e) => set("pos", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm" />
          </Field>
          <Field label="Level (CEFR)">
            <select value={w.level} onChange={(e) => set("level", e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0B1224] px-3 py-2 text-sm">
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Meanings"><MultilineList items={w.meanings} onChange={(v) => set("meanings", v)} placeholder="Add a meaning" /></Field>
        <Field label="Example sentences"><MultilineList items={w.examples} onChange={(v) => set("examples", v)} placeholder="Add example" /></Field>
        <Field label="Synonyms"><ChipInput items={w.synonyms} onChange={(v) => set("synonyms", v)} tone="teal" /></Field>
        <Field label="Antonyms"><ChipInput items={w.antonyms} onChange={(v) => set("antonyms", v)} tone="rose" /></Field>
        <Field label="Tags"><ChipInput items={w.tags} onChange={(v) => set("tags", v)} tone="blue" suggestions={["Academic", "Spoken", "IELTS Writing", "IELTS Speaking"]} /></Field>
        <Field label="Situational vocabulary"><ChipInput items={w.situations} onChange={(v) => set("situations", v)} tone="amber" suggestions={CATEGORIES.slice(4)} /></Field>
        <Field label="Phrases"><ChipInput items={w.phrases} onChange={(v) => set("phrases", v)} tone="blue" /></Field>
        <Field label="Idioms"><ChipInput items={w.idioms} onChange={(v) => set("idioms", v)} tone="blue" /></Field>

        <Field label={`Frequency: ${w.frequency}`}>
          <input type="range" min={0} max={100} value={w.frequency} onChange={(e) => set("frequency", Number(e.target.value))} className="w-full accent-[var(--teal)]" />
        </Field>

        <div className="mt-6 flex justify-end gap-2 border-t border-white/10 pt-4">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => onSave(w)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-[0_0_24px_var(--teal)]">
            <Save className="h-4 w-4" /> Save word
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50">{label}</label>
      {children}
    </div>
  );
}

function MultilineList({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <input value={it} onChange={(e) => { const c = [...items]; c[i] = e.target.value; onChange(c); }}
            placeholder={placeholder} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm" />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded-lg border border-white/10 p-2 text-rose-400 hover:bg-rose-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])} className="inline-flex items-center gap-1 text-xs text-[var(--teal)] hover:underline"><Plus className="h-3 w-3" /> Add</button>
    </div>
  );
}

function ChipInput({ items, onChange, tone, suggestions }: { items: string[]; onChange: (v: string[]) => void; tone: "teal" | "rose" | "blue" | "amber"; suggestions?: string[] }) {
  const [v, setV] = useState("");
  const toneCls = tone === "teal" ? "bg-[var(--teal)]/15 text-[var(--teal)]"
    : tone === "rose" ? "bg-rose-500/15 text-rose-300"
    : tone === "amber" ? "bg-amber-500/15 text-amber-300"
    : "bg-blue-500/15 text-blue-300";
  const add = (s: string) => { const t = s.trim(); if (t && !items.includes(t)) onChange([...items, t]); setV(""); };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence>
          {items.map((it) => (
            <motion.span key={it} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${toneCls}`}>
              {it}
              <button onClick={() => onChange(items.filter(x => x !== it))} className="opacity-70 hover:opacity-100"><X className="h-3 w-3" /></button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input value={v} onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(v); } }}
          placeholder="Type and press Enter…" className="min-w-[140px] flex-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs outline-none" />
      </div>
      {suggestions && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map(s => (
            <button key={s} onClick={() => add(s)} className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/60 hover:bg-white/10">+ {s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function QuizzesPanel() {
  const types = [
    { k: "Vocabulary", desc: "MCQ: meaning ↔ word, fill in the blank, sentence completion", icon: BookOpen },
    { k: "Synonym", desc: "Closest meaning, match word ↔ synonym", icon: ListChecks },
    { k: "Antonym", desc: "Opposite meaning, match word ↔ antonym", icon: ListChecks },
    { k: "Listening", desc: "Google pronunciation → choose / type the word", icon: Volume2 },
    { k: "Mixed", desc: "Random combination of all above", icon: Sparkles },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {types.map((t, i) => (
        <motion.div key={t.k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-[var(--teal)]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--teal)]"><t.icon className="h-4 w-4" /><p className="font-semibold">{t.k} quiz</p></div>
            <button className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/10">
              <Plus className="h-3 w-3" /> New set
            </button>
          </div>
          <p className="mt-1 text-sm text-white/60">{t.desc}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-white/50">
            <span className="inline-flex items-center gap-1"><TagIcon className="h-3 w-3" /> 3 published sets</span>
            <span className="inline-flex items-center gap-1 group-hover:text-[var(--teal)]">Manage <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" /></span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default AdminVocabularyPage;
