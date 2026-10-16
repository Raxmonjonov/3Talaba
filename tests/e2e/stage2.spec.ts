import { test, expect } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR =
  "C:/Users/User/.gemini/antigravity/brain/295078d0-53fa-4c39-8131-943257d933f1";

test("Bosqich 2: 4 qadamli Onboarding, Adaptiv Placement Test va Natija Grafiklari", async ({
  page,
}) => {
  // 1. Yangi foydalanuvchini ro'yxatdan o'tkazib /onboarding sahifasiga o'tish
  await page.goto("/register");
  const uniqueEmail = `sardor.${Date.now()}@3talab.uz`;
  await page.click('button:has-text("O\'g\'il bola («Shag\'zodam»)")');
  await page.fill("#reg-name", "Sardor Alimov");
  await page.fill("#reg-age", "17");
  await page.selectOption("#reg-grade", "11-sinf");
  await page.selectOption("#reg-region", "Toshkent sh.");
  await page.fill("#reg-email", uniqueEmail);
  await page.fill("#reg-password", "Sardor2026!");
  await page.click('button[type="submit"]');

  await page.waitForURL("**/onboarding", { timeout: 20_000 });
  await page.waitForTimeout(1000); // XP sanalishi tugashini kutish

  // 1-qadam skrinshoti (Maqsadli OTM va SAT/IELTS ball)
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "stage2-onboarding-step1.png"),
    fullPage: false,
  });

  // 2, 3, 4-qadamlardan o'tish
  await page.click("#onboarding-next-btn");
  await page.waitForTimeout(350);
  await page.click("#onboarding-next-btn");
  await page.waitForTimeout(350);
  await page.click("#onboarding-next-btn");
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "stage2-onboarding-step4.png"),
    fullPage: false,
  });

  // Onboardingni yakunlab /placement sahifasiga o'tish
  await page.click("#onboarding-finish-btn");
  await page.waitForURL("**/placement", { timeout: 20_000 });
  await page.waitForTimeout(700);

  // 1-savol (pm-fm-2: to'g'ri javob C) — yashil porlash va Socratic xabar skrinshoti
  await page.click('button[data-option-id="C"]');
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "stage2-placement-adaptive.png"),
    fullPage: false,
  });

  // Qolgan savollardan namuna yechish (turli fanlarda darajani ko'rsatish uchun)
  for (const ans of ["B", "B", "B", "B", "A", "B", "C", "C"]) {
    await page.click("#placement-next-btn");
    await page.waitForTimeout(250);
    await page.click(`button[data-option-id="${ans}"]`);
    await page.waitForTimeout(250);
  }

  // Natijani hisoblash va /placement/result sahifasiga o'tish
  await page.click("#placement-quick-finish-btn");
  await page.waitForURL("**/placement/result", { timeout: 20_000 });
  await page.waitForTimeout(1400); // SVG Radar va Mastery Bar animatsiyalari uchun

  await expect(page.locator("h1")).toContainText("Shag'zodam");
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "stage2-placement-result.png"),
    fullPage: false,
  });
});
