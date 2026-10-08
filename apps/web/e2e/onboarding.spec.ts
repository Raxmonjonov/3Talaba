import { expect, test, type Page } from "@playwright/test";

/** Registers a throwaway student through the real form and lands on the dashboard. */
async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").fill("E2E");
  await page.locator("#email").fill(`e2e-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  // Gender and goal buttons are the form's aria-pressed controls; gender
  // comes first (MALE, FEMALE, OTHER). Pick OTHER so no server-side gender
  // title overrides the first name in the greeting. (The language switcher
  // also uses aria-pressed, so scope the lookup to the form.)
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Xush kelibsiz, E2E")).toBeVisible();
}

test.describe("onboarding flow", () => {
  test("registration lands on the dashboard", async ({ page }) => {
    await registerFreshUser(page);
  });

  test("placement measures a level and the dashboard reflects it", async ({ page }) => {
    await registerFreshUser(page);

    await page.goto("/placement");
    const options = page.locator(".auth-card button");
    for (let index = 0; index < 11; index++) {
      await expect(options).toHaveCount(4);
      await options.nth(1).click();
      if (index < 10) {
        await expect(page.getByText(`Savol ${index + 2} / 11`)).toBeVisible();
      }
    }

    await expect(
      page.getByRole("heading", { name: "Darajangiz aniqlandi" })
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".auth-card .text-5xl")).toHaveText(/^\d{1,2}$/);
    await expect(page.getByText(/to‘g‘ri javob/)).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.getByText("Xush kelibsiz, E2E")).toBeVisible();
    await expect(page.getByText(/Daraja .+\(\d{1,2}\)/)).toBeVisible();
  });

  test("the tutor opens a lesson on the first message", async ({ page }) => {
    await registerFreshUser(page);

    await page.goto("/study");
    await expect(page.getByRole("heading", { name: "Dars" })).toBeVisible();
    await page.locator("input, textarea").first().fill("matematika");
    await page.getByRole("button", { name: "Yuborish" }).click();

    await expect(page.getByText("Sonlar va arifmetika")).toBeVisible({
      timeout: 15_000,
    });
  });
});
