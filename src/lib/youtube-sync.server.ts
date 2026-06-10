import { supabaseAdmin } from "@/integrations/supabase/client.server";

export function getYouTubeApiKey(): string {
  const k = process.env.YOUTUBE_API_KEY;
  if (!k) throw new Error("YOUTUBE_API_KEY is not configured");
  return k;
}

export async function yt<T = any>(
  path: string,
  params: Record<string, string>,
): Promise<T> {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", getYouTubeApiKey());
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `YouTube API ${path} failed [${res.status}]: ${body.slice(0, 300)}`,
    );
  }
  return (await res.json()) as T;
}

export function parseIsoDuration(iso: string | undefined): number | null {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1] ?? "0", 10);
  const mn = parseInt(m[2] ?? "0", 10);
  const s = parseInt(m[3] ?? "0", 10);
  return h * 3600 + mn * 60 + s;
}

export type SyncSource = {
  id: string;
  kind: "channel" | "playlist";
  source_id: string;
  default_skill: string;
  max_results: number;
};

export async function syncOneSource(source: SyncSource): Promise<{
  imported: number;
  skipped: number;
}> {
  let playlistId = source.source_id;
  if (source.kind === "channel") {
    const chData = await yt<any>("channels", {
      part: "contentDetails",
      id: source.source_id,
    });
    const uploads =
      chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) throw new Error("Channel has no uploads playlist");
    playlistId = uploads;
  }

  // Hard safety cap to avoid runaway quota usage on huge channels.
  // max_results <= 0 means "no per-source cap, fetch everything".
  const hardCap =
    source.max_results && source.max_results > 0 ? source.max_results : 100000;

  // 1) Page through ALL playlist items to collect every video id.
  const videoIds: string[] = [];
  let pageToken: string | undefined = undefined;
  for (let page = 0; page < 400; page++) {
    const params: Record<string, string> = {
      part: "contentDetails",
      playlistId,
      maxResults: "50",
    };
    if (pageToken) params.pageToken = pageToken;
    const items = await yt<any>("playlistItems", params);
    for (const it of items.items ?? []) {
      const vid = it.contentDetails?.videoId;
      if (vid) videoIds.push(vid);
      if (videoIds.length >= hardCap) break;
    }
    if (videoIds.length >= hardCap) break;
    pageToken = items.nextPageToken;
    if (!pageToken) break;
  }
  if (videoIds.length === 0) return { imported: 0, skipped: 0 };

  // 2) Skip ids we already have stored (chunked IN query to avoid URL limits).
  const existingSet = new Set<string>();
  for (let i = 0; i < videoIds.length; i += 200) {
    const slice = videoIds.slice(i, i + 200);
    const { data: existing } = await supabaseAdmin
      .from("videos")
      .select("youtube_id")
      .in("youtube_id", slice);
    for (const r of existing ?? []) existingSet.add((r as any).youtube_id);
  }
  const toFetch = videoIds.filter((id) => !existingSet.has(id));
  if (toFetch.length === 0) {
    return { imported: 0, skipped: videoIds.length };
  }

  // 3) Hydrate metadata in batches of 50 (YouTube /videos endpoint limit).
  const allRows: any[] = [];
  for (let i = 0; i < toFetch.length; i += 50) {
    const batch = toFetch.slice(i, i + 50);
    const vidData = await yt<any>("videos", {
      part: "snippet,contentDetails",
      id: batch.join(","),
    });
    for (const v of vidData.items ?? []) {
      const sn = v.snippet ?? {};
      const thumb =
        sn.thumbnails?.maxres?.url ||
        sn.thumbnails?.standard?.url ||
        sn.thumbnails?.high?.url ||
        sn.thumbnails?.medium?.url ||
        `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
      allRows.push({
        title: (sn.title ?? "Untitled").slice(0, 500),
        description: (sn.description ?? "").slice(0, 4000),
        url: `https://www.youtube.com/watch?v=${v.id}`,
        thumbnail_url: thumb,
        duration_seconds: parseIsoDuration(v.contentDetails?.duration),
        skill: source.default_skill,
        status: "published",
        youtube_id: v.id,
        source_id: source.id,
        published_at: sn.publishedAt ?? null,
      });
    }
  }

  // 4) Insert in chunks to keep payloads reasonable.
  let imported = 0;
  for (let i = 0; i < allRows.length; i += 200) {
    const chunk = allRows.slice(i, i + 200);
    const { error } = await supabaseAdmin.from("videos").insert(chunk);
    if (error) throw new Error(error.message);
    imported += chunk.length;
  }
  return { imported, skipped: videoIds.length - imported };
}
