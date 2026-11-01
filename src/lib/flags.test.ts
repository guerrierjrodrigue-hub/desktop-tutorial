import { describe, it, expect, afterEach } from "vitest";
import { isFreeMode } from "./flags";
import { getStandaloneNavItems } from "./nav";

const ORIGINAL = { ...process.env };
afterEach(() => {
  process.env = { ...ORIGINAL };
});

describe("isFreeMode", () => {
  it("defaults to false when the flag is unset", () => {
    delete process.env.APP_FREE_MODE;
    expect(isFreeMode()).toBe(false);
  });

  it("is true only when APP_FREE_MODE is exactly 'true'", () => {
    process.env.APP_FREE_MODE = "true";
    expect(isFreeMode()).toBe(true);
    process.env.APP_FREE_MODE = "1";
    expect(isFreeMode()).toBe(false);
  });
});

describe("getStandaloneNavItems", () => {
  it("lists Profile (the coach entry has been removed)", () => {
    const items = getStandaloneNavItems();
    expect(items.some((i) => i.href === "/profile")).toBe(true);
    expect(items.some((i) => i.href === "/coach")).toBe(false);
  });
});
