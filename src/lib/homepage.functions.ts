import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PublicTestimonial = {
  id: string;
  name: string;
  city: string;
  target: string;
  quote: string;
};

export type PublicVideo = {
  id: string;
  title: string;
  youtube_id: string;
  thumbnail_url: string;
  skill: string;
};

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export const listPublicTestimonials = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicTestimonial[]> => {
    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .select("id,name,city,target,quote")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(48);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      city: row.city ?? "",
      target: row.target ?? "",
      quote: row.quote,
    }));
  },
);

export const listPublicHomeVideos = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicVideo[]> => {
    const { data, error } = await supabaseAdmin
      .from("videos")
      .select("id,title,url,thumbnail_url,skill,status")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((row: any): PublicVideo | null => {
        const yt = extractYouTubeId(row.url);
        if (!yt) return null;
        return {
          id: row.id,
          title: row.title,
          youtube_id: yt,
          thumbnail_url: row.thumbnail_url || `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
          skill: row.skill ?? "listening",
        };
      })
      .filter((v: PublicVideo | null): v is PublicVideo => v !== null);
  },
);

export type LibraryVideo = {
  id: string;
  title: string;
  description: string;
  youtube_id: string;
  thumbnail_url: string;
  duration_seconds: number | null;
  skill: string;
  published_at: string | null;
  source_id: string | null;
};

export type LibraryChannel = {
  id: string;
  label: string;
  kind: "channel" | "playlist";
  source_id: string;
  default_skill: string;
  video_count: number;
};

export type VideoLibrary = {
  channels: LibraryChannel[];
  videos: LibraryVideo[];
};

export const getVideoLibrary = createServerFn({ method: "GET" }).handler(
  async (): Promise<VideoLibrary> => {
    const [srcRes, vidRes] = await Promise.all([
      supabaseAdmin
        .from("youtube_sync_sources")
        .select("id,label,kind,source_id,default_skill")
        .order("label", { ascending: true }),
      supabaseAdmin
        .from("videos")
        .select("id,title,description,url,thumbnail_url,duration_seconds,skill,published_at,source_id,youtube_id")
        .eq("status", "published")
        .not("youtube_id", "is", null)
        .order("published_at", { ascending: false })
        .limit(10000),
    ]);
    if (srcRes.error) throw new Error(srcRes.error.message);
    if (vidRes.error) throw new Error(vidRes.error.message);

    const videos: LibraryVideo[] = (vidRes.data ?? [])
      .map((row: any): LibraryVideo | null => {
        const yt = row.youtube_id || extractYouTubeId(row.url);
        if (!yt) return null;
        return {
          id: row.id,
          title: row.title ?? "Untitled",
          description: row.description ?? "",
          youtube_id: yt,
          thumbnail_url: row.thumbnail_url || `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
          duration_seconds: row.duration_seconds ?? null,
          skill: row.skill ?? "listening",
          published_at: row.published_at ?? null,
          source_id: row.source_id ?? null,
        };
      })
      .filter((v: LibraryVideo | null): v is LibraryVideo => v !== null);

    const counts = new Map<string, number>();
    for (const v of videos) {
      if (!v.source_id) continue;
      counts.set(v.source_id, (counts.get(v.source_id) ?? 0) + 1);
    }
    const channels: LibraryChannel[] = (srcRes.data ?? [])
      .map((s: any) => ({
        id: s.id,
        label: s.label,
        kind: s.kind,
        source_id: s.source_id,
        default_skill: s.default_skill,
        video_count: counts.get(s.id) ?? 0,
      }))
      .filter((c: LibraryChannel) => c.video_count > 0);

    return { channels, videos };
  },
);

export type PublicStats = {
  videos: number;
  testimonials: number;
  modules: number;
  liveSessions: number;
};

export const getPublicStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicStats> => {
    const [v, t, m, l] = await Promise.all([
      supabaseAdmin.from("videos").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabaseAdmin.from("testimonials").select("id", { count: "exact", head: true }).eq("published", true),
      supabaseAdmin.from("modules").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabaseAdmin.from("live_sessions").select("id", { count: "exact", head: true }).eq("status", "published"),
    ]);
    return {
      videos: v.count ?? 0,
      testimonials: t.count ?? 0,
      modules: m.count ?? 0,
      liveSessions: l.count ?? 0,
    };
  },
);
