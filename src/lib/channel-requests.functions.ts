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

const SkillEnum = z.enum(["listening", "reading", "writing", "speaking"]);

// ---------- Public: submit a request ----------

export const submitChannelRequest = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        channelInput: z.string().trim().min(3).max(500),
        note: z.string().trim().max(500).optional(),
        suggestedSkill: SkillEnum.default("listening"),
        email: z.string().trim().email().max(255).optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const email = data.email && data.email.length ? data.email : null;
    // Soft-dedupe: don't insert duplicate pending request for the same input.
    const { data: existing } = await supabaseAdmin
      .from("yt_channel_requests")
      .select("id")
      .eq("channel_input", data.channelInput)
      .eq("status", "pending")
      .limit(1);
    if (existing && existing.length > 0) {
      return { ok: true as const, deduped: true };
    }
    const { error } = await supabaseAdmin.from("yt_channel_requests").insert({
      channel_input: data.channelInput,
      note: data.note ?? null,
      suggested_skill: data.suggestedSkill,
      requester_email: email,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true as const, deduped: false };
  });

// ---------- Admin: list ----------

export const listChannelRequests = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from("yt_channel_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return { requests: data ?? [] };
});

// Resolve any input to a YouTube channel ID + title
async function resolveAnyChannel(raw: string): Promise<{ id: string; title: string }> {
  const trimmed = raw.trim();
  // Direct UC id
  if (/^UC[\w-]{20,}$/.test(trimmed)) {
    const r = await yt<any>("channels", { part: "snippet", id: trimmed });
    const it = r.items?.[0];
    if (!it) throw new Error("Channel not found");
    return { id: it.id, title: it.snippet?.title ?? trimmed };
  }
  // Parse URL or handle
  let handle: string | null = null;
  let username: string | null = null;
  let channelId: string | null = null;
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length) {
      if (parts[0].startsWith("@")) handle = parts[0].slice(1);
      else if (parts[0] === "channel" && parts[1]) channelId = parts[1];
      else if (parts[0] === "user" && parts[1]) username = parts[1];
      else if (parts[0] === "c" && parts[1]) handle = parts[1];
    }
  } catch {
    if (trimmed.startsWith("@")) handle = trimmed.slice(1);
    else handle = trimmed;
  }
  if (channelId) {
    const r = await yt<any>("channels", { part: "snippet", id: channelId });
    const it = r.items?.[0];
    if (!it) throw new Error("Channel not found");
    return { id: it.id, title: it.snippet?.title ?? channelId };
  }
  if (handle) {
    const r = await yt<any>("channels", { part: "snippet", forHandle: `@${handle}` });
    const it = r.items?.[0];
    if (it) return { id: it.id, title: it.snippet?.title ?? handle };
  }
  if (username) {
    const r = await yt<any>("channels", { part: "snippet", forUsername: username });
    const it = r.items?.[0];
    if (it) return { id: it.id, title: it.snippet?.title ?? username };
  }
  throw new Error("Could not resolve channel from input");
}

// ---------- Admin: approve ----------

