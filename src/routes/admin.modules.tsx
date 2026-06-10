import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Headphones, BookOpen, PenLine, Mic, Plus, Search, Edit3, Eye, Trash2,
  HelpCircle, X, Shuffle, ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/admin/modules")({
  head: () => ({
    meta: [
      { title: "Modules — AIELTS Admin" },
      { name: "description", content: "Manage AIELTS Listening, Reading, Writing, and Speaking modules." },
      { property: "og:title", content: "Modules — AIELTS Admin" },
      { property: "og:description", content: "Manage AIELTS Listening, Reading, Writing, and Speaking modules." },
      { property: "og:url", content: "/admin/modules" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ModulesPage,
});

type ModType = "Listening" | "Reading" | "Writing" | "Speaking";
type Mod = {
  id: string; name: string; type: ModType; part: string;
  difficulty: "Easy" | "Medium" | "Hard"; tags: string[];
  description: string; questions: number; published: boolean;
};

const PARTS: Record<ModType, string[]> = {
  Listening: ["Section 1", "Section 2", "Section 3", "Section 4"],
  Reading:   ["Passage 1", "Passage 2", "Passage 3"],
  Writing:   ["Task 1 (Academic)", "Task 1 (General)", "Task 2"],
  Speaking:  ["Part 1", "Part 2 (Cue card)", "Part 3"],
};

const ICONS: Record<ModType, typeof Headphones> = {
  Listening: Headphones, Reading: BookOpen, Writing: PenLine, Speaking: Mic,
};

const SEED: Mod[] = [
  { id:"m1", name:"Coastal Architecture", type:"Listening", part:"Section 2", difficulty:"Medium",
    tags:["academic","map-labeling"], description:"Map labeling + form completion.", questions:10, published:true },
  { id:"m2", name:"Renewable Energy", type:"Reading", part:"Passage 2", difficulty:"Hard",
    tags:["science","TFNG"], description:"True/False/Not Given heavy.", questions:13, published:true },
  { id:"m3", name:"Tech & Society — Task 2", type:"Writing", part:"Task 2", difficulty:"Medium",
    tags:["opinion"], description:"Discuss both views essay prompt.", questions:1, published:false },
  { id:"m4", name:"Travel Memories", type:"Speaking", part:"Part 2 (Cue card)", difficulty:"Easy",
    tags:["cue-card"], description:"Describe a memorable trip.", questions:1, published:true },
  { id:"m5", name:"Urban Planning Lecture", type:"Listening", part:"Section 4", difficulty:"Hard",
    tags:["lecture"], description:"Note completion + MCQ.", questions:10, published:false },
  { id:"m6", name:"Bar Chart — Exports", type:"Writing", part:"Task 1 (Academic)", difficulty:"Medium",
    tags:["chart"], description:"Describe export trends 2010–2022.", questions:1, published:true },
];

function ModulesPage() {
  const [items, setItems] = useState<Mod[]>(SEED);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"All" | ModType>("All");
  const [diff, setDiff] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [modal, setModal] = useState<Mod | "new" | null>(null);

  const filtered = useMemo(() => items.filter(m =>
    (type === "All" || m.type === type) &&
    (diff === "All" || m.difficulty === diff) &&
    (q === "" || m.name.toLowerCase().includes(q.toLowerCase()) || m.tags.some(t => t.includes(q.toLowerCase())))
  ), [items, q, type, diff]);

  const stats = useMemo(() => ({
    total: items.length,
    published: items.filter(m=>m.published).length,
    questions: items.reduce((a,m)=>a+m.questions,0),
    drafts: items.filter(m=>!m.published).length,
  }), [items]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">IELTS</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Modules</h2>
          <p className="text-sm text-white/50">Listening · Reading · Writing · Speaking — create, edit, publish.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/questions" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
            <HelpCircle className="h-4 w-4" /> Question bank
          </Link>
          <button onClick={() => setModal("new")}
            className="flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold shadow-lg shadow-[var(--teal)]/20 transition hover:shadow-[var(--teal)]/50">
            <Plus className="h-4 w-4" /> Create module
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Total", stats.total],["Published", stats.published],["Questions", stats.questions],["Drafts", stats.drafts]].map(([l,v], i)=>(
          <motion.div key={l} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-wider text-white/50">{l}</p>
            <p className="mt-2 font-display text-3xl font-bold">{v}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-white/50" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name or tag…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-white/40" />
        </div>
        <Select value={type} setValue={setType as any} options={["All","Listening","Reading","Writing","Speaking"]} />
        <Select value={diff} setValue={setDiff as any} options={["All","Easy","Medium","Hard"]} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {filtered.map((m, i) => {
            const Icon = ICONS[m.type];
            return (
              <motion.div key={m.id} layout
                initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i*0.04 }}
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition hover:border-[var(--teal)]/40 hover:shadow-[0_10px_40px_-10px_var(--teal)]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg gradient-brand"><Icon className="h-5 w-5" /></span>
                    <div>
                      <p className="font-display font-bold">{m.name}</p>
                      <p className="text-xs text-white/50">{m.type} · {m.part}</p>
                    </div>
                  </div>
                  <Badge tone={m.difficulty === "Hard" ? "rose" : m.difficulty === "Medium" ? "amber" : "teal"}>{m.difficulty}</Badge>
                </div>
                <p className="mt-3 text-sm text-white/70 line-clamp-2">{m.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.tags.map(t=>(
                    <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60">{t}</span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                  <p className="text-xs text-white/50">{m.questions} question{m.questions===1?"":"s"}</p>
                  <label className="flex items-center gap-2 text-xs text-white/60">
                    <span>{m.published ? "Published" : "Draft"}</span>
                    <Toggle checked={m.published} onChange={()=>setItems(arr=>arr.map(x=>x.id===m.id?{...x,published:!x.published}:x))} />
                  </label>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1.5 opacity-80 transition group-hover:opacity-100">
                  <IconBtn onClick={()=>setModal(m)} title="Edit"><Edit3 className="h-4 w-4" /></IconBtn>
                  <Link to="/admin/questions" className="grid place-items-center rounded-lg border border-white/10 bg-white/5 py-2 hover:bg-white/10" title="Add questions">
                    <Plus className="h-4 w-4" />
                  </Link>
                  <IconBtn onClick={()=>alert(`Preview: ${m.name}`)} title="Preview"><Eye className="h-4 w-4" /></IconBtn>
                  <IconBtn onClick={()=>setItems(arr=>arr.filter(x=>x.id!==m.id))} title="Delete" danger><Trash2 className="h-4 w-4" /></IconBtn>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {modal && (
          <ModuleModal
            initial={modal === "new" ? null : modal}
            onClose={() => setModal(null)}
            onSave={(m) => {
              setItems(arr => {
                const exists = arr.find(x=>x.id===m.id);
                return exists ? arr.map(x=>x.id===m.id?m:x) : [m, ...arr];
              });
              setModal(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Select({ value, setValue, options }: { value: string; setValue: (v:string)=>void; options: string[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={e=>setValue(e.target.value)}
        className="appearance-none rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 pr-8 text-sm outline-none">
        {options.map(o=><option key={o} value={o} className="bg-[#0B1224]">{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-white/50" />
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "teal"|"amber"|"rose" }) {
  const map = { teal:"bg-[var(--teal)]/15 text-[var(--teal)] border-[var(--teal)]/30",
    amber:"bg-amber-400/15 text-amber-300 border-amber-400/30",
    rose:"bg-rose-400/15 text-rose-300 border-rose-400/30" }[tone];
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map}`}>{children}</span>;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: ()=>void }) {
  return (
    <button onClick={onChange} className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-[var(--teal)]" : "bg-white/15"}`}>
      <motion.span layout className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow"
        style={{ left: checked ? "calc(100% - 1.125rem)" : "0.125rem" }} />
    </button>
  );
}

function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: ()=>void; title: string; danger?: boolean }) {
  return (
    <button onClick={onClick} title={title}
      className={`grid place-items-center rounded-lg border py-2 transition ${
        danger ? "border-rose-400/20 bg-rose-400/5 text-rose-300 hover:bg-rose-400/10"
               : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}>{children}</button>
  );
}

function ModuleModal({ initial, onClose, onSave }: { initial: Mod | null; onClose: ()=>void; onSave: (m: Mod)=>void }) {
  const [m, setM] = useState<Mod>(initial ?? {
    id: "m" + Math.random().toString(36).slice(2,8), name: "", type: "Listening",
    part: PARTS.Listening[0], difficulty: "Medium", tags: [], description: "", questions: 0, published: false,
  });
  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} />
      <motion.div initial={{opacity:0,y:30,scale:0.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:30,scale:0.96}}
        className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0B1224] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold">{initial ? "Edit module" : "Create module"}</h3>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Module name"><input value={m.name} onChange={e=>setM({...m,name:e.target.value})} className={inputCls} /></Field>
          <Field label="Difficulty">
            <select value={m.difficulty} onChange={e=>setM({...m,difficulty:e.target.value as any})} className={inputCls}>
              {["Easy","Medium","Hard"].map(o=><option key={o} className="bg-[#0B1224]">{o}</option>)}
            </select>
          </Field>
          <Field label="Type">
            <select value={m.type} onChange={e=>setM({...m,type:e.target.value as ModType, part: PARTS[e.target.value as ModType][0]})} className={inputCls}>
              {(["Listening","Reading","Writing","Speaking"] as ModType[]).map(o=><option key={o} className="bg-[#0B1224]">{o}</option>)}
            </select>
          </Field>
          <Field label="Part / Section">
            <select value={m.part} onChange={e=>setM({...m,part:e.target.value})} className={inputCls}>
              {PARTS[m.type].map(o=><option key={o} className="bg-[#0B1224]">{o}</option>)}
            </select>
          </Field>
          <Field label="Tags (comma-separated)" full>
            <input value={m.tags.join(", ")} onChange={e=>setM({...m,tags:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})} className={inputCls} />
          </Field>
          <Field label="Description" full>
            <textarea rows={3} value={m.description} onChange={e=>setM({...m,description:e.target.value})} className={inputCls} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
          <button onClick={()=>m.name && onSave(m)}
            className="rounded-lg gradient-brand px-4 py-2 text-sm font-semibold shadow-lg shadow-[var(--teal)]/20 hover:shadow-[var(--teal)]/50 transition">
            Save module
          </button>
        </div>
      </motion.div>
    </>
  );
}

const inputCls = "w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none transition focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--teal)_20%,transparent)]";

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs uppercase tracking-wider text-white/50">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

// re-export for sibling routes
export { PARTS, ICONS };
export type { ModType };
