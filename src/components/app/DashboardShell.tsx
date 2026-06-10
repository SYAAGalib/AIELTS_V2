import { Link, Outlet, useRouter, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, LayoutDashboard, Headphones, Mic, PenLine, BookOpen,
  Video, Calendar, TrendingUp, LogOut, Menu, X, Bell, Search, Settings, ClipboardCheck, Library, Brain, Radio, CreditCard, Home, GraduationCap as Cap, User, ChevronLeft, ChevronRight, Sparkles, Activity,
} from "lucide-react";
import { Suspense, useEffect, useRef, useState, type ComponentType } from "react";
import { recordRouteSample, recordPreload, recordCacheOutcome, getMetrics, computeSummary, resetMetrics } from "@/lib/perf-metrics";
import { IeltsBuddy } from "@/components/app/IeltsBuddy";
import { SubscriptionProvider, useSubscription } from "@/lib/subscription";
import { TrialPill, TrialBanner } from "@/components/app/TrialBanner";
import { BottomNav, type BottomNavItem } from "@/components/app/BottomNav";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listMyNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification,
} from "@/lib/notifications.functions";
import { getMyProfile, setBgAnimationsPref } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";

const studentBottomNav: BottomNavItem[] = [
  { to: "/dashboard", label: "Home", icon: Home, match: (p) => p === "/dashboard" },
  { to: "/dashboard/listening", label: "Practice", icon: Cap, match: (p) => ["/dashboard/listening","/dashboard/reading","/dashboard/writing","/dashboard/vocabulary","/dashboard/mock-tests"].some(x => p.startsWith(x)) },
  { to: "/dashboard/speaking", label: "Speaking", icon: Mic },
  { to: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { to: "/dashboard/settings", label: "Profile", icon: User },
];

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }> };

