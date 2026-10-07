import { describe, it, expect } from "vitest";
import {
  getUserToday,
  localHour,
  greetingFor,
  addDaysToDateStr,
  startOfLocalDayUTC,
} from "./date";

const TORONTO = "America/Toronto";

describe("getUserToday", () => {
  it("is still 'yesterday's' date late at night in Eastern (the 20h-UTC bug)", () => {
    // 23:35 EDT on Oct 6, 2026 === 03:35 UTC on Oct 7, 2026.
    const now = new Date("2026-10-07T03:35:00Z");
    expect(getUserToday(TORONTO, now)).toBe("2026-10-06");
    // UTC would wrongly say the 7th:
    expect(now.toISOString().slice(0, 10)).toBe("2026-10-07");
  });

  it("handles standard time (EST, UTC-5) around the new year", () => {
    // 23:35 EST on Jan 6, 2026 === 04:35 UTC on Jan 7, 2026.
    const now = new Date("2026-01-07T04:35:00Z");
    expect(getUserToday(TORONTO, now)).toBe("2026-01-06");
  });

  it("rolls to the next local day just after local midnight", () => {
    // 00:05 EDT on Oct 7 === 04:05 UTC on Oct 7.
    const now = new Date("2026-10-07T04:05:00Z");
    expect(getUserToday(TORONTO, now)).toBe("2026-10-07");
  });

  it("falls back to the default timezone for an invalid tz", () => {
    const now = new Date("2026-10-07T03:35:00Z");
    expect(getUserToday("Not/AZone", now)).toBe("2026-10-06");
  });
});

describe("localHour + greetingFor", () => {
  it("is 23h local → evening at 23:35 EDT", () => {
    const now = new Date("2026-10-07T03:35:00Z");
    expect(localHour(TORONTO, now)).toBe(23);
    expect(greetingFor(localHour(TORONTO, now))).toBe("evening");
  });

  it("maps hours to the right greeting", () => {
    expect(greetingFor(6)).toBe("morning");
    expect(greetingFor(11)).toBe("morning");
    expect(greetingFor(12)).toBe("afternoon");
    expect(greetingFor(17)).toBe("afternoon");
    expect(greetingFor(18)).toBe("evening");
    expect(greetingFor(23)).toBe("evening");
  });
});

describe("addDaysToDateStr", () => {
  it("adds and subtracts calendar days, crossing month boundaries", () => {
    expect(addDaysToDateStr("2026-10-06", 1)).toBe("2026-10-07");
    expect(addDaysToDateStr("2026-10-01", -1)).toBe("2026-09-30");
    expect(addDaysToDateStr("2026-10-06", 30)).toBe("2026-11-05");
  });
});

describe("startOfLocalDayUTC", () => {
  it("returns local midnight as a UTC instant (EDT = UTC-4)", () => {
    const now = new Date("2026-10-07T03:35:00Z"); // still Oct 6 local
    // Midnight Oct 6 in Toronto (EDT) is 04:00 UTC.
    expect(startOfLocalDayUTC(TORONTO, now)).toBe("2026-10-06T04:00:00.000Z");
  });

  it("accounts for standard time (EST = UTC-5)", () => {
    const now = new Date("2026-01-07T04:35:00Z"); // still Jan 6 local
    expect(startOfLocalDayUTC(TORONTO, now)).toBe("2026-01-06T05:00:00.000Z");
  });
});
