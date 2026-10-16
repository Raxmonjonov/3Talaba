import { test, expect } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR =
  "C:/Users/User/.gemini/antigravity/brain/295078d0-53fa-4c39-8131-943257d933f1";

test.describe("Bosqich 4: Dars va Mashq Tizimi, Savollar Banki va Konfeti", () => {
  test("Completes interactive lesson (Theory -> Examples -> Exercises -> Analysis/Confetti) and Question Bank", async ({
    page,
  }) => {
    const uniqueEmail = `diyora.stage4.${Date.now()}@3talab.uz`;

    // 1. Ro'yxatdan o'tish (Malikam murojaati uchun FEMALE profil)
    await page.goto("/register");
    await page.click('button:has-text("Qiz bola («Malikam»)")');
    await page.fill("#reg-name", "Diyora Karimova");
    await page.fill("#reg-age", "16");
    await page.selectOption("#reg-grade", "10-sinf");
    await page.selectOption("#reg-region", "Samarqand");
    await page.fill("#reg-email", uniqueEmail);
    await page.fill("#reg-password", "TestParol123!");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/onboarding", { timeout: 20_000 });

    // 2. Darslar katalogi (/learn) sahifasiga o'tish
    await page.goto("/learn");
    await expect(
      page.getByRole("heading", { name: /Malikam, bugungi darsga tayyormisiz\?/i })
    ).toBeVisible({ timeout: 15000 });

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "stage4-learn-catalog.png"),
      fullPage: true,
    });

    // 3. SAT Matematika darsini ochish (/learn/sat-math-linear-equations)
    await page.goto("/learn/sat-math-linear-equations");
    await expect(
      page.getByRole("heading", {
        name: /Chiziqli Tenglamalar, Funksiyalar va Grafik Qiyalik/i,
      })
    ).toBeVisible({ timeout: 15000 });

    // 1-bosqich: Qisqa Nazariya
    await expect(page.getByText(/Qisqa va Aniq Nazariya/i)).toBeVisible();
    await page.click("#to-examples-btn");

    // 2-bosqich: Hayotiy Misollar
    await expect(
      page.getByText(/Bosqichma-Bosqich Yechilgan Namunaviy Misollar/i)
    ).toBeVisible();
    await page.click("#to-exercises-btn");

    // 3-bosqich: Mashqlar (4 ta savol)
    const correctChoices = ["B", "B", "B", "C"];
    for (let i = 0; i < 4; i++) {
      await expect(page.getByText(new RegExp(`MASHQ ${i + 1} / 4`, "i"))).toBeVisible();

      if (i === 0) {
        // Socratic maslahatni ochib skrinshot olish
        await page.getByRole("button", { name: /Socratic maslahat olish/i }).click();
        await expect(page.getByText(/AI Ustoz ishorasi/i)).toBeVisible();
      }

      const answerChoice = correctChoices[i];
      await page.click(`button[data-exercise-option="${answerChoice}"]`);

      await expect(page.getByText(/Ofarin, Malikam!/i)).toBeVisible();

      if (i === 0) {
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, "stage4-lesson-exercise.png"),
          fullPage: true,
        });
      }

      await page.click("#exercise-next-btn");
    }

    // 4-bosqich: Tahlil, XP/Nishon konfetisi va Ertangi Vazifa
    await expect(page.getByText(/DARS MUVAFFAQIYATLI YAKUNLANDI!/i)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator("#tomorrow-task-card")).toBeVisible();

    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "stage4-lesson-complete-confetti.png"),
      fullPage: true,
    });

    // 5. Savollar Banki (/practice) sahifasini tekshirish
    await page.goto("/practice");
    await expect(
      page.getByRole("heading", { name: /fan va qiyinlik bo'yicha mashq qiling/i })
    ).toBeVisible({ timeout: 15000 });

    // Birinchi savolga javob berish
    await page.locator('button:has-text("B.")').first().click();
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "stage4-practice-question-bank.png"),
      fullPage: true,
    });
  });
});
