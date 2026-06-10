import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdminSession } from "./admin-cms.server";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// =============================================================================
// MODULES
// =============================================================================
export type Module = {
  id: string;
  slug: string;
  title: string;
  skill: "listening" | "reading" | "writing" | "speaking";
  summary: string | null;
  icon: string | null;
  position: number;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
};

export const adminListModules = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<Module[]> => {
    const sb = await admin();
    const { data, error } = await sb.from("modules").select("*").order("position").order("created_at");
    if (error) throw new Error(error.message);
    return (data ?? []) as Module[];
  });

const ModuleInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  skill: z.enum(["listening", "reading", "writing", "speaking"]),
  summary: z.string().max(2000).nullable().default(null),
  icon: z.string().max(60).nullable().default(null),
  position: z.number().int().min(0).max(9999).default(0),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const adminUpsertModule = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => ModuleInput.parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { id, ...payload } = data;
    const op = id ? sb.from("modules").update(payload as any).eq("id", id) : sb.from("modules").insert(payload as any);
    const { error } = await op;
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteModule = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("modules").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// =============================================================================
// MODULE QUESTIONS (junction table)
// =============================================================================
export type ModuleQuestion = {
  id: string;
  module_id: string;
  question_id: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export const adminListModuleQuestions = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({ moduleId: z.string().uuid() }).parse(i))
  .handler(async ({ data }): Promise<(ModuleQuestion & { question: Question })[]> => {
    const sb = await admin();
    const { data: mqs, error } = await sb
      .from("module_questions")
      .select("*, question:questions(*)")
      .eq("module_id", data.moduleId)
      .order("position");
    if (error) throw new Error(error.message);
    return (mqs ?? []) as any;
  });

export const adminAddQuestionToModule = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({
    moduleId: z.string().uuid(),
    questionId: z.string().uuid(),
    position: z.number().int().min(0).optional(),
  }).parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { moduleId, questionId, position } = data;
    
    // If no position specified, append to end
    let pos = position ?? 0;
    if (position === undefined) {
      const { data: existing } = await sb
        .from("module_questions")
        .select("position")
        .eq("module_id", moduleId)
        .order("position", { ascending: false })
        .limit(1);
      pos = ((existing as any)?.[0]?.position ?? -1) + 1;
    }
    
    const { error } = await sb.from("module_questions").insert({
      module_id: moduleId,
      question_id: questionId,
      position: pos,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminRemoveQuestionFromModule = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("module_questions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminUpdateModuleQuestionPosition = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({
    id: z.string().uuid(),
    position: z.number().int().min(0),
  }).parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb
      .from("module_questions")
      .update({ position: data.position })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// =============================================================================
// QUESTIONS
// =============================================================================
export type Question = {
  id: string;
  skill: "listening" | "reading" | "writing" | "speaking";
  type: string;
  difficulty: number;
  prompt: string;
  body: any;
  answer_key: any;
  tags: string[] | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
};

export const adminListQuestions = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<Question[]> => {
    const sb = await admin();
    const { data, error } = await sb.from("questions").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as Question[];
  });

const QuestionInput = z.object({
  id: z.string().uuid().optional(),
  skill: z.enum(["listening", "reading", "writing", "speaking"]),
  type: z.string().min(1).max(60),
  difficulty: z.number().int().min(1).max(10).default(3),
  prompt: z.string().min(1).max(4000),
  body: z.any().default({}),
  answer_key: z.any().default({}),
  tags: z.array(z.string().max(60)).max(20).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const adminUpsertQuestion = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => QuestionInput.parse(i))
  .handler(async ({ data }): Promise<{ ok: true; id: string }> => {
    const sb = await admin();
    const { id, ...payload } = data;
    if (id) {
      const { error } = await sb.from("questions").update(payload as any).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true, id };
    } else {
      const { data: rows, error } = await sb
        .from("questions")
        .insert(payload as any)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { ok: true, id: (rows as any).id as string };
    }
  });

export const adminDeleteQuestion = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("questions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// =============================================================================
// VOCABULARY
// =============================================================================
export type Vocab = {
  id: string;
  word: string;
  part_of_speech: string | null;
  definition: string | null;
  example: string | null;
  cefr: string | null;
  tags: string[] | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
};

export const adminListVocab = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<Vocab[]> => {
    const sb = await admin();
    const { data, error } = await sb.from("vocabulary").select("*").order("word").limit(2000);
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Vocab[];
  });

const VocabInput = z.object({
  id: z.string().uuid().optional(),
  word: z.string().min(1).max(120),
  part_of_speech: z.string().max(60).nullable().default(null),
  definition: z.string().max(2000).nullable().default(null),
  example: z.string().max(2000).nullable().default(null),
  cefr: z.string().max(10).nullable().default(null),
  tags: z.array(z.string().max(60)).max(20).default([]),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});

export const adminUpsertVocab = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => VocabInput.parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { id, ...payload } = data;
    const op = id ? sb.from("vocabulary").update(payload as any).eq("id", id) : sb.from("vocabulary").insert(payload as any);
    const { error } = await op;
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteVocab = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("vocabulary").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// =============================================================================
// MOCK TESTS
// =============================================================================
export type MockTest = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  is_full_test: boolean;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
};

