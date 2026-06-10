import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const DemoSchema = z.object({
  kind: z.enum(["user", "admin"]),
});

const DEMO_USERS = {
  user: {
    email: "demo-user@aielts.org",
    password: "Demo1234!",
    display_name: "Demo Student",
  },
  admin: {
    email: "demo-admin@aielts.org",
    password: "Demo1234!",
    display_name: "Demo Admin",
  },
} as const;

/**
 * Idempotently provisions the demo accounts. Safe to call from anywhere —
 * if the user already exists it just ensures the admin role for the admin demo.
 */
export const seedDemoAccount = createServerFn({ method: "POST" })
  .inputValidator((input) => DemoSchema.parse(input))
  .handler(async ({ data }) => {
    const cfg = DEMO_USERS[data.kind];

    // Look up by email
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    let userId = existing?.users.find((u) => u.email === cfg.email)?.id;

    if (!userId) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: cfg.email,
        password: cfg.password,
        email_confirm: true,
        user_metadata: { display_name: cfg.display_name, demo: true },
      });
      if (error) throw new Error(error.message);
      userId = created.user!.id;
    } else {
      // Make sure the password matches the documented demo password
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: cfg.password,
        email_confirm: true,
      });
    }

    if (data.kind === "admin" && userId) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    }

    return { ok: true, email: cfg.email, password: cfg.password };
  });
