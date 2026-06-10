// Server-only middleware that gates calls behind the admin cookie session.
import { createMiddleware } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { verifyAdminSession } from "./admin.server";

const COOKIE = "aielts_admin";

export const requireAdminSession = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const token = getCookie(COOKIE);
    const session = await verifyAdminSession(token);
    if (!session) throw new Error("Unauthorized: admin session required");
    return next({ context: { adminSession: session } });
  },
);
