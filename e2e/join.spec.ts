import { test, expect } from "./fixtures";

// Demo mode behaves like a signed-in user on mock data, so opening an invite
// runs the full page → /go handler → /challenges redirect (the path that
// previously crashed with a Server Components render error when signed in).
test.describe("Cohort invite (/join/<code>)", () => {
  test("opening an invite lands on /challenges with no render error", async ({ page }) => {
    await page.goto("/join/cohort21");
    await expect(page).toHaveURL(/\/challenges\b/);
    await expect(
      page.getByText(/error occurred in the Server Components render/i),
    ).toHaveCount(0);
  });

  test("re-opening the same invite still lands cleanly (idempotent)", async ({ page }) => {
    await page.goto("/join/cohort21");
    await expect(page).toHaveURL(/\/challenges\b/);
    await page.goto("/join/cohort21?ref=11111111-1111-4111-8111-111111111111");
    await expect(page).toHaveURL(/\/challenges\b/);
  });
});
