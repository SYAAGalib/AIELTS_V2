import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PublicFaq = {
  id: string;
  question: string;
  short_answer: string;
  full_answer: string;
  tag: string;
  featured: boolean;
  highlight: boolean;
  sort_order: number;
};

export type AdminTestimonial = {
  id: string;
  name: string;
  city: string;
  target: string;
  quote: string;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type AdminFaq = PublicFaq & { published: boolean; created_at: string };

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("is_admin", { _user_id: userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

// ---------- PUBLIC ----------
export const listPublicFaqs = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicFaq[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("faqs")
      .select("id,question,short_answer,full_answer,tag,featured,highlight,sort_order")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as PublicFaq[];
  },
);

// ---------- ADMIN: TESTIMONIALS ----------
export const adminListTestimonials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminTestimonial[]> => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("testimonials")
      .select("id,name,city,target,quote,sort_order,published,created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminTestimonial[];
  });

const TestimonialInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  city: z.string().max(120).default(""),
  target: z.string().max(180).default(""),
  quote: z.string().min(1).max(2000),
  sort_order: z.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true),
});

export const adminUpsertTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => TestimonialInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.id) {
      const { error } = await context.supabase.from("testimonials").update({
        name: data.name, city: data.city, target: data.target, quote: data.quote,
        sort_order: data.sort_order, published: data.published,
      }).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("testimonials").insert({
        name: data.name, city: data.city, target: data.target, quote: data.quote,
        sort_order: data.sort_order, published: data.published,
      });
      if (error) throw new Error(error.message);
    }
    return { ok: true as const };
  });

export const adminDeleteTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("testimonials").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- ADMIN: FAQS ----------
export const adminListFaqs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminFaq[]> => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("faqs")
      .select("id,question,short_answer,full_answer,tag,featured,highlight,sort_order,published,created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminFaq[];
  });

const FaqInput = z.object({
  id: z.string().uuid().optional(),
  question: z.string().min(1).max(300),
  short_answer: z.string().max(500).default(""),
  full_answer: z.string().min(1).max(4000),
  tag: z.string().min(1).max(60).default("General"),
  sort_order: z.number().int().min(0).max(9999).default(0),
  featured: z.boolean().default(false),
  highlight: z.boolean().default(false),
  published: z.boolean().default(true),
});

export const adminUpsertFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => FaqInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload = {
      question: data.question, short_answer: data.short_answer, full_answer: data.full_answer,
      tag: data.tag, sort_order: data.sort_order, featured: data.featured,
      highlight: data.highlight, published: data.published,
    };
    if (data.id) {
      const { error } = await context.supabase.from("faqs").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("faqs").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true as const };
  });

export const adminDeleteFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("faqs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
