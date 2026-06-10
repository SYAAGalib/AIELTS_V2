import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CheckCircle2, ShieldCheck, Trash2, Loader2, KeyRound } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAdmins, createAdminUser, removeAdminRole, changeMyPassword } from "@/lib/admin-users.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/admins")({
  head: () => ({
    meta: [
      { title: "Admins — AIELTS Admin" },
      { name: "description", content: "Manage AIELTS admin team members and roles." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminsPage,
});

function AdminsPage() {
  const qc = useQueryClient();
  const fetchAdmins = useServerFn(listAdmins);
  const createFn = useServerFn(createAdminUser);
  const removeFn = useServerFn(removeAdminRole);
  const passwordFn = useServerFn(changeMyPassword);

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: () => fetchAdmins(),
  });

  const [form, setForm] = useState({ email: "", password: "", display_name: "" });
  const [toastOpen, setToastOpen] = useState(false);
  const [pwd, setPwd] = useState({ next: "", confirm: "" });

  const createMutation = useMutation({
    mutationFn: () => createFn({ data: { email: form.email.trim(), password: form.password, display_name: form.display_name.trim() || undefined } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admins"] });
      setForm({ email: "", password: "", display_name: "" });
      setToastOpen(true);
      setTimeout(() => setToastOpen(false), 2400);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: (user_id: string) => removeFn({ data: { user_id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin role removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const passwordMutation = useMutation({
    mutationFn: () => passwordFn({ data: { new_password: pwd.next } }),
    onSuccess: () => {
      setPwd({ next: "", confirm: "" });
      toast.success("Password updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || form.password.length < 8) {
      toast.error("Email and a password of 8+ chars are required");
      return;
    }
    createMutation.mutate();
  };

  const submitPwd = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.next.length < 8) return toast.error("Password must be 8+ characters");
    if (pwd.next !== pwd.confirm) return toast.error("Passwords do not match");
    passwordMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">Team</p>
        <h2 className="mt-1 font-display text-3xl font-bold">Admin management</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
          <div className="border-b border-white/10 px-5 py-4">
            <h3 className="font-display text-lg font-semibold">Current admins</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-white/50">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Since</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-white/50"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading…</td></tr>
              )}
              {!isLoading && (admins ?? []).length === 0 && (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-white/50">No admins yet.</td></tr>
              )}
              {(admins ?? []).map((a, i) => {
                const name = a.display_name || (a.email ? a.email.split("@")[0] : "Admin");
                return (
                  <motion.tr key={a.user_id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.06]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-xs font-semibold">
                          {name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()}
                        </div>
                        <p className="font-medium">{name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white/60">{a.email ?? "—"}</td>
                    <td className="px-5 py-3 text-white/60">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove admin role from ${a.email}?`)) removeMutation.mutate(a.user_id);
                        }}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-300 hover:bg-red-400/15">
                        <Trash2 className="h-3.5 w-3.5" />Revoke
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

        <div className="space-y-6">
          <motion.form onSubmit={submitCreate}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[var(--teal)]" />
              <h3 className="font-display text-lg font-semibold">Add new admin</h3>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/50">Display name</label>
                <input value={form.display_name} onChange={(e)=>setForm(f=>({...f, display_name: e.target.value}))} placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-white/50">Email</label>
                <input type="email" required value={form.email} onChange={(e)=>setForm(f=>({...f, email: e.target.value}))} placeholder="name@aielts.app"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-white/50">Password</label>
                <input type="password" required minLength={8} value={form.password} onChange={(e)=>setForm(f=>({...f, password: e.target.value}))} placeholder="Min. 8 characters"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" />
              </div>
            </div>
            <button disabled={createMutation.isPending} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg gradient-brand py-2.5 text-sm font-semibold shadow-lg shadow-[var(--teal)]/20 transition hover:shadow-[var(--teal)]/50 disabled:opacity-60">
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create admin
            </button>
          </motion.form>

          <motion.form onSubmit={submitPwd}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-[var(--teal)]" />
              <h3 className="font-display text-lg font-semibold">Change my password</h3>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/50">New password</label>
                <input type="password" required minLength={8} value={pwd.next} onChange={(e)=>setPwd(p=>({...p, next: e.target.value}))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-white/50">Confirm password</label>
                <input type="password" required minLength={8} value={pwd.confirm} onChange={(e)=>setPwd(p=>({...p, confirm: e.target.value}))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" />
              </div>
            </div>
            <button disabled={passwordMutation.isPending} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 py-2.5 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-60">
              {passwordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Update password
            </button>
          </motion.form>
        </div>
      </div>

      <AnimatePresence>
        {toastOpen && (
          <motion.div
            initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
            className="fixed top-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--teal)]/30 bg-[#0B1224]/95 px-5 py-2.5 text-sm shadow-2xl backdrop-blur">
            <CheckCircle2 className="h-4 w-4 text-[var(--teal)]" />
            Admin created successfully
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
