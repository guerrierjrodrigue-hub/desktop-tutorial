import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, __resetRateLimits } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => __resetRateLimits());

  it("allows up to max hits, then throttles", () => {
    const opts = { windowMs: 60_000, max: 3 };
    expect(rateLimit("k", opts)).toBe(false); // 1
    expect(rateLimit("k", opts)).toBe(false); // 2
    expect(rateLimit("k", opts)).toBe(false); // 3
    expect(rateLimit("k", opts)).toBe(true); // 4 -> over
  });

  it("keeps separate counters per key", () => {
    const opts = { windowMs: 60_000, max: 1 };
    expect(rateLimit("a", opts)).toBe(false);
    expect(rateLimit("b", opts)).toBe(false);
    expect(rateLimit("a", opts)).toBe(true);
  });

  it("resets after the window elapses", () => {
    const opts = { windowMs: -1, max: 1 }; // window already expired on next call
    expect(rateLimit("c", opts)).toBe(false);
    // With a non-positive window the entry is always expired, so it never throttles.
    expect(rateLimit("c", opts)).toBe(false);
  });
});
