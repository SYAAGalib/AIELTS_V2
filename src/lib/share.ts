// Helpers for building shareable URLs that force social-media scrapers
// (WhatsApp, Facebook, Twitter, LinkedIn, iMessage) to re-fetch the page
// and refresh the link preview instead of serving a stale cached version.
//
// Strategy: append a short, time-bucketed `?v=` query parameter. The bucket
// changes once per day so the same URL stays stable for normal users (good
// for analytics), but updates frequently enough to bust crawler caches when
// content/OG meta changes.

export const SITE_ORIGIN = "https://ielts-vision-ai.lovable.app";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** Current day-bucket. Stable across a UTC day. */
export function currentShareVersion(): string {
  return String(Math.floor(Date.now() / ONE_DAY_MS));
}

/**
 * Build an absolute, cache-busted share URL.
 *
 * @param path  Route path starting with "/" (e.g. "/pricing").
 * @param origin Override origin (defaults to SITE_ORIGIN).
 */
export function getShareUrl(path = "/", origin: string = SITE_ORIGIN): string {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(safePath, origin);
  if (!url.searchParams.has("v")) {
    url.searchParams.set("v", currentShareVersion());
  }
  return url.toString();
}

/** Force a brand-new version (use after publishing changes to OG meta). */
export function getFreshShareUrl(path = "/", origin: string = SITE_ORIGIN): string {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(safePath, origin);
  url.searchParams.set("v", String(Date.now()));
  return url.toString();
}
