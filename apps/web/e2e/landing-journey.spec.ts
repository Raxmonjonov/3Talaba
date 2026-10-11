import { expect, test } from "./test";

test.describe("landing", () => {
  test("sections render without a 3D journey backdrop", async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", (error) => errors.push(error));

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);

    // Content stays intact without the fixed 3D backdrop.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator("footer a").first()).toBeVisible();

    // No journey canvas fixed behind the page.
    const journeyCanvas = page.locator(".fixed.inset-0 canvas").first();
    await expect(journeyCanvas).toHaveCount(0);

    expect(errors).toEqual([]);
  });
});
