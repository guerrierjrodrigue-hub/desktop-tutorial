import { test, expect } from "./fixtures";

// The AI coach (Barnabas) is disabled by default via COACH_ENABLED /
// NEXT_PUBLIC_COACH_ENABLED. These tests assert the off state; when the flag is
// turned back on, restore the picker/chat coverage from git history.
test.describe("AI coach disabled", () => {
  test("/coach redirects to the dashboard", async ({ page }) => {
    await page.goto("/coach");
    await expect(page).toHaveURL(/\/dashboard(\/|$|\?)/);
  });

  test("/coach/[coachId] redirects to the dashboard", async ({ page }) => {
    await page.goto("/coach/barnabas");
    await expect(page).toHaveURL(/\/dashboard(\/|$|\?)/);
  });

  test("the coach API 404s without invoking the model", async ({ request }) => {
    const chat = await request.post("/api/coach", {
      data: { coachId: "barnabas", messages: [{ role: "user", content: "hi" }] },
    });
    expect(chat.status()).toBe(404);

    const health = await request.get("/api/coach/health");
    expect(health.status()).toBe(404);
  });

  test("the sidebar shows no Coach link", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: /^coach$/i })).toHaveCount(0);
  });
});
