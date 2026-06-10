import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// All student-facing data fetchers, scoped to the authenticated user via RLS.

export const studentOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [attemptsRes, writingRes, speakingRes, profileRes] = await Promise.all([
      sb.from("attempts").select("id,skill,band,submitted_at,status").order("submitted_at", { ascending: false }).limit(30),
      sb.from("writing_submissions").select("id,band,created_at").order("created_at", { ascending: false }).limit(30),
      sb.from("speaking_ai_sessions").select("id,score,created_at").order("created_at", { ascending: false }).limit(30),
      sb.from("profiles").select("target_band,exam_date,display_name").maybeSingle(),
    ]);
    const attempts = attemptsRes.data ?? [];
    const writing = writingRes.data ?? [];
    const speaking = speakingRes.data ?? [];
    const bands: number[] = [
      ...attempts.map((a: any) => Number(a.band)).filter((n: any) => Number.isFinite(n)),
      ...writing.map((a: any) => Number(a.band)).filter((n: any) => Number.isFinite(n)),
      ...speaking.map((a: any) => Number(a.score)).filter((n: any) => Number.isFinite(n)),
    ];
    const avgBand = bands.length ? Number((bands.reduce((s, n) => s + n, 0) / bands.length).toFixed(1)) : null;
    const dates = new Set<string>();
    const collect = (arr: any[], k: string) => arr.forEach((r) => { const v = r[k]; if (v) dates.add(new Date(v).toISOString().slice(0, 10)); });
    collect(attempts, "submitted_at"); collect(writing, "created_at"); collect(speaking, "created_at");
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (dates.has(d.toISOString().slice(0, 10))) streak++; else if (i > 0) break;
    }
    return {
      profile: profileRes.data ?? null,
      counts: { attempts: attempts.length, writing: writing.length, speaking: speaking.length },
      avgBand, streak,
      recent: attempts.slice(0, 5).map((a: any) => ({ id: a.id, skill: a.skill, band: a.band, at: a.submitted_at, status: a.status })),
    };
  });

export const studentListLive = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("live_sessions")
      .select("id,title,description,host_name,scheduled_at,duration_minutes,meeting_url,status")
      .eq("status", "published")
      .order("scheduled_at", { ascending: true })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const studentRegisterLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { sessionId: string }) => d)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("live_registrations")
      .upsert({ user_id: context.userId, session_id: data.sessionId }, { onConflict: "user_id,session_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const studentListMockTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mock_tests")
      .select("id,slug,title,description,duration_minutes,is_full_test")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const studentListVocab = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("vocabulary")
      .select("id,word,part_of_speech,definition,example,cefr,tags")
      .eq("status", "published")
      .order("word")
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const studentReviewVocab = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { vocabularyId: string; quality: "again" | "good" | "easy" }) => d)
  .handler(async ({ context, data }) => {
    const sb = context.supabase;
    const { data: existing } = await sb.from("user_vocabulary")
      .select("ease,interval_days").eq("user_id", context.userId).eq("vocabulary_id", data.vocabularyId).maybeSingle();
    const ease = existing?.ease ?? 2.5;
    const interval = existing?.interval_days ?? 1;
    let newEase = ease, newInterval = interval;
    if (data.quality === "again") { newEase = Math.max(1.3, ease - 0.2); newInterval = 1; }
    else if (data.quality === "good") { newInterval = Math.max(1, Math.round(interval * ease)); }
    else { newEase = ease + 0.15; newInterval = Math.max(1, Math.round(interval * ease * 1.3)); }
    const next = new Date(); next.setDate(next.getDate() + newInterval);
    const { error } = await sb.from("user_vocabulary").upsert({
      user_id: context.userId, vocabulary_id: data.vocabularyId,
      state: data.quality === "again" ? "learning" : "review",
      ease: newEase, interval_days: newInterval, next_review_at: next.toISOString(),
    }, { onConflict: "user_id,vocabulary_id" });
    if (error) throw new Error(error.message);
    return { ok: true, nextDays: newInterval };
  });

