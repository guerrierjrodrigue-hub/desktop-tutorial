import { describe, it, expect } from "vitest";
import { getQuoteOfDay, splitQuote } from "./quote-of-day";
import { getInspirationalQuotes } from "@/data/devotional";

describe("splitQuote", () => {
  it("returns just the text when there is no attribution", () => {
    const q = splitQuote("Progress, not perfection.");
    expect(q.text).toBe("Progress, not perfection.");
    expect(q.reference).toBeUndefined();
  });

  it("separates the reference after an em dash", () => {
    const q = splitQuote("Run in such a way as to get the prize. — 1 Cor. 9:24");
    expect(q.text).toBe("Run in such a way as to get the prize.");
    expect(q.reference).toBe("1 Cor. 9:24");
  });

  it("splits on the LAST em dash only", () => {
    const q = splitQuote("Fall down — get up — Proverbs 24:16");
    expect(q.text).toBe("Fall down — get up");
    expect(q.reference).toBe("Proverbs 24:16");
  });
});

const enQuotes = getInspirationalQuotes("en");

describe("getQuoteOfDay", () => {
  it("returns a quote from the catalog", () => {
    expect(enQuotes).toContain(getQuoteOfDay("en", new Date("2026-07-08T12:00:00Z")));
  });

  it("is deterministic for the same date", () => {
    const date = new Date("2026-03-15T00:00:00Z");
    expect(getQuoteOfDay("en", date)).toBe(getQuoteOfDay("en", date));
  });

  it("changes from one day to the next", () => {
    const today = getQuoteOfDay("en", new Date("2026-01-01T00:00:00Z"));
    const tomorrow = getQuoteOfDay("en", new Date("2026-01-02T00:00:00Z"));
    expect(today).not.toBe(tomorrow);
  });

  it("wraps around after cycling through the whole catalog", () => {
    const day0 = getQuoteOfDay("en", new Date("2026-01-01T00:00:00Z"));
    const dayN = getQuoteOfDay("en", new Date(Date.UTC(2026, 0, 1 + enQuotes.length)));
    expect(dayN).toBe(day0);
  });

  it("returns a different-language quote for fr", () => {
    const frQuotes = getInspirationalQuotes("fr");
    expect(frQuotes).toContain(getQuoteOfDay("fr", new Date("2026-07-08T12:00:00Z")));
  });
});
