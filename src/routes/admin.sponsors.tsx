import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  listAllSponsors,
  upsertSponsor,
  deleteSponsor,
  type Sponsor,
  type SponsorTier,
} from "@/lib/sponsors.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/sponsors")({
  head: () => ({
    meta: [
      { title: "Sponsors — AIELTS Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminSponsorsPage,
});

type FormState = {
  id?: string;
  tier: SponsorTier;
  name: string;
  initials: string;
  tagline: string;
  website_url: string;
  logo_url: string;
  sort_order: number;
  active: boolean;
};

const empty: FormState = {
  tier: "silver",
  name: "",
  initials: "",
  tagline: "",
  website_url: "",
  logo_url: "",
  sort_order: 0,
  active: true,
};

function tierBadge(tier: SponsorTier) {
  const map = {
    platinum: "bg-[var(--teal)]/15 text-[var(--teal)]",
    gold: "bg-amber-400/15 text-amber-300",
    silver: "bg-white/10 text-white/70",
  };
  return map[tier];
}

function AdminSponsorsPage() {
  const fetchAll = useServerFn(listAllSponsors);
  const upsert = useServerFn(upsertSponsor);
  const remove = useServerFn(deleteSponsor);
  const qc = useQueryClient();

  const { data: sponsors = [], isLoading } = useQuery<Sponsor[]>({
    queryKey: ["admin-sponsors"],
    queryFn: () => fetchAll(),
  });

  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditing({ ...empty });
  }
  function openEdit(s: Sponsor) {
    setEditing({
      id: s.id,
      tier: s.tier,
      name: s.name,
      initials: s.initials,
      tagline: s.tagline ?? "",
      website_url: s.website_url ?? "",
      logo_url: s.logo_url ?? "",
      sort_order: s.sort_order,
      active: s.active,
    });
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      await upsert({
        data: {
          id: editing.id,
          tier: editing.tier,
          name: editing.name.trim(),
          initials: editing.initials.trim().toUpperCase(),
          tagline: editing.tagline.trim() || null,
          website_url: editing.website_url.trim() || null,
          logo_url: editing.logo_url.trim() || null,
          sort_order: Number(editing.sort_order) || 0,
          active: editing.active,
        },
      });
      toast.success("Sponsor saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
      qc.invalidateQueries({ queryKey: ["public-sponsors"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this sponsor?")) return;
    try {
      await remove({ data: { id } });
      toast.success("Sponsor deleted");
      qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
      qc.invalidateQueries({ queryKey: ["public-sponsors"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete");
    }
  }

  const grouped: Record<SponsorTier, Sponsor[]> = {
    platinum: sponsors.filter((s) => s.tier === "platinum"),
    gold: sponsors.filter((s) => s.tier === "gold"),
    silver: sponsors.filter((s) => s.tier === "silver"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Homepage</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Sponsors</h2>
          <p className="mt-1 text-sm text-white/60">
            Manage sponsors shown in the homepage Sponsors section.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add sponsor
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-white/50">Loading…</p>
      ) : (
        (["platinum", "gold", "silver"] as SponsorTier[]).map((tier) => (
          <div key={tier} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold capitalize">
                {tier} <span className="ml-2 text-xs text-white/40">{grouped[tier].length}</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-white/40">
                  <tr>
                    <th className="px-3 py-2">Order</th>
                    <th className="px-3 py-2">Initials</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Tagline</th>
                    <th className="px-3 py-2">Active</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[tier].length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-white/40">
                        No {tier} sponsors yet.
                      </td>
                    </tr>
                  ) : (
                    grouped[tier].map((s) => (
                      <tr key={s.id} className="border-t border-white/5">
                        <td className="px-3 py-2 text-white/60">{s.sort_order}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${tierBadge(s.tier)}`}>
                            {s.initials}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium">{s.name}</td>
                        <td className="px-3 py-2 text-white/60">{s.tagline ?? "—"}</td>
                        <td className="px-3 py-2">
                          {s.active ? (
                            <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs text-emerald-300">
                              Live
                            </span>
                          ) : (
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
                              Hidden
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(s)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => onDelete(s.id)}>
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit sponsor" : "Add sponsor"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Tier</Label>
                  <Select
                    value={editing.tier}
                    onValueChange={(v) => setEditing({ ...editing, tier: v as SponsorTier })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="platinum">Platinum</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={editing.sort_order}
                    onChange={(e) =>
                      setEditing({ ...editing, sort_order: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Name</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  maxLength={120}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Initials (1–4 chars)</Label>
                <Input
                  value={editing.initials}
                  onChange={(e) => setEditing({ ...editing, initials: e.target.value })}
                  maxLength={4}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Tagline (optional)</Label>
                <Input
                  value={editing.tagline}
                  onChange={(e) => setEditing({ ...editing, tagline: e.target.value })}
                  maxLength={200}
                  placeholder="Short one-liner shown under the name"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Website URL (optional)</Label>
                <Input
                  type="url"
                  value={editing.website_url}
                  onChange={(e) => setEditing({ ...editing, website_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Logo URL (optional)</Label>
                <Input
                  type="url"
                  value={editing.logo_url}
                  onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })}
                  placeholder="https://…"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <Label className="cursor-pointer">Active (show on homepage)</Label>
                <Switch
                  checked={editing.active}
                  onCheckedChange={(v) => setEditing({ ...editing, active: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)} className="gap-2">
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button onClick={save} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
