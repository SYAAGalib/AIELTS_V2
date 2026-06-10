import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { adminListContent, adminUpsertContent, adminDeleteContent, type ContentItem } from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/content")({
  head: () => ({ meta: [{ title: "Content — AIELTS Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ContentAdmin,
});

const EMPTY: any = {
  slug: "", title: "", excerpt: "", body: {}, cover_url: "", category: "", status: "draft",
  bodyText: "{}",
};

function ContentAdmin() {
  const list = useServerFn(adminListContent);
  const upsert = useServerFn(adminUpsertContent);
  const del = useServerFn(adminDeleteContent);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-content"], queryFn: () => list() });
  const [form, setForm] = useState<any>(EMPTY);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.slug || !form.title) { toast.error("Slug and title required"); return; }
    let body: any = {};
    try { body = JSON.parse(form.bodyText || "{}"); } catch { toast.error("Body JSON invalid"); return; }
    setBusy(true);
    try {
      await upsert({ data: {
        id: form.id, slug: form.slug, title: form.title,
        excerpt: form.excerpt || null, body, cover_url: form.cover_url || null,
        category: form.category || null, status: form.status,
      }});
      toast.success(form.id ? "Updated" : "Created");
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["admin-content"] });
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    await del({ data: { id } });
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-content"] });
  }
  function edit(c: ContentItem) { setForm({ ...c, bodyText: JSON.stringify(c.body ?? {}, null, 2) }); }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Content</h2>
        <p className="text-sm text-white/50">Blog posts, study guides, and other long-form content.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">{form.id ? "Edit" : "Add content"}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Inp label="Slug" value={form.slug ?? ""} onChange={(v) => setForm({ ...form, slug: v })} />
          <Inp label="Title" value={form.title ?? ""} onChange={(v) => setForm({ ...form, title: v })} />
          <Inp label="Category" value={form.category ?? ""} onChange={(v) => setForm({ ...form, category: v })} />
          <Inp label="Cover URL" value={form.cover_url ?? ""} onChange={(v) => setForm({ ...form, cover_url: v })} />
          <Sel label="Status" value={form.status ?? "draft"} onChange={(v) => setForm({ ...form, status: v })} options={["draft","published","archived"]} />
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/70">Excerpt</label>
            <textarea rows={2} value={form.excerpt ?? ""} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 p-3 text-sm outline-none focus:border-[var(--teal)]" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/70">Body (JSON)</label>
            <textarea rows={8} value={form.bodyText} onChange={(e) => setForm({ ...form, bodyText: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 p-3 font-mono text-xs outline-none focus:border-[var(--teal)]" />
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
        <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">Content ({data.length})</div>
        {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> :
         data.length === 0 ? <p className="p-6 text-sm text-white/60">No content yet.</p> : (
          <ul className="divide-y divide-white/5">
            {data.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-xs text-white/50">{c.slug} {c.category ? `· ${c.category}` : ""} {c.status !== "published" ? `· ${c.status}` : ""}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => edit(c)} className="rounded-md border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10"><Edit3 className="h-3 w-3 inline mr-1" />Edit</button>
                  <button onClick={() => remove(c.id)} className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"><Trash2 className="h-3 w-3 inline mr-1" />Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
function Inp({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <div><label className="text-xs font-medium text-white/70">{label}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" /></div>;
}
function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div><label className="text-xs font-medium text-white/70">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]">
      {options.map((o) => <option key={o} value={o} className="bg-[#0B1224]">{o}</option>)}
    </select></div>;
}
