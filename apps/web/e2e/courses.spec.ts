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
  test("catalog, course detail, lesson blocks, tutor link, and enroll", async ({
    page,
  }) => {
    await registerFreshUser(page);

    await page.getByRole("button", { name: "Kurslar" }).click();
    await expect(page).toHaveURL(/\/courses$/);
    await expect(page.getByRole("heading", { name: "Kurslar" })).toBeVisible({
      timeout: 15_000,
    });

    const enroll = page.getByRole("button", { name: "Yozilish" }).first();
    await expect(enroll).toBeVisible({ timeout: 15_000 });
    await enroll.click();
    await expect(page.getByRole("button", { name: "Yozildingiz" }).first()).toBeVisible({
      timeout: 15_000,
    });

    // Course titles are large underlined buttons linking to /courses/:slug.
    await page.locator("button.text-lg.underline").first().click();
    await expect(page).toHaveURL(/\/courses\/[^/]+$/);
    await expect(page.getByRole("button", { name: /Kursga qaytish|Kurslar/ })).toBeVisible({
      timeout: 15_000,
    });

    // Seeded course pages list lessons with "N daqiqa" meta.
    const lesson = page.locator("ul li button").first();
    await expect(lesson).toBeVisible({ timeout: 15_000 });
    await lesson.click();

    await expect(page).toHaveURL(/\/lessons\/[^/]+$/);
    await expect(page.getByRole("button", { name: "Tutordan boshlash" })).toBeVisible({
      timeout: 15_000,
    });
    // Opening the tutor attaches the catalog lesson to the study session.
    await page.getByRole("button", { name: "Tutordan boshlash" }).click();
    await expect(page).toHaveURL(/\/study\//, { timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Katalogdagi dars" })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: "Chiqish" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    // Back on the same lesson: completion + course progress.
    await page.goto("/courses");
    await page.locator("button.text-lg.underline").first().click();
    const nextLesson = page.locator("ul li button").first();
    await nextLesson.click();
    await expect(page).toHaveURL(/\/lessons\/[^/]+$/);

    await page.getByRole("button", { name: "Darsni yakunladim" }).click();
    await expect(page.getByText(/XP · jami/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Yakunlandi/)).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: "Kursga qaytish" }).click();
    await expect(page).toHaveURL(/\/courses\/[^/]+$/);
    await expect(page.getByRole("progressbar")).toBeVisible({ timeout: 15_000 });
  });
});
