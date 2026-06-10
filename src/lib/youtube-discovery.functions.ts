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

// ---------- Topic library ----------

type TopicGroup = "ielts" | "general" | "speaking" | "vocab";

const TOPIC_QUERIES: Array<{ q: string; group: TopicGroup; skill: string }> = [
  // IELTS
  { q: "ielts speaking", group: "ielts", skill: "speaking" },
  { q: "ielts writing task 2", group: "ielts", skill: "writing" },
  { q: "ielts listening practice", group: "ielts", skill: "listening" },
  { q: "ielts reading tips", group: "ielts", skill: "reading" },
  { q: "ielts band 9", group: "ielts", skill: "listening" },
  // General English
  { q: "learn english", group: "general", skill: "listening" },
  { q: "english grammar lessons", group: "general", skill: "writing" },
  { q: "esl english class", group: "general", skill: "listening" },
  { q: "english for beginners", group: "general", skill: "listening" },
  // Speaking / accent
  { q: "english pronunciation", group: "speaking", skill: "speaking" },
  { q: "british accent training", group: "speaking", skill: "speaking" },
  { q: "american accent", group: "speaking", skill: "speaking" },
  { q: "english speaking fluency", group: "speaking", skill: "speaking" },
  // Vocab / podcasts
  { q: "english vocabulary", group: "vocab", skill: "listening" },
  { q: "english learning podcast", group: "vocab", skill: "listening" },
  { q: "english idioms", group: "vocab", skill: "speaking" },
  { q: "phrasal verbs english", group: "vocab", skill: "speaking" },
];

const AUTO_ADD_MIN_SCORE = 3;
const AUTO_ADD_MIN_SUBS = 10_000;

function pickSkill(matches: Array<(typeof TOPIC_QUERIES)[number]>): string {
  // Most-frequent skill among matched queries
  const counts = new Map<string, number>();
  for (const m of matches) counts.set(m.skill, (counts.get(m.skill) ?? 0) + 1);
  let best = "listening";
  let max = 0;
  for (const [k, v] of counts) if (v > max) { best = k; max = v; }
  return best;
}

// ---------- Discovery pipeline ----------

export const runChannelDiscovery = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ autoAdded: number; queued: number; skipped: number; errors: string[] }> => {
    await requireAdmin();
    return runChannelDiscoveryInternal();
  },
);

export async function runChannelDiscoveryInternal() {
  const errors: string[] = [];

  // 1. Collect channel candidates from each query
  const candidates = new Map<string, Array<(typeof TOPIC_QUERIES)[number]>>();
  for (const t of TOPIC_QUERIES) {
    try {
      const res = await yt<any>("search", {
        part: "snippet",
        type: "channel",
        q: t.q,
        maxResults: "10",
        regionCode: "US",
        relevanceLanguage: "en",
      });
      for (const it of res.items ?? []) {
        const id: string | undefined = it.snippet?.channelId || it.id?.channelId;
        if (!id) continue;
        if (!candidates.has(id)) candidates.set(id, []);
        candidates.get(id)!.push(t);
      }
    } catch (e: any) {
      errors.push(`Search "${t.q}": ${e?.message ?? "error"}`);
    }
  }

  if (candidates.size === 0) {
    return { autoAdded: 0, queued: 0, skipped: 0, errors };
  }

  // 2. Skip already-known and dismissed
  const ids = [...candidates.keys()];
  const [existingSources, dismissed, existingSuggestions] = await Promise.all([
    supabaseAdmin
      .from("youtube_sync_sources")
      .select("source_id")
      .eq("kind", "channel")
      .in("source_id", ids),
    supabaseAdmin.from("yt_channel_dismissed").select("channel_id").in("channel_id", ids),
    supabaseAdmin
      .from("yt_channel_suggestions")
      .select("channel_id,status")
      .in("channel_id", ids),
  ]);

  const have = new Set<string>([
    ...((existingSources.data ?? []).map((r: any) => r.source_id)),
    ...((dismissed.data ?? []).map((r: any) => r.channel_id)),
    ...((existingSuggestions.data ?? [])
      .filter((r: any) => r.status === "added" || r.status === "pending")
      .map((r: any) => r.channel_id)),
  ]);

  const remaining = ids.filter((id) => !have.has(id));
  const skipped = ids.length - remaining.length;
  if (remaining.length === 0) {
    return { autoAdded: 0, queued: 0, skipped, errors };
  }

  // 3. Batch-fetch channel details (up to 50 per call)
  const details = new Map<string, any>();
  for (let i = 0; i < remaining.length; i += 50) {
    const batch = remaining.slice(i, i + 50);
    try {
      const res = await yt<any>("channels", {
        part: "snippet,statistics",
        id: batch.join(","),
      });
      for (const c of res.items ?? []) details.set(c.id, c);
    } catch (e: any) {
      errors.push(`Channel details: ${e?.message ?? "error"}`);
    }
  }

  // 4. Score and split into auto-add vs queue
  let autoAdded = 0;
  let queued = 0;

  for (const id of remaining) {
    const ch = details.get(id);
    if (!ch) continue;

    const matches = candidates.get(id) ?? [];
    const sn = ch.snippet ?? {};
    const stats = ch.statistics ?? {};
    const subs = parseInt(stats.subscriberCount ?? "0", 10) || 0;
    const videoCount = parseInt(stats.videoCount ?? "0", 10) || 0;
    const title: string = sn.title ?? id;
    const desc: string = sn.description ?? "";

    // Score = unique matched queries + bonuses
    let score = new Set(matches.map((m) => m.q)).size;
    if (subs >= 50_000) score += 2;
    else if (subs >= 10_000) score += 1;
    const titleLower = title.toLowerCase();
    if (/english|ielts|esl|speaking|grammar|pronunciation|accent/.test(titleLower)) score += 1;

    const skill = pickSkill(matches);
    const matchedQueries = [...new Set(matches.map((m) => m.q))];
    const thumb =
      sn.thumbnails?.high?.url ||
      sn.thumbnails?.medium?.url ||
      sn.thumbnails?.default?.url ||
      null;

    const isHighConfidence = score >= AUTO_ADD_MIN_SCORE && subs >= AUTO_ADD_MIN_SUBS;

    if (isHighConfidence) {
      // Auto-add to sync sources
      const { data: inserted, error: insErr } = await supabaseAdmin
        .from("youtube_sync_sources")
        .insert({
          kind: "channel",
          source_id: id,
          label: title,
          default_skill: skill,
          max_results: 25,
          enabled: true,
        })
        .select("id,kind,source_id,default_skill,max_results")
        .single();

      if (insErr) {
        errors.push(`Insert ${title}: ${insErr.message}`);
        continue;
      }

      // Mark as added in suggestions (history)
      await supabaseAdmin.from("yt_channel_suggestions").upsert(
        {
          channel_id: id,
          title,
          description: desc.slice(0, 1000),
          thumbnail_url: thumb,
          subscriber_count: subs,
          video_count: videoCount,
          matched_queries: matchedQueries,
          score,
          suggested_skill: skill,
          status: "added",
        },
        { onConflict: "channel_id" },
      );

      // Immediate sync (best-effort)
      try {
        await syncOneSource(inserted as SyncSource);
        await supabaseAdmin
          .from("youtube_sync_sources")
          .update({ last_synced_at: new Date().toISOString(), last_error: null })
          .eq("id", (inserted as any).id);
      } catch (e: any) {
        await supabaseAdmin
          .from("youtube_sync_sources")
          .update({
            last_synced_at: new Date().toISOString(),
            last_error: (e?.message ?? "sync failed").slice(0, 500),
          })
          .eq("id", (inserted as any).id);
      }
      autoAdded++;
    } else {
      // Queue for review
      const { error: sugErr } = await supabaseAdmin
        .from("yt_channel_suggestions")
        .upsert(
          {
            channel_id: id,
            title,
            description: desc.slice(0, 1000),
            thumbnail_url: thumb,
            subscriber_count: subs,
            video_count: videoCount,
            matched_queries: matchedQueries,
            score,
            suggested_skill: skill,
            status: "pending",
          },
          { onConflict: "channel_id" },
        );
      if (sugErr) errors.push(`Suggest ${title}: ${sugErr.message}`);
      else queued++;
    }
  }

  return { autoAdded, queued, skipped, errors };
}

