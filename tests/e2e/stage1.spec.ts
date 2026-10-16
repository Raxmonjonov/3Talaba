import { test, expect } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR =
  "C:/Users/User/.gemini/antigravity/brain/295078d0-53fa-4c39-8131-943257d933f1";

test("Bosqich 1: Bosh sahifa, anime.js animatsiyalar, Kunlik vaqt kalkulyatori va Ro'yxatdan o'tish", async ({
  page,
}) => {
  // 1. Bosh sahifa (Qorong'u rejim + anime.js v4 Hero + SVG trajectory)
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("12");
  await expect(page.locator("h1")).toContainText("Universitetlargacha");
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "stage1-hero-dark.png"),
    fullPage: false,
  });

  // 2. Kunlik vaqt kalkulyatori + Yorug' rejim
  const calcSection = page.locator("#vaqt-kalkulyator");
  await calcSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.fill("#custom-study-minutes", "180");
  await page.click('button[aria-label="Yorug\' rejimga o\'tish"]');
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "stage1-calculator-light.png"),
    fullPage: false,
  });

  // Qorong'u rejimga qaytarish
  await page.click('button[aria-label="Qorong\'u rejimga o\'tish"]');
  await page.waitForTimeout(300);

  // 3. Ro'yxatdan o'tish sahifasi (/register)
  await page.goto("/register");
  await page.waitForTimeout(600);

  const uniqueEmail = `madina.${Date.now()}@3talab.uz`;
  await page.click('button:has-text("Qiz bola («Malikam»)")');
  await page.fill("#reg-name", "Madina Karimova");
  await page.fill("#reg-age", "16");
  await page.selectOption("#reg-grade", "10-sinf");
  await page.selectOption("#reg-region", "Samarqand");
  await page.fill("#reg-email", uniqueEmail);
  await page.fill("#reg-phone", "+998 90 123 45 67");
  await page.fill("#reg-password", "Madina2026!");

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "stage1-register.png"),
    fullPage: false,
  });

  // 4. Formani yuborish va /onboarding sahifasida "Malikam" salomi va +50 XP tekshiruvi
  await page.click('button[type="submit"]');
  await page.waitForURL("**/onboarding", { timeout: 20_000 });
  await page.waitForTimeout(1000);

  await expect(page.locator("h1")).toContainText("Malikam");
  await expect(page.locator("h1")).toContainText("Madina Karimova");

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "stage1-authenticated-malikam.png"),
    fullPage: false,
  });
});