export const studentNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/listening", label: "Listening", icon: Headphones },
  { to: "/dashboard/speaking", label: "Speaking", icon: Mic },
  { to: "/dashboard/writing", label: "Writing", icon: PenLine },
  { to: "/dashboard/reading", label: "Reading", icon: BookOpen },
  { to: "/dashboard/videos", label: "Videos", icon: Video },
  { to: "/dashboard/live", label: "Spik", icon: Radio },
  { to: "/dashboard/mock-tests", label: "Mock Tests", icon: ClipboardCheck },
  { to: "/dashboard/vocabulary", label: "Vocabulary", icon: Library },
  { to: "/dashboard/plan", label: "Study Plan", icon: Calendar },
  { to: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { to: "/dashboard/intelligence", label: "AI Insights", icon: Brain },
  { to: "/dashboard/billing", label: "Billing & Plans", icon: CreditCard },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

function useNotifications() {
  const list = useServerFn(listMyNotifications);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEnabled(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEnabled(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return useQuery({
    queryKey: ["my-notifications"],
    queryFn: () => list(),
    enabled,
    refetchInterval: enabled ? 30000 : false,
  });
}

export function DashboardShell(props: { items: NavItem[]; title: string; brandTo?: string }) {
  return (
    <SubscriptionProvider>
      <DashboardShellInner {...props} />
    </SubscriptionProvider>
  );
}

function DashboardShellInner({ items, title, brandTo = "/" }: { items: NavItem[]; title: string; brandTo?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("dash:sidebar-collapsed") === "1";
  });
  const [animOn, setAnimOn] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("dash:bg-anim") !== "0";
  });
  const [animAnnounce, setAnimAnnounce] = useState<string>("");
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("dash:sidebar-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  // Sync bg_animations preference with profile (server)
  const getProfile = useServerFn(getMyProfile);
  const setBgPref = useServerFn(setBgAnimationsPref);
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);
  const profileQ = useQuery({
    queryKey: ["my-profile-prefs"],
    queryFn: () => getProfile(),
    enabled: authed,
    staleTime: 5 * 60 * 1000,
  });
  // When server preference loads, reconcile with local state
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    const serverPref = profileQ.data?.profile?.bg_animations;
    if (typeof serverPref === "boolean") {
      hydratedRef.current = true;
      setAnimOn(serverPref);
    }
  }, [profileQ.data]);
  const bgMutation = useMutation({
    mutationFn: (enabled: boolean) => setBgPref({ data: { enabled } }),
  });
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("dash:bg-anim", animOn ? "1" : "0");
    setAnimAnnounce(animOn ? "Background animations resumed" : "Background animations paused");
    if (authed && hydratedRef.current) {
      bgMutation.mutate(animOn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animOn, authed]);

  // Route-change analytics — throttled so rapid redirects emit a single event
  const lastPathRef = useRef<string | null>(null);
  const lastTimeRef = useRef<number>(typeof performance !== "undefined" ? performance.now() : 0);
  const pendingPathRef = useRef<string | null>(null);
  const analyticsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    pendingPathRef.current = path;
    if (analyticsTimerRef.current) clearTimeout(analyticsTimerRef.current);
    analyticsTimerRef.current = setTimeout(() => {
      const finalPath = pendingPathRef.current;
      if (!finalPath || finalPath === lastPathRef.current) return;
      const now = performance.now();
      const dwellMs = lastPathRef.current ? Math.round(now - lastTimeRef.current) : null;
      const detail = { path: finalPath, from: lastPathRef.current, dwellMs, ts: Date.now() };
      window.dispatchEvent(new CustomEvent("dashboard:pageview", { detail }));
      const gtag = (window as any).gtag;
      if (typeof gtag === "function") gtag("event", "page_view", { page_path: finalPath });
      if (import.meta.env.DEV) console.debug("[dashboard:pageview]", detail);
      lastPathRef.current = finalPath;
      lastTimeRef.current = now;
    }, 250);
    return () => { if (analyticsTimerRef.current) clearTimeout(analyticsTimerRef.current); };
  }, [path]);

  // ── Performance metrics instrumentation ──────────────────────────────
  // 1) Route load times: measure from navigation start → load complete
  const router = useRouter();
  const navStartRef = useRef<number | null>(null);
  const navPathRef = useRef<string | null>(null);
  useEffect(() => {
    const unsubBefore = router.subscribe("onBeforeNavigate", (e: any) => {
      navStartRef.current = performance.now();
      navPathRef.current = e?.toLocation?.pathname ?? null;
    });
    const unsubLoad = router.subscribe("onLoad", () => {
      if (navStartRef.current != null && navPathRef.current) {
        const ms = Math.round(performance.now() - navStartRef.current);
        recordRouteSample(navPathRef.current, ms);
        navStartRef.current = null;
        navPathRef.current = null;
      }
    });
    return () => { unsubBefore(); unsubLoad(); };
  }, [router]);

  // 2) Preload success/fail: hook router resolved/error events
  useEffect(() => {
    const unsubResolved = router.subscribe("onResolved", () => {
      // Preload counted as success when a navigation resolves (chunk + loader ready)
      recordPreload(true);
    });
    return () => { unsubResolved(); };
  }, [router]);

  // 3) Cache hit/miss: subscribe to React Query cache to detect served-from-cache
  const qcForMetrics = useQueryClient();
  useEffect(() => {
    const cache = qcForMetrics.getQueryCache();
    const unsub = cache.subscribe((ev) => {
      if (ev.type === "observerResultsUpdated") {
        const q = (ev as any).query;
        const state = q?.state;
        if (!state) return;
        // First settled result: dataUpdateCount=1 came from cache if no fetch happened
        if (state.fetchStatus === "idle" && state.dataUpdateCount > 0) {
          const fromCache = !state.isFetching && (state.dataUpdatedAt > 0) && q.observers.length > 0;
          // Heuristic: status==="success" without an active fetch => served from cache
          if (fromCache) recordCacheOutcome(true);
        }
        if (state.fetchStatus === "fetching") {
          recordCacheOutcome(false);
        }
      }
    });
    return () => unsub();
  }, [qcForMetrics]);

  const { isPro, trialActive } = useSubscription();
  useEffect(() => { setOpen(false); }, [path]);

  return (
    <div className="relative flex min-h-screen bg-muted/30">
      <FloatingScene enabled={animOn} />

      {/* Sidebar — desktop */}
      <Sidebar items={items} path={path} brandTo={brandTo} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      {/* Sidebar — mobile drawer (focus-trapped) */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/40 md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <FocusTrap onEscape={() => setOpen(false)}>
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Main navigation"
                className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
                initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 22 }}
              >
                <Sidebar items={items} path={path} brandTo={brandTo} mobile onClose={() => setOpen(false)} />
              </motion.div>
            </FocusTrap>
          </>
        )}
      </AnimatePresence>

      <div className="relative flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} aria-label="Open navigation menu" aria-expanded={open} aria-controls="dashboard-sidebar-nav" className="rounded-md p-2 hover:bg-accent md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Menu className="h-5 w-5" /></button>
            <h1 className="font-display text-lg font-bold md:text-xl">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border bg-background px-3 py-1.5 lg:flex">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Search lessons, tasks…" className="w-64 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            <button
              type="button"
              onClick={() => setAnimOn((v) => !v)}
              onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setAnimOn((v) => !v); } }}
              aria-pressed={animOn}
              aria-label={animOn ? "Pause background animations" : "Resume background animations"}
              title={animOn ? "Pause background effects" : "Resume background effects"}
              className={`inline-grid h-9 w-9 place-items-center rounded-full border bg-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${animOn ? "text-primary border-primary/40" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Sparkles className={`h-4 w-4 ${animOn ? "" : "opacity-40"}`} />
            </button>
            <PerfBadge />
            <NotificationsBell />

            <div className="hidden text-right text-xs md:block">
              <p className="font-semibold">Galibi Habibi</p>
              <p className="text-muted-foreground">{isPro ? (trialActive ? "Pro trial" : "Pro plan") : "Free plan"}</p>
            </div>
            <TrialPill />
            <div className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-sm font-semibold text-white">AC</div>
          </div>
        </header>
        {/* Accessible live region for background-animation state changes */}
        <div role="status" aria-live="polite" className="sr-only">{animAnnounce}</div>
        <main className="p-4 pb-[calc(env(safe-area-inset-bottom)+84px)] md:p-8 md:pb-8">
          <TrialBanner />
          <Suspense fallback={<RouteSkeleton path={path} />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <BottomNav items={studentBottomNav} />
      <IeltsBuddy />
    </div>
  );
}

/* Trap keyboard focus inside a container until it unmounts */
function FocusTrap({ children, onEscape }: { children: React.ReactNode; onEscape?: () => void }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const prev = (typeof document !== "undefined" ? document.activeElement : null) as HTMLElement | null;
    const root = wrapRef.current;
    const getFocusable = () =>
      Array.from(
        root?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => !el.hasAttribute("aria-hidden"));
    // Focus first focusable on mount
    setTimeout(() => getFocusable()[0]?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onEscape?.(); return; }
      if (e.key !== "Tab") return;
      const f = getFocusable();
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      prev?.focus?.();
    };
  }, [onEscape]);
  return <div ref={wrapRef}>{children}</div>;
}

function SBar({ className = "" }: { className?: string }) {
  return <div className={`rounded-md bg-muted ${className}`} />;
}
function SCard({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border bg-card p-4 ${className}`}>{children}</div>;
}

