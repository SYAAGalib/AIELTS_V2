import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { Users, CreditCard, DollarSign, Activity, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Overview — AIELTS" },
      { name: "description", content: "Internal AIELTS admin overview dashboard." },
      { property: "og:title", content: "Admin Overview — AIELTS" },
      { property: "og:description", content: "Internal AIELTS admin overview dashboard." },
      { property: "og:url", content: "/admin" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminOverview,
});

const bandTrend = [
  { m: "Jan", v: 5.8 }, { m: "Feb", v: 6.0 }, { m: "Mar", v: 6.2 },
  { m: "Apr", v: 6.4 }, { m: "May", v: 6.6 }, { m: "Jun", v: 6.9 },
  { m: "Jul", v: 7.1 }, { m: "Aug", v: 7.3 },
];
const moduleUsage = [
  { m: "Listening", v: 32 }, { m: "Reading", v: 28 },
  { m: "Writing", v: 22 }, { m: "Speaking", v: 18 },
];
const subs = [
  { name: "Pro", v: 58, c: "#14B8A6" },
  { name: "Teams", v: 22, c: "#2563EB" },
  { name: "Free", v: 20, c: "#64748B" },
];
const kpis = [
  { icon: Users, l: "Total users", v: "124,802", d: "+8.2%" },
  { icon: CreditCard, l: "Active subs", v: "38,914", d: "+4.1%" },
  { icon: DollarSign, l: "Revenue (MRR)", v: "$86,420", d: "+12.4%" },
  { icon: Activity, l: "Daily active", v: "21,308", d: "+6.7%" },
];

function Card({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -3, rotateX: 1.5, rotateY: -1.5 }}
      style={{ transformStyle: "preserve-3d" }}
      className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition-shadow hover:shadow-2xl hover:shadow-[var(--teal)]/10 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">Overview</p>
        <h2 className="mt-1 font-display text-3xl font-bold">Dashboard</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <Card key={k.l} delay={i * 0.06}>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-white/50">{k.l}</p>
              <k.icon className="h-4 w-4 text-[var(--teal)] drop-shadow-[0_0_8px_var(--teal)]" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold">{k.v}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--teal)]">
              <ArrowUpRight className="h-3 w-3" /> {k.d} vs last month
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" delay={0.1}>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Band score improvement</h3>
            <span className="text-xs text-white/50">Avg per cohort • last 8 mo</span>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <LineChart data={bandTrend}>
                <defs>
                  <linearGradient id="bandLine" x1="0" x2="1">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#14B8A6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="m" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} domain={[5, 8]} />
                <Tooltip contentStyle={{ background: "#0B1224", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }} />
                <Line type="monotone" dataKey="v" stroke="url(#bandLine)" strokeWidth={3} dot={{ r: 4, fill: "#14B8A6" }} animationDuration={2000} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={0.2}>
          <h3 className="font-display text-lg font-semibold">Subscriptions</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={subs} dataKey="v" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4} animationDuration={1600}>
                  {subs.map((s) => <Cell key={s.name} fill={s.c} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0B1224", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }} />
                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-3" delay={0.25}>
          <h3 className="font-display text-lg font-semibold">Module usage</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={moduleUsage}>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="m" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "#0B1224", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }} />
                <Bar dataKey="v" radius={[10, 10, 0, 0]} animationDuration={1600}>
                  {moduleUsage.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? "#14B8A6" : "#2563EB"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
