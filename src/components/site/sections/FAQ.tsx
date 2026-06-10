import { motion } from "framer-motion";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicFaqs, type PublicFaq } from "@/lib/site-content.functions";

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export function FAQ() {
  const fetchFn = useServerFn(listPublicFaqs);
  const { data } = useQuery({
    queryKey: ["public-faqs"],
    queryFn: () => fetchFn(),
    staleTime: 5 * 60_000,
  });
  const faqs: PublicFaq[] = data ?? [];
  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <motion.div {...fade} className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-[2.75rem] md:leading-[1.05]">
            Everything students ask
            <br />
            <span className="text-muted-foreground">before signing up.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Still unsure? Drop us a message — a human replies within a few hours.
          </p>
        </motion.div>

        <motion.div
          {...fade}
          transition={{ ...fade.transition, delay: 0.1 }}
          className="mt-12 grid auto-rows-[minmax(150px,auto)] grid-cols-1 gap-3 md:grid-cols-4"
        >
          {faqs.map((f) => (
            <FaqTile
              key={f.id}
              faq={f}
              featured={f.featured}
              highlight={f.highlight}
              className={f.featured ? "md:col-span-2 md:row-span-2" : f.highlight ? "md:col-span-2" : "md:col-span-1"}
            />
          ))}
          <ContactTile className="md:col-span-1" />
        </motion.div>
      </div>
    </section>
  );
}

function FaqTile({
  faq,
  className = "",
  featured = false,
  highlight = false,
}: {
  faq: PublicFaq;
  className?: string;
  featured?: boolean;
  highlight?: boolean;
}) {
  return (
    <article
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-colors md:p-6 ${
        highlight
          ? "border-primary/30 bg-primary/5 hover:border-primary/50"
          : "border-border/70 bg-card/60 hover:border-border"
      } ${className}`}
    >
      <div>
        <span className={`text-[10px] font-medium uppercase tracking-[0.18em] ${highlight ? "text-primary" : "text-muted-foreground/80"}`}>
          {faq.tag}
        </span>
        <h3
          className={`mt-3 font-display font-medium tracking-tight text-foreground ${
            featured ? "text-xl md:text-2xl" : "text-[15px] md:text-base"
          }`}
        >
          {faq.question}
        </h3>
        <p
          className={`mt-3 leading-relaxed text-muted-foreground ${
            featured ? "text-sm md:text-[15px]" : "text-[13px]"
          }`}
        >
          {featured ? faq.full_answer : (faq.short_answer || faq.full_answer)}
        </p>
      </div>
    </article>
  );
}

function ContactTile({ className = "" }: { className?: string }) {
  return (
    <a
      href="mailto:hello@aielts.app"
      className={`group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-foreground p-5 text-background transition-colors hover:bg-foreground/90 md:p-6 ${className}`}
    >
      <div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-background/60">
          <MessageCircle className="h-3 w-3" />
          Still wondering?
        </span>
        <h3 className="mt-3 font-display text-[15px] font-medium tracking-tight md:text-base">
          Ask us anything — a human replies within hours.
        </h3>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-xs text-background/70 transition-colors group-hover:text-background">
        hello@aielts.app
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </a>
  );
}
