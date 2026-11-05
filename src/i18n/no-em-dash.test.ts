import { describe, it, expect } from "vitest";
import en from "./dictionaries/en";
import fr from "./dictionaries/fr";

/**
 * B2 (D-29): public-facing copy must not use the em-dash (—). It renders
 * inconsistently and was flagged in the beta audit. Every key that appears on a
 * public page (the marketing site and page <title>/description metadata) lives
 * under the `mkt.` or `meta.` prefixes; this test fails if any of their values
 * still contains an em-dash. Replace it with a colon, comma, or period.
 */
const EM_DASH = "—";
const PUBLIC_PREFIXES = ["mkt.", "meta."];

function publicOffenders(dict: Record<string, string>): string[] {
  return Object.entries(dict)
    .filter(([key]) => PUBLIC_PREFIXES.some((p) => key.startsWith(p)))
    .filter(([, value]) => typeof value === "string" && value.includes(EM_DASH))
    .map(([key]) => key);
}

describe("no em-dash in public copy", () => {
  it("English public keys contain no em-dash", () => {
    const offenders = publicOffenders(en as unknown as Record<string, string>);
    expect(offenders, `keys with an em-dash: ${offenders.join(", ")}`).toEqual([]);
  });

  it("French public keys contain no em-dash", () => {
    const offenders = publicOffenders(fr as unknown as Record<string, string>);
    expect(offenders, `keys with an em-dash: ${offenders.join(", ")}`).toEqual([]);
  });
});
