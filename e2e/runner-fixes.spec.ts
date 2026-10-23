import { test, expect } from "./fixtures";

// Y2 runner-mode fixes. Demo mode: server actions are no-ops, so these verify
// the client paths (edit/delete a run optimistically, discovery card, profile
// setting) plus the accented, correct plan content rendered from the data.

test.describe("Running — edit and delete a run", () => {
  test("delete a run removes it, with a confirmation step", async ({ page }) => {
    await page.goto("/course");
    const rows = page.getByTestId("run-row");
    const before = await rows.count();
    expect(before).toBeGreaterThan(0);

    await rows.first().getByRole("button", { name: "Delete run" }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByTestId("run-row")).toHaveCount(before - 1);
  });

  test("edit a run updates its distance", async ({ page }) => {
    await page.goto("/course");
    await page.getByTestId("run-row").first().getByRole("button", { name: "Edit run" }).click();

    await page.getByLabel("Distance (km)").first().fill("7");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByTestId("run-row").first()).toContainText("7 km");
  });
});

test.describe("Running — discovery", () => {
  test("nav shows Running for everyone", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: "Running" }).first()).toBeVisible();
  });

  test("dashboard shows the runner-mode promo, which can be hidden", async ({ page }) => {
    await page.goto("/dashboard");
    const promo = page.getByText("New: runner mode");
    await expect(promo).toBeVisible();
    await expect(page.getByRole("link", { name: "Try it" })).toHaveAttribute("href", "/course");
    await page.getByRole("button", { name: "Hide" }).click();
    await expect(promo).toHaveCount(0);
  });

  test("profile has the main-activity setting", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByText("My main activity")).toBeVisible();
    const runningBtn = page.getByRole("button", { name: "Running", exact: true });
    await runningBtn.click();
    await expect(runningBtn).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("Running — plan content", () => {
  test("verse renders with French accents and three distinct sessions", async ({ page }) => {
    await page.goto("/");
    await page.context().addCookies([
      { name: "ka_locale", value: "fr", url: new URL(page.url()).origin },
    ]);
    await page.goto("/course/plans/c5k-8");

    await expect(page.getByText("Courez de manière à le remporter").first()).toBeVisible();
    await expect(page.getByText("Ésaïe 40.31").first()).toBeVisible();

    await expect(page.getByText("Footing facile").first()).toBeVisible();
    await expect(page.getByText("Séance de rythme").first()).toBeVisible();
    await expect(page.getByText("Sortie longue").first()).toBeVisible();
  });
});
