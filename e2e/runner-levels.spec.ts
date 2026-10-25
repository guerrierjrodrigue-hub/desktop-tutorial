import { test, expect } from "./fixtures";

// Y3 runner mode for all levels. Demo mode behaves like a signed-in user on mock
// data with the onboarding already answered (level "new", goal "10k"), so the
// overview shows a recommendation and the tools work on the client path.

test.describe("Running — levels, recommendation and caution", () => {
  test("the overview shows the caution and a recommended plan", async ({ page }) => {
    await page.goto("/course");
    await expect(
      page.getByText("If you are starting out or have any health concern, check with a professional before you begin."),
    ).toBeVisible();
    await expect(page.getByText("Your recommended plan")).toBeVisible();
    await expect(page.getByRole("link", { name: "View plan" })).toBeVisible();
  });

  test("the start page asks the two questions with the caution", async ({ page }) => {
    await page.goto("/course/demarrer");
    await expect(page.getByText("Where are you today?")).toBeVisible();
    await expect(page.getByText("What is your goal?")).toBeVisible();
    await expect(page.getByRole("button", { name: "I have never run" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Half marathon" })).toBeVisible();
    await expect(
      page.getByText("If you are starting out or have any health concern, check with a professional before you begin."),
    ).toBeVisible();
  });
});

test.describe("Running — new tools", () => {
  test("training paces estimate from a recent time", async ({ page }) => {
    await page.goto("/course/outils");
    await page.getByLabel("Race distance (km)").fill("5");
    // The training-paces card is the 3rd Minutes field (pace calc, Riegel, paces).
    await page.getByLabel("Minutes", { exact: true }).nth(2).fill("25");
    await expect(page.getByTestId("paces-result")).toBeVisible();
    await expect(page.getByTestId("paces-result")).toContainText("per km");
  });

  test("race countdown computes the required pace for a target time", async ({ page }) => {
    await page.goto("/course/outils");
    await expect(page.getByText("Race countdown")).toBeVisible();
    await expect(page.getByLabel("Race date")).toBeVisible();
    // Target time -> required pace uses number inputs. 10 km in 50:00 = 5:00 /km.
    await page.getByLabel("Goal distance (km)").fill("10");
    await page.getByLabel("Minutes", { exact: true }).nth(3).fill("50");
    await expect(page.getByText("Required pace")).toBeVisible();
    await expect(page.getByText("5:00")).toBeVisible();
  });

  test("the interval builder loads a session into the timer", async ({ page }) => {
    await page.goto("/course/outils");
    await page.getByLabel("Repetitions").fill("4");
    await page.getByLabel("Seconds per rep").fill("60");
    await page.getByLabel("Recovery (seconds)").fill("90");
    await page.getByRole("button", { name: "Load into the timer" }).click();
    await expect(page.getByRole("button", { name: "Start", exact: true })).toBeVisible();
    await expect(page.getByText("Keep your screen on for the whole session.")).toBeVisible();
  });

  test("the shoe wear tracker renders", async ({ page }) => {
    await page.goto("/course/outils");
    await expect(page.getByText("Shoe wear")).toBeVisible();
    await expect(page.getByLabel("Pair name")).toBeVisible();
  });

  test("GPX upload shows a preview before saving", async ({ page }) => {
    await page.goto("/course/nouvelle");
    await expect(page.getByText("Import a GPX file")).toBeVisible();

    // A small GPX dated yesterday (~2 km over 15 min) built at run time so it
    // always stays inside the 30-day window.
    const d = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const gpx = `<?xml version="1.0"?>
<gpx version="1.1" creator="e2e"><trk><trkseg>
<trkpt lat="48.0000" lon="2.0000"><time>${d}T06:00:00Z</time></trkpt>
<trkpt lat="48.0180" lon="2.0000"><time>${d}T06:15:00Z</time></trkpt>
</trkseg></trk></gpx>`;

    await page.locator("#gpx-file").setInputFiles({
      name: "run.gpx",
      mimeType: "application/gpx+xml",
      buffer: Buffer.from(gpx, "utf8"),
    });

    // Preview appears with the read date; nothing is saved yet.
    const preview = page.getByTestId("gpx-preview");
    await expect(preview).toBeVisible();
    await expect(preview).toContainText(d);
    await expect(page.getByRole("button", { name: "Import this run" })).toBeVisible();

    // Confirming saves (demo mode is a no-op but the UI confirms success).
    await page.getByRole("button", { name: "Import this run" }).click();
    await expect(page.getByText("Run imported.")).toBeVisible();
  });
});
