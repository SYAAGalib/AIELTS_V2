import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import { Flame, Trophy, Target, CalendarDays, Mic, PenLine, Video, Calendar, ArrowRight, Shuffle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Overview — AIELTS Dashboard" },
      { name: "description", content: "Daily IELTS progress, recommended drills, and your predicted band at a glance." },
      { property: "og:title", content: "Overview — AIELTS Dashboard" },
      { property: "og:description", content: "Daily IELTS progress, recommended drills, and your predicted band at a glance." },
      { property: "og:url", content: "/dashboard" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Overview,
});

const trend = [
  { w: "W1", band: 6.0 }, { w: "W2", band: 6.5 }, { w: "W3", band: 6.5 },
  { w: "W4", band: 7.0 }, { w: "W5", band: 7.25 }, { w: "W6", band: 7.5 },
  { w: "W7", band: 7.75 }, { w: "W8", band: 8.0 },
];
const moduleUse = [
  { m: "Listening", h: 12 }, { m: "Reading", h: 9 },
  { m: "Writing", h: 7 }, { m: "Speaking", h: 6 },
];

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setV(+(to * (1 - Math.pow(1 - p, 3))).toFixed(to % 1 ? 1 : 0));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span>{v}{suffix}</span>;
}

const stats = [
  { icon: Trophy, label: "Predicted band", value: 8, suffix: ".0", c: "var(--primary)" },
  { icon: Flame,  label: "Day streak",       value: 14, suffix: "", c: "#f97316" },
  { icon: Target, label: "Tasks completed", value: 247, suffix: "", c: "var(--teal)" },
  { icon: CalendarDays, label: "Exam in",   value: 28, suffix: " days", c: "var(--primary)" },
];

const quick = [
  { to: "/dashboard/speaking", icon: Mic, t: "Start Speaking Test", c: "from-[#2563EB] to-[#14B8A6]" },
  { to: "/dashboard/writing",  icon: PenLine, t: "Take Writing Task", c: "from-[#14B8A6] to-[#2563EB]" },
  { to: "/dashboard/videos",   icon: Video, t: "Watch Videos", c: "from-[#2563EB] to-[#7c3aed]" },
  { to: "/dashboard/plan",     icon: Calendar, t: "Continue Study Plan", c: "from-[#14B8A6] to-[#0ea5e9]" },
];

function Overview() {
  const navigate = useNavigate();
  const randomModule = () => {
    const routes = ["/dashboard/listening","/dashboard/reading","/dashboard/writing","/dashboard/speaking"] as const;
    navigate({ to: routes[Math.floor(Math.random()*routes.length)] });
  };
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Welcome back</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Hi Galibi, you're on a 14-day streak 🔥</h2>
        </div>
        <motion.button onClick={randomModule} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40">
          <Shuffle className="h-4 w-4" /> Random module
        </motion.button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.5 }}
            whileHover={{ y: -3, rotateX: 1.5, rotateY: -1.5 }}
            style={{ transformStyle: "preserve-3d" }}
            className="group rounded-2xl border bg-card p-5 transition-shadow hover:shadow-xl hover:shadow-primary/10">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <s.icon className="h-4 w-4 transition group-hover:drop-shadow-[0_0_8px_currentColor]" style={{ color: s.c }} />
            </div>
            <p className="mt-2 font-display text-3xl font-bold">
              <CountUp to={s.value} suffix={s.suffix} />
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quick.map((q, i) => (
          <motion.div key={q.t}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.06 }}>
            <Link to={q.to}
              className={`group flex items-center justify-between rounded-2xl bg-gradient-to-br ${q.c} p-5 text-white shadow-lg shadow-primary/15 transition-transform hover:scale-[1.02]`}>
              <div className="flex items-center gap-3">
                <motion.span whileHover={{ scale: 1.15, rotate: -8 }}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                  <q.icon className="h-5 w-5" />
                </motion.span>
                <span className="font-display text-sm font-semibold">{q.t}</span>
              </div>
              <ArrowRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-1" />
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <h3 className="font-display text-lg font-semibold">Band score trend</h3>
          <p className="text-sm text-muted-foreground">Last 8 weeks</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <defs>
                  <linearGradient id="bandLine" x1="0" x2="1">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--teal)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="w" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis domain={[5, 9]} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="band" stroke="url(#bandLine)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)" }} animationDuration={1800} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="rounded-2xl border bg-card p-6">
          <h3 className="font-display text-lg font-semibold">Module usage</h3>
          <p className="text-sm text-muted-foreground">Hours this month</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={moduleUse}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip cursor={{ fill: "color-mix(in oklab, var(--primary) 6%, transparent)" }}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="h" radius={[10, 10, 0, 0]} animationDuration={1600}>
                  {moduleUse.map((_, i) => <Cell key={i} fill={i % 2 ? "var(--teal)" : "var(--primary)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="rounded-2xl gradient-brand p-6 text-white shadow-xl shadow-primary/20">
        <p className="text-sm opacity-90">AI tutor insight</p>
        <h3 className="mt-2 font-display text-2xl font-bold">You're 0.5 band away from your target.</h3>
        <p className="mt-2 text-sm opacity-90">Focus this week on Writing Task 2 coherence — your Reading and Listening are already at target.</p>
        <Link to="/dashboard/plan" className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-white/90">
          Open coaching plan
        </Link>
      </motion.div>
    </div>
  );
}
