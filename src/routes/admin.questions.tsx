import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Plus, Trash2, Save, Eye, Upload, Image as ImageIcon, Music, Sparkles,
  ChevronDown, HelpCircle, BookOpen, Headphones, PenLine, Mic, Layers,
} from "lucide-react";

export const Route = createFileRoute("/admin/questions")({
  head: () => ({
    meta: [
      { title: "Question Bank — AIELTS Admin" },
      { name: "description", content: "Manage the AIELTS question bank across Listening, Reading, Writing, and Speaking." },
      { property: "og:title", content: "Question Bank — AIELTS Admin" },
      { property: "og:description", content: "Manage the AIELTS question bank across Listening, Reading, Writing, and Speaking." },
      { property: "og:url", content: "/admin/questions" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: QuestionsPage,
});

type ModType = "Listening" | "Reading" | "Writing" | "Speaking";

const PARTS: Record<ModType, string[]> = {
  Listening: ["Section 1", "Section 2", "Section 3", "Section 4"],
  Reading:   ["Passage 1", "Passage 2", "Passage 3"],
  Writing:   ["Task 1 (Academic)", "Task 1 (General)", "Task 2"],
  Speaking:  ["Part 1", "Part 2 (Cue card)", "Part 3"],
};

const ICONS = { Listening: Headphones, Reading: BookOpen, Writing: PenLine, Speaking: Mic };

const Q_TYPES: Record<ModType, string[]> = {
  Listening: ["Multiple Choice", "Matching", "Plan/Map/Diagram Labeling", "Form Completion", "Sentence Completion", "Short Answer"],
  Reading:   ["Multiple Choice", "True/False/Not Given", "Yes/No/Not Given", "Matching Headings", "Matching Information",
              "Matching Features", "Matching Sentence Endings", "Sentence Completion", "Summary/Table/Flowchart Completion", "Short Answer"],
  Writing:   ["Task 1 Academic (chart/graph/process)", "Task 1 General (letter)", "Task 2 Essay (opinion/discussion/problem-solution)"],
  Speaking:  ["Part 1 — General question", "Part 2 — Cue card", "Part 3 — Discussion question"],
};

const MODULES = [
  { id: "m1", name: "Coastal Architecture", type: "Listening" as ModType, part: "Section 2" },
  { id: "m2", name: "Renewable Energy",     type: "Reading"   as ModType, part: "Passage 2" },
  { id: "m3", name: "Tech & Society",       type: "Writing"   as ModType, part: "Task 2" },
  { id: "m4", name: "Travel Memories",      type: "Speaking"  as ModType, part: "Part 2 (Cue card)" },
];

type Q = {
  id: string; moduleId: string; type: string; prompt: string;
  options: string[]; answer: string; explanation: string;
  media?: { kind: "audio"|"image"; name: string };
};

const SEED: Q[] = [
  { id:"q1", moduleId:"m1", type:"Form Completion", prompt:"The architect's name is ______.", options:[],
    answer:"Marcus Hale", explanation:"Mentioned at 0:42 in the recording.", media:{kind:"audio",name:"sec2.mp3"} },
  { id:"q2", moduleId:"m2", type:"True/False/Not Given", prompt:"Solar capacity tripled between 2015 and 2020.",
    options:["True","False","Not Given"], answer:"True", explanation:"Paragraph 3, line 4." },
];

function QuestionsPage() {
  const [questions, setQuestions] = useState<Q[]>(SEED);
  const [selModule, setSelModule] = useState(MODULES[0].id);
  const [draft, setDraft] = useState<Q | null>(null);
  const [previewing, setPreviewing] = useState<Q | null>(null);

  const mod = MODULES.find(m=>m.id===selModule)!;
  const Icon = ICONS[mod.type];
  const list = questions.filter(q=>q.moduleId===selModule);

  const startNew = () => setDraft({
    id: "q" + Math.random().toString(36).slice(2,8), moduleId: selModule,
    type: Q_TYPES[mod.type][0], prompt: "", options: [], answer: "", explanation: "",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Authoring</p>
          <h2 className="mt-1 font-display text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-[var(--teal)]" /> Question bank
          </h2>
          <p className="text-sm text-white/50">Build IELTS question sets across all modules and types.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/modules" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
            <Layers className="h-4 w-4" /> Modules
          </Link>
          <button onClick={()=>alert("Question set published")}
            className="flex items-center gap-2 rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/10 px-4 py-2 text-sm font-semibold text-[var(--teal)] hover:bg-[var(--teal)]/20">
            <Sparkles className="h-4 w-4" /> Publish set
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
        {/* Left panel — module info & list */}
        <aside className="space-y-4">
          <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Module</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg gradient-brand"><Icon className="h-4 w-4" /></span>
              <select value={selModule} onChange={e=>setSelModule(e.target.value)}
                className="w-full appearance-none bg-transparent text-sm font-display font-bold outline-none">
                {MODULES.map(m=><option key={m.id} value={m.id} className="bg-[#0B1224]">{m.name}</option>)}
              </select>
            </div>
            <p className="mt-1 text-xs text-white/50">{mod.type} · {mod.part}</p>
            <button onClick={startNew}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg gradient-brand py-2 text-sm font-semibold shadow-lg shadow-[var(--teal)]/20 hover:shadow-[var(--teal)]/50 transition">
              <Plus className="h-4 w-4" /> Add question
            </button>
          </motion.div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur">
            <p className="px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/40">Set ({list.length})</p>
            <ul className="space-y-1">
              <AnimatePresence>
                {list.map((q, i)=>(
                  <motion.li key={q.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:8}}
                    className="group flex items-start gap-2 rounded-lg p-2 hover:bg-white/5">
                    <span className="mt-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--teal)]/15 text-[10px] font-bold text-[var(--teal)]">{i+1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{q.prompt || <span className="text-white/40">Untitled</span>}</p>
                      <p className="truncate text-[10px] text-white/40">{q.type}</p>
                    </div>
                    <button onClick={()=>setPreviewing(q)} className="opacity-0 group-hover:opacity-100" title="Preview"><Eye className="h-3.5 w-3.5 text-white/60 hover:text-[var(--teal)]" /></button>
                    <button onClick={()=>setDraft(q)} className="opacity-0 group-hover:opacity-100" title="Edit"><Sparkles className="h-3.5 w-3.5 text-white/60 hover:text-[var(--teal)]" /></button>
                    <button onClick={()=>setQuestions(arr=>arr.filter(x=>x.id!==q.id))} className="opacity-0 group-hover:opacity-100" title="Delete"><Trash2 className="h-3.5 w-3.5 text-rose-300" /></button>
                  </motion.li>
                ))}
              </AnimatePresence>
              {list.length === 0 && <p className="p-3 text-xs text-white/40">No questions yet — click “Add question”.</p>}
            </ul>
          </div>
        </aside>

        {/* Right panel — dynamic form */}
        <section>
          <AnimatePresence mode="wait">
            {draft ? (
              <QuestionForm key={draft.id}
                draft={draft} setDraft={setDraft}
                modType={mod.type}
                onSave={(q)=>{ setQuestions(arr=>{
                  const exists = arr.find(x=>x.id===q.id);
                  return exists ? arr.map(x=>x.id===q.id?q:x) : [...arr, q];
                }); setDraft(null); }}
                onCancel={()=>setDraft(null)}
                onPreview={()=>setPreviewing(draft)} />
            ) : (
              <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                className="grid place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-16 text-center">
                <HelpCircle className="h-10 w-10 text-white/30" />
                <p className="mt-3 font-display text-lg">Select a module and add a question</p>
                <p className="text-sm text-white/50">Forms adapt to every IELTS question type.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <AnimatePresence>{previewing && <PreviewModal q={previewing} onClose={()=>setPreviewing(null)} />}</AnimatePresence>
    </div>
  );
}

function QuestionForm({ draft, setDraft, modType, onSave, onCancel, onPreview }: {
  draft: Q; setDraft: (q: Q)=>void; modType: ModType;
  onSave: (q: Q)=>void; onCancel: ()=>void; onPreview: ()=>void;
}) {
  const types = Q_TYPES[modType];
  const needsOptions = /Multiple Choice|True\/False|Yes\/No|Matching/.test(draft.type);
  const isWriting = modType === "Writing";
  const isSpeaking = modType === "Speaking";

  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{modType} question</p>
          <h3 className="font-display text-xl font-bold">Question editor</h3>
        </div>
        <div className="relative">
          <select value={draft.type} onChange={e=>setDraft({...draft, type: e.target.value, options: []})}
            className="appearance-none rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 pr-8 text-sm outline-none">
            {types.map(t=><option key={t} className="bg-[#0B1224]">{t}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-white/50" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={draft.type} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-4}}
          className="mt-5 space-y-4">
          <Field label={isSpeaking && draft.type.includes("Cue card") ? "Cue card topic" : "Question / Prompt"}>
            <textarea rows={isWriting ? 5 : 3} value={draft.prompt} onChange={e=>setDraft({...draft, prompt:e.target.value})}
              placeholder={isWriting ? "Some people believe... Discuss both views and give your opinion." : "Enter the question text…"}
              className={inputCls} />
          </Field>

          {isSpeaking && draft.type.includes("Cue card") && (
            <Field label="Bullet points (one per line)">
              <textarea rows={4} value={draft.options.join("\n")} onChange={e=>setDraft({...draft, options:e.target.value.split("\n")})}
                placeholder={"You should say:\n— where it was\n— who you went with\n— why it was memorable"}
                className={inputCls} />
            </Field>
          )}

          {needsOptions && !isSpeaking && (
            <Field label="Options">
              <div className="space-y-2">
                {draft.options.map((o,i)=>(
                  <div key={i} className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-xs">{String.fromCharCode(65+i)}</span>
                    <input value={o} onChange={e=>setDraft({...draft, options: draft.options.map((x,j)=>j===i?e.target.value:x)})} className={inputCls} />
                    <button onClick={()=>setDraft({...draft, options: draft.options.filter((_,j)=>j!==i)})}
                      className="rounded-md p-1.5 text-rose-300 hover:bg-rose-400/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <button onClick={()=>setDraft({...draft, options:[...draft.options, ""]})}
                  className="flex items-center gap-1 rounded-md border border-dashed border-white/15 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5">
                  <Plus className="h-3.5 w-3.5" /> Add option
                </button>
              </div>
            </Field>
          )}

          {!isWriting && !isSpeaking && (
            <Field label="Correct answer">
              <input value={draft.answer} onChange={e=>setDraft({...draft, answer:e.target.value})}
                placeholder="e.g. B, True, Marcus Hale" className={inputCls} />
            </Field>
          )}

          {(isWriting || isSpeaking) && (
            <Field label={isSpeaking ? "AI examiner instructions" : "Band 9 sample answer / grading rubric"}>
              <textarea rows={4} value={draft.answer} onChange={e=>setDraft({...draft, answer:e.target.value})}
                placeholder={isSpeaking ? "Push for elaboration. Probe past tense usage." : "Provide model answer or rubric notes."}
                className={inputCls} />
            </Field>
          )}

          <Field label="Explanation (shown after submission)">
            <textarea rows={2} value={draft.explanation} onChange={e=>setDraft({...draft, explanation:e.target.value})} className={inputCls} />
          </Field>

          <Field label="Media">
            <div className="flex flex-wrap gap-2">
              <MediaBtn icon={Music}    label="Upload audio" onClick={()=>setDraft({...draft, media:{kind:"audio", name:"audio.mp3"}})} active={draft.media?.kind==="audio"} />
              <MediaBtn icon={ImageIcon} label="Upload image" onClick={()=>setDraft({...draft, media:{kind:"image", name:"image.png"}})} active={draft.media?.kind==="image"} />
              {draft.media && (
                <span className="flex items-center gap-2 rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/10 px-3 py-1.5 text-xs text-[var(--teal)]">
                  <Upload className="h-3.5 w-3.5" /> {draft.media.name}
                  <button onClick={()=>setDraft({...draft, media: undefined})} className="ml-1 hover:text-white"><Trash2 className="h-3 w-3" /></button>
                </span>
              )}
            </div>
          </Field>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
        <button onClick={onCancel} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
        <button onClick={onPreview} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
          <Eye className="h-4 w-4" /> Preview
        </button>
        <button onClick={()=>onSave(draft)}
          className="flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold shadow-lg shadow-[var(--teal)]/20 hover:shadow-[var(--teal)]/50 transition">
          <Save className="h-4 w-4" /> Save question
        </button>
      </div>
    </motion.div>
  );
}

function MediaBtn({ icon: Icon, label, onClick, active }: { icon: any; label: string; onClick: ()=>void; active?: boolean }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition ${
        active ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]" : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function PreviewModal({ q, onClose }: { q: Q; onClose: ()=>void }) {
  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} />
      <motion.div initial={{opacity:0, y:30, scale:0.96}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, y:30, scale:0.96}}
        className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0B1224] p-6 shadow-2xl">
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Preview · {q.type}</p>
        <p className="mt-2 font-display text-lg">{q.prompt}</p>
        {q.media && <p className="mt-2 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60"><Upload className="h-3 w-3" /> {q.media.name}</p>}
        {q.options.length > 0 && (
          <ul className="mt-4 space-y-2">
            {q.options.map((o,i)=>(
              <li key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--teal)]/15 text-xs font-bold text-[var(--teal)]">{String.fromCharCode(65+i)}</span>
                {o || <span className="text-white/40">Empty</span>}
              </li>
            ))}
          </ul>
        )}
        {q.answer && (
          <div className="mt-4 rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/5 p-3 text-sm">
            <p className="text-[10px] uppercase tracking-wider text-[var(--teal)]">Answer</p>
            <p className="mt-1 text-white/80">{q.answer}</p>
          </div>
        )}
        {q.explanation && <p className="mt-2 text-xs text-white/60">💡 {q.explanation}</p>}
        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className="rounded-lg gradient-brand px-4 py-2 text-sm font-semibold">Close</button>
        </div>
      </motion.div>
    </>
  );
}

const inputCls = "w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none transition focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--teal)_20%,transparent)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-white/50">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
