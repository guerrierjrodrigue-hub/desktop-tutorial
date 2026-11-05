import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { PROTECTED } from "@/lib/supabase/middleware";

/**
 * Launch guard (Z3 / D-26): every page under the (app) and (admin) route groups
 * is private and must be covered by a prefix in middleware's PROTECTED list.
 * This test walks src/app, computes each page's URL path (dropping the
 * (group) segments), and fails if any such page is not protected — which is how
 * /course slipped through and answered 200 to anonymous visitors.
 */

const APP_DIR = join(process.cwd(), "src", "app");
const PRIVATE_GROUPS = ["(app)", "(admin)"];

/** Collect the URL paths of every page.tsx under the given route group. */
function pagePathsUnder(group: string): string[] {
  const root = join(APP_DIR, group);
  const paths: string[] = [];

  function walk(dir: string, urlSegments: string[]) {
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isFile() && entry.name === "page.tsx") {
        paths.push("/" + urlSegments.join("/"));
      }
      if (entry.isDirectory()) {
        // Route groups "(x)" and parallel/intercept segments don't add to the URL.
        const seg = entry.name;
        const isGroup = seg.startsWith("(") && seg.endsWith(")");
        walk(join(dir, seg), isGroup ? urlSegments : [...urlSegments, seg]);
      }
    }
  }

  walk(root, []);
  return paths;
}

function isProtected(urlPath: string): boolean {
  return PROTECTED.some((p) => urlPath === p || urlPath.startsWith(p + "/"));
}

describe("every (app)/(admin) page is covered by a PROTECTED prefix", () => {
  const pages = PRIVATE_GROUPS.flatMap(pagePathsUnder);

  it("finds the private pages (sanity)", () => {
    expect(pages.length).toBeGreaterThan(5);
    expect(pages).toContain("/course");
  });

  for (const group of PRIVATE_GROUPS) {
    it(`covers every page under src/app/${group}`, () => {
      const uncovered = pagePathsUnder(group).filter((p) => !isProtected(p));
      expect(
        uncovered,
        `private pages not covered by a PROTECTED prefix: ${uncovered.join(", ")}`,
      ).toEqual([]);
    });
  }
});
