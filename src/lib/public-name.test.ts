import { describe, it, expect } from "vitest";
import { publicDisplayName } from "./public-name";

describe("publicDisplayName", () => {
  it("shortens to first name + last initial", () => {
    expect(publicDisplayName("Jean Guerrier")).toBe("Jean G.");
    expect(publicDisplayName("David Bennett")).toBe("David B.");
  });

  it("uses the last word for the initial, ignoring middle names", () => {
    expect(publicDisplayName("Marie Claire Dupont")).toBe("Marie D.");
  });

  it("leaves a single name unchanged", () => {
    expect(publicDisplayName("Athlete")).toBe("Athlete");
  });

  it("never leaks the full surname", () => {
    expect(publicDisplayName("Jean Guerrier")).not.toContain("Guerrier");
  });

  it("falls back to Athlete for blank input", () => {
    expect(publicDisplayName("   ")).toBe("Athlete");
    expect(publicDisplayName("")).toBe("Athlete");
  });

  it("trims surrounding whitespace", () => {
    expect(publicDisplayName("  Paul  Martin  ")).toBe("Paul M.");
  });
});
