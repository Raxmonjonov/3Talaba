import { test, expect } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR =
  "C:/Users/User/.gemini/antigravity/brain/295078d0-53fa-4c39-8131-943257d933f1";

test.describe("Bosqich 6: Gamifikatsiya va Progress Paneli (/progress va /dashboard)", () => {
  test("Verifies XP/Level, Streak, Goal Distance, Weekly/Monthly Charts, Subject Mastery, Badges, and Leaderboard", async ({
    page,
  }) => {
    const uniqueEmail = `madina.stage6.${Date.now()}@3talab.uz`;

    // 1. Ro'yxatdan o'tish (Malikam)
    await page.goto("/register");
    await page.click('button:has-text("Qiz bola («Malikam»)")');
    await page.fill("#reg-name", "Madina Aliyeva");
    await page.fill("#reg-age", "16");
    await page.selectOption("#reg-grade", "10-sinf");
    await page.selectOption("#reg-region", "Toshkent sh.");
    await page.fill("#reg-email", uniqueEmail);
    await page.fill("#reg-password", "Madina2026!");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/onboarding", { timeout: 20_000 });

    // 2. Progress va Gamifikatsiya paneliga (/progress) o'tish
    await page.goto("/progress");
    await expect(
      page.getByRole("heading", { name: /O'sish Ko'rsatkichlaringiz/i })
    ).toBeVisible({ timeout: 15_000 });

    // Streak, Maqsadga masofa va Haftalik grafikni tekshirish
    await expect(page.locator("#streak-status-card")).toBeVisible();
    await expect(page.locator("#goal-distance-section")).toBeVisible();
    await expect(
      page.getByText(/Haftalik XP va O'zlashtirish Grafikasi/i)
    ).toBeVisible();

    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "stage6-progress-weekly.png"),
      fullPage: true,
    });

    // 3. Oylik grafik (6 oy) rejimiga o'tkazish
    await page.click('button[data-chart-range="monthly"]');
    await expect(
      page.getByText(/Oylik O'sish Trajektoriyasi \(6 oy\)/i)
    ).toBeVisible();

    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "stage6-progress-monthly.png"),
      fullPage: false,
    });

    // 4. Fanlar Mastery, Nishonlar vitrinasi va Ixtiyoriy Reytingni tekshirish
    await expect(page.locator("#subject-mastery-section")).toBeVisible();
    await expect(page.locator("#badges-showcase-section")).toBeVisible();
    await expect(page.locator("#leaderboard-section")).toBeVisible();

    // Ixtiyoriy reytingni yashirish va qayta ko'rsatish tugmasini sinash
    await page.click("#toggle-leaderboard-btn");
    await expect(page.getByText(/Reyting jadvali yashirildi/i)).toBeVisible();
    await page.click("#toggle-leaderboard-btn");
    await expect(page.getByText(/SIZ/i).first()).toBeVisible();

    await page.locator("#badges-showcase-section").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "stage6-badges-leaderboard.png"),
      fullPage: false,
    });
  });
});
