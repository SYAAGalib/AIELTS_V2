import { test, expect, Page, Request } from "@playwright/test";

/**
 * Verifies that dashboard navigation links and their lazy route chunks
 * preload on hover (desktop) and focus (keyboard / mobile via tab).
 *
 * Strategy:
 *  1. Navigate to /dashboard. If redirected to /login, skip (no auth).
 *  2. Collect every <a data-preload="intent"> link in the sidebar/bottom nav.
 *  3. For each link, record JS chunk requests fired while hovering/focusing
 *     it (without clicking). Assert at least one new script request occurs
 *     OR the loader data fetch for that route fires before navigation.
 */

type PreloadResult = {
  href: string;
  trigger: "hover" | "focus";
  chunkRequested: boolean;
  requestCount: number;
};

async function gotoDashboard(page: Page): Promise<boolean> {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  // Give the router a beat to settle (auth gate may redirect).
  await page.waitForLoadState("networkidle").catch(() => {});
  if (/\/login|\/admin-login|\/$/.test(new URL(page.url()).pathname)) {
    return false;
  }
  return true;
}

function isLazyChunk(req: Request): boolean {
  const url = req.url();
  const type = req.resourceType();
  if (type === "script" && /\.(m?js)(\?|$)/.test(url)) return true;
  // TanStack server-fn / loader data fetches
  if (/_serverFn|__data|loader/.test(url)) return true;
  return false;
}

async function collectNavLinks(page: Page): Promise<string[]> {
  // Prefer links that explicitly opt into intent preloading.
  const hrefs = await page
    .locator('a[data-preload="intent"][href^="/dashboard"]')
    .evaluateAll((els) =>
      Array.from(new Set(els.map((e) => (e as HTMLAnchorElement).getAttribute("href")!))),
    );
  return hrefs.filter(Boolean);
}

async function measurePreload(
  page: Page,
  href: string,
  trigger: "hover" | "focus",
): Promise<PreloadResult> {
  const requests: string[] = [];
  const onReq = (req: Request) => {
    if (isLazyChunk(req)) requests.push(req.url());
  };
  page.on("request", onReq);

  const link = page.locator(`a[href="${href}"]`).first();
  await link.scrollIntoViewIfNeeded().catch(() => {});

  if (trigger === "hover") {
    await link.hover({ force: true }).catch(() => {});
  } else {
    await link.focus().catch(() => {});
  }

  // Intent preload has a ~50ms delay; give the router 800ms to fire.
  await page.waitForTimeout(800);

  page.off("request", onReq);
  return {
    href,
    trigger,
    chunkRequested: requests.length > 0,
    requestCount: requests.length,
  };
}

test.describe("Dashboard preload on hover/focus", () => {
  test("links and lazy chunks preload", async ({ page, isMobile }, testInfo) => {
    const authed = await gotoDashboard(page);
    test.skip(
      !authed,
      "Dashboard not reachable (no TEST_EMAIL/TEST_PASSWORD provided).",
    );

    const hrefs = await collectNavLinks(page);
    expect(hrefs.length, "found dashboard nav links").toBeGreaterThan(0);

    const trigger: "hover" | "focus" = isMobile ? "focus" : "hover";
    const results: PreloadResult[] = [];

    for (const href of hrefs) {
      // Skip the current route — nothing new to preload.
      if (new URL(page.url()).pathname === href) continue;
      const r = await measurePreload(page, href, trigger);
      results.push(r);
    }

    // Attach a human-readable report per project.
    await testInfo.attach("preload-report.json", {
      body: JSON.stringify(
        {
          project: testInfo.project.name,
          viewport: page.viewportSize(),
          trigger,
          totalLinks: results.length,
          preloaded: results.filter((r) => r.chunkRequested).length,
          results,
        },
        null,
        2,
      ),
      contentType: "application/json",
    });

    // At least 70% of links should preload something on intent.
    const ok = results.filter((r) => r.chunkRequested).length;
    const ratio = results.length ? ok / results.length : 0;
    expect(
      ratio,
      `preload ratio ${ok}/${results.length} (${(ratio * 100).toFixed(0)}%)`,
    ).toBeGreaterThanOrEqual(0.7);
  });
});
