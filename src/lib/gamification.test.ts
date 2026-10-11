import { describe, it, expect } from "vitest";
import { XP_REWARDS, globalStreak } from "./gamification";

describe("XP_REWARDS", () => {
  // These MUST mirror the amounts awarded server-side by the DB triggers in
  // migration 0024. If a trigger's XP changes, update both together.
  it("mirrors the server-side award amounts", () => {
    expect(XP_REWARDS).toEqual({
      habit: 10,
      workout: 30,
      journal: 15,
      prayer: 10,
      reading_day: 10,
      challenge_join: 20,
      meditation: 10,
    });
  });

  it("is a readonly constant map of positive integers", () => {
    for (const value of Object.values(XP_REWARDS)) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThan(0);
    }
  });
});

describe("globalStreak", () => {
  // Calendar anchors (match habit-streak.test.ts):
  // 2026-10-05 Mon, -06 Tue, -07 Wed, -08 Thu, -09 Fri, -10 Sat, -11 Sun.
  // With 3 training days → Mon/Wed/Fri train, Tue/Thu/Sat/Sun rest.

  it("counts consecutive days with at least one event, ending today", () => {
    const days = ["2026-10-05", "2026-10-06", "2026-10-07"];
    expect(globalStreak(days, 3, "2026-10-07")).toBe(3);
  });

  it("still stands on yesterday when today has no event yet", () => {
    const days = ["2026-10-05", "2026-10-06"];
    expect(globalStreak(days, 3, "2026-10-07")).toBe(2);
  });

  it("does not break the streak on a planned rest day with no event", () => {
    // Mon + Wed have events; Tue (rest) is skipped, so the streak spans both.
    const days = ["2026-10-05", "2026-10-07"];
    expect(globalStreak(days, 3, "2026-10-07")).toBe(2);
  });

  it("forgives today being a rest day with no event", () => {
    // Today is Thu (rest), no event. Walk back: Thu skip → Wed event → Tue skip
    // → Mon event.
    const days = ["2026-10-05", "2026-10-07"];
    expect(globalStreak(days, 3, "2026-10-08")).toBe(2);
  });

  it("breaks on a missed training day", () => {
    // Today is Fri (a training day) with no event and nothing the day before it
    // counts: the streak is broken.
    const days = ["2026-10-05"];
    expect(globalStreak(days, 3, "2026-10-09")).toBe(0);
  });

  it("returns 0 when there are no events", () => {
    expect(globalStreak([], 3, "2026-10-07")).toBe(0);
  });

  it("defaults to a 3-day cadence when trainingDays is 0", () => {
    // trainingDays || 3 → same pattern as the explicit 3-day case above.
    const days = ["2026-10-05", "2026-10-07"];
    expect(globalStreak(days, 0, "2026-10-07")).toBe(2);
  });

  it("is order-independent (dedupes event days)", () => {
    const days = ["2026-10-07", "2026-10-05", "2026-10-07", "2026-10-06"];
    expect(globalStreak(days, 3, "2026-10-07")).toBe(3);
  });
});
