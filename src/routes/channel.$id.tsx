import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ExternalLink, ListVideo, Play, X, Tv } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { getChannelDetail, type ChannelDetail } from "@/lib/channel-requests.functions";

function formatDuration(s: number | null): string {
  if (!s) return "";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export const Route = createFileRoute("/channel/$id")({
  head: () => ({
    meta: [
      { title: "Channel — AIELTS Video Library" },
      { name: "description", content: "All videos and playlists from this English / IELTS channel, curated on AIELTS." },
    ],
  }),
  component: ChannelPage,
});

function ChannelPage() {
  const { id } = Route.useParams();
  const fetchDetail = useServerFn(getChannelDetail);
  const { data, isLoading } = useQuery({
    queryKey: ["channel", id],
    queryFn: () => fetchDetail({ data: { id } }),
    staleTime: 5 * 60_000,
  });

  const [open, setOpen] = useState<ChannelDetail["videos"][number] | null>(null);
  const [playlist, setPlaylist] = useState<ChannelDetail["playlists"][number] | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden pt-28 pb-8 md:pt-32">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[24rem] w-[56rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <Link to="/videos" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back to video library
          </Link>
          {isLoading || !data ? (
            <div className="mt-6 h-16 animate-pulse rounded-xl bg-card" />
          ) : (
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Tv className="h-3 w-3 text-primary" /> {data.source.kind} • {data.source.default_skill}
                </div>
                <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">{data.source.label}</h1>
                <p className="text-sm text-muted-foreground">
                  {data.videos.length} lesson{data.videos.length === 1 ? "" : "s"} • {data.playlists.length} playlist{data.playlists.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" className="rounded-full">
                  <a
                    href={
                      data.source.kind === "channel"
                        ? `https://www.youtube.com/channel/${data.source.source_id}`
                        : `https://www.youtube.com/playlist?list=${data.source.source_id}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit on YouTube <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        {/* Playlists */}
        {data && data.playlists.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 font-display text-xl font-bold md:text-2xl">Playlists</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.playlists.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlaylist(p)}
                  className="group overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition hover:shadow-xl"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {p.thumbnail_url ? (
                      <img src={p.thumbnail_url} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-muted">
                        <ListVideo className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white">
                      <ListVideo className="h-3 w-3" /> {p.item_count}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug">{p.title}</h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        <h2 className="mb-4 font-display text-xl font-bold md:text-2xl">All videos</h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-video animate-pulse rounded-2xl bg-card" />
            ))}
          </div>
        ) : !data || data.videos.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-dashed py-16 text-center">
            <p className="font-display text-lg font-semibold">No videos synced yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back soon — this channel is queued for sync.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.videos.map((v, i) => (
              <motion.button
                key={v.id}
                onClick={() => setOpen(v)}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: Math.min(i * 0.015, 0.25), duration: 0.3 }}
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
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug">{v.title}</h3>
                </div>
              </motion.button>
            ))}
          </div>
        )}
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
              <button onClick={() => setOpen(null)} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80">
                <X className="h-4 w-4" />
              </button>
              <div className="aspect-video w-full bg-black">
                <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${open.youtube_id}?autoplay=1`} title={open.title} allow="autoplay; encrypted-media" allowFullScreen />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold">{open.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}

        {playlist && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setPlaylist(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setPlaylist(null)} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80">
                <X className="h-4 w-4" />
              </button>
              <div className="aspect-video w-full bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/videoseries?list=${playlist.id}`}
                  title={playlist.title}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold">{playlist.title}</h3>
                <p className="text-xs text-muted-foreground">{playlist.item_count} videos</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
