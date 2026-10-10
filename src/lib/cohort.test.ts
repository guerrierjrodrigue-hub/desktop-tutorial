import { describe, it, expect } from "vitest";
import { cohortStartWeekday, cohortStartLabel } from "./cohort";

describe("cohortStartWeekday", () => {
  it("names the weekday in English", () => {
    // 2026-10-12 is a Monday.
    expect(cohortStartWeekday("2026-10-12", "en")).toBe("Monday");
  });

  it("names the weekday in French", () => {
    expect(cohortStartWeekday("2026-10-12", "fr")).toBe("lundi");
  });

  it("is timezone-independent (plain calendar date)", () => {
    expect(cohortStartWeekday("2026-10-11", "en")).toBe("Sunday");
  });
});

describe("cohortStartLabel", () => {
  it("gives weekday + day + month (French)", () => {
    expect(cohortStartLabel("2026-10-12", "fr")).toBe("lundi 12 octobre");
  });

  it("gives weekday + day + month (English)", () => {
    expect(cohortStartLabel("2026-10-12", "en")).toBe("Monday, October 12");
  });
});
