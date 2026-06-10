import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, ExternalLink, Receipt } from "lucide-react";
import { studentBilling } from "@/lib/student.functions";

export const Route = createFileRoute("/dashboard/billing")({
  head: () => ({
    meta: [
      { title: "Billing — AIELTS Dashboard" },
      { name: "description", content: "Your AIELTS subscription and invoices." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BillingPage,
});

function BillingPage() {
  const fn = useServerFn(studentBilling);
  const { data, isLoading } = useQuery({ queryKey: ["student-billing"], queryFn: () => fn() });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const { subscription, invoices } = data;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Billing</p>
        <h2 className="mt-1 font-display text-3xl font-bold">Subscription & invoices</h2>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-2 text-muted-foreground"><CreditCard className="h-4 w-4" /><span className="text-xs uppercase tracking-wider">Current plan</span></div>
        {subscription ? (
          <>
            <p className="mt-2 font-display text-2xl font-bold capitalize">{subscription.plan} <span className="text-sm font-normal text-muted-foreground">· {subscription.status}</span></p>
            {subscription.current_period_end && <p className="mt-1 text-xs text-muted-foreground">Renews {new Date(subscription.current_period_end).toLocaleDateString()}</p>}
            {subscription.trial_end && <p className="mt-1 text-xs text-muted-foreground">Trial ends {new Date(subscription.trial_end).toLocaleDateString()}</p>}
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No active subscription.</p>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-2 text-muted-foreground"><Receipt className="h-4 w-4" /><span className="text-xs uppercase tracking-wider">Invoices</span></div>
        {invoices.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No invoices yet.</p>
        ) : (
          <ul className="mt-3 divide-y">
            {invoices.map((inv: any) => (
              <li key={inv.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium">{(inv.amount_cents / 100).toFixed(2)} {inv.currency}</p>
                  <p className="text-xs text-muted-foreground">{new Date(inv.issued_at).toLocaleDateString()} · {inv.status}</p>
                </div>
                {inv.hosted_invoice_url && (
                  <a href={inv.hosted_invoice_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary">
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
