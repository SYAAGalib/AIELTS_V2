import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Flag, Ban, Activity, Users, Settings2, Bot, ShieldAlert, Eye, Filter, Search, MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/live")({
  head: () => ({
    meta: [
      { title: "Live System — AIELTS Admin" },
      { name: "description", content: "Monitor live AIELTS sessions, moderation queues, and system health." },
      { property: "og:title", content: "Live System — AIELTS Admin" },
      { property: "og:description", content: "Monitor live AIELTS sessions, moderation queues, and system health." },
      { property: "og:url", content: "/admin/live" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLive,
});

const STATS = [
  { label: "Live sessions", value: "1,284", delta: "+12%" },
  { label: "Active matchmaking", value: "873", delta: "+4%" },
  { label: "Open reports", value: "26", delta: "−18%" },
  { label: "Banned today", value: "11", delta: "+2" },
];

const LIVE_DATA = Array.from({ length: 24 }).map((_, i) => ({ h: `${i}h`, video: 200 + Math.round(Math.sin(i / 2) * 80 + Math.random() * 60), voice: 120 + Math.round(Math.cos(i / 3) * 50 + Math.random() * 40) }));
const REPORT_DATA = [
  { t: "Harassment", v: 42 },
  { t: "Spam", v: 31 },
  { t: "Inappropriate", v: 27 },
  { t: "Fake profile", v: 14 },
  { t: "Abuse", v: 9 },
];

const REPORTS = [
  { id: "r1", from: "user_8421", against: "user_2271", type: "Harassment", time: "2m", status: "Open" },
  { id: "r2", from: "user_4419", against: "user_7720", type: "Spam", time: "12m", status: "Open" },
  { id: "r3", from: "user_1102", against: "user_3398", type: "Inappropriate", time: "1h", status: "Reviewed" },
  { id: "r4", from: "user_2390", against: "user_5512", type: "Fake profile", time: "3h", status: "Open" },
];

function AdminLive() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--teal)]">Live System</p>
          <h1 className="font-display text-3xl font-bold">Matchmaking, communication & safety</h1>
          <p className="text-sm text-white/60">Monitor live sessions, enforce policy, and tune AI moderation.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10"><Eye className="mr-1.5 h-4 w-4" />Live monitor</Button>
          <Button size="sm" className="bg-[var(--teal)] text-slate-900 hover:bg-[var(--teal)]/90"><Settings2 className="mr-1.5 h-4 w-4" />Configure</Button>
        </div>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-white/50">{s.label}</p>
                <p className="mt-1.5 font-display text-3xl font-bold">{s.value}</p>
                <p className="mt-1 text-xs text-emerald-300">{s.delta} vs yesterday</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="reports" className="space-y-5">
        <TabsList className="bg-white/5">
          <TabsTrigger value="reports"><Flag className="mr-1.5 h-4 w-4" />Reports</TabsTrigger>
          <TabsTrigger value="sessions"><Activity className="mr-1.5 h-4 w-4" />Sessions</TabsTrigger>
          <TabsTrigger value="rules"><Filter className="mr-1.5 h-4 w-4" />Match rules</TabsTrigger>
          <TabsTrigger value="moderation"><ShieldAlert className="mr-1.5 h-4 w-4" />AI Moderation</TabsTrigger>
          <TabsTrigger value="buddy"><Bot className="mr-1.5 h-4 w-4" />IELTS Buddy</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Open reports</CardTitle>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1">
                  <Search className="h-4 w-4 text-white/50" />
                  <input placeholder="Search reports…" className="w-56 bg-transparent text-sm outline-none placeholder:text-white/40" />
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-white/40">
                    <tr><th className="pb-2">Reporter</th><th>Against</th><th>Type</th><th>Time</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {REPORTS.map((r) => (
                      <tr key={r.id} className="hover:bg-white/5">
                        <td className="py-3 font-mono text-xs">{r.from}</td>
                        <td className="font-mono text-xs">{r.against}</td>
                        <td><Badge variant="outline" className="border-amber-400/40 text-amber-300">{r.type}</Badge></td>
                        <td className="text-white/60">{r.time} ago</td>
                        <td><Badge variant={r.status === "Open" ? "default" : "secondary"}>{r.status}</Badge></td>
                        <td className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">Review</Button>
                            <Button size="sm" variant="destructive"><Ban className="mr-1 h-3.5 w-3.5" />Ban</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader><CardTitle className="text-base">Reports by category (30d)</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REPORT_DATA} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <YAxis type="category" dataKey="t" stroke="rgba(255,255,255,0.6)" fontSize={11} width={90} />
                    <Tooltip contentStyle={{ background: "#0B1224", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                    <Bar dataKey="v" fill="#14B8A6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Concurrent sessions (last 24h)</CardTitle>
              <div className="flex gap-2 text-xs text-white/60">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#14B8A6]" />Video</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#6366F1]" />Voice</span>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={LIVE_DATA}>
                  <defs>
                    <linearGradient id="aV" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14B8A6" stopOpacity={0.6} /><stop offset="100%" stopColor="#14B8A6" stopOpacity={0} /></linearGradient>
                    <linearGradient id="aA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366F1" stopOpacity={0.6} /><stop offset="100%" stopColor="#6366F1" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <XAxis dataKey="h" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#0B1224", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                  <Area dataKey="video" stroke="#14B8A6" fill="url(#aV)" strokeWidth={2} />
                  <Area dataKey="voice" stroke="#6366F1" fill="url(#aA)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules"><MatchRules /></TabsContent>
        <TabsContent value="moderation"><ModerationRules /></TabsContent>
        <TabsContent value="buddy"><BuddyConfig /></TabsContent>
      </Tabs>
    </div>
  );
}

function MatchRules() {
  const [maxWait, setMaxWait] = useState([8]);
  const [bandTol, setBandTol] = useState([1.5]);
  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader><CardTitle className="text-base">Matchmaking algorithm</CardTitle></CardHeader>
      <CardContent className="grid gap-5 md:grid-cols-2">
        <Block label="Default mode">
          <Select defaultValue="video"><SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="voice">Voice</SelectItem><SelectItem value="chat">Chat</SelectItem></SelectContent></Select>
        </Block>
        <Block label="Fallback to global pool"><AdminToggle defaultOn /></Block>
        <Block label={`Max wait time: ${maxWait[0]}s`}><Slider value={maxWait} onValueChange={setMaxWait} min={2} max={30} step={1} /></Block>
        <Block label={`Band score tolerance: ±${bandTol[0]}`}><Slider value={bandTol} onValueChange={setBandTol} min={0.5} max={3} step={0.5} /></Block>
        <Block label="Respect country preference"><AdminToggle defaultOn /></Block>
        <Block label="Respect gender preference"><AdminToggle /></Block>
        <Block label="Require verified email"><AdminToggle defaultOn /></Block>
        <Block label="Pair beginners with mentors"><AdminToggle /></Block>
      </CardContent>
    </Card>
  );
}

function ModerationRules() {
  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader><CardTitle className="text-base">AI auto-moderation</CardTitle></CardHeader>
      <CardContent className="grid gap-5 md:grid-cols-2">
        {[
          ["Nudity detection", "Auto-disconnect on positive detection", true],
          ["Violence detection", "Auto-disconnect + ban after 2 strikes", true],
          ["Hate speech filter", "Block messages + warn user", true],
          ["Spam detection", "Rate-limit repeated messages", true],
          ["Harassment classifier", "Flag for review", true],
          ["Face mask requirement", "Require visible face during video", false],
        ].map(([l, d, on]) => (
          <Block key={l as string} label={l as string} desc={d as string}>
            <AdminToggle defaultOn={Boolean(on)} />
          </Block>
        ))}
        <Block label="Strike threshold for auto-ban">
          <Select defaultValue="3"><SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger><SelectContent>{["2", "3", "5"].map((n) => <SelectItem key={n} value={n}>{n} strikes</SelectItem>)}</SelectContent></Select>
        </Block>
        <Block label="Reviewer escalation queue">
          <Select defaultValue="trust"><SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="trust">Trust & Safety</SelectItem><SelectItem value="senior">Senior moderators</SelectItem></SelectContent></Select>
        </Block>
      </CardContent>
    </Card>
  );
}

