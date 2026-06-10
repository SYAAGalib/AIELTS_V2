import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/subscription";

/**
 * Crossfade Pro-only content with an upgrade CTA without any layout jump.
 *
 * Both the Pro content and the fallback are ALWAYS mounted in the same
 * CSS grid cell so the container sizes to max(pro, fallback). Only
 * `opacity` and `visibility` toggle on entitlement change — there is no
 * mount/unmount, so the DOM never reflows.
 */
export function ProGate({
  feature,
  description = "Upgrade to Pro to unlock this feature.",
  children,
  fallback,
}: {
  feature: string;
  description?: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isPro } = useSubscription();
  const cellStyle = { gridArea: "stack" } as const;

  return (
    <div className="relative grid" style={{ gridTemplateAreas: '"stack"' }}>
      <div
        style={{
          ...cellStyle,
          opacity: isPro ? 1 : 0,
          visibility: isPro ? "visible" : "hidden",
          transition: "opacity 180ms ease",
        }}
        className={isPro ? "" : "pointer-events-none select-none"}
        aria-hidden={!isPro}
        inert={!isPro ? true : undefined}
      >
        {children}
      </div>
      <div
        style={{
          ...cellStyle,
          opacity: isPro ? 0 : 1,
          visibility: isPro ? "hidden" : "visible",
          transition: "opacity 180ms ease",
        }}
        className={isPro ? "pointer-events-none select-none" : ""}
        aria-hidden={isPro}
        inert={isPro ? true : undefined}
      >
        {fallback ?? <DefaultProFallback feature={feature} description={description} />}
      </div>
    </div>
  );
}

function DefaultProFallback({ feature, description }: { feature: string; description: string }) {
  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Lock className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Crown className="h-3.5 w-3.5" /> Pro feature
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold">{feature}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <Button asChild className="mt-3">
            <Link to="/dashboard/billing">Upgrade to Pro</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
