import { expect, test, type Page } from "./test";

async function registerFreshUser(page: Page): Promise<void> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  await page.goto("/register");
  await page.locator("#firstName").waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("#firstName").fill("Usul");
  await page.locator("#email").fill(`usul-${unique}@3talab.test`);
  await page.locator("#password").fill("secret123");
  await page.locator('form button[aria-pressed]').nth(2).click();
  await page.locator('form button:not([type="button"])').click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("study methods hub", () => {
  test("lists the applied methods and links to where each is used", async ({
    page,
  }) => {
    await registerFreshUser(page);

    await page.getByRole("button", { name: "Usullar", exact: true }).click();
    await expect(page).toHaveURL(/\/methods$/, { timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: /O.quv usullari/ })
    ).toBeVisible({ timeout: 15_000 });

    // Methods from different groups are present.
    await expect(
      page.getByRole("heading", { name: "Interval takrorlash (FSRS)" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Feynman texnikasi" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Xato tahlili/ })
    ).toBeVisible();

    // A method's button navigates to its feature.
    await page.getByRole("button", { name: "Konspektlarni ochish" }).click();
    await expect(page).toHaveURL(/\/notes$/, { timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: "Konspektlar" })
    ).toBeVisible({ timeout: 15_000 });
  });
});
