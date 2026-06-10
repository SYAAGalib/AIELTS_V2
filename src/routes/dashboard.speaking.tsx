import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Mic, Send, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { studentListQuestions, studentSaveSpeaking } from "@/lib/student.functions";

export const Route = createFileRoute("/dashboard/speaking")({
  head: () => ({
    meta: [
      { title: "IELTS Speaking Practice — AIELTS" },
      { name: "description", content: "Practice IELTS Speaking with real cue cards and AI-scored sessions." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SpeakingPage,
});

function SpeakingPage() {
  const list = useServerFn(studentListQuestions);
  const save = useServerFn(studentSaveSpeaking);
  const qc = useQueryClient();

  const { data: cues = [], isLoading } = useQuery({
    queryKey: ["practice-questions", "speaking"],
    queryFn: () => list({ data: { skill: "speaking", limit: 10 } }),
  });

  const [idx, setIdx] = useState(0);
  const [turns, setTurns] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);
  const [draft, setDraft] = useState("");
  const current = cues[idx];

  const saveM = useMutation({
    mutationFn: () => save({ data: { topic: current?.prompt, transcript: turns } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student-overview"] });
      qc.invalidateQueries({ queryKey: ["student-progress"] });
    },
  });

  const submitTurn = () => {
    if (!draft.trim()) return;
    setTurns((t) => [...t, { role: "user", text: draft.trim() }, { role: "ai", text: "Good. Can you give a concrete example?" }]);
    setDraft("");
  };

  if (isLoading) {
    return <div className="rounded-2xl border bg-card p-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>;
  }
  if (cues.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-[var(--teal)]" />
        <p className="mt-3 font-semibold">No speaking cue cards published yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Your instructors will add cue cards soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Speaking</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Speaking practice</h2>
        </div>
        <div className="flex gap-2">
          {cues.map((_: any, i: number) => (
            <button key={i} onClick={() => { setIdx(i); setTurns([]); }}
              className={`h-8 w-8 rounded-md border text-xs ${i === idx ? "bg-primary text-primary-foreground border-primary" : ""}`}>{i + 1}</button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Cue card</p>
        <h3 className="mt-1 font-display text-xl font-semibold">{current.prompt}</h3>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <div className="space-y-3">
          {turns.length === 0 && (
            <p className="text-sm text-muted-foreground">Tap the mic or type your response. The AI examiner will reply.</p>
          )}
          {turns.map((t, i) => (
            <div key={i} className={`rounded-lg border p-3 text-sm ${t.role === "user" ? "bg-primary/5" : "bg-muted/40"}`}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.role === "user" ? "You" : "AI examiner"}</p>
              <p className="mt-1">{t.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"><Mic className="h-4 w-4" /></button>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitTurn()}
            placeholder="Type your answer…"
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          <button onClick={submitTurn} className="grid h-10 w-10 place-items-center rounded-full border"><Send className="h-4 w-4" /></button>
        </div>
      </div>

      <button onClick={() => saveM.mutate()} disabled={saveM.isPending || turns.length === 0}
        className="w-full rounded-lg gradient-brand py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-50">
        {saveM.isPending ? "Saving…" : "End session & save"}
      </button>

      {saveM.data && (
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Session saved</p>
          <h3 className="font-display text-2xl font-bold">Score <span className="text-primary">{saveM.data.score}</span></h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-[var(--teal)]"><CheckCircle2 className="h-4 w-4" /> Added to your progress</p>
        </div>
      )}
    </div>
  );
}
