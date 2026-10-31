import { test, expect } from "./fixtures";

// A1: the onboarding wizard asks for the activity mode first, then branches into
// the mode-specific questions. Runs in demo mode (saveOnboarding is a no-op), so
// it exercises the client-side branching without a backend.
test.describe("Onboarding — mode choice first, then branches", () => {
  test("mode step is first and shows both cards plus a discreet 'both'", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByRole("heading", { name: "How do you train?" })).toBeVisible();
    await expect(page.getByRole("button", { name: "I run" })).toBeVisible();
    await expect(page.getByRole("button", { name: "I train with weights" })).toBeVisible();
    await expect(page.getByRole("button", { name: "I do both" })).toBeVisible();
  });

  test("choosing running leads to the two running questions", async ({ page }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: "I run" }).click();
    await expect(page.getByText("Where are you today?")).toBeVisible();
    await expect(page.getByText("What is your goal?")).toBeVisible();
    // No strength goals step on the running-only path.
    await expect(page.getByRole("heading", { name: "What are your primary goals?" })).toHaveCount(0);
  });

  test("choosing strength leads to the strength goals question", async ({ page }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: "I train with weights" }).click();
    await expect(page.getByRole("heading", { name: "What are your primary goals?" })).toBeVisible();
    // No running questions on the strength-only path.
    await expect(page.getByText("Where are you today?")).toHaveCount(0);
  });

  test("the common spiritual step is reachable for a runner", async ({ page }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: "I run" }).click();
    // Answer the two running questions, then Continue to the spiritual step.
    await page.getByRole("button", { name: "I have never run" }).click();
    await page.getByRole("button", { name: "Run 5 km" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Your spiritual rhythm" })).toBeVisible();
    await expect(page.getByLabel(/Favorite verse/i)).toBeVisible();
  });
});

// The menu shows both pillars for a demo (unset) account, which is treated as
// "both" for discoverability.
test.describe("Navigation — both pillars visible in demo", () => {
  test("sidebar lists Running and Fitness", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/dashboard");
    const aside = page.locator("aside").first();
    await expect(aside.getByRole("link", { name: "Fitness" })).toBeVisible();
    await expect(aside.getByRole("link", { name: "Running" })).toBeVisible();
  });
});
