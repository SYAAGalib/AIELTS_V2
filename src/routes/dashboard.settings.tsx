import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  User, Lock, Sun, Moon, Bell, Video, Calendar, Check, ChevronDown, CreditCard, Loader2,
  Upload, Trash2, RotateCcw,
} from "lucide-react";
import {
  getMyProfile, updateMyProfile, changeMyPassword, resetMyProfileField, ProfileSchema,
} from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";

function useHasSession() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return { ready, signedIn };
}

function SignInPrompt() {
  return (
    <div className="rounded-xl border bg-background p-4 text-sm">
      <p className="font-medium">You're not signed in</p>
      <p className="mt-1 text-muted-foreground">
        <Link to="/login" className="text-primary underline">Sign in</Link> to view and edit this section.
      </p>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AIELTS Dashboard" },
      { name: "description", content: "Manage your AIELTS account, preferences, and notification settings." },
      { property: "og:title", content: "Settings — AIELTS Dashboard" },
      { property: "og:description", content: "Manage your AIELTS account, preferences, and notification settings." },
      { property: "og:url", content: "/dashboard/settings" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SettingsPage,
});

type PanelKey = "profile" | "subscription" | "password" | "appearance" | "notifications" | "library" | "reminders";

function SettingsPage() {
  const [open, setOpen] = useState<PanelKey | null>("profile");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notify, setNotify] = useState({ email: true, push: true, weekly: false });
  const [reminder, setReminder] = useState({ daily: true, time: "19:00" });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const panels: { key: PanelKey; title: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "profile", title: "Profile information", icon: User },
    { key: "subscription", title: "Subscription", icon: CreditCard },
    { key: "password", title: "Change password", icon: Lock },
    { key: "appearance", title: "Appearance", icon: Sun },
    { key: "notifications", title: "Notifications", icon: Bell },
    { key: "library", title: "Saved videos", icon: Video },
    { key: "reminders", title: "Study reminders", icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Account</p>
        <h2 className="mt-1 font-display text-3xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your profile, preferences and reminders.</p>
      </div>

      <div className="space-y-3">
        {panels.map((p, i) => {
          const isOpen = open === p.key;
          return (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="overflow-hidden rounded-2xl border bg-card shadow-sm"
            >
              <button
                onClick={() => setOpen(isOpen ? null : p.key)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-accent/40"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <p.icon className="h-4 w-4" />
                  </span>
                  <span className="font-display text-base font-semibold">{p.title}</span>
                </span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="border-t px-5 py-5">
                      {p.key === "profile" && <ProfileForm onSaved={() => showToast("Profile updated")} onError={(m) => showToast(m)} />}
                      {p.key === "subscription" && <SubscriptionPanel />}
                      {p.key === "password" && <PasswordForm onSaved={() => showToast("Password changed")} onError={(m) => showToast(m)} />}
                      {p.key === "appearance" && <Appearance theme={theme} setTheme={setTheme} />}
                      {p.key === "notifications" && (
                        <ToggleList
                          items={[
                            { k: "email", label: "Email alerts", desc: "Score updates, feedback notifications" },
                            { k: "push", label: "Push notifications", desc: "Streaks and new modules" },
                            { k: "weekly", label: "Weekly summary", desc: "Performance report every Sunday" },
                          ]}
                          values={notify}
                          onChange={(k, v) => { setNotify({ ...notify, [k]: v }); showToast("Preferences saved"); }}
                        />
                      )}
                      {p.key === "library" && <Library />}
                      {p.key === "reminders" && (
                        <Reminders value={reminder} onChange={(v) => { setReminder(v); showToast("Reminder updated"); }} />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border bg-card px-4 py-3 shadow-2xl"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--teal)]/15 text-[var(--teal)]">
              <Check className="h-4 w-4" />
            </span>
            <p className="text-sm font-medium">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function ProfileForm({ onSaved, onError }: { onSaved: () => void; onError: (m: string) => void }) {
  const fetchProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);
  const resetField = useServerFn(resetMyProfileField);
  const qc = useQueryClient();
  const { ready, signedIn } = useHasSession();
  const profileQuery = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    enabled: ready && signedIn,
  });
  const profileData = profileQuery.data;

  const [form, setForm] = useState({
    display_name: "", bio: "", country: "", locale: "en", avatar_url: "",
    target_band: "" as string, exam_date: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profileData?.profile) return;
    const p = profileData.profile;
    setForm({
      display_name: p.display_name ?? "",
      bio: p.bio ?? "",
      country: p.country ?? "",
      locale: p.locale ?? "en",
      avatar_url: p.avatar_url ?? "",
      target_band: p.target_band != null ? String(p.target_band) : "",
      exam_date: p.exam_date ?? "",
    });
  }, [profileData]);

  const mut = useMutation({
    mutationFn: (payload: any) => saveProfile({ data: payload }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-profile"] }); setErrors({}); onSaved(); },
    onError: (e: any) => onError(e?.message ?? "Failed to save"),
  });

  const resetMut = useMutation({
    mutationFn: (field: "bio" | "avatar_url") => resetField({ data: { field } }),
    onSuccess: (_d, field) => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      setForm((f) => ({ ...f, [field]: "" }));
      onSaved();
    },
    onError: (e: any) => onError(e?.message ?? "Failed to reset"),
  });

  const handleAvatarFile = async (file: File) => {
    setErrors((e) => ({ ...e, avatar_url: "" }));
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, avatar_url: "File must be an image" }));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErrors((e) => ({ ...e, avatar_url: "Max 3 MB" }));
      return;
    }
    setUploading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) throw new Error("Not signed in");
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${uid}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = pub.publicUrl;
      setForm((f) => ({ ...f, avatar_url: url }));
      await saveProfile({ data: { avatar_url: url } as any });
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      onSaved();
    } catch (e: any) {
      onError(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (ready && !signedIn) return <SignInPrompt />;
  if (profileQuery.isLoading || !ready) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      display_name: form.display_name || null,
      bio: form.bio || null,
      country: form.country || null,
      locale: form.locale || null,
      avatar_url: form.avatar_url || null,
      target_band: form.target_band ? Number(form.target_band) : null,
      exam_date: form.exam_date || null,
    };
    const parsed = ProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as string;
        if (k && !fe[k]) fe[k] = issue.message;
      }
      setErrors(fe);
      onError("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    mut.mutate(parsed.data);
  };

  const initials = (form.display_name || profileData?.email || "U")
    .split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      {/* Avatar block */}
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4 rounded-xl border bg-background p-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
          {form.avatar_url ? (
            <img src={form.avatar_url} alt="Avatar" className="h-full w-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <div className="grid h-full w-full place-items-center gradient-brand text-sm font-semibold text-white">{initials}</div>
          )}
        </div>
        <div className="flex flex-1 flex-wrap gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f); }} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload avatar"}
          </button>
          <button type="button" onClick={() => resetMut.mutate("avatar_url")} disabled={resetMut.isPending || !form.avatar_url}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:border-destructive/40 hover:text-destructive disabled:opacity-50">
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        </div>
        {errors.avatar_url && <p className="basis-full text-xs text-destructive">{errors.avatar_url}</p>}
      </div>

      <Field label="Display name">
        <input className={inputCls} value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
        {errors.display_name && <ErrText msg={errors.display_name} />}
      </Field>
      <Field label="Email"><input type="email" className={inputCls} value={profileData?.email ?? ""} disabled /></Field>
      <Field label="Target band (0–9)">
        <input className={inputCls} value={form.target_band} onChange={(e) => setForm({ ...form, target_band: e.target.value })} placeholder="e.g. 7.5" inputMode="decimal" />
        {errors.target_band && <ErrText msg={errors.target_band} />}
      </Field>
      <Field label="Exam date">
        <input type="date" className={inputCls} value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
        {errors.exam_date && <ErrText msg={errors.exam_date} />}
      </Field>
      <Field label="Country">
        <input className={inputCls} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="e.g. Vietnam" />
        {errors.country && <ErrText msg={errors.country} />}
      </Field>
      <Field label="Locale">
        <input className={inputCls} value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} placeholder="en or en-US" />
        {errors.locale && <ErrText msg={errors.locale} />}
      </Field>
      <div className="sm:col-span-2">
        <Field label="Bio">
          <textarea className={inputCls + " min-h-24"} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={500} />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">{form.bio.length}/500</span>
            <button type="button" onClick={() => resetMut.mutate("bio")} disabled={resetMut.isPending || !form.bio}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive disabled:opacity-50">
              <RotateCcw className="h-3 w-3" /> Reset bio
            </button>
          </div>
          {errors.bio && <ErrText msg={errors.bio} />}
        </Field>
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <button disabled={mut.isPending} className="rounded-lg gradient-brand px-4 py-2 text-sm font-semibold text-white shadow transition hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60">
          {mut.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function ErrText({ msg }: { msg: string }) {
  return <span className="text-xs text-destructive">{msg}</span>;
}

function SubscriptionPanel() {
  const fetchProfile = useServerFn(getMyProfile);
  const { ready, signedIn } = useHasSession();
  const { data, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    enabled: ready && signedIn,
  });

  if (ready && !signedIn) return <SignInPrompt />;
  if (isLoading || !ready) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;


  const sub = data?.subscription;
  if (!sub) {
    return (
      <div className="rounded-xl border bg-background p-4 text-sm">
        <p className="font-medium">No active subscription</p>
        <p className="mt-1 text-muted-foreground">You're on the free plan. Visit Billing to upgrade.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Info label="Plan" value={sub.plan ?? "free"} />
      <Info label="Status" value={sub.status ?? "—"} />
      <Info label="Provider" value={sub.provider ?? "—"} />
      <Info label="Renews / ends" value={sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "—"} />
      {sub.trial_end && <Info label="Trial ends" value={new Date(sub.trial_end).toLocaleDateString()} />}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize">{value}</p>
    </div>
  );
}

function PasswordForm({ onSaved, onError }: { onSaved: () => void; onError: (m: string) => void }) {
  const changePw = useServerFn(changeMyPassword);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const mut = useMutation({
    mutationFn: (p: string) => changePw({ data: { new_password: p } }),
    onSuccess: () => { setPw(""); setConfirm(""); onSaved(); },
    onError: (e: any) => onError(e?.message ?? "Failed to change password"),
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (pw.length < 8) return onError("Password must be at least 8 characters");
        if (pw !== confirm) return onError("Passwords do not match");
        mut.mutate(pw);
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <Field label="New password"><input type="password" className={inputCls} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" /></Field>
      <Field label="Confirm password"><input type="password" className={inputCls} value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
      <div className="sm:col-span-2 flex justify-end">
        <button disabled={mut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
          {mut.isPending ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}

function Appearance({ theme, setTheme }: { theme: "light" | "dark"; setTheme: (v: "light" | "dark") => void }) {
  const options: { v: "light" | "dark"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { v: "light", label: "Light", icon: Sun },
    { v: "dark", label: "Dark", icon: Moon },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => {
        const active = theme === o.v;
        return (
          <button
            key={o.v}
            onClick={() => setTheme(o.v)}
            className={`relative flex items-center gap-3 rounded-xl border p-4 text-left transition ${
              active ? "border-primary bg-primary/5" : "hover:border-primary/40"
            }`}
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent">
              <o.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">{o.label}</p>
              <p className="text-xs text-muted-foreground">{o.v === "light" ? "Bright & focused" : "Easy on the eyes"}</p>
            </div>
            {active && (
              <motion.span layoutId="theme-pick" className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3.5 w-3.5" />
              </motion.span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ToggleList<T extends Record<string, boolean>>({
  items, values, onChange,
}: {
  items: { k: keyof T & string; label: string; desc: string }[];
  values: T;
  onChange: (k: keyof T & string, v: boolean) => void;
}) {
  return (
    <ul className="divide-y">
      {items.map((it) => {
        const on = values[it.k];
        return (
          <li key={it.k} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{it.label}</p>
              <p className="text-xs text-muted-foreground">{it.desc}</p>
            </div>
            <button
              onClick={() => onChange(it.k, !on)}
              className={`relative h-6 w-11 rounded-full transition ${on ? "bg-primary" : "bg-muted-foreground/30"}`}
              aria-pressed={on}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                style={{ left: on ? "calc(100% - 22px)" : "2px" }}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Library() {
  const [items, setItems] = useState([
    { id: 1, t: "IELTS Writing Task 2 — Structure", ch: "AIELTS Academy" },
    { id: 2, t: "Speaking Part 2 — Cue Card Tips", ch: "English Pro" },
    { id: 3, t: "Listening: Map Labelling", ch: "Cambridge Hub" },
  ]);
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      <AnimatePresence>
        {items.map((it) => (
          <motion.li
            key={it.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 rounded-xl border bg-background p-3"
          >
            <div className="grid h-12 w-16 place-items-center rounded-md bg-gradient-to-br from-primary/20 to-[var(--teal)]/20 text-primary">
              <Video className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{it.t}</p>
              <p className="text-xs text-muted-foreground">{it.ch}</p>
            </div>
            <button
              onClick={() => setItems((s) => s.filter((x) => x.id !== it.id))}
              className="rounded-md border px-2 py-1 text-xs text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
            >
              Remove
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
      {items.length === 0 && <p className="text-sm text-muted-foreground">Your library is empty.</p>}
    </ul>
  );
}

function Reminders({
  value, onChange,
}: { value: { daily: boolean; time: string }; onChange: (v: { daily: boolean; time: string }) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border bg-background p-4">
        <div>
          <p className="text-sm font-medium">Daily reminder</p>
          <p className="text-xs text-muted-foreground">Nudge me to complete today's study plan.</p>
        </div>
        <button
          onClick={() => onChange({ ...value, daily: !value.daily })}
          className={`relative h-6 w-11 rounded-full transition ${value.daily ? "bg-primary" : "bg-muted-foreground/30"}`}
        >
          <motion.span
            layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
            style={{ left: value.daily ? "calc(100% - 22px)" : "2px" }}
          />
        </button>
      </div>
      <Field label="Reminder time">
        <input
          type="time"
          value={value.time}
          onChange={(e) => onChange({ ...value, time: e.target.value })}
          className={inputCls + " w-40"}
        />
      </Field>
    </div>
  );
}
