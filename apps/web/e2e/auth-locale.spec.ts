import { expect, test } from "./test";

test.describe("auth pages resolve their language", () => {
  test("?locale= renders that language", async ({ page }) => {
    await page.goto("/login?locale=ru");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator('label[for="password"]')).toHaveText("Пароль");
    await expect(page.getByRole("button", { name: "Войти" })).toBeVisible();
    await expect(page.getByText("Спокойная, терпеливая")).toBeVisible();

    // Head follows the content language.
    await expect(page).toHaveTitle("Войти   —   3Talab");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, follow"
    );
  });

  test("the switcher updates the copy, the URL and the cross link", async ({ page }) => {
    await page.goto("/login?locale=ru");
    // The switcher button has a CSS transition; force-click past the animation wait.
    await page.getByRole("button", { name: "English" }).click({ force: true });

    await expect(page).toHaveURL(/locale=en/);
    await expect(page.locator('label[for="password"]')).toHaveText("Password");
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
    await expect(page.locator('a[href="/register?locale=en"]')).toBeVisible();
    await expect(page).toHaveTitle("Log in   —   3Talab");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("landing returns robots to index, follow", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, follow"
    );
    await page.goto("/uz");
    // SEO meta is re-injected by the landing component; give it time to mount.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index, follow",
      { timeout: 10_000 }
    );
  });

  test("register honours the stored preference without a query", async ({ page }) => {
    await page.goto("/login?locale=ru");
    await page.getByRole("button", { name: "English" }).click({ force: true });
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

  test("the switcher never covers the form on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/register");
    const switcher = await page.locator(".bg-surface").first().boundingBox();
    const form = await page.locator("form").boundingBox();

    expect(switcher).not.toBeNull();
    expect(form).not.toBeNull();
    // The pill floats top-right; the whole form must start below it.
    const switcherBottom = switcher!.y + switcher!.height;
    expect(form!.y).toBeGreaterThanOrEqual(switcherBottom);
  });
});
