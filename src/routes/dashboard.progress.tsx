import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { studentProgress } from "@/lib/student.functions";

export const Route = createFileRoute("/dashboard/progress")({
  head: () => ({
    meta: [
      { title: "Progress — AIELTS Dashboard" },
      { name: "description", content: "Track your IELTS band progression across all four skills." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const fn = useServerFn(studentProgress);
  const { data, isLoading } = useQuery({ queryKey: ["student-progress"], queryFn: () => fn() });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const { skills, counts, timeline } = data;
  const chartData = timeline.map((p, i) => ({ name: `#${i + 1}`, band: p.v }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Progress</p>
        <h2 className="mt-1 font-display text-3xl font-bold">Your band progression</h2>
        <p className="text-sm text-muted-foreground">Live averages across attempts, writing submissions, and speaking sessions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {(["listening","reading","writing","speaking"] as const).map((k) => (
          <div key={k} className="rounded-2xl border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{k}</p>
            <p className="mt-1 font-display text-3xl font-bold text-primary">{skills[k] ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{counts[k]} attempts</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <p className="font-display text-lg font-semibold">Band trend</p>
        {chartData.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Submit attempts to see your trend.</p>
        ) : (
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis domain={[4, 9]} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="band" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
