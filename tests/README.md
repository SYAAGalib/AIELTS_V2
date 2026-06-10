# Dashboard Preload E2E Tests

Playwright tests that verify dashboard navigation links and their lazy
route chunks preload on hover (desktop) and focus (mobile / keyboard).

## Setup

```bash
bun run test:e2e:install   # one-time: download Chromium
```

Optional — to test authenticated dashboard routes, provide credentials:

```bash
export TEST_EMAIL="you@example.com"
export TEST_PASSWORD="••••••••"
export BASE_URL="http://localhost:5173"   # or your preview URL
```

Without credentials the suite skips auth-gated assertions (dashboard
redirects to `/login`).

## Run

```bash
bun run dev                # in one terminal
bun run test:e2e           # in another
```

Runs in two projects:
- `desktop-chromium` — hovers each link, checks chunk requests fire
- `mobile-pixel5` — focuses each link (no hover on touch), same check

## Report

After a run:

```bash
bun run test:e2e:report
```

Opens the HTML report at `playwright-report/index.html`. Each test also
attaches a `preload-report.json` with per-link results (href, trigger,
chunkRequested, requestCount), plus an aggregate JSON at
`playwright-report/results.json`.

## Pass criteria

≥ 70% of dashboard nav links must trigger at least one lazy
chunk or loader request within 800ms of hover/focus.
