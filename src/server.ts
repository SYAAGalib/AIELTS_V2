import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// Set sensible HTTP cache headers for static assets and API responses.
// - Hashed build assets (/_build/, /assets/, /static/): 1y immutable
// - Images/fonts: 30d public, SWR
// - HTML navigations: no-cache, must-revalidate
// - /api/* and server-fn JSON: no-store by default (unless handler set its own)
function applyCacheHeaders(request: Request, response: Response): Response {
  // Don't touch responses that already declare a Cache-Control policy
  if (response.headers.has("Cache-Control") || response.headers.has("cache-control")) {
    return response;
  }
  const url = new URL(request.url);
  const p = url.pathname;
  const ct = response.headers.get("content-type") ?? "";

  let cc: string | null = null;
  if (/\.(?:js|css|woff2?|ttf|otf|eot)$/i.test(p) || /\/(_build|assets|static)\//.test(p)) {
    cc = "public, max-age=31536000, immutable";
  } else if (/\.(?:png|jpg|jpeg|webp|avif|gif|svg|ico)$/i.test(p)) {
    cc = "public, max-age=2592000, stale-while-revalidate=86400";
  } else if (p.startsWith("/api/") || p.startsWith("/_serverFn/")) {
    cc = "no-store";
  } else if (ct.includes("text/html")) {
    cc = "no-cache, must-revalidate, max-age=0";
  }

  if (!cc) return response;

  // Re-build response with the added header (Response headers are immutable on some runtimes)
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", cc);
  // Help intermediaries vary on encoding
  if (!headers.has("Vary")) headers.set("Vary", "Accept-Encoding");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return applyCacheHeaders(request, normalized);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
