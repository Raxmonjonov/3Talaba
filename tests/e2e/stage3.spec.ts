import { test, expect } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR =
  "C:/Users/User/.gemini/antigravity/brain/295078d0-53fa-4c39-8131-943257d933f1";

test("Bosqich 3: 12 Oylik Yo'l Xaritasi va Kunlik Vaqt Tanlash (Standart 2 soatgacha + Qo'lda kiritish)", async ({
  page,
}) => {
  // 1. Ro'yxatdan o'tish va /roadmap sahifasiga o'tish
  await page.goto("/register");
  const uniqueEmail = `diyora.${Date.now()}@3talab.uz`;
  await page.click('button:has-text("Qiz bola («Malikam»)")');
  await page.fill("#reg-name", "Diyora Rustamova");
  await page.fill("#reg-age", "16");
  await page.selectOption("#reg-grade", "10-sinf");
  await page.selectOption("#reg-region", "Buxoro");
  await page.fill("#reg-email", uniqueEmail);
  await page.fill("#reg-password", "Diyora2026!");
  await page.click('button[type="submit"]');

  await page.waitForURL("**/onboarding", { timeout: 20_000 });

  // To'g'ridan-to'g'ri /roadmap sahifasiga o'tish
  await page.goto("/roadmap");
  await page.waitForSelector("#current-daily-minutes-badge", { timeout: 20_000 });
  await page.waitForTimeout(1000);

  await expect(page.locator("h1")).toContainText("Malikam");
  await expect(page.locator("#current-daily-minutes-badge")).toContainText("60 daqiqa");

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "stage3-roadmap-standard-60min.png"),
    fullPage: false,
  });

  // 2. Standart maksimum — 120 daqiqa (2 soat) tugmasini tanlash
  await page.click('button[data-preset-minutes="120"]');
  await expect(page.locator("#current-daily-minutes-badge")).toContainText("120 daqiqa");
  await page.waitForTimeout(800);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "stage3-roadmap-standard-120min.png"),
    fullPage: false,
  });

  // 3. 2 soatdan ko'proq vaqtni qo'lda kiritish (masalan: 210 daqiqa = 3.5 soat)
  await page.fill("#roadmap-custom-minutes-input", "210");
  await page.click("#roadmap-apply-custom-btn");
  await expect(page.locator("#current-daily-minutes-badge")).toContainText("210 daqiqa");
  await page.waitForTimeout(700);

  // 6-oyni tanlab, kunlik vazifani 'Bajarildi' deb belgilash
  await page.click('button[data-month-btn="6"]');
  await page.waitForTimeout(500);
  await page.locator('button:has-text("Belgilash")').first().click();
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "stage3-roadmap-custom-210min.png"),
    fullPage: false,
  });
});
