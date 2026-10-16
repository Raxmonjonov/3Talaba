import { expect, test, type Page } from "./test";

async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#firstName").fill("Konspekt");
  await page.locator("#email").fill(`konspekt-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

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

test.describe("lesson konspekt (summarization)", () => {
  test("saves a lesson summary and lists it on the notes page", async ({
    page,
  }) => {
    await registerFreshUser(page);
    await openFirstLesson(page);

    const card = page.locator("section", { hasText: "Konspekt" });
    await expect(card).toBeVisible({ timeout: 15_000 });

    const summary = "Kvadrat tenglamani yechishda diskriminantdan foydalanaman.";
    await card.getByPlaceholder(/bu darsda/).fill(summary);
    await card.getByRole("button", { name: "Konspektni saqlash" }).click();
    await expect(card.getByRole("status")).toBeVisible({ timeout: 15_000 });

    await page.goto("/notes");
    await expect(page.getByRole("heading", { name: "Konspektlar" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(summary)).toBeVisible();
  });

  test("is reachable from the dashboard quick actions", async ({ page }) => {
    await registerFreshUser(page);

    await page.getByRole("button", { name: "Konspektlar" }).click();
    await expect(page).toHaveURL(/\/notes$/);
    await expect(page.getByRole("heading", { name: "Konspektlar" })).toBeVisible({
      timeout: 15_000,
    });
  });
});
