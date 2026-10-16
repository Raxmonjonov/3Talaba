import { answerCurrentQuestion, expect, test, type Page } from "./test";

async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#firstName").fill("Ishonch");
  await page.locator("#email").fill(`ishonch-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("confidence calibration", () => {
  test("confidence mode asks before grading and reports calibration", async ({
    page,
  }) => {
    await registerFreshUser(page);

    await page.goto("/practice?confidence=1");
    await expect(page.getByRole("heading", { name: "Mashq" })).toBeVisible({
      timeout: 15_000,
    });

    // Answering must NOT reveal the verdict until confidence is rated.
    await answerCurrentQuestion(page);
    await expect(
      page.getByRole("heading", { name: "Javobni yuborishdan oldin" })
    ).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "O‘rta" }).click();

    await expect(page.getByRole("status")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Keyingi savol" })).toBeVisible();
    await expect(
      page.getByText("Ishonch va natija o‘rtasidagi moslikni kuzatib boring")
    ).toBeVisible();
  });

  test("the dashboard shows the calibration card after a rated answer", async ({
    page,
  }) => {
    await registerFreshUser(page);

    await page.goto("/practice?confidence=1");
    await expect(page.getByRole("heading", { name: "Mashq" })).toBeVisible({
      timeout: 15_000,
    });
    await answerCurrentQuestion(page);
    await page.getByRole("button", { name: "Yuqori" }).click();
    await expect(page.getByRole("status")).toBeVisible({ timeout: 15_000 });

    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Ishonch aniqligi" })
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("button", { name: "Ishonch rejimida mashq" })
    ).toBeVisible();
  });
});
