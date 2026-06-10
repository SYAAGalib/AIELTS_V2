import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Headphones, BookOpen, PenLine, Mic, ClipboardCheck, Library, Radio } from "lucide-react";

const cards = [
  {
    icon: Headphones, title: "Listening", tag: "All four accents",
    body: "UK, AUS, NZ and Indian English — same speakers you'll meet on test day. Difficulty auto-paces to keep you in the stretch zone.",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=70",
    accent: "from-sky-200/60 to-sky-50",
  },
  {
    icon: BookOpen, title: "Reading", tag: "Question-type drills",
    body: "True/False/Not Given, Matching Headings, Y/N/NG — drill the exact type slowing you down, not generic passages.",
    img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=1200&q=70",
    accent: "from-amber-200/60 to-amber-50",
  },
  {
    icon: PenLine, title: "Writing", tag: "Four-criterion band",
    body: "Submit Task 1 or Task 2. Get TR · CC · LR · GRA bands plus rewrite suggestions inline — in under a minute.",
    img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=70",
    accent: "from-violet-200/60 to-violet-50",
  },
  {
    icon: Mic, title: "Speaking", tag: "AI examiner",
    body: "A 15-minute mock with a friendly AI examiner. Hear back pronunciation, fluency and lexical resource — every word transcribed.",
    img: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=70",
    accent: "from-emerald-200/60 to-emerald-50",
  },
  {
    icon: Radio, title: "Spik Buddy", tag: "1-to-1 · 5s match",
    body: "Paired one-to-one with another IELTS candidate over end-to-end encrypted voice, video or chat. Add friends, schedule mocks, run real Part 2 cue cards.",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=70",
    accent: "from-rose-200/60 to-rose-50",
  },
  {
    icon: ClipboardCheck, title: "Mock Tests", tag: "Full-length · timed",
    body: "Sit a real 2h 45m mock, examiner-graded across all four skills. The best way to dial in your test-day pacing.",
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=70",
    accent: "from-cyan-200/60 to-cyan-50",
  },
  {
    icon: Library, title: "Vocabulary", tag: "Band-9 collocations",
    body: "Topic packs and collocations that actually appear in IELTS — spaced-repetition built-in so you remember on test day.",
    img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=70",
    accent: "from-indigo-200/60 to-indigo-50",
  },
];

export function HorizontalShowcase() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["3%", "-78%"]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative" style={{ height: `${cards.length * 75}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden bg-secondary/40">
        <div className="absolute inset-0 -z-10 grid-bg opacity-30" />
        <div className="absolute -left-40 top-1/3 -z-10 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 bottom-1/3 -z-10 h-[28rem] w-[28rem] rounded-full bg-teal/10 blur-3xl" />

        <div className="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-6 px-6 md:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Seven modules · one system</p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight md:text-5xl">
              Scroll across the entire <span className="text-flow-gradient">IELTS curriculum.</span>
            </h2>
          </div>
          <div className="hidden text-right text-xs font-mono uppercase tracking-widest text-muted-foreground md:block">
            ← scroll vertically →<br/>cards move sideways
          </div>
        </div>

        <motion.div style={{ x }} className="flex gap-6 px-6 md:px-8">
          {cards.map(({ icon: Icon, title, tag, body, img, accent }, idx) => (
            <article
              key={title}
              className={`group relative flex h-[62vh] w-[82vw] shrink-0 flex-col justify-between overflow-hidden rounded-[2rem] border bg-gradient-to-br ${accent} p-10 md:w-[42vw]`}
            >
              {/* image as ambient backdrop */}
              <div className="absolute inset-0 -z-10">
                <img src={img} alt="" loading="lazy" className="h-full w-full object-cover opacity-[0.14] transition duration-700 group-hover:opacity-25" />
              </div>
              <div className="absolute -right-12 -top-12 h-60 w-60 rounded-full bg-white/50 blur-3xl" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-foreground shadow-sm backdrop-blur">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-foreground/10 bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground/70 backdrop-blur">{tag}</span>
                </div>
                <h3 className="mt-8 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/75">{body}</p>
              </div>

              <div className="relative mt-8 flex items-center justify-between text-xs font-semibold text-foreground/60">
                <span className="rounded-full bg-white/70 px-3 py-1 backdrop-blur">Module {String(idx + 1).padStart(2, "0")}</span>
                <span className="font-mono">{String(idx + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}</span>
              </div>
            </article>
          ))}
        </motion.div>

        <div className="mx-auto mt-10 flex max-w-7xl items-center gap-3 px-6 md:px-8">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/10">
            <motion.div style={{ width: progressWidth }} className="h-full rounded-full bg-gradient-to-r from-primary to-teal" />
          </div>
          <span className="font-mono text-xs text-muted-foreground">scroll →</span>
        </div>
      </div>
    </section>
  );
}
