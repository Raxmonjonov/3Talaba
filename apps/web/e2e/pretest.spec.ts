import { expect, test, type Page } from "./test";

async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#firstName").fill("Pretest");
  await page.locator("#email").fill(`pretest-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

/** Opens the first lesson of the first course in the catalog. */
async function openFirstLesson(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Kurslar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Kurslar" })).toBeVisible({
    timeout: 15_000,
  });
  await page.locator("button.text-lg.underline").first().click();
  await expect(page).toHaveURL(/\/courses\/[^/]+$/);
  const lesson = page.locator("ul li button").first();
  await expect(lesson).toBeVisible({ timeout: 15_000 });
  await lesson.click();
  await expect(page).toHaveURL(/\/lessons\/[^/]+$/);
}

test.describe("lesson pretesting", () => {
  test("answers a pre-question before studying and reveals the verdict", async ({
    page,
  }) => {
    await registerFreshUser(page);
    await openFirstLesson(page);

    const card = page.locator("section", { hasText: "Avval sinab ko‘ring" });
    await expect(card).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("button", { name: "Tutordan boshlash" })
    ).toBeVisible();

    await card.getByRole("button", { name: "Savolni ko‘rsatish" }).click();

    // Either a free-text input or choice buttons must appear in the card.
    const freeInput = card.getByRole("textbox", { name: "Javob" });
    const options = card.locator("button:not([type='submit'])");
    await expect
      .poll(async () => (await freeInput.count()) + (await options.count()))
      .toBeGreaterThan(0);

    if (await freeInput.isVisible().catch(() => false)) {
      await freeInput.fill("1");
      await card.getByRole("button", { name: "Yuborish" }).click();
    } else {
      const count = await options.count();
      await options.nth(count - 1).click();
    }

    // The verdict panel (role=status) proves the pretest was graded.
    await expect(card.getByRole("status")).toBeVisible({ timeout: 15_000 });
    await card.getByRole("button", { name: "Darsni o‘qishga o‘tish" }).click();
    await expect(
      card.getByRole("button", { name: "Savolni ko‘rsatish" })
    ).toBeVisible();
  });
});
