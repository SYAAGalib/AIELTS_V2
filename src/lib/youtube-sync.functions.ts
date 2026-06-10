import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyAdminSession } from "./admin.server";
import { yt, syncOneSource, type SyncSource } from "./youtube-sync.server";

const ADMIN_COOKIE = "aielts_admin";

async function requireAdmin() {
  const token = getCookie(ADMIN_COOKIE);
  const session = await verifyAdminSession(token);
  if (!session) throw new Response("Unauthorized", { status: 401 });
}


// Parse a channel ID or username from a YouTube URL
function parseChannelInput(input: string): { kind: "id" | "handle" | "username"; value: string } | null {
  const trimmed = input.trim();
  if (/^UC[\w-]{20,}$/.test(trimmed)) return { kind: "id", value: trimmed };
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const parts = url.pathname.split("/").filter(Boolean);
    if (!parts.length) return null;
    if (parts[0].startsWith("@")) return { kind: "handle", value: parts[0].slice(1) };
    if (parts[0] === "channel" && parts[1]) return { kind: "id", value: parts[1] };
    if (parts[0] === "user" && parts[1]) return { kind: "username", value: parts[1] };
    if (parts[0] === "c" && parts[1]) return { kind: "handle", value: parts[1] };
  } catch {
    /* not a URL */
  }
  if (trimmed.startsWith("@")) return { kind: "handle", value: trimmed.slice(1) };
  return null;
}

function parsePlaylistInput(input: string): string | null {
  const trimmed = input.trim();
  if (/^(PL|UU|LL|FL|OL|RD)[\w-]{10,}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const list = url.searchParams.get("list");
    if (list) return list;
  } catch {
    /* ignore */
  }
  return null;
}

async function resolveChannelId(raw: string): Promise<{ id: string; title: string }> {
  const parsed = parseChannelInput(raw);
  if (!parsed) throw new Error("Could not parse channel URL or ID");
  if (parsed.kind === "id") {
    const data = await yt<any>("channels", { part: "snippet", id: parsed.value });
    const item = data.items?.[0];
    if (!item) throw new Error("Channel not found");
    return { id: item.id, title: item.snippet?.title ?? parsed.value };
  }
  if (parsed.kind === "handle") {
    const data = await yt<any>("channels", { part: "snippet", forHandle: `@${parsed.value}` });
    const item = data.items?.[0];
    if (!item) throw new Error("Channel handle not found");
    return { id: item.id, title: item.snippet?.title ?? parsed.value };
  }
  // username (legacy)
  const data = await yt<any>("channels", { part: "snippet", forUsername: parsed.value });
  const item = data.items?.[0];
  if (!item) throw new Error("Channel username not found");
  return { id: item.id, title: item.snippet?.title ?? parsed.value };
}

async function resolvePlaylist(raw: string): Promise<{ id: string; title: string }> {
  const id = parsePlaylistInput(raw);
  if (!id) throw new Error("Could not parse playlist URL or ID");
  const data = await yt<any>("playlists", { part: "snippet", id });
  const item = data.items?.[0];
  if (!item) throw new Error("Playlist not found");
  return { id: item.id, title: item.snippet?.title ?? id };
}

// --------- CRUD ----------

export const listSyncSources = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from("youtube_sync_sources")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { sources: data ?? [] };
});

const SkillSchema = z.enum(["listening", "reading", "writing", "speaking"]);

export const addSyncSource = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        kind: z.enum(["channel", "playlist"]),
        input: z.string().min(2).max(500),
        label: z.string().max(200).optional(),
        defaultSkill: SkillSchema.default("listening"),
        // 0 = no cap, fetch all videos
        maxResults: z.number().int().min(0).max(100000).default(0),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    let sourceId: string;
    let label: string;
    if (data.kind === "channel") {
      const r = await resolveChannelId(data.input);
      sourceId = r.id;
      label = data.label || r.title;
    } else {
      const r = await resolvePlaylist(data.input);
      sourceId = r.id;
      label = data.label || r.title;
    }
    const { data: row, error } = await supabaseAdmin
      .from("youtube_sync_sources")
      .insert({
        kind: data.kind,
        source_id: sourceId,
        label,
        default_skill: data.defaultSkill,
        max_results: data.maxResults,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { source: row };
  });

export const updateSyncSource = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        label: z.string().max(200).optional(),
        defaultSkill: SkillSchema.optional(),
        maxResults: z.number().int().min(0).max(100000).optional(),
        enabled: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const patch: {
      label?: string;
      default_skill?: string;
      max_results?: number;
      enabled?: boolean;
    } = {};
    if (data.label !== undefined) patch.label = data.label;
    if (data.defaultSkill !== undefined) patch.default_skill = data.defaultSkill;
    if (data.maxResults !== undefined) patch.max_results = data.maxResults;
    if (data.enabled !== undefined) patch.enabled = data.enabled;
    const { error } = await supabaseAdmin.from("youtube_sync_sources").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteSyncSource = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { error } = await supabaseAdmin.from("youtube_sync_sources").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// --------- Sync ----------

export const runSyncNow = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { data: src, error } = await supabaseAdmin
      .from("youtube_sync_sources")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    try {
      const result = await syncOneSource(src as SyncSource);
      await supabaseAdmin
        .from("youtube_sync_sources")
        .update({
          last_synced_at: new Date().toISOString(),
          last_error: null,
          last_imported_count: result.imported,
        })
        .eq("id", data.id);
      return result;
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      await supabaseAdmin
        .from("youtube_sync_sources")
        .update({ last_synced_at: new Date().toISOString(), last_error: msg })
        .eq("id", data.id);
      throw new Error(msg);
    }
  });

export const runAllSyncNow = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  const results = await runAllEnabledSync();
  const imported = results.reduce((n, r) => n + (r.imported ?? 0), 0);
  const errors = results.filter((r) => r.error).length;
  return { count: results.length, imported, errors, results };
});

export async function runAllEnabledSync() {
  const { data, error } = await supabaseAdmin
    .from("youtube_sync_sources")
    .select("*")
    .eq("enabled", true);
  if (error) throw new Error(error.message);
  const results: Array<{ id: string; label: string; imported?: number; error?: string }> = [];
  for (const src of data ?? []) {
    try {
      const r = await syncOneSource(src as SyncSource);
      await supabaseAdmin
        .from("youtube_sync_sources")
        .update({
          last_synced_at: new Date().toISOString(),
          last_error: null,
          last_imported_count: r.imported,
        })
        .eq("id", src.id);
      results.push({ id: src.id, label: src.label, imported: r.imported });
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      await supabaseAdmin
        .from("youtube_sync_sources")
        .update({ last_synced_at: new Date().toISOString(), last_error: msg })
        .eq("id", src.id);
      results.push({ id: src.id, label: src.label, error: msg });
    }
  }
  return results;
}

