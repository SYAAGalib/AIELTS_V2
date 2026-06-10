// Shared types + defaults for the editable landing page.
// Keep this file pure: no server imports, no React.

export type CTA = { label: string; href: string };

export type NavLink = { label: string; href: string };

export type NavbarConfig = {
  links: NavLink[];
  signInLabel: string;
  ctaLabel: string;
  ctaHref: string;
};

export type HeroConfig = {
  eyebrow: string;
  // Headline rendered word-by-word; the literal `9` (or any word matching `gradientWord`) gets the gradient.
  headline: string;
  gradientWord: string;
  sub: string;
  ctaPrimary: CTA;
  ctaSecondary: CTA;
  skillChips: string[];
};

export type StatItem = {
  label: string;
  // If `source` is set we pull from public DB stats; otherwise use `value`.
  source: "videos" | "modules" | "testimonials" | "custom";
  value: number;
  suffix: string;
};

export type StatsConfig = { items: StatItem[] };

export type FAQItem = { q: string; a: string; short: string; tag: string };

export type FAQConfig = {
  eyebrow: string;
  headline: string;
  headlineSub: string;
  blurb: string;
  items: FAQItem[];
};

export type FinalCTAConfig = {
  eyebrow: string;
  headline: string;
  sub: string;
  cta: CTA;
};

export type FooterColumn = { title: string; links: NavLink[] };

export type FooterConfig = {
  tagline: string;
  copyright: string;
  madeWith: string;
  socials: { twitter?: string; linkedin?: string; youtube?: string; github?: string };
  columns: FooterColumn[];
};

export type ThemeConfig = {
  primary: string; // oklch or hex
  teal: string;
};

export type SEOConfig = {
  title: string;
  description: string;
  ogImage: string;
};

export type SectionId =
  | "hero"
  | "stats"
  | "features"
  | "showcase"
  | "process"
  | "demo"
  | "videos"
  | "testimonials"
  | "pricing"
  | "faq"
  | "finalcta";

export type SectionState = { id: SectionId; visible: boolean };

export type HomepageConfig = {
  version: 1;
  meta: SEOConfig;
  theme: ThemeConfig;
  navbar: NavbarConfig;
  hero: HeroConfig;
  stats: StatsConfig;
  faq: FAQConfig;
  finalCta: FinalCTAConfig;
  footer: FooterConfig;
  sections: SectionState[];
};

