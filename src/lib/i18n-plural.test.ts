import { describe, it, expect } from "vitest";
import { pluralCategory, plural } from "./i18n-plural";

describe("pluralCategory", () => {
  it("English: only 1 is singular", () => {
    expect(pluralCategory(0, "en")).toBe("other");
    expect(pluralCategory(1, "en")).toBe("one");
    expect(pluralCategory(2, "en")).toBe("other");
  });

  it("French: 0 and 1 are singular", () => {
    expect(pluralCategory(0, "fr")).toBe("one");
    expect(pluralCategory(1, "fr")).toBe("one");
    expect(pluralCategory(2, "fr")).toBe("other");
  });
});

describe("plural", () => {
  const participants = { one: "{n} participant", other: "{n} participants" };
  const daysLeftFr = { one: "{n} jour restant", other: "{n} jours restants" };

  it("substitutes {n} and picks the form (en)", () => {
    expect(plural(1, participants, "en")).toBe("1 participant");
    expect(plural(5, participants, "en")).toBe("5 participants");
    expect(plural(0, participants, "en")).toBe("0 participants");
  });

  it("French singular covers 0 and 1", () => {
    expect(plural(1, daysLeftFr, "fr")).toBe("1 jour restant");
    expect(plural(0, daysLeftFr, "fr")).toBe("0 jour restant");
    expect(plural(3, daysLeftFr, "fr")).toBe("3 jours restants");
  });

  it("formats large numbers per locale", () => {
    expect(plural(1200, participants, "en")).toBe("1,200 participants");
    // French groups thousands with a space (exact space char is ICU-dependent).
    const fr = plural(1200, { one: "{n} inscrit", other: "{n} inscrits" }, "fr");
    expect(fr).toMatch(/^1\s200 inscrits$/);
  });
});
