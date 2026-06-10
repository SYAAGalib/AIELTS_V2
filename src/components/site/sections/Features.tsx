import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  Mic,
  PenLine,
  Headphones,
  BookOpen,
  Calendar,
  Video,
  Shuffle,
  Users,
  Radio,
  Brain,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Phone,
  PhoneOff,
  MessageCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import buddyAisha from "@/assets/buddy-aisha.jpg";
import buddyTomas from "@/assets/buddy-tomas.jpg";


type Capability = {
  id: string;
  label: string;
  title: string;
  blurb: string;
  icon: typeof Mic;
  meta: string;
  accent: string; // oklch foreground for accent line
};

const CAPS: Capability[] = [
  {
    id: "speaking",
    label: "Speaking",
    title: "Live AI Examiner",
    blurb:
      "Realtime conversation graded on fluency, pronunciation, lexical range and grammar — the exact four-band Cambridge rubric, returned the moment you stop talking.",
    icon: Mic,
    meta: "Avg. response · 380 ms",
    accent: "oklch(0.72 0.18 18)",
  },
  {
    id: "live",
    label: "Spik Buddy",
    title: "1-to-1, end-to-end with a real candidate",
    blurb:
      "Spik Buddy pairs you 1-to-1 with another IELTS student in under 5 seconds — end-to-end encrypted voice, video and chat. Add friends, schedule mocks, run Part 2 cue cards together. Every partner is preparing for the same exam.",
    icon: Radio,
    meta: "412 online now",
    accent: "oklch(0.78 0.17 145)",
  },
  {
    id: "writing",
    label: "Writing",
    title: "Band-by-criterion feedback",
    blurb:
      "Drop a Task 1 or Task 2 essay and get TR, CC, LR and GRA scores in under 30 seconds — with inline rewrite suggestions and a side-by-side examiner version.",
    icon: PenLine,
    meta: "TR · CC · LR · GRA",
    accent: "oklch(0.74 0.16 260)",
  },
  {
    id: "listening",
    label: "Listening",
    title: "Adaptive difficulty",
    blurb:
      "Section difficulty scales with your accuracy. The system targets the question types — matching, map labelling, multiple choice — that cost you the most.",
    icon: Headphones,
    meta: "8 question formats",
    accent: "oklch(0.78 0.14 200)",
  },
  {
    id: "reading",
    label: "Reading",
    title: "Targeted skill drills",
    blurb:
      "True / False / Not Given, sentence completion, paragraph headings — drill the weakest format until your timing and accuracy hit Band 8.",
    icon: BookOpen,
    meta: "13 passage types",
    accent: "oklch(0.78 0.15 80)",
  },
  {
    id: "plan",
    label: "Plan",
    title: "12-week adaptive plan",
    blurb:
      "Tell us your exam date. Get a day-by-day schedule that rebalances every week based on your actual band trajectory across all four skills.",
    icon: Brain,
    meta: "Rebalances weekly",
    accent: "oklch(0.78 0.16 320)",
  },
];

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export function Features() {
  const [active, setActive] = useState<string>(CAPS[0].id);
  const current = CAPS.find((c) => c.id === active) ?? CAPS[0];

  return (
    <section
      id="features"
      className="relative overflow-hidden py-28 md:py-40"
      style={{
        background:
          "radial-gradient(80% 50% at 50% 0%, color-mix(in oklab, var(--primary) 5%, transparent), transparent 70%), var(--background)",
      }}
    >
      {/* faint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(70% 60% at 50% 40%, black, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        {/* header */}
        <div className="grid items-end gap-10 md:grid-cols-12">
          <motion.div {...fade} className="md:col-span-7">
            <h2 className="font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight md:text-6xl">
              One system.
              <br />
              <span className="italic text-muted-foreground">All four bands.</span>
            </h2>
          </motion.div>
          <motion.p
            {...fade}
            transition={{ ...fade.transition, delay: 0.1 }}
            className="md:col-span-5 text-lg leading-relaxed text-muted-foreground"
          >
            Built by founders who lived the IELTS grind — not a generic chatbot wrapper.
            Six capabilities, one adaptive engine, one path to a 9.0.
          </motion.p>
        </div>

        {/* main grid */}
        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          {/* left: capability rail */}
          <motion.div {...fade} className="lg:col-span-5">
            <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border bg-card/40 backdrop-blur">
              {CAPS.map((c, i) => {
                const isActive = c.id === active;
                const Icon = c.icon;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(c.id)}
                      onFocus={() => setActive(c.id)}
                      onClick={() => setActive(c.id)}
                      className="group relative flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-foreground/[0.03]"
                    >
                      {/* index */}
                      <span className="w-7 shrink-0 font-mono text-[11px] text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      {/* icon */}
                      <span
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors"
                        style={{
                          background: isActive ? c.accent : "transparent",
                          borderColor: isActive ? c.accent : "var(--border)",
                          color: isActive ? "var(--background)" : "var(--foreground)",
                        }}
                      >
                        <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                      </span>

                      {/* label */}
                      <span className="flex-1">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {c.label}
                        </span>
                        <span className="mt-0.5 block font-display text-lg font-semibold leading-tight">
                          {c.title}
                        </span>
                      </span>

                      {/* indicator */}
                      <motion.span
                        animate={{
                          opacity: isActive ? 1 : 0,
                          x: isActive ? 0 : -6,
                        }}
                        transition={{ duration: 0.3 }}
                        className="text-muted-foreground"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </motion.span>

                      {/* active rail */}
                      {isActive && (
                        <motion.span
                          layoutId="cap-rail"
                          className="absolute inset-y-2 left-0 w-[2px] rounded-full"
                          style={{ background: c.accent }}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* right: preview canvas */}
          <motion.div {...fade} transition={{ ...fade.transition, delay: 0.15 }} className="lg:col-span-7">
            <PreviewCanvas cap={current} />
          </motion.div>
        </div>

        {/* bottom hero — Spik Buddy */}
        <SpikBuddiesHero />

      </div>
    </section>
  );
}

/* ---------- Preview Canvas (3D tilt + per-cap visual) ---------- */

function PreviewCanvas({ cap }: { cap: Capability }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const rotX = useTransform(sy, [-0.5, 0.5], [6, -6]);
  const rotY = useTransform(sx, [-0.5, 0.5], [-8, 8]);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  const Icon = cap.icon;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative h-full min-h-[28rem] overflow-hidden rounded-3xl border bg-card p-8 md:p-10"
      style={{ perspective: 1200 }}
    >
      {/* ambient accent glow */}
      <motion.div
        key={cap.id + "-glow"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl"
        style={{ background: cap.accent }}
      />

      <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }} className="relative h-full">
        {/* header */}
        <div className="flex items-center justify-between" style={{ transform: "translateZ(40px)" }}>
          <div className="flex items-center gap-3">
            <span
              className="grid h-11 w-11 place-items-center rounded-xl"
              style={{ background: cap.accent, color: "var(--background)" }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {cap.label}
              </p>
              <p className="font-display text-base font-semibold">{cap.title}</p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-medium text-muted-foreground sm:inline-flex">
            <Activity className="h-3 w-3" /> {cap.meta}
          </span>
        </div>

        {/* body */}
        <motion.p
          key={cap.id + "-blurb"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-8 max-w-md font-display text-2xl leading-snug tracking-tight md:text-3xl"
          style={{ transform: "translateZ(30px)" }}
        >
          {cap.blurb}
        </motion.p>

        {/* per-capability visual */}
        <div className="mt-10" style={{ transform: "translateZ(60px)" }}>
          <CapabilityVisual cap={cap} />
        </div>
      </motion.div>
    </div>
  );
}

function CapabilityVisual({ cap }: { cap: Capability }) {
  switch (cap.id) {
    case "speaking":
      return <Waveform accent={cap.accent} />;
    case "live":
      return <MatchmakingViz accent={cap.accent} />;
    case "writing":
      return <BandStrip accent={cap.accent} />;
    case "listening":
      return <DifficultyCurve accent={cap.accent} />;
    case "reading":
      return <FormatChips accent={cap.accent} />;
    case "plan":
      return <PlanGrid accent={cap.accent} />;
    default:
      return null;
  }
}

function Waveform({ accent }: { accent: string }) {
  return (
    <div className="flex h-24 items-end gap-1.5">
      {Array.from({ length: 36 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ height: 6 }}
          animate={{ height: [6, 14 + ((i * 11) % 70), 6] }}
          transition={{ duration: 1.3 + (i % 5) * 0.18, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }}
          className="w-1.5 rounded-full"
          style={{ background: accent, opacity: 0.7 }}
        />
      ))}
    </div>
  );
}

function BandStrip({ accent }: { accent: string }) {
  const rows = [
    { k: "TR", v: 7.5, w: "82%" },
    { k: "CC", v: 8.0, w: "88%" },
    { k: "LR", v: 7.0, w: "76%" },
    { k: "GRA", v: 7.5, w: "82%" },
  ];
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={r.k} className="flex items-center gap-4">
          <span className="w-10 font-mono text-[11px] text-muted-foreground">{r.k}</span>
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/5">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: r.w }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: accent }}
            />
          </div>
          <span className="w-10 text-right font-display text-sm font-semibold">{r.v.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

function MatchmakingViz({ accent }: { accent: string }) {
  const orbs = ["#fda4af", "#86efac", "#fcd34d", "#93c5fd", "#c4b5fd", "#fdba74"];
  return (
    <div className="relative h-28">
      <div className="absolute inset-0 grid place-items-center">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          className="h-20 w-20 rounded-full border-2"
          style={{ borderColor: accent }}
        />
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
          className="absolute h-20 w-20 rounded-full border-2"
          style={{ borderColor: accent }}
        />
        <span
          className="absolute grid h-12 w-12 place-items-center rounded-full text-background"
          style={{ background: accent }}
        >
          <Radio className="h-5 w-5" />
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between">
        <div className="flex -space-x-2">
          {orbs.map((c, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
              className="h-7 w-7 rounded-full border-2 border-card"
              style={{ background: c }}
            />
          ))}
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">412 online · avg match 3.2s</span>
      </div>
    </div>
  );
}

function DifficultyCurve({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 320 100" className="h-24 w-full">
      <defs>
        <linearGradient id="curveFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,80 C40,72 60,40 100,38 C140,36 160,68 200,60 C240,52 260,18 320,12"
        fill="none"
        stroke={accent}
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <path
        d="M0,80 C40,72 60,40 100,38 C140,36 160,68 200,60 C240,52 260,18 320,12 L320,100 L0,100 Z"
        fill="url(#curveFill)"
      />
      {[
        [60, 50],
        [160, 64],
        [260, 24],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill={accent} />
      ))}
    </svg>
  );
}

function FormatChips({ accent }: { accent: string }) {
  const chips = [
    "True / False / NG",
    "Headings",
    "Sentence completion",
    "Matching features",
    "Summary completion",
    "MCQ",
    "Diagram labelling",
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c, i) => (
        <motion.span
          key={c}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="rounded-full border px-3 py-1 text-xs"
          style={{
            borderColor: i === 2 ? accent : "var(--border)",
            color: i === 2 ? accent : "var(--muted-foreground)",
            background: i === 2 ? `color-mix(in oklab, ${accent} 10%, transparent)` : "transparent",
          }}
        >
          {c}
        </motion.span>
      ))}
    </div>
  );
}

