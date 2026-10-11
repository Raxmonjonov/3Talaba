import { answerCurrentQuestion, expect, test, type Page } from "./test";

async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#firstName").fill("Mashq");
  await page.locator("#email").fill(`mashq-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("practice", () => {
  test("dashboard links to practice and the drill grades an answer", async ({
    page,
  }) => {
    await registerFreshUser(page);

    // Dashboard always offers the practice entry, even with an empty queue.
    await expect(page.getByRole("heading", { name: "Takrorlash" })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: /Mashqni boshlash|Navbatdagi/ }).click();

    await expect(page).toHaveURL(/\/practice$/);
    await expect(page.getByRole("heading", { name: "Mashq" })).toBeVisible({
      timeout: 15_000,
    });

    // Answer one item from the seeded bank (choice or free-text).
    await answerCurrentQuestion(page);

    await expect(page.getByRole("status")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Keyingi savol" })).toBeVisible();

    await page.getByRole("banner").getByRole("button", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("review mode ends cleanly when the queue is empty", async ({ page }) => {
    await registerFreshUser(page);

    await page.goto("/practice?review=1");
    await expect(
      page.getByRole("heading", { name: "Takrorlash tugadi" })
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Dashboard" })).toBeVisible();
  });
});
