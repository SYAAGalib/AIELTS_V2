import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Play, X, Clock } from "lucide-react";
import { studentListVideos } from "@/lib/student.functions";

export const Route = createFileRoute("/dashboard/videos")({
  head: () => ({
    meta: [
      { title: "IELTS Video Lessons — AIELTS" },
      { name: "description", content: "Watch curated IELTS strategy videos." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VideoHub,
});

function VideoHub() {
  const fn = useServerFn(studentListVideos);
  const { data: videos = [], isLoading } = useQuery({ queryKey: ["student-videos"], queryFn: () => fn() });
  const [skill, setSkill] = useState<string>("all");
  const [playing, setPlaying] = useState<any>(null);

  const skills = ["all", ...Array.from(new Set(videos.map((v: any) => v.skill).filter(Boolean)))];
  const list = skill === "all" ? videos : videos.filter((v: any) => v.skill === skill);
  const fmt = (s?: number) => s ? `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}` : "";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Curated library</p>
        <h2 className="mt-1 font-display text-3xl font-bold">Video hub</h2>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {skills.map((s) => (
          <button key={s} onClick={() => setSkill(s)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm capitalize ${skill === s ? "bg-primary text-primary-foreground border-primary" : ""}`}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
       list.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          No videos published yet.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v: any) => (
            <div key={v.id} className="group overflow-hidden rounded-2xl border bg-card">
              <button onClick={() => setPlaying(v)} className="relative block aspect-video w-full overflow-hidden">
                {v.thumbnail_url && <img src={v.thumbnail_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />}
                <div className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-primary shadow-xl"><Play className="h-5 w-5 fill-current" /></div>
                </div>
                {v.duration_seconds && (
                  <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    <Clock className="h-3 w-3" /> {fmt(v.duration_seconds)}
                  </span>
                )}
              </button>
              <div className="p-4">
                <p className="font-display text-sm font-semibold line-clamp-2">{v.title}</p>
                {v.skill && <p className="mt-1 text-xs text-muted-foreground capitalize">{v.skill}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {playing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur" onClick={() => setPlaying(null)}>
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPlaying(null)} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white"><X className="h-4 w-4" /></button>
            <div className="aspect-video">
              {playing.youtube_id ? (
                <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${playing.youtube_id}?autoplay=1`} title={playing.title} allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
              ) : (
                <video className="h-full w-full" src={playing.url} controls autoPlay />
              )}
            </div>
            <div className="bg-card p-4">
              <p className="font-display font-semibold">{playing.title}</p>
              {playing.description && <p className="mt-1 text-xs text-muted-foreground">{playing.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
