// Server-only admin session helpers.
// Admin sessions are gated by a server-side password (ADMIN_PASSWORD env)
// and represented by an HttpOnly, Secure, HMAC-signed cookie.

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64urlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const norm = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(norm);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function key(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.ENTITLEMENT_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET (or ENTITLEMENT_SECRET) must be configured (min 16 chars).",
    );
  }
  return s;
}

function getAdminPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p || p.length < 8) {
    throw new Error("ADMIN_PASSWORD is not configured (min 8 chars).");
  }
  return p;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function checkAdminPassword(input: string): Promise<boolean> {
  try {
    return constantTimeEqual(input, getAdminPassword());
  } catch {
    return false;
  }
}

export type AdminSession = { admin: true; iat: number; exp: number };

export async function signAdminSession(ttlMs = 8 * 60 * 60_000): Promise<string> {
  const now = Date.now();
  const payload: AdminSession = { admin: true, iat: now, exp: now + ttlMs };
  const body = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const k = await key(getSecret());
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(body));
  return `${body}.${b64urlEncode(sig)}`;
}

export async function verifyAdminSession(
  token: string | null | undefined,
): Promise<AdminSession | null> {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const k = await key(getSecret());
    const sigBytes = b64urlDecode(sig);
    const ok = await crypto.subtle.verify(
      "HMAC",
      k,
      sigBytes.buffer.slice(sigBytes.byteOffset, sigBytes.byteOffset + sigBytes.byteLength) as ArrayBuffer,
      enc.encode(body),
    );
    if (!ok) return null;
    const payload = JSON.parse(dec.decode(b64urlDecode(body))) as AdminSession;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (!payload.admin) return null;
    return payload;
  } catch {
    return null;
  }
}
