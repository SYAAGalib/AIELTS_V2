import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { signAdminSession, verifyAdminSession } from "./admin.server";

const COOKIE = "aielts_admin";
const TTL_MS = 8 * 60 * 60_000;

const ADMIN_EMAIL = process.env.ADMIN_DEMO_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_DEMO_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_DEMO_NAME?.trim() || "Admin";

let seededAdminUserId: Promise<string | null> | null = null;

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function credentialsMatch(email: string, password: string): boolean {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return false;
  return (
    constantTimeEqual(email.trim().toLowerCase(), ADMIN_EMAIL) &&
    constantTimeEqual(password, ADMIN_PASSWORD)
  );
}

async function findAuthUserByEmail(email: string) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error(error.message);
    const found = data.users.find((user) => user.email?.toLowerCase() === email);
    if (found) return found;
    if ((data.users ?? []).length < 100) break;
  }
  return null;
}

async function ensureAdminDemoAccount(): Promise<string | null> {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return null;
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!seededAdminUserId) {
    seededAdminUserId = (async () => {
      const existing = await findAuthUserByEmail(ADMIN_EMAIL);
      let userId = existing?.id ?? null;

      if (!userId) {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: { display_name: ADMIN_NAME },
        });
        if (error || !data.user) {
          throw new Error(error?.message || "Failed to create the admin demo account.");
        }
        userId = data.user.id;
      } else {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: { display_name: ADMIN_NAME },
        });
        if (error) throw new Error(error.message);
      }

      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
      if (roleError) throw new Error(roleError.message);

      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({ user_id: userId, display_name: ADMIN_NAME }, { onConflict: "user_id" });
      if (profileError) throw new Error(profileError.message);

      return userId;
    })();
  }

  return seededAdminUserId;
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({ email: z.string().email().max(255), password: z.string().min(1).max(256) })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      await ensureAdminDemoAccount();
    } catch {
      // Best-effort seed only. Login must still work when service-role access is unavailable locally.
    }

    if (!credentialsMatch(data.email, data.password)) {
      throw new Error("Invalid credentials");
    }

    const token = await signAdminSession(TTL_MS);
    setCookie(COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(TTL_MS / 1000),
    });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(COOKIE, { path: "/" });
  return { ok: true as const };
});

export const checkAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const token = getCookie(COOKIE);
  const session = await verifyAdminSession(token);
  return { admin: !!session };
});
