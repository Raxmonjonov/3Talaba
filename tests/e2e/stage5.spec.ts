import { test, expect } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR =
  "C:/Users/User/.gemini/antigravity/brain/295078d0-53fa-4c39-8131-943257d933f1";

test.describe("Bosqich 5: Socratic AI Murabbiy (/coach va dars ichidagi kontekstual AI)", () => {
  test("Verifies Socratic guidance, varied warm honorifics, Writing Band rubric, Fatigue care, and In-Lesson Coach", async ({
    page,
  }) => {
    const uniqueEmail = `bekzod.stage5.${Date.now()}@3talab.uz`;

    // 1. Ro'yxatdan o'tish (O'g'il bola -> «Shag'zodam» va iliq variatsiyalarini sinash uchun)
    await page.goto("/register");
    await page.click('button:has-text("O\'g\'il bola («Shag\'zodam»)")');
    await page.fill("#reg-name", "Bekzod Toshmatov");
    await page.fill("#reg-age", "17");
    await page.selectOption("#reg-grade", "11-sinf");
    await page.selectOption("#reg-region", "Samarqand");
    await page.fill("#reg-email", uniqueEmail);
    await page.fill("#reg-password", "Bekzod2026!");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/onboarding", { timeout: 20_000 });

    // 2. AI Murabbiy sahifasiga (/coach) o'tish
    await page.goto("/coach");
    await expect(
      page.getByRole("heading", { name: /Salom, Shag'zodam! Birgalikda fikrlaymiz/i })
    ).toBeVisible({ timeout: 15_000 });

    // 2.1. Socratic Ustoz: 1-qadam (yo'naltiruvchi savol) va 2-qadam (bosqichma-bosqich tushuntirish + iliq murojaat almashinuvi)
    await page.locator('button[data-quick-prompt="SOCRATIC_TUTOR"]').first().click();
    await expect(page.getByText(/Socratic Yo'naltirish/i).first()).toBeVisible({
      timeout: 10_000,
    });

    await page.fill("#coach-message-input", "Ikkala tomonini 2 ga bo'lib soddalashtiramiz!");
    await page.click("#coach-send-btn");
    await expect(page.getByText(/Bosqichma-Bosqich Yechim/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/Bilimdon Shag'zodam/i).first()).toBeVisible();

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "stage5-coach-socratic.png"),
      fullPage: true,
    });

    // 2.2. Writing Tekshiruvi (IELTS / SAT Writing Band Rubric)
    await page.click('button[data-coach-mode="WRITING_REVIEW"]');
    await page.locator('button[data-quick-prompt="WRITING_REVIEW"]').first().click();

    await expect(page.locator("#writing-rubric-card").first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/Taxminiy Band:/i).first()).toBeVisible();

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "stage5-coach-writing-rubric.png"),
      fullPage: true,
    });

    // 2.3. Charchoqni sezish va dam olish tavsiyasi (MOTIVATION / Wellness Care)
    await page.click('button[data-coach-mode="MOTIVATION"]');
    await page.locator('button[data-quick-prompt="MOTIVATION"]').first().click();

    await expect(page.getByText(/10 daqiqalik tanaffus/i).first()).toBeVisible({
      timeout: 10_000,
    });

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "stage5-coach-fatigue-care.png"),
      fullPage: true,
    });

    // 3. Dars ichidagi kontekstual AI Murabbiy vidjeti (/learn/sat-math-linear-equations)
    await page.goto("/learn/sat-math-linear-equations");
    await expect(page.locator("#toggle-lesson-ai-coach-btn")).toBeVisible({
      timeout: 15_000,
    });
    await page.click("#toggle-lesson-ai-coach-btn");
    await page.getByRole("button", { name: /Shu joyini Socratic usulda tushuntiring/i }).click();

    await expect(page.locator("#lesson-ai-coach-reply")).toBeVisible({
      timeout: 10_000,
    });

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "stage5-lesson-inline-coach.png"),
      fullPage: true,
    });
  });
});
