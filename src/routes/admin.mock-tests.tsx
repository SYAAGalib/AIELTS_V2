import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { adminListMockTests, adminUpsertMockTest, adminDeleteMockTest, type MockTest } from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/mock-tests")({
  head: () => ({ meta: [{ title: "Mock tests — AIELTS Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: MockTestsAdmin,
});

const EMPTY: Partial<MockTest> = { slug: "", title: "", description: "", duration_minutes: 180, is_full_test: true, status: "draft" };

function MockTestsAdmin() {
  const list = useServerFn(adminListMockTests);
  const upsert = useServerFn(adminUpsertMockTest);
  const del = useServerFn(adminDeleteMockTest);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-mock-tests"], queryFn: () => list() });
  const [form, setForm] = useState<Partial<MockTest>>(EMPTY);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.slug || !form.title) { toast.error("Slug and title required"); return; }
    setBusy(true);
    try {
      await upsert({ data: {
        id: form.id, slug: form.slug!, title: form.title!,
        description: form.description || null,
        duration_minutes: Number(form.duration_minutes ?? 180),
        is_full_test: form.is_full_test ?? true, status: form.status as any,
      }});
      toast.success(form.id ? "Updated" : "Created");
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["admin-mock-tests"] });
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this mock test?")) return;
    await del({ data: { id } });
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-mock-tests"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Mock tests</h2>
        <p className="text-sm text-white/50">Create full or skill-specific IELTS mock tests.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">{form.id ? "Edit mock test" : "Add mock test"}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Inp label="Slug" value={form.slug ?? ""} onChange={(v) => setForm({ ...form, slug: v })} />
          <Inp label="Title" value={form.title ?? ""} onChange={(v) => setForm({ ...form, title: v })} />
          <Inp label="Duration (minutes)" type="number" value={String(form.duration_minutes ?? 180)} onChange={(v) => setForm({ ...form, duration_minutes: Number(v) })} />
          <Sel label="Status" value={form.status ?? "draft"} onChange={(v) => setForm({ ...form, status: v as any })} options={["draft","published","archived"]} />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.is_full_test ?? true} onChange={(e) => setForm({ ...form, is_full_test: e.target.checked })} />
            Full 4-skill mock test
          </label>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/70">Description</label>
            <textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })}
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
        <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">Mock tests ({data.length})</div>
        {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> :
         data.length === 0 ? <p className="p-6 text-sm text-white/60">No mock tests yet.</p> : (
          <ul className="divide-y divide-white/5">
            {data.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{t.title}</p>
                  <p className="text-xs text-white/50">{t.slug} · {t.duration_minutes} min {t.is_full_test ? "· full test" : ""} {t.status !== "published" ? `· ${t.status}` : ""}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setForm(t)} className="rounded-md border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10"><Edit3 className="h-3 w-3 inline mr-1" />Edit</button>
                  <button onClick={() => remove(t.id)} className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"><Trash2 className="h-3 w-3 inline mr-1" />Delete</button>
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
