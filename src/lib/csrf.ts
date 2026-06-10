import { createMiddleware } from "@tanstack/react-start";
import { getCookie, setCookie, getRequestHeader } from "@tanstack/react-start/server";
import { createServerFn } from "@tanstack/react-start";

export const CSRF_COOKIE = "aielts_csrf";
export const CSRF_HEADER = "x-csrf-token";

function randomToken(): string {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  let out = "";
  for (let i = 0; i < buf.length; i++) out += buf[i].toString(16).padStart(2, "0");
  return out;
}

function readCookieClient(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Double-submit CSRF: client reads non-HttpOnly cookie and echoes its
 * value in `x-csrf-token`. Server verifies the header matches the cookie
 * in constant time. A cross-site attacker cannot read the cookie (Same-Origin
 * policy on document.cookie) and therefore cannot forge the header.
 */
export const csrfMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const token = readCookieClient(CSRF_COOKIE);
    return next({
      headers: token ? { [CSRF_HEADER]: token } : {},
    });
  })
  .server(async ({ next }) => {
    const cookie = getCookie(CSRF_COOKIE);
    const header = getRequestHeader(CSRF_HEADER);
    if (!cookie || !header || !constantTimeEqual(cookie, header)) {
      throw new Response("CSRF token missing or invalid", { status: 403 });
    }
    return next();
  });

/** Issue (or rotate) the CSRF cookie. Must be called once before any
 *  CSRF-protected POST. The cookie is intentionally readable by JS
 *  (HttpOnly=false) — its secrecy comes from the same-origin policy. */
export const getCsrfToken = createServerFn({ method: "GET" }).handler(async () => {
  let token = getCookie(CSRF_COOKIE);
  if (!token) {
    token = randomToken();
    setCookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24h
    });
  }
  return { token };
});
