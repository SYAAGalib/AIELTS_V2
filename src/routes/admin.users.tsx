import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { adminListUsers } from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — AIELTS Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: UsersAdmin,
});

function UsersAdmin() {
  const list = useServerFn(adminListUsers);
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return data.filter((u) => !t || (u.display_name ?? "").toLowerCase().includes(t) || u.user_id.includes(t));
  }, [data, q]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Users</h2>
        <p className="text-sm text-white/50">All registered learners.</p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
        <Search className="h-4 w-4 text-white/50" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or id…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-white/40" />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">
          {filtered.length} user{filtered.length === 1 ? "" : "s"}
        </div>
        {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> :
         filtered.length === 0 ? <p className="p-6 text-sm text-white/60">{data.length === 0 ? "No users yet." : "No matches."}</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-white/50">
                <tr className="border-b border-white/10">
                  <th className="p-3">Name</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Country</th>
                  <th className="p-3">Target band</th>
                  <th className="p-3">Roles</th>
                  <th className="p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.user_id} className="border-b border-white/5">
                    <td className="p-3">{u.display_name ?? <span className="text-white/40">—</span>}</td>
                    <td className="p-3 font-mono text-xs text-white/60">{u.user_id.slice(0, 12)}…</td>
                    <td className="p-3">{u.country ?? "—"}</td>
                    <td className="p-3">{u.target_band ?? "—"}</td>
                    <td className="p-3">
                      {u.roles.length === 0 ? <span className="text-white/40">user</span> :
                        u.roles.map((r) => <span key={r} className="mr-1 rounded bg-[var(--teal)]/15 px-2 py-0.5 text-[10px] uppercase text-[var(--teal)]">{r}</span>)}
                    </td>
                    <td className="p-3 text-xs text-white/60">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