export const approveChannelRequest = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        defaultSkill: SkillEnum.optional(),
        maxResults: z.number().int().min(0).max(100000).default(0),
        sync: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { data: req, error: re } = await supabaseAdmin
      .from("yt_channel_requests")
      .select("*")
      .eq("id", data.id)
      .single();
    if (re || !req) throw new Error(re?.message ?? "Request not found");

    const skill = data.defaultSkill ?? req.suggested_skill ?? "listening";
    const resolved = await resolveAnyChannel(req.channel_input);

    // Check if already in sources
    const { data: existing } = await supabaseAdmin
      .from("youtube_sync_sources")
      .select("id")
      .eq("source_id", resolved.id)
      .limit(1);

    let sourceRowId: string;
    if (existing && existing.length) {
      sourceRowId = existing[0].id;
    } else {
      const { data: row, error: insErr } = await supabaseAdmin
        .from("youtube_sync_sources")
        .insert({
          kind: "channel",
          source_id: resolved.id,
          label: resolved.title,
          default_skill: skill,
          max_results: data.maxResults,
          enabled: true,
        })
        .select("id")
        .single();
      if (insErr || !row) throw new Error(insErr?.message ?? "Insert failed");
      sourceRowId = row.id;
    }

    // Optionally run sync immediately
    let imported = 0;
    if (data.sync) {
      try {
        const r = await syncOneSource({
          id: sourceRowId,
          kind: "channel",
          source_id: resolved.id,
          default_skill: skill,
          max_results: data.maxResults,
        } as SyncSource);
        imported = r.imported;
        await supabaseAdmin
          .from("youtube_sync_sources")
          .update({
            last_synced_at: new Date().toISOString(),
            last_error: null,
            last_imported_count: imported,
          })
          .eq("id", sourceRowId);
      } catch (e: any) {
        await supabaseAdmin
          .from("youtube_sync_sources")
          .update({ last_synced_at: new Date().toISOString(), last_error: e?.message ?? String(e) })
          .eq("id", sourceRowId);
      }
    }

    await supabaseAdmin
      .from("yt_channel_requests")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        admin_note: `Added as source ${sourceRowId}`,
      })
      .eq("id", data.id);

    return { ok: true as const, imported, sourceId: sourceRowId };
  });

// ---------- Admin: reject ----------

export const rejectChannelRequest = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), reason: z.string().max(500).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { error } = await supabaseAdmin
      .from("yt_channel_requests")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        admin_note: data.reason ?? null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- Public: channel detail (videos + playlists) ----------

export type ChannelDetail = {
  source: {
    id: string;
    label: string;
    source_id: string;
    default_skill: string;
    kind: "channel" | "playlist";
  };
  videos: Array<{
    id: string;
    title: string;
    description: string;
    youtube_id: string;
    thumbnail_url: string;
    duration_seconds: number | null;
    skill: string;
    published_at: string | null;
  }>;
  playlists: Array<{
    id: string;
    title: string;
    thumbnail_url: string;
    item_count: number;
  }>;
};

export const getChannelDetail = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<ChannelDetail> => {
    const { data: src, error } = await supabaseAdmin
      .from("youtube_sync_sources")
      .select("id,label,source_id,default_skill,kind")
      .eq("id", data.id)
      .single();
    if (error || !src) throw new Error("Channel not found");

    const { data: vids } = await supabaseAdmin
      .from("videos")
      .select("id,title,description,youtube_id,thumbnail_url,duration_seconds,skill,published_at")
      .eq("source_id", src.id)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(5000);

    const videos = (vids ?? []).map((v: any) => ({
      id: v.id,
      title: v.title ?? "Untitled",
      description: v.description ?? "",
      youtube_id: v.youtube_id,
      thumbnail_url: v.thumbnail_url || `https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`,
      duration_seconds: v.duration_seconds ?? null,
      skill: v.skill ?? src.default_skill,
      published_at: v.published_at ?? null,
    }));

    // Best-effort: fetch a few public playlists for this channel
    let playlists: ChannelDetail["playlists"] = [];
    if (src.kind === "channel") {
      try {
        const r = await yt<any>("playlists", {
          part: "snippet,contentDetails",
          channelId: src.source_id,
          maxResults: "20",
        });
        playlists = (r.items ?? []).map((p: any) => {
          const sn = p.snippet ?? {};
          const thumb =
            sn.thumbnails?.maxres?.url ||
            sn.thumbnails?.high?.url ||
            sn.thumbnails?.medium?.url ||
            sn.thumbnails?.default?.url ||
            "";
          return {
            id: p.id,
            title: sn.title ?? "Untitled playlist",
            thumbnail_url: thumb,
            item_count: p.contentDetails?.itemCount ?? 0,
          };
        });
      } catch {
        playlists = [];
      }
    }

    return {
      source: {
        id: src.id,
        label: src.label,
        source_id: src.source_id,
        default_skill: src.default_skill,
        kind: src.kind as "channel" | "playlist",
      },
      videos,
      playlists,
    };
  });
