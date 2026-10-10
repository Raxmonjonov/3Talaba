import { answerCurrentQuestion, expect, test, type Page } from "./test";

/** Registers a throwaway student through the real form and lands on the dashboard. */
async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#firstName").fill("E2E");
  await page.locator("#email").fill(`e2e-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  // Gender and goal buttons are the form's aria-pressed controls; gender
  // comes first (MALE, FEMALE, OTHER). Pick OTHER so no server-side gender
  // title overrides the first name in the greeting. (The language switcher
  // also uses aria-pressed, so scope the lookup to the form.)
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Xush kelibsiz, E2E")).toBeVisible({
    timeout: 15_000,
  });
}

test.describe("onboarding flow", () => {
  test("registration lands on the dashboard", async ({ page }) => {
    await registerFreshUser(page);

    // App screens are Uzbek-only personal data: neutral title, uz lang, noindex.
    await expect(page).toHaveTitle("3Talab");
    await expect(page.locator("html")).toHaveAttribute("lang", "uz");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow"
    );
  });

  test("placement measures a level and the dashboard reflects it", async ({ page }) => {
    await registerFreshUser(page);

    await page.goto("/placement");
    await expect(page.getByRole("button", { name: "Barchasi" })).toBeVisible({
      timeout: 15_000,
    });

    // Adaptive length is 15–25 items; click through until the result screen.
    // Free-text NUMERIC cards and single-option MCQs are both handled.
    const resultHeading = page.getByRole("heading", { name: "Darajangiz aniqlandi" });
    for (let i = 0; i < 30; i++) {
      if (await resultHeading.isVisible().catch(() => false)) break;
      await answerCurrentQuestion(page);
      // VERDICT_HOLD_MS on the server-backed flip is 400ms.
      await page.waitForTimeout(450);
    }

    await expect(resultHeading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".auth-card .text-5xl")).toHaveText(/^\d{1,2}$/);
    await expect(page.getByText(/to‘g‘ri javob/)).toBeVisible();
    // Scaled 400–1600 score sits under the level number.
    await expect(page.getByText(/ball/)).toBeVisible();
    // Per-skill breakdown with clickable practice chips.
    await expect(page.getByText("Mavzular kesimida")).toBeVisible();
    await expect(page.getByRole("progressbar").first()).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.getByText("Xush kelibsiz, E2E")).toBeVisible();
    await expect(page.getByText(/Daraja .+\(\d{1,2}\)/)).toBeVisible();
  });

  test("subject placement deep-link starts a filtered diagnostic", async ({ page }) => {
    await registerFreshUser(page);

    await page.goto("/placement?subject=MATHEMATICS");
    await expect(page.getByRole("button", { name: "Matematika" }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(".auth-card button").first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("the dashboard shows the progress stairs and can opt out of 3D", async ({
    page,
  }) => {
    // The shared fixture disables 3D to spare WebGL contexts; this one test
    // needs the default ON state so the opt-out path is what gets exercised.
    await page.addInitScript(() => {
      try {
        localStorage.removeItem("3talab_3d");
      } catch {
        /* ignore */
      }
    });
    await registerFreshUser(page);

    // The staircase is always present: WebGL devices get the 3D one, every
    // other device gets the plain treads underneath the same copy.
    await expect(page.getByText("Tepada maqsadingiz")).toBeVisible();
    await expect(page.getByText("Har bir pog‘ona — bir daraja")).toBeVisible();

    // The checkbox sits under animated 3D layers; click the input directly so
    // a floating medal or canvas frame cannot steal the actionability check.
    await page.locator('input[type="checkbox"]').nth(2).click({ force: true });
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("3talab_3d")))
      .toBe("off");

    // Turning the scenes off must never take the dashboard down with it.
    await expect(page.getByText("Xush kelibsiz, E2E")).toBeVisible();
    await expect(page.getByText("Tepada maqsadingiz")).toBeVisible();
  });

  test("the tutor opens a lesson on the first message", async ({ page }) => {
    await registerFreshUser(page);

    await page.goto("/study");
    await expect(page.getByRole("heading", { name: "Dars" })).toBeVisible();
    await page.locator("input, textarea").first().fill("matematika");
    await page.getByRole("button", { name: "Yuborish" }).click();

    await expect(page.getByText("Sonlar va arifmetika")).toBeVisible({
      timeout: 15_000,
    });

    // Leaving the session surfaces it on the dashboard history shelf.
    await page.getByRole("button", { name: "Chiqish" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "O‘rganish tarixi" })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: /Erkin dars|davom etmoqda/ }).first().click();
    await expect(page).toHaveURL(/\/study\//, { timeout: 15_000 });
    await expect(page.getByText("Sonlar va arifmetika")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("a lesson-bound session answers with the catalog lesson content", async ({
    page,
  }) => {
    await registerFreshUser(page);

    await page.goto("/courses");
    await page.locator("button.text-lg.underline").first().click();
    await page.locator("ul li button").first().click();
    await expect(page).toHaveURL(/\/lessons\/[^/]+$/);
    const heading = page.locator("header h1").first();
    await expect(heading).not.toHaveText("Yuklanmoqda…", { timeout: 15_000 });
    const lessonName = ((await heading.textContent()) ?? "").trim();
    expect(lessonName.length).toBeGreaterThan(0);

    await page.getByRole("button", { name: "Tutordan boshlash" }).click();
    await expect(page).toHaveURL(/\/study\//, { timeout: 15_000 });
    await page.locator("input, textarea").first().fill("bu dars nima haqida?");
    await page.getByRole("button", { name: "Yuborish" }).click();

    // The opener names the real catalog lesson instead of a generic menu.
    await expect(page.getByText("darsini ochdik")).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByText(`"${lessonName}" darsini ochdik`)
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("button", { name: "Katalogdagi dars" })
    ).toBeVisible();
  });
});
