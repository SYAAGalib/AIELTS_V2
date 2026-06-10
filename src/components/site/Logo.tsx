import { cn } from "@/lib/utils";
import logoUrl from "@/assets/logo-aielts.png";

/**
 * AIELTS custom logo mark — ascending bars forming an "A" with an AI spark,
 * representing band-score growth driven by an AI tutor.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="AIELTS logo"
      className={cn("h-full w-auto object-contain", className)}
      width={512}
      height={512}
      loading="lazy"
      decoding="async"
    />
  );
}

export function LogoLockup({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center", className)} aria-label="AIELTS">
      <span className={cn("inline-block h-8 w-auto", markClassName)}>
        <img
          src={logoUrl}
          alt="AIELTS logo"
          className="h-full w-auto object-contain"
          width={512}
          height={128}
          decoding="async"
        />
      </span>
    </span>
  );
}
