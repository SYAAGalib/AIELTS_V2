import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { seedDemoAccount } from "@/lib/auth.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/dashboard",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — AIELTS" },
      { name: "description", content: "Sign in to your AIELTS account to continue your IELTS preparation." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const seed = useServerFn(seedDemoAccount);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function trySignIn(em: string, pw: string): Promise<{ ok: boolean; err?: string }> {
    const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
    if (error) return { ok: false, err: error.message };
    return { ok: true };
  }

  async function resolvePostLoginPath(): Promise<string> {
    // If the user was redirected here from a protected page, honor that.
    if (redirect && redirect !== "/dashboard") return redirect;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return redirect;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");
      return isAdmin ? "/admin" : redirect;
    } catch {
      return redirect;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      let r = await trySignIn(email, password);
      // If demo creds fail (e.g. first run), seed and retry once.
      if (!r.ok && (email === "demo-user@aielts.org" || email === "demo-admin@aielts.org")) {
        await seed({ data: { kind: email === "demo-admin@aielts.org" ? "admin" : "user" } });
        r = await trySignIn(email, password);
      }
      if (!r.ok) {
        setError(r.err || "Sign in failed.");
        return;
      }
      toast.success("Signed in");
      const to = await resolvePostLoginPath();
      navigate({ to });
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "apple") {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin + redirect,
    });
    if (res.redirected) return;
    if (res.error) {
      setError(res.error.message);
      setBusy(false);
      return;
    }
    navigate({ to: redirect });
  }

  function autofill(kind: "user" | "admin") {
    if (kind === "user") {
      setEmail("demo-user@aielts.org");
      setPassword("Demo1234!");
    } else {
      setEmail("demo-admin@aielts.org");
      setPassword("Demo1234!");
    }
    setError(null);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to continue your IELTS prep.
        </p>

        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={() => oauth("google")}
            disabled={busy}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border bg-background text-sm font-medium transition hover:bg-accent disabled:opacity-60"
          >
            <GoogleIcon /> Continue with Google
          </button>
          <button
            type="button"
            onClick={() => oauth("apple")}
            disabled={busy}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border bg-background text-sm font-medium transition hover:bg-accent disabled:opacity-60"
          >
            <AppleIcon /> Continue with Apple
          </button>
        </div>

        <div className="my-4 flex items-center gap-3 text-xs uppercase text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="grid gap-3">
          <div>
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email" type="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
                Forgot?
              </Link>
            </div>
            <input
              id="password" type="password" autoComplete="current-password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">{error}</p>
          )}
          <button
            type="submit"
            disabled={busy || !email || !password}
            className="h-10 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-5 rounded-lg border border-dashed bg-muted/40 p-3">
          <p className="text-xs font-semibold text-muted-foreground">Demo accounts</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button" onClick={() => autofill("user")}
              className="rounded-md bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent border"
            >
              Autofill Student
            </button>
            <button
              type="button" onClick={() => autofill("admin")}
              className="rounded-md bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent border"
            >
              Autofill Admin
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Password: <code className="font-mono">Demo1234!</code>
          </p>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/register" className="font-medium text-foreground hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.16-3.16C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.43 2.22-1.13 3.04-.78.92-2.06 1.62-3.1 1.55-.13-1.1.42-2.26 1.1-3.02.78-.88 2.13-1.55 3.13-1.57zM20.5 17.36c-.5 1.16-.74 1.68-1.4 2.71-.91 1.43-2.2 3.22-3.79 3.23-1.42.02-1.79-.93-3.72-.92-1.93.01-2.33.94-3.76.92-1.59-.01-2.81-1.6-3.72-3.03-2.55-4-2.82-8.7-1.24-11.2 1.12-1.78 2.88-2.82 4.53-2.82 1.69 0 2.75.93 4.15.93 1.36 0 2.18-.93 4.14-.93 1.48 0 3.04.81 4.15 2.21-3.65 2-3.05 7.21.66 8.9z" />
    </svg>
  );
}
