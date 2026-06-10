import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Play, Heart, X, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard/videos")({
  head: () => ({
    meta: [
      { title: "IELTS Video Lessons — AIELTS" },
      { name: "description", content: "Watch curated IELTS strategy videos for Listening, Reading, Writing, and Speaking." },
      { property: "og:title", content: "IELTS Video Lessons — AIELTS" },
      { property: "og:description", content: "Watch curated IELTS strategy videos for Listening, Reading, Writing, and Speaking." },
      { property: "og:url", content: "/dashboard/videos" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VideoHub,
});

const cats = ["IELTS", "English Learning", "Spoken English", "My Library"] as const;
type Cat = typeof cats[number];

type Vid = { id: string; title: string; channel: string; dur: string };

const lib: Record<Exclude<Cat, "My Library">, Vid[]> = {
  "IELTS": [
    { id: "dQw4w9WgXcQ", title: "Listening: Map task deep-dive", channel: "AIELTS Coach", dur: "12:08" },
    { id: "3JZ_D3ELwOQ", title: "Writing Task 2 structure", channel: "Band 9 Lab", dur: "18:42" },
    { id: "kJQP7kiw5Fk", title: "Speaking Part 2 templates", channel: "IELTS Daily", dur: "09:54" },
    { id: "M7lc1UVf-VE", title: "Reading: T/F/NG mastery", channel: "AIELTS Coach", dur: "14:21" },
    { id: "L_LUpnjgPso", title: "Common Listening traps", channel: "Band 9 Lab", dur: "07:30" },
  ],
  "English Learning": [
    { id: "ZbZSe6N_BXs", title: "Top 50 advanced collocations", channel: "Fluent Forever", dur: "21:10" },
    { id: "ktvTqknDobU", title: "Connectors that lift your band", channel: "Cambridge English", dur: "11:45" },
    { id: "RgKAFK5djSk", title: "Mastering relative clauses", channel: "Grammar Hero", dur: "16:02" },
    { id: "OPf0YbXqDm0", title: "Pronunciation: minimal pairs", channel: "Rachel's English", dur: "08:19" },
  ],
  "Spoken English": [
    { id: "9bZkp7q19f0", title: "Sound natural in 7 days", channel: "Speak Fluently", dur: "13:55" },
    { id: "fJ9rUzIMcZQ", title: "Fluency hacks that work", channel: "Speak Fluently", dur: "10:08" },
    { id: "CevxZvSJLk8", title: "Conversation starters", channel: "English Addict", dur: "06:22" },
    { id: "y6120QOlsfU", title: "British vs American accent", channel: "Eat Sleep Dream", dur: "12:46" },
  ],
};

function VideoHub() {
  const [cat, setCat] = useState<Cat>("IELTS");
  const [fav, setFav] = useState<Set<string>>(new Set());
  const [playing, setPlaying] = useState<Vid | null>(null);

  const toggleFav = (id: string) =>
    setFav((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const allVids: Vid[] = Object.values(lib).flat();
  const list: Vid[] = cat === "My Library" ? allVids.filter((v) => fav.has(v.id)) : lib[cat];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Curated library</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Video hub</h2>
        </div>
        <p className="text-xs text-muted-foreground">{fav.size} saved</p>
      </div>

      <div className="-mx-2 flex gap-2 overflow-x-auto px-2 no-scrollbar">
        {cats.map((c, i) => (
          <motion.button key={c}
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}
            onClick={() => setCat(c)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
              cat === c ? "text-white" : "text-muted-foreground hover:text-foreground"
            }`}>
            {cat === c && <motion.span layoutId="vh" className="absolute inset-0 -z-10 rounded-full gradient-brand" />}
            {c} {c === "My Library" && fav.size > 0 && <span className={`ml-1 ${cat === c ? "opacity-90" : "text-primary"}`}>· {fav.size}</span>}
          </motion.button>
        ))}
      </div>

      <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto no-scrollbar">
        <motion.div key={cat} className="flex snap-x snap-mandatory gap-5 pb-4">
          {list.length === 0 ? (
            <div className="w-full rounded-2xl border border-dashed bg-card/50 p-10 text-center text-sm text-muted-foreground">
              No saved videos yet — tap the heart on any thumbnail.
            </div>
          ) : list.map((v, i) => (
            <motion.div key={v.id}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="group relative w-72 shrink-0 snap-start overflow-hidden rounded-2xl border bg-card md:w-80">
              <button onClick={() => setPlaying(v)} className="relative block aspect-video w-full overflow-hidden">
                <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-primary shadow-xl"><Play className="h-5 w-5 fill-current" /></div>
                </div>
                <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  <Clock className="h-3 w-3" /> {v.dur}
                </span>
              </button>
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold line-clamp-2">{v.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{v.channel}</p>
                </div>
                <button onClick={() => toggleFav(v.id)}
                  className={`shrink-0 grid h-8 w-8 place-items-center rounded-full border transition ${
                    fav.has(v.id) ? "border-red-300 bg-red-50 text-red-500" : "hover:border-primary/40 hover:text-primary"
                  }`}>
                  <Heart className={`h-4 w-4 ${fav.has(v.id) ? "fill-current" : ""}`} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {playing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur"
            onClick={() => setPlaying(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", damping: 22 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setPlaying(null)} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"><X className="h-4 w-4" /></button>
              <div className="aspect-video">
                <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${playing.id}?autoplay=1`}
                  title={playing.title}
                  allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen />
              </div>
              <div className="bg-card p-4">
                <p className="font-display font-semibold">{playing.title}</p>
                <p className="text-xs text-muted-foreground">{playing.channel}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
