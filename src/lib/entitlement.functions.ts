import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  signEntitlement,
  verifyEntitlement,
  isProPayload,
  signPlan,
  verifyPlan,
  emptyPlan,
  type PlanRecord,
} from "./entitlement.server";

const ENT_COOKIE = "aielts_ent";
const PLAN_COOKIE = "aielts_plan";
const ENT_TTL_MS = 5 * 60_000;
const PLAN_TTL_MS = 30 * 86_400_000;

// Default subject for the demo (single-user). With real auth this would
// come from the authenticated session, not from the client.
const DEFAULT_SUB = "demo-user";

async function readPlan(): Promise<PlanRecord> {
  const cookie = getCookie(PLAN_COOKIE);
  const plan = await verifyPlan(cookie);
  return plan ?? emptyPlan(DEFAULT_SUB);
}

async function writePlan(p: PlanRecord): Promise<void> {
  // Honor expired trial: if trialEndsAt is in the past and plan is free,
  // we keep trialEverStarted=true but null out trialEndsAt so isPro=false.
  const sanitized: PlanRecord =
    p.trialEndsAt && p.trialEndsAt < Date.now() && p.plan !== "pro"
      ? { ...p, trialEndsAt: null }
      : p;
  const token = await signPlan(sanitized);
  setCookie(PLAN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(PLAN_TTL_MS / 1000),
  });
}

async function mintEntitlementCookie(p: PlanRecord): Promise<{ pro: boolean }> {
  const token = await signEntitlement(
    {
      sub: p.sub,
      plan: p.plan,
      trialEndsAt: p.trialEndsAt,
      addons: p.addons,
    },
    ENT_TTL_MS,
  );
  setCookie(ENT_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(ENT_TTL_MS / 1000),
  });
  const proNow =
    p.plan === "pro" || (p.trialEndsAt != null && p.trialEndsAt > Date.now());
  return { pro: proNow };
}

/**
 * Refresh the short-lived entitlement cookie from the SERVER plan cookie.
 * The client cannot supply a plan — this fn ignores any body input.
 */
export const refreshEntitlement = createServerFn({ method: "POST" }).handler(
  async () => {
    const plan = await readPlan();
    const { pro } = await mintEntitlementCookie(plan);
    return { pro, expiresIn: ENT_TTL_MS };
  },
);

/** Clear both cookies (logout / cancellation). */
export const clearEntitlement = createServerFn({ method: "POST" }).handler(
  async () => {
    deleteCookie(ENT_COOKIE, { path: "/" });
    deleteCookie(PLAN_COOKIE, { path: "/" });
    return { cleared: true };
  },
);

/** Read-only entitlement check (does NOT return the raw token). */
export const checkEntitlement = createServerFn({ method: "GET" }).handler(
  async () => {
    // Prefer the long-lived plan cookie so the UI doesn't oscillate when
    // the short-lived entitlement cookie expires between refreshes.
    const plan = await readPlan();
    const pro =
      plan.plan === "pro" ||
      (plan.trialEndsAt != null && plan.trialEndsAt > Date.now());
    const token = getCookie(ENT_COOKIE);
    const ent = await verifyEntitlement(token);
    return {
      pro,
      plan: plan.plan,
      trialEndsAt: plan.trialEndsAt,
      trialEverStarted: plan.trialEverStarted,
      addons: plan.addons,
      entExpiresAt: ent?.exp ?? null,
      entActive: isProPayload(ent),
    };
  },
);

// ---- Server-side plan mutations (semantic actions, no plan input) ----

/** Start the 7-day trial. Server enforces "once per user". */
export const startTrialServer = createServerFn({ method: "POST" }).handler(
  async () => {
    const plan = await readPlan();
    if (plan.trialEverStarted) {
      return { ok: false as const, reason: "trial-already-used" };
    }
    const next: PlanRecord = {
      ...plan,
      trialEverStarted: true,
      trialEndsAt: Date.now() + 7 * 86_400_000,
    };
    await writePlan(next);
    await mintEntitlementCookie(next);
    return { ok: true as const };
  },
);

/**
 * Upgrade to Pro. In a real app this MUST verify a payment session
 * (Stripe checkout completion, webhook signature, etc.) before flipping
 * the bit. The current demo grants Pro directly — wire payment here.
 */
export const upgradeServer = createServerFn({ method: "POST" }).handler(
  async () => {
    const plan = await readPlan();
    const next: PlanRecord = { ...plan, plan: "pro" };
    await writePlan(next);
    await mintEntitlementCookie(next);
    return { ok: true as const };
  },
);

/** Cancel Pro / revert to Free. */
export const cancelServer = createServerFn({ method: "POST" }).handler(
  async () => {
    const plan = await readPlan();
    const next: PlanRecord = { ...plan, plan: "free", trialEndsAt: null };
    await writePlan(next);
    await mintEntitlementCookie(next);
    return { ok: true as const };
  },
);

/** Add an add-on pack. Real apps must verify payment first. */
export const purchaseAddonServer = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        id: z.enum(["speaking", "writing", "listening", "reading", "crash"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const plan = await readPlan();
    const addons = plan.addons.includes(data.id)
      ? plan.addons
      : [...plan.addons, data.id];
    const next: PlanRecord = { ...plan, addons };
    await writePlan(next);
    await mintEntitlementCookie(next);
    return { ok: true as const };
  });

// ---- Pro-only server fns (unchanged: read entitlement cookie) ----

async function assertProFromCookie() {
  const token = getCookie(ENT_COOKIE);
  const payload = await verifyEntitlement(token);
  if (!payload)
    throw new Response("Invalid or expired entitlement", { status: 401 });
  if (!isProPayload(payload))
    throw new Response("Pro plan required", { status: 403 });
  return payload;
}

export const getProBandPrediction = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        scores: z.object({
          listening: z.number().min(0).max(9),
          reading: z.number().min(0).max(9),
          writing: z.number().min(0).max(9),
          speaking: z.number().min(0).max(9),
        }),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await assertProFromCookie();
    const { listening, reading, writing, speaking } = data.scores;
    const overall =
      Math.round(((listening + reading + writing + speaking) / 4) * 2) / 2;
    return {
      overall,
      breakdown: data.scores,
      advice:
        overall >= 7
          ? "On track for Band 7+. Polish weakest skill."
          : "Focus on the lowest-scoring module first.",
    };
  });

export const getProLiveMatchToken = createServerFn({
  method: "POST",
}).handler(async () => {
  const payload = await assertProFromCookie();
  return {
    matchId: crypto.randomUUID(),
    issuedFor: payload.sub,
    expiresAt: Date.now() + 60_000,
  };
});
