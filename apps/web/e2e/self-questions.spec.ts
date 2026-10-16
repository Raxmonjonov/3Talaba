import { expect, test, type Page } from "./test";

async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#firstName").fill("Savol");
  await page.locator("#email").fill(`savol-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("self-generated questions (generation effect)", () => {
  test("write a question, self-quiz by revealing the answer, then delete it", async ({
    page,
  }) => {
    await registerFreshUser(page);

    // Reachable from the dashboard quick actions.
    await page.getByRole("button", { name: "Savollarim", exact: true }).click();
    await expect(page).toHaveURL(/\/self-questions$/, { timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: "Mening savollarim" })
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.getByText("Hozircha o‘z savollaringiz yo‘q")
    ).toBeVisible({ timeout: 15_000 });

    const prompt = "Present Perfect qachon ishlatiladi?";
    const answer = "Hozirgi natijaga bog‘liq tugallanmagan harakatlar uchun.";

    await page.locator("#sq-prompt").fill(prompt);
    await page.locator("#sq-answer").fill(answer);
    await page.getByRole("button", { name: "Savolni saqlash" }).click();

    // The question is listed with its answer hidden until revealed.
    await expect(page.getByText(prompt)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Javob yashirilgan/)).toBeVisible();
    await expect(page.getByText(answer)).toHaveCount(0);

    await page.getByRole("button", { name: /Javobni ko.rsatish/ }).click();
    await expect(page.getByText(answer)).toBeVisible();

    // Deleting the question returns the page to its empty state.
    await page.getByRole("button", { name: /O.chirish/ }).click();
    await expect(page.getByText(prompt)).toHaveCount(0);
    await expect(
      page.getByText("Hozircha o‘z savollaringiz yo‘q")
    ).toBeVisible();
  });
});