export const DEFAULT_CONFIG: HomepageConfig = {
  version: 1,
  meta: {
    title: "AIELTS — AI-powered IELTS preparation",
    description:
      "Reach Band 9 with an AI tutor for IELTS Listening, Reading, Writing, and Speaking — free drills, instant scoring, predicted bands.",
    ogImage: "/og-image.jpg",
  },
  theme: {
    primary: "oklch(0.55 0.22 264)",
    teal: "oklch(0.72 0.14 190)",
  },
  navbar: {
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#demo" },
      { label: "Videos", href: "/videos" },
      { label: "Stories", href: "/#stories" },
      { label: "Pricing", href: "/#pricing" },
    ],
    signInLabel: "Sign in",
    ctaLabel: "Start free",
    ctaHref: "/register",
  },
  hero: {
    eyebrow: "",
    headline: "Reach Band 9 with an AI tutor that never sleeps.",
    gradientWord: "9",
    sub: "AIELTS adapts every Listening, Reading, Writing and Speaking task to your level — with examiner-grade feedback in seconds, and a live partner to practise speaking with whenever you're ready.",
    ctaPrimary: { label: "Start free practice", href: "/register" },
    ctaSecondary: { label: "Watch 90-sec demo", href: "#demo" },
    skillChips: ["Listening", "Reading", "Writing", "Speaking"],
  },
  stats: {
    items: [
      { label: "Free video lessons", source: "videos", value: 0, suffix: "" },
      { label: "Study modules", source: "modules", value: 0, suffix: "" },
      { label: "Student stories", source: "testimonials", value: 0, suffix: "" },
      { label: "AI feedback turnaround", source: "custom", value: 60, suffix: "s" },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    headline: "Everything students ask",
    headlineSub: "before signing up.",
    blurb: "Still unsure? Drop us a message — a human replies within a few hours.",
    items: [
      { q: "Can I really hit Band 7+ using only AIELTS?", a: "Yes — most of our Pro students report a 0.5 to 1.5 band-score jump within 6–8 weeks of consistent practice. The AI tutor follows the same four-criterion rubric (Task Response, Coherence, Lexical Resource, Grammar) that Cambridge examiners use.", short: "Most Pro students gain 0.5–1.5 bands in 6–8 weeks, graded on the same four-criterion Cambridge rubric.", tag: "Results" },
      { q: "Is the AI Speaking Examiner the same as the real test?", a: "It mirrors the three-part IELTS Speaking format exactly — same timing, same cue cards, same Part 3 abstract follow-ups. You hear your fluency, pronunciation, and lexical-range scores within seconds of finishing.", short: "Same 3-part format, timing and rubric. Scores returned in seconds.", tag: "Speaking" },
      { q: "Spik Buddy vs. the AI Speaking Examiner?", a: "Spik Buddy pairs you one-to-one with a real student over end-to-end encrypted voice, video or chat — free practice built only for IELTS Speaking. Use it for natural conversation; use the AI Examiner for graded mock tests.", short: "Buddies for natural 1-to-1 conversation. Examiner for graded mocks.", tag: "Spik Buddy" },
      { q: "Do I need to pay to try it?", a: "No. The Starter plan is free forever and includes daily listening drills, weekly essay scoring, the community, and the band predictor. Pro unlocks unlimited mocks, unlimited essays, the AI speaking coach, and the 12-week study plan.", short: "Starter is free forever. No card needed to begin.", tag: "Pricing" },
      { q: "Can I cancel anytime?", a: "Yes. Pro is billed monthly or yearly and you can cancel from your dashboard in two clicks — no calls, no emails. Your access stays active until the end of the billing period.", short: "Two clicks from your dashboard. No calls, no emails.", tag: "Billing" },
      { q: "Academic or General Training?", a: "Both. Pick your test type in onboarding and AIELTS adapts every drill, essay prompt, and mock test accordingly.", short: "Both supported. Toggle in onboarding.", tag: "Setup" },
      { q: "How accurate is the band prediction?", a: "Trained on thousands of marked IELTS scripts and speaking samples — the predictor is accurate within ±0.5 of the real test for students who complete at least four full mocks.", short: "± 0.5 of the real test after four full mocks.", tag: "Prediction" },
    ],
  },
  finalCta: {
    eyebrow: "Start today",
    headline: "Your Band 9 starts with the next 10 minutes.",
    sub: "Free diagnostic. No credit card. See your predicted band before you commit to anything.",
    cta: { label: "Take the free diagnostic", href: "/register" },
  },
  footer: {
    tagline:
      "AI-powered IELTS preparation that adapts to your pace — listening, reading, writing, speaking.",
    copyright: "© 2024–{year} AIELTS. All rights reserved.",
    madeWith: "Made with care for future band-9 students.",
    socials: { twitter: "#", linkedin: "#", youtube: "#", github: "#" },
    columns: [
      { title: "Product", links: [
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Demo", href: "/#demo" },
        { label: "Changelog", href: "#" },
      ] },
      { title: "Company", links: [
        { label: "About", href: "#" },
        { label: "Sponsors", href: "/sponsors" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
      ] },
      { title: "Resources", links: [
        { label: "IELTS Tips", href: "#" },
        { label: "Band Scores", href: "#" },
        { label: "Help Center", href: "#" },
        { label: "Community", href: "#" },
      ] },
      { title: "Legal", links: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Cookies", href: "#" },
        { label: "DPA", href: "#" },
      ] },
    ],
  },
  sections: [
    { id: "hero", visible: true },
    { id: "stats", visible: true },
    { id: "features", visible: true },
    { id: "showcase", visible: true },
    { id: "process", visible: true },
    { id: "demo", visible: true },
    { id: "videos", visible: true },
    { id: "testimonials", visible: true },
    { id: "pricing", visible: true },
    { id: "faq", visible: true },
    { id: "finalcta", visible: true },
  ],
};

// Deep-merge a partial config from the DB over the defaults so missing fields
// always fall back to a sensible value. Arrays are replaced, not merged.
export function mergeConfig(partial: unknown): HomepageConfig {
  const out: HomepageConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  if (!partial || typeof partial !== "object") return out;
  const p = partial as Record<string, unknown>;
  for (const key of Object.keys(out) as (keyof HomepageConfig)[]) {
    const val = p[key as string];
    if (val === undefined || val === null) continue;
    if (Array.isArray(val) || typeof val !== "object") {
      // @ts-expect-error generic assignment
      out[key] = val;
    } else {
      // @ts-expect-error generic merge
      out[key] = { ...out[key], ...(val as Record<string, unknown>) };
    }
  }
  return out;
}
