import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * i18n guard: the interactive app components below are fully translated and must
 * stay that way. This test fails on any hardcoded, user-facing English (or any
 * untranslated literal) that creeps back into a JSX text node, `aria-label`,
 * `placeholder`, `title` or `alt` — anything a user reads should come from the
 * dictionary (`dict[...]`), i.e. a JSX expression, never a bare string literal.
 *
 * Proper nouns, product names and bare units are allowed via ALLOW.
 */

const COMPONENTS_DIR = join(__dirname, "..", "components");

// Files whose user-facing copy must be 100% dictionary-driven.
const GUARDED_FILES = [
  "nutrition/hydration-tracker.tsx",
  "nutrition/food-logger.tsx",
  "community/post-composer.tsx",
  "spiritual/reading-plans.tsx",
  "spiritual/prayer-journal.tsx",
  "habits/habits-list.tsx",
  "profile/profile-editor.tsx",
  "coach/coach-chat.tsx",
  "layout/topbar.tsx",
];

// Proper nouns, brand/product names and bare units are not translatable.
const ALLOW = new Set([
  "ml",
  "kcal",
  "km",
  "kg",
  "xp",
  "json",
  "kingdom",
  "athlete",
  "barnabas",
  "instagram",
  "google",
  "premium",
]);

/** Strip line and block comments so commented-out copy doesn't trip the scan. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

/** Words (len >= 2) that are not in the proper-noun/unit allowlist. */
function offendingWords(text: string): string[] {
  const words = text.match(/[A-Za-zÀ-ÿ]{2,}/g) ?? [];
  return words.filter((w) => !ALLOW.has(w.toLowerCase()));
}

// Heuristic: skip captures that are obviously code (TS generics, expressions)
// rather than rendered text.
const LOOKS_LIKE_CODE = /[;{}()=]|=>|\|\||&&|<\/|\/>|\.\w|,\s*$|^\s*,/;

function findHardcoded(src: string): string[] {
  const clean = stripComments(src);
  const hits: string[] = [];

  // JSX text nodes: `>some text<` with no braces (a `{dict[...]}` expression is fine).
  // The negative lookbehind skips the `>` of an arrow (`=>`) so type signatures
  // like `() => Promise<void>` aren't mistaken for rendered text.
  for (const m of clean.matchAll(/(?<!=)>([^<>{}]+)</g)) {
    const text = m[1].replace(/\s+/g, " ").trim();
    if (!text || LOOKS_LIKE_CODE.test(text)) continue;
    const bad = offendingWords(text);
    if (bad.length) hits.push(`text ${JSON.stringify(text)}`);
  }

  // User-facing string-literal attributes (dict-driven ones use `={...}`, not `"..."`).
  for (const m of clean.matchAll(/\b(aria-label|placeholder|title|alt)\s*=\s*"([^"]*)"/g)) {
    const bad = offendingWords(m[2]);
    if (bad.length) hits.push(`${m[1]} ${JSON.stringify(m[2])}`);
  }

  return hits;
}

describe("translated components have no hardcoded user-facing strings", () => {
  it.each(GUARDED_FILES)("%s is fully dictionary-driven", (relPath) => {
    const src = readFileSync(join(COMPONENTS_DIR, relPath), "utf8");
    const hits = findHardcoded(src);
    expect(hits, `${relPath} has untranslated literals:\n  ${hits.join("\n  ")}`).toEqual([]);
  });
});
