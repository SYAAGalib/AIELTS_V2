import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for dashboard preload verification.
 *
 * Set BASE_URL to point at a running dev server or preview deployment.
 * Defaults to http://localhost:5173.
 *
 * Optional auth:
 *   TEST_EMAIL, TEST_PASSWORD — used by tests/auth.setup.ts to log in once
 *   and persist a storageState that authenticated specs reuse.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "playwright-report/results.json" }],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "mobile-pixel5",
      use: {
        ...devices["Pixel 5"],
        storageState: "tests/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
