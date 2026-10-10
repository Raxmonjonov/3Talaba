import { expect, test } from "./test";

test.describe("legal pages", () => {
  test("privacy and terms render from the footer routes", async ({ page }) => {
    await page.goto("/privacy");
    await expect(
      page.getByRole("heading", { name: "Maxfiylik siyosati" })
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, follow"
    );
    await expect(page.getByRole("link", { name: "Bosh sahifa" })).toBeVisible();

    await page.goto("/terms");
    await expect(
      page.getByRole("heading", { name: "Foydalanish shartlari" })
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, follow"
    );
  });

  test("landing footer links reach the legal pages", async ({ page }) => {
    await page.goto("/uz");
    await page.getByRole("link", { name: "Maxfiylik siyosati" }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(
      page.getByRole("heading", { name: "Maxfiylik siyosati" })
    ).toBeVisible();

    await page.getByRole("link", { name: "Bosh sahifa" }).click();
    await expect(page).toHaveURL(/\/uz$/);
    await page.getByRole("link", { name: "Foydalanish shartlari" }).click();
    await expect(page).toHaveURL(/\/terms$/);
    await expect(
      page.getByRole("heading", { name: "Foydalanish shartlari" })
    ).toBeVisible();
  });
});
