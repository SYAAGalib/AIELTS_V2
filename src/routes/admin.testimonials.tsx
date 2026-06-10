import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  adminListTestimonials,
  adminUpsertTestimonial,
  adminDeleteTestimonial,
  type AdminTestimonial,
} from "@/lib/site-content.functions";

export const Route = createFileRoute("/admin/testimonials")({
  head: () => ({ meta: [{ title: "Testimonials — Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: TestimonialsAdmin,
});

const EMPTY: Partial<AdminTestimonial> = {
  name: "", city: "", target: "", quote: "", sort_order: 0, published: true,
};

function TestimonialsAdmin() {
  const list = useServerFn(adminListTestimonials);
  const upsert = useServerFn(adminUpsertTestimonial);
  const del = useServerFn(adminDeleteTestimonial);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-testimonials"], queryFn: () => list() });
  const [form, setForm] = useState<Partial<AdminTestimonial>>(EMPTY);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.name || !form.quote) { toast.error("Name and quote are required"); return; }
    setBusy(true);
    try {
      await upsert({ data: {
        id: form.id, name: form.name!, city: form.city ?? "", target: form.target ?? "",
        quote: form.quote!, sort_order: Number(form.sort_order ?? 0), published: form.published ?? true,
      }});
      toast.success(form.id ? "Updated" : "Created");
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      qc.invalidateQueries({ queryKey: ["public-testimonials"] });
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await del({ data: { id } });
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    qc.invalidateQueries({ queryKey: ["public-testimonials"] });
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Testimonials</h1>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">
          {form.id ? "Edit testimonial" : "Add testimonial"}
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Student name" value={form.name ?? ""} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="City" value={form.city ?? ""} onChange={(v) => setForm({ ...form, city: v })} />
          <Field label="Target / goal" value={form.target ?? ""} onChange={(v) => setForm({ ...form, target: v })} />
          <Field label="Sort order" type="number" value={String(form.sort_order ?? 0)} onChange={(v) => setForm({ ...form, sort_order: Number(v) })} />
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/70">Quote</label>
            <textarea
              rows={4}
              value={form.quote ?? ""}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 p-3 text-sm outline-none focus:border-[var(--teal)]"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.published ?? true} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={save} disabled={busy} className="rounded-lg bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
            {busy ? "Saving…" : form.id ? "Save changes" : "Add"}
          </button>
          {form.id && (
            <button onClick={() => setForm(EMPTY)} className="rounded-lg border border-white/15 px-4 py-2 text-sm">Cancel</button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">
          All testimonials ({data.length})
        </div>
        {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> : data.length === 0 ? (
          <p className="p-6 text-sm text-white/60">No testimonials yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {data.map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{t.name}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/60">{t.city}{t.target ? ` — ${t.target}` : ""}</span>
                    {!t.published && <span className="ml-2 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] uppercase text-amber-300">Draft</span>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-white/70">"{t.quote}"</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setForm(t)} className="rounded-md border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10">Edit</button>
                  <button onClick={() => remove(t.id)} className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-white/70">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
      />
    </div>
  );
}
