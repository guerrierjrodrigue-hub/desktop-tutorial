import { describe, it, expect, afterEach } from "vitest";
import { isCoachEnabled } from "./flags";
import { getStandaloneNavItems } from "./nav";

const ORIGINAL = { ...process.env };
afterEach(() => {
  process.env = { ...ORIGINAL };
});

describe("isCoachEnabled", () => {
  it("defaults to false when neither flag is set", () => {
    delete process.env.COACH_ENABLED;
    delete process.env.NEXT_PUBLIC_COACH_ENABLED;
    expect(isCoachEnabled()).toBe(false);
  });

  it("is true when the server flag is 'true'", () => {
    process.env.COACH_ENABLED = "true";
    expect(isCoachEnabled()).toBe(true);
  });

  it("falls back to the public flag when the server flag is unset", () => {
    delete process.env.COACH_ENABLED;
    process.env.NEXT_PUBLIC_COACH_ENABLED = "true";
    expect(isCoachEnabled()).toBe(true);
  });

  it("is false for any value other than 'true'", () => {
    process.env.COACH_ENABLED = "1";
    expect(isCoachEnabled()).toBe(false);
  });
});

describe("getStandaloneNavItems", () => {
  it("omits the Coach entry when the coach is disabled", () => {
    delete process.env.COACH_ENABLED;
    delete process.env.NEXT_PUBLIC_COACH_ENABLED;
    const items = getStandaloneNavItems();
    expect(items.some((i) => i.href === "/coach")).toBe(false);
    expect(items.some((i) => i.href === "/profile")).toBe(true);
  });

  it("includes the Coach entry when the coach is enabled", () => {
    process.env.COACH_ENABLED = "true";
    expect(getStandaloneNavItems().some((i) => i.href === "/coach")).toBe(true);
  });
});
