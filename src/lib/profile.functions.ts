import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: sub }, { data: userResp }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.auth.getUser(),
    ]);
    return {
      profile: profile ?? null,
      subscription: sub ?? null,
      email: userResp?.user?.email ?? null,
    };
  });

// Shared validation schema — strict, with friendly messages
export const ProfileSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(120, "Max 120 characters")
    .optional()
    .nullable(),
  bio: z.string().trim().max(500, "Bio must be 500 characters or less").optional().nullable(),
  country: z
    .string()
    .trim()
    .max(80, "Country must be 80 characters or less")
    .regex(/^[\p{L}\p{M}\s'.\-]*$/u, "Country contains invalid characters")
    .optional()
    .nullable(),
  locale: z
    .string()
    .trim()
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Locale must be like 'en' or 'en-US'")
    .max(10)
    .optional()
    .nullable(),
  avatar_url: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL too long")
    .optional()
    .nullable()
    .or(z.literal("")),
  target_band: z
    .coerce.number({ invalid_type_error: "Target band must be a number" })
    .min(0, "Min 0")
    .max(9, "Max 9")
    .optional()
    .nullable(),
  exam_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), "Invalid date")
    .optional()
    .nullable()
    .or(z.literal("")),
  bg_animations: z.boolean().optional().nullable(),
});

export const setBgAnimationsPref = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ enabled: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: userId, bg_animations: data.enabled } as any, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true as const, enabled: data.enabled };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ProfileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const payload: any = { user_id: userId };
    for (const [k, v] of Object.entries(data)) {
      if (v === "" || v === undefined) continue;
      payload[k] = v;
    }
    const { data: row, error } = await supabase
      .from("profiles")
      .upsert(payload as any, { onConflict: "user_id" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { profile: row };
  });

export const resetMyProfileField = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ field: z.enum(["bio", "avatar_url"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("profiles")
      .update({ [data.field]: null } as any)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { profile: row };
  });

export const changeMyPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ new_password: z.string().min(8).max(128) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.auth.updateUser({
      password: data.new_password,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
