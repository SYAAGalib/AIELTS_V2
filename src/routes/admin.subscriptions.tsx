import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  DollarSign, Users, TrendingUp, TrendingDown, Percent, Plus, Pencil, Trash2, Search,
  Tag, Crown, Zap, Download, Sparkles, Calendar, AlertTriangle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAllPricingPlans, upsertPricingPlan, deletePricingPlan, type PricingPlan } from "@/lib/pricing.functions";

export const Route = createFileRoute("/admin/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscriptions — AIELTS Admin" },
      { name: "description", content: "Manage AIELTS subscription plans, billing, and customers." },
      { property: "og:title", content: "Subscriptions — AIELTS Admin" },
      { property: "og:description", content: "Manage AIELTS subscription plans, billing, and customers." },
      { property: "og:url", content: "/admin/subscriptions" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminSubsPage,
});

const REVENUE = [
  { m: "Sep", mrr: 18200, arr: 218400 },
  { m: "Oct", mrr: 21500, arr: 258000 },
  { m: "Nov", mrr: 24800, arr: 297600 },
  { m: "Dec", mrr: 27300, arr: 327600 },
  { m: "Jan", mrr: 31100, arr: 373200 },
  { m: "Feb", mrr: 34700, arr: 416400 },
];

const CHURN = [
  { m: "Sep", churn: 4.8, conv: 22 },
  { m: "Oct", churn: 4.2, conv: 27 },
  { m: "Nov", churn: 3.9, conv: 31 },
  { m: "Dec", churn: 3.6, conv: 34 },
  { m: "Jan", churn: 3.3, conv: 38 },
  { m: "Feb", churn: 3.1, conv: 41 },
];

const PLAN_SPLIT = [
  { name: "Free", value: 18420, color: "#94a3b8" },
  { name: "Pro Monthly", value: 4210, color: "#2563EB" },
  { name: "Pro Yearly", value: 1872, color: "#14B8A6" },
  { name: "Trial", value: 612, color: "#f59e0b" },
];

const SUBSCRIBERS = [
  { id: "u1", name: "Galibi Habibi", email: "galibihabibi@example.com", plan: "Pro Yearly", status: "Active", since: "Jan 14, 2026", mrr: 12 },
  { id: "u2", name: "Priya N.", email: "priya@example.com", plan: "Pro Monthly", status: "Active", since: "Feb 02, 2026", mrr: 19 },
  { id: "u3", name: "Aiman M.", email: "aimanmahmud@example.com", plan: "Trial", status: "Trial", since: "Mar 09, 2026", mrr: 0 },
  { id: "u4", name: "Borsha S.", email: "borsha@example.com", plan: "Pro Yearly", status: "Paused", since: "Nov 04, 2025", mrr: 12 },
  { id: "u5", name: "Yusuf K.", email: "yusuf@example.com", plan: "Free", status: "Free", since: "Dec 12, 2025", mrr: 0 },
  { id: "u6", name: "Sammo R.", email: "sammo@example.com", plan: "Pro Monthly", status: "Canceled", since: "Oct 21, 2025", mrr: 0 },
];

type DraftPlan = Omit<PricingPlan, "id"> & { id?: string };

function emptyPlan(): DraftPlan {
  return {
    slug: "",
    name: "",
    description: "",
    price_cents: 0,
    currency: "USD",
    cycle: "monthly",
    per_label: "/mo",
    features: [],
    trial_days: 7,
    cta_label: "Get started",
    highlight: false,
    active: true,
    sort_order: 0,
  };
}

type Coupon = { id: string; code: string; percent: number; uses: number; cap: number; expires: string; active: boolean };
const INITIAL_COUPONS: Coupon[] = [
  { id: "c1", code: "STUDENT50", percent: 50, uses: 312, cap: 1000, expires: "Jun 30, 2026", active: true },
  { id: "c2", code: "LAUNCH30", percent: 30, uses: 884, cap: 1000, expires: "Apr 15, 2026", active: true },
  { id: "c3", code: "WINBACK20", percent: 20, uses: 42, cap: 500, expires: "May 01, 2026", active: false },
];

