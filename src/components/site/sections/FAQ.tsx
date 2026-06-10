import { motion } from "framer-motion";
import { ArrowUpRight, MessageCircle } from "lucide-react";

type Faq = {
  q: string;
  a: string;
  short: string; // condensed answer surfaced in the tile
  tag: string;
};

const faqs: Faq[] = [
  {
    q: "Can I really hit Band 7+ using only AIELTS?",
    a: "Yes — most of our Pro students report a 0.5 to 1.5 band-score jump within 6–8 weeks of consistent practice. The AI tutor follows the same four-criterion rubric (Task Response, Coherence, Lexical Resource, Grammar) that Cambridge examiners use.",
    short:
      "Most Pro students gain 0.5–1.5 bands in 6–8 weeks, graded on the same four-criterion Cambridge rubric.",
    tag: "Results",
  },
  {
    q: "Is the AI Speaking Examiner the same as the real test?",
    a: "It mirrors the three-part IELTS Speaking format exactly — same timing, same cue cards, same Part 3 abstract follow-ups. You hear your fluency, pronunciation, and lexical-range scores within seconds of finishing.",
    short: "Same 3-part format, timing and rubric. Scores returned in seconds.",
    tag: "Speaking",
  },
  {
    q: "Spik Buddy vs. the AI Speaking Examiner?",
    a: "Spik Buddy pairs you one-to-one with a real student over end-to-end encrypted voice, video or chat — free practice built only for IELTS Speaking. Use it for natural conversation; use the AI Examiner for graded mock tests.",
    short:
      "Buddies for natural 1-to-1 conversation. Examiner for graded mocks.",
    tag: "Spik Buddy",
  },
  {
    q: "Do I need to pay to try it?",
    a: "No. The Starter plan is free forever and includes daily listening drills, weekly essay scoring, the community, and the band predictor. Pro unlocks unlimited mocks, unlimited essays, the AI speaking coach, and the 12-week study plan.",
    short: "Starter is free forever. No card needed to begin.",
    tag: "Pricing",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Pro is billed monthly or yearly and you can cancel from your dashboard in two clicks — no calls, no emails. Your access stays active until the end of the billing period.",
    short: "Two clicks from your dashboard. No calls, no emails.",
    tag: "Billing",
  },
  {
    q: "Academic or General Training?",
    a: "Both. Pick your test type in onboarding and AIELTS adapts every drill, essay prompt, and mock test accordingly.",
    short: "Both supported. Toggle in onboarding.",
    tag: "Setup",
  },
  {
    q: "How accurate is the band prediction?",
    a: "Trained on thousands of marked IELTS scripts and speaking samples — the predictor is accurate within ±0.5 of the real test for students who complete at least four full mocks.",
    short: "± 0.5 of the real test after four full mocks.",
    tag: "Prediction",
  },
  {
    q: "Who can sponsor AIELTS?",
    a: "Anyone — companies, universities, NGOs, alumni groups, or individuals. We work with edtech brands, coaching centers, study-abroad consultancies, banks, and foundations, as well as private donors and student supporters. There is no minimum size requirement; what matters is the shared belief that high-quality IELTS prep should be free.",
    short: "Companies, universities, NGOs, and individuals — no minimum size.",
    tag: "Sponsorship",
  },
  {
    q: "What are the sponsorship tiers and benefits?",
    a: "Platinum (৳100,000+): founding-partner spotlight, full-color logo on the homepage and Sponsors page, dedicated quote, social shout-out, and quarterly impact briefing. Gold (৳50,000–৳99,999): B&W logo + name across site, mention in newsletter, and access to the sponsor community. Silver (৳10,000–৳49,999): name listing on the Sponsors page and inclusion in the rolling marquee. Supporters (under ৳10,000): name recognition on the public supporters wall.",
    short: "Platinum spotlight, Gold logo + name, Silver name listing, Supporters wall.",
    tag: "Sponsorship",
  },
  {
    q: "Where does sponsorship money go?",
    a: "Sponsorship taka funds two things: (1) improving the software experience — better AI models, faster infrastructure, new modules, smoother UX, and (2) keeping the Free tier genuinely free for every student, forever. Concretely that covers AI scoring compute, hosting and bandwidth, product engineering, and content production for the free experience. A detailed line-item breakdown is shared quarterly with every sponsor.",
    short: "Improves the software and keeps the Free tier free for every student.",
    tag: "Sponsorship",
  },
  {
    q: "How is the impact of sponsorship measured?",
    a: "Every sponsor receives a quarterly transparency report with concrete numbers: students reached, mock tests delivered, AI evaluations run, scholarships funded, and band-score outcomes. We also publish an annual public impact report so the wider community can see exactly how every taka was spent.",
    short: "Quarterly transparency reports plus an annual public impact report.",
    tag: "Sponsorship",
  },
  {
    q: "Can sponsors fund a specific initiative?",
    a: "Yes. Beyond general tiers, you can earmark a contribution toward a specific program — for example funding 50 Pro scholarships for rural students, sponsoring a free weekend mock-test event, underwriting Speaking practice for a university cohort, or commissioning a new module. Earmarked sponsorships get a dedicated mini impact page.",
    short: "Scholarships, mock-test events, university cohorts, or specific modules.",
    tag: "Sponsorship",
  },
  {
    q: "Is sponsorship tax deductible?",
    a: "In Bangladesh, contributions routed through our partner non-profit are eligible for tax rebate under the relevant NBR provisions; we issue an official receipt for every sponsorship. For international sponsors, we work with regional partners (US 501(c)(3), UK CIO, EU equivalents) to enable deductibility where possible. Email sponsors@aielts.app for the right route for your country.",
    short: "Tax-deductible in BD via our non-profit partner; international receipts available.",
    tag: "Sponsorship",
  },
  {
    q: "How do I become a sponsor?",
    a: "Email sponsors@aielts.app with your name, organization, preferred tier or amount, and any initiative you'd like to support. We'll send back a short sponsorship agreement, payment options (bank transfer, mobile financial services, or international wire), and timelines for placement of your logo or listing. Most sponsorships go live within 5 business days.",
    short: "Email sponsors@aielts.app — most sponsorships go live within 5 business days.",
    tag: "Sponsorship",
  },
];

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        {/* header — restrained */}
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

        {/* bento */}
        <motion.div
          {...fade}
          transition={{ ...fade.transition, delay: 0.1 }}
          className="mt-12 grid auto-rows-[minmax(150px,auto)] grid-cols-1 gap-3 md:grid-cols-4"
        >
          {/* featured — wide */}
          <FaqTile faq={faqs[0]} className="md:col-span-2 md:row-span-2" featured />

          {/* small tiles */}
          <FaqTile faq={faqs[1]} className="md:col-span-1" />
          <FaqTile faq={faqs[2]} className="md:col-span-1" />
          <FaqTile faq={faqs[3]} className="md:col-span-1" />
          <FaqTile faq={faqs[4]} className="md:col-span-1" />

          {/* sponsor highlight — wide */}
          <FaqTile faq={faqs[7]} className="md:col-span-2" highlight />
          <FaqTile faq={faqs[5]} className="md:col-span-1" />

          {/* low-key contact tile */}
          <ContactTile className="md:col-span-1" />

          {/* second sponsor + prediction row */}
          <FaqTile faq={faqs[8]} className="md:col-span-2" highlight />
          <FaqTile faq={faqs[6]} className="md:col-span-2" />
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
  faq: Faq;
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
          {faq.q}
        </h3>
        <p
          className={`mt-3 leading-relaxed text-muted-foreground ${
            featured ? "text-sm md:text-[15px]" : "text-[13px]"
          }`}
        >
          {featured ? faq.a : faq.short}
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
