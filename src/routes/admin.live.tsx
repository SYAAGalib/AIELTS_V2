import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { adminListLive, adminUpsertLive, adminDeleteLive, type LiveSession } from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/live")({
  head: () => ({ meta: [{ title: "Live sessions — AIELTS Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: LiveAdmin,
});

const EMPTY: Partial<LiveSession> = {
  title: "", description: "", host_name: "", scheduled_at: "", duration_minutes: 60, meeting_url: "", status: "published",
};

function LiveAdmin() {
  const list = useServerFn(adminListLive);
  const upsert = useServerFn(adminUpsertLive);
  const del = useServerFn(adminDeleteLive);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-live"], queryFn: () => list() });
  const [form, setForm] = useState<Partial<LiveSession>>(EMPTY);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.title || !form.scheduled_at) { toast.error("Title and scheduled time required"); return; }
    setBusy(true);
    try {
      await upsert({ data: {
        id: form.id, title: form.title!,
        description: form.description || null, host_name: form.host_name || null,
        scheduled_at: new Date(form.scheduled_at!).toISOString(),
        duration_minutes: Number(form.duration_minutes ?? 60),
        meeting_url: form.meeting_url || null,
        status: (form.status as any) ?? "published",
      }});
      toast.success(form.id ? "Updated" : "Created");
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["admin-live"] });
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this session?")) return;
    await del({ data: { id } });
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-live"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Live sessions</h2>
        <p className="text-sm text-white/50">Schedule live classes shown in the student dashboard.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">{form.id ? "Edit session" : "Add session"}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Inp label="Title" value={form.title ?? ""} onChange={(v) => setForm({ ...form, title: v })} />
          <Inp label="Host name" value={form.host_name ?? ""} onChange={(v) => setForm({ ...form, host_name: v })} />
          <Inp label="Scheduled at" type="datetime-local"
            value={form.scheduled_at ? toLocalDT(form.scheduled_at) : ""}
            onChange={(v) => setForm({ ...form, scheduled_at: v })} />
          <Inp label="Duration (minutes)" type="number" value={String(form.duration_minutes ?? 60)} onChange={(v) => setForm({ ...form, duration_minutes: Number(v) })} />
          <Inp label="Meeting URL" value={form.meeting_url ?? ""} onChange={(v) => setForm({ ...form, meeting_url: v })} />
          <Sel label="Status" value={form.status ?? "published"} onChange={(v) => setForm({ ...form, status: v as any })} options={["draft","published","archived"]} />
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
        <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">Sessions ({data.length})</div>
        {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> :
         data.length === 0 ? <p className="p-6 text-sm text-white/60">No sessions scheduled.</p> : (
          <ul className="divide-y divide-white/5">
            {data.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-xs text-white/50">{new Date(s.scheduled_at).toLocaleString()} · {s.duration_minutes} min {s.host_name ? `· ${s.host_name}` : ""}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setForm(s)} className="rounded-md border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10"><Edit3 className="h-3 w-3 inline mr-1" />Edit</button>
                  <button onClick={() => remove(s.id)} className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"><Trash2 className="h-3 w-3 inline mr-1" />Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
function toLocalDT(iso: string) {
  const d = new Date(iso); const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
