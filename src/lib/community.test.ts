import { describe, it, expect } from "vitest";
import {
  isValidPostContent,
  isValidCommentBody,
  isValidReportReason,
  exceedsPostRate,
  POST_MAX_LENGTH,
  COMMENT_MAX_LENGTH,
  REPORT_REASON_MAX_LENGTH,
  POSTS_PER_HOUR,
} from "./community";

describe("isValidPostContent", () => {
  it("accepts non-empty content up to the limit", () => {
    expect(isValidPostContent("Let's go")).toBe(true);
    expect(isValidPostContent("a".repeat(POST_MAX_LENGTH))).toBe(true);
  });
  it("rejects empty/whitespace and over-limit content", () => {
    expect(isValidPostContent("")).toBe(false);
    expect(isValidPostContent("   ")).toBe(false);
    expect(isValidPostContent("a".repeat(POST_MAX_LENGTH + 1))).toBe(false);
  });
});

describe("isValidCommentBody", () => {
  it("accepts non-empty content up to 500", () => {
    expect(isValidCommentBody("Amen")).toBe(true);
    expect(isValidCommentBody("a".repeat(COMMENT_MAX_LENGTH))).toBe(true);
  });
  it("rejects empty and over-limit", () => {
    expect(isValidCommentBody("  ")).toBe(false);
    expect(isValidCommentBody("a".repeat(COMMENT_MAX_LENGTH + 1))).toBe(false);
  });
});

describe("isValidReportReason", () => {
  it("allows an empty reason (optional) and bounded text", () => {
    expect(isValidReportReason("")).toBe(true);
    expect(isValidReportReason("spam")).toBe(true);
    expect(isValidReportReason("a".repeat(REPORT_REASON_MAX_LENGTH))).toBe(true);
  });
  it("rejects an over-limit reason", () => {
    expect(isValidReportReason("a".repeat(REPORT_REASON_MAX_LENGTH + 1))).toBe(false);
  });
});

describe("exceedsPostRate", () => {
  const now = Date.parse("2026-10-11T12:00:00Z");

  it("allows a post below the hourly cap", () => {
    const times = Array.from({ length: POSTS_PER_HOUR - 1 }, () =>
      new Date(now - 5 * 60_000).toISOString(),
    );
    expect(exceedsPostRate(times, now)).toBe(false);
  });

  it("blocks once the cap is reached within the window", () => {
    const times = Array.from({ length: POSTS_PER_HOUR }, () =>
      new Date(now - 10 * 60_000).toISOString(),
    );
    expect(exceedsPostRate(times, now)).toBe(true);
  });

  it("ignores posts older than the one-hour window", () => {
    const old = Array.from({ length: POSTS_PER_HOUR }, () =>
      new Date(now - 2 * 60 * 60_000).toISOString(),
    );
    expect(exceedsPostRate(old, now)).toBe(false);
  });

  it("counts only in-window posts toward the cap", () => {
    const mixed = [
      ...Array.from({ length: POSTS_PER_HOUR - 1 }, () => new Date(now - 60_000).toISOString()),
      ...Array.from({ length: 5 }, () => new Date(now - 90 * 60_000).toISOString()),
    ];
    expect(exceedsPostRate(mixed, now)).toBe(false);
  });

  it("ignores unparseable timestamps", () => {
    expect(exceedsPostRate(["not-a-date", "also bad"], now)).toBe(false);
  });
});
