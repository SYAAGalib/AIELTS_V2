import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSubscription } from "@/lib/subscription";

export type PaywallProps = {
  open: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
  unlocks?: string[];
  missing?: string[];
};

export function Paywall({
  open,
  onClose,
  feature,
  description = "This feature is part of the Pro plan.",
  unlocks = [
    "Unlimited modules across all skills",
    "Full AI feedback + band score",
    "Band prediction & study plan",
    "Spik Buddy — 1-to-1 voice & video matches",
  ],
  missing = ["Locked sections, limited daily quizzes, no band prediction"],
}: PaywallProps) {
  const { isPro } = useSubscription();
  const lastIsPro = useRef(isPro);
  // Auto-dismiss when entitlement flips (trial expires or user upgrades)
  useEffect(() => {
    if (open && isPro !== lastIsPro.current) onClose();
    lastIsPro.current = isPro;
  }, [isPro, open, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <div className="relative bg-gradient-to-br from-primary/15 via-background to-background p-6">
          <button onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Lock className="h-6 w-6" />
          </motion.div>
          <h2 className="text-center font-display text-xl font-bold">Unlock {feature}</h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">{description}</p>

          <div className="mt-5 space-y-2 rounded-xl border bg-background/60 p-4 backdrop-blur">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary"><Sparkles className="h-3.5 w-3.5" /> What you get with Pro</p>
            <ul className="space-y-1.5 text-sm">
              {unlocks.map((u) => (
                <li key={u} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-500" /><span>{u}</span>
                </li>
              ))}
            </ul>
          </div>

          {missing.length > 0 && (
            <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
              <span className="font-semibold">Free plan limits: </span>{missing.join(" · ")}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1" size="lg" onClick={onClose}>
              <Link to="/dashboard/billing">Upgrade to Pro</Link>
            </Button>
            <Button variant="outline" size="lg" onClick={onClose}>Maybe later</Button>
          </div>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">7‑day free trial · Cancel anytime</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* Inline locked-card banner for inline upsells (e.g. on locked Section 3/4) */
export function LockedBanner({ feature, onUpgrade }: { feature: string; onUpgrade?: () => void }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Lock className="h-5 w-5" /></span>
            <div>
              <p className="font-semibold">{feature} is a Pro feature</p>
              <p className="text-sm text-muted-foreground">Upgrade to unlock the full IELTS experience and band prediction.</p>
            </div>
          </div>
          <Button onClick={onUpgrade} asChild={!onUpgrade}>
            {onUpgrade ? <span>Upgrade</span> : <Link to="/dashboard/billing">Upgrade</Link>}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
