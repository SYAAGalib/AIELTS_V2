import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Mic, Bot, Sparkles, Save, Play, Volume2, Gauge, MessageSquare, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/speaking-ai")({
  head: () => ({
    meta: [
      { title: "Speaking AI — AIELTS Admin" },
      { name: "description", content: "Configure the AIELTS voice examiner model and scoring rubrics." },
      { property: "og:title", content: "Speaking AI — AIELTS Admin" },
      { property: "og:description", content: "Configure the AIELTS voice examiner model and scoring rubrics." },
      { property: "og:url", content: "/admin/speaking-ai" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SpeakingAIPage,
});

type Voice = "Sophia (UK)" | "James (UK)" | "Ava (US)" | "Liam (AUS)";
type Persona = "Friendly" | "Neutral" | "Strict examiner";

const PARTS = ["Part 1", "Part 2 (Cue card)", "Part 3"] as const;
type Part = typeof PARTS[number];

type PartCfg = {
  askingStyle: string;
  responseStyle: string;
  evalRubric: string;
  feedbackTone: string;
  probing: number;       // 0-100
  patience: number;      // seconds
  followUps: number;     // count
  partTime: number;      // minutes
};

const DEFAULTS: Record<Part, PartCfg> = {
  "Part 1":           { askingStyle:"Warm, everyday questions about familiar topics.", responseStyle:"Brief acknowledgements; do not interrupt.", evalRubric:"Fluency 25 · Lex 25 · Gram 25 · Pron 25", feedbackTone:"Encouraging", probing:30, patience:3, followUps:2, partTime:5 },
  "Part 2 (Cue card)":{ askingStyle:"Read the cue card naturally; allow 1 min prep.", responseStyle:"Silent listener; nod cues only.",       evalRubric:"Sustained turn weighted on coherence.",      feedbackTone:"Neutral",      probing:10, patience:6, followUps:1, partTime:2 },
  "Part 3":           { askingStyle:"Abstract, opinion-led discussion questions.",    responseStyle:"Push back; ask 'why' and counter-examples.", evalRubric:"Discourse markers + complex grammar weighted.", feedbackTone:"Strict",       probing:80, patience:4, followUps:4, partTime:5 },
};

function SpeakingAIPage() {
  const [part, setPart] = useState<Part>("Part 1");
  const [cfg, setCfg] = useState<Record<Part, PartCfg>>(DEFAULTS);
  const [voice, setVoice] = useState<Voice>("Sophia (UK)");
  const [persona, setPersona] = useState<Persona>("Neutral");
  const [saved, setSaved] = useState(false);

  const current = cfg[part];
  const set = (patch: Partial<PartCfg>) => setCfg({ ...cfg, [part]: { ...current, ...patch } });

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">AI examiner</p>
          <h2 className="mt-1 font-display text-3xl font-bold flex items-center gap-2">
            <Bot className="h-7 w-7 text-[var(--teal)]" /> Speaking AI behavior
          </h2>
          <p className="text-sm text-white/50">Configure how the AI examiner asks, listens, evaluates, and gives feedback.</p>
        </div>
        <button onClick={save}
          className="flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold shadow-lg shadow-[var(--teal)]/20 transition hover:shadow-[var(--teal)]/50">
          <Save className="h-4 w-4" /> Save behavior
        </button>
      </div>

      {/* Global persona / voice */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Examiner voice" icon={Volume2}>
          <div className="grid grid-cols-2 gap-2">
            {(["Sophia (UK)","James (UK)","Ava (US)","Liam (AUS)"] as Voice[]).map(v=>(
              <button key={v} onClick={()=>setVoice(v)}
                className={`rounded-lg border px-3 py-2 text-xs transition ${voice===v ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                {v}
              </button>
            ))}
          </div>
          <button className="mt-3 flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">
            <Play className="h-3.5 w-3.5" /> Preview voice
          </button>
        </Card>

        <Card title="Persona" icon={Sparkles}>
          <div className="space-y-2">
            {(["Friendly","Neutral","Strict examiner"] as Persona[]).map(p=>(
              <label key={p} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm cursor-pointer hover:bg-white/10">
                <input type="radio" checked={persona===p} onChange={()=>setPersona(p)} className="accent-[var(--teal)]" />
                {p}
              </label>
            ))}
          </div>
        </Card>

        <Card title="Live preview" icon={Mic}>
          <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs">
            <p className="text-white/60">🎙️ {voice} · {persona}</p>
            <p className="mt-2 text-white/80">"Let's talk about your hometown. Where did you grow up?"</p>
            <Waveform />
          </div>
        </Card>
      </div>

      {/* Part tabs */}
      <div className="flex items-center gap-2 border-b border-white/10">
        {PARTS.map(p=>(
          <button key={p} onClick={()=>setPart(p)}
            className={`relative px-4 py-2.5 text-sm font-medium transition ${part===p ? "text-white" : "text-white/50 hover:text-white"}`}>
            {p}
            {part===p && <motion.span layoutId="speaking-tab" className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--teal)]" style={{ boxShadow: "0 0 10px var(--teal)" }} />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={part} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
          className="grid gap-4 md:grid-cols-2">
          <Card title="How AI should ask questions" icon={MessageSquare} full>
            <textarea rows={3} value={current.askingStyle} onChange={e=>set({askingStyle:e.target.value})} className={input} />
          </Card>
          <Card title="How AI should respond" icon={MessageSquare}>
            <textarea rows={3} value={current.responseStyle} onChange={e=>set({responseStyle:e.target.value})} className={input} />
          </Card>
          <Card title="How AI should evaluate" icon={Gauge}>
            <textarea rows={3} value={current.evalRubric} onChange={e=>set({evalRubric:e.target.value})} className={input} />
          </Card>
          <Card title="Feedback tone" icon={Sparkles}>
            <div className="flex flex-wrap gap-2">
              {["Encouraging","Neutral","Strict","Coach-like"].map(t=>(
                <button key={t} onClick={()=>set({feedbackTone:t})}
                  className={`rounded-full border px-3 py-1 text-xs transition ${current.feedbackTone===t ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>{t}</button>
              ))}
            </div>
          </Card>
          <Card title="Probing intensity" icon={Gauge}>
            <Slider value={current.probing} onChange={(v)=>set({probing:v})} max={100} unit="%" />
            <p className="mt-2 text-xs text-white/50">How aggressively the examiner asks "why" and counter-examples.</p>
          </Card>
          <Card title="Patience before nudging" icon={Gauge}>
            <Slider value={current.patience} onChange={(v)=>set({patience:v})} max={15} unit="s" />
          </Card>
          <Card title="Follow-up questions / question" icon={MessageSquare}>
            <Slider value={current.followUps} onChange={(v)=>set({followUps:v})} max={8} unit="" />
          </Card>
          <Card title="Part time limit" icon={Gauge}>
            <Slider value={current.partTime} onChange={(v)=>set({partTime:v})} max={10} unit=" min" />
          </Card>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {saved && (
          <motion.div initial={{ y:-40, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:-40, opacity:0 }}
            className="fixed top-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--teal)]/30 bg-[#0B1224]/95 px-5 py-2.5 text-sm shadow-2xl backdrop-blur">
            <CheckCircle2 className="h-4 w-4 text-[var(--teal)]" /> Behavior saved for {part}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const input = "w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none transition focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--teal)_20%,transparent)]";

function Card({ title, icon: Icon, children, full }: { title: string; icon: any; children: React.ReactNode; full?: boolean }) {
  return (
    <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
      className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur ${full ? "md:col-span-2" : ""}`}>
      <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/50">
        <Icon className="h-3.5 w-3.5 text-[var(--teal)]" /> {title}
      </p>
      <div className="mt-3">{children}</div>
    </motion.div>
  );
}

function Slider({ value, onChange, max, unit }: { value: number; onChange: (v:number)=>void; max: number; unit: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <input type="range" min={0} max={max} value={value} onChange={e=>onChange(+e.target.value)}
          className="w-full accent-[var(--teal)]" />
        <span className="ml-3 w-16 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-right text-xs">{value}{unit}</span>
      </div>
    </div>
  );
}

function Waveform() {
  return (
    <div className="mt-3 flex h-10 items-end gap-0.5">
      {Array.from({ length: 40 }).map((_, i)=>(
        <motion.span key={i} className="w-1 rounded-full bg-[var(--teal)]"
          animate={{ height: [`${10 + (i%7)*6}%`, `${30 + (i%5)*12}%`, `${10 + (i%7)*6}%`] }}
          transition={{ duration: 1.2 + (i%5)*0.1, repeat: Infinity, ease: "easeInOut", delay: i*0.03 }} />
      ))}
    </div>
  );
}
