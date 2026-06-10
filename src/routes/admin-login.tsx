import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminLogin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin-login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/admin",
  }),
  head: () => ({
    meta: [{ title: "Admin Login — AIELTS" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const login = useServerFn(adminLogin);
  const [email, setEmail] = useState(import.meta.env.VITE_ADMIN_DEMO_EMAIL ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ data: { email, password } });
      navigate({ to: search.redirect || "/admin" });
    } catch {
      setError("Invalid credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm"
      >
        <h1 className="font-display text-xl font-semibold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This area is restricted. Sign in with the admin email and password to continue.
        </p>
        <label className="mt-5 block text-sm font-medium">Email</label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <label className="mt-5 block text-sm font-medium">Password</label>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        {error && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting || !email || !password}
          className="mt-5 w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
