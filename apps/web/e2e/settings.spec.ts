import { expect, test, type Page } from "./test";

async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#firstName").fill("Sozlama");
  await page.locator("#email").fill(`sozlama-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("account settings", () => {
  test("profile update and password change work end to end", async ({ page }) => {
    await registerFreshUser(page);

    await page.getByRole("button", { name: "Hisob", exact: true }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole("heading", { name: "Hisob sozlamalari" })).toBeVisible({
      timeout: 15_000,
    });

    await page.locator("#firstName").fill("Yangi");
    await page.locator("#lastName").fill("Ism");
    await page.getByRole("button", { name: "Profilni saqlash" }).click();
    await expect(page.getByText("Saqlandi").first()).toBeVisible({ timeout: 15_000 });

    await page.locator("#currentPassword").fill("secret123");
    await page.locator("#newPassword").fill("secret456");
    await page.locator("#confirmPassword").fill("secret456");
    await page.getByRole("button", { name: "Parolni yangilash" }).click();
    await expect(page.getByText("Parol yangilandi")).toBeVisible({ timeout: 15_000 });

    // Wrong current password is rejected.
    await page.locator("#currentPassword").fill("wrong-pass");
    await page.locator("#newPassword").fill("secret789");
    await page.locator("#confirmPassword").fill("secret789");
    await page.getByRole("button", { name: "Parolni yangilash" }).click();
    await expect(page.getByText("Joriy parol noto'g'ri")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("Xush kelibsiz, Yangi")).toBeVisible({ timeout: 15_000 });
  });

  test("theme toggle switches dark mode and persists across pages", async ({ page }) => {
    await registerFreshUser(page);

    await expect(page.locator("html")).not.toHaveClass(/dark/);

    // Dashboard header toggle (sun/moon icon button).
    await page.getByRole("button", { name: "Qorong'u rejim" }).first().click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.getByRole("button", { name: "Hisob", exact: true }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.getByRole("button", { name: "Yorug' rejim" }).first().click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});
