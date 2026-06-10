import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/sections/Hero";
import { StatsBar } from "@/components/site/sections/StatsBar";
import { Features } from "@/components/site/sections/Features";
import { HorizontalShowcase } from "@/components/site/sections/HorizontalShowcase";
import { ProcessScroll } from "@/components/site/sections/ProcessScroll";
import { Demo } from "@/components/site/sections/Demo";
import { Videos } from "@/components/site/sections/Videos";
import { Pricing } from "@/components/site/sections/Pricing";
import { FAQ } from "@/components/site/sections/FAQ";
import { Testimonials } from "@/components/site/sections/Testimonials";
import { FinalCTA } from "@/components/site/sections/FinalCTA";
import { AmbientScrollBackground } from "@/components/site/AmbientScrollBackground";
import { Sponsors } from "@/components/site/sections/Sponsors";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AIELTS — AI-powered IELTS preparation" },
      { name: "description", content: "Reach Band 9 with an AI tutor for IELTS Listening, Reading, Writing, and Speaking — free drills, instant scoring, predicted bands." },
      { property: "og:title", content: "AIELTS — AI-powered IELTS preparation" },
      { property: "og:description", content: "Reach Band 9 with an AI tutor for IELTS Listening, Reading, Writing, and Speaking — free drills, instant scoring, predicted bands." },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AIELTS",
          url: "/",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "AIELTS",
          url: "/",
          logo: "/favicon.ico",
          description: "AI-powered IELTS preparation platform.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "AIELTS — AI-powered IELTS preparation",
          description: "AI tutor for IELTS Listening, Reading, Writing, and Speaking with instant scoring and adaptive study plans.",
          brand: { "@type": "Brand", name: "AIELTS" },
          offers: [
            { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
            { "@type": "Offer", name: "Pro Monthly", price: "19", priceCurrency: "USD", availability: "https://schema.org/InStock" },
            { "@type": "Offer", name: "Pro Yearly", price: "149", priceCurrency: "USD", availability: "https://schema.org/InStock" },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen bg-background">
      <AmbientScrollBackground />
      <Navbar />
      <main className="relative">
        <Hero />
        <StatsBar />
        <Features />
        <HorizontalShowcase />
        <ProcessScroll />
        <Demo />
        <Videos />
        <Testimonials />
        <Sponsors />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
