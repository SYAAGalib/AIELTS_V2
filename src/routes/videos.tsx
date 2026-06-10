import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Search, ArrowRight, ChevronLeft, ChevronRight, Tv, Send, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { getVideoLibrary, type LibraryVideo, type LibraryChannel } from "@/lib/homepage.functions";
import { submitChannelRequest } from "@/lib/channel-requests.functions";

const skillFilters = [
  { key: "all", label: "All" },
  { key: "listening", label: "Listening" },
  { key: "speaking", label: "Speaking" },
  { key: "writing", label: "Writing" },
  { key: "reading", label: "Reading" },
] as const;
type SkillKey = (typeof skillFilters)[number]["key"];

function formatDuration(s: number | null): string {
  if (!s) return "";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Free English & IELTS video library — AIELTS" },
      { name: "description", content: "Hundreds of curated lessons from the best English & IELTS YouTube channels — grouped by channel, searchable, watchable in one place." },
      { property: "og:title", content: "Free English & IELTS video library — AIELTS" },
      { property: "og:description", content: "A mini-YouTube of the best IELTS, speaking, accent and English-learning lessons — no browsing required." },
    ],
    links: [{ rel: "canonical", href: "/videos" }],
  }),
  component: VideosPage,
});

function VideosPage() {
  const fetchFn = useServerFn(getVideoLibrary);
  const { data, isLoading } = useQuery({
    queryKey: ["video-library"],
    queryFn: () => fetchFn(),
    staleTime: 5 * 60_000,
  });

  const [skill, setSkill] = useState<SkillKey>("all");
  const [channelId, setChannelId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<LibraryVideo | null>(null);

  const channels = data?.channels ?? [];
  const videos = data?.videos ?? [];

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return videos.filter((v) => {
      if (skill !== "all" && v.skill !== skill) return false;
      if (channelId && v.source_id !== channelId) return false;
      if (ql && !v.title.toLowerCase().includes(ql) && !v.description.toLowerCase().includes(ql)) return false;
      return true;
    });
  }, [videos, skill, channelId, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, LibraryVideo[]>();
    for (const v of filtered) {
      const key = v.source_id ?? "_other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    return map;
  }, [filtered]);

  const activeChannel = channelId ? channels.find((c) => c.id === channelId) ?? null : null;
  const isBrowsing = channelId !== null || q.trim() !== "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-10 md:pt-32 md:pb-12">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[24rem] w-[56rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 text-center md:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
              <Tv className="h-3.5 w-3.5 text-primary" /> Mini-YouTube for English learners
            </div>
          </motion.div>


          <div className="mx-auto mt-7 flex max-w-xl items-center gap-2 rounded-full border bg-card px-4 py-2 shadow-sm focus-within:border-primary">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search across all channels…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Sticky filters */}
      <div className="sticky top-16 z-30 border-y bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl space-y-2 px-4 py-3 md:px-8">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {skillFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setSkill(f.key)}
                className={`relative shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  skill === f.key ? "text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {skill === f.key && (
                  <motion.span layoutId="vidSkillTab" className="absolute inset-0 -z-10 rounded-full gradient-brand" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                {f.label}
              </button>
            ))}
            <div className="mx-1 self-center text-muted-foreground/40">|</div>
            <button
              onClick={() => setChannelId(null)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                channelId === null ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All channels
            </button>
            {channels.map((c) => (
              <button
                key={c.id}
                onClick={() => setChannelId(c.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  channelId === c.id ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {c.label}
                <span className="ml-1.5 text-[10px] opacity-60">{c.video_count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        {isLoading ? (
          <ChannelRowSkeleton />
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-dashed py-24 text-center">
            <p className="font-display text-xl font-semibold">No lessons match.</p>
            <p className="mt-2 text-sm text-muted-foreground">Try clearing the search or pick a different channel.</p>
            <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setQ(""); setChannelId(null); setSkill("all"); }}>Reset filters</Button>
          </div>
        ) : isBrowsing ? (
          <>
            {activeChannel && (
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">{activeChannel.kind === "channel" ? "Channel" : "Playlist"}</p>
                  <h2 className="font-display text-2xl font-bold md:text-3xl">{activeChannel.label}</h2>
                  <p className="text-sm text-muted-foreground">{filtered.length} lesson{filtered.length === 1 ? "" : "s"}</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="/channel/$id" params={{ id: activeChannel.id }}>
                      Open channel page <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={() => setChannelId(null)} className="rounded-full">
                    <ChevronLeft className="mr-1 h-4 w-4" /> All channels
                  </Button>
                </div>
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((v, i) => (
                <VideoCard key={v.id} v={v} index={i} channelLabel={channels.find((c) => c.id === v.source_id)?.label} onOpen={() => setOpen(v)} />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-12">
            {channels
              .filter((c) => grouped.has(c.id))
              .map((c) => (
                <ChannelRow
                  key={c.id}
                  channel={c}
                  videos={grouped.get(c.id) ?? []}
                  onOpen={(v) => setOpen(v)}
                  onSeeAll={() => setChannelId(c.id)}
                />
              ))}
          </div>
        )}

        <RequestChannelCTA />

        <div className="mt-12 overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background p-8 text-center md:p-14">
          <h3 className="font-display text-2xl font-bold md:text-4xl">
            Watching is great. <span className="text-gradient-brand">Practising is better.</span>
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            Pair these lessons with adaptive drills, instant scoring, and a predicted band — all inside AIELTS.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              <Link to="/register">Start free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <a href="/#features">See features</a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setOpen(null)} aria-label="Close video" className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80">
                <X className="h-4 w-4" />
              </button>
              <div className="aspect-video w-full bg-black">
                <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${open.youtube_id}?autoplay=1`} title={open.title} allow="autoplay; encrypted-media" allowFullScreen />
              </div>
              <div className="space-y-2 p-5 md:p-6">
                <h3 className="font-display text-lg font-bold leading-snug md:text-xl">{open.title}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold uppercase tracking-wider text-primary">{open.skill}</span>
                  {channels.find((c) => c.id === open.source_id) && (
                    <span>{channels.find((c) => c.id === open.source_id)!.label}</span>
                  )}
                  {open.duration_seconds && <span>• {formatDuration(open.duration_seconds)}</span>}
                  {open.published_at && <span>• {formatDate(open.published_at)}</span>}
                </div>
                {open.description && (
                  <p className="max-h-32 overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">{open.description.slice(0, 600)}{open.description.length > 600 ? "…" : ""}</p>
                )}
                <div className="pt-2">
                  <a href={`https://www.youtube.com/watch?v=${open.youtube_id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                    Open on YouTube <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChannelRow({ channel, videos, onOpen, onSeeAll }: { channel: LibraryChannel; videos: LibraryVideo[]; onOpen: (v: LibraryVideo) => void; onSeeAll: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };
  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <Link to="/channel/$id" params={{ id: channel.id }} className="group">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{channel.kind === "channel" ? "Channel" : "Playlist"} • {channel.default_skill}</p>
          <h2 className="font-display text-xl font-bold md:text-2xl group-hover:text-primary transition-colors">{channel.label}</h2>
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={() => scroll(-1)} aria-label="Scroll left" className="hidden h-9 w-9 place-items-center rounded-full border text-muted-foreground transition hover:bg-card hover:text-foreground md:grid">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll(1)} aria-label="Scroll right" className="hidden h-9 w-9 place-items-center rounded-full border text-muted-foreground transition hover:bg-card hover:text-foreground md:grid">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={onSeeAll} className="ml-2 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10">
            See all {channel.video_count} <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 no-scrollbar">
        {videos.slice(0, 12).map((v) => (
          <div key={v.id} className="w-[280px] shrink-0 snap-start md:w-[320px]">
            <VideoCard v={v} onOpen={() => onOpen(v)} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoCard({ v, onOpen, index = 0, channelLabel, compact = false }: { v: LibraryVideo; onOpen: () => void; index?: number; channelLabel?: string; compact?: boolean }) {
  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index * 0.02, 0.25), duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="group block w-full overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition hover:shadow-xl"
    >
      <div className="relative aspect-video overflow-hidden">
        <img src={v.thumbnail_url} alt={v.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-primary shadow-lg">
            <Play className="h-6 w-6 fill-current" />
          </div>
        </div>
        {v.duration_seconds && (
          <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
            {formatDuration(v.duration_seconds)}
          </div>
        )}
        <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white capitalize backdrop-blur">
          {v.skill}
        </div>
      </div>
      <div className={compact ? "p-3" : "p-4"}>
        <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug md:text-base">{v.title}</h3>
        <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">
          {channelLabel ? <span>{channelLabel} • </span> : null}
          {formatDate(v.published_at)}
        </p>
      </div>
    </motion.button>
  );
}

function ChannelRowSkeleton() {
  return (
    <div className="space-y-12">
      {Array.from({ length: 3 }).map((_, r) => (
        <div key={r}>
          <div className="mb-3 h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[280px] shrink-0 overflow-hidden rounded-2xl border bg-card md:w-[320px]">
                <div className="aspect-video animate-pulse bg-muted" />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RequestChannelCTA() {
  const submit = useServerFn(submitChannelRequest);
  const [open, setOpen] = useState(false);
  const [channelInput, setChannelInput] = useState("");
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  const [skill, setSkill] = useState<"listening" | "speaking" | "writing" | "reading">("listening");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (channelInput.trim().length < 3) return;
    setBusy(true);
    try {
      const r = await submit({ data: { channelInput: channelInput.trim(), note: note.trim() || undefined, suggestedSkill: skill, email: email.trim() || undefined } });
      toast.success(r.deduped ? "Already in the review queue — thanks!" : "Thanks! Our team will review your suggestion.");
      setOpen(false);
      setChannelInput(""); setNote(""); setEmail("");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not submit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-16 overflow-hidden rounded-3xl border bg-card p-8 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> Community-curated
          </div>
          <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">Know a great channel we're missing?</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">Suggest any English or IELTS YouTube channel. Our team reviews requests and adds approved ones to the library.</p>
        </div>
        <Button onClick={() => setOpen(true)} size="lg" className="rounded-full">
          <Send className="mr-1.5 h-4 w-4" /> Suggest a channel
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <motion.form onSubmit={handleSubmit} initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }} className="relative w-full max-w-lg space-y-4 rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
              <div>
                <h4 className="font-display text-xl font-bold">Suggest a YouTube channel</h4>
                <p className="text-xs text-muted-foreground">Paste a channel URL, @handle, or channel ID.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Channel URL or @handle <span className="text-destructive">*</span></label>
                <input value={channelInput} onChange={(e) => setChannelInput(e.target.value)} required maxLength={500} placeholder="https://youtube.com/@BBCLearningEnglish" className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Best for</label>
                  <select value={skill} onChange={(e) => setSkill(e.target.value as any)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                    <option value="listening">Listening</option>
                    <option value="speaking">Speaking</option>
                    <option value="writing">Writing</option>
                    <option value="reading">Reading</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Your email <span className="text-muted-foreground">(optional)</span></label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" maxLength={255} placeholder="you@example.com" className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Why this channel? <span className="text-muted-foreground">(optional)</span></label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} placeholder="What makes it great for English learners?" className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={busy || channelInput.trim().length < 3} className="rounded-full">
                  {busy ? "Submitting…" : "Submit suggestion"}
                </Button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
