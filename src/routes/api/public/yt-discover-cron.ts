import { createFileRoute } from "@tanstack/react-router";
import { runChannelDiscoveryInternal } from "@/lib/youtube-discovery.functions";

export const Route = createFileRoute("/api/public/yt-discover-cron")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = request.headers.get("apikey");
        const expected =
          process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
        if (!expected || apiKey !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const result = await runChannelDiscoveryInternal();
          return Response.json({ ok: true, ...result });
        } catch (e: any) {
          return Response.json(
            { ok: false, error: e?.message ?? "Unknown error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
