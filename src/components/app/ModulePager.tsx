import { motion } from "framer-motion";
import { Lock } from "lucide-react";

type Props = {
  total: number;
  current: number;
  onChange: (n: number) => void;
  label?: string;
  isLocked?: (n: number) => boolean;
  onLockedClick?: (n: number) => void;
};

export function ModulePager({ total, current, onChange, label = "Module", isLocked, onLockedClick }: Props) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => {
          const n = i + 1;
          const active = n === current;
          const locked = isLocked?.(n) ?? false;
          return (
            <motion.button
              key={n}
              whileTap={{ scale: 0.92 }}
              onClick={() => (locked ? onLockedClick?.(n) : onChange(n))}
              aria-current={active ? "page" : undefined}
              className={`relative grid h-9 w-9 place-items-center rounded-full border text-sm font-medium transition
                ${active ? "border-primary bg-primary text-white shadow-md shadow-primary/30" : "border-border bg-card text-foreground hover:border-primary/40"}
                ${locked ? "opacity-60" : ""}`}
            >
              {locked ? <Lock className="h-3.5 w-3.5" /> : n}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
