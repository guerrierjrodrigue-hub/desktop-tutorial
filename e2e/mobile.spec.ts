import { test, expect } from "./fixtures";

// Every protected page, in demo mode, must fit a phone viewport without a
// horizontal scrollbar. Runs under the mobile-390 and mobile-360 projects, and
// attaches a full-page screenshot of each page as a CI artifact.
const ROUTES: { path: string; name: string }[] = [
  { path: "/dashboard", name: "dashboard" },
  { path: "/fitness", name: "fitness" },
  { path: "/fitness/foundations-of-strength", name: "fitness-program" },
  { path: "/fitness/foundations-of-strength/session/w1-d1", name: "fitness-session" },
  { path: "/habits", name: "habits" },
  { path: "/journal", name: "journal" },
  { path: "/nutrition", name: "nutrition" },
  { path: "/spiritual", name: "spiritual" },
  { path: "/spiritual/bible", name: "bible" },
  { path: "/community", name: "community" },
  { path: "/community/rules", name: "community-rules" },
  { path: "/challenges", name: "challenges" },
  { path: "/coach", name: "coach" },
  { path: "/coach/barnabas", name: "coach-chat" },
  { path: "/focus", name: "focus" },
  { path: "/profile", name: "profile" },
];

test.describe("Mobile — no horizontal overflow on protected pages", () => {
  for (const route of ROUTES) {
    test(route.name, async ({ page }, testInfo) => {
      await page.goto(route.path);
      await page.waitForLoadState("load");
      // Let fonts/layout settle so measurements are stable.
      await page.waitForTimeout(250);

      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));

      await testInfo.attach(`${testInfo.project.name}-${route.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      expect(
        scrollWidth,
        `horizontal overflow on ${route.path} (${scrollWidth}px > ${innerWidth}px)`,
      ).toBeLessThanOrEqual(innerWidth + 1);
    });
  }
});
