import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Play, X, ArrowRight, Youtube, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicHomeVideos, type PublicVideo } from "@/lib/homepage.functions";

const fallbackHomeVideos: PublicVideo[] = [];

const tabs = [
  { key: "listening", label: "Listening" },
  { key: "writing", label: "Writing" },
  { key: "speaking", label: "Speaking" },
] as const;
type TabKey = (typeof tabs)[number]["key"];

export function Videos() {
  const fetchFn = useServerFn(listPublicHomeVideos);
  const { data = fallbackHomeVideos } = useQuery({
    queryKey: ["public-home-videos"],
    queryFn: () => fetchFn(),
    placeholderData: fallbackHomeVideos,
    staleTime: 5 * 60_000,
  });
  const [tab, setTab] = useState<TabKey>("listening");
  const [open, setOpen] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const acc: Record<TabKey, PublicVideo[]> = { listening: [], writing: [], speaking: [] };
    data.forEach((v) => {
      const k = (v.skill as TabKey) in acc ? (v.skill as TabKey) : "listening";
      acc[k].push(v);
    });
    return acc;
  }, [data]);

  const current = grouped[tab] ?? [];
  const featured = current[0];
  const rest = current.slice(1, 5);

  return (
    <section id="videos" className="relative overflow-hidden bg-background py-24 md:py-32">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Youtube className="h-3.5 w-3.5 text-red-500" />
              Free YouTube library
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">
              Watch your way to a <span className="text-gradient-brand">band 9</span>.
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              Bite-sized strategy lessons from real test-takers who scored 8.5+. No fluff, no filler — just the exact moves the band-9 crowd uses.
            </p>
          </motion.div>

          <Link
            to="/videos"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-sm font-semibold transition hover:border-primary hover:text-primary"
          >
            Browse full library
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* tabs */}
        <div className="mt-10 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative rounded-full px-5 py-2 text-sm font-medium transition ${
                tab === t.key ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === t.key && (
                <motion.span layoutId="vidTab" className="absolute inset-0 -z-10 rounded-full gradient-brand" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              {t.label}
            </button>
          ))}
        </div>

        {/* featured + grid layout */}
        {current.length === 0 ? (
          <div className="mt-10 grid place-items-center rounded-3xl border border-dashed py-20 text-sm text-muted-foreground">
            New {tabs.find((t) => t.key === tab)?.label} lessons coming soon.
          </div>
        ) : (
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8 grid gap-5 lg:grid-cols-5"
          >
            {/* Featured */}
            {featured && (
              <button
                onClick={() => setOpen(featured.youtube_id)}
                className="group relative col-span-1 overflow-hidden rounded-3xl border bg-card text-left shadow-sm transition hover:shadow-2xl lg:col-span-3"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img src={featured.thumbnail_url} alt={featured.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Featured
                  </div>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-primary shadow-2xl transition-transform duration-300 group-hover:scale-110">
                      <Play className="h-8 w-8 fill-current" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-xs uppercase tracking-wider opacity-80 capitalize">{featured.skill} • Free lesson</p>
                    <h3 className="mt-1 font-display text-xl font-bold leading-tight md:text-2xl">{featured.title}</h3>
                  </div>
                </div>
              </button>
            )}

            {/* Right column small grid */}
            <div className="col-span-1 grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-2">
              {rest.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setOpen(v.youtube_id)}
                  className="group overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={v.thumbnail_url} alt={v.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-primary shadow-lg">
                        <Play className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="line-clamp-2 font-display text-sm font-semibold leading-snug">{v.title}</h4>
                  </div>
                </button>
              ))}
              {rest.length === 0 && (
                <div className="col-span-2 grid place-items-center rounded-2xl border border-dashed py-10 text-xs text-muted-foreground">
                  More {tab} lessons soon.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4"
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 25 }}
              className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setOpen(null)} aria-label="Close video" className="absolute -top-12 right-0 text-white"><X className="h-6 w-6" /></button>
              <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${open}?autoplay=1`} title="Video" allow="autoplay; encrypted-media" allowFullScreen />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
