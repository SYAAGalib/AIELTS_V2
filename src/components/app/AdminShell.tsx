import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileBarChart, Users, ShieldCheck, FileText, KeyRound,
  Bell, Sparkles, Mail, Settings, GraduationCap, Menu, X, Search, Layers, HelpCircle, Bot, ClipboardCheck, Library, Radio, CreditCard, Youtube, Heart,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { BottomNav, type BottomNavItem } from "@/components/app/BottomNav";

const adminBottomNav: BottomNavItem[] = [
  { to: "/admin", label: "Home", icon: LayoutDashboard, match: (p) => p === "/admin" },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/content", label: "Content", icon: FileText },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }> };

export const adminNav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/admins", label: "Admins", icon: ShieldCheck },
  { to: "/admin/modules", label: "Modules", icon: Layers },
  { to: "/admin/questions", label: "Questions", icon: HelpCircle },
  { to: "/admin/mock-tests", label: "Mock Tests", icon: ClipboardCheck },
  { to: "/admin/vocabulary", label: "Vocabulary", icon: Library },
  { to: "/admin/speaking-ai", label: "Speaking AI Behavior", icon: Bot },
  { to: "/admin/live", label: "Live System", icon: Radio },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/admin/content", label: "Content", icon: FileText },
  { to: "/admin/sponsors", label: "Sponsors", icon: Heart },
  { to: "/admin/youtube", label: "YouTube Sync", icon: Youtube },
  { to: "/admin/api", label: "API Settings", icon: KeyRound },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/predictions", label: "Predictions", icon: Sparkles },
  { to: "/admin/mail", label: "Mail Settings", icon: Mail },
  { to: "/admin/settings", label: "General Settings", icon: Settings },
];

const alerts = [
  { t: "Churn risk: 24 Pro users", d: "Predicted in next 7 days", k: "alert" },
  { t: "New content review queue", d: "12 lessons awaiting approval", k: "info" },
  { t: "Payment gateway latency", d: "Stripe webhook delayed 4s", k: "warn" },
];

export function AdminShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);

  useEffect(() => { setOpen(false); }, [path]);

  return (
    <div className="dark relative min-h-screen bg-[#0F172A] text-white">
      <WebGLBackground />

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0F172A]/80 px-4 py-3 backdrop-blur md:hidden">
        <button onClick={() => setOpen(true)} className="rounded-md p-2 hover:bg-white/10"><Menu className="h-5 w-5" /></button>
        <Link to="/admin" className="flex items-center gap-2 font-display font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg gradient-brand"><GraduationCap className="h-4 w-4" /></span>
          AIELTS
        </Link>
        <button onClick={() => setBell((v) => !v)} className="relative rounded-md p-2 hover:bg-white/10">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-[var(--teal)]" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar — desktop */}
        <Sidebar items={adminNav} path={path} />

        {/* Sidebar — mobile drawer */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div className="fixed inset-0 z-40 bg-black/60 md:hidden"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
              <motion.div className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
                initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 22 }}>
                <Sidebar items={adminNav} path={path} onClose={() => setOpen(false)} mobile />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="min-w-0 flex-1">
          {/* Top bar — desktop */}
          <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-white/10 bg-[#0F172A]/70 px-8 py-3 backdrop-blur md:flex">
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <Search className="h-4 w-4 text-white/50" />
              <input placeholder="Search users, lessons, reports…" className="w-80 bg-transparent text-sm outline-none placeholder:text-white/40" />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button onClick={() => setBell((v) => !v)} className="relative rounded-lg p-2 transition hover:bg-white/10">
                  <Bell className="h-5 w-5 transition group-hover:text-[var(--teal)]" />
                  <motion.span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--teal)]"
                    animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
                </button>
                <AnimatePresence>
                  {bell && <BellDropdown onClose={() => setBell(false)} />}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <p className="font-semibold">Admin Root</p>
                  <p className="text-white/50">Super admin</p>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-sm font-semibold">AR</div>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.main
              key={path}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative p-4 pb-[calc(env(safe-area-inset-bottom)+84px)] md:p-8 md:pb-8"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
      <BottomNav items={adminBottomNav} theme="dark" />
    </div>
  );
}

