import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Sponsors } from "@/components/site/sections/Sponsors";
import { SponsorTiers } from "@/components/site/sections/SponsorTiers";
import { Heart } from "lucide-react";

const SUPPORTERS = [
  "Arif Hossain", "Tanvir Ahmed", "Rumana Sultana", "Mehedi Hasan", "Sabbir Khan",
  "Nadia Islam", "Rafiul Karim", "Sumaiya Rahman", "Imran Chowdhury", "Farzana Akter",
  "Shafiq Alam", "Mahbub Hossain", "Tasnim Jahan", "Asif Iqbal", "Rashed Mahmud",
  "Nazia Kabir", "Sajid Rahman", "Tania Parvin", "Riaz Uddin", "Sharmin Akhter",
  "Hasibul Haque", "Mahmuda Begum", "Kawsar Ahmed", "Sadia Noor", "Anwar Hossain",
  "Lamia Sultana", "Tareq Aziz", "Munira Khatun", "Faisal Rahman", "Nilufa Yasmin",
];

export const Route = createFileRoute("/sponsors")({
  head: () => ({
    meta: [
      { title: "Sponsors — AIELTS" },
      { name: "description", content: "The sponsors and supporters who keep AIELTS free for students. Tier breakdown, recognition, and how to join." },
      { property: "og:title", content: "Sponsors — AIELTS" },
      { property: "og:description", content: "Sponsors and supporters who keep AIELTS free for students." },
    ],
    links: [{ rel: "canonical", href: "/sponsors" }],
  }),
  component: SponsorsPage,
});

function SponsorsPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      <main className="relative">
        <section className="border-b py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Sponsors</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">
              The people and brands keeping AIELTS free.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              Every tier — from Platinum partners to ৳500 supporters — funds a better software experience and keeps the Free tier free for every student.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="mailto:sponsors@aielts.app"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Become a sponsor
              </a>
              <Link
                to="/"
                hash="sponsors"
                className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>

        <SponsorTiers />
        <Sponsors />

        {/* Supporters — below 10k */}
        <section className="border-t bg-muted/10 py-16">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Heart className="h-4 w-4 text-primary" />
                Supporters
              </div>
              <span className="text-[11px] text-muted-foreground">Below ৳10,000</span>
            </div>
            <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
              Individuals and small contributors whose support adds up to something real. Thank you.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {SUPPORTERS.map((name) => (
                <span key={name} className="text-xs text-muted-foreground">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
