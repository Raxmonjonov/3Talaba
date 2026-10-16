import { answerCurrentQuestion, expect, test, type Page } from "./test";

async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#firstName").fill("Xato");
  await page.locator("#email").fill(`xato-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("mistake journal", () => {
  test("renders the journal and its API responds for a fresh student", async ({
    page,
  }) => {
    await registerFreshUser(page);

    // Seed at least one graded attempt so the endpoint has history to scan.
    await page.goto("/practice");
    await expect(page.getByRole("heading", { name: "Mashq" })).toBeVisible({
      timeout: 15_000,
    });
    await answerCurrentQuestion(page);

    await page.goto("/mistakes");
    await expect(
      page.getByRole("heading", { name: "Xatolar daftari" })
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText("Bu — hali to‘g‘rilanmagan xatolar")
    ).toBeVisible();

    // The endpoint must answer cleanly — no error banner either way.
    await expect(page.locator(".alert-error")).toHaveCount(0);
  });

  test("is reachable from the app navigation", async ({ page }) => {
    await registerFreshUser(page);

    await page.getByRole("button", { name: "Xatolar" }).click();
    await expect(page).toHaveURL(/\/mistakes$/);
    await expect(
      page.getByRole("heading", { name: "Xatolar daftari" })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("saves an error analysis (self-explanation) on a mistake", async ({
    page,
    request,
  }) => {
    await registerFreshUser(page);

    // Deliberately answer a practice question wrong so a mistake exists. A
    // label that can never match an option is graded incorrect for both
    // choice and free-text questions.
    const token = await page.evaluate(() =>
      localStorage.getItem("3talab_token")
    );
    const auth = { Authorization: `Bearer ${token}` };
    const base = "http://localhost:4000";

    const qRes = await request.get(`${base}/api/content/practice/next`, {
      headers: auth,
    });
    const { question } = await qRes.json();
    await request.post(`${base}/api/content/practice/answer`, {
      headers: { ...auth, "Content-Type": "application/json" },
      data: { questionId: question.id, given: "__xato__" },
    });

    await page.goto("/mistakes");
    await expect(
      page.getByRole("heading", { name: "Xatolar daftari" })
    ).toBeVisible({ timeout: 15_000 });

    const field = page.getByLabel(/Xato tahlili/).first();
    await expect(field).toBeVisible({ timeout: 15_000 });
    await field.fill("Shoshildim va savol shartini to‘liq o‘qimadim.");
    await page.getByRole("button", { name: "Tahlilni saqlash" }).first().click();
    await expect(page.getByText("Saqlandi")).toBeVisible();

    // Reloading must keep the saved analysis.
    await page.reload();
    await expect(page.getByLabel(/Xato tahlili/).first()).toHaveValue(
      "Shoshildim va savol shartini to‘liq o‘qimadim."
    );
  });
});
