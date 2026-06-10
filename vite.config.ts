// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // When NITRO_PRESET is set (e.g. in Docker), pass it explicitly so it
  // overrides the Lovable defaultPreset ("cloudflare-module").
  ...(process.env.NITRO_PRESET
    ? { nitro: { preset: process.env.NITRO_PRESET as "node-server" } }
    : {}),
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null, // We register manually in src/main.tsx with iframe/preview guards
        devOptions: { enabled: false },
        manifest: {
          name: "AIELTS — AI-powered IELTS preparation",
          short_name: "AIELTS",
          description:
            "AI tutor for IELTS Listening, Reading, Writing, and Speaking.",
          theme_color: "#0ea5e9",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/dashboard",
          scope: "/",
          icons: [
            { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//, /^\/~oauth/, /^\/admin/],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            // HTML navigations — network first, fall back to cache
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "html-pages",
                networkTimeoutSeconds: 3,
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              },
            },
            // JS / CSS — stale-while-revalidate
            {
              urlPattern: ({ request }) =>
                request.destination === "script" ||
                request.destination === "style" ||
                request.destination === "worker",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "assets",
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            // Images
            {
              urlPattern: ({ request }) => request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "images",
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            // Google Fonts
            {
              urlPattern: /^https:\/\/fonts\.(gstatic|googleapis)\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts",
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            // Supabase REST GETs (cached briefly so dashboard works offline)
            {
              urlPattern: ({ url, request }) =>
                request.method === "GET" &&
                url.hostname.endsWith(".supabase.co") &&
                url.pathname.startsWith("/rest/"),
              handler: "NetworkFirst",
              options: {
                cacheName: "supabase-rest",
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
  },
});
