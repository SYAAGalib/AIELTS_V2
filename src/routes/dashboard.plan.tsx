import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Sparkles } from "lucide-react";
import { studentGetPlan, studentUpsertPlan, studentProgress } from "@/lib/student.functions";

export const Route = createFileRoute("/dashboard/plan")({
  head: () => ({
    meta: [
      { title: "Study plan — AIELTS Dashboard" },
      { name: "description", content: "Your weekly IELTS study plan, generated from your data." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PlanPage,
});

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] as const;

function PlanPage() {
  const get = useServerFn(studentGetPlan);
  const upsert = useServerFn(studentUpsertPlan);
  const pFn = useServerFn(studentProgress);
  const qc = useQueryClient();
  const { data: plan, isLoading } = useQuery({ queryKey: ["my-plan"], queryFn: () => get() });
  const { data: progress } = useQuery({ queryKey: ["student-progress"], queryFn: () => pFn() });

  const gen = useMutation({
    mutationFn: () => {
      const skills = progress?.skills ?? { listening: null, reading: null, writing: null, speaking: null };
      const ranked = ([..."listening reading writing speaking".split(" ")] as Array<keyof typeof skills>).sort((a, b) => (skills[a] ?? 0) - (skills[b] ?? 0));
      const generated = DAYS.map((d, i) => ({
        day: d,
        focus: ranked[i % 4],
        minutes: 45,
        task: `${ranked[i % 4]} practice + review`,
      }));
      return upsert({ data: { plan: { days: generated } } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-plan"] }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const days = (plan?.plan as any)?.days as Array<{ day: string; focus: string; minutes: number; task: string }> | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Plan</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Weekly study plan</h2>
        </div>
        <button onClick={() => gen.mutate()} disabled={gen.isPending}
          className="flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          <Sparkles className="h-4 w-4" /> {plan ? "Regenerate" : "Generate plan"}
        </button>
      </div>

      {!days ? (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
          <Calendar className="mx-auto h-6 w-6 text-[var(--teal)]" />
          <p className="mt-3 font-semibold">No plan for this week yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Generate one based on your current skill levels.</p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
          {days.map((d) => (
            <li key={d.day} className="rounded-2xl border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{d.day}</p>
              <p className="mt-1 font-display text-lg font-bold capitalize">{d.focus}</p>
              <p className="mt-1 text-xs text-muted-foreground">{d.minutes} min</p>
              <p className="mt-2 text-sm">{d.task}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