function RouteSkeleton({ path = "" }: { path?: string }) {
  const variant = (() => {
    if (path.startsWith("/dashboard/speaking")) return "speaking";
    if (path.startsWith("/dashboard/listening")) return "listening";
    if (path.startsWith("/dashboard/reading")) return "reading";
    if (path.startsWith("/dashboard/writing")) return "writing";
    if (path.startsWith("/dashboard/vocabulary")) return "vocabulary";
    if (path.startsWith("/dashboard/mock-tests")) return "mock";
    if (path.startsWith("/dashboard/videos")) return "videos";
    if (path.startsWith("/dashboard/live")) return "live";
    if (path.startsWith("/dashboard/progress")) return "progress";
    if (path.startsWith("/dashboard/intelligence")) return "intel";
    if (path.startsWith("/dashboard/plan")) return "plan";
    if (path.startsWith("/dashboard/billing")) return "billing";
    if (path.startsWith("/dashboard/settings")) return "settings";
    return "home";
  })();

  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-live="polite" aria-label="Loading page">
      <SBar className="h-7 w-1/3" />
      <SBar className="h-4 w-2/3" />

      {variant === "home" && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {[0,1,2,3].map((i) => (
              <SCard key={i} className="h-24"><SBar className="h-3 w-1/2" /><SBar className="mt-3 h-6 w-2/3" /></SCard>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <SCard className="lg:col-span-2 h-72" />
            <SCard className="h-72" />
          </div>
        </>
      )}

      {variant === "speaking" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <SCard className="h-[420px]"><SBar className="h-4 w-1/4" /><SBar className="mt-4 h-40 w-full" /><SBar className="mt-4 h-10 w-32" /></SCard>
          <div className="space-y-4"><SCard className="h-40" /><SCard className="h-40" /></div>
        </div>
      )}

      {(variant === "listening" || variant === "reading") && (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <SCard className="h-[480px]">
            <SBar className="h-4 w-1/3" /><SBar className="mt-4 h-3 w-full" /><SBar className="mt-2 h-3 w-5/6" />
            <SBar className="mt-2 h-3 w-4/6" /><SBar className="mt-6 h-10 w-40" />
          </SCard>
          <SCard className="h-[480px]" />
        </div>
      )}

      {variant === "writing" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <SCard className="h-[480px]" /><SCard className="h-[480px]" />
        </div>
      )}

      {(variant === "vocabulary" || variant === "videos") && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[0,1,2,3,4,5,6,7].map((i) => <SCard key={i} className="h-44" />)}
        </div>
      )}

      {variant === "mock" && (
        <div className="space-y-3">
          {[0,1,2,3,4].map((i) => <SCard key={i} className="h-20" />)}
        </div>
      )}

      {variant === "live" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0,1,2,3,4,5].map((i) => <SCard key={i} className="h-56" />)}
        </div>
      )}

      {(variant === "progress" || variant === "intel") && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {[0,1,2,3].map((i) => <SCard key={i} className="h-24" />)}
          </div>
          <SCard className="h-80" />
          <SCard className="h-64" />
        </>
      )}

      {variant === "plan" && (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <SCard className="h-[500px]" /><SCard className="h-[500px]" />
        </div>
      )}

      {variant === "billing" && (
        <div className="grid gap-4 md:grid-cols-3">
          {[0,1,2].map((i) => <SCard key={i} className="h-72" />)}
        </div>
      )}

      {variant === "settings" && (
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <SCard className="h-80" />
          <div className="space-y-4"><SCard className="h-40" /><SCard className="h-40" /><SCard className="h-40" /></div>
        </div>
      )}
    </div>
  );
}

