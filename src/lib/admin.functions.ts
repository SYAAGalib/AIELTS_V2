import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { checkAdminPassword, signAdminSession, verifyAdminSession } from "./admin.server";

const COOKIE = "aielts_admin";
const TTL_MS = 8 * 60 * 60_000;

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string().min(1).max(256) }).parse(input),
  )
  .handler(async ({ data }) => {
    const ok = await checkAdminPassword(data.password);
    if (!ok) {
      // Generic message — do not leak whether the password format was valid.
      throw new Error("Invalid credentials");
    }
    const token = await signAdminSession(TTL_MS);
    setCookie(COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(TTL_MS / 1000),
    });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(COOKIE, { path: "/" });
  return { ok: true as const };
});

export const checkAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const token = getCookie(COOKIE);
  const session = await verifyAdminSession(token);
  return { admin: !!session };
});
