import { expect, test } from "@playwright/test";

test.describe("auth pages resolve their language", () => {
  test("?locale= renders that language", async ({ page }) => {
    await page.goto("/login?locale=ru");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator('label[for="password"]')).toHaveText("Пароль");
    await expect(page.getByRole("button", { name: "Войти" })).toBeVisible();
    await expect(page.getByText("Спокойная, терпеливая")).toBeVisible();
  });

  test("the switcher updates the copy, the URL and the cross link", async ({ page }) => {
    await page.goto("/login?locale=ru");
    await page.getByRole("button", { name: "English" }).click();

    await expect(page).toHaveURL(/locale=en/);
    await expect(page.locator('label[for="password"]')).toHaveText("Password");
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
    await expect(page.locator('a[href="/register?locale=en"]')).toBeVisible();
  });

  test("register honours the stored preference without a query", async ({ page }) => {
    await page.goto("/login?locale=ru");
    await page.getByRole("button", { name: "English" }).click();
    await page.goto("/register");

    await expect(page.locator('label[for="firstName"]')).toHaveText("First name");
    await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  test("register copy switches to Russian with the goals and gender", async ({ page }) => {
    await page.goto("/register?locale=ru");
    await expect(page.locator('label[for="firstName"]')).toHaveText("Имя");
    await expect(page.getByRole("button", { name: "Мужчина" })).toBeVisible();
    await expect(page.getByText("Поступление в вуз")).toBeVisible();
    await expect(page.getByRole("button", { name: "Продолжить" })).toBeDisabled();
  });

  test("landing links carry the locale into the auth pages", async ({ page }) => {
    await page.goto("/en");
    const href = await page.locator('a[href*="/login"]').first().getAttribute("href");
    expect(href).toBe("/login?locale=en");
  });
});
