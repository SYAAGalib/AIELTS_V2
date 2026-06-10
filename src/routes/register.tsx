import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — AIELTS" },
      { name: "description", content: "Create your free AIELTS account and start preparing for IELTS today." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: RegisterPage,
});

const Schema = z.object({
  display_name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ display_name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = Schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: window.location.origin + "/dashboard",
          data: { display_name: parsed.data.display_name },
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "apple") {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (res.redirected) return;
    if (res.error) {
      setError(res.error.message);
      setBusy(false);
      return;
    }
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Free forever. Pro features available with a 7-day trial.
        </p>

        <div className="mt-5 grid gap-2">
          <button
            type="button" onClick={() => oauth("google")} disabled={busy}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border bg-background text-sm font-medium transition hover:bg-accent disabled:opacity-60"
          >
            Continue with Google
          </button>
          <button
            type="button" onClick={() => oauth("apple")} disabled={busy}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border bg-background text-sm font-medium transition hover:bg-accent disabled:opacity-60"
          >
            Continue with Apple
          </button>
        </div>

        <div className="my-4 flex items-center gap-3 text-xs uppercase text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="grid gap-3">
          <div>
            <label className="text-sm font-medium" htmlFor="name">Name</label>
            <input
              id="name" autoComplete="name" required maxLength={80}
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email" type="email" autoComplete="email" required maxLength={255}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">At least 8 characters.</p>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button
            type="submit" disabled={busy}
            className="h-10 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
