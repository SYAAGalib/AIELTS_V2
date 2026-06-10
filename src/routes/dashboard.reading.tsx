import { createFileRoute } from "@tanstack/react-router";
import { PracticePage } from "./dashboard.listening";

export const Route = createFileRoute("/dashboard/reading")({
  head: () => ({
    meta: [
      { title: "IELTS Reading Practice — AIELTS" },
      { name: "description", content: "Practice IELTS Reading with real questions and instant scoring." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <PracticePage
      skill="reading"
      title="Reading practice"
      intro="Answer the published reading questions below. Your attempt is scored and saved."
    />
  ),
});
