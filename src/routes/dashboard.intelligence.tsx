import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { studentProgress, studentOverview } from "@/lib/student.functions";
import { Brain, TrendingUp, Target } from "lucide-react";

export const Route = createFileRoute("/dashboard/intelligence")({
  head: () => ({
    meta: [
      { title: "Intelligence — AIELTS Dashboard" },
      { name: "description", content: "AI insights on your IELTS practice patterns and band predictions." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: IntelligencePage,
});

function IntelligencePage() {
  const pFn = useServerFn(studentProgress);
  const oFn = useServerFn(studentOverview);
  const { data: progress } = useQuery({ queryKey: ["student-progress"], queryFn: () => pFn() });
  const { data: overview } = useQuery({ queryKey: ["student-overview"], queryFn: () => oFn() });

  if (!progress || !overview) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const skills = progress.skills;
  const weakest = (["listening","reading","writing","speaking"] as const)
    .map((k) => ({ k, v: skills[k] ?? 0 }))
    .filter((x) => x.v > 0)
    .sort((a, b) => a.v - b.v)[0];
  const strongest = (["listening","reading","writing","speaking"] as const)
    .map((k) => ({ k, v: skills[k] ?? 0 }))
    .filter((x) => x.v > 0)
    .sort((a, b) => b.v - a.v)[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Intelligence</p>
        <h2 className="mt-1 font-display text-3xl font-bold">AI insights</h2>
        <p className="text-sm text-muted-foreground">Pattern detection from your real practice data.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card icon={<Brain className="h-5 w-5" />} label="Predicted band" value={overview.avgBand ?? "—"} />
        <Card icon={<TrendingUp className="h-5 w-5" />} label="Strongest skill" value={strongest ? `${strongest.k} · ${strongest.v}` : "—"} />
        <Card icon={<Target className="h-5 w-5" />} label="Focus next" value={weakest ? `${weakest.k} · ${weakest.v}` : "Practice more"} />
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <p className="font-display text-lg font-semibold">Recommendations</p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {overview.streak === 0 && <li>• Build a streak — practice for just 10 minutes today.</li>}
          {weakest && <li>• Your weakest area is <span className="text-foreground font-medium">{weakest.k}</span>. Add a 20-minute session.</li>}
          {overview.profile?.target_band && overview.avgBand != null &&
            <li>• Target band {overview.profile.target_band}; current avg {overview.avgBand} ({Number(overview.profile.target_band) - overview.avgBand > 0 ? "+" + (Number(overview.profile.target_band) - overview.avgBand).toFixed(1) + " to go" : "on track"}).</li>}
          {progress.timeline.length < 5 && <li>• Submit at least 5 attempts to unlock more accurate predictions.</li>}
        </ul>
      </div>
    </div>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-xs uppercase tracking-wider">{label}</span></div>
      <p className="mt-2 font-display text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}
