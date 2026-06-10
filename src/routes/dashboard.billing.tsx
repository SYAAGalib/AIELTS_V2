import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Check, Sparkles, Crown, Zap, Headphones, Mic, PenLine, BookOpen, Radio, Bot, Brain,
  Library, Download, CreditCard, PauseCircle, X, Gift, Receipt, ChevronRight, Star, Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSubscription, type AddonId } from "@/lib/subscription";

export const Route = createFileRoute("/dashboard/billing")({
  head: () => ({
    meta: [
      { title: "Billing — AIELTS Dashboard" },
      { name: "description", content: "Manage your AIELTS subscription, invoices, and payment methods." },
      { property: "og:title", content: "Billing — AIELTS Dashboard" },
      { property: "og:description", content: "Manage your AIELTS subscription, invoices, and payment methods." },
      { property: "og:url", content: "/dashboard/billing" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BillingPage,
});

type Cycle = "monthly" | "yearly";
type PlanId = "free" | "pro";

const PLAN_FEATURES = [
  { icon: Headphones, label: "Listening — all 4 sections", free: "2 / week · Sec 1–2", pro: "Unlimited · All sections" },
  { icon: BookOpen, label: "Reading — all 3 passages", free: "2 / week · Passage 1", pro: "Unlimited" },
  { icon: PenLine, label: "Writing AI feedback", free: "Grammar + vocab", pro: "Full 4‑criteria + band" },
  { icon: Mic, label: "Speaking with AI examiner", free: "1 / week · basic", pro: "Unlimited · full band" },
  { icon: Library, label: "Vocabulary library", free: "A1–A2 · 10 q/day", pro: "A1–C2 · unlimited + flashcards" },
  { icon: Radio, label: "Spik Buddy", free: "Text only", pro: "Voice + Video + Friends" },
  { icon: Bot, label: "IELTS Buddy", free: "Meanings + grammar", pro: "Full AI tutor + simulator" },
  { icon: Brain, label: "Band prediction engine", free: "—", pro: "Per‑module · time‑to‑goal" },
];

const ADDONS = [
  { id: "speaking", icon: Mic, name: "Speaking Booster Pack", desc: "10 extra speaking sessions with advanced AI + real‑time pronunciation.", price: 9 },
  { id: "writing", icon: PenLine, name: "Writing Booster Pack", desc: "10 extra writing evaluations with deep grammar analysis.", price: 9 },
  { id: "listening", icon: Headphones, name: "Listening Booster Pack", desc: "High‑difficulty Cambridge‑style listening sets.", price: 7 },
  { id: "reading", icon: BookOpen, name: "Reading Booster Pack", desc: "Cambridge‑style reading sets across all 3 passage types.", price: 7 },
  { id: "crash", icon: Rocket, name: "IELTS Crash Course", desc: "7‑day intensive plan, daily tasks, daily speaking & writing evaluation.", price: 29 },
];

const HISTORY = [
  { id: "INV-2402", date: "Feb 14, 2026", amount: "$19.00", plan: "Pro · Monthly", status: "Paid" },
  { id: "INV-2401", date: "Jan 14, 2026", amount: "$19.00", plan: "Pro · Monthly", status: "Paid" },
  { id: "INV-2312", date: "Dec 14, 2025", amount: "$19.00", plan: "Pro · Monthly", status: "Paid" },
  { id: "INV-2311", date: "Nov 14, 2025", amount: "$0.00", plan: "Pro · 7‑day trial", status: "Trial" },
];

function BillingPage() {
  const { state, isPro, trialActive, trialDaysLeft, startTrial, upgrade, cancel, purchaseAddon, hasAddon } = useSubscription();
  const current: PlanId = state.plan === "pro" ? "pro" : "free";
  const [cycle, setCycle] = useState<Cycle>("yearly");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [trialOpen, setTrialOpen] = useState(false);
  const [coupon, setCoupon] = useState("");

  const proMonthly = 19;
  const proYearly = 144; // ~$12/mo
  const proPrice = cycle === "monthly" ? proMonthly : proYearly;
  const savings = Math.round(((proMonthly * 12 - proYearly) / (proMonthly * 12)) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Plans & billing</p>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Unlock your full IELTS potential</h1>
          <p className="text-sm text-muted-foreground">Start free, upgrade when you're ready — cancel anytime.</p>
        </div>
        {isPro && !trialActive ? (
          <Badge className="gap-1 bg-primary/10 px-3 py-1.5 text-primary"><Crown className="h-3.5 w-3.5" /> Pro · active</Badge>
        ) : trialActive ? (
          <Badge className="gap-1 bg-gradient-to-r from-primary/15 to-[var(--teal)]/15 px-3 py-1.5 text-primary"><Sparkles className="h-3.5 w-3.5" /> Trial · {trialDaysLeft}d left</Badge>
        ) : (
          <Button onClick={() => setTrialOpen(true)} disabled={state.trialEverStarted}>
            <Sparkles className="mr-1.5 h-4 w-4" />{state.trialEverStarted ? "Trial used — Upgrade" : "Start 7‑day free trial"}
          </Button>
        )}
      </motion.div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="addons">Add‑ons</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* PLANS */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${cycle === "monthly" ? "font-semibold" : "text-muted-foreground"}`}>Monthly</span>
            <Switch checked={cycle === "yearly"} onCheckedChange={(b) => setCycle(b ? "yearly" : "monthly")} />
            <span className={`text-sm ${cycle === "yearly" ? "font-semibold" : "text-muted-foreground"}`}>Yearly</span>
            <Badge variant="secondary" className="ml-1 text-emerald-600">Save {savings}%</Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <PlanCard
              id="free"
              name="Starter"
              tagline="A free taste of AIELTS — perfect to start."
              price="$0"
              priceSuffix="forever"
              icon={Zap}
              current={current === "free"}
              cta={current === "free" ? "Current plan" : "Downgrade"}
              onSelect={() => {
                if (current === "pro") setCancelOpen(true);
              }}
              bullets={[
                "2 Listening + 2 Reading modules / week",
                "1 Writing + 1 Speaking AI eval / week",
                "Vocabulary A1–A2 · 10 quizzes / day",
                "Text‑only Spik Buddy",
                "Basic IELTS Buddy",
              ]}
              missing={[
                "Section 3/4 listening",
                "Band prediction",
                "Voice / video Live",
                "Full writing band score",
              ]}
            />

            <PlanCard
              id="pro"
              name="Pro"
              tagline="Everything you need to hit your target band."
              price={`$${cycle === "monthly" ? proPrice : Math.round(proYearly / 12)}`}
              priceSuffix={cycle === "monthly" ? "/ month" : "/ month · billed yearly"}
              icon={Crown}
              highlight
              current={current === "pro"}
              cta={current === "pro" ? "You're on Pro" : (state.trialEverStarted ? "Upgrade to Pro" : "Start 7‑day trial")}
              onSelect={() => {
                if (current === "pro") return;
                if (state.trialEverStarted) upgrade(); else setTrialOpen(true);
              }}
              bullets={[
                "Unlimited Listening · all 4 sections",
                "Unlimited Reading · all 3 passages",
                "Unlimited Writing & Speaking with full band",
                "Vocabulary A1–C2 + flashcards + dictionary",
                "Voice + Video + Friends in Spik Buddy",
                "Full IELTS Buddy tutor + band predictor",
                "Time‑to‑goal predictions & weakness detection",
              ]}
              footer={cycle === "yearly" ? `Billed $${proYearly} yearly` : `Billed monthly`}
            />
          </div>

          {/* Comparison table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compare features in detail</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-4">Feature</th>
                    <th className="py-2 pr-4">Free</th>
                    <th className="py-2 pr-4 text-primary">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {PLAN_FEATURES.map((f) => (
                    <tr key={f.label}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2"><f.icon className="h-4 w-4 text-primary" />{f.label}</div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{f.free}</td>
                      <td className="py-3 pr-4 font-medium">{f.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ADDONS */}
        <TabsContent value="addons" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ADDONS.map((a) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="h-full transition hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><a.icon className="h-5 w-5" /></span>
                      <span className="font-display text-xl font-bold">${a.price}</span>
                    </div>
                    <p className="font-semibold">{a.name} {hasAddon(a.id as AddonId) && <Badge variant="secondary" className="ml-1 text-emerald-600">Active</Badge>}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
                    <Button className="mt-4 w-full" variant="outline" disabled={hasAddon(a.id as AddonId)} onClick={() => purchaseAddon(a.id as AddonId)}>
                      {hasAddon(a.id as AddonId) ? "Activated" : "Add to my plan"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* MANAGE */}
        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Current subscription</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 p-4">
                <div className="flex items-center gap-3">
                  <span className={`grid h-12 w-12 place-items-center rounded-xl ${isPro ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}><Crown className="h-6 w-6" /></span>
                  <div>
                    <p className="font-semibold">
                      {isPro ? (trialActive ? `AIELTS Pro — Free trial (${trialDaysLeft}d left)` : "AIELTS Pro — Yearly") : "AIELTS Starter — Free"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {trialActive
                        ? `Trial ends ${new Date(state.trialEndsAt!).toLocaleDateString()} — auto-downgrades to Free`
                        : isPro
                          ? "$144.00/year · next renewal Mar 14, 2026"
                          : "No charge · upgrade anytime"}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className={isPro ? "text-emerald-600" : ""}>{isPro ? (trialActive ? "Trial" : "Active") : "Free"}</Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <ManageAction icon={CreditCard} label="Change payment method" onClick={() => toast("Payment method dialog")} />
                <ManageAction icon={PauseCircle} label="Pause subscription" onClick={() => setPauseOpen(true)} />
                <ManageAction icon={X} label="Cancel subscription" danger onClick={() => setCancelOpen(true)} />
              </div>

              <div className="rounded-xl border p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Gift className="h-4 w-4 text-primary" />Have a coupon?</p>
                <div className="flex gap-2">
                  <Input placeholder="e.g. STUDENT50" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                  <Button onClick={() => coupon ? toast.success("Coupon applied", { description: `Code ${coupon.toUpperCase()} — 50% off next renewal` }) : toast.error("Enter a code")}>Apply</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Payment method</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-14 place-items-center rounded-md bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white">VISA</div>
                <div>
                  <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/27 · Galibi Habibi</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HISTORY */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Billing history</CardTitle>
              <Button variant="outline" size="sm"><Download className="mr-1.5 h-4 w-4" />Export CSV</Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-4">Invoice</th><th className="py-2 pr-4">Date</th><th className="py-2 pr-4">Plan</th><th className="py-2 pr-4">Amount</th><th className="py-2 pr-4">Status</th><th></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {HISTORY.map((h) => (
                    <tr key={h.id} className="hover:bg-muted/40">
                      <td className="py-3 pr-4 font-mono text-xs">{h.id}</td>
                      <td className="py-3 pr-4">{h.date}</td>
                      <td className="py-3 pr-4">{h.plan}</td>
                      <td className="py-3 pr-4 font-medium">{h.amount}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={h.status === "Paid" ? "secondary" : "outline"} className={h.status === "Paid" ? "text-emerald-600" : ""}>{h.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <Button size="sm" variant="ghost"><Receipt className="mr-1.5 h-3.5 w-3.5" />Invoice</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel your Pro subscription?</DialogTitle>
            <DialogDescription>You'll keep Pro access until Mar 14, 2026, then move to Free. Your study history stays safe.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
            You'll lose: band prediction · voice/video Live · unlimited modules · full AI feedback.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep Pro</Button>
            <Button variant="destructive" onClick={() => { cancel(); setCancelOpen(false); }}>
              Cancel anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause dialog */}
      <Dialog open={pauseOpen} onOpenChange={setPauseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause subscription</DialogTitle>
            <DialogDescription>Take a break for up to 3 months — no charges, resume anytime.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            {["1 month", "2 months", "3 months"].map((d) => (
              <button key={d} className="rounded-lg border p-3 text-sm font-medium hover:border-primary hover:bg-primary/5">{d}</button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPauseOpen(false)}>Not now</Button>
            <Button onClick={() => { setPauseOpen(false); toast.success("Subscription paused"); }}>Pause</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trial dialog */}
      <Dialog open={trialOpen} onOpenChange={setTrialOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Start your 7‑day free trial</DialogTitle>
            <DialogDescription>Full Pro access for 7 days. No credit card required to start.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-1.5 text-sm">
            {["Unlimited modules + full AI feedback", "Band prediction & study plan", "Voice/video Spik Buddy", "Full IELTS Buddy tutor"].map((u) => (
              <li key={u} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-500" />{u}</li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrialOpen(false)}>Maybe later</Button>
            <Button onClick={() => { startTrial(); setTrialOpen(false); }}>
              Start trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlanCard({
  id, name, tagline, price, priceSuffix, icon: Icon, highlight, current, cta, onSelect, bullets, missing, footer,
}: {
  id: PlanId; name: string; tagline: string; price: string; priceSuffix: string;
  icon: typeof Crown; highlight?: boolean; current?: boolean; cta: string;
  onSelect: () => void; bullets: string[]; missing?: string[]; footer?: string;
}) {
  return (
    <motion.div whileHover={{ y: -4 }} className={`relative overflow-hidden rounded-2xl border bg-card p-6 ${highlight ? "border-primary shadow-xl shadow-primary/10 ring-1 ring-primary/20" : ""}`}>
      {highlight && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          <Star className="h-3 w-3 fill-current" />Most popular
        </div>
      )}
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${highlight ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-xl font-bold">{name}</p>
          <p className="text-xs text-muted-foreground">{tagline}</p>
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="font-display text-4xl font-bold">{price}</span>
        <span className="text-sm text-muted-foreground">{priceSuffix}</span>
      </div>

      <Button className="mt-5 w-full" size="lg" variant={highlight ? "default" : "outline"} disabled={current} onClick={onSelect}>
        {cta} {!current && <ChevronRight className="ml-1 h-4 w-4" />}
      </Button>

      <ul className="mt-5 space-y-2 text-sm">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-500" /><span>{b}</span></li>
        ))}
      </ul>

      {missing && missing.length > 0 && (
        <div className="mt-4 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="mb-1 font-semibold uppercase tracking-wider">Not included</p>
          <ul className="space-y-1">
            {missing.map((m) => <li key={m} className="flex items-start gap-1.5">· {m}</li>)}
          </ul>
        </div>
      )}
      {footer && <p className="mt-4 text-center text-xs text-muted-foreground">{footer}</p>}
      {id === "pro" && <p className="mt-1 text-center text-[11px] text-emerald-600">7‑day free trial · Cancel anytime</p>}
    </motion.div>
  );
}

function ManageAction({ icon: Icon, label, danger, onClick }: { icon: typeof CreditCard; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex items-center justify-between rounded-xl border p-3 text-sm transition hover:bg-accent ${danger ? "hover:border-destructive hover:text-destructive" : ""}`}>
      <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
