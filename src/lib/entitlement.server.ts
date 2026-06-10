// Server-only HMAC helpers for signing entitlement + plan cookies.
//
// Two cookies are involved:
//   - aielts_plan  : long-lived server-only source of truth for the user's
//                    plan/trial/addons. Set ONLY by server fns that
//                    represent semantic actions (startTrial, upgrade, ...).
//   - aielts_ent   : short-lived signed entitlement token derived from
//                    aielts_plan, consumed by Pro-only server fns.
//
// Both are HttpOnly + Secure cookies — never readable from client JS.

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
  const s = process.env.ENTITLEMENT_SECRET;
  if (!s || s.length < 16) {
    // Hard-fail rather than fall back to a known/guessable secret.
    throw new Error(
      "ENTITLEMENT_SECRET is not configured. Set it as a server secret (min 16 chars).",
    );
  }
  return s;
}

async function signBlob(obj: unknown): Promise<string> {
  const body = b64urlEncode(enc.encode(JSON.stringify(obj)));
  const k = await key(getSecret());
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(body));
  return `${body}.${b64urlEncode(sig)}`;
}

async function verifyBlob<T>(token: string | null | undefined): Promise<T | null> {
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
    return JSON.parse(dec.decode(b64urlDecode(body))) as T;
  } catch {
    return null;
  }
}

// ---- Entitlement token (short-lived, derived from server plan) ----

export type EntitlementPayload = {
  sub: string;
  plan: "free" | "pro";
  trialEndsAt: number | null; // ms epoch
  addons: string[];
  iat: number; // ms
  exp: number; // ms
};

export async function signEntitlement(
  p: Omit<EntitlementPayload, "iat" | "exp">,
  ttlMs = 5 * 60_000,
): Promise<string> {
  const now = Date.now();
  return signBlob({ ...p, iat: now, exp: now + ttlMs });
}

export async function verifyEntitlement(
  token: string | null | undefined,
): Promise<EntitlementPayload | null> {
  const payload = await verifyBlob<EntitlementPayload>(token);
  if (!payload) return null;
  if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
  return payload;
}

export function isProPayload(p: EntitlementPayload | null): boolean {
  if (!p) return false;
  if (p.plan === "pro") return true;
  if (p.trialEndsAt && p.trialEndsAt > Date.now()) return true;
  return false;
}

// ---- Plan cookie (long-lived server source of truth) ----

export type PlanRecord = {
  sub: string;
  plan: "free" | "pro";
  trialEndsAt: number | null; // ms epoch
  trialEverStarted: boolean;
  addons: string[];
  iat: number;
};

export async function signPlan(p: Omit<PlanRecord, "iat">): Promise<string> {
  return signBlob({ ...p, iat: Date.now() });
}

export async function verifyPlan(
  token: string | null | undefined,
): Promise<PlanRecord | null> {
  return verifyBlob<PlanRecord>(token);
}

export function emptyPlan(sub: string): PlanRecord {
  return {
    sub,
    plan: "free",
    trialEndsAt: null,
    trialEverStarted: false,
    addons: [],
    iat: Date.now(),
  };
}
