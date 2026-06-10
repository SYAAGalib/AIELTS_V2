import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "AIELTS — AI-powered IELTS preparation" },
      { name: "description", content: "AIELTS is the AI tutor for IELTS Listening, Reading, Writing, and Speaking — instant essay scoring, voice examiner, and adaptive 12-week study plans." },
      { name: "author", content: "AIELTS" },
      { property: "og:site_name", content: "AIELTS" },
      { property: "og:title", content: "AIELTS — AI-powered IELTS preparation" },
      { property: "og:description", content: "AIELTS is the AI tutor for IELTS Listening, Reading, Writing, and Speaking — instant essay scoring, voice examiner, and adaptive 12-week study plans." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ielts-vision-ai.lovable.app/" },
      { property: "og:image", content: "https://ielts-vision-ai.lovable.app/twitter-card.jpg" },
      { property: "og:image:secure_url", content: "https://ielts-vision-ai.lovable.app/og-image.jpg" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "AIELTS — AI-powered IELTS preparation" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://ielts-vision-ai.lovable.app/twitter-card.jpg" },
      { name: "twitter:title", content: "AIELTS — AI-powered IELTS preparation" },
      { name: "twitter:description", content: "AIELTS is the AI tutor for IELTS Listening, Reading, Writing, and Speaking — instant essay scoring, voice examiner, and adaptive 12-week study plans." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://issysloydydhlmmnkkwi.supabase.co", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://issysloydydhlmmnkkwi.supabase.co" },
      { rel: "preconnect", href: "https://fonts.googleapis.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://ielts-vision-ai.lovable.app/#organization",
              name: "AIELTS",
              url: "https://ielts-vision-ai.lovable.app/",
              logo: "https://ielts-vision-ai.lovable.app/favicon.png",
              description:
                "AI-powered IELTS preparation platform — Listening, Reading, Writing, and Speaking practice with instant AI feedback.",
            },
            {
              "@type": "WebSite",
              "@id": "https://ielts-vision-ai.lovable.app/#website",
              url: "https://ielts-vision-ai.lovable.app/",
              name: "AIELTS",
              publisher: { "@id": "https://ielts-vision-ai.lovable.app/#organization" },
            },
            {
              "@type": "SoftwareApplication",
              name: "AIELTS",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              description:
                "AI tutor for IELTS Listening, Reading, Writing, and Speaking — instant essay scoring, voice examiner, and adaptive 12-week study plans.",
              url: "https://ielts-vision-ai.lovable.app/",
              image: "https://ielts-vision-ai.lovable.app/og-image.jpg",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <Outlet />
    </QueryClientProvider>
  );
}

function AuthSync() {
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    // Register service worker (guarded against iframes/preview hosts)
    import("@/lib/sw-register").then((m) => m.registerServiceWorker());
  }, []);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);
  return null;
}
