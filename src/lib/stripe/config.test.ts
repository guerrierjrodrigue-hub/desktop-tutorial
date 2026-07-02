import { describe, it, expect } from "vitest";
import { planForPrice } from "./config";

describe("planForPrice", () => {
  it("returns null for missing price ids", () => {
    expect(planForPrice(null)).toBeNull();
    expect(planForPrice(undefined)).toBeNull();
    expect(planForPrice("")).toBeNull();
  });

  it("returns null for an unknown price id", () => {
    expect(planForPrice("price_does_not_exist")).toBeNull();
  });
});
