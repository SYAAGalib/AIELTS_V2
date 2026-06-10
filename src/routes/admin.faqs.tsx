import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  adminListFaqs,
  adminUpsertFaq,
  adminDeleteFaq,
  type AdminFaq,
} from "@/lib/site-content.functions";

export const Route = createFileRoute("/admin/faqs")({
  head: () => ({ meta: [{ title: "FAQs — Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: FaqsAdmin,
});

const EMPTY: Partial<AdminFaq> = {
  question: "", short_answer: "", full_answer: "", tag: "General",
  sort_order: 0, featured: false, highlight: false, published: true,
};

function FaqsAdmin() {
  const list = useServerFn(adminListFaqs);
  const upsert = useServerFn(adminUpsertFaq);
  const del = useServerFn(adminDeleteFaq);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-faqs"], queryFn: () => list() });
  const [form, setForm] = useState<Partial<AdminFaq>>(EMPTY);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.question || !form.full_answer) { toast.error("Question and full answer are required"); return; }
    setBusy(true);
    try {
      await upsert({ data: {
        id: form.id,
        question: form.question!,
        short_answer: form.short_answer ?? "",
        full_answer: form.full_answer!,
        tag: form.tag ?? "General",
        sort_order: Number(form.sort_order ?? 0),
        featured: form.featured ?? false,
        highlight: form.highlight ?? false,
        published: form.published ?? true,
      }});
      toast.success(form.id ? "Updated" : "Created");
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["admin-faqs"] });
      qc.invalidateQueries({ queryKey: ["public-faqs"] });
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    await del({ data: { id } });
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-faqs"] });
    qc.invalidateQueries({ queryKey: ["public-faqs"] });
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">FAQs</h1>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">
          {form.id ? "Edit FAQ" : "Add FAQ"}
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/70">Question</label>
            <input value={form.question ?? ""} onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-white/70">Tag</label>
            <input value={form.tag ?? ""} onChange={(e) => setForm({ ...form, tag: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-white/70">Sort order</label>
            <input type="number" value={String(form.sort_order ?? 0)} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/70">Short answer (shown on card)</label>
            <textarea rows={2} value={form.short_answer ?? ""} onChange={(e) => setForm({ ...form, short_answer: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 p-3 text-sm outline-none focus:border-[var(--teal)]" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/70">Full answer</label>
            <textarea rows={5} value={form.full_answer ?? ""} onChange={(e) => setForm({ ...form, full_answer: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 p-3 text-sm outline-none focus:border-[var(--teal)]" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured ?? false} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured (large tile, shows full answer)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.highlight ?? false} onChange={(e) => setForm({ ...form, highlight: e.target.checked })} />
            Highlight (wider, primary border)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.published ?? true} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={save} disabled={busy} className="rounded-lg bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
            {busy ? "Saving…" : form.id ? "Save changes" : "Add"}
          </button>
          {form.id && <button onClick={() => setForm(EMPTY)} className="rounded-lg border border-white/15 px-4 py-2 text-sm">Cancel</button>}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">
          All FAQs ({data.length})
        </div>
        {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> : data.length === 0 ? (
          <p className="p-6 text-sm text-white/60">No FAQs yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {data.map((f) => (
              <li key={f.id} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider">{f.tag}</span>
                    <span className="font-semibold">{f.question}</span>
                    {f.featured && <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] uppercase text-blue-300">Featured</span>}
                    {f.highlight && <span className="rounded bg-[var(--teal)]/20 px-2 py-0.5 text-[10px] uppercase text-[var(--teal)]">Highlight</span>}
                    {!f.published && <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] uppercase text-amber-300">Draft</span>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-white/70">{f.short_answer || f.full_answer}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setForm(f)} className="rounded-md border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10">Edit</button>
                  <button onClick={() => remove(f.id)} className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
