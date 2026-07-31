import { describe, it, expect } from "vitest";
import { nextWaterMl, isValidWaterDelta } from "./hydration";

describe("nextWaterMl", () => {
  it("adds a positive delta", () => {
    expect(nextWaterMl(0, 250)).toBe(250);
    expect(nextWaterMl(500, 500)).toBe(1000);
  });

  it("subtracts but never goes below zero", () => {
    expect(nextWaterMl(500, -250)).toBe(250);
    expect(nextWaterMl(100, -250)).toBe(0);
    expect(nextWaterMl(0, -250)).toBe(0);
  });

  it("rounds fractional deltas", () => {
    expect(nextWaterMl(0, 249.6)).toBe(250);
    expect(nextWaterMl(1000, -0.4)).toBe(1000);
  });
});

describe("isValidWaterDelta", () => {
  it("accepts non-zero finite amounts (positive or negative)", () => {
    expect(isValidWaterDelta(250)).toBe(true);
    expect(isValidWaterDelta(-250)).toBe(true);
  });

  it("rejects zero, near-zero rounding, and non-finite values", () => {
    expect(isValidWaterDelta(0)).toBe(false);
    expect(isValidWaterDelta(0.4)).toBe(false); // rounds to 0
    expect(isValidWaterDelta(NaN)).toBe(false);
    expect(isValidWaterDelta(Infinity)).toBe(false);
  });
});
