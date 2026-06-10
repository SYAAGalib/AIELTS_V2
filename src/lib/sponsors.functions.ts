import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SponsorTier = "platinum" | "gold" | "silver";

export type Sponsor = {
  id: string;
  tier: SponsorTier;
  name: string;
  initials: string;
  tagline: string | null;
  website_url: string | null;
  logo_url: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export const listPublicSponsors = createServerFn({ method: "GET" }).handler(
  async (): Promise<Sponsor[]> => {
    const { data, error } = await supabaseAdmin
      .from("sponsors")
      .select(
        "id, tier, name, initials, tagline, website_url, logo_url, sort_order, active, created_at, updated_at",
      )
      .eq("active", true)
      .order("tier", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Sponsor[];
  },
);

export const listAllSponsors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Sponsor[]> => {
    const { data: ok } = await context.supabase.rpc("is_admin", {
      _user_id: context.userId,
    });
    if (!ok) throw new Error("Forbidden");
    const { data, error } = await supabaseAdmin
      .from("sponsors")
      .select("*")
      .order("tier", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Sponsor[];
  });

const sponsorInput = z.object({
  id: z.string().uuid().optional(),
  tier: z.enum(["platinum", "gold", "silver"]),
  name: z.string().trim().min(1).max(120),
  initials: z.string().trim().min(1).max(4),
  tagline: z.string().trim().max(200).nullable().optional(),
  website_url: z.string().trim().url().max(500).nullable().optional(),
  logo_url: z.string().trim().url().max(500).nullable().optional(),
  sort_order: z.number().int().min(0).max(10_000),
  active: z.boolean(),
});

export const upsertSponsor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => sponsorInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: ok } = await context.supabase.rpc("is_admin", {
      _user_id: context.userId,
    });
    if (!ok) throw new Error("Forbidden");
    const payload = {
      ...data,
      tagline: data.tagline ?? null,
      website_url: data.website_url ?? null,
      logo_url: data.logo_url ?? null,
    };
    const { error } = await supabaseAdmin.from("sponsors").upsert(payload);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteSponsor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: ok } = await context.supabase.rpc("is_admin", {
      _user_id: context.userId,
    });
    if (!ok) throw new Error("Forbidden");
    const { error } = await supabaseAdmin
      .from("sponsors")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
