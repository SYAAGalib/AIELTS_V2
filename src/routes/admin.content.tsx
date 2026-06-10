import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Headphones, PenLine, Mic, BookOpen, Video, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/content")({
  head: () => ({
    meta: [
      { title: "Content Library — AIELTS Admin" },
      { name: "description", content: "Manage AIELTS lessons, mock tests, vocabulary, and video content." },
      { property: "og:title", content: "Content Library — AIELTS Admin" },
      { property: "og:description", content: "Manage AIELTS lessons, mock tests, vocabulary, and video content." },
      { property: "og:url", content: "/admin/content" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ContentPage,
});

const items = [
  { t: "Coastal Architecture", c: "Listening", s: "Published", i: Headphones, dur: "32 min" },
  { t: "Tech & Society — Task 2", c: "Writing", s: "Draft", i: PenLine, dur: "—" },
  { t: "Travel Memories cue card", c: "Speaking", s: "Published", i: Mic, dur: "8 min" },
  { t: "Renewable Energy passage", c: "Reading", s: "In review", i: BookOpen, dur: "20 min" },
  { t: "Academic vocab pack", c: "Vocab", s: "Published", i: BookOpen, dur: "—" },
  { t: "YouTube: Band 7 Speaking", c: "Video", s: "Published", i: Video, dur: "14 min" },
];

const stats = [["1,240","Lessons"],["86","Mock tests"],["3,402","Questions"],["192","Drafts"]];

function ContentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Library</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Content management</h2>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10">
            <Upload className="h-4 w-4" /> Upload audio
          </button>
          <button className="rounded-lg gradient-brand px-4 py-2 text-sm font-semibold shadow-lg shadow-[var(--teal)]/20 hover:shadow-[var(--teal)]/50 transition">
            + New lesson
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([v, l], i) => (
          <motion.div key={l} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-wider text-white/50">{l}</p>
            <p className="mt-2 font-display text-3xl font-bold">{v}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <motion.div key={it.t}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
            style={{ transformStyle: "preserve-3d" }}
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition-shadow hover:shadow-2xl hover:shadow-[var(--teal)]/15">
            <div className="flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#2563EB]/30 to-[#14B8A6]/30 ring-1 ring-white/10 transition group-hover:from-[#2563EB]/50 group-hover:to-[#14B8A6]/50">
                <it.i className="h-5 w-5 text-[var(--teal)] transition group-hover:drop-shadow-[0_0_8px_var(--teal)]" />
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${
                it.s === "Published" ? "bg-[var(--teal)]/15 text-[var(--teal)]"
                : it.s === "Draft" ? "bg-white/10 text-white/60"
                : "bg-amber-400/15 text-amber-300"}`}>{it.s}</span>
            </div>
            <p className="mt-4 font-display text-lg font-semibold">{it.t}</p>
            <p className="mt-1 text-xs text-white/50">{it.c} • {it.dur}</p>
            <div className="mt-5 flex items-center justify-between">
              <button className="text-xs text-[var(--teal)] hover:underline">Preview</button>
              <button className="text-xs text-white/60 hover:text-white">Edit →</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
