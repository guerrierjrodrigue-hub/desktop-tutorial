import { describe, it, expect } from "vitest";
import {
  isMorningWindow,
  minutesSinceMidnight,
  shouldSendDailyReminder,
  MORNING_START_MIN,
  MORNING_END_MIN,
} from "./reminders";

describe("minutesSinceMidnight", () => {
  it("parses HH:MM", () => {
    expect(minutesSinceMidnight("00:00")).toBe(0);
    expect(minutesSinceMidnight("07:30")).toBe(450);
    expect(minutesSinceMidnight("23:59")).toBe(1439);
  });
});

describe("isMorningWindow", () => {
  it("is true inside 05:00..11:00", () => {
    expect(isMorningWindow("05:00")).toBe(true);
    expect(isMorningWindow("07:00")).toBe(true);
    expect(isMorningWindow("08:00")).toBe(true);
    expect(isMorningWindow("11:00")).toBe(true);
  });
  it("is false outside the window", () => {
    expect(isMorningWindow("04:59")).toBe(false);
    expect(isMorningWindow("11:01")).toBe(false);
    expect(isMorningWindow("17:00")).toBe(false);
    expect(isMorningWindow("23:30")).toBe(false);
    expect(isMorningWindow("00:00")).toBe(false);
  });
  it("matches the exported bounds", () => {
    expect(MORNING_START_MIN).toBe(300);
    expect(MORNING_END_MIN).toBe(660);
  });
});

describe("shouldSendDailyReminder", () => {
  it("sends once in the morning window when enabled and not yet sent today", () => {
    expect(shouldSendDailyReminder("07:15", "2026-11-06", null, true)).toBe(true);
    expect(shouldSendDailyReminder("07:15", "2026-11-06", "2026-11-05", true)).toBe(true);
  });

  it("does not send twice on the same local day", () => {
    expect(shouldSendDailyReminder("07:15", "2026-11-06", "2026-11-06", true)).toBe(false);
  });

  it("does not send outside the morning window", () => {
    expect(shouldSendDailyReminder("18:00", "2026-11-06", null, true)).toBe(false);
    expect(shouldSendDailyReminder("03:00", "2026-11-06", null, true)).toBe(false);
  });

  it("does not send when reminders are disabled", () => {
    expect(shouldSendDailyReminder("07:15", "2026-11-06", null, false)).toBe(false);
  });

  it("works across timezones: the SAME UTC instant can be morning in one zone, night in another", () => {
    // 12:30 UTC on 2026-11-06:
    //   Montreal (UTC-5) -> 07:30 local, 2026-11-06  -> morning, send
    //   Tokyo    (UTC+9) -> 21:30 local, 2026-11-06  -> evening, skip
    const montreal = { hhmm: "07:30", day: "2026-11-06" };
    const tokyo = { hhmm: "21:30", day: "2026-11-06" };
    expect(shouldSendDailyReminder(montreal.hhmm, montreal.day, null, true)).toBe(true);
    expect(shouldSendDailyReminder(tokyo.hhmm, tokyo.day, null, true)).toBe(false);
  });

  it("a new local day re-enables the send after yesterday's", () => {
    expect(shouldSendDailyReminder("06:00", "2026-11-07", "2026-11-06", true)).toBe(true);
  });
});
