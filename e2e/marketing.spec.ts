import { test, expect } from "./fixtures";

test.describe("Marketing", () => {
  test("landing hero and primary CTA render", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /grow your faith/i }),
    ).toBeVisible();
    // Free-beta mode (APP_FREE_MODE) shows the "try it free" CTA.
    await expect(
      page.getByRole("link", { name: /try it free/i }),
    ).toBeVisible();
  });

  test("pricing shows the free-beta banner", async ({ page }) => {
    // During the free beta (APP_FREE_MODE) the paid plans are replaced by a
    // single "everything is free" banner. The badge text also appears in the
    // footer, so scope the banner assertions to <main>.
    await page.goto("/pricing");
    const main = page.getByRole("main");
    await expect(main.getByText(/free beta version/i)).toBeVisible();
    await expect(main.getByText(/free unlimited access/i)).toBeVisible();
    await expect(
      main.getByRole("link", { name: /get started/i }),
    ).toBeVisible();
  });

  test("sign in link leads to the login screen", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
  });
});
