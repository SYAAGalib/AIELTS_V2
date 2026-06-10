import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/**
 * Global ambient background. Listens to page scroll and morphs gradient blobs.
 * Sits behind ALL homepage content (fixed, z -10).
 */
export function AmbientScrollBackground() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 60, damping: 22, mass: 0.4 });

  const blob1X = useTransform(p, [0, 1], ["-10%", "30%"]);
  const blob1Y = useTransform(p, [0, 1], ["-10%", "60%"]);
  const blob2X = useTransform(p, [0, 1], ["60%", "10%"]);
  const blob2Y = useTransform(p, [0, 1], ["10%", "80%"]);
  const blob3X = useTransform(p, [0, 1], ["30%", "70%"]);
  const blob3Y = useTransform(p, [0, 1], ["80%", "-10%"]);
  const hue = useTransform(p, [0, 0.5, 1], [0, 18, -12]);
  const gridOpacity = useTransform(p, [0, 0.3, 0.7, 1], [0.35, 0.2, 0.18, 0.28]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ filter: useTransform(hue, (h) => `hue-rotate(${h}deg)`) }}
    >
      <motion.div className="absolute inset-0 grid-bg mask-radial-fade" style={{ opacity: gridOpacity }} />
      <motion.div
        className="absolute h-[42rem] w-[42rem] rounded-full blur-3xl"
        style={{
          left: blob1X,
          top: blob1Y,
          background: "color-mix(in oklab, var(--primary) 22%, transparent)",
        }}
      />
      <motion.div
        className="absolute h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{
          left: blob2X,
          top: blob2Y,
          background: "color-mix(in oklab, var(--teal, var(--primary)) 20%, transparent)",
        }}
      />
      <motion.div
        className="absolute h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{
          left: blob3X,
          top: blob3Y,
          background: "color-mix(in oklab, var(--primary) 14%, transparent)",
        }}
      />
    </motion.div>
  );
}
