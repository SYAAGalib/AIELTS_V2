import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Filter, Download } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — AIELTS Admin" },
      { name: "description", content: "Generate AIELTS usage, content, and revenue reports." },
      { property: "og:title", content: "Reports — AIELTS Admin" },
      { property: "og:description", content: "Generate AIELTS usage, content, and revenue reports." },
      { property: "og:url", content: "/admin/reports" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ReportsPage,
});

const reports = [
  { d: "Aug 28", t: "User activity", v: "21,308 DAU", a: "+6.7%", k: "activity" },
  { d: "Aug 27", t: "Revenue trend", v: "$3,142", a: "+4.1%", k: "revenue" },
  { d: "Aug 26", t: "Content usage", v: "Listening +18%", a: "+18%", k: "content" },
  { d: "Aug 25", t: "Prediction accuracy", v: "92.4% (Writing)", a: "+1.2%", k: "ai" },
  { d: "Aug 24", t: "Churn risk users", v: "47 flagged", a: "-3", k: "churn" },
  { d: "Aug 23", t: "Mock test completions", v: "1,902", a: "+9.0%", k: "mock" },
  { d: "Aug 22", t: "Speaking sessions", v: "3,418 min avg", a: "+11%", k: "speaking" },
  { d: "Aug 21", t: "Writing submissions", v: "5,206 essays", a: "+7.4%", k: "writing" },
];
const filters = ["All", "Activity", "Revenue", "Content", "AI"];

function ReportsPage() {
  const [filter, setFilter] = useState("All");
  const rows = reports.filter((r) => filter === "All" || r.t.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Insights</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Reports</h2>
        </div>
        <button className="flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold shadow-lg shadow-[var(--teal)]/20 hover:shadow-[var(--teal)]/40 transition-shadow">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur">
        <div className="flex items-center gap-2 px-2 py-1 text-xs text-white/50">
          <Filter className="h-4 w-4" /> Filter by:
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 transition ${
                filter === f ? "bg-[var(--teal)]/20 text-[var(--teal)]" : "text-white/60 hover:bg-white/5"
              }`}>{f}</button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-white/50">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Report</th>
                <th className="px-5 py-3">Value</th>
                <th className="px-5 py-3">Change</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr key={r.t + r.d}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="group border-b border-white/5 last:border-0 transition hover:bg-white/[0.06]">
                  <td className="px-5 py-3 text-white/60">{r.d}</td>
                  <td className="px-5 py-3 font-medium">{r.t}</td>
                  <td className="px-5 py-3 font-display">{r.v}</td>
                  <td className="px-5 py-3"><span className="rounded-full bg-[var(--teal)]/15 px-2 py-0.5 text-xs text-[var(--teal)]">{r.a}</span></td>
                  <td className="px-5 py-3 text-right"><button className="text-xs text-[var(--teal)] opacity-0 transition group-hover:opacity-100">View →</button></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
