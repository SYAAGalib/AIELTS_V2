import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { adminListMail, adminUpsertMail, adminDeleteMail, type MailTemplate } from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/mail")({
  head: () => ({ meta: [{ title: "Mail templates — AIELTS Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: MailAdmin,
});

const EMPTY: Partial<MailTemplate> = { name: "", subject: "", html: "", text: "" };

function MailAdmin() {
  const list = useServerFn(adminListMail);
  const upsert = useServerFn(adminUpsertMail);
  const del = useServerFn(adminDeleteMail);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-mail"], queryFn: () => list() });
  const [form, setForm] = useState<Partial<MailTemplate>>(EMPTY);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.name || !form.subject || !form.html) { toast.error("Name, subject and HTML required"); return; }
    setBusy(true);
    try {
      await upsert({ data: {
        id: form.id, name: form.name!, subject: form.subject!, html: form.html!, text: form.text || null,
      }});
      toast.success(form.id ? "Updated" : "Created");
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["admin-mail"] });
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this template?")) return;
    await del({ data: { id } });
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-mail"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Mail templates</h2>
        <p className="text-sm text-white/50">Transactional email templates stored in the database.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">{form.id ? "Edit template" : "Add template"}</h3>
        <div className="mt-4 grid gap-3">
          <Inp label="Name (key, e.g. welcome)" value={form.name ?? ""} onChange={(v) => setForm({ ...form, name: v })} />
          <Inp label="Subject" value={form.subject ?? ""} onChange={(v) => setForm({ ...form, subject: v })} />
          <div>
            <label className="text-xs font-medium text-white/70">HTML body</label>
            <textarea rows={8} value={form.html ?? ""} onChange={(e) => setForm({ ...form, html: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 p-3 font-mono text-xs outline-none focus:border-[var(--teal)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-white/70">Plain text (optional)</label>
            <textarea rows={4} value={form.text ?? ""} onChange={(e) => setForm({ ...form, text: e.target.value })}
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
        <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">Templates ({data.length})</div>
        {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> :
         data.length === 0 ? <p className="p-6 text-sm text-white/60">No templates yet.</p> : (
          <ul className="divide-y divide-white/5">
            {data.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-mono text-sm">{t.name}</p>
                  <p className="text-xs text-white/60">{t.subject}</p>
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
function Inp({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <div><label className="text-xs font-medium text-white/70">{label}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" /></div>;
}
