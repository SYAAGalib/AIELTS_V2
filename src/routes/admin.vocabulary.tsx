import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Edit3, Trash2 } from "lucide-react";
import { adminListVocab, adminUpsertVocab, adminDeleteVocab, type Vocab } from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/vocabulary")({
  head: () => ({ meta: [{ title: "Vocabulary — AIELTS Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: VocabularyAdmin,
});

const EMPTY: Partial<Vocab> = {
  word: "", part_of_speech: "", definition: "", example: "", cefr: "B2", tags: [], status: "published",
};

function VocabularyAdmin() {
  const list = useServerFn(adminListVocab);
  const upsert = useServerFn(adminUpsertVocab);
  const del = useServerFn(adminDeleteVocab);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-vocab"], queryFn: () => list() });
  const [form, setForm] = useState<Partial<Vocab>>(EMPTY);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return data.filter((v) => !t || v.word.toLowerCase().includes(t) || (v.definition ?? "").toLowerCase().includes(t));
  }, [data, q]);

  async function save() {
    if (!form.word) { toast.error("Word is required"); return; }
    setBusy(true);
    try {
      await upsert({ data: {
        id: form.id, word: form.word!, part_of_speech: form.part_of_speech || null,
        definition: form.definition || null, example: form.example || null, cefr: form.cefr || null,
        tags: form.tags ?? [], status: (form.status as any) ?? "published",
      }});
      toast.success(form.id ? "Updated" : "Added");
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["admin-vocab"] });
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this word?")) return;
    await del({ data: { id } });
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-vocab"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Vocabulary</h2>
        <p className="text-sm text-white/50">Curate the IELTS vocabulary bank.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">{form.id ? "Edit word" : "Add word"}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <FieldI label="Word" value={form.word ?? ""} onChange={(v) => setForm({ ...form, word: v })} />
          <FieldI label="Part of speech" value={form.part_of_speech ?? ""} onChange={(v) => setForm({ ...form, part_of_speech: v })} />
          <FieldI label="CEFR (A1–C2)" value={form.cefr ?? ""} onChange={(v) => setForm({ ...form, cefr: v })} />
          <FieldI label="Tags (comma-separated)" value={(form.tags ?? []).join(", ")}
            onChange={(v) => setForm({ ...form, tags: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/70">Definition</label>
            <textarea rows={2} value={form.definition ?? ""} onChange={(e) => setForm({ ...form, definition: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 p-3 text-sm outline-none focus:border-[var(--teal)]" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/70">Example sentence</label>
            <textarea rows={2} value={form.example ?? ""} onChange={(e) => setForm({ ...form, example: e.target.value })}
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

      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
        <Search className="h-4 w-4 text-white/50" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search words…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-white/40" />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">
          Words ({filtered.length}{filtered.length !== data.length ? ` of ${data.length}` : ""})
        </div>
        {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> :
         filtered.length === 0 ? <p className="p-6 text-sm text-white/60">{data.length === 0 ? "No words yet." : "No matches."}</p> : (
          <ul className="divide-y divide-white/5">
            {filtered.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{v.word}</span>
                    {v.part_of_speech && <span className="text-xs text-white/50 italic">{v.part_of_speech}</span>}
                    {v.cefr && <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">{v.cefr}</span>}
                  </div>
                  <p className="text-sm text-white/70 line-clamp-1">{v.definition}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setForm(v)} className="rounded-md border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10"><Edit3 className="h-3 w-3 inline mr-1" />Edit</button>
                  <button onClick={() => remove(v.id)} className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"><Trash2 className="h-3 w-3 inline mr-1" />Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FieldI({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-white/70">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" />
    </div>
  );
}
