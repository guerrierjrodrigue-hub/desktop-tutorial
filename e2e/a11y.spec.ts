import { test, expect } from "./fixtures";
import path from "node:path";

/**
 * Z3 Bloc C: axe-core accessibility scan of the public and auth pages. We fail
 * on serious/critical violations (the ones that block real users): missing form
 * labels, missing document landmarks, insufficient contrast, etc. axe-core is a
 * dependency already; we inject its browser bundle and run it in the page.
 */
const AXE = path.join(process.cwd(), "node_modules", "axe-core", "axe.min.js");

const PUBLIC_PAGES = ["/", "/pricing", "/privacy", "/terms"];
const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"];

type Violation = { id: string; impact: string | null; nodes: unknown[] };

async function seriousViolations(pagePath: string, page: import("@playwright/test").Page) {
  await page.goto(pagePath);
  await page.waitForLoadState("load");
  await page.addScriptTag({ path: AXE });
  const results = (await page.evaluate(async () => {
    // @ts-expect-error axe is injected onto window by the script tag above.
    return await window.axe.run(document, {
      resultTypes: ["violations"],
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
    });
  })) as { violations: Violation[] };
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

test.describe("Accessibility (axe)", () => {
  for (const p of [...PUBLIC_PAGES, ...AUTH_PAGES]) {
    test(`no serious/critical axe violations on ${p}`, async ({ page }) => {
      const violations = await seriousViolations(p, page);
      const summary = violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length})`).join("; ");
      expect(violations, `axe violations on ${p}: ${summary}`).toEqual([]);
    });
  }
});
