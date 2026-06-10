import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Layers, HelpCircle, FlaskConical, BookOpen, Activity, PenLine, Mic, Video, Sparkles, CreditCard, ArrowRight,
} from "lucide-react";
import { adminDashboardStats } from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Overview — AIELTS Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminOverview,
});

const TILES: { key: string; label: string; icon: any; to?: string }[] = [
  { key: "profiles", label: "Users", icon: Users, to: "/admin/users" },
  { key: "active_subscriptions", label: "Active subs", icon: CreditCard, to: "/admin/subscriptions" },
  { key: "modules", label: "Modules", icon: Layers, to: "/admin/modules" },
  { key: "questions", label: "Questions", icon: HelpCircle, to: "/admin/questions" },
  { key: "mock_tests", label: "Mock tests", icon: FlaskConical, to: "/admin/mock-tests" },
  { key: "vocabulary", label: "Vocabulary", icon: BookOpen, to: "/admin/vocabulary" },
  { key: "attempts", label: "Attempts", icon: Activity },
  { key: "writing_submissions", label: "Writing subs", icon: PenLine },
  { key: "speaking_ai_sessions", label: "Speaking sessions", icon: Mic, to: "/admin/speaking-ai" },
  { key: "live_sessions", label: "Live sessions", icon: Sparkles, to: "/admin/live" },
  { key: "predictions", label: "Predictions", icon: Sparkles, to: "/admin/predictions" },
  { key: "videos", label: "Videos", icon: Video, to: "/admin/youtube" },
];

function AdminOverview() {
  const stats = useServerFn(adminDashboardStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => stats() });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">Admin</p>
        <h2 className="mt-1 font-display text-3xl font-bold">Overview</h2>
        <p className="text-sm text-white/50">Live counts from the database.</p>
      </div>

      {isLoading ? <p className="text-sm text-white/60">Loading…</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((t) => {
            const value = data?.[t.key] ?? 0;
            const inner = (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition hover:border-[var(--teal)]/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-white/50">{t.label}</p>
                  <t.icon className="h-4 w-4 text-white/40" />
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <p className="font-display text-3xl font-bold">{value.toLocaleString()}</p>
                  {t.to && <ArrowRight className="h-4 w-4 text-white/30" />}
                </div>
              </div>
            );
            return t.to ? <Link key={t.key} to={t.to}>{inner}</Link> : <div key={t.key}>{inner}</div>;
          })}
        </div>
      )}
    </div>
  );
}