export const adminListMockTests = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<MockTest[]> => {
    const sb = await admin();
    const { data, error } = await sb.from("mock_tests").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as MockTest[];
  });

const MockTestInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().default(null),
  duration_minutes: z.number().int().min(1).max(600).default(180),
  is_full_test: z.boolean().default(true),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const adminUpsertMockTest = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => MockTestInput.parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { id, ...payload } = data;
    const op = id ? sb.from("mock_tests").update(payload as any).eq("id", id) : sb.from("mock_tests").insert(payload as any);
    const { error } = await op;
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteMockTest = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("mock_tests").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// =============================================================================
// PREDICTIONS
// =============================================================================
export type Prediction = {
  id: string;
  topic: string;
  skill: "listening" | "reading" | "writing" | "speaking";
  content: string;
  exam_period: string | null;
  exam_date: string | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
};

export const adminListPredictions = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<Prediction[]> => {
    const sb = await admin();
    const { data, error } = await sb.from("predictions").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Prediction[];
  });

const PredictionInput = z.object({
  id: z.string().uuid().optional(),
  topic: z.string().min(1).max(300),
  skill: z.enum(["listening", "reading", "writing", "speaking"]),
  content: z.string().min(1).max(8000),
  exam_period: z.string().max(60).nullable().default(null),
  exam_date: z.string().nullable().default(null),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});

export const adminUpsertPrediction = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => PredictionInput.parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { id, ...payload } = data;
    const op = id ? sb.from("predictions").update(payload as any).eq("id", id) : sb.from("predictions").insert(payload as any);
    const { error } = await op;
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeletePrediction = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("predictions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// =============================================================================
// MAIL TEMPLATES
// =============================================================================
export type MailTemplate = {
  id: string;
  name: string;
  subject: string;
  html: string;
  text: string | null;
  created_at: string;
  updated_at: string;
};

export const adminListMail = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<MailTemplate[]> => {
    const sb = await admin();
    const { data, error } = await sb.from("mail_templates").select("*").order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as MailTemplate[];
  });

const MailInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  subject: z.string().min(1).max(300),
  html: z.string().min(1).max(50000),
  text: z.string().max(20000).nullable().default(null),
});

export const adminUpsertMail = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => MailInput.parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { id, ...payload } = data;
    const op = id ? sb.from("mail_templates").update(payload as any).eq("id", id) : sb.from("mail_templates").insert(payload as any);
    const { error } = await op;
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteMail = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("mail_templates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// =============================================================================
// LIVE SESSIONS
// =============================================================================
export type LiveSession = {
  id: string;
  title: string;
  description: string | null;
  host_name: string | null;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
};

export const adminListLive = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<LiveSession[]> => {
    const sb = await admin();
    const { data, error } = await sb.from("live_sessions").select("*").order("scheduled_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as LiveSession[];
  });

const LiveInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().default(null),
  host_name: z.string().max(120).nullable().default(null),
  scheduled_at: z.string().min(1),
  duration_minutes: z.number().int().min(5).max(600).default(60),
  meeting_url: z.string().max(500).nullable().default(null),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});

export const adminUpsertLive = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => LiveInput.parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { id, ...payload } = data;
    const op = id ? sb.from("live_sessions").update(payload as any).eq("id", id) : sb.from("live_sessions").insert(payload as any);
    const { error } = await op;
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteLive = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("live_sessions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// =============================================================================
// CONTENT (articles)
// =============================================================================
export type ContentItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: any;
  cover_url: string | null;
  category: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export const adminListContent = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<ContentItem[]> => {
    const sb = await admin();
    const { data, error } = await sb.from("content").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ContentItem[];
  });

const ContentInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(160),
  title: z.string().min(1).max(300),
  excerpt: z.string().max(500).nullable().default(null),
  body: z.any().default({}),
  cover_url: z.string().max(500).nullable().default(null),
  category: z.string().max(60).nullable().default(null),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const adminUpsertContent = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => ContentInput.parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { id, ...payload } = data;
    const op = id ? sb.from("content").update(payload as any).eq("id", id) : sb.from("content").insert(payload as any);
    const { error } = await op;
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteContent = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("content").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// =============================================================================
// NOTIFICATIONS (admin broadcast)
// =============================================================================
export type AdminNotification = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  url: string | null;
  read_at: string | null;
  created_at: string;
};

export const adminListNotifications = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<AdminNotification[]> => {
    const sb = await admin();
    const { data, error } = await sb.from("notifications").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminNotification[];
  });

const BroadcastInput = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(2000).nullable().default(null),
  url: z.string().max(500).nullable().default(null),
  target: z.enum(["all", "user"]).default("all"),
  user_id: z.string().uuid().optional(),
});

