import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { ComponentType } from "react";

export type BottomNavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  match?: (path: string) => boolean;
};

/**
 * Native-style bottom tab bar.
 * - Phones: always visible (sticky bottom, safe-area aware)
 * - Tablets / desktop: hidden (sidebar takes over)
 */
export function BottomNav({ items, theme = "light" }: { items: BottomNavItem[]; theme?: "light" | "dark" }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isDark = theme === "dark";

  return (
    <nav
      aria-label="Primary"
      className={`fixed inset-x-0 bottom-0 z-40 md:hidden border-t backdrop-blur-xl ${
        isDark
          ? "border-white/10 bg-[#0F172A]/85 text-white"
          : "border-border bg-background/85 text-foreground"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-[640px] grid-cols-5">
        {items.map((it) => {
          const active = it.match ? it.match(path) : path === it.to || (it.to !== "/" && path.startsWith(it.to));
          return (
            <li key={it.to} className="contents">
              <Link
                to={it.to}
                preload="intent"
                className="relative flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium"
              >
                {active && (
                  <motion.span
                    layoutId="bottomnav-active-pill"
                    className="absolute inset-x-3 top-1 h-1 rounded-full bg-primary"
                    style={{ boxShadow: "0 0 10px var(--primary)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <it.icon
                  className={`h-[22px] w-[22px] transition ${
                    active ? "text-primary" : isDark ? "text-white/60" : "text-muted-foreground"
                  }`}
                />
                <span className={active ? "text-primary" : isDark ? "text-white/70" : "text-muted-foreground"}>
                  {it.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
