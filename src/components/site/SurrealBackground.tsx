import { motion } from "framer-motion";

/** Surreal animated gradient + floating shapes background (no WebGL deps, GPU-cheap). */
export function SurrealBackground({ variant = "default" }: { variant?: "default" | "wave" | "soft" }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 20%, color-mix(in oklab, var(--primary) 25%, transparent), transparent 60%), radial-gradient(50% 50% at 80% 40%, color-mix(in oklab, var(--teal) 25%, transparent), transparent 60%), radial-gradient(60% 60% at 50% 90%, color-mix(in oklab, var(--primary) 15%, transparent), transparent 70%)",
        }}
      />
      {variant !== "soft" && (
        <>
          <motion.div
            aria-hidden
            className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full blur-3xl"
            style={{ background: "color-mix(in oklab, var(--primary) 30%, transparent)" }}
            animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-32 -right-24 h-[32rem] w-[32rem] rounded-full blur-3xl"
            style={{ background: "color-mix(in oklab, var(--teal) 30%, transparent)" }}
            animate={{ x: [0, -30, 20, 0], y: [0, 20, -20, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
      {variant === "wave" && (
        <svg className="absolute inset-x-0 bottom-0 h-64 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wg" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--teal)" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <motion.path
            fill="url(#wg)"
            initial={{ d: "M0,160 C320,240 720,80 1440,200 L1440,320 L0,320 Z" }}
            animate={{
              d: [
                "M0,160 C320,240 720,80 1440,200 L1440,320 L0,320 Z",
                "M0,200 C360,120 780,260 1440,160 L1440,320 L0,320 Z",
                "M0,160 C320,240 720,80 1440,200 L1440,320 L0,320 Z",
              ],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      )}
    </div>
  );
}

/** Floating academic icons */
export function FloatingIcons() {
  const items = ["📚", "🎧", "✍️", "🎓", "🗣️", "📝"];
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      {items.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl md:text-4xl opacity-30"
          style={{
            left: `${(i * 17 + 8) % 90}%`,
            top: `${(i * 23 + 12) % 80}%`,
          }}
          animate={{ y: [0, -20, 0], rotate: [0, 8, -6, 0] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  );
}
