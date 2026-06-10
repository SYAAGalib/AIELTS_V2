import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Send, Trash2 } from "lucide-react";
import {
  adminListNotifications, adminBroadcastNotification, adminDeleteNotification,
} from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({ meta: [{ title: "Notifications — AIELTS Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: NotificationsAdmin,
});

function NotificationsAdmin() {
  const list = useServerFn(adminListNotifications);
  const send = useServerFn(adminBroadcastNotification);
  const del = useServerFn(adminDeleteNotification);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-notifications"], queryFn: () => list() });
  const [form, setForm] = useState({ title: "", body: "", url: "", target: "all" as "all" | "user", user_id: "" });
  const [busy, setBusy] = useState(false);

  async function broadcast() {
    if (!form.title) { toast.error("Title required"); return; }
    if (form.target === "user" && !form.user_id) { toast.error("user_id required"); return; }
    setBusy(true);
    try {
      const res = await send({ data: {
        title: form.title, body: form.body || null, url: form.url || null,
        target: form.target, user_id: form.user_id || undefined,
      }});
      toast.success(`Sent to ${res.count} user(s)`);
      setForm({ title: "", body: "", url: "", target: "all", user_id: "" });
      qc.invalidateQueries({ queryKey: ["admin-notifications"] });
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin-notifications"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Notifications</h2>
        <p className="text-sm text-white/50">Send broadcasts or per-user notifications.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">New notification</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Inp label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <Inp label="URL (optional)" value={form.url} onChange={(v) => setForm({ ...form, url: v })} />
          <div>
            <label className="text-xs font-medium text-white/70">Target</label>
            <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value as any })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none">
              <option value="all" className="bg-[#0B1224]">All users</option>
              <option value="user" className="bg-[#0B1224]">Specific user</option>
            </select>
          </div>
          {form.target === "user" && <Inp label="User ID (UUID)" value={form.user_id} onChange={(v) => setForm({ ...form, user_id: v })} />}
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/70">Body</label>
            <textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 p-3 text-sm outline-none focus:border-[var(--teal)]" />
          </div>
        </div>
        <button onClick={broadcast} disabled={busy} className="mt-4 flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold disabled:opacity-60">
          <Send className="h-4 w-4" /> {busy ? "Sending…" : "Send"}
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">Recent ({data.length})</div>
        {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> :
         data.length === 0 ? <p className="p-6 text-sm text-white/60">No notifications sent yet.</p> : (
          <ul className="divide-y divide-white/5">
            {data.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-xs text-white/50">{new Date(n.created_at).toLocaleString()} · user {n.user_id.slice(0, 8)} {n.read_at ? "· read" : ""}</p>
                  {n.body && <p className="text-sm text-white/70 line-clamp-2">{n.body}</p>}
                </div>
                <button onClick={() => remove(n.id)} className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"><Trash2 className="h-3 w-3" /></button>
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