function Sidebar({ items, path, onClose, mobile }: { items: NavItem[]; path: string; onClose?: () => void; mobile?: boolean }) {
  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 22 }}
      className={`${mobile ? "" : "hidden md:flex"} sticky top-0 h-screen w-64 flex-col border-r border-white/10 bg-[#0B1224]/95 backdrop-blur`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <Link to="/admin" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-lg gradient-brand shadow-lg shadow-[var(--teal)]/20"><GraduationCap className="h-5 w-5" /></span>
          AIELTS
        </Link>
        {mobile && <button onClick={onClose} className="rounded-md p-1.5 hover:bg-white/10"><X className="h-4 w-4" /></button>}
      </div>
      <p className="px-5 pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Admin</p>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((it, i) => {
          const active = path === it.to || (it.to !== "/admin" && path.startsWith(it.to));
          return (
            <motion.div key={it.to} initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.08 + i * 0.04 }}>
              <Link
                to={it.to}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-white/5 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span layoutId="admin-active-bar"
                    className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-[var(--teal)]"
                    style={{ boxShadow: "0 0 12px var(--teal)" }} />
                )}
                <it.icon className={`h-4 w-4 transition ${active ? "text-[var(--teal)]" : "group-hover:text-[var(--teal)] group-hover:drop-shadow-[0_0_6px_var(--teal)]"}`} />
                {it.label}
              </Link>
            </motion.div>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white">
          <GraduationCap className="h-4 w-4" /> Back to site
        </Link>
      </div>
    </motion.aside>
  );
}

function BellDropdown({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-white/10 bg-[#0B1224] p-2 shadow-2xl shadow-black/40"
      >
        <p className="px-3 py-2 text-xs uppercase tracking-wider text-white/40">Alerts</p>
        <ul className="space-y-1">
          {alerts.map((a, i) => (
            <motion.li key={a.t} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 rounded-lg p-3 hover:bg-white/5">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${a.k === "alert" ? "bg-red-400" : a.k === "warn" ? "bg-amber-400" : "bg-[var(--teal)]"} animate-pulse`} />
              <div className="text-sm">
                <p className="font-medium">{a.t}</p>
                <p className="text-xs text-white/50">{a.d}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </>
  );
}

/* Surreal scroll-reactive background (lightweight SVG/CSS, no WebGL deps) */
function WebGLBackground() {
  const [y, setY] = useState(0);
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    const onMove = (e: MouseEvent) => {
      setMx((e.clientX / window.innerWidth - 0.5) * 30);
      setMy((e.clientY / window.innerHeight - 0.5) * 30);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMove); };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 50% at 18% 12%, color-mix(in oklab, #2563EB 35%, transparent), transparent 60%), radial-gradient(50% 50% at 82% 30%, color-mix(in oklab, #14B8A6 28%, transparent), transparent 60%), radial-gradient(60% 60% at 50% 110%, color-mix(in oklab, #2563EB 22%, transparent), transparent 70%)",
        }}
      />
      <motion.div className="absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: "color-mix(in oklab, #2563EB 35%, transparent)", x: mx, y: my - y * 0.05 }}
        animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute -right-32 top-1/3 h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{ background: "color-mix(in oklab, #14B8A6 30%, transparent)", x: -mx, y: -my + y * 0.04 }}
        animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      <svg className="absolute inset-x-0 bottom-0 h-[60vh] w-full opacity-60" viewBox="0 0 1440 600" preserveAspectRatio="none">
        <defs>
          <linearGradient id="adminWave" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#adminWave)"
          animate={{
            d: [
              "M0,360 C320,440 720,260 1440,400 L1440,600 L0,600 Z",
              "M0,400 C360,300 780,460 1440,340 L1440,600 L0,600 Z",
              "M0,360 C320,440 720,260 1440,400 L1440,600 L0,600 Z",
            ],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{ transform: `translateY(${-y * 0.08}px)` }}
        />
        <motion.path
          fill="none" stroke="#14B8A6" strokeOpacity="0.18" strokeWidth="1.5"
          animate={{
            d: [
              "M0,280 C320,360 720,180 1440,320",
              "M0,320 C360,220 780,380 1440,260",
              "M0,280 C320,360 720,180 1440,320",
            ],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
