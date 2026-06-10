import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Search, Volume2, Star, Plus, Sparkles, BookOpen, Brain, Shuffle,
  Headphones, Check, X as XIcon, ChevronRight, Flame, Filter, Heart,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/vocabulary")({
  head: () => ({
    meta: [
      { title: "IELTS Vocabulary Trainer — AIELTS" },
      { name: "description", content: "Master high-frequency IELTS vocabulary with spaced repetition and contextual examples." },
      { property: "og:title", content: "IELTS Vocabulary Trainer — AIELTS" },
      { property: "og:description", content: "Master high-frequency IELTS vocabulary with spaced repetition and contextual examples." },
      { property: "og:url", content: "/dashboard/vocabulary" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VocabularyPage,
});

type Word = {
  id: string;
  word: string;
  ipa: string;
  pos: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  meanings: string[];
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  forms: { pos: string; word: string }[];
  tags: string[];
  situations: string[];
  phrases: string[];
  idioms: string[];
  frequency: number;
};

const WORDS: Word[] = [
  {
    id: "w1", word: "ubiquitous", ipa: "/juːˈbɪkwɪtəs/", pos: "adjective", level: "C1",
    meanings: ["Present, appearing, or found everywhere."],
    examples: ["Smartphones have become ubiquitous in modern life.", "Coffee shops are ubiquitous in the city centre."],
    synonyms: ["omnipresent", "pervasive", "widespread", "universal"],
    antonyms: ["rare", "scarce", "uncommon"],
    forms: [{ pos: "noun", word: "ubiquity" }, { pos: "adverb", word: "ubiquitously" }],
    tags: ["Academic", "IELTS Writing"], situations: ["Technology", "Society"],
    phrases: ["a ubiquitous presence"], idioms: [], frequency: 62,
  },
  {
    id: "w2", word: "mitigate", ipa: "/ˈmɪtɪɡeɪt/", pos: "verb", level: "C1",
    meanings: ["Make less severe, serious, or painful."],
    examples: ["Drainage schemes have helped to mitigate the flooding.", "Steps were taken to mitigate the risks."],
    synonyms: ["alleviate", "reduce", "diminish", "ease"],
    antonyms: ["aggravate", "intensify", "worsen"],
    forms: [{ pos: "noun", word: "mitigation" }, { pos: "adjective", word: "mitigating" }],
    tags: ["Academic", "IELTS Writing", "IELTS Speaking"], situations: ["Health", "Environment"],
    phrases: ["mitigate the impact", "mitigate the effects"], idioms: [], frequency: 78,
  },
  {
    id: "w3", word: "endeavour", ipa: "/ɪnˈdevə/", pos: "noun, verb", level: "B2",
    meanings: ["An attempt to achieve a goal.", "Try hard to do or achieve something."],
    examples: ["We will endeavour to deliver on time.", "Her endeavours were finally rewarded."],
    synonyms: ["attempt", "strive", "effort", "venture"],
    antonyms: ["idleness", "neglect"],
    forms: [{ pos: "noun", word: "endeavour" }, { pos: "verb", word: "endeavour" }],
    tags: ["Academic", "IELTS Speaking"], situations: ["Work", "Education"],
    phrases: ["worthwhile endeavour"], idioms: [], frequency: 55,
  },
  {
    id: "w4", word: "succinct", ipa: "/səkˈsɪŋkt/", pos: "adjective", level: "C1",
    meanings: ["Briefly and clearly expressed."],
    examples: ["His succinct reply impressed the panel."],
    synonyms: ["concise", "terse", "pithy", "brief"],
    antonyms: ["verbose", "wordy", "lengthy"],
    forms: [{ pos: "adverb", word: "succinctly" }, { pos: "noun", word: "succinctness" }],
    tags: ["Academic"], situations: ["Work", "Education"],
    phrases: ["a succinct summary"], idioms: [], frequency: 41,
  },
  {
    id: "w5", word: "resilient", ipa: "/rɪˈzɪliənt/", pos: "adjective", level: "B2",
    meanings: ["Able to withstand or recover quickly from difficult conditions."],
    examples: ["Children are often remarkably resilient."],
    synonyms: ["tough", "robust", "hardy", "adaptable"],
    antonyms: ["fragile", "vulnerable", "weak"],
    forms: [{ pos: "noun", word: "resilience" }, { pos: "adverb", word: "resiliently" }],
    tags: ["IELTS Speaking", "IELTS Writing"], situations: ["Health", "Society"],
    phrases: ["resilient economy", "emotionally resilient"], idioms: ["bounce back"], frequency: 81,
  },
  {
    id: "w6", word: "scrutinise", ipa: "/ˈskruːtɪnaɪz/", pos: "verb", level: "C1",
    meanings: ["Examine or inspect closely and thoroughly."],
    examples: ["The committee scrutinised every detail of the report."],
    synonyms: ["examine", "inspect", "analyse"],
    antonyms: ["overlook", "ignore"],
    forms: [{ pos: "noun", word: "scrutiny" }],
    tags: ["Academic"], situations: ["Work", "Education"],
    phrases: ["under scrutiny"], idioms: [], frequency: 47,
  },
];

const LEVELS: Word["level"][] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const TOPICS = ["All", "Education", "Environment", "Technology", "Health", "Society", "Work", "Travel", "Culture"];

function googleTTS(word: string) {
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(word)}`;
}

function play(word: string) {
  try {
    const a = new Audio(googleTTS(word));
    a.play().catch(() => {});
  } catch { /* noop */ }
}

function VocabularyPage() {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<"All" | Word["level"]>("All");
  const [topic, setTopic] = useState("All");
  const [active, setActive] = useState<Word | null>(null);
  const [favs, setFavs] = useState<Record<string, boolean>>({});
  const [cards, setCards] = useState<Record<string, boolean>>({});
  const [quiz, setQuiz] = useState<null | "meaning" | "synonym" | "antonym" | "listening">(null);

  const filtered = useMemo(() => WORDS.filter(w =>
    (level === "All" || w.level === level) &&
    (topic === "All" || w.situations.includes(topic)) &&
    (q === "" || w.word.toLowerCase().includes(q.toLowerCase()))
  ), [q, level, topic]);

  const daily = WORDS[2];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">Vocabulary</p>
          <h2 className="font-display text-3xl font-bold">Build your IELTS lexicon</h2>
          <p className="text-sm text-muted-foreground">Search, listen with Google pronunciation, and master through quizzes.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
          <Flame className="h-4 w-4 text-amber-500" /> <span className="font-semibold">14-day</span>
          <span className="text-muted-foreground">vocab streak</span>
        </div>
      </motion.div>

      {/* Search + filters */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg border bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search words…" className="w-full bg-transparent text-sm outline-none" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select value={level} onChange={(e) => setLevel(e.target.value as typeof level)} className="rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="All">All levels</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {TOPICS.map(t => (
            <motion.button key={t} whileTap={{ scale: 0.94 }} onClick={() => setTopic(t)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition ${topic === t ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"}`}>
              {t}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Daily word + quiz modes */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DailyCard w={daily} onPlay={() => play(daily.word)} onOpen={() => setActive(daily)} />
        <QuizCard
          title="Vocabulary Quiz" desc="Word ↔ meaning · Fill in the blank" icon={Brain}
          color="from-blue-500/15 to-blue-500/0" onClick={() => setQuiz("meaning")}
        />
        <QuizCard
          title="Synonym & Antonym" desc="Match closest / opposite meaning" icon={Shuffle}
          color="from-teal-500/15 to-teal-500/0" onClick={() => setQuiz("synonym")}
        />
        <QuizCard
          title="Listening Quiz" desc="Google pronunciation → pick the word" icon={Headphones}
          color="from-amber-500/15 to-amber-500/0" onClick={() => setQuiz("listening")}
        />
        <QuizCard
          title="Mixed Quiz" desc="Random mix of all types" icon={Sparkles}
          color="from-fuchsia-500/15 to-fuchsia-500/0" onClick={() => setQuiz("antonym")}
        />
        <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-[var(--teal)]/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wordbook</p>
          <p className="mt-1 font-display text-2xl font-bold">{Object.values(cards).filter(Boolean).length} cards</p>
          <p className="mt-1 text-xs text-muted-foreground">Tap any word to add it to flashcards.</p>
        </div>
      </div>

      {/* Word grid */}
      <div>
        <div className="mb-3 flex items-end justify-between">
          <h3 className="font-display text-xl font-bold">All words</h3>
          <p className="text-xs text-muted-foreground">{filtered.length} results</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((w, i) => (
              <motion.button key={w.id}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
                onClick={() => setActive(w)}
                className="group relative overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:shadow-lg"
              >
                <div className="absolute right-3 top-3 flex items-center gap-1">
                  <span className="rounded-full border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{w.level}</span>
                  <button onClick={(e) => { e.stopPropagation(); setFavs(f => ({ ...f, [w.id]: !f[w.id] })); }}
                    className="grid h-7 w-7 place-items-center rounded-full border hover:border-primary">
                    <Heart className={`h-3.5 w-3.5 ${favs[w.id] ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
                  </button>
                </div>
                <p className="font-display text-2xl font-bold tracking-tight">{w.word}</p>
                <p className="text-xs text-muted-foreground">{w.ipa} · {w.pos}</p>
                <p className="mt-2 line-clamp-2 text-sm">{w.meanings[0]}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); play(w.word); }}
                    className="group/btn relative grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:scale-105">
                    <Volume2 className="h-4 w-4" />
                    <motion.span className="absolute inset-0 rounded-full border border-primary" animate={{ scale: [1, 1.5], opacity: [0.6, 0] }} transition={{ duration: 1.6, repeat: Infinity }} />
                  </button>
                  <span className="ml-auto text-xs text-muted-foreground">Tap for details</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Word detail modal */}
      <AnimatePresence>
        {active && (
          <WordModal w={active} onClose={() => setActive(null)} fav={!!favs[active.id]} carded={!!cards[active.id]}
            onFav={() => setFavs(f => ({ ...f, [active.id]: !f[active.id] }))}
            onCard={() => setCards(c => ({ ...c, [active.id]: !c[active.id] }))}
            onJump={(word) => { const next = WORDS.find(x => x.word === word); if (next) setActive(next); }}
          />
        )}
      </AnimatePresence>

      {/* Quiz modal */}
      <AnimatePresence>
        {quiz && <QuizModal kind={quiz} onClose={() => setQuiz(null)} />}
      </AnimatePresence>
    </div>
  );
}

function DailyCard({ w, onPlay, onOpen }: { w: Word; onPlay: () => void; onOpen: () => void }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="lg:col-span-1" style={{ perspective: 1000 }}>
      <motion.div
        onClick={() => setFlipped(f => !f)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-56 cursor-pointer rounded-2xl"
      >
        <div className="absolute inset-0 overflow-hidden rounded-2xl border bg-gradient-to-br from-primary to-[var(--teal)] p-5 text-white shadow-lg" style={{ backfaceVisibility: "hidden" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">Daily word</p>
          <p className="mt-2 font-display text-4xl font-bold">{w.word}</p>
          <p className="text-xs opacity-90">{w.ipa} · {w.pos} · {w.level}</p>
          <div className="absolute bottom-4 left-5 flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); onPlay(); }} className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25">
              <Volume2 className="h-4 w-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onOpen(); }} className="rounded-full bg-white/15 px-3 py-1.5 text-xs backdrop-blur hover:bg-white/25">Open</button>
            <span className="ml-auto text-xs opacity-80">Tap to flip</span>
          </div>
        </div>
        <div className="absolute inset-0 overflow-hidden rounded-2xl border bg-card p-5" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Meaning</p>
          <p className="mt-2 text-sm">{w.meanings[0]}</p>
          <p className="mt-3 text-xs font-semibold text-muted-foreground">Example</p>
          <p className="text-sm italic">"{w.examples[0]}"</p>
        </div>
      </motion.div>
    </div>
  );
}

function QuizCard({ title, desc, icon: Icon, color, onClick }: { title: string; desc: string; icon: React.ComponentType<{ className?: string }>; color: string; onClick: () => void }) {
  return (
    <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${color} p-5 text-left shadow-sm`}>
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-2 font-display text-lg font-bold">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">Start <ChevronRight className="h-3 w-3" /></span>
    </motion.button>
  );
}

function WordModal({ w, onClose, fav, carded, onFav, onCard, onJump }:
  { w: Word; onClose: () => void; fav: boolean; carded: boolean; onFav: () => void; onCard: () => void; onJump: (word: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center">
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 22 }}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-card p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border hover:bg-accent"><XIcon className="h-4 w-4" /></button>
        <div className="flex flex-wrap items-end gap-3">
          <h3 className="font-display text-4xl font-bold">{w.word}</h3>
          <span className="rounded-full border bg-background px-2 py-0.5 text-xs font-semibold">{w.level}</span>
          <button onClick={() => play(w.word)} className="relative grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
            <Volume2 className="h-4 w-4" />
            <motion.span className="absolute inset-0 rounded-full border-2 border-primary" animate={{ scale: [1, 1.7], opacity: [0.6, 0] }} transition={{ duration: 1.4, repeat: Infinity }} />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{w.ipa} · {w.pos}</p>

        <Section title="Meanings">
          <ul className="list-disc space-y-1 pl-5 text-sm">{w.meanings.map((m, i) => <li key={i}>{m}</li>)}</ul>
        </Section>
        <Section title="Examples">
          <ul className="space-y-2 text-sm">{w.examples.map((ex, i) => <li key={i} className="rounded-lg border bg-background p-3 italic">"{ex}"</li>)}</ul>
        </Section>
        <Section title="Synonyms">
          <Chips items={w.synonyms} tone="primary" onClick={onJump} />
        </Section>
        <Section title="Antonyms">
          <Chips items={w.antonyms} tone="rose" onClick={onJump} />
        </Section>
        <Section title="Word forms">
          <div className="flex flex-wrap gap-2 text-xs">
            {w.forms.map((f, i) => (
              <span key={i} className="rounded-full border bg-background px-3 py-1">
                <span className="text-muted-foreground">{f.pos}:</span> <span className="font-semibold">{f.word}</span>
              </span>
            ))}
          </div>
        </Section>
        <Section title="Tags & situations">
          <div className="flex flex-wrap gap-1.5">
            {[...w.tags, ...w.situations].map((t, i) => (
              <span key={i} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">{t}</span>
            ))}
          </div>
        </Section>
        {w.phrases.length > 0 && (
          <Section title="Phrases"><Chips items={w.phrases} tone="teal" /></Section>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
          <button onClick={onCard} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${carded ? "bg-primary text-primary-foreground" : "border hover:bg-accent"}`}>
            <Plus className="h-4 w-4" /> {carded ? "Added to flashcards" : "Add to flashcards"}
          </button>
          <button onClick={onFav} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${fav ? "bg-rose-500 text-white" : "border hover:bg-accent"}`}>
            <Star className={`h-4 w-4 ${fav ? "fill-white" : ""}`} /> {fav ? "Favorited" : "Favorite"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function Chips({ items, tone, onClick }: { items: string[]; tone: "primary" | "teal" | "rose"; onClick?: (w: string) => void }) {
  const cls = tone === "primary" ? "border-primary/30 text-primary hover:bg-primary/10"
    : tone === "teal" ? "border-[var(--teal)]/30 text-[var(--teal)] hover:bg-[var(--teal)]/10"
    : "border-rose-300 text-rose-600 hover:bg-rose-50";
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s, i) => (
        <motion.button key={i} whileHover={{ y: -1 }} onClick={() => onClick?.(s)}
          className={`rounded-full border bg-background px-3 py-1 text-xs transition ${cls}`}>
          {s}
        </motion.button>
      ))}
    </div>
  );
}

