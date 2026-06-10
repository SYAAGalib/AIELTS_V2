import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DEFAULT_CONFIG, type FinalCTAConfig } from "@/lib/homepage-config";

export function FinalCTA({ config = DEFAULT_CONFIG.finalCta }: { config?: FinalCTAConfig } = {}) {
  return (
    <section className="px-6 pb-28 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border bg-foreground p-12 text-background md:p-20"
      >
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-teal/20 blur-3xl" />
        <div className="relative grid items-end gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/60">{config.eyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
              {config.headline}
            </h2>
          </div>
          <div className="md:text-right">
            <p className="mb-6 max-w-md text-base text-background/70 md:ml-auto">{config.sub}</p>
            <Button asChild size="lg" className="rounded-xl bg-background px-7 text-foreground hover:bg-background/90">
              <a href={config.cta.href}>{config.cta.label} <ArrowRight className="ml-1 h-4 w-4" /></a>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
