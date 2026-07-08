import { describe, it, expect } from "vitest";
import { getQuoteOfDay } from "./quote-of-day";
import { inspirationalQuotes } from "@/data/devotional";

describe("getQuoteOfDay", () => {
  it("returns a quote from the catalog", () => {
    expect(inspirationalQuotes).toContain(getQuoteOfDay(new Date("2026-07-08T12:00:00Z")));
  });

  it("is deterministic for the same date", () => {
    const date = new Date("2026-03-15T00:00:00Z");
    expect(getQuoteOfDay(date)).toBe(getQuoteOfDay(date));
  });

  it("changes from one day to the next", () => {
    const today = getQuoteOfDay(new Date("2026-01-01T00:00:00Z"));
    const tomorrow = getQuoteOfDay(new Date("2026-01-02T00:00:00Z"));
    expect(today).not.toBe(tomorrow);
  });

  it("wraps around after cycling through the whole catalog", () => {
    const day0 = getQuoteOfDay(new Date("2026-01-01T00:00:00Z"));
    const dayN = getQuoteOfDay(
      new Date(Date.UTC(2026, 0, 1 + inspirationalQuotes.length)),
    );
    expect(dayN).toBe(day0);
  });
});
