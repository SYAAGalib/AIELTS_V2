import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Flame, Trophy, Target, CalendarDays, Mic, PenLine, Video, Calendar, ArrowRight, Shuffle } from "lucide-react";
import { studentOverview } from "@/lib/student.functions";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Overview — AIELTS Dashboard" },
      { name: "description", content: "Daily IELTS progress, recommended drills, and your predicted band at a glance." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Overview,
});

const quick = [
  { to: "/dashboard/speaking", icon: Mic, t: "Start Speaking Test" },
  { to: "/dashboard/writing", icon: PenLine, t: "Take Writing Task" },
  { to: "/dashboard/videos", icon: Video, t: "Watch Videos" },
  { to: "/dashboard/plan", icon: Calendar, t: "Continue Study Plan" },
] as const;

function Overview() {
  const navigate = useNavigate();
  const fetchOverview = useServerFn(studentOverview);
  const { data, isLoading } = useQuery({ queryKey: ["student-overview"], queryFn: () => fetchOverview() });

  const name = data?.profile?.display_name ?? "there";
  const streak = data?.streak ?? 0;
  const examDate = data?.profile?.exam_date ? new Date(data.profile.exam_date) : null;
  const daysToExam = examDate ? Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / (24 * 3600 * 1000))) : null;
  const totalTasks = (data?.counts?.attempts ?? 0) + (data?.counts?.writing ?? 0) + (data?.counts?.speaking ?? 0);

  const stats = [
    { icon: Trophy, label: "Predicted band", value: data?.avgBand != null ? data.avgBand.toFixed(1) : "—", c: "var(--primary)" },
    { icon: Flame,  label: "Day streak", value: streak, c: "#f97316" },
    { icon: Target, label: "Tasks completed", value: totalTasks, c: "var(--teal)" },
    { icon: CalendarDays, label: "Exam in", value: daysToExam != null ? `${daysToExam}d` : "—", c: "var(--primary)" },
  ];

  function randomModule() {
    const routes = ["/dashboard/listening","/dashboard/reading","/dashboard/writing","/dashboard/speaking"] as const;
    navigate({ to: routes[Math.floor(Math.random() * routes.length)] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Welcome back</p>
          <h2 className="mt-1 font-display text-3xl font-bold">
            {isLoading ? "Loading your dashboard…" : <>Hi {name}{streak > 0 ? `, you're on a ${streak}-day streak 🔥` : ""}</>}
          </h2>
        </div>
        <motion.button onClick={randomModule} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40">
          <Shuffle className="h-4 w-4" /> Random module
        </motion.button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <s.icon className="h-4 w-4" style={{ color: s.c }} />
            </div>
            <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quick.map((q) => (
          <Link key={q.to} to={q.to} className="group rounded-2xl border bg-card p-5 transition hover:border-[var(--teal)]">
            <q.icon className="h-5 w-5 text-[var(--teal)]" />
            <p className="mt-3 font-semibold">{q.t}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">Open <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" /></p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <h3 className="font-display text-lg font-semibold">Recent attempts</h3>
        {isLoading ? <p className="mt-2 text-sm text-muted-foreground">Loading…</p> :
         !data?.recent?.length ? <p className="mt-2 text-sm text-muted-foreground">No attempts yet — start a practice module to see results here.</p> : (
          <ul className="mt-3 divide-y divide-border">
            {data.recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span className="capitalize">{r.skill ?? "mock"}</span>
                <span className="text-muted-foreground">{r.at ? new Date(r.at).toLocaleDateString() : r.status}</span>
                <span className="font-semibold">{r.band != null ? `Band ${r.band}` : "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
