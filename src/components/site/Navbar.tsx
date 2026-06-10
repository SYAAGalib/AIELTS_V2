import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/site/Logo";

const links = [
  { to: "/#features", label: "Features" },
  { to: "/#demo", label: "How it works" },
  { to: "/videos", label: "Videos" },
  { to: "/#stories", label: "Stories" },
  { to: "/#pricing", label: "Pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);

  return (
    <header
      className={`fixed top-0 z-50 w-full backdrop-blur-xl transition-all ${
        scrolled ? "bg-background/75 border-b shadow-[0_1px_0_0_rgba(0,0,0,0.02)]" : "bg-background/30"
      }`}
    >
      <div className="mx-auto flex h-20 md:h-24 max-w-7xl items-center justify-between px-6 md:px-8">
        <Link to="/" className="flex items-center" aria-label="AIELTS home">
          <span className="inline-flex h-16 md:h-20 items-center">
            <LogoMark />
          </span>
        </Link>
        <nav className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <a key={l.to} href={l.to} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild className="rounded-lg"><Link to="/login">Sign in</Link></Button>
          <Button size="sm" asChild className="rounded-lg bg-foreground text-background hover:bg-foreground/90">
            <Link to="/register">Start free</Link>
          </Button>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {/* scroll progress bar */}
      <motion.div style={{ scaleX: progress }} className="origin-left h-[2px] w-full bg-primary" />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t bg-background"
          >
            <div className="flex flex-col gap-1 p-4">
              {links.map((l) => (
                <a key={l.to} href={l.to} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                  {l.label}
                </a>
              ))}
              <Button asChild className="mt-2 rounded-lg bg-foreground text-background hover:bg-foreground/90">
                <Link to="/register">Start free</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
