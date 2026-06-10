import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, studentNav } from "@/components/app/DashboardShell";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — AIELTS" },
      { name: "description", content: "Your personal IELTS dashboard — track progress across Listening, Reading, Writing, and Speaking with AI-powered insights." },
      { property: "og:title", content: "Student Dashboard — AIELTS" },
      { property: "og:description", content: "Your personal IELTS dashboard — track progress across Listening, Reading, Writing, and Speaking with AI-powered insights." },
      { property: "og:url", content: "/dashboard" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <DashboardShell items={studentNav} title="Student Dashboard" />,
});
