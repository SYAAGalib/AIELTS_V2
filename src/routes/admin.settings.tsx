import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Palette, Languages, Clock, Lock, Shield, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Platform Settings — AIELTS Admin" },
      { name: "description", content: "Configure global AIELTS platform settings." },
      { property: "og:title", content: "Platform Settings — AIELTS Admin" },
      { property: "og:description", content: "Configure global AIELTS platform settings." },
      { property: "og:url", content: "/admin/settings" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SettingsPage,
});

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`relative h-6 w-11 rounded-full transition ${on ? "bg-[var(--teal)]" : "bg-white/10"}`}>
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Panel({ icon: Icon, title, children, defaultOpen = true }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
      <button onClick={()=>setOpen((o: boolean)=>!o)} className="flex w-full items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[#2563EB]/30 to-[#14B8A6]/30 ring-1 ring-white/10">
            <Icon className="h-4 w-4 text-[var(--teal)]" />
          </div>
          <p className="font-display font-semibold">{title}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-white/60 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
            transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="space-y-4 border-t border-white/10 p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Row({ l, d, right }: { l: string; d?: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm">{l}</p>
        {d && <p className="text-xs text-white/50">{d}</p>}
      </div>
      {right}
    </div>
  );
}

function Select({ opts, defaultValue }: { opts: string[]; defaultValue: string }) {
  return (
    <select defaultValue={defaultValue}
      className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-xs outline-none focus:border-[var(--teal)]">
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function SettingsPage() {
  const [twoFA, setTwoFA] = useState(true);
  const [strict, setStrict] = useState(false);
  const [audit, setAudit] = useState(true);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">Platform</p>
        <h2 className="mt-1 font-display text-3xl font-bold">General settings</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel icon={Palette} title="Appearance">
          <Row l="Theme" d="Dark theme is recommended for admin" right={<Select opts={["Dark","Light","System"]} defaultValue="Dark" />} />
          <Row l="Accent color" d="Used for active state & glows" right={
            <div className="flex gap-2">
              {["#14B8A6","#2563EB","#a78bfa","#f59e0b"].map((c)=>(
                <button key={c} style={{ background:c }} className="h-6 w-6 rounded-full ring-2 ring-white/20 hover:ring-white/60" />
              ))}
            </div>
          } />
        </Panel>

        <Panel icon={Languages} title="Localization">
          <Row l="Language" right={<Select opts={["English","Español","العربية","हिन्दी","中文"]} defaultValue="English" />} />
          <Row l="Date format" right={<Select opts={["YYYY-MM-DD","DD/MM/YYYY","MM/DD/YYYY"]} defaultValue="YYYY-MM-DD" />} />
        </Panel>

        <Panel icon={Clock} title="Timezone & schedule">
          <Row l="Timezone" right={<Select opts={["UTC","Europe/London","America/New_York","Asia/Karachi","Asia/Tokyo"]} defaultValue="UTC" />} />
          <Row l="Weekly digest day" right={<Select opts={["Monday","Friday","Sunday"]} defaultValue="Monday" />} />
        </Panel>

        <Panel icon={Shield} title="Security">
          <Row l="Two-factor auth (2FA)" d="Require TOTP for all admins" right={<Toggle on={twoFA} onChange={()=>setTwoFA(v=>!v)} />} />
          <Row l="Strict password policy" d="Min 12 chars, symbols required" right={<Toggle on={strict} onChange={()=>setStrict(v=>!v)} />} />
          <Row l="Audit log retention" right={<Select opts={["30 days","90 days","1 year","Forever"]} defaultValue="90 days" />} />
          <Row l="Audit logging" right={<Toggle on={audit} onChange={()=>setAudit(v=>!v)} />} />
        </Panel>

        <Panel icon={Lock} title="Password policy" defaultOpen={false}>
          <Row l="Minimum length" right={<Select opts={["8","10","12","16"]} defaultValue="12" />} />
          <Row l="Require uppercase" right={<Toggle on={true} onChange={()=>{}} />} />
          <Row l="Require symbol" right={<Toggle on={true} onChange={()=>{}} />} />
          <Row l="Expire every" right={<Select opts={["Never","60 days","90 days","180 days"]} defaultValue="90 days" />} />
        </Panel>
      </div>
    </div>
  );
}
