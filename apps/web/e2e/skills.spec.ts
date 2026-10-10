import { expect, test, type Page } from "./test";

async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#firstName").fill("Mavzu");
  await page.locator("#email").fill(`mavzu-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("skills map", () => {
  test("dashboard lists subjects and weak-filter works", async ({ page }) => {
    await registerFreshUser(page);

    await page.getByRole("button", { name: "Mavzular" }).click();
    await expect(page).toHaveURL(/\/skills$/);
    await expect(page.getByRole("heading", { name: "Mavzular" })).toBeVisible({
      timeout: 15_000,
    });

    // Seed has subject skills with progress bars.
    await expect(page.getByRole("progressbar").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();

    // Weak filter: empty state is fine for a brand-new user.
    await page.getByRole("button", { name: "Zaiflar" }).click();
    await expect(
      page.getByText(/zaif mavzu yo‘q|zaif mavzu yo'q|Mavzu topilmadi/i),
    ).toBeVisible({ timeout: 15_000 });

    // Subject drill from the map.
    await page.getByRole("button", { name: "Barchasi" }).click();
    await page.getByRole("button", { name: /mashqi$/ }).first().click();
    await expect(page).toHaveURL(/\/practice\?subject=/);
    await expect(page.getByRole("heading", { name: "Mashq" })).toBeVisible({
      timeout: 15_000,
    });
  });
});
