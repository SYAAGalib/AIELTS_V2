import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Clock, Save, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import {
  studentListQuestions,
  studentSubmitWriting,
  studentListWriting,
} from "@/lib/student.functions";

export const Route = createFileRoute("/dashboard/writing")({
  head: () => ({
    meta: [
      { title: "IELTS Writing Practice — AIELTS" },
      { name: "description", content: "Practice IELTS Writing with real prompts and instant AI scoring." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WritingPage,
});

function WritingPage() {
  const list = useServerFn(studentListQuestions);
  const submit = useServerFn(studentSubmitWriting);
  const history = useServerFn(studentListWriting);
  const qc = useQueryClient();

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ["practice-questions", "writing"],
    queryFn: () => list({ data: { skill: "writing", limit: 10 } }),
  });
  const { data: prevSubs = [] } = useQuery({
    queryKey: ["my-writing"], queryFn: () => history(),
  });

  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const current = prompts[idx];
  const taskType: string = (current?.body as any)?.task_type ?? current?.tags?.[0] ?? "Task 2";
  const minWords = taskType.toLowerCase().includes("task 1") ? 150 : 250;
  const minutes = taskType.toLowerCase().includes("task 1") ? 20 : 40;
  const [secs, setSecs] = useState(minutes * 60);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  useEffect(() => { setSecs(minutes * 60); setText(""); }, [idx, minutes]);
  useEffect(() => {
    if (!current) return;
    const id = window.setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [current]);

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const submitM = useMutation({
    mutationFn: () => submit({ data: { taskType, prompt: current.prompt, essay: text } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-writing"] });
      qc.invalidateQueries({ queryKey: ["student-overview"] });
      qc.invalidateQueries({ queryKey: ["student-progress"] });
      setText("");
    },
  });

  const lastResult = useMemo(() => submitM.data, [submitM.data]);

  if (isLoading) {
    return <div className="rounded-2xl border bg-card p-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>;
  }
  if (prompts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-[var(--teal)]" />
        <p className="mt-3 font-semibold">No writing prompts published yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Your instructors will add prompts soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Writing</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Writing practice</h2>
        </div>
        <div className="flex gap-2">
          {prompts.map((_: any, i: number) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-8 w-8 rounded-md border text-xs ${i === idx ? "bg-primary text-primary-foreground border-primary" : ""}`}>{i + 1}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{taskType} · {minutes} min · {minWords}+ words</p>
          <h3 className="mt-1 font-display text-xl font-semibold">{current.prompt}</h3>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Time left <span className="font-display font-bold tabular-nums text-foreground">{fmt(secs)}</span></span>
            <span className="flex items-center gap-1.5 text-[var(--teal)]"><Save className="h-3.5 w-3.5" /> Auto-save on submit</span>
          </div>
          <textarea
            value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Start typing your essay…"
            className="mt-4 h-[420px] w-full resize-none rounded-lg border bg-background p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Words: <span className="font-display text-lg font-bold text-foreground">{wordCount}</span> / {minWords}</span>
            <button onClick={() => submitM.mutate()} disabled={submitM.isPending || wordCount < 30}
              className="rounded-lg gradient-brand px-5 py-2 text-sm font-semibold text-white shadow-lg disabled:opacity-50">
              {submitM.isPending ? "Scoring…" : "Score my essay"}
            </button>
          </div>
        </div>
      </div>

      {lastResult && (
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">AI feedback</p>
          <h3 className="font-display text-2xl font-bold">Band <span className="text-primary">{lastResult.band}</span></h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-[var(--teal)]"><CheckCircle2 className="h-4 w-4" /> Saved · {lastResult.word_count} words</p>
        </div>
      )}

      {prevSubs.length > 0 && (
        <div className="rounded-2xl border bg-card p-6">
          <p className="font-display text-lg font-semibold">Recent submissions</p>
          <ul className="mt-3 divide-y">
            {prevSubs.slice(0, 5).map((s: any) => (
              <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                <span className="truncate pr-3 text-muted-foreground">{s.task_type} · {s.prompt}</span>
                <span className="shrink-0 font-display font-semibold text-primary">Band {s.band ?? "—"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
