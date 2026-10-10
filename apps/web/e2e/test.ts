// oxlint-disable react-hooks/rules-of-hooks -- Playwright fixture API, not React
import { test as base, expect } from "@playwright/test";

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
      } catch {
        /* private mode — specs that need 3D can still force it */
      }
    });
    await use(page);
  },
});

export { expect };
