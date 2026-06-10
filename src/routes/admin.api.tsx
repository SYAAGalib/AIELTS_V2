import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Copy } from "lucide-react";
import { adminListApiKeys, adminCreateApiKey, adminDeleteApiKey } from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/api")({
  head: () => ({ meta: [{ title: "API keys — AIELTS Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ApiAdmin,
});

function ApiAdmin() {
  const list = useServerFn(adminListApiKeys);
  const create = useServerFn(adminCreateApiKey);
  const del = useServerFn(adminDeleteApiKey);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-api-keys"], queryFn: () => list() });
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!name) { toast.error("Name required"); return; }
    setBusy(true);
    try {
      const res = await create({ data: { name, scopes: scopes.split(",").map((s) => s.trim()).filter(Boolean) } });
      setSecret(res.secret);
      setName(""); setScopes("");
      qc.invalidateQueries({ queryKey: ["admin-api-keys"] });
      toast.success("Created — copy the secret now, it won't be shown again.");
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!confirm("Revoke this key?")) return;
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin-api-keys"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">API keys</h2>
        <p className="text-sm text-white/50">Keys for external integrations. Secrets are hashed; copy the new value immediately on creation.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Create key</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div><label className="text-xs font-medium text-white/70">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" /></div>
          <div><label className="text-xs font-medium text-white/70">Scopes (comma-separated)</label>
            <input value={scopes} onChange={(e) => setScopes(e.target.value)} placeholder="read, write" className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" /></div>
        </div>
        <button onClick={add} disabled={busy} className="mt-4 flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold disabled:opacity-60">
          <Plus className="h-4 w-4" /> {busy ? "Creating…" : "Generate key"}
        </button>
        {secret && (
          <div className="mt-4 rounded-lg border border-[var(--teal)]/40 bg-[var(--teal)]/10 p-3">
            <p className="text-xs font-semibold text-[var(--teal)]">Copy this secret now — it cannot be retrieved later.</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 overflow-auto rounded bg-black/40 p-2 font-mono text-xs">{secret}</code>
              <button onClick={() => { navigator.clipboard.writeText(secret); toast.success("Copied"); }}
                className="rounded-md border border-white/15 px-3 py-2 text-xs hover:bg-white/10"><Copy className="h-3 w-3" /></button>
              <button onClick={() => setSecret(null)} className="rounded-md border border-white/15 px-3 py-2 text-xs hover:bg-white/10">Hide</button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">Keys ({data.length})</div>
        {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> :
         data.length === 0 ? <p className="p-6 text-sm text-white/60">No keys yet.</p> : (
          <ul className="divide-y divide-white/5">
            {data.map((k) => (
              <li key={k.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{k.name}</p>
                  <p className="font-mono text-xs text-white/50">{k.key_prefix}… · created {new Date(k.created_at).toLocaleDateString()}</p>
                  {k.scopes && k.scopes.length > 0 && <p className="text-xs text-white/60">{k.scopes.join(", ")}</p>}
                </div>
                <button onClick={() => remove(k.id)} className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"><Trash2 className="h-3 w-3 inline mr-1" />Revoke</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
