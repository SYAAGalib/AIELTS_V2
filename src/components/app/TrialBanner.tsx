import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Clock, Lock } from "lucide-react";
import { useSubscription } from "@/lib/subscription";

/** Compact pill shown in the dashboard header. */
export function TrialPill() {
  const { isPro, trialActive, trialCountdown, state } = useSubscription();
  if (state.plan === "pro" && !trialActive) {
    return (
      <Link to="/dashboard/billing" className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/15 md:inline-flex">
        <Crown className="h-3.5 w-3.5" /> Pro
      </Link>
    );
  }
  if (trialActive) {
    return (
      <Link to="/dashboard/billing" className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-primary/15 to-[var(--teal)]/15 px-3 py-1 text-xs font-semibold text-primary hover:brightness-110 md:inline-flex">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Trial</span>
        <span className="tabular-nums">· {trialCountdown}</span>
      </Link>
    );
  }
  if (isPro) return null;
  return (
    <Link to="/dashboard/billing" className="hidden items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background hover:opacity-90 md:inline-flex">
      <Crown className="h-3.5 w-3.5" /> Upgrade
    </Link>
  );
}

/** Full-width banner shown on dashboard pages when in trial or when trial just expired. */
export function TrialBanner() {
  const { isPro, trialActive, trialDaysLeft, trialCountdown, state } = useSubscription();
  const expired = state.trialEverStarted && !!state.trialEndsAt && !trialActive && state.plan !== "pro";

  return (
    <AnimatePresence>
      {trialActive && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-[var(--teal)]/10 px-4 py-2.5 text-sm"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium">Pro trial active</span>
            <span className="text-muted-foreground">· {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left ·</span>
            <span className="font-semibold tabular-nums text-foreground">{trialCountdown}</span>
            <span className="text-muted-foreground">remaining</span>
          </div>
          <Link to="/dashboard/billing" className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
            Continue with Pro
          </Link>
        </motion.div>
      )}
      {!trialActive && !isPro && expired && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm"
        >
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Lock className="h-4 w-4" />
            <span className="font-medium">Trial ended — you're on the Free plan</span>
            <span className="opacity-80">· Locked sections returned · weekly limits in effect</span>
          </div>
          <Link to="/dashboard/billing" className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background hover:opacity-90">
            Upgrade to Pro
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Inline weekly-quota meter, e.g. used on module pages. */
export function UsageMeter({ module, label }: { module: "listening" | "reading" | "speaking" | "writing" | "tasks"; label: string }) {
  const { isPro, remaining, limitFor, state } = useSubscription();
  if (isPro) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <Crown className="h-3.5 w-3.5" /> Unlimited {label}
      </div>
    );
  }
  const used = state.usage[module] ?? 0;
  const lim = limitFor(module);
  const pct = lim === Infinity ? 0 : Math.min(100, (used / lim) * 100);
  const rem = remaining(module);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label} this week</span>
        <span className={rem === 0 ? "font-semibold text-destructive" : "font-semibold text-foreground"}>{used} / {lim}</span>
      </div>
      <div className="h-1.5 w-44 overflow-hidden rounded-full bg-muted">
        <div className={`h-full transition-all ${rem === 0 ? "bg-destructive" : "gradient-brand"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