export const studentListPredictions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("predictions")
      .select("id,topic,skill,content,exam_period,exam_date")
      .eq("status", "published")
      .order("exam_date", { ascending: true, nullsFirst: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const studentListModules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("modules")
      .select("id,slug,title,skill,summary,icon")
      .eq("status", "published")
      .order("position");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ===== Practice: question fetching + attempt lifecycle =====

export const studentListQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { skill: "listening" | "reading" | "writing" | "speaking"; limit?: number }) => d)
  .handler(async ({ context, data }) => {
    const { data: qs, error } = await context.supabase
      .from("questions")
      .select("id,skill,type,difficulty,prompt,body,tags")
      .eq("skill", data.skill)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 20);
    if (error) throw new Error(error.message);
    return qs ?? [];
  });

export const studentStartAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { skill: "listening" | "reading" | "writing" | "speaking"; mockTestId?: string }) => d)
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("attempts")
      .insert({ user_id: context.userId, skill: data.skill, mock_test_id: data.mockTestId ?? null, status: "in_progress" })
      .select("id").single();
    if (error) throw new Error(error.message);
    return { attemptId: row.id };
  });

export const studentSubmitAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    attemptId: string;
    answers: Array<{ questionId: string; answer: any }>;
  }) => d)
  .handler(async ({ context, data }) => {
    const sb = context.supabase;
    // Fetch answer keys
    const qids = data.answers.map(a => a.questionId);
    const { data: qs, error: qe } = await sb.from("questions").select("id,answer_key,type").in("id", qids);
    if (qe) throw new Error(qe.message);
    const keyById = new Map((qs ?? []).map((q: any) => [q.id, q]));
    let correct = 0;
    const rows = data.answers.map(a => {
      const q = keyById.get(a.questionId) as any;
      const expected = q?.answer_key?.value ?? q?.answer_key?.answer ?? q?.answer_key;
      const got = typeof a.answer === "object" ? a.answer?.value ?? a.answer : a.answer;
      const isCorrect = expected != null && got != null &&
        String(got).trim().toLowerCase() === String(expected).trim().toLowerCase();
      if (isCorrect) correct++;
      return { attempt_id: data.attemptId, question_id: a.questionId, answer: { value: got }, is_correct: isCorrect, score: isCorrect ? 1 : 0 };
    });
    if (rows.length) {
      const { error: ae } = await sb.from("attempt_answers").insert(rows);
      if (ae) throw new Error(ae.message);
    }
    const total = data.answers.length || 1;
    const ratio = correct / total;
    // Rough IELTS-ish band mapping
    const band = Math.max(4, Math.min(9, Number((4 + ratio * 5).toFixed(1))));
    const { error: ue } = await sb.from("attempts")
      .update({ status: "submitted", submitted_at: new Date().toISOString(), score: correct, band })
      .eq("id", data.attemptId).eq("user_id", context.userId);
    if (ue) throw new Error(ue.message);
    return { correct, total, band };
  });

// ===== Writing =====
export const studentSubmitWriting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { taskType: string; prompt: string; essay: string }) => d)
  .handler(async ({ context, data }) => {
    const wordCount = data.essay.trim().split(/\s+/).filter(Boolean).length;
    // Heuristic band (real grading should be AI-driven)
    const target = data.taskType.toLowerCase().includes("task 1") ? 150 : 250;
    const ratio = Math.min(1, wordCount / target);
    const lexicalRichness = new Set(data.essay.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? []).size / Math.max(1, wordCount);
    const band = Math.max(4, Math.min(9, Number((5 + ratio * 2 + lexicalRichness * 3).toFixed(1))));
    const { data: row, error } = await context.supabase.from("writing_submissions").insert({
      user_id: context.userId, task_type: data.taskType, prompt: data.prompt, essay: data.essay,
      word_count: wordCount, band,
      feedback: { criteria: { task: band, coherence: band, lexical: band, grammar: band } },
    }).select("id,band,word_count").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const studentListWriting = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("writing_submissions")
      .select("id,task_type,prompt,word_count,band,created_at")
      .order("created_at", { ascending: false }).limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ===== Speaking =====
export const studentSaveSpeaking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topic?: string; transcript: Array<{ role: string; text: string }>; score?: number }) => d)
  .handler(async ({ context, data }) => {
    const score = data.score ?? Math.max(4, Math.min(9, 5 + (data.transcript.length * 0.15)));
    const { data: row, error } = await context.supabase.from("speaking_ai_sessions").insert({
      user_id: context.userId, topic: data.topic ?? null, transcript: data.transcript, score,
    }).select("id,score").single();
    if (error) throw new Error(error.message);
    return row;
  });

