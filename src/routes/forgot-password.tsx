import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — AIELTS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) toast.error(error.message);
      else setSent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">← Sign in</Link>
        <h1 className="mt-4 font-display text-2xl font-semibold">Reset password</h1>
        {sent ? (
          <p className="mt-4 text-sm text-muted-foreground">
            If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 grid gap-3">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit" disabled={busy || !email}
              className="h-10 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
