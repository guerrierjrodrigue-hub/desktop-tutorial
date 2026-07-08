import { describe, it, expect } from "vitest";
import { LOCALES, isLocaleCode } from "./locales";

describe("isLocaleCode", () => {
  it("accepts every configured locale code", () => {
    for (const locale of LOCALES) {
      expect(isLocaleCode(locale.code)).toBe(true);
    }
  });

  it("rejects unknown codes", () => {
    expect(isLocaleCode("xx")).toBe(false);
    expect(isLocaleCode("")).toBe(false);
  });

  it("has at least 10 languages", () => {
    expect(LOCALES.length).toBeGreaterThanOrEqual(10);
  });
});
