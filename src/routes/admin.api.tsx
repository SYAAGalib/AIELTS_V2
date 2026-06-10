import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Copy, Check, KeyRound } from "lucide-react";

export const Route = createFileRoute("/admin/api")({
  head: () => ({
    meta: [
      { title: "API Keys — AIELTS Admin" },
      { name: "description", content: "Manage AIELTS API keys, endpoints, and webhook signing secrets." },
      { property: "og:title", content: "API Keys — AIELTS Admin" },
      { property: "og:description", content: "Manage AIELTS API keys, endpoints, and webhook signing secrets." },
      { property: "og:url", content: "/admin/api" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ApiSettingsPage,
});

const keys = [
  { l: "Production", k: "sk_live_a4f9_•••_28xQ", c: "Aug 12, 2025" },
  { l: "Staging",    k: "sk_test_22b1_•••_kk7P", c: "Jul 02, 2025" },
  { l: "Webhook signing", k: "whsec_8e1d_•••_v9Yc", c: "Jun 18, 2025" },
];
const endpoints = [
  { n: "/v1/score-essay", d: "Score IELTS Writing Task 1 & 2", on: true },
  { n: "/v1/score-speaking", d: "Score IELTS Speaking responses", on: true },
  { n: "/v1/predict-band", d: "Predict overall band score", on: true },
  { n: "/v1/transcribe", d: "Whisper-based speech-to-text", on: false },
  { n: "/v1/grammar-fix", d: "Inline grammar suggestions", on: true },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition ${on ? "bg-[var(--teal)]" : "bg-white/10"}`}>
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function ApiSettingsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [states, setStates] = useState(endpoints.map((e) => e.on));
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">Developer</p>
        <h2 className="mt-1 font-display text-3xl font-bold">API settings</h2>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[var(--teal)]" />
            <h3 className="font-display text-lg font-semibold">API keys</h3>
          </div>
          <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">+ Generate key</button>
        </div>
        <ul>
          {keys.map((k, i) => (
            <motion.li key={k.l}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-4 last:border-0 hover:bg-white/[0.06]">
              <div className="min-w-0">
                <p className="font-medium">{k.l}</p>
                <code className="font-mono text-xs text-white/60">{k.k}</code>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden text-xs text-white/40 sm:block">Created {k.c}</span>
                <button onClick={()=>{ navigator.clipboard?.writeText(k.k); setCopied(k.l); setTimeout(()=>setCopied(null), 1500); }}
                  className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs transition hover:border-[var(--teal)]/50 hover:text-[var(--teal)]">
                  {copied === k.l ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="font-display text-lg font-semibold">Endpoints</h3>
          <p className="text-xs text-white/50">Enable or disable public-facing AI endpoints</p>
        </div>
        <ul>
          {endpoints.map((e, i) => (
            <motion.li key={e.n}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
              className="flex items-center justify-between border-b border-white/5 px-5 py-4 last:border-0">
              <div>
                <code className="font-mono text-sm text-[var(--teal)]">{e.n}</code>
                <p className="text-xs text-white/50">{e.d}</p>
              </div>
              <Toggle on={states[i]} onChange={() => setStates((s) => s.map((v, idx) => idx === i ? !v : v))} />
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
