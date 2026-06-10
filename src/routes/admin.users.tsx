import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, Ban, ArrowUpCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users — AIELTS Admin" },
      { name: "description", content: "Manage AIELTS student accounts and access." },
      { property: "og:title", content: "Users — AIELTS Admin" },
      { property: "og:description", content: "Manage AIELTS student accounts and access." },
      { property: "og:url", content: "/admin/users" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UsersPage,
});

const all = Array.from({ length: 14 }).map((_, i) => ({
  name: ["Priya Sharma","Hassan Khan","Marta Vega","Diego Ramos","Aiko Tanaka","Liam O'Brien","Nadia Hussain","Chen Wei","Sara Ahmed","Tom Becker","Olivia Park","Yuki Mori","Ravi Patel","Mei Lin"][i],
  email: `user${i+1}@aielts.app`,
  plan: ["Pro","Pro","Free","Teams","Pro","Free","Pro","Pro","Teams","Free","Pro","Pro","Teams","Pro"][i],
  status: i % 5 === 0 ? "trial" : i % 7 === 0 ? "banned" : "active",
  last: ["2m ago","12m ago","1h ago","3h ago","yesterday","1d ago","2d ago","3d ago"][i % 8],
}));

function UsersPage() {
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("All");
  const rows = all.filter((r) =>
    (plan === "All" || r.plan === plan) &&
    (r.name.toLowerCase().includes(q.toLowerCase()) || r.email.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">Accounts</p>
        <h2 className="mt-1 font-display text-3xl font-bold">User management</h2>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur">
        <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
          <Search className="h-4 w-4 text-white/40" />
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by name or email…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-white/40" />
        </div>
        <div className="flex gap-1">
          {["All","Pro","Teams","Free"].map((p)=>(
            <button key={p} onClick={()=>setPlan(p)}
              className={`rounded-full px-3 py-1.5 text-xs transition ${
                plan === p ? "bg-[var(--teal)]/20 text-[var(--teal)]" : "text-white/60 hover:bg-white/5"
              }`}>{p}</button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-white/50">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last login</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr key={r.email}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.035 }}
                  className="border-b border-white/5 last:border-0 transition hover:bg-white/[0.06]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-xs font-semibold">
                        {r.name.split(" ").map((w)=>w[0]).slice(0,2).join("")}
                      </div>
                      <p className="font-medium">{r.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white/60">{r.email}</td>
                  <td className="px-5 py-3"><span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{r.plan}</span></td>
                  <td className="px-5 py-3 text-xs">
                    <span className={`rounded-full px-2 py-0.5 ${
                      r.status === "active" ? "bg-[var(--teal)]/15 text-[var(--teal)]"
                      : r.status === "trial" ? "bg-amber-400/15 text-amber-300"
                      : "bg-red-400/15 text-red-300"}`}>{r.status}</span>
                  </td>
                  <td className="px-5 py-3 text-white/60">{r.last}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button title="Upgrade" className="rounded-md p-1.5 text-white/60 transition hover:bg-[var(--teal)]/15 hover:text-[var(--teal)] hover:shadow-[0_0_12px_var(--teal)]">
                        <ArrowUpCircle className="h-4 w-4" />
                      </button>
                      <button title="Ban" className="rounded-md p-1.5 text-white/60 transition hover:bg-red-400/15 hover:text-red-300">
                        <Ban className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
