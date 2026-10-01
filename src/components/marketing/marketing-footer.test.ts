import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { footerColumns } from "./marketing-footer";

const APP_DIR = join(__dirname, "..", "..", "app");

/** Map every `page.tsx` under src/app to its public URL (route groups stripped). */
function collectRoutes(dir: string, routes = new Map<string, string>()) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      collectRoutes(full, routes);
    } else if (name === "page.tsx") {
      const segments = relative(APP_DIR, dir)
        .split(sep)
        .filter((s) => s && !/^\(.*\)$/.test(s));
      routes.set("/" + segments.join("/"), full);
    }
  }
  return routes;
}

const routes = collectRoutes(APP_DIR);
const links = footerColumns.flatMap((col) => col.links);

// Guards against shipping a footer link that 404s in production.
describe("marketing footer links", () => {
  it.each(links.map((l) => [l.label, l.href]))("%s (%s) has a page", (_label, href) => {
    const [path, hash] = href.split("#");
    const page = routes.get(path || "/");
    expect(page, `no page.tsx for ${path}`).toBeDefined();
    if (hash) {
      expect(readFileSync(page!, "utf8"), `no id="${hash}" on ${path}`).toContain(
        `id="${hash}"`,
      );
    }
  });
});
