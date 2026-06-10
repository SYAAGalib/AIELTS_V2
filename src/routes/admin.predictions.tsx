import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { adminListPredictions, adminUpsertPrediction, adminDeletePrediction, type Prediction } from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/predictions")({
  head: () => ({ meta: [{ title: "Predictions — AIELTS Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: PredictionsAdmin,
});

const EMPTY: Partial<Prediction> = { topic: "", skill: "writing", content: "", exam_period: "", exam_date: null, status: "published" };

function PredictionsAdmin() {
  const list = useServerFn(adminListPredictions);
  const upsert = useServerFn(adminUpsertPrediction);
  const del = useServerFn(adminDeletePrediction);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-predictions"], queryFn: () => list() });
  const [form, setForm] = useState<Partial<Prediction>>(EMPTY);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.topic || !form.content) { toast.error("Topic and content required"); return; }
    setBusy(true);
    try {
      await upsert({ data: {
        id: form.id, topic: form.topic!, skill: form.skill as any, content: form.content!,
        exam_period: form.exam_period || null, exam_date: form.exam_date || null,
        status: (form.status as any) ?? "published",
      }});
      toast.success(form.id ? "Updated" : "Created");
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["admin-predictions"] });
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this prediction?")) return;
    await del({ data: { id } });
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-predictions"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Predictions</h2>
        <p className="text-sm text-white/50">Publish IELTS topic predictions for upcoming exam periods.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">{form.id ? "Edit" : "Add prediction"}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Inp label="Topic" value={form.topic ?? ""} onChange={(v) => setForm({ ...form, topic: v })} />
          <Sel label="Skill" value={form.skill ?? "writing"} onChange={(v) => setForm({ ...form, skill: v as any })} options={["listening","reading","writing","speaking"]} />
          <Inp label="Exam period (e.g. Jul–Aug 2026)" value={form.exam_period ?? ""} onChange={(v) => setForm({ ...form, exam_period: v })} />
          <Inp label="Exam date" type="date" value={form.exam_date ?? ""} onChange={(v) => setForm({ ...form, exam_date: v || null })} />
          <Sel label="Status" value={form.status ?? "published"} onChange={(v) => setForm({ ...form, status: v as any })} options={["draft","published","archived"]} />
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/70">Content</label>
            <textarea rows={6} value={form.content ?? ""} onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 p-3 text-sm outline-none focus:border-[var(--teal)]" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={save} disabled={busy} className="flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold disabled:opacity-60">
            <Plus className="h-4 w-4" /> {busy ? "Saving…" : form.id ? "Save" : "Add"}
          </button>
          {form.id && <button onClick={() => setForm(EMPTY)} className="rounded-lg border border-white/15 px-4 py-2 text-sm">Cancel</button>}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">Predictions ({data.length})</div>
        {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> :
         data.length === 0 ? <p className="p-6 text-sm text-white/60">No predictions yet.</p> : (
          <ul className="divide-y divide-white/5">
            {data.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded bg-white/10 px-2 py-0.5 uppercase">{p.skill}</span>
                    {p.exam_period && <span className="text-white/50">{p.exam_period}</span>}
                    {p.status !== "published" && <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300">{p.status}</span>}
                  </div>
                  <p className="mt-1 font-semibold">{p.topic}</p>
                  <p className="text-sm text-white/70 line-clamp-2">{p.content}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setForm(p)} className="rounded-md border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10"><Edit3 className="h-3 w-3 inline mr-1" />Edit</button>
                  <button onClick={() => remove(p.id)} className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"><Trash2 className="h-3 w-3 inline mr-1" />Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
function Inp({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return <div><label className="text-xs font-medium text-white/70">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" /></div>;
}
function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div><label className="text-xs font-medium text-white/70">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]">
      {options.map((o) => <option key={o} value={o} className="bg-[#0B1224]">{o}</option>)}
    </select></div>;
}