function AdminSubsPage() {
  return (
    <div className="space-y-8 text-white">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">Monetization</p>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Subscriptions</h1>
          <p className="text-sm text-white/60">Plans, pricing, coupons, revenue & churn — all in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10"><Download className="mr-1.5 h-4 w-4" />Export</Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={DollarSign} label="MRR" value="$34.7k" trend="+11.6%" up />
        <Kpi icon={TrendingUp} label="ARR" value="$416k" trend="+27.4%" up />
        <Kpi icon={Users} label="Active subscribers" value="6,082" trend="+412" up />
        <Kpi icon={Percent} label="Trial → Pro" value="41%" trend="+3pt" up />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-5 bg-white/5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="churn">Churn</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-white/10 bg-white/5 backdrop-blur lg:col-span-2">
              <CardHeader><CardTitle className="text-base text-white">Revenue trend</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer>
                  <AreaChart data={REVENUE}>
                    <defs>
                      <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#ffffff14" />
                    <XAxis dataKey="m" stroke="#ffffff66" />
                    <YAxis stroke="#ffffff66" />
                    <Tooltip contentStyle={{ background: "#0B1224", border: "1px solid #ffffff20", color: "#fff" }} />
                    <Area type="monotone" dataKey="mrr" stroke="#14B8A6" fill="url(#g1)" name="MRR" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur">
              <CardHeader><CardTitle className="text-base text-white">Plan distribution</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={PLAN_SPLIT} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                      {PLAN_SPLIT.map((p) => <Cell key={p.name} fill={p.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0B1224", border: "1px solid #ffffff20", color: "#fff" }} />
                    <Legend wrapperStyle={{ color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader><CardTitle className="text-base text-white">Churn vs trial conversion</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer>
                <BarChart data={CHURN}>
                  <CartesianGrid stroke="#ffffff14" />
                  <XAxis dataKey="m" stroke="#ffffff66" />
                  <YAxis stroke="#ffffff66" />
                  <Tooltip contentStyle={{ background: "#0B1224", border: "1px solid #ffffff20", color: "#fff" }} />
                  <Legend wrapperStyle={{ color: "#fff" }} />
                  <Bar dataKey="churn" fill="#ef4444" name="Churn %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conv" fill="#14B8A6" name="Trial → Pro %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLANS */}
        <TabsContent value="plans"><PlansEditor /></TabsContent>

        {/* COUPONS */}
        <TabsContent value="coupons"><CouponsEditor /></TabsContent>

        {/* SUBSCRIBERS */}
        <TabsContent value="subscribers"><SubscribersTable /></TabsContent>

        {/* CHURN */}
        <TabsContent value="churn"><ChurnPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, trend, up }: { icon: typeof DollarSign; label: string; value: string; trend: string; up?: boolean }) {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--teal)]/15 text-[var(--teal)]"><Icon className="h-5 w-5" /></span>
          <span className={`flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-400" : "text-red-400"}`}>
            {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}{trend}
          </span>
        </div>
        <p className="mt-3 font-display text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/60">{label}</p>
      </CardContent>
    </Card>
  );
}

function PlansEditor() {
  const qc = useQueryClient();
  const fetchPlans = useServerFn(listAllPricingPlans);
  const upsertFn = useServerFn(upsertPricingPlan);
  const deleteFn = useServerFn(deletePricingPlan);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["admin-pricing-plans"],
    queryFn: () => fetchPlans(),
  });

  const [editing, setEditing] = useState<DraftPlan | null>(null);
  const [open, setOpen] = useState(false);
  const [featuresText, setFeaturesText] = useState("");

  const start = (p?: PricingPlan) => {
    const draft: DraftPlan = p ? { ...p } : emptyPlan();
    setEditing(draft);
    setFeaturesText((draft.features ?? []).join("\n"));
    setOpen(true);
  };

  const upsertMutation = useMutation({
    mutationFn: (payload: DraftPlan) => upsertFn({ data: {
      ...(payload.id ? { id: payload.id } : {}),
      slug: payload.slug,
      name: payload.name,
      description: payload.description ?? null,
      price_cents: payload.price_cents,
      currency: payload.currency,
      cycle: payload.cycle as "monthly" | "yearly" | "one_time",
      per_label: payload.per_label ?? null,
      features: payload.features,
      trial_days: payload.trial_days,
      cta_label: payload.cta_label,
      highlight: payload.highlight,
      active: payload.active,
      sort_order: payload.sort_order,
    }}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pricing-plans"] });
      qc.invalidateQueries({ queryKey: ["public-pricing-plans"] });
      toast.success("Plan saved");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pricing-plans"] });
      qc.invalidateQueries({ queryKey: ["public-pricing-plans"] });
      toast.success("Plan deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = (p: PricingPlan, active: boolean) => {
    upsertMutation.mutate({ ...p, active });
  };

  const save = () => {
    if (!editing) return;
    const features = featuresText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!editing.slug || !editing.name) {
      toast.error("Slug and name are required");
      return;
    }
    upsertMutation.mutate({ ...editing, features });
  };

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base text-white">Plans</CardTitle>
        <Button onClick={() => start()}><Plus className="mr-1.5 h-4 w-4" />New plan</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/60">
                <th className="py-2 pr-4">Plan</th><th className="py-2 pr-4">Price</th><th className="py-2 pr-4">Cycle</th><th className="py-2 pr-4">Trial</th><th className="py-2 pr-4">Active</th><th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-white">
              {isLoading && (
                <tr><td colSpan={6} className="py-6 text-center text-white/50"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading…</td></tr>
              )}
              {(plans ?? []).map((p) => (
                <tr key={p.id} className="hover:bg-white/5">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">{p.price_cents === 0 ? <Zap className="h-4 w-4" /> : <Crown className="h-4 w-4 text-[var(--teal)]" />}</span>
                      <div>
                        <p className="font-medium">{p.name}{p.highlight && <span className="ml-2 rounded bg-[var(--teal)]/20 px-1.5 py-0.5 text-[10px] text-[var(--teal)]">Featured</span>}</p>
                        <p className="text-xs text-white/50">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">{p.price_cents === 0 ? "Free" : `${p.currency === "USD" ? "$" : p.currency + " "}${(p.price_cents/100).toFixed(2)}${p.per_label ?? ""}`}</td>
                  <td className="py-3 pr-4 capitalize">{p.cycle.replace("_"," ")}</td>
                  <td className="py-3 pr-4">{p.trial_days} days</td>
                  <td className="py-3 pr-4">
                    <Switch checked={p.active} onCheckedChange={(b) => toggleActive(p, b)} />
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => start(p)}><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Button>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10"
                      onClick={() => { if (confirm(`Delete plan "${p.name}"?`)) deleteMutation.mutate(p.id); }}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit plan" : "New plan"}</DialogTitle>
            <DialogDescription>Configure pricing shown on the public site.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
                <Field label="Slug (URL key)"><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,"") })} placeholder="pro" /></Field>
              </div>
              <Field label="Description"><Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="What does this plan unlock?" /></Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Price (cents)"><Input type="number" value={editing.price_cents} onChange={(e) => setEditing({ ...editing, price_cents: Number(e.target.value) })} /></Field>
                <Field label="Currency"><Input maxLength={3} value={editing.currency} onChange={(e) => setEditing({ ...editing, currency: e.target.value.toUpperCase() })} /></Field>
                <Field label="Per label"><Input value={editing.per_label ?? ""} onChange={(e) => setEditing({ ...editing, per_label: e.target.value })} placeholder="/mo" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Billing cycle">
                  <Select value={editing.cycle} onValueChange={(v) => setEditing({ ...editing, cycle: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one_time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Trial (days)"><Input type="number" value={editing.trial_days} onChange={(e) => setEditing({ ...editing, trial_days: Number(e.target.value) })} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="CTA label"><Input value={editing.cta_label} onChange={(e) => setEditing({ ...editing, cta_label: e.target.value })} /></Field>
                <Field label="Sort order"><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
              </div>
              <Field label="Features (one per line)">
                <Textarea rows={5} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder="Unlimited drills&#10;AI speaking coach" />
              </Field>
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm"><Switch checked={editing.active} onCheckedChange={(b) => setEditing({ ...editing, active: b })} /> Active</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={editing.highlight} onCheckedChange={(b) => setEditing({ ...editing, highlight: b })} /> Highlight as featured</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={upsertMutation.isPending}>
              {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function CouponsEditor() {
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Coupon>({ id: "", code: "", percent: 10, uses: 0, cap: 100, expires: "", active: true });

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base text-white">Coupons & discounts</CardTitle>
        <Button onClick={() => { setDraft({ id: `c${Date.now()}`, code: "", percent: 10, uses: 0, cap: 100, expires: "", active: true }); setOpen(true); }}>
          <Plus className="mr-1.5 h-4 w-4" />New coupon
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => (
            <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[var(--teal)]" />
                  <span className="font-mono text-sm font-bold tracking-wider">{c.code}</span>
                </div>
                <Switch checked={c.active} onCheckedChange={(b) => setCoupons((arr) => arr.map((x) => x.id === c.id ? { ...x, active: b } : x))} />
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{c.percent}% off</p>
              <p className="text-xs text-white/60">Used {c.uses}/{c.cap} · Expires {c.expires}</p>
              <div className="mt-3 flex gap-1">
                <Button size="sm" variant="ghost" className="flex-1 text-white hover:bg-white/10"><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Button>
                <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10" onClick={() => setCoupons((arr) => arr.filter((x) => x.id !== c.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New coupon</DialogTitle><DialogDescription>Discount applied at checkout.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <Field label="Code"><Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} placeholder="STUDENT50" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discount %"><Input type="number" value={draft.percent} onChange={(e) => setDraft({ ...draft, percent: Number(e.target.value) })} /></Field>
              <Field label="Max uses"><Input type="number" value={draft.cap} onChange={(e) => setDraft({ ...draft, cap: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Expires"><Input type="date" onChange={(e) => setDraft({ ...draft, expires: new Date(e.target.value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) })} /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { setCoupons((arr) => [draft, ...arr]); setOpen(false); toast.success("Coupon created"); }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function SubscribersTable() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const rows = useMemo(() => SUBSCRIBERS.filter((s) =>
    (filter === "all" || s.status.toLowerCase() === filter)
    && (s.name.toLowerCase().includes(q.toLowerCase()) || s.email.toLowerCase().includes(q.toLowerCase()))
  ), [q, filter]);

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base text-white">Subscriber list</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <Search className="h-4 w-4 text-white/50" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-56 bg-transparent text-sm outline-none placeholder:text-white/40" />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-36 border-white/10 bg-white/5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/60">
              <th className="py-2 pr-4">User</th><th className="py-2 pr-4">Plan</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Since</th><th className="py-2 pr-4">MRR</th><th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-white">
            {rows.map((s) => (
              <tr key={s.id} className="hover:bg-white/5">
                <td className="py-3 pr-4">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-white/50">{s.email}</p>
                </td>
                <td className="py-3 pr-4">{s.plan}</td>
                <td className="py-3 pr-4"><StatusBadge s={s.status} /></td>
                <td className="py-3 pr-4 text-white/70">{s.since}</td>
                <td className="py-3 pr-4">${s.mrr}</td>
                <td className="py-3 pr-4 text-right">
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">Manage</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    Active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Trial: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Paused: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    Canceled: "bg-red-500/15 text-red-300 border-red-500/30",
    Free: "bg-white/10 text-white/70 border-white/20",
  };
  return <Badge variant="outline" className={map[s] ?? ""}>{s}</Badge>;
}

function ChurnPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-white/10 bg-white/5 backdrop-blur">
        <CardHeader><CardTitle className="text-base text-white">At‑risk subscribers</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y divide-white/10">
            {[
              { n: "Akari S.", r: "Paused 90+ days · last login 31d ago", risk: 92 },
              { n: "Elena R.", r: "Canceled last cycle · no logins", risk: 88 },
              { n: "Marco D.", r: "Skipped 3 sessions · trial ending in 2d", risk: 81 },
              { n: "Chioma O.", r: "Downgraded after 1 month", risk: 76 },
            ].map((r) => (
              <li key={r.n} className="flex items-center justify-between py-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{r.n}</p>
                    <p className="text-xs text-white/60">{r.r}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-amber-300">{r.risk}%</p>
                  <Button size="sm" variant="ghost" className="text-[var(--teal)] hover:bg-white/10">Send winback</Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5 backdrop-blur">
        <CardHeader><CardTitle className="text-base text-white">Winback campaigns</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { n: "20% off for 3 months", sent: 412, conv: "18%" },
            { n: "Free month + study plan", sent: 188, conv: "27%" },
            { n: "Reactivation email series", sent: 1204, conv: "9%" },
          ].map((c) => (
            <div key={c.n} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--teal)]/15 text-[var(--teal)]"><Sparkles className="h-4 w-4" /></span>
                <div>
                  <p className="text-sm font-medium text-white">{c.n}</p>
                  <p className="text-xs text-white/60">Sent {c.sent} · Conv {c.conv}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10"><Calendar className="mr-1.5 h-3.5 w-3.5" />Schedule</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/70">{label}</label>
      {children}
    </div>
  );
}
