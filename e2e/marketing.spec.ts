import { test, expect } from "@playwright/test";

test.describe("Marketing", () => {
  test("landing hero and primary CTA render", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /grow your faith/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /start your .*free trial/i }),
    ).toBeVisible();
  });

  test("pricing shows the three plans", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: "Seeker" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Disciple" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Legacy" })).toBeVisible();
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
