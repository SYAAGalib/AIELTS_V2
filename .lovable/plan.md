## Goal
Make this app deployable on Vercel. Today it's wired for Cloudflare Workers, which is why your Vercel deployment doesn't work — Vercel ignores `wrangler.jsonc`, doesn't run `src/server.ts` (a Workers fetch handler), and has none of the secrets the app needs.

## What's blocking Vercel today
1. `@lovable.dev/vite-tanstack-config` bundles the **Cloudflare** Vite adapter at build time — the server output is a Worker, not a Vercel function.
2. `src/server.ts` exports a Workers-style `{ fetch }` handler. Vercel expects a Node/Edge function handler instead.
3. `wrangler.jsonc` is Cloudflare-only.
4. All runtime secrets (`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ENTITLEMENT_SECRET`, `LOVABLE_API_KEY`, `YOUTUBE_API_KEY`, plus `VITE_*` client vars) live in Lovable Cloud / Cloudflare — Vercel doesn't see them.
5. The `pg_cron` job for `yt-discover-cron` points at the Lovable/Cloudflare URL.

## Plan

### 1. Swap the Vite adapter (Cloudflare → Vercel)
- Stop using `@lovable.dev/vite-tanstack-config` (it hard-codes Cloudflare). Rewrite `vite.config.ts` to use TanStack Start's own plugin directly with `target: 'vercel'`:
  - Add `@tanstack/react-start` Vite plugin, `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-tsconfig-paths`, and keep `vite-plugin-pwa`.
  - Configure `tanstackStart({ target: 'vercel' })` so the build emits a Vercel-compatible function bundle in `.vercel/output`.
  - Remove `@cloudflare/vite-plugin` from `package.json`.

### 2. Replace the server entry
- Delete or stop using `src/server.ts` (Workers `fetch` handler). With `target: 'vercel'`, TanStack Start generates its own Vercel function entry; we don't need a manual handler.
- Keep `src/start.ts` (middleware registration) — it's runtime-agnostic.
- The cache-header and SSR-error-normalization logic currently in `src/server.ts` is Cloudflare-specific plumbing; on Vercel that should move into a TanStack request middleware (added to `src/start.ts`) or be dropped (Vercel handles asset caching via its own CDN headers).

### 3. Remove Cloudflare-only config
- Delete `wrangler.jsonc`.
- Remove the `server: { entry: "server" }` block from the old Vite config.

### 4. Add Vercel project config
- Add `vercel.json` (only if needed for rewrites; TanStack's Vercel target usually handles routing automatically).
- Document the build command (`bun run build`) and output directory (`.vercel/output`) for the Vercel dashboard.

### 5. Set up secrets in Vercel (manual, by you)
After the code change, in the Vercel project dashboard → **Settings → Environment Variables**, add these for the **Production** and **Preview** environments:

Server-only (no `VITE_` prefix):
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `ENTITLEMENT_SECRET`
- `LOVABLE_API_KEY`
- `YOUTUBE_API_KEY`

Client-exposed (must start with `VITE_`, baked into the bundle at build time):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

You'll need to copy these values from Lovable Cloud yourself — I can't read secret values, only configure the code to read them.

### 6. Repoint the pg_cron job
- The `yt-discover-cron` route is currently called at the Lovable Cloudflare URL via `pg_cron`. After Vercel deploys, update the `cron.schedule` SQL to point at the new Vercel URL (e.g. `https://<your-project>.vercel.app/api/public/yt-discover-cron`). I'll generate the new SQL once you have a Vercel URL.

### 7. Things that will keep working as-is
- All `createServerFn` files, server routes under `src/routes/api/`, Supabase clients, auth middleware, RLS — these are runtime-agnostic.
- Lovable AI Gateway calls (`LOVABLE_API_KEY`) work from any server runtime, including Vercel.
- The Supabase database itself is unchanged — both Lovable Cloud and Vercel hit the same Supabase project.

### 8. Caveats to know upfront
- **Lovable's auto-publish is Cloudflare-only.** Once we switch the adapter to Vercel, the **Publish button in Lovable will no longer produce a working deploy at `aielts.lovable.app` / `aielts.org`**. You'll be deploying via Vercel's Git integration (or `vercel` CLI) instead. If you want both Lovable hosting AND Vercel hosting, that's a different (much more invasive) setup and I'd recommend against it.
- The Lovable preview inside the editor may still work for dev, but the published output will only target Vercel.
- If anything in the project depends on Cloudflare-specific runtime features (KV, R2, Durable Objects, Workers Cron), it'll break. Skimming the code, I don't see any — but worth confirming as we go.

## Deliverable from this loop
Steps 1–4 (code changes) and a clear list of the secrets you need to paste into Vercel (step 5) and the SQL to repoint cron (step 6, after you give me the Vercel URL).

Want me to proceed?