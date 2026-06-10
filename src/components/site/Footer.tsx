import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Youtube } from "lucide-react";
import { LogoMark } from "@/components/site/Logo";
import { DEFAULT_CONFIG, type FooterConfig } from "@/lib/homepage-config";

export function Footer({ config = DEFAULT_CONFIG.footer }: { config?: FooterConfig } = {}) {
  const year = new Date().getFullYear();
  const copy = config.copyright.replace("{year}", String(year));
  const socials: Array<[keyof FooterConfig["socials"], typeof Twitter]> = [
    ["twitter", Twitter],
    ["linkedin", Linkedin],
    ["youtube", Youtube],
    ["github", Github],
  ];
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <div className="flex items-center" aria-label="AIELTS">
              <span className="inline-flex h-20 items-center">
                <LogoMark />
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">{config.tagline}</p>
            <div className="mt-4 flex gap-3">
              {socials.map(([key, Icon]) => {
                const href = config.socials[key];
                if (!href) return null;
                return (
                  <motion.a
                    key={key}
                    href={href}
                    whileHover={{ y: -4, scale: 1.1 }}
                    className="grid h-9 w-9 place-items-center rounded-full border bg-background text-muted-foreground hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
          {config.columns.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * (i + 1) }}
            >
              <h4 className="font-display text-sm font-semibold">{c.title}</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {c.links.map((l) => (
                  <li key={l.label}><a href={l.href} className="story-link hover:text-foreground">{l.label}</a></li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>{copy}</p>
          <p>{config.madeWith}</p>
        </div>
      </div>
    </footer>
  );
}
