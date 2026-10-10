import { expect, test, type Page } from "@playwright/test";

async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
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
    await expect(page.getByText("0 / 11 ochilgan")).toBeVisible();
    // Catalog titles from the API, rendered on the shelf.
    await expect(page.getByText("Birinchi qadam")).toBeVisible();
    await expect(page.getByText("Daraja aniqlandi")).toBeVisible();
    await expect(page.getByText("Yuqori cho‘qqi")).toBeVisible();
  });

  test("finishing placement celebrates and earns the medal", async ({ page }) => {
    await registerFreshUser(page);

    await page.goto("/placement");
    const options = page.locator(".auth-card button");
    for (let index = 0; index < 11; index++) {
      await expect(options).toHaveCount(4);
      await options.nth(1).click();
    }

    await expect(
      page.getByRole("heading", { name: "Darajangiz aniqlandi" })
    ).toBeVisible({ timeout: 15_000 });

    // Confetti canvas mounts once the result screen is up (skipped only for
    // reduced-motion, which Playwright does not enable by default).
    await expect(page.locator("canvas[aria-hidden='true']").first()).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Yutuqlar" })).toBeVisible({
      timeout: 15_000,
    });
    // placement_done is awarded server-side; first_steps may land after the
    // study session starts — either way the counter must move past zero.
    await expect(page.getByText(/^[1-9]\d? \/ 11 ochilgan$/)).toBeVisible({
      timeout: 15_000,
    });
  });
});
