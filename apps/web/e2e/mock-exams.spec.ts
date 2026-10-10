import { expect, test, type Page } from "./test";

async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#firstName").fill("Imtihon");
  await page.locator("#email").fill(`imtihon-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("mock exams", () => {
  test("dashboard lists exams and a runner grades one item", async ({ page }) => {
    await registerFreshUser(page);

    await page.getByRole("button", { name: "Imtihonlar" }).click();
    await expect(page).toHaveURL(/\/mock-exams$/);
    await expect(page.getByRole("heading", { name: "Namunaviy imtihonlar" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("SAT").first()).toBeVisible({ timeout: 15_000 });

    // Open the first exam card.
    await page.locator("main button").first().click();
    await expect(page).toHaveURL(/\/mock-exams\//);
    await expect(page.getByRole("button", { name: "Imtihonni boshlash" })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: "Imtihonni boshlash" }).click();
    await expect(page.getByRole("textbox", { name: "Javob" }).or(page.locator(".auth-card button:not([type='submit'])").first())).toBeVisible({
      timeout: 15_000,
    });

    // Answer the first item (choice or free-text).
    const freeInput = page.getByRole("textbox", { name: "Javob" });
    if (await freeInput.isVisible().catch(() => false)) {
      await freeInput.fill("1");
      await page.getByRole("button", { name: "Yuborish" }).click();
    } else {
      const options = page.locator(".auth-card button:not([type='submit'])");
      const count = await options.count();
      await options.nth(count - 1).click();
    }

    await expect(page.getByRole("status")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /Keyingi savol|Natijani/ })).toBeVisible();
  });
});
