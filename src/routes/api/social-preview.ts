// GET /api/social-preview?path=/pricing
//
// Fetches the rendered HTML for `path` on the same origin, extracts the
// resolved Open Graph / Twitter / canonical / JSON-LD tags, and returns a
// normalized JSON snapshot. Useful for QA, debugging WhatsApp/Facebook link
// previews, and the dev-only inspector page at /dev/meta.

import { createFileRoute } from "@tanstack/react-router";

const FALLBACK_OG_IMAGE = "https://ielts-vision-ai.lovable.app/og-image.jpg";
const FALLBACK_TWITTER_IMAGE = "https://ielts-vision-ai.lovable.app/twitter-card.jpg";

function extractMeta(html: string) {
  const out: Record<string, string> = {};
  const metaRe = /<meta\b[^>]*>/gi;
  for (const tag of html.match(metaRe) ?? []) {
    const name = /\b(?:name|property)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    const content = /\bcontent\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1];
    if (name && content && !(name in out)) out[name] = content;
  }
  return out;
}

function extractTitle(html: string): string | null {
  return /<title>([^<]*)<\/title>/i.exec(html)?.[1]?.trim() ?? null;
}

function extractCanonical(html: string): string | null {
  const linkRe = /<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/i;
  const tag = linkRe.exec(html)?.[0];
  if (!tag) return null;
  return /\bhref\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1] ?? null;
}

function extractJsonLd(html: string): unknown[] {
  const results: unknown[] = [];
  const re = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      results.push(JSON.parse(m[1]));
    } catch {
      // skip malformed blocks
    }
  }
  return results;
}

function resolveAbsolute(value: string | undefined, origin: string): string | null {
  if (!value) return null;
  try {
    return new URL(value, origin).toString();
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/social-preview")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const reqUrl = new URL(request.url);
        const path = reqUrl.searchParams.get("path") || "/";
        if (!path.startsWith("/") || path.length > 512) {
          return Response.json({ error: "Invalid path" }, { status: 400 });
        }
        const proto = request.headers.get("x-forwarded-proto") ?? "https";
        const host = request.headers.get("host") ?? reqUrl.host;
        const origin = `${proto}://${host}`;
        const target = new URL(path, origin).toString();

        let html: string;
        try {
          const res = await fetch(target, {
            headers: { "user-agent": "AIELTS-SocialPreview/1.0 (+meta-debug)" },
          });
          if (!res.ok) {
            return Response.json(
              { error: `Upstream ${res.status}`, target },
              { status: 502 },
            );
          }
          html = await res.text();
        } catch (e) {
          return Response.json(
            { error: e instanceof Error ? e.message : "Fetch failed", target },
            { status: 502 },
          );
        }

        const meta = extractMeta(html);
        const title = meta["og:title"] || extractTitle(html);
        const description = meta["og:description"] || meta["description"] || null;
        const ogImage =
          resolveAbsolute(meta["og:image"], origin) || FALLBACK_OG_IMAGE;
        const twitterImage =
          resolveAbsolute(meta["twitter:image"], origin) ||
          ogImage ||
          FALLBACK_TWITTER_IMAGE;
        const canonical =
          resolveAbsolute(extractCanonical(html) ?? undefined, origin) ||
          resolveAbsolute(meta["og:url"], origin) ||
          target;

        return Response.json(
          {
            target,
            canonical,
            openGraph: {
              title,
              description,
              type: meta["og:type"] ?? "website",
              url: resolveAbsolute(meta["og:url"], origin) ?? canonical,
              site_name: meta["og:site_name"] ?? null,
              image: ogImage,
              image_width: meta["og:image:width"] ?? null,
              image_height: meta["og:image:height"] ?? null,
              image_alt: meta["og:image:alt"] ?? null,
            },
            twitter: {
              card: meta["twitter:card"] ?? "summary_large_image",
              title: meta["twitter:title"] ?? title,
              description: meta["twitter:description"] ?? description,
              image: twitterImage,
            },
            jsonLd: extractJsonLd(html),
            fallbacks: {
              og_image: FALLBACK_OG_IMAGE,
              twitter_image: FALLBACK_TWITTER_IMAGE,
            },
            generatedAt: new Date().toISOString(),
          },
          {
            headers: {
              "cache-control": "public, max-age=60",
              "access-control-allow-origin": "*",
            },
          },
        );
      },
    },
  },
});
