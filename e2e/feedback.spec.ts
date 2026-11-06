import { test, expect } from "./fixtures";

/**
 * Z3 Bloc D: a signed-in user can send beta feedback and sees a confirmation.
 * Runs in demo mode (sendFeedback is a no-op that returns success), so the
 * flow is exercised end to end without a real backend.
 */
test.describe("Feedback", () => {
  test("submits feedback and shows the thank-you confirmation", async ({ page }) => {
    await page.goto("/feedback");
    await page.waitForLoadState("load");

    // The form renders with a labelled textarea and a type chooser.
    await expect(page.getByRole("heading", { name: "Send feedback" })).toBeVisible();

    // Pick a kind, then write a message.
    await page.getByRole("button", { name: "Idea" }).click();
    await page.getByLabel("Your message").fill("The streak counter could celebrate milestones.");

    // Send is enabled once the message is long enough.
    const send = page.getByRole("button", { name: "Send", exact: true });
    await expect(send).toBeEnabled();
    await send.click();

    // Confirmation replaces the form.
    await expect(page.getByRole("heading", { name: "Thank you!" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send another" })).toBeVisible();
  });

  test("keeps Send disabled until the message is long enough", async ({ page }) => {
    await page.goto("/feedback");
    await page.waitForLoadState("load");

    const send = page.getByRole("button", { name: "Send", exact: true });
    await expect(send).toBeDisabled();

    await page.getByLabel("Your message").fill("hi");
    await expect(send).toBeDisabled();

    await page.getByLabel("Your message").fill("a proper message");
    await expect(send).toBeEnabled();
  });
});