function PlanGrid({ accent }: { accent: string }) {
  // 7 cols × 4 rows = 28 days, ~ a month sliver of the 12-week plan
  const cells = Array.from({ length: 28 });
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="font-mono">Weeks 5 – 8</span>
        <span>Exam · Mar 22</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((_, i) => {
          const intensity = ((i * 37) % 100) / 100;
          const isExam = i === 27;
          return (
            <span
              key={i}
              className="aspect-square rounded-md"
              style={{
                background: isExam
                  ? accent
                  : `color-mix(in oklab, ${accent} ${Math.round(intensity * 70)}%, var(--background))`,
                border: "1px solid var(--border)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ---------- bottom Spik Buddy hero + live demo ---------- */

const DEMO_SPEAKERS = [
  {
    name: "Aisha",
    country: "🇧🇩 Dhaka",
    band: "Target 7.5",
    hue: "oklch(0.78 0.17 18)",
    initial: "A",
    photo: buddyAisha,
  },
  {
    name: "Tomás",
    country: "🇧🇷 São Paulo",
    band: "Target 8.0",
    hue: "oklch(0.78 0.15 200)",
    initial: "T",
    photo: buddyTomas,
  },
] as const;

type ChatTurn = { from: 0 | 1; text: string; voice?: boolean };
const DEMO_SCRIPT: ChatTurn[] = [
  { from: 0, text: "Hey! Part 2 cue card — describe a skill you'd like to learn?", voice: true },
  { from: 1, text: "Perfect. I'll take 1 minute. Start the timer 👇" },
  { from: 0, text: "Timer on. Go for it." },
  { from: 1, text: "I'd love to learn piano — it's been on my list for years…", voice: true },
  { from: 0, text: "Nice opener. Watch your linking words on the next sentence.", voice: true },
  { from: 1, text: "Got it. Want to swap and grade mine after?" },
  { from: 0, text: "Definitely. I'll cue-card you on 'a memorable trip'.", voice: true },
  { from: 1, text: "Deal. Recording on my side too — let's compare bands." },
];

function SpikBuddiesHero() {
  return (
    <motion.div
      {...fade}
      transition={{ ...fade.transition, delay: 0.2 }}
      className="mt-8 overflow-hidden rounded-3xl border bg-foreground text-background"
    >
      <div className="grid gap-0 lg:grid-cols-12">
        {/* left: copy */}
        <div className="relative lg:col-span-5 p-8 md:p-12">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live · 412 online
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-background/15 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-background/60">
              <ShieldCheck className="h-3 w-3" /> E2E
            </span>
          </div>

          <h3 className="mt-6 font-display text-3xl font-semibold leading-[1.02] md:text-5xl">
            Spik Buddy.
            <br />
            <span className="text-background/55">A real partner. In 5 seconds.</span>
          </h3>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-background/65">
            End-to-end encrypted voice, video and chat — paired 1-to-1 with another IELTS
            candidate. Add friends, schedule mocks, run Part 2 cue cards together.
          </p>

          <ul className="mt-7 grid grid-cols-2 gap-3 text-xs text-background/80">
            <Bullet icon={Shuffle}>Match in &lt; 5s</Bullet>
            <Bullet icon={Video}>1-to-1 video</Bullet>
            <Bullet icon={Users}>Friends &amp; mocks</Bullet>
            <Bullet icon={Mic}>Part 2 cue cards</Bullet>
          </ul>

          <div className="mt-8 flex items-center gap-4">
            <Link
              to="/dashboard/live"
              className="group inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-xs font-semibold text-foreground transition hover:gap-3"
            >
              Try Spik Buddy
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
            </Link>
            <span className="text-[11px] text-background/50">Free during your trial</span>
          </div>
        </div>

        {/* right: live demo */}
        <div className="relative lg:col-span-7 border-t border-background/10 lg:border-l lg:border-t-0">
          <SpikBuddyDemo />
        </div>
      </div>
    </motion.div>
  );
}

function SpikBuddyDemo() {
  const [messages, setMessages] = useState<ChatTurn[]>(() => DEMO_SCRIPT.slice(0, 3));
  const [cursor, setCursor] = useState(3);
  const [seconds, setSeconds] = useState(127);
  const [typing, setTyping] = useState<0 | 1 | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // call timer
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // chat loop: typing indicator → append next message → advance cursor
  useEffect(() => {
    const next = DEMO_SCRIPT[cursor % DEMO_SCRIPT.length];
    const t1 = setTimeout(() => setTyping(next.from), 1400);
    const t2 = setTimeout(() => {
      setTyping(null);
      setMessages((prev) => {
        const appended = [...prev, next];
        // cap history so memory stays bounded but scroll keeps growing visually
        return appended.length > 40 ? appended.slice(-40) : appended;
      });
      setCursor((c) => c + 1);
    }, 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [cursor]);

  // auto-scroll chat to bottom on new message / typing
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const activeSpeaker: 0 | 1 = typing ?? (messages[messages.length - 1]?.from ?? 0);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="relative h-full p-6 md:p-8">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: "oklch(0.78 0.17 145)" }}
      />

      {/* call header */}
      <div className="relative flex items-center justify-between text-[11px] text-background/70">
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-mono">
            {mm}:{ss}
          </span>
          <span className="rounded-full bg-background/10 px-2 py-0.5">Part 2 · Cue card</span>
        </div>
        <div className="flex items-center gap-1.5 text-background/50">
          <ShieldCheck className="h-3 w-3" />
          <span>End-to-end encrypted</span>
        </div>
      </div>

      {/* two speaker tiles — static, photo-based */}
      <div className="relative mt-5 grid grid-cols-2 gap-3">
        {DEMO_SPEAKERS.map((s, i) => {
          const isSpeaking = activeSpeaker === i;
          return (
            <div
              key={s.name}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-background/10"
            >
              <img
                src={s.photo}
                alt={s.name}
                width={512}
                height={512}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* dark gradient overlay for readability */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent"
              />

              {/* speaking ring — static, no pulse */}
              <div
                aria-hidden
                className={`absolute inset-1.5 rounded-2xl border-2 transition-opacity ${
                  isSpeaking ? "opacity-100" : "opacity-0"
                }`}
                style={{ borderColor: "rgb(74 222 128)" }}
              />

              {/* name chip */}
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-foreground/50 px-2 py-0.5 text-[10px] text-background backdrop-blur">
                <span>{s.name}</span>
                <span className="text-background/60">·</span>
                <span className="text-background/70">{s.country.split(" ")[0]}</span>
              </div>

              {/* speaking / muted status */}
              <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-foreground/50 px-2 py-0.5 text-[10px] text-background backdrop-blur">
                <Mic className="h-2.5 w-2.5" style={isSpeaking ? { color: "rgb(74 222 128)" } : undefined} />
                <span>{isSpeaking ? "Speaking" : "Listening"}</span>
              </div>

              {/* band tag */}
              <div className="absolute bottom-2 right-2 rounded-full bg-foreground/50 px-2 py-0.5 text-[9px] uppercase tracking-wider text-background/80 backdrop-blur">
                {s.band}
              </div>
            </div>
          );
        })}
      </div>

      {/* chat stream — fixed-height scrolling viewport */}
      <div className="relative mt-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-background/40">
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-3 w-3" /> Live chat
          </span>
          <span>
            {DEMO_SPEAKERS[0].name} ↔ {DEMO_SPEAKERS[1].name}
          </span>
        </div>

        <div
          ref={scrollRef}
          className="mt-2 h-44 overflow-y-auto rounded-2xl border border-background/10 bg-background/[0.03] p-3 [scrollbar-width:thin]"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0, #000 18px, #000 calc(100% - 18px), transparent 100%)",
          }}
        >
          <div className="space-y-1.5">
            {messages.map((m, idx) => {
              const isLeft = m.from === 0;
              const speaker = DEMO_SPEAKERS[m.from];
              return (
                <div
                  key={idx}
                  className={`flex items-end gap-2 ${isLeft ? "" : "flex-row-reverse"}`}
                >
                  <img
                    src={speaker.photo}
                    alt={speaker.name}
                    width={20}
                    height={20}
                    loading="lazy"
                    className="h-5 w-5 shrink-0 rounded-full object-cover"
                  />
                  <div
                    className={`max-w-[78%] rounded-2xl px-3 py-1.5 text-[12px] leading-snug ${
                      isLeft
                        ? "rounded-bl-sm bg-background/10 text-background/90"
                        : "rounded-br-sm bg-background text-foreground"
                    }`}
                  >
                    {m.voice && (
                      <span className="mr-1 inline-flex items-center gap-1 align-middle text-[10px] opacity-70">
                        <Mic className="h-2.5 w-2.5" />
                        voice
                      </span>
                    )}
                    {m.text}
                  </div>
                </div>
              );
            })}

            {typing !== null && (
              <div
                className={`flex items-end gap-2 ${typing === 0 ? "" : "flex-row-reverse"}`}
              >
                <img
                  src={DEMO_SPEAKERS[typing].photo}
                  alt={DEMO_SPEAKERS[typing].name}
                  width={20}
                  height={20}
                  loading="lazy"
                  className="h-5 w-5 shrink-0 rounded-full object-cover"
                />
                <div className="flex items-center gap-1 rounded-2xl bg-background/10 px-3 py-2">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-background/70"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* control bar */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {[
          { icon: Mic, on: true },
          { icon: Video, on: true },
          { icon: MessageCircle, on: true },
        ].map(({ icon: Icon, on }, i) => (
          <span
            key={i}
            className={`grid h-8 w-8 place-items-center rounded-full border ${
              on ? "border-background/20 bg-background/10" : "border-transparent bg-background/5 text-background/40"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        ))}
        <span className="grid h-8 w-8 place-items-center rounded-full bg-rose-500 text-background">
          <PhoneOff className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}



function Bullet({ icon: Icon, children }: { icon: typeof Mic; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className="grid h-6 w-6 place-items-center rounded-md bg-background/10">
        <Icon className="h-3 w-3" />
      </span>
      {children}
    </li>
  );
}
