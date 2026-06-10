import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminListSpeakingSessions } from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/speaking-ai")({
  head: () => ({ meta: [{ title: "Speaking AI — AIELTS Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: SpeakingAdmin,
});

function SpeakingAdmin() {
  const list = useServerFn(adminListSpeakingSessions);
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-speaking"], queryFn: () => list() });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Speaking AI sessions</h2>
        <p className="text-sm text-white/50">Recent student speaking practice sessions scored by the AI examiner.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">Sessions ({data.length})</div>
        {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> :
         data.length === 0 ? <p className="p-6 text-sm text-white/60">No speaking sessions yet.</p> : (
          <ul className="divide-y divide-white/5">
            {data.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{s.topic ?? "Untitled session"}</p>
                  <p className="text-xs text-white/50">{new Date(s.created_at).toLocaleString()} · user {s.user_id.slice(0,8)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {s.score != null && <span className="rounded bg-[var(--teal)]/15 px-2 py-1 text-xs font-semibold text-[var(--teal)]">Band {s.score}</span>}
                  {s.audio_url && <a href={s.audio_url} target="_blank" rel="noreferrer" className="rounded-md border border-white/15 px-3 py-1 text-xs hover:bg-white/10">Audio</a>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
