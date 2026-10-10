import { expect, test } from "./test";

test.describe("landing journey", () => {
  test("the scroll journey mounts its backdrop without touching the content", async ({
    page,
  }) => {
    // The journey scene is WebGL; the shared fixture keeps 3D off, so opt back in.
    await page.addInitScript(() => {
      try {
        localStorage.removeItem("3talab_3d");
      } catch {
        /* ignore */
      }
    });
    const errors: Error[] = [];
    page.on("pageerror", (error) => errors.push(error));

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const hasWebgl = await page.evaluate(() => {
      try {
        return !!document.createElement("canvas").getContext("webgl");
      } catch {
        return false;
      }
    });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(900);

    // The journey only ever decorates: headline, footer and links stay intact.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator("footer a").first()).toBeVisible();

    if (hasWebgl) {
      const backdrop = page.locator('[class*="-z-10"] canvas').first();
      await expect(backdrop).toBeVisible({ timeout: 8_000 });

      const box = await backdrop.boundingBox();
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
    }

    expect(errors).toEqual([]);
  });
});
