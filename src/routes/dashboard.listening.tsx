import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import {
  studentListQuestions,
  studentStartAttempt,
  studentSubmitAttempt,
} from "@/lib/student.functions";

export const Route = createFileRoute("/dashboard/listening")({
  head: () => ({
    meta: [
      { title: "IELTS Listening Practice — AIELTS" },
      { name: "description", content: "Practice IELTS Listening with real questions and AI-scored attempts." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ListeningPage,
});

function ListeningPage() {
  return <PracticePage skill="listening" title="Listening practice" intro="Answer the published listening questions below. Your attempt is scored and saved to your progress." />;
}

export function PracticePage({ skill, title, intro }: { skill: "listening" | "reading"; title: string; intro: string }) {
  const list = useServerFn(studentListQuestions);
  const start = useServerFn(studentStartAttempt);
  const submit = useServerFn(studentSubmitAttempt);
  const qc = useQueryClient();
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["practice-questions", skill],
    queryFn: () => list({ data: { skill, limit: 15 } }),
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ correct: number; total: number; band: number } | null>(null);
  const startM = useMutation({ mutationFn: () => start({ data: { skill } }) });
  const submitM = useMutation({
    mutationFn: async () => {
      const s = await startM.mutateAsync();
      const payload = questions.map((q: any) => ({ questionId: q.id, answer: answers[q.id] ?? "" }));
      return submit({ data: { attemptId: s.attemptId, answers: payload } });
    },
    onSuccess: (r) => { setResult(r); qc.invalidateQueries({ queryKey: ["student-overview"] }); qc.invalidateQueries({ queryKey: ["student-progress"] }); },
  });

  const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{skill}</p>
        <h2 className="mt-1 font-display text-3xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{intro}</p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-[var(--teal)]" />
          <p className="mt-3 font-semibold">No {skill} questions published yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Your instructors will add questions soon.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{answeredCount} / {questions.length} answered</p>
          <div className="space-y-3">
            {questions.map((q: any, i: number) => {
              const opts: string[] = q.body?.options ?? q.body?.opts ?? [];
              return (
                <div key={q.id} className="rounded-2xl border bg-card p-5">
                  <p className="text-xs text-muted-foreground">Q{i + 1} · {q.type}</p>
                  <p className="mt-1 font-medium">{q.prompt}</p>
                  {opts.length > 0 ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {opts.map((o: string) => (
                        <label key={o} className="flex items-center gap-2 rounded-md border p-2 text-sm hover:border-primary/40 cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            checked={answers[q.id] === o}
                            onChange={() => setAnswers((a) => ({ ...a, [q.id]: o }))}
                            className="accent-[var(--primary)]"
                          />
                          {o}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      className="mt-3 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Type your answer"
                      value={answers[q.id] ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => submitM.mutate()}
            disabled={submitM.isPending || answeredCount === 0}
            className="w-full rounded-lg gradient-brand py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {submitM.isPending ? "Scoring…" : "Submit & score"}
          </button>

          {result && (
            <div className="rounded-2xl border bg-card p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Results</p>
              <h3 className="font-display text-2xl font-bold">
                {result.correct} / {result.total} → Band <span className="text-primary">{result.band}</span>
              </h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-[var(--teal)]">
                <CheckCircle2 className="h-4 w-4" /> Saved to your progress
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
