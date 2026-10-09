import { describe, it, expect } from "vitest";
import fr from "./fr";

// R3 — the French voice of the app is tutoiement ("tu"), never vouvoiement ("vous").
// This guard fails if any app-facing French string slips back into vouvoiement:
//   - the pronouns  vous / votre / vos  (incl. reflexive forms like "-vous"), or
//   - a 2nd-person-plural imperative/present verb ending in -ez  (e.g. "Commencez",
//     "trouvez", "soyez").
//
// Exceptions kept as "vous" on purpose:
//   - Legal pages (Privacy / Terms / Cookies): formal register is expected there.
//   - Scripture: the verse of the day quotes a Bible translation verbatim.
const EXEMPT_PREFIXES = [
  "mkt.privacy.",
  "mkt.terms.",
  "mkt.cookies.",
  "mkt.verse.",
];

// Words that end in -ez but are NOT second-person verbs.
const EZ_ALLOWLIST = new Set(["assez", "chez", "nez", "rez"]);
const VOUS_WORDS = new Set(["vous", "votre", "vos"]);

function isExempt(key: string): boolean {
  return EXEMPT_PREFIXES.some((p) => key.startsWith(p));
}

// Lower-case, then split on anything that is not a French letter so accents and
// hyphenated reflexives ("écrivez-nous") are handled the same everywhere.
function words(value: string): string[] {
  return value.toLowerCase().match(/[a-zà-ÿ]+/giu) ?? [];
}

function vouvoiementHit(value: string): string | null {
  for (const w of words(value)) {
    if (VOUS_WORDS.has(w)) return w;
    if (w.length > 2 && w.endsWith("ez") && !EZ_ALLOWLIST.has(w)) return w;
  }
  return null;
}

describe("French app voice stays tutoiement", () => {
  it("has no vouvoiement in any app-facing French string", () => {
    const offenders: string[] = [];
    for (const [key, value] of Object.entries(fr)) {
      if (isExempt(key)) continue;
      if (typeof value !== "string") continue;
      const hit = vouvoiementHit(value);
      if (hit) offenders.push(`${key}: "${value}" (matched "${hit}")`);
    }
    expect(offenders).toEqual([]);
  });

  it("still flags vouvoiement if it is reintroduced (sanity check)", () => {
    expect(vouvoiementHit("Commencez ensemble.")).toBe("commencez");
    expect(vouvoiementHit("Trouvez votre rythme.")).not.toBeNull();
    expect(vouvoiementHit("Écrivez-nous")).toBe("écrivez");
    // Tutoiement and legitimate -ez words must pass clean.
    expect(vouvoiementHit("Commence ensemble, sois le premier.")).toBeNull();
    expect(vouvoiementHit("Franchement assez fatigué, j'ai mal dormi.")).toBeNull();
  });
});
