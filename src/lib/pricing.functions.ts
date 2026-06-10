import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PricingPlan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  cycle: string;
  per_label: string | null;
  features: string[];
  trial_days: number;
  cta_label: string;
  highlight: boolean;
  active: boolean;
  sort_order: number;
};

function normalize(row: any): PricingPlan {
  return {
    ...row,
    features: Array.isArray(row.features) ? row.features : [],
  };
}

export const listPublicPricingPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("pricing_plans")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(normalize);
});

export const listAllPricingPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("pricing_plans")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(normalize);
  });

const planInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(64).regex(/^[a-z0-9_-]+$/),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  price_cents: z.number().int().min(0).max(10_000_00),
  currency: z.string().length(3).default("USD"),
  cycle: z.enum(["monthly", "yearly", "one_time"]),
  per_label: z.string().max(20).nullable().optional(),
  features: z.array(z.string().min(1).max(200)).max(20),
  trial_days: z.number().int().min(0).max(365),
  cta_label: z.string().min(1).max(60),
  highlight: z.boolean(),
  active: z.boolean(),
  sort_order: z.number().int().min(0).max(1000),
});

export const upsertPricingPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => planInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: ok } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
    if (!ok) throw new Error("Forbidden");
    const { error } = await supabaseAdmin.from("pricing_plans").upsert(data, { onConflict: "slug" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deletePricingPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: ok } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
    if (!ok) throw new Error("Forbidden");
    const { error } = await supabaseAdmin.from("pricing_plans").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
