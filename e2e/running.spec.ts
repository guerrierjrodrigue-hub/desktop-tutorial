import { test, expect } from "./fixtures";

// Y1 runner mode. Demo mode behaves like a signed-in user on mock data: the
// server actions are no-ops, so these specs verify the client path (entry ->
// visible in the list), the plans + timer navigation, and the pace/prediction
// tools. The XP-once guarantee lives in the ka_xp_run DB trigger and is checked
// directly against the database as part of the release.

test.describe("Running — log a run and see it in the list", () => {
  test("entering a run shows it with its pace", async ({ page }) => {
    await page.goto("/course/nouvelle");

    await page.getByLabel("Distance (km)").fill("5");
    await page.getByLabel("Minutes", { exact: true }).fill("30");
    await page.getByRole("button", { name: "Save run" }).click();

    // The just-logged run appears in the on-page list with its distance + pace.
    const row = page.getByTestId("added-run");
    await expect(row).toBeVisible();
    await expect(row).toContainText("5 km");
    await expect(row).toContainText("6:00"); // 30:00 over 5 km = 6:00 /km
  });
});

test.describe("Running — overview, plans and timer", () => {
  test("the overview lists runs and records", async ({ page }) => {
    await page.goto("/course");
    await expect(page.getByRole("heading", { name: "Running" }).first()).toBeVisible();
    await expect(page.getByText("Personal records")).toBeVisible();
    // Demo seeds several runs.
    await expect(page.getByTestId("run-row").first()).toBeVisible();
  });

  test("a plan opens to weeks with a verse, and a session starts the timer", async ({ page }) => {
    await page.goto("/course/plans");
    await page.getByRole("link", { name: /5k in 8 weeks/ }).click();

    // Plan detail shows the weekly verse and sessions.
    await expect(page.getByText("Verse of the week").first()).toBeVisible();
    await expect(page.getByText("Week 1")).toBeVisible();

    // Starting a session opens the interval timer.
    await page.getByRole("link", { name: "Start timer" }).first().click();
    await expect(page.getByRole("button", { name: "Start", exact: true })).toBeVisible();
    await expect(page.getByText("Keep your screen on for the whole session.")).toBeVisible();
  });
});

test.describe("Running — tools", () => {
  test("pace calculator and Riegel prediction", async ({ page }) => {
    await page.goto("/course/outils");

    // Pace: 5 km in 30 min -> 6:00 /km (first Minutes field is the pace calc).
    await page.getByLabel("Distance (km)", { exact: true }).fill("5");
    await page.getByLabel("Minutes", { exact: true }).nth(0).fill("30");
    await expect(page.getByTestId("pace-result")).toContainText("6:00");

    // Riegel: 5 km in 25:00, target 10 km -> ~52:07 (second Minutes field).
    await page.getByLabel("Recent distance (km)").fill("5");
    await page.getByLabel("Minutes", { exact: true }).nth(1).fill("25");
    await page.getByLabel("Target distance (km)").fill("10");
    await expect(page.getByTestId("predict-result")).toContainText("52:07");
  });
});
