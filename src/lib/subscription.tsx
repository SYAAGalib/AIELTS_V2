import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

export type Plan = "free" | "pro";
export type ModuleId = "listening" | "reading" | "speaking" | "writing" | "tasks";
export type AddonId = "speaking" | "writing" | "listening" | "reading" | "crash";

type Usage = Record<ModuleId, number>;

export type SubscriptionState = {
  plan: Plan;
  trialEndsAt: string | null; // ISO
  trialEverStarted: boolean;
  addons: AddonId[];
  weekStart: string; // ISO date (Mon)
  usage: Usage;
};

/** Weekly free quotas. tasks = generic daily/weekly task quota. */
export const FREE_LIMITS: Usage = {
  listening: 2,
  reading: 2,
  speaking: 1,
  writing: 1,
  tasks: 5,
};

/** Add-on packs grant +N uses to a module for the current week. */
const ADDON_BOOST: Partial<Record<AddonId, { module: ModuleId; n: number }>> = {
  listening: { module: "listening", n: 10 },
  reading: { module: "reading", n: 10 },
  speaking: { module: "speaking", n: 10 },
  writing: { module: "writing", n: 10 },
};

const STORAGE_KEY = "aielts.subscription.v1";

function isoWeekStart(d = new Date()): string {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x.toISOString().slice(0, 10);
}

function emptyUsage(): Usage {
  return { listening: 0, reading: 0, speaking: 0, writing: 0, tasks: 0 };
}

function defaultState(): SubscriptionState {
  return {
    plan: "free",
    trialEndsAt: null,
    trialEverStarted: false,
    addons: [],
    weekStart: isoWeekStart(),
    usage: emptyUsage(),
  };
}

function load(): SubscriptionState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = { ...defaultState(), ...JSON.parse(raw) } as SubscriptionState;
    // Roll usage on week change
    const cur = isoWeekStart();
    if (parsed.weekStart !== cur) {
      parsed.weekStart = cur;
      parsed.usage = emptyUsage();
    }
    return parsed;
  } catch {
    return defaultState();
  }
}

