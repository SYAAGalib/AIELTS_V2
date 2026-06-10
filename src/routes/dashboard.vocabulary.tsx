import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, BookOpen } from "lucide-react";
import { studentListVocab } from "@/lib/student.functions";

export const Route = createFileRoute("/dashboard/vocabulary")({
  head: () => ({
    meta: [
      { title: "Vocabulary — AIELTS Dashboard" },
      { name: "description", content: "Curated IELTS vocabulary with definitions, CEFR level, and examples." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VocabPage,
});

function VocabPage() {
  const list = useServerFn(studentListVocab);
  const { data = [], isLoading } = useQuery({ queryKey: ["student-vocab"], queryFn: () => list() });
  const [q, setQ] = useState("");
  const [cefr, setCefr] = useState<string>("all");

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return data.filter((v) =>
      (cefr === "all" || v.cefr === cefr) &&
      (!t || v.word.toLowerCase().includes(t) || (v.definition ?? "").toLowerCase().includes(t)),
    );
  }, [data, q, cefr]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Vocabulary</p>
        <h2 className="mt-1 font-display text-3xl font-bold">Word bank</h2>
        <p className="text-sm text-muted-foreground">High-yield vocabulary for IELTS.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search words…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        <select value={cefr} onChange={(e) => setCefr(e.target.value)}
          className="rounded-lg border bg-card px-3 py-2 text-sm">
          {["all","A1","A2","B1","B2","C1","C2"].map((c) => <option key={c} value={c}>{c === "all" ? "All CEFR" : c}</option>)}
        </select>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
       filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <BookOpen className="mx-auto h-6 w-6 text-[var(--teal)]" />
          <p className="mt-3 font-semibold">{data.length === 0 ? "No vocabulary yet" : "No matches"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{data.length === 0 ? "Words will appear once instructors add them." : "Try a different search."}</p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <li key={v.id} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <p className="font-display text-lg font-bold">{v.word}</p>
                {v.part_of_speech && <span className="text-xs italic text-muted-foreground">{v.part_of_speech}</span>}
                {v.cefr && <span className="ml-auto rounded bg-[var(--teal)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--teal)]">{v.cefr}</span>}
              </div>
              {v.definition && <p className="mt-2 text-sm">{v.definition}</p>}
              {v.example && <p className="mt-2 text-xs italic text-muted-foreground">"{v.example}"</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
