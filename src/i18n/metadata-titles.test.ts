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

/** Extract the `{...}` block starting at the first `{` at/after `from`. */
function braceBlock(src: string, from: number): string {
  const start = src.indexOf("{", from);
  if (start === -1) return "";
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) return src.slice(start, i + 1);
  }
  return src.slice(start);
}

/** The regions of a page that define page metadata (const + generateMetadata). */
function metadataRegions(src: string): string[] {
  const regions: string[] = [];
  const constIdx = src.indexOf("export const metadata");
  if (constIdx !== -1) regions.push(braceBlock(src, src.indexOf("=", constIdx)));
  const genIdx = src.indexOf("generateMetadata");
  if (genIdx !== -1) regions.push(braceBlock(src, genIdx));
  return regions;
}

// A metadata title must come from the dictionary (title: dict[...]), never a
// hardcoded string literal, so every page's tab title is translated.
describe("page metadata titles are localized", () => {
  const files = pageFiles(APP_DIR);

  it.each(files.map((f) => [relative(APP_DIR, f), f]))(
    "%s has no hardcoded metadata title",
    (_rel, file) => {
      const src = readFileSync(file, "utf8");
      for (const region of metadataRegions(src)) {
        expect(
          /\btitle:\s*"/.test(region),
          `hardcoded metadata title literal in ${relative(APP_DIR, file)}`,
        ).toBe(false);
      }
    },
  );
});
