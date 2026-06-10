import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Youtube,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Check,
  Send,
  X as XIcon,
} from "lucide-react";
import {
  listSyncSources,
  addSyncSource,
  deleteSyncSource,
  updateSyncSource,
  runSyncNow,
  runAllSyncNow,
} from "@/lib/youtube-sync.functions";
import {
  runChannelDiscovery,
  listChannelSuggestions,
  acceptChannelSuggestion,
  dismissChannelSuggestion,
} from "@/lib/youtube-discovery.functions";
import {
  listChannelRequests,
  approveChannelRequest,
  rejectChannelRequest,
} from "@/lib/channel-requests.functions";


export const Route = createFileRoute("/admin/youtube")({
  head: () => ({
    meta: [
      { title: "YouTube Sync — AIELTS Admin" },
      { name: "description", content: "Sync videos from YouTube channels and playlists." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: YouTubeSyncPage,
});

function YouTubeSyncPage() {
  const list = useServerFn(listSyncSources);
  const add = useServerFn(addSyncSource);
  const del = useServerFn(deleteSyncSource);
  const update = useServerFn(updateSyncSource);
  const run = useServerFn(runSyncNow);
  const runAll = useServerFn(runAllSyncNow);
  const discover = useServerFn(runChannelDiscovery);
  const listSug = useServerFn(listChannelSuggestions);
  const accept = useServerFn(acceptChannelSuggestion);
  const dismiss = useServerFn(dismissChannelSuggestion);
  const listReq = useServerFn(listChannelRequests);
  const approveReq = useServerFn(approveChannelRequest);
  const rejectReq = useServerFn(rejectChannelRequest);

  const q = useQuery({ queryKey: ["yt-sources"], queryFn: () => list() });
  const sug = useQuery({ queryKey: ["yt-suggestions"], queryFn: () => listSug() });
  const req = useQuery({ queryKey: ["yt-requests"], queryFn: () => listReq() });

  const [kind, setKind] = useState<"channel" | "playlist">("channel");
  const [input, setInput] = useState("");
  const [label, setLabel] = useState("");
  const [skill, setSkill] = useState<"listening" | "reading" | "writing" | "speaking">("listening");
  const [maxResults, setMaxResults] = useState(0);
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [sugBusy, setSugBusy] = useState<string | null>(null);

  async function handleSyncAll() {
    if (!confirm("Re-sync every enabled channel? This may take a few minutes and use YouTube API quota.")) return;
    setSyncingAll(true);
    try {
      const r = await runAll();
      toast.success(`Synced ${r.count} sources • imported ${r.imported} new videos${r.errors ? ` • ${r.errors} errored` : ""}`);
      q.refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Sync all failed");
    } finally {
      setSyncingAll(false);
    }
  }

  async function handleDiscover() {
    setDiscovering(true);
    try {
      const r = await discover();
      toast.success(
        `Discovery complete — auto-added ${r.autoAdded}, queued ${r.queued} for review (${r.skipped} already known)`,
      );
      q.refetch();
      sug.refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Discovery failed");
    } finally {
      setDiscovering(false);
    }
  }

  async function handleAcceptSuggestion(id: string, defaultSkill?: string) {
    setSugBusy(id);
    try {
      const r = await accept({ data: { id, defaultSkill: defaultSkill as any } });
      toast.success(`Channel added — imported ${r.imported} videos`);
      sug.refetch();
      q.refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to accept");
    } finally {
      setSugBusy(null);
    }
  }

  async function handleDismissSuggestion(id: string) {
    setSugBusy(id);
    try {
      await dismiss({ data: { id } });
      sug.refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to dismiss");
    } finally {
      setSugBusy(null);
    }
  }


  async function handleApproveReq(id: string) {
    try {
      const r = await approveReq({ data: { id, sync: true, maxResults: 0 } });
      toast.success(`Approved — imported ${r.imported} videos`);
      req.refetch(); q.refetch();
    } catch (e: any) { toast.error(e?.message ?? "Approve failed"); }
  }
  async function handleRejectReq(id: string) {
    try { await rejectReq({ data: { id } }); toast.success("Rejected"); req.refetch(); }
    catch (e: any) { toast.error(e?.message ?? "Reject failed"); }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setAdding(true);
    try {
      await add({ data: { kind, input, label: label || undefined, defaultSkill: skill, maxResults } });
      toast.success("Source added");
      setInput("");
      setLabel("");
      q.refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add source");
    } finally {
      setAdding(false);
    }
  }

  async function handleSync(id: string) {
    setBusyId(id);
    try {
      const r = await run({ data: { id } });
      toast.success(`Imported ${r.imported} new video${r.imported === 1 ? "" : "s"} (${r.skipped} already in library)`);
      q.refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Sync failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this source? Imported videos will remain.")) return;
    try {
      await del({ data: { id } });
      toast.success("Source deleted");
      q.refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    try {
      await update({ data: { id, enabled } });
      q.refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  }

  const sources = q.data?.sources ?? [];
  const suggestions = sug.data?.suggestions ?? [];
  const requests = (req.data?.requests ?? []).filter((r: any) => r.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#FF0000]/10 text-[#FF0000]">
            <Youtube className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">Content sync</p>
            <h2 className="font-display text-3xl font-bold">YouTube Sync</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncingAll ? "animate-spin" : ""}`} />
            {syncingAll ? "Syncing all…" : "Sync all channels"}
          </button>
          <button
            onClick={handleDiscover}
            disabled={discovering}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--teal)]/40 bg-[var(--teal)]/10 px-4 py-2 text-sm font-semibold text-[var(--teal)] transition hover:bg-[var(--teal)]/20 disabled:opacity-50"
          >
            <Sparkles className={`h-4 w-4 ${discovering ? "animate-pulse" : ""}`} />
            {discovering ? "Discovering…" : "Discover related channels"}
          </button>
        </div>
      </div>



      {/* Add form */}
      <motion.form
        onSubmit={handleAdd}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
      >
        <div className="mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-[var(--teal)]" />
          <h3 className="font-display text-lg font-semibold">Add source</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/50">Kind</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as "channel" | "playlist")}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
            >
              <option value="channel">Channel</option>
              <option value="playlist">Playlist</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/50">Default skill</label>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value as typeof skill)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
            >
              <option value="listening">Listening</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
              <option value="speaking">Speaking</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/50">
              {kind === "channel" ? "Channel URL, @handle, or UC… ID" : "Playlist URL or PL… ID"}
            </label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                kind === "channel"
                  ? "https://youtube.com/@channelname or UCxxxx..."
                  : "https://youtube.com/playlist?list=PLxxxx... or PLxxxx..."
              }
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/50">Label (optional)</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Defaults to channel/playlist name"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/50">Max videos per sync (0 = all)</label>
            <input
              type="number"
              min={0}
              max={100000}
              value={maxResults}
              onChange={(e) => setMaxResults(Math.max(0, Math.min(100000, Number(e.target.value) || 0)))}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={adding || !input.trim()}
            className="rounded-lg bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {adding ? "Validating…" : "Add source"}
          </button>
        </div>
      </motion.form>

      {/* Sources list */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur"
      >
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="font-display text-lg font-semibold">Configured sources</h3>
          <p className="text-xs text-white/50">
            Sync pulls the latest videos and adds them to the Videos library. Existing videos are skipped.
          </p>
        </div>

        {q.isLoading ? (
          <div className="p-8 text-center text-sm text-white/50">Loading…</div>
        ) : sources.length === 0 ? (
          <div className="p-8 text-center text-sm text-white/50">No sources yet. Add a channel or playlist above.</div>
        ) : (
          <ul>
            {sources.map((s: any) => (
              <li
                key={s.id}
                className="flex flex-col gap-3 border-b border-white/5 px-5 py-4 last:border-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60">
                      {s.kind}
                    </span>
                    <span className="rounded-md bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--teal)]">
                      {s.default_skill}
                    </span>
                    {!s.enabled && (
                      <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-400">
                        disabled
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate font-medium">{s.label}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-white/40">
                    <code className="font-mono">{s.source_id}</code>
                    <a
                      href={
                        s.kind === "channel"
                          ? `https://www.youtube.com/channel/${s.source_id}`
                          : `https://www.youtube.com/playlist?list=${s.source_id}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/40 hover:text-[var(--teal)]"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs">
                    {s.last_error ? (
                      <span className="flex items-center gap-1 text-red-400">
                        <AlertCircle className="h-3 w-3" /> {s.last_error.slice(0, 80)}
                      </span>
                    ) : s.last_synced_at ? (
                      <span className="flex items-center gap-1 text-white/50">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        Last sync {new Date(s.last_synced_at).toLocaleString()}
                        {typeof s.last_imported_count === "number" ? ` (+${s.last_imported_count})` : ""}
                      </span>
                    ) : (
                      <span className="text-white/40">Never synced</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(s.id, !s.enabled)}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                  >
                    {s.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleSync(s.id)}
                    disabled={busyId === s.id}
                    className="flex items-center gap-1.5 rounded-md bg-[var(--teal)] px-3 py-1.5 text-xs font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${busyId === s.id ? "animate-spin" : ""}`} />
                    {busyId === s.id ? "Syncing…" : "Sync now"}
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="rounded-md border border-red-500/20 bg-red-500/10 p-1.5 text-red-300 transition hover:bg-red-500/20"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* Suggested channels */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--teal)]" />
              <h3 className="font-display text-lg font-semibold">Suggested channels</h3>
            </div>
            <p className="text-xs text-white/50">
              Channels discovered from IELTS / English / speaking / vocabulary searches. Review and add the ones you like.
            </p>
          </div>
          {suggestions.length > 0 && (
            <span className="rounded-full bg-[var(--teal)]/10 px-3 py-1 text-xs font-semibold text-[var(--teal)]">
              {suggestions.length} pending
            </span>
          )}
        </div>

        {sug.isLoading ? (
          <div className="p-8 text-center text-sm text-white/50">Loading…</div>
        ) : suggestions.length === 0 ? (
          <div className="p-8 text-center text-sm text-white/50">
            No pending suggestions. Click <span className="text-[var(--teal)]">Discover related channels</span> to find more.
          </div>
        ) : (
          <ul>
            {suggestions.map((s: any) => (
              <li
                key={s.id}
                className="flex flex-col gap-3 border-b border-white/5 px-5 py-4 last:border-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  {s.thumbnail_url ? (
                    <img
                      src={s.thumbnail_url}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-full bg-white/10" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{s.title}</span>
                      <a
                        href={`https://www.youtube.com/channel/${s.channel_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white/40 hover:text-[var(--teal)]"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="rounded-md bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--teal)]">
                        score {s.score}
                      </span>
                      <span className="text-xs text-white/50">
                        {(s.subscriber_count ?? 0).toLocaleString()} subs · {(s.video_count ?? 0).toLocaleString()} videos
                      </span>
                    </div>
                    {s.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-white/50">{s.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(s.matched_queries ?? []).slice(0, 6).map((m: string) => (
                        <span
                          key={m}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    defaultValue={s.suggested_skill}
                    onChange={(e) => (s._chosenSkill = e.target.value)}
                    className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs outline-none focus:border-[var(--teal)]"
                  >
                    <option value="listening">Listening</option>
                    <option value="reading">Reading</option>
                    <option value="writing">Writing</option>
                    <option value="speaking">Speaking</option>
                  </select>
                  <button
                    onClick={() => handleAcceptSuggestion(s.id, s._chosenSkill ?? s.suggested_skill)}
                    disabled={sugBusy === s.id}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[var(--teal)] px-3 py-1.5 text-xs font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Add
                  </button>
                  <button
                    onClick={() => handleDismissSuggestion(s.id)}
                    disabled={sugBusy === s.id}
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white/70 hover:bg-white/10"
                    title="Dismiss"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* User channel requests */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-[var(--teal)]" />
              <h3 className="font-display text-lg font-semibold">User channel requests</h3>
            </div>
            <p className="text-xs text-white/50">Channels suggested by visitors from the /videos page.</p>
          </div>
          {requests.length > 0 && (
            <span className="rounded-full bg-[var(--teal)]/10 px-3 py-1 text-xs font-semibold text-[var(--teal)]">{requests.length} pending</span>
          )}
        </div>
        {req.isLoading ? (
          <div className="p-8 text-center text-sm text-white/50">Loading…</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-sm text-white/50">No pending requests.</div>
        ) : (
          <ul>
            {requests.map((r: any) => (
              <li key={r.id} className="flex flex-col gap-3 border-b border-white/5 px-5 py-4 last:border-0 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="truncate font-mono text-sm">{r.channel_input}</code>
                    <a href={r.channel_input.startsWith("http") ? r.channel_input : `https://www.youtube.com/${r.channel_input.startsWith("@") ? r.channel_input : "@" + r.channel_input}`} target="_blank" rel="noreferrer" className="text-white/40 hover:text-[var(--teal)]">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="rounded-md bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--teal)]">{r.suggested_skill}</span>
                  </div>
                  {r.note && <p className="mt-1 line-clamp-2 text-xs text-white/60">"{r.note}"</p>}
                  <p className="mt-1 text-[11px] text-white/40">{r.requester_email ?? "anonymous"} · {new Date(r.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleApproveReq(r.id)} className="inline-flex items-center gap-1.5 rounded-md bg-[var(--teal)] px-3 py-1.5 text-xs font-semibold text-black transition hover:opacity-90">
                    <Check className="h-3.5 w-3.5" /> Approve & sync
                  </button>
                  <button onClick={() => handleRejectReq(r.id)} className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white/70 hover:bg-white/10">
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
