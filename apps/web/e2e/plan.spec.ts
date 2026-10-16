import { expect, test, type Page } from "./test";

async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#firstName").fill("Reja");
  await page.locator("#email").fill(`reja-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("today's plan", () => {
  test("shows the plan card and its start button opens practice", async ({
    page,
  }) => {
    await registerFreshUser(page);

    await expect(
      page.getByRole("heading", { name: "Bugungi reja" })
    ).toBeVisible({ timeout: 15_000 });

    // A brand-new student has nothing due or wrong yet, so the plan offers
    // a fresh drill instead of a queue.
    const start = page.getByRole("button", { name: /Rejani boshlash|Yangi mashq/ });
    await expect(start).toBeVisible();
    await start.click();

    await expect(page).toHaveURL(/\/practice/);
    await expect(page.getByRole("heading", { name: "Mashq" })).toBeVisible({
      timeout: 15_000,
    });
  });
});
