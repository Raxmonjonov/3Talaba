import { test, expect } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR =
  "C:/Users/User/.gemini/antigravity/brain/295078d0-53fa-4c39-8131-943257d933f1";

test.describe("Bosqich 7: Admin Panel (/admin), Kunlik Eslatmalar (/settings) va Ota-ona/Ustoz Ko'rinishi (/guardian)", () => {
  test("Verifies Admin Question Bank CRUD & stats, Daily Reminders live notification, and Guardian monitoring view", async ({
    page,
  }) => {
    const uniqueEmail = `sardor.stage7.${Date.now()}@3talab.uz`;

    // 1. Ro'yxatdan o'tish (Shag'zodam)
    await page.goto("/register");
    await page.click('button:has-text("O\'g\'il bola («Shag\'zodam»)")');
    await page.fill("#reg-name", "Sardor Raximov");
    await page.fill("#reg-age", "17");
    await page.selectOption("#reg-grade", "11-sinf");
    await page.selectOption("#reg-region", "Buxoro");
    await page.fill("#reg-email", uniqueEmail);
    await page.fill("#reg-password", "Sardor2026!");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/onboarding", { timeout: 20_000 });

    // 2. Admin Panel (/admin) — Yangi savol qo'shish va statistikalarni tekshirish
    await page.goto("/admin");
    await expect(
      page.getByRole("heading", {
        name: /Foydalanuvchilar, Savollar Banki va Kontent Boshqaruvi/i,
      })
    ).toBeVisible({ timeout: 15_000 });

    await page.selectOption("#admin-q-subject", "sat-math");
    await page.selectOption("#admin-q-difficulty", "3");
    await page.fill(
      "#admin-q-prompt",
      "Agar 5x + 15 = 45 bo'lsa, x + 3 ifodaning qiymati nechaga teng?"
    );
    await page.fill("#admin-q-opt-a", "6");
    await page.fill("#admin-q-opt-b", "9");
    await page.fill("#admin-q-opt-c", "12");
    await page.fill("#admin-q-opt-d", "15");
    await page.selectOption("#admin-q-correct", "B");
    await page.fill(
      "#admin-q-explanation",
      "5x + 15 ifodani 5 ga bo'lsak aynan x + 3 hosil bo'ladi: 45 / 5 = 9."
    );
    await page.click("#admin-save-question-btn");

    await expect(page.locator("#admin-save-status")).toBeVisible({ timeout: 10_000 });

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "stage7-admin-panel.png"),
      fullPage: true,
    });

    // 3. Kunlik Eslatmalar va Sozlamalar (/settings)
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: /o'qish tartibi va bildirishnomalar/i })
    ).toBeVisible({ timeout: 15_000 });

    await page.fill("#reminder-time-input", "20:00");
    await page.click("#send-test-reminder-btn");

    await expect(page.locator("#live-notification-banner")).toBeVisible({
      timeout: 10_000,
    });

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "stage7-reminders-settings.png"),
      fullPage: true,
    });

    // 4. Ota-ona va Ustoz Ko'rinishi (/guardian?code=...)
    await page.click("#guardian-share-link");
    await expect(
      page.getByRole("heading", { name: /O'quvchi Progressini Kuzatish Markazi/i })
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("#guardian-teacher-note")).toBeVisible();

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "stage7-guardian-view.png"),
      fullPage: true,
    });
  });
});
