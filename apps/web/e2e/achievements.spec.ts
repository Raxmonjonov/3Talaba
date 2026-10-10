import { expect, test, type Page } from "./test";

async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#firstName").fill("Yutuq");
  await page.locator("#email").fill(`yutuq-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("achievements", () => {
  test("the dashboard shows the medal shelf with the full catalog", async ({
    page,
  }) => {
    await registerFreshUser(page);

    await expect(page.getByRole("heading", { name: "Yutuqlar" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/^0 \/ \d+ ochilgan$/)).toBeVisible();
    // Catalog titles from the API, rendered on the shelf.
    await expect(page.getByText("Birinchi qadam")).toBeVisible();
    await expect(page.getByText("Daraja aniqlandi")).toBeVisible();
    await expect(page.getByText("Yuqori cho‘qqi")).toBeVisible();
  });

  test("finishing placement celebrates and earns the medal", async ({ page }) => {
    await registerFreshUser(page);

    await page.goto("/placement");
    await expect(page.getByRole("button", { name: "Barchasi" })).toBeVisible({
      timeout: 15_000,
    });

    // Adaptive length is 15–25 items; click through until the result screen.
    // Some bank items are single-option; always pick the last available choice.
    const resultHeading = page.getByRole("heading", { name: "Darajangiz aniqlandi" });
    for (let i = 0; i < 30; i++) {
      if (await resultHeading.isVisible().catch(() => false)) break;
      const options = page.locator(".auth-card button");
      await expect(options.first()).toBeVisible({ timeout: 10_000 });
      const count = await options.count();
      await options.nth(count - 1).click();
      await page.waitForTimeout(450);
    }

    await expect(resultHeading).toBeVisible({ timeout: 15_000 });

    // The result screen lists the medals this placement just unlocked.
    await expect(page.getByRole("heading", { name: "Yangi yutuqlar" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Daraja aniqlandi")).toBeVisible();

    // Confetti canvas mounts once the result screen is up (skipped only for
    // reduced-motion, which Playwright does not enable by default).
    await expect(page.locator("canvas[aria-hidden='true']").first()).toBeVisible();

    // In-app navigation (same path a student takes); a full reload can race
    // the server's post-placement medal writes on SQLite and stick the boot
    // spinner. Placement drops the student straight into a fresh study session.
    await page.getByRole("button", { name: "Darsni boshlash" }).click();
    await expect(page).toHaveURL(/\/study\//);
    await expect(page.getByRole("heading", { name: "Dars" })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: "Chiqish" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    // Wait for the dashboard shell first — the lazy chunk may still be
    // mounting under the RouteFallback after leaving placement.
    await expect(page.getByText("Chiqish")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Yutuqlar" })).toBeVisible({
      timeout: 15_000,
    });
    // placement_done is awarded server-side; first_steps may land after the
    // study session starts — either way the counter must move past zero.
    await expect(page.getByText(/^[1-9]\d? \/ \d+ ochilgan$/)).toBeVisible({
      timeout: 15_000,
    });
  });
});
