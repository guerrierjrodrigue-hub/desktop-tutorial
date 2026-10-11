import { test, expect } from "./fixtures";

// Demo mode behaves like a signed-in user on mock data. Opening an invite must
// NOT join on its own (a GET must not mutate): it shows a confirmation, and the
// join happens only when the confirmation form is submitted (POST).
test.describe("Cohort invite (/join/<code>)", () => {
  const confirmButton = 'form[action*="/go"] button[type="submit"]';

  test("opening an invite shows a confirmation and does not auto-join", async ({ page }) => {
    await page.goto("/join/cohort21");
    // No redirect: a GET to the invite never mutates or navigates away.
    await expect(page).toHaveURL(/\/join\/cohort21\b/);
    await expect(page.locator(confirmButton)).toBeVisible();
    await expect(
      page.getByText(/error occurred in the Server Components render/i),
    ).toHaveCount(0);
  });

  test("confirming the invite joins and lands on /challenges (idempotent)", async ({ page }) => {
    await page.goto("/join/cohort21");
    await page.locator(confirmButton).click();
    await expect(page).toHaveURL(/\/challenges\b/);

    // Re-open and confirm again — the join is idempotent, still lands cleanly.
    await page.goto("/join/cohort21?ref=11111111-1111-4111-8111-111111111111");
    await page.locator(confirmButton).click();
    await expect(page).toHaveURL(/\/challenges\b/);
  });
});
