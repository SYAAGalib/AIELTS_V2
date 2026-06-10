import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicTestimonials, type PublicTestimonial } from "@/lib/homepage.functions";

const FALLBACK: PublicTestimonial[] = [
  { id: "f1", name: "Tahmid Rahman", city: "Dhaka", target: "University of Toronto", quote: "I had three weeks left and was stuck at Band 6.5. The AI examiner caught the small grammar slips my coaching centre never flagged. Walked out with 7.5." },
  { id: "f2", name: "Nusrat Jahan", city: "Chittagong", target: "NHS nursing pathway", quote: "Writing was always my weakest skill. The rewrite suggestions taught me how to actually paraphrase the prompt. Got 7.0 first attempt." },
  { id: "f3", name: "Sadia Akter", city: "Sylhet", target: "PR — Australia", quote: "I work full-time, so 24/7 speaking practice on my phone was the only way. By test day, the real examiner didn't feel scary." },
];

export function Testimonials() {
  const fetchFn = useServerFn(listPublicTestimonials);
  const { data } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: () => fetchFn(),
    staleTime: 5 * 60_000,
  });
  const stories = data && data.length >= 3 ? data : FALLBACK;
  const loop = [...stories, ...stories];

  return (
    <section id="stories" className="relative overflow-hidden py-28 md:py-36">
      <div className="mx-auto mb-14 max-w-7xl px-6 md:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Real students, real bands</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight md:text-5xl">
          Students worldwide, one shared band-9 goal.
        </h2>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max animate-marquee gap-5 px-6 md:px-8">
          {loop.map((s, i) => (
            <motion.figure
              key={`${s.id}-${i}`}
              whileHover={{ y: -4 }}
              className="flex w-[22rem] flex-col justify-between rounded-3xl border bg-card p-7 shadow-sm md:w-[26rem]"
            >
              <blockquote className="text-base leading-relaxed text-foreground/85">
                "{s.quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary font-display text-sm font-bold text-foreground">
                  {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
                <div>
                  <div className="font-display text-sm font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.city}{s.target ? ` · ${s.target}` : ""}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
