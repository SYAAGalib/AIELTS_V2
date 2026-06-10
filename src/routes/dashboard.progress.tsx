import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Cell,
} from "recharts";

export const Route = createFileRoute("/dashboard/progress")({
  head: () => ({
    meta: [
      { title: "Progress — AIELTS Dashboard" },
      { name: "description", content: "Track band-by-band progress across IELTS skills over time." },
      { property: "og:title", content: "Progress — AIELTS Dashboard" },
      { property: "og:description", content: "Track band-by-band progress across IELTS skills over time." },
      { property: "og:url", content: "/dashboard/progress" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProgressPage,
});

const trend = Array.from({ length: 10 }).map((_, i) => ({ w: `W${i+1}`, v: +(6 + i * 0.18 + (i%2?0.1:-0.05)).toFixed(2) }));
const bySkill = [
  { skill: "Listening", you: 8.0, prev: 7.0 },
  { skill: "Reading", you: 7.5, prev: 6.5 },
  { skill: "Writing", you: 7.0, prev: 6.0 },
  { skill: "Speaking", you: 7.5, prev: 6.5 },
];
const accuracy = [
  { t: "MCQ", v: 88 }, { t: "T/F/NG", v: 76 },
  { t: "Match heads", v: 64 }, { t: "Fill blanks", v: 81 }, { t: "Short ans.", v: 72 },
];
const radar = [
  { k: "Fluency", v: 75 }, { k: "Vocab", v: 82 }, { k: "Grammar", v: 70 },
  { k: "Coherence", v: 78 }, { k: "Pronunciation", v: 88 }, { k: "Accuracy", v: 72 },
];

function Card({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.5 }}
      className={`rounded-2xl border bg-card p-6 ${className}`}>
      {children}
    </motion.div>
  );
}

function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Insights</p>
        <h2 className="mt-1 font-display text-3xl font-bold">Progress</h2>
      </div>

      <Card delay={0.05}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-display text-lg font-semibold">Band score trend</h3>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">+1.8 over 10 weeks</span>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer>
            <LineChart data={trend}>
              <defs>
                <linearGradient id="pTrend" x1="0" x2="1">
                  <stop offset="0%" stopColor="var(--primary)" /><stop offset="100%" stopColor="var(--teal)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="w" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis domain={[5, 9]} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="v" stroke="url(#pTrend)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)" }} animationDuration={2000} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card delay={0.1}>
          <h3 className="font-display text-lg font-semibold">Module-wise improvement</h3>
          <p className="text-sm text-muted-foreground">Current vs 2 months ago</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={bySkill}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="skill" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis domain={[0, 9]} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="prev" fill="color-mix(in oklab, var(--muted-foreground) 30%, transparent)" radius={[6, 6, 0, 0]} animationDuration={1400} />
                <Bar dataKey="you"  fill="var(--primary)" radius={[8, 8, 0, 0]} animationDuration={1600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={0.15}>
          <h3 className="font-display text-lg font-semibold">Accuracy by question type</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={accuracy} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis dataKey="t" type="category" stroke="var(--muted-foreground)" fontSize={12} width={90} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="v" radius={[0, 8, 8, 0]} animationDuration={1800}>
                  {accuracy.map((a, i) => <Cell key={i} fill={a.v < 70 ? "#f59e0b" : i%2 ? "var(--teal)" : "var(--primary)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={0.2} className="lg:col-span-2">
          <h3 className="font-display text-lg font-semibold">Skill breakdown</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <RadarChart data={radar}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="k" stroke="var(--muted-foreground)" fontSize={12} />
                <PolarRadiusAxis stroke="var(--border)" />
                <Radar dataKey="v" stroke="var(--teal)" fill="var(--teal)" fillOpacity={0.4} animationDuration={1800} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
