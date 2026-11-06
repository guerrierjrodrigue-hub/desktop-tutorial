import { describe, it, expect } from "vitest";
import { feedbackSchema, FEEDBACK_KINDS } from "./feedback";

describe("feedbackSchema", () => {
  it("accepts a valid bug report", () => {
    const r = feedbackSchema.safeParse({ kind: "bug", message: "The timer does not reset." });
    expect(r.success).toBe(true);
  });

  it("accepts each allowed kind", () => {
    for (const kind of FEEDBACK_KINDS) {
      expect(feedbackSchema.safeParse({ kind, message: "hello there" }).success).toBe(true);
    }
  });

  it("rejects an unknown kind with the dictionary key", () => {
    const r = feedbackSchema.safeParse({ kind: "spam", message: "hello there" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("errors.feedbackKind");
  });

  it("rejects a message shorter than 5 chars", () => {
    const r = feedbackSchema.safeParse({ kind: "idee", message: "hi" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("errors.feedbackTooShort");
  });

  it("rejects a message longer than 2000 chars (not stricter than the DB CHECK)", () => {
    const r = feedbackSchema.safeParse({ kind: "autre", message: "x".repeat(2001) });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("errors.tooLong");
  });

  it("accepts a message of exactly 2000 chars (the DB limit)", () => {
    const r = feedbackSchema.safeParse({ kind: "autre", message: "x".repeat(2000) });
    expect(r.success).toBe(true);
  });

  it("trims whitespace and re-checks the minimum", () => {
    const r = feedbackSchema.safeParse({ kind: "bug", message: "   a   " });
    expect(r.success).toBe(false);
  });

  it("allows optional page and userAgent to be omitted", () => {
    const r = feedbackSchema.safeParse({ kind: "bug", message: "a real message" });
    expect(r.success).toBe(true);
  });
});
