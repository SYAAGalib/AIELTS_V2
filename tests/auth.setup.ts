import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const authFile = "tests/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  if (!email || !password) {
    // Write an empty storage state so dependent projects can still load.
    // Auth-gated tests will detect the redirect to /login and skip themselves.
    fs.writeFileSync(
      authFile,
      JSON.stringify({ cookies: [], origins: [] }, null, 2),
    );
    setup.info().annotations.push({
      type: "warning",
      description:
        "TEST_EMAIL / TEST_PASSWORD not set — running as unauthenticated.",
    });
    return;
  }

  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in|login/i }).click();

  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
  await expect(page).toHaveURL(/\/dashboard/);

  await page.context().storageState({ path: authFile });
});
