import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const APP_DIR = join(__dirname, "..", "app");

function pageFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) pageFiles(full, out);
    else if (name === "page.tsx") out.push(full);
  }
  return out;
}

// A <Topbar title=...> must come from the dictionary (or dynamic content like a
// coach/program name), never a hardcoded English string literal — otherwise the
// sticky page title is untranslated ("Community", "Coach", "Profile", …).
describe("topbar titles are not hardcoded literals", () => {
  const files = pageFiles(APP_DIR);
  const literal = /<Topbar\b[^>]*\btitle=\s*"/;

  it.each(files.map((f) => [relative(APP_DIR, f), f]))(
    "%s has no literal Topbar title",
    (_rel, file) => {
      const src = readFileSync(file, "utf8");
      expect(
        literal.test(src),
        `hardcoded <Topbar title="..."> literal in ${relative(APP_DIR, file)}`,
      ).toBe(false);
    },
  );
});