function BuddyConfig() {
  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader><CardTitle className="text-base">IELTS Buddy behavior</CardTitle></CardHeader>
      <CardContent className="grid gap-5 md:grid-cols-2">
        <Block label="Persona">
          <Select defaultValue="friendly"><SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="friendly">Friendly tutor</SelectItem><SelectItem value="strict">Strict examiner</SelectItem><SelectItem value="motivational">Motivational coach</SelectItem></SelectContent></Select>
        </Block>
        <Block label="Default join behavior">
          <Select defaultValue="ondemand"><SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ondemand">On user request</SelectItem><SelectItem value="auto">Auto-join speaking mode</SelectItem></SelectContent></Select>
        </Block>
        <Block label="Allow Buddy to score speaking" desc="Generates fluency, coherence, lexical scores"><AdminToggle defaultOn /></Block>
        <Block label="Allow Buddy to suggest vocabulary" desc="Live synonym/antonym suggestions"><AdminToggle defaultOn /></Block>
        <Block label="Allow Buddy to predict bands"><AdminToggle defaultOn /></Block>
        <Block label="Voice playback for feedback"><AdminToggle /></Block>
      </CardContent>
    </Card>
  );
}

function Block({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-medium">{label}</p>
      {desc && <p className="mb-3 text-xs text-white/50">{desc}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function AdminToggle({ defaultOn }: { defaultOn?: boolean }) {
  const [v, setV] = useState(Boolean(defaultOn));
  return <Switch checked={v} onCheckedChange={setV} />;
}