/* Quiz */
function QuizModal({ kind, onClose }: { kind: "meaning" | "synonym" | "antonym" | "listening"; onClose: () => void }) {
  const pool = WORDS;
  const questions = useMemo(() => {
    return pool.slice(0, 5).map((w) => {
      const others = pool.filter(x => x.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3);
      let prompt = ""; let correct = "";
      if (kind === "meaning") { prompt = w.meanings[0]; correct = w.word; }
      else if (kind === "synonym") { prompt = `Closest in meaning to "${w.word}"`; correct = w.synonyms[0]; }
      else if (kind === "antonym") { prompt = `Opposite in meaning to "${w.word}"`; correct = w.antonyms[0]; }
      else { prompt = w.word; correct = w.word; }
      const wrong = kind === "synonym" ? others.map(o => o.synonyms[0]) :
                    kind === "antonym" ? others.map(o => o.antonyms[0]) :
                    others.map(o => o.word);
      const options = [correct, ...wrong].sort(() => Math.random() - 0.5);
      return { word: w, prompt, correct, options };
    });
  }, [kind]);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[i];
  const next = () => {
    if (picked === q.correct) setScore(s => s + 1);
    if (i + 1 >= questions.length) setDone(true);
    else { setI(i + 1); setPicked(null); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-xl rounded-2xl border bg-card p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border hover:bg-accent"><XIcon className="h-4 w-4" /></button>

        {!done ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {kind === "listening" ? "Listening" : kind === "meaning" ? "Vocabulary" : kind === "synonym" ? "Synonym" : "Antonym"} quiz · {i + 1}/{questions.length}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${((i) / questions.length) * 100}%` }} />
            </div>

            <div className="mt-5">
              {kind === "listening" ? (
                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => play(q.correct)} className="relative grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl">
                    <Volume2 className="h-7 w-7" />
                    <motion.span className="absolute inset-0 rounded-full border-2 border-primary" animate={{ scale: [1, 1.7], opacity: [0.6, 0] }} transition={{ duration: 1.4, repeat: Infinity }} />
                  </button>
                  <p className="text-xs text-muted-foreground">Tap to play and pick the word you hear</p>
                </div>
              ) : (
                <p className="text-center font-display text-2xl font-bold">{q.prompt}</p>
              )}
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {q.options.map((opt) => {
                const isCorrect = picked && opt === q.correct;
                const isWrong = picked === opt && opt !== q.correct;
                return (
                  <motion.button key={opt} whileHover={{ scale: picked ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => !picked && setPicked(opt)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      isCorrect ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" :
                      isWrong ? "border-rose-500 bg-rose-500/10 text-rose-700" :
                      picked ? "opacity-60" : "hover:bg-accent"
                    }`}>
                    <span className="flex items-center justify-between gap-2">
                      {opt}
                      {isCorrect && <Check className="h-4 w-4" />}
                      {isWrong && <XIcon className="h-4 w-4" />}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Score: <span className="font-semibold text-foreground">{score}</span></p>
              <button disabled={!picked} onClick={next}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow disabled:opacity-50">
                {i + 1 >= questions.length ? "Finish" : "Next"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-2 font-display text-2xl font-bold">Quiz complete</p>
            <p className="mt-1 text-sm text-muted-foreground">You scored</p>
            <p className="font-display text-5xl font-bold text-primary">{score}/{questions.length}</p>
            <div className="mt-5 flex justify-center gap-2">
              <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Close</button>
              <button onClick={() => { setI(0); setPicked(null); setScore(0); setDone(false); }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Retry</button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default VocabularyPage;
