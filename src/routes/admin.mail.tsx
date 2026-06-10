import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/mail")({
  head: () => ({
    meta: [
      { title: "Email Settings — AIELTS Admin" },
      { name: "description", content: "Configure AIELTS SMTP, transactional mail, and reply-to settings." },
      { property: "og:title", content: "Email Settings — AIELTS Admin" },
      { property: "og:description", content: "Configure AIELTS SMTP, transactional mail, and reply-to settings." },
      { property: "og:url", content: "/admin/mail" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MailSettingsPage,
});

const fields = [
  { l: "SMTP host", p: "smtp.mailgun.org", t: "text" },
  { l: "Port", p: "587", t: "number" },
  { l: "Username", p: "postmaster@aielts.app", t: "text" },
  { l: "Password", p: "••••••••", t: "password" },
  { l: "From address", p: "no-reply@aielts.app", t: "email" },
  { l: "Reply-to", p: "support@aielts.app", t: "email" },
];

function MailSettingsPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const test = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); setTimeout(()=>setSent(false), 2400); }, 1400);
  };
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">SMTP</p>
        <h2 className="mt-1 font-display text-3xl font-bold flex items-center gap-2">
          <Mail className="h-7 w-7 text-[var(--teal)]" /> Mail settings
        </h2>
      </div>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((f, i) => (
            <motion.div key={f.l}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
              <label className="text-xs uppercase tracking-wider text-white/50">{f.l}</label>
              <input type={f.t} placeholder={f.p}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none transition focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--teal)_20%,transparent)]" />
            </motion.div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" defaultChecked className="accent-[var(--teal)]" /> Use TLS / STARTTLS
          </label>
          <div className="flex gap-2">
            <button type="button"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Save</button>
            <button type="button" onClick={test} disabled={sending}
              className="flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold transition hover:shadow-[0_0_24px_var(--teal)] disabled:opacity-60">
              <Send className={`h-4 w-4 ${sending ? "animate-pulse" : ""}`} /> {sending ? "Sending…" : "Send test mail"}
            </button>
          </div>
        </div>
      </motion.form>

      <AnimatePresence>
        {sent && (
          <motion.div initial={{ y:-40, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:-40, opacity:0 }}
            className="fixed top-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--teal)]/30 bg-[#0B1224]/95 px-5 py-2.5 text-sm shadow-2xl backdrop-blur">
            <CheckCircle2 className="h-4 w-4 text-[var(--teal)]" /> Test mail delivered
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
