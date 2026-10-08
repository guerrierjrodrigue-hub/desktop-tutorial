import { test, expect } from "./fixtures";

// Runs against the "guard" project, where Supabase is configured but
// unreachable, so the middleware guards protected routes.
test.describe("Auth guard", () => {
  test("anonymous visit to a protected route redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard$/);
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  });

  test("the login redirect preserves the originally requested path", async ({ page }) => {
    await page.goto("/nutrition");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fnutrition$/);
  });
});
