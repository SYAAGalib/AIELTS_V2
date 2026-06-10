import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/app/AdminShell";
import { checkAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const { admin } = await checkAdmin();
    if (!admin) {
      throw redirect({
        to: "/admin-login",
        search: { redirect: location.href },
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Super Admin — AIELTS" },
      { name: "description", content: "Internal AIELTS admin console." },
      { property: "og:title", content: "Super Admin — AIELTS" },
      { property: "og:description", content: "Internal AIELTS admin console." },
      { property: "og:url", content: "/admin" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminShell,
});