function save(s: SubscriptionState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export type SubscriptionAPI = {
  state: SubscriptionState;
  isPro: boolean;
  trialActive: boolean;
  trialDaysLeft: number;
  trialMsLeft: number;
  trialCountdown: string; // e.g. "6d 23:59:42" or "00:42:09"
  refreshEntitlement: () => Promise<boolean>;
  clearEntitlement: () => Promise<void>;
  hasAddon: (id: AddonId) => boolean;
  limitFor: (m: ModuleId) => number;
  remaining: (m: ModuleId) => number;
  canUse: (m: ModuleId) => boolean;
  recordUse: (m: ModuleId, n?: number) => boolean; // returns success
  startTrial: () => void;
  upgrade: () => void;
  cancel: () => void;
  purchaseAddon: (id: AddonId) => void;
  resetUsage: () => void;
};

const Ctx = createContext<SubscriptionAPI | null>(null);

const CHANNEL_NAME = "aielts.subscription";

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SubscriptionState>(defaultState);
  const [now, setNow] = useState<number>(() => Date.now());
  const downgradedRef = useRef(false);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const localWriteRef = useRef(false);

  // Hydrate after mount (SSR-safe)
  useEffect(() => {
    setState(load());
  }, []);

  // Persist + broadcast across tabs
  useEffect(() => {
    localWriteRef.current = true;
    save(state);
    try { bcRef.current?.postMessage({ type: "state", state }); } catch { /* channel closed */ }
  }, [state]);

  // Cross-tab sync: storage event + BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined") return;
    const bc = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;
    bcRef.current = bc;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const incoming = { ...defaultState(), ...JSON.parse(e.newValue) } as SubscriptionState;
        localWriteRef.current = false;
        setState(incoming);
        setNow(Date.now());
      } catch { /* ignore */ }
    };
    const onMessage = (ev: MessageEvent) => {
      if (ev.data?.type === "state" && ev.data.state) {
        localWriteRef.current = false;
        setState(ev.data.state as SubscriptionState);
        setNow(Date.now());
      }
    };
    window.addEventListener("storage", onStorage);
    bc?.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("storage", onStorage);
      bc?.removeEventListener("message", onMessage);
      bc?.close();
    };
  }, []);


  const trialEndMs = state.trialEndsAt ? new Date(state.trialEndsAt).getTime() : 0;
  const trialMsLeft = Math.max(0, trialEndMs - now);
  const trialActive = trialEndMs > now;
  const isPro = state.plan === "pro" || trialActive;
  const trialDaysLeft = trialEndMs ? Math.max(0, Math.ceil(trialMsLeft / 86_400_000)) : 0;

  const trialCountdown = useMemo(() => {
    if (!trialEndMs) return "";
    const s = Math.floor(trialMsLeft / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return d > 0 ? `${d}d ${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(h)}:${pad(m)}:${pad(sec)}`;
  }, [trialEndMs, trialMsLeft]);

  // Live ticking: 1s while trial active, 60s otherwise (just for week-roll)
  useEffect(() => {
    const interval = trialActive ? 1000 : 60_000;
    const id = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(id);
  }, [trialActive]);

  // Auto-downgrade notice when trial just expired
  useEffect(() => {
    if (downgradedRef.current) return;
    if (state.trialEverStarted && state.trialEndsAt && state.plan !== "pro" && !trialActive) {
      downgradedRef.current = true;
      toast.warning("Your free trial has ended", {
        description: "You're back on the Free plan. Upgrade to keep Pro features.",
      });
    }
  }, [state.trialEverStarted, state.trialEndsAt, state.plan, trialActive]);

  // Roll week if needed while app is open
  useEffect(() => {
    const cur = isoWeekStart();
    if (state.weekStart !== cur) {
      setState((s) => ({ ...s, weekStart: cur, usage: emptyUsage() }));
    }
  }, [state.weekStart]);

  const hasAddon = useCallback((id: AddonId) => state.addons.includes(id), [state.addons]);

  const limitFor = useCallback(
    (m: ModuleId) => {
      if (isPro) return Infinity;
      let base = FREE_LIMITS[m];
      for (const a of state.addons) {
        const boost = ADDON_BOOST[a];
        if (boost && boost.module === m) base += boost.n;
      }
      return base;
    },
    [isPro, state.addons],
  );

  const remaining = useCallback(
    (m: ModuleId) => {
      const lim = limitFor(m);
      if (lim === Infinity) return Infinity;
      return Math.max(0, lim - (state.usage[m] ?? 0));
    },
    [limitFor, state.usage],
  );

  const canUse = useCallback((m: ModuleId) => remaining(m) > 0, [remaining]);

  const recordUse = useCallback(
    (m: ModuleId, n = 1) => {
      if (isPro) return true;
      const lim = limitFor(m);
      const used = state.usage[m] ?? 0;
      if (used + n > lim) return false;
      setState((s) => ({ ...s, usage: { ...s.usage, [m]: (s.usage[m] ?? 0) + n } }));
      return true;
    },
    [isPro, limitFor, state.usage],
  );

  const startTrial = useCallback(() => {
    setState((s) => {
      if (s.trialEverStarted) {
        toast.error("Trial already used", { description: "You've already used your free trial." });
        return s;
      }
      const end = new Date(Date.now() + 7 * 86_400_000).toISOString();
      toast.success("7-day Pro trial started", { description: "Enjoy full access until " + new Date(end).toLocaleDateString() });
      return { ...s, trialEverStarted: true, trialEndsAt: end };
    });
    void (async () => {
      try {
        const mod = await import("./entitlement.functions");
        await mod.startTrialServer();
      } catch { /* ignore */ }
    })();
  }, []);

  const upgrade = useCallback(() => {
    setState((s) => ({ ...s, plan: "pro" }));
    downgradedRef.current = true;
    toast.success("Welcome to Pro", { description: "All modules and features unlocked." });
    void (async () => {
      try {
        const mod = await import("./entitlement.functions");
        await mod.upgradeServer();
      } catch { /* ignore */ }
    })();
  }, []);

  const cancel = useCallback(() => {
    setState((s) => ({ ...s, plan: "free" }));
    toast.info("Subscription canceled", { description: "You're on the Free plan." });
    void (async () => {
      try {
        const mod = await import("./entitlement.functions");
        await mod.cancelServer();
      } catch { /* ignore */ }
    })();
  }, []);

  const purchaseAddon = useCallback((id: AddonId) => {
    setState((s) => (s.addons.includes(id) ? s : { ...s, addons: [...s.addons, id] }));
    toast.success("Add-on activated", { description: `${id} pack added to your account.` });
    void (async () => {
      try {
        const mod = await import("./entitlement.functions");
        await mod.purchaseAddonServer({ data: { id } });
      } catch { /* ignore */ }
    })();
  }, []);

  const resetUsage = useCallback(() => setState((s) => ({ ...s, usage: emptyUsage() })), []);

  const refreshEntitlement = useCallback(async (): Promise<boolean> => {
    try {
      const mod = await import("./entitlement.functions");
      const res = await mod.refreshEntitlement();
      // Reconcile local cache with the server's authoritative view so the
      // UI reflects the real plan/trial/addons (single source of truth).
      try {
        const check = await mod.checkEntitlement();
        setState((s) => ({
          ...s,
          plan: check.plan ?? s.plan,
          trialEndsAt: check.trialEndsAt ? new Date(check.trialEndsAt).toISOString() : null,
          trialEverStarted: check.trialEverStarted || s.trialEverStarted,
          addons: (check.addons as AddonId[]) ?? s.addons,
        }));
      } catch { /* ignore */ }
      return res.pro;
    } catch {
      return false;
    }
  }, []);

  const clearEntitlement = useCallback(async (): Promise<void> => {
    try {
      const mod = await import("./entitlement.functions");
      await mod.clearEntitlement();
    } catch { /* ignore */ }
  }, []);

  // Auto-refresh HttpOnly entitlement cookie whenever plan/trial/addons change,
  // and every ~4 minutes (token TTL is 5 min) while the tab is open.
  useEffect(() => {
    void refreshEntitlement();
    const id = window.setInterval(() => { void refreshEntitlement(); }, 4 * 60_000);
    return () => window.clearInterval(id);
  }, [refreshEntitlement]);

  const value: SubscriptionAPI = {
    state, isPro, trialActive, trialDaysLeft, trialMsLeft, trialCountdown,
    refreshEntitlement, clearEntitlement,
    hasAddon, limitFor, remaining, canUse, recordUse,
    startTrial, upgrade, cancel, purchaseAddon, resetUsage,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSubscription(): SubscriptionAPI {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSubscription must be used within <SubscriptionProvider>");
  return v;
}

/** Convenience: entitlement check for a named pro feature. */
export function useEntitlement(feature: "live-voice" | "live-video" | "band-prediction" | "buddy-tutor" | "speaking-ai" | "writing-ai-full" | "listening-advanced" | "reading-advanced"): boolean {
  const { isPro, hasAddon } = useSubscription();
  if (isPro) return true;
  switch (feature) {
    case "speaking-ai": return hasAddon("speaking");
    case "writing-ai-full": return hasAddon("writing");
    case "listening-advanced": return hasAddon("listening");
    case "reading-advanced": return hasAddon("reading");
    default: return false;
  }
}
