import { describe, it, expect } from "vitest";
import { getDailyDevotional } from "./devotional";

describe("getDailyDevotional", () => {
  it("is deterministic for the same date", () => {
    const date = new Date("2026-03-15T00:00:00Z");
    expect(getDailyDevotional("en", date)).toEqual(getDailyDevotional("en", date));
  });

  it("rotates to a different devotional on a different day", () => {
    const today = getDailyDevotional("en", new Date("2026-01-01T00:00:00Z"));
    const tomorrow = getDailyDevotional("en", new Date("2026-01-02T00:00:00Z"));
    expect(today.verse.reference).not.toBe(tomorrow.verse.reference);
  });

  it("returns matching content shape for French", () => {
    const devotional = getDailyDevotional("fr", new Date("2026-07-08T00:00:00Z"));
    expect(devotional.verse.translation).toBe("LSG");
    expect(devotional.quote).toBeTruthy();
    expect(devotional.prayer).toBeTruthy();
    expect(devotional.reflection).toBeTruthy();
  });

  it("wraps around after cycling through the week", () => {
    const day0 = getDailyDevotional("en", new Date("2026-01-01T00:00:00Z"));
    const day7 = getDailyDevotional("en", new Date("2026-01-08T00:00:00Z"));
    expect(day7.verse.reference).toBe(day0.verse.reference);
  });
});
