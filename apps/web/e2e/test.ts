// oxlint-disable react-hooks/rules-of-hooks -- Playwright fixture API, not React
import { test as base, expect, type Page } from "@playwright/test";

/**
 * Every suite shares one Chrome process. Dashboard/placement/landing scenes
 * each grab a WebGL context, and Chrome starts refusing (or hanging on) new
 * canvases after enough of them. E2E does not assert pixel output of the 3D
 * layers, so the shared fixture turns the student-facing 3D switch off up
 * front; CSS fallbacks keep every selector the specs rely on.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("3talab_3d", "off");
        // Start from a known light theme so theme tests do not depend on the
        // host OS preference.
        localStorage.setItem("3talab_theme", "light");
      } catch {
        /* private mode — specs that need 3D can still force it */
      }
    });
    await use(page);
  },
});

/**
 * Answers whatever the current Practice/Placement card shows.
 * Free-text (NUMERIC) cards have a single disabled submit until the input
 * is filled; choice cards keep the old "last option" click.
 */
export async function answerCurrentQuestion(page: Page): Promise<void> {
  const freeInput = page.getByRole("textbox", { name: "Javob" });
  if (await freeInput.isVisible().catch(() => false)) {
    await freeInput.fill("1");
    await page.getByRole("button", { name: "Yuborish" }).click();
    return;
  }
  const options = page.locator(".auth-card button:not([type='submit'])");
  await expect(options.first()).toBeVisible({ timeout: 15_000 });
  const count = await options.count();
  await options.nth(count - 1).click();
}

export { expect };
