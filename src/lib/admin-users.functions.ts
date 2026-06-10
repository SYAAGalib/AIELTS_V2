import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("is_admin", { _user_id: userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role, created_at")
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    const ids = (roles ?? []).map((r) => r.user_id);
    if (ids.length === 0) return [];
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", ids);
    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
    // Get emails via admin auth API
    const out: Array<{ user_id: string; email: string | null; display_name: string | null; created_at: string }> = [];
    for (const r of roles ?? []) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(r.user_id);
      out.push({
        user_id: r.user_id,
        email: u?.user?.email ?? null,
        display_name: profileMap.get(r.user_id)?.display_name ?? null,
        created_at: r.created_at,
      });
    }
    return out;
  });

export const createAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      email: z.string().email().max(255),
      password: z.string().min(8).max(128),
      display_name: z.string().min(1).max(120).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    // Try to find existing user
    let userId: string | null = null;
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const found = existing?.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
    if (found) {
      userId = found.id;
    } else {
      const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { display_name: data.display_name },
      });
      if (cErr || !created.user) throw new Error(cErr?.message || "Failed to create user");
      userId = created.user.id;
    }
    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (rErr) throw new Error(rErr.message);
    return { ok: true as const, user_id: userId };
  });

export const removeAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.user_id === context.userId) throw new Error("You cannot remove your own admin role");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id)
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const changeMyPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ new_password: z.string().min(8).max(128) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      password: data.new_password,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
