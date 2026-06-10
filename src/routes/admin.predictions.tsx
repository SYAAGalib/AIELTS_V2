import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AreaChart, Area, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Sparkles, TrendingUp, AlertTriangle, Flame } from "lucide-react";

export const Route = createFileRoute("/admin/predictions")({
  head: () => ({
    meta: [
      { title: "Predictions — AIELTS Admin" },
      { name: "description", content: "AI-powered admin insights on student band trends and churn risk." },
      { property: "og:title", content: "Predictions — AIELTS Admin" },
      { property: "og:description", content: "AI-powered admin insights on student band trends and churn risk." },
      { property: "og:url", content: "/admin/predictions" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PredictionsPage,
});

const band = Array.from({length:12}).map((_,i)=>({m:`W${i+1}`, v: +(6 + Math.sin(i/2)*0.3 + i*0.07).toFixed(2)}));
const churn = Array.from({length:12}).map((_,i)=>({m:`W${i+1}`, v: Math.round(40 + Math.cos(i/2)*8 + i*0.6)}));
const popular = [
  { t: "Listening — Coastal Architecture", v: "+38%" },
  { t: "Speaking — Travel Memories", v: "+27%" },
  { t: "Writing — Tech & Society", v: "+19%" },
  { t: "Reading — Renewable Energy", v: "+12%" },
];

function PredictionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">AI insights</p>
        <h2 className="mt-1 font-display text-3xl font-bold flex items-center gap-2">
          Predictions <Sparkles className="h-6 w-6 text-[var(--teal)] animate-pulse" />
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--teal)]" />
              <h3 className="font-display text-lg font-semibold">Band score improvement</h3>
            </div>
            <span className="rounded-full bg-[var(--teal)]/15 px-2 py-0.5 text-xs text-[var(--teal)]">forecast +0.6 band</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <AreaChart data={band}>
                <defs>
                  <linearGradient id="predA" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.5}/>
                    <stop offset="100%" stopColor="#14B8A6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="m" stroke="rgba(255,255,255,0.5)" fontSize={12}/>
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} domain={[5.5,7.5]} />
                <Tooltip contentStyle={{background:"#0B1224",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff"}}/>
                <Area type="monotone" dataKey="v" stroke="#14B8A6" fill="url(#predA)" strokeWidth={2.5} animationDuration={1800}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-300" />
              <h3 className="font-display text-lg font-semibold">Subscription churn risk</h3>
            </div>
            <motion.span animate={{ opacity:[1,.5,1] }} transition={{ duration:1.6, repeat:Infinity }}
              className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">47 at risk</motion.span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <LineChart data={churn}>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="m" stroke="rgba(255,255,255,0.5)" fontSize={12}/>
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip contentStyle={{background:"#0B1224",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff"}}/>
                <Line type="monotone" dataKey="v" stroke="#fbbf24" strokeWidth={2.5} dot={{r:4, fill:"#fbbf24"}} animationDuration={1800}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[var(--teal)]" />
            <h3 className="font-display text-lg font-semibold">Content popularity forecast</h3>
          </div>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {popular.map((p, i) => (
              <motion.li key={p.t}
                initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once:true }}
                transition={{ delay: 0.15 + i*0.08 }}
                whileHover={{ y:-2 }}
                animate={{ boxShadow: ["0 0 0 0 rgba(20,184,166,0)", "0 0 0 6px rgba(20,184,166,0.08)", "0 0 0 0 rgba(20,184,166,0)"] }}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm">{p.t}</p>
                <span className="rounded-full bg-[var(--teal)]/15 px-2 py-0.5 text-xs text-[var(--teal)]">{p.v}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
