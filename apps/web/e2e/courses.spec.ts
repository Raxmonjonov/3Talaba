import { expect, test, type Page } from "./test";

async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#firstName").fill("Kurs");
  await page.locator("#email").fill(`kurs-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("courses", () => {
  test("dashboard opens the catalog and a course can be enrolled", async ({
    page,
  }) => {
    await registerFreshUser(page);

    await page.getByRole("button", { name: "Kurslar" }).click();
    await expect(page).toHaveURL(/\/courses$/);
    await expect(page.getByRole("heading", { name: "Kurslar" })).toBeVisible({
      timeout: 15_000,
    });

    // Seeded catalog has at least one course; enroll on the first card.
    const enroll = page.getByRole("button", { name: "Yozilish" }).first();
    await expect(enroll).toBeVisible({ timeout: 15_000 });
    await enroll.click();
    await expect(page.getByRole("button", { name: "Yozildingiz" }).first()).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
