import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, ExternalLink, User as UserIcon, Check } from "lucide-react";
import { studentListLive, studentRegisterLive } from "@/lib/student.functions";

export const Route = createFileRoute("/dashboard/live")({
  head: () => ({
    meta: [
      { title: "Live classes — AIELTS Dashboard" },
      { name: "description", content: "Upcoming live IELTS classes and workshops with instructors." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  const list = useServerFn(studentListLive);
  const reg = useServerFn(studentRegisterLive);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["student-live"], queryFn: () => list() });
  const regM = useMutation({
    mutationFn: (sessionId: string) => reg({ data: { sessionId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student-live"] }),
  });

  const now = Date.now();
  const upcoming = data.filter((s) => new Date(s.scheduled_at).getTime() >= now);
  const past = data.filter((s) => new Date(s.scheduled_at).getTime() < now);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Live</p>
        <h2 className="mt-1 font-display text-3xl font-bold">Live classes</h2>
        <p className="text-sm text-muted-foreground">Join scheduled sessions with IELTS instructors.</p>
      </div>

      <section>
        <h3 className="font-display text-lg font-semibold">Upcoming</h3>
        {isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading…</p> :
         upcoming.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
            No upcoming sessions. Check back soon — your instructors will schedule new classes here.
          </p>
         ) : (
          <ul className="mt-3 grid gap-3">
            {upcoming.map((s) => (
              <SessionCard key={s.id} s={s}
                onRegister={() => regM.mutate(s.id)}
                registering={regM.isPending && regM.variables === s.id}
                registered={regM.isSuccess && regM.variables === s.id}
              />
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h3 className="font-display text-lg font-semibold text-muted-foreground">Past</h3>
          <ul className="mt-3 grid gap-3 opacity-70">
            {past.slice(0, 10).map((s) => <SessionCard key={s.id} s={s} />)}
          </ul>
        </section>
      )}
    </div>
  );
}

function SessionCard({ s, onRegister, registering, registered }: { s: any; onRegister?: () => void; registering?: boolean; registered?: boolean }) {
  const when = new Date(s.scheduled_at);
  return (
    <li className="rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold">{s.title}</p>
          {s.description && <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {when.toLocaleString()}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration_minutes} min</span>
            {s.host_name && <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" /> {s.host_name}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRegister && (
            <button onClick={onRegister} disabled={registering || registered}
              className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold hover:border-primary/40 disabled:opacity-60">
              {registered ? <><Check className="h-3 w-3" /> Registered</> : registering ? "…" : "Register"}
            </button>
          )}
          {s.meeting_url && (
            <a href={s.meeting_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold text-white">
              Join <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
