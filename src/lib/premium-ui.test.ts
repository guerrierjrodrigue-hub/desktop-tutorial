import { describe, it, expect } from "vitest";
import { profilePlanCard, showPremiumLock, showPremiumUpsell } from "./premium-ui";

describe("premium UI decisions — free mode OFF (normal paid behavior)", () => {
  it("shows the premium-member card for a premium user and upsell otherwise", () => {
    expect(profilePlanCard(false, true)).toBe("premium-member");
    expect(profilePlanCard(false, false)).toBe("upsell");
  });
  it("shows the lock badge on premium programs and the upsell", () => {
    expect(showPremiumLock(false, true)).toBe(true);
    expect(showPremiumLock(false, false)).toBe(false);
    expect(showPremiumUpsell(false)).toBe(true);
  });
});

describe("premium UI decisions — free mode ON (beta)", () => {
  it("always shows the free-beta card regardless of stored premium status", () => {
    expect(profilePlanCard(true, true)).toBe("free-beta");
    expect(profilePlanCard(true, false)).toBe("free-beta");
  });
  it("hides every lock badge and upsell", () => {
    expect(showPremiumLock(true, true)).toBe(false);
    expect(showPremiumUpsell(true)).toBe(false);
  });
});