export const adminBroadcastNotification = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => BroadcastInput.parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    if (data.target === "user") {
      if (!data.user_id) throw new Error("user_id required");
      const { error } = await sb.from("notifications").insert({
        user_id: data.user_id, title: data.title, body: data.body, url: data.url,
      });
      if (error) throw new Error(error.message);
      return { ok: true as const, count: 1 };
    }
    const { data: users, error: uerr } = await sb.from("profiles").select("user_id");
    if (uerr) throw new Error(uerr.message);
    if (!users?.length) return { ok: true as const, count: 0 };
    const rows = users.map((u: any) => ({
      user_id: u.user_id, title: data.title, body: data.body, url: data.url,
    }));
    const { error } = await sb.from("notifications").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true as const, count: rows.length };
  });

export const adminDeleteNotification = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("notifications").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// =============================================================================
// REPORTS (saved queries)
// =============================================================================
export type Report = {
  id: string;
  name: string;
  query_kind: string;
  params: any;
  created_at: string;
  updated_at: string;
};

export const adminListReports = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<Report[]> => {
    const sb = await admin();
    const { data, error } = await sb.from("reports").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Report[];
  });

// =============================================================================
// USERS (list profiles + roles)
// =============================================================================
export type AdminUser = {
  user_id: string;
  display_name: string | null;
  country: string | null;
  target_band: number | null;
  exam_date: string | null;
  created_at: string;
  roles: string[];
};

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<AdminUser[]> => {
    const sb = await admin();
    const { data: profiles, error } = await sb
      .from("profiles")
      .select("user_id,display_name,country,target_band,exam_date,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    const { data: roles } = await sb.from("user_roles").select("user_id,role");
    const byUser = new Map<string, string[]>();
    (roles ?? []).forEach((r: any) => {
      const arr = byUser.get(r.user_id) ?? [];
      arr.push(r.role);
      byUser.set(r.user_id, arr);
    });
    return (profiles ?? []).map((p: any) => ({ ...p, roles: byUser.get(p.user_id) ?? [] }));
  });

// =============================================================================
// SPEAKING AI sessions (read-only)
// =============================================================================
export type SpeakingSession = {
  id: string;
  user_id: string;
  topic: string | null;
  score: number | null;
  audio_url: string | null;
  created_at: string;
};

export const adminListSpeakingSessions = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<SpeakingSession[]> => {
    const sb = await admin();
    const { data, error } = await sb
      .from("speaking_ai_sessions")
      .select("id,user_id,topic,score,audio_url,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as SpeakingSession[];
  });

// =============================================================================
// APP SETTINGS (key/value)
// =============================================================================
export type AppSetting = { key: string; value: any; updated_at: string };

export const adminListSettings = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<AppSetting[]> => {
    const sb = await admin();
    const { data, error } = await sb.from("app_settings").select("*").order("key");
    if (error) throw new Error(error.message);
    return (data ?? []) as AppSetting[];
  });

export const adminUpsertSetting = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) =>
    z.object({ key: z.string().min(1).max(120), value: z.string().max(20000) }).parse(i),
  )
  .handler(async ({ data }) => {
    const sb = await admin();
    let parsed: any = data.value;
    try { parsed = JSON.parse(data.value); } catch { /* keep string */ }
    const { error } = await sb.from("app_settings").upsert({ key: data.key, value: parsed });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteSetting = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({ key: z.string().min(1).max(120) }).parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("app_settings").delete().eq("key", data.key);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// =============================================================================
// API KEYS (list/create/delete)
// =============================================================================
export type ApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[] | null;
  last_used_at: string | null;
  created_at: string;
};

export const adminListApiKeys = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<ApiKey[]> => {
    const sb = await admin();
    const { data, error } = await sb
      .from("api_keys")
      .select("id,name,key_prefix,scopes,last_used_at,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ApiKey[];
  });

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const adminCreateApiKey = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) =>
    z.object({
      name: z.string().min(1).max(120),
      scopes: z.array(z.string().max(60)).max(20).default([]),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    const sb = await admin();
    const rand = crypto.getRandomValues(new Uint8Array(24));
    const secret = "sk_live_" + Array.from(rand).map((b) => b.toString(16).padStart(2, "0")).join("");
    const prefix = secret.slice(0, 12);
    const hashed = await sha256Hex(secret);
    const { error } = await sb.from("api_keys").insert({
      name: data.name, key_prefix: prefix, hashed_secret: hashed, scopes: data.scopes,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const, secret };
  });

export const adminDeleteApiKey = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("api_keys").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// =============================================================================
// SUBSCRIPTIONS (admin overview — read only here)
// =============================================================================
export const adminListSubscriptions = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async () => {
    const sb = await admin();
    const { data, error } = await sb.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// =============================================================================
// DASHBOARD STATS for admin.index
// =============================================================================
export const adminDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async () => {
    const sb = await admin();
    const tables = [
      "profiles", "modules", "questions", "mock_tests", "vocabulary",
      "attempts", "writing_submissions", "speaking_ai_sessions",
      "live_sessions", "predictions", "subscriptions", "videos",
    ];
    const counts: Record<string, number> = {};
    for (const t of tables) {
      const { count } = await sb.from(t as any).select("*", { count: "exact", head: true });
      counts[t] = count ?? 0;
    }
    const { count: activeSubs } = await sb
      .from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active");
    counts["active_subscriptions"] = activeSubs ?? 0;
    return counts;
  });
