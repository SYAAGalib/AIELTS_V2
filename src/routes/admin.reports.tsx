import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminListReports } from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — AIELTS Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ReportsAdmin,
});

function ReportsAdmin() {
  const list = useServerFn(adminListReports);
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-reports"], queryFn: () => list() });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Reports</h2>
        <p className="text-sm text-white/50">Saved analytics queries.</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">Reports ({data.length})</div>
        {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> :
         data.length === 0 ? <p className="p-6 text-sm text-white/60">No saved reports yet. Reports can be created by future admin tooling.</p> : (
          <ul className="divide-y divide-white/5">
            {data.map((r) => (
              <li key={r.id} className="p-4">
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-white/50">{r.query_kind} · {new Date(r.created_at).toLocaleString()}</p>
                <pre className="mt-2 overflow-auto rounded bg-black/40 p-2 text-[10px] text-white/60">{JSON.stringify(r.params, null, 2)}</pre>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
