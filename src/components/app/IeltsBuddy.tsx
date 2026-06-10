import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Bot, X, Send, Sparkles, Mic, BookOpen, Wand2, BarChart3, ChevronRight, Minus } from "lucide-react";

type Msg = { id: string; from: "buddy" | "me"; text: string };

const QUICK = [
  { icon: Mic, label: "Practice Speaking", prompt: "Give me a Part 2 cue card." },
  { icon: BookOpen, label: "Explain a word", prompt: "Explain the word 'ubiquitous'." },
  { icon: Sparkles, label: "Give me a quiz", prompt: "Quiz me on synonyms for 'important'." },
  { icon: BarChart3, label: "Predict my band", prompt: "Based on my recent attempts, predict my band." },
];

const SEED: Msg[] = [
  { id: "b0", from: "buddy", text: "Hi Galibi 👋 I'm your IELTS Buddy. Ask me anything — vocabulary, grammar, mock feedback, or a study plan." },
];

export function IeltsBuddy() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing, open]);

  const reply = (text: string) => {
    const id = String(Date.now());
    setMsgs((m) => [...m, { id, from: "me", text }]);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { id: id + "b", from: "buddy", text: buddyAnswer(text) }]);
    }, 1200);
  };

  return (
    <>
      <AnimatePresence>
        {!open && !minimized && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+88px)] right-4 md:bottom-5 md:right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 text-white shadow-xl shadow-indigo-500/30"
            aria-label="Open IELTS Buddy"
          >
            <motion.span className="absolute inset-0 rounded-full bg-white/30"
              animate={{ scale: [1, 1.4], opacity: [0.4, 0] }} transition={{ duration: 1.8, repeat: Infinity }} />
            <Bot className="h-6 w-6" />
            <button
              onClick={(e) => { e.stopPropagation(); setMinimized(true); }}
              aria-label="Minimize Buddy"
              className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-background text-foreground border shadow hover:bg-accent"
            >
              <Minus className="h-3 w-3" />
            </button>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && minimized && (
          <motion.button
            initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 30, opacity: 0 }}
            onClick={() => setMinimized(false)}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+104px)] right-0 md:bottom-8 md:right-0 z-30 grid h-9 w-7 place-items-center rounded-l-full bg-gradient-to-br from-indigo-500 to-teal-400 text-white shadow-lg"
            aria-label="Show IELTS Buddy"
          >
            <Bot className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", damping: 22 }}
            className="fixed inset-x-2 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-40 flex h-[min(560px,calc(100dvh-env(safe-area-inset-bottom)-104px))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:inset-x-auto md:right-5 md:bottom-5 md:h-[560px] md:w-[380px] md:max-w-[95vw]"
          >
            <header className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-teal-400 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-white/20"><Bot className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-semibold">IELTS Buddy</p>
                  <p className="text-[10px] opacity-80">Always online · powered by AI</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/20"><X className="h-4 w-4" /></button>
            </header>

            <div ref={ref} className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-3">
              <AnimatePresence initial={false}>
                {msgs.map((m) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                    {m.from === "buddy" && <div className="mr-2 grid h-7 w-7 shrink-0 place-items-center self-end rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 text-white"><Bot className="h-3.5 w-3.5" /></div>}
                    <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${m.from === "me" ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-background"}`}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}
                {typing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 text-white"><Bot className="h-3.5 w-3.5" /></div>
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-background px-3 py-2 shadow-sm">
                      {[0, 1, 2].map((i) => (
                        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t bg-background/80 px-2 py-2">
              <div className="mb-2 flex gap-1.5 overflow-x-auto px-1">
                {QUICK.map((q) => (
                  <button key={q.label} onClick={() => reply(q.prompt)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
                    <q.icon className="h-3 w-3" />{q.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 px-1 pb-1">
                <button className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground" title="Voice"><Mic className="h-4 w-4" /></button>
                <input
                  value={draft} onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && draft.trim() && reply(draft.trim())}
                  placeholder="Ask Buddy anything…"
                  className="flex-1 rounded-full border bg-background px-3.5 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button onClick={() => draft.trim() && reply(draft.trim())} className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"><Send className="h-4 w-4" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function buddyAnswer(q: string) {
  const k = q.toLowerCase();
  if (k.includes("cue card")) return "Part 2: Describe a place you would like to visit. You should say where it is, why you want to go, who you would go with, and explain what you would do there. You have 1 minute to prepare.";
  if (k.includes("ubiquitous")) return "Ubiquitous (adj) /juːˈbɪkwɪtəs/ — present, appearing, or found everywhere. Example: 'Smartphones have become ubiquitous in modern life.' Synonyms: omnipresent, pervasive. Antonyms: rare, scarce.";
  if (k.includes("quiz")) return "Quick quiz! Which word best replaces 'important' in this sentence: 'This is an important meeting.' — A) crucial B) ordinary C) trivial. Reply with A, B, or C.";
  if (k.includes("predict")) return "Based on your last 5 attempts you're trending around Band 6.5 overall. Strongest: Reading (7.0). Weakest: Writing Task 2 (6.0). With 3 weeks of focused practice on coherence, you can realistically reach Band 7.0.";
  return "Got it — I'd suggest starting with a 10-minute focused drill on your weakest question type, then a Part 2 speaking practice. Want me to set that up?";
}
