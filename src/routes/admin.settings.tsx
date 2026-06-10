import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { adminListSettings, adminUpsertSetting, adminDeleteSetting } from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — AIELTS Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const list = useServerFn(adminListSettings);
  const upsert = useServerFn(adminUpsertSetting);
  const del = useServerFn(adminDeleteSetting);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-settings"], queryFn: () => list() });
  const [form, setForm] = useState({ key: "", value: "" });
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.key || !form.value) { toast.error("Key and value required"); return; }
    setBusy(true);
    try {
      await upsert({ data: { key: form.key, value: form.value } });
      toast.success("Saved");
      setForm({ key: "", value: "" });
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }
  async function remove(key: string) {
    if (!confirm(`Delete setting "${key}"?`)) return;
    await del({ data: { key } });
    qc.invalidateQueries({ queryKey: ["admin-settings"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">App settings</h2>
        <p className="text-sm text-white/50">Key/value settings stored in the <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">app_settings</code> table.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Add / update setting</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-white/70">Key</label>
            <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-mono text-sm outline-none focus:border-[var(--teal)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-white/70">Value (string or JSON)</label>
            <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-mono text-sm outline-none focus:border-[var(--teal)]" />
          </div>
        </div>
        <button onClick={save} disabled={busy} className="mt-4 flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold disabled:opacity-60">
          <Plus className="h-4 w-4" /> {busy ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">Settings ({data.length})</div>
        {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> :
         data.length === 0 ? <p className="p-6 text-sm text-white/60">No settings stored.</p> : (
          <ul className="divide-y divide-white/5">
            {data.map((s) => (
              <li key={s.key} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-mono text-sm">{s.key}</p>
                  <pre className="mt-1 overflow-auto text-xs text-white/60">{JSON.stringify(s.value, null, 2)}</pre>
                </div>
                <button onClick={() => remove(s.key)} className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"><Trash2 className="h-3 w-3" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