// ---------- Suggestion management ----------

export const listChannelSuggestions = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdmin();
    const { data, error } = await supabaseAdmin
      .from("yt_channel_suggestions")
      .select("*")
      .eq("status", "pending")
      .order("score", { ascending: false })
      .order("subscriber_count", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { suggestions: data ?? [] };
  },
);

const SkillSchema = z.enum(["listening", "reading", "writing", "speaking"]);

export const acceptChannelSuggestion = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        defaultSkill: SkillSchema.optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { data: sug, error } = await supabaseAdmin
      .from("yt_channel_suggestions")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    if (sug.status !== "pending") throw new Error("Suggestion is not pending");

    const skill = data.defaultSkill || sug.suggested_skill || "listening";

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("youtube_sync_sources")
      .insert({
        kind: "channel",
        source_id: sug.channel_id,
        label: sug.title,
        default_skill: skill,
        max_results: 25,
        enabled: true,
      })
      .select("id,kind,source_id,default_skill,max_results")
      .single();
    if (insErr) throw new Error(insErr.message);

    await supabaseAdmin
      .from("yt_channel_suggestions")
      .update({ status: "added", suggested_skill: skill })
      .eq("id", data.id);

    // Best-effort immediate sync
    let imported = 0;
    try {
      const r = await syncOneSource(inserted as SyncSource);
      imported = r.imported;
      await supabaseAdmin
        .from("youtube_sync_sources")
        .update({
          last_synced_at: new Date().toISOString(),
          last_error: null,
          last_imported_count: r.imported,
        })
        .eq("id", (inserted as any).id);
    } catch (e: any) {
      await supabaseAdmin
        .from("youtube_sync_sources")
        .update({
          last_synced_at: new Date().toISOString(),
          last_error: (e?.message ?? "sync failed").slice(0, 500),
        })
        .eq("id", (inserted as any).id);
    }
    return { ok: true as const, imported };
  });

export const dismissChannelSuggestion = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { data: sug, error } = await supabaseAdmin
      .from("yt_channel_suggestions")
      .select("channel_id")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("yt_channel_dismissed")
      .upsert({ channel_id: sug.channel_id }, { onConflict: "channel_id" });
    await supabaseAdmin
      .from("yt_channel_suggestions")
      .update({ status: "dismissed" })
      .eq("id", data.id);
    return { ok: true as const };
  });
