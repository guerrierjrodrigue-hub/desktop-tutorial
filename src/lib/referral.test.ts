import { describe, it, expect } from "vitest";
import { resolveReferrer } from "./referral";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

describe("resolveReferrer", () => {
  it("credits a valid, different referrer", () => {
    expect(resolveReferrer(A, B)).toBe(A);
  });

  it("ignores a self-referral", () => {
    expect(resolveReferrer(A, A)).toBeNull();
  });

  it("ignores missing or malformed ids", () => {
    expect(resolveReferrer(undefined, B)).toBeNull();
    expect(resolveReferrer("", B)).toBeNull();
    expect(resolveReferrer("not-a-uuid", B)).toBeNull();
  });
});
