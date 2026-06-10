import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Play, Clock, Sparkles } from "lucide-react";
import { studentListMockTests } from "@/lib/student.functions";

export const Route = createFileRoute("/dashboard/mock-tests")({
  head: () => ({
    meta: [
      { title: "IELTS Mock Tests — AIELTS" },
      { name: "description", content: "Take full-length AI-scored IELTS mock tests." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StudentMockTests,
});

function StudentMockTests() {
  const list = useServerFn(studentListMockTests);
  const { data = [], isLoading } = useQuery({ queryKey: ["student-mock-tests"], queryFn: () => list() });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Mock tests</p>
        <h2 className="mt-1 font-display text-3xl font-bold">Practice under exam conditions</h2>
        <p className="text-sm text-muted-foreground">Full and skill-specific IELTS mock tests, scored by AI.</p>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
       data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-[var(--teal)]" />
          <p className="mt-3 font-semibold">No mock tests available yet</p>
          <p className="mt-1 text-sm text-muted-foreground">New tests will appear here as soon as your instructors publish them.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((t) => (
            <div key={t.id} className="rounded-2xl border bg-card p-5 transition hover:border-[var(--teal)]">
              <div className="flex items-start justify-between">
                <p className="font-display text-lg font-semibold">{t.title}</p>
                {t.is_full_test && <span className="rounded-full border border-[var(--teal)]/40 bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] uppercase text-[var(--teal)]">Full test</span>}
              </div>
              {t.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{t.description}</p>}
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> {t.duration_minutes} min
              </div>
              <button className="mt-4 flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold text-white">
                <Play className="h-4 w-4" /> Start
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