function Sidebar({ items, path, brandTo, mobile, onClose, collapsed = false, onToggle }: { items: NavItem[]; path: string; brandTo: string; mobile?: boolean; onClose?: () => void; collapsed?: boolean; onToggle?: () => void }) {
  const isCollapsed = !mobile && collapsed;
  const navRef = useRef<HTMLElement | null>(null);

  const focusItem = (delta: number) => {
    const root = navRef.current;
    if (!root) return;
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>("a[data-sidebar-item]"));
    if (!links.length) return;
    const current = document.activeElement as HTMLElement | null;
    const idx = current ? links.indexOf(current as HTMLAnchorElement) : -1;
    const next = idx === -1 ? 0 : (idx + delta + links.length) % links.length;
    links[next]?.focus();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); focusItem(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); focusItem(-1); }
    else if (e.key === "Home") {
      e.preventDefault();
      navRef.current?.querySelector<HTMLAnchorElement>("a[data-sidebar-item]")?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const links = navRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-sidebar-item]");
      links?.[links.length - 1]?.focus();
    } else if (mobile && e.key === "Escape") {
      e.preventDefault();
      onClose?.();
    }
  };

  return (
    <aside
      aria-label="Primary"
      onKeyDown={onKeyDown}
      className={`${mobile ? "" : "hidden md:flex"} sticky top-0 h-screen ${isCollapsed ? "w-16" : "w-64"} shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200`}
    >
      <div className={`flex items-center ${isCollapsed ? "justify-center px-2" : "justify-between px-6"} border-b py-5`}>
        <Link to={brandTo} className="flex items-center gap-2 font-display text-lg font-bold rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="grid h-9 w-9 place-items-center rounded-lg gradient-brand text-white shadow-lg shadow-primary/20"><GraduationCap className="h-5 w-5" /></span>
          {!isCollapsed && "AIELTS"}
        </Link>
        {mobile && <button onClick={onClose} aria-label="Close menu" className="rounded-md p-1.5 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X className="h-4 w-4" /></button>}
      </div>
      {!isCollapsed && <p className="px-6 pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Student</p>}
      <nav ref={navRef as any} id="dashboard-sidebar-nav" aria-label="Dashboard navigation" className={`flex-1 space-y-1 overflow-y-auto ${isCollapsed ? "p-2" : "p-3"}`}>
        {items.map((it) => {
          const active = path === it.to || (it.to !== "/dashboard" && path.startsWith(it.to));
          return (
            <Link
              key={it.to}
              to={it.to}
              preload="intent"
              data-sidebar-item
              aria-current={active ? "page" : undefined}
              title={isCollapsed ? it.label : undefined}
              onFocus={() => recordPreload(true)}
              onPointerEnter={() => recordPreload(true)}
              className={`group relative flex items-center ${isCollapsed ? "justify-center px-2" : "gap-3 px-3"} rounded-lg py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar ${
                active ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span layoutId="student-active-bar"
                  className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-primary"
                  style={{ boxShadow: "0 0 12px var(--primary)" }} />
              )}
              <it.icon className={`h-4 w-4 transition ${active ? "text-primary" : "group-hover:text-primary group-hover:drop-shadow-[0_0_6px_var(--primary)]"}`} />
              {!isCollapsed && it.label}
            </Link>
          );
        })}
      </nav>
      <div className={`border-t ${isCollapsed ? "p-2" : "p-3"} space-y-1`}>
        {!mobile && onToggle && (
          <button
            onClick={onToggle}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            aria-controls="dashboard-sidebar-nav"
            className={`flex w-full items-center ${isCollapsed ? "justify-center px-2" : "gap-3 px-3"} rounded-lg py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Collapse</>}
          </button>
        )}
        <Link to="/" title={isCollapsed ? "Sign out" : undefined}
          className={`flex items-center ${isCollapsed ? "justify-center px-2" : "gap-3 px-3"} rounded-lg py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}>
          <LogOut className="h-4 w-4" /> {!isCollapsed && "Sign out"}
        </Link>
      </div>
    </aside>
  );
}

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const q = useNotifications();
  const qc = useQueryClient();
  const markRead = useServerFn(markNotificationRead);
  const markAll = useServerFn(markAllNotificationsRead);
  const del = useServerFn(deleteNotification);
  const items = q.data?.items ?? [];
  const unread = q.data?.unread ?? 0;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["my-notifications"] });
  const mRead = useMutation({ mutationFn: (id: string) => markRead({ data: { id } }), onSuccess: invalidate });
  const mAll = useMutation({ mutationFn: () => markAll(), onSuccess: invalidate });
  const mDel = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: invalidate });

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="group relative grid h-9 w-9 place-items-center rounded-full border bg-background transition hover:border-primary/40 hover:text-primary" aria-label="Notifications">
        <Bell className="h-4 w-4 transition group-hover:drop-shadow-[0_0_8px_var(--primary)]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--teal)] px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-1rem))] overflow-hidden rounded-xl border bg-card shadow-xl"
            >
              <div className="flex items-center justify-between border-b px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notifications</p>
                {unread > 0 && (
                  <button onClick={() => mAll.mutate()} className="text-[11px] text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <ul className="max-h-[60vh] overflow-y-auto">
                {q.isLoading && <li className="p-4 text-sm text-muted-foreground">Loading…</li>}
                {!q.isLoading && items.length === 0 && (
                  <li className="p-6 text-center text-sm text-muted-foreground">You're all caught up 🎉</li>
                )}
                {items.map((n, i) => {
                  const unreadItem = !n.read_at;
                  const body = (
                    <div className="flex items-start gap-3 px-3 py-3">
                      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${unreadItem ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`} />
                      <div className="min-w-0 flex-1 text-sm">
                        <p className={`truncate ${unreadItem ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                        {n.body && <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); mDel.mutate(n.id); }}
                        className="rounded p-1 text-muted-foreground opacity-60 hover:bg-accent hover:text-destructive hover:opacity-100"
                        aria-label="Delete"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                  return (
                    <motion.li key={n.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.03, 0.2) }}
                      className="border-b last:border-b-0 hover:bg-accent/50">
                      {n.url ? (
                        <a href={n.url} onClick={() => { if (unreadItem) mRead.mutate(n.id); setOpen(false); }}>{body}</a>
                      ) : (
                        <button className="block w-full text-left" onClick={() => unreadItem && mRead.mutate(n.id)}>{body}</button>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Surreal floating academic icons, scroll + mouse reactive */
function FloatingScene({ enabled = true }: { enabled?: boolean }) {
  const [y, setY] = useState(0);
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const onScroll = () => setY(window.scrollY);
    const onMove = (e: MouseEvent) => {
      setMx((e.clientX / window.innerWidth - 0.5) * 20);
      setMy((e.clientY / window.innerHeight - 0.5) * 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMove); };
  }, [enabled]);
  const icons = ["📚", "🎧", "✍️", "🎓", "🗣️", "📝", "📖", "💡"];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 18% 12%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 60%), radial-gradient(50% 50% at 82% 30%, color-mix(in oklab, var(--teal) 12%, transparent), transparent 60%)",
        }} />
      {enabled && icons.map((e, i) => (
        <motion.span key={i}
          className="absolute text-3xl opacity-[0.07] md:text-5xl"
          style={{
            left: `${(i * 13 + 8) % 92}%`,
            top: `${(i * 19 + 10) % 80}%`,
            x: mx * (i % 2 ? 1 : -1),
            y: my * (i % 2 ? -1 : 1) - y * 0.04,
          }}
          animate={{ rotate: [0, 6, -6, 0], y: [0, -14, 0] }}
          transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}>
          {e}
        </motion.span>
      ))}
    </div>
  );
}

function PerfBadge() {
  const [open, setOpen] = useState(false);
  const [snap, setSnap] = useState(() => computeSummary(getMetrics()));
  useEffect(() => {
    const refresh = () => setSnap(computeSummary(getMetrics()));
    const t = setInterval(refresh, 2000);
    window.addEventListener("perf:metrics-updated", refresh);
    return () => { clearInterval(t); window.removeEventListener("perf:metrics-updated", refresh); };
  }, []);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Performance metrics"
        title="Performance"
        className="hidden md:inline-grid h-9 w-9 place-items-center rounded-full border bg-background text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Activity className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 z-40 mt-2 w-72 rounded-xl border bg-card p-3 shadow-xl"
              role="dialog" aria-label="Performance metrics"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Performance</p>
                <button onClick={() => { resetMetrics(); setSnap(computeSummary(getMetrics())); }}
                  className="text-[11px] text-primary hover:underline">Reset</button>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[11px] text-muted-foreground">Avg route load</dt>
                  <dd className="font-mono text-base font-semibold">{snap.avg} ms</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted-foreground">P95 route load</dt>
                  <dd className="font-mono text-base font-semibold">{snap.p95} ms</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted-foreground">Cache hit rate</dt>
                  <dd className="font-mono text-base font-semibold">{snap.cacheHitRate}%</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted-foreground">Preload success</dt>
                  <dd className="font-mono text-base font-semibold">{snap.preloadRate}%</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[11px] text-muted-foreground">Samples</dt>
                  <dd className="font-mono text-sm">{snap.samples} navigations recorded</dd>
                </div>
              </dl>
              <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
                Routes preload on hover/focus (intent). Query cache persisted to device for 24h.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
