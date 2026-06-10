import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getCookie } from "@tanstack/react-start/server";
import { verifyAdminSession } from "./admin.server";
import { mergeConfig, type HomepageConfig } from "./homepage-config";

const ADMIN_COOKIE = "aielts_admin";

async function requireAdmin() {
  const token = getCookie(ADMIN_COOKIE);
  const session = await verifyAdminSession(token);
  if (!session) throw new Response("Unauthorized", { status: 401 });
}

export const getPublishedHomepageConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomepageConfig> => {
    const { data, error } = await supabaseAdmin
      .from("homepage_config")
      .select("config")
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return mergeConfig(data?.config);
  },
);

export const getHomepageDraft = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomepageConfig> => {
    await requireAdmin();
    const { data, error } = await supabaseAdmin
      .from("homepage_config")
      .select("config")
      .eq("status", "draft")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return mergeConfig(data?.config);
  },
);

const ConfigSchema = z.unknown();

export const saveHomepageDraft = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ config: ConfigSchema }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    // Round-trip through mergeConfig to enforce shape and drop unknown keys.
    const safe = mergeConfig(data.config);
    const { error } = await supabaseAdmin
      .from("homepage_config")
      .upsert(
        { status: "draft", config: safe as unknown as never, updated_at: new Date().toISOString() },
        { onConflict: "status" },
      );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const publishHomepageDraft = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from("homepage_config")
    .select("config")
    .eq("status", "draft")
    .maybeSingle();
  if (error) throw new Error(error.message);
  const safe = mergeConfig(data?.config);
  const { error: upErr } = await supabaseAdmin
    .from("homepage_config")
    .upsert(
      {
        status: "published",
        config: safe as unknown as never,
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      },
      { onConflict: "status" },
    );
  if (upErr) throw new Error(upErr.message);
  return { ok: true as const };
});

export const revertHomepageDraft = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from("homepage_config")
    .select("config")
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(error.message);
  const safe = mergeConfig(data?.config);
  const { error: upErr } = await supabaseAdmin
    .from("homepage_config")
    .upsert(
      { status: "draft", config: safe as unknown as never, updated_at: new Date().toISOString() },
      { onConflict: "status" },
    );
  if (upErr) throw new Error(upErr.message);
  return { ok: true as const };
});
