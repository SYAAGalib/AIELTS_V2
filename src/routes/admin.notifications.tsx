import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Mail, Bell, Smartphone, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — AIELTS Admin" },
      { name: "description", content: "Configure AIELTS email, push, and system alert notifications." },
      { property: "og:title", content: "Notifications — AIELTS Admin" },
      { property: "og:description", content: "Configure AIELTS email, push, and system alert notifications." },
      { property: "og:url", content: "/admin/notifications" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NotificationsPage,
});

const channels = [
  { i: Mail, t: "Email notifications", d: "Daily digest, marketing, reports" },
  { i: Bell, t: "System alerts", d: "Errors, churn risk, queue overflow" },
  { i: Smartphone, t: "Push notifications", d: "Mobile app push to all admins" },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`relative h-6 w-11 rounded-full transition ${on ? "bg-[var(--teal)]" : "bg-white/10"}`}>
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Dropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const opts = ["Instant", "Hourly", "Daily", "Weekly"];
  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-xs hover:border-[var(--teal)]/50">
        {value} <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={()=>setOpen(false)} />
            <motion.ul
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 z-40 mt-1 min-w-[140px] rounded-lg border border-white/10 bg-[#0B1224] p-1 shadow-2xl">
              {opts.map((o) => (
                <li key={o}>
                  <button onClick={()=>{ onChange(o); setOpen(false); }}
                    className={`block w-full rounded-md px-3 py-1.5 text-left text-xs hover:bg-white/10 ${value===o?"text-[var(--teal)]":""}`}>{o}</button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationsPage() {
  const [on, setOn] = useState([true, true, false]);
  const [freq, setFreq] = useState(["Daily","Instant","Hourly"]);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">Channels</p>
        <h2 className="mt-1 font-display text-3xl font-bold">Notification settings</h2>
      </div>

      <div className="space-y-4">
        {channels.map((c, i) => (
          <motion.div key={c.t}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition hover:border-[var(--teal)]/30">
            <div className="flex items-center gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#2563EB]/30 to-[#14B8A6]/30 ring-1 ring-white/10">
                <c.i className="h-5 w-5 text-[var(--teal)]" />
              </div>
              <div>
                <p className="font-medium">{c.t}</p>
                <p className="text-xs text-white/50">{c.d}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Dropdown value={freq[i]} onChange={(v)=>setFreq(f=>f.map((x,idx)=>idx===i?v:x))} />
              <Toggle on={on[i]} onChange={()=>setOn(s=>s.map((v,idx)=>idx===i?!v:v))} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