// ===== Listening / Reading progress =====
export const studentSaveProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { skill: "listening" | "reading"; itemId: string; progress: number; score?: number }) => d)
  .handler(async ({ context, data }) => {
    const sb = context.supabase;
    const common = { user_id: context.userId, progress: data.progress, score: data.score ?? null, updated_at: new Date().toISOString() };
    const res = data.skill === "listening"
      ? await sb.from("listening_progress").upsert({ ...common, audio_id: data.itemId }, { onConflict: "user_id,audio_id" })
      : await sb.from("reading_progress").upsert({ ...common, passage_id: data.itemId }, { onConflict: "user_id,passage_id" });
    if (res.error) throw new Error(res.error.message);
    return { ok: true };
  });

// ===== Progress / Intelligence aggregation =====
export const studentProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [att, wr, sp] = await Promise.all([
      sb.from("attempts").select("skill,band,submitted_at").eq("status", "submitted").order("submitted_at", { ascending: false }).limit(200),
      sb.from("writing_submissions").select("band,created_at").order("created_at", { ascending: false }).limit(200),
      sb.from("speaking_ai_sessions").select("score,created_at").order("created_at", { ascending: false }).limit(200),
    ]);
    const bySkill: Record<string, number[]> = { listening: [], reading: [], writing: [], speaking: [] };
    (att.data ?? []).forEach((a: any) => { if (a.skill && a.band != null) bySkill[a.skill]?.push(Number(a.band)); });
    (wr.data ?? []).forEach((a: any) => { if (a.band != null) bySkill.writing.push(Number(a.band)); });
    (sp.data ?? []).forEach((a: any) => { if (a.score != null) bySkill.speaking.push(Number(a.score)); });
    const avg = (xs: number[]) => xs.length ? Number((xs.reduce((s, n) => s + n, 0) / xs.length).toFixed(1)) : null;
    const series = (xs: { at: string; v: number }[]) => xs.slice().reverse();
    const timeline = [
      ...(att.data ?? []).map((a: any) => ({ at: a.submitted_at, v: Number(a.band), kind: a.skill })),
      ...(wr.data ?? []).map((a: any) => ({ at: a.created_at, v: Number(a.band), kind: "writing" })),
      ...(sp.data ?? []).map((a: any) => ({ at: a.created_at, v: Number(a.score), kind: "speaking" })),
    ].filter(p => Number.isFinite(p.v)).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    return {
      skills: {
        listening: avg(bySkill.listening),
        reading: avg(bySkill.reading),
        writing: avg(bySkill.writing),
        speaking: avg(bySkill.speaking),
      },
      counts: {
        listening: bySkill.listening.length,
        reading: bySkill.reading.length,
        writing: bySkill.writing.length,
        speaking: bySkill.speaking.length,
      },
      timeline: series(timeline.map(t => ({ at: t.at, v: t.v }))).slice(-30),
    };
  });

// ===== Plan =====
export const studentGetPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const weekStart = monday.toISOString().slice(0, 10);
    const { data } = await context.supabase.from("study_plans")
      .select("plan,week_start,generated_at").eq("user_id", context.userId).eq("week_start", weekStart).maybeSingle();
    return data ?? null;
  });

export const studentUpsertPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { plan: any }) => d)
  .handler(async ({ context, data }) => {
    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const weekStart = monday.toISOString().slice(0, 10);
    const { error } = await context.supabase.from("study_plans").upsert({
      user_id: context.userId, week_start: weekStart, plan: data.plan, generated_at: new Date().toISOString(),
    }, { onConflict: "user_id,week_start" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===== Billing =====
export const studentBilling = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [sub, inv] = await Promise.all([
      sb.from("subscriptions").select("plan,status,trial_end,current_period_end,provider").maybeSingle(),
      sb.from("billing_invoices").select("id,amount_cents,currency,status,hosted_invoice_url,issued_at").order("issued_at", { ascending: false }).limit(20),
    ]);
    return { subscription: sub.data ?? null, invoices: inv.data ?? [] };
  });

// ===== Videos =====
export const studentListVideos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("videos")
      .select("id,title,description,url,thumbnail_url,duration_seconds,skill,youtube_id,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
