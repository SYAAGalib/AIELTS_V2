import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";

/**
 * Inline "ready / start" banner. Renders nothing once started.
 * Lives in normal document flow — never overlays other pages.
 */
export function ReadyDialog({
  open,
  title,
  description,
  onReady,
  ctaLabel = "Start module",
}: {
  open: boolean;
  title: string;
  description: string;
  onReady: () => void;
  ctaLabel?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-[var(--teal)]/5 p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-primary">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">{description}</p>
            </div>
            <button
              onClick={onReady}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              {ctaLabel}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
