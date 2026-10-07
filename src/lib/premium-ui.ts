/**
 * Which premium-related UI to show. Centralized + pure so the behavior is the
 * same everywhere and easy to test for both APP_FREE_MODE states. When free
 * mode is on, paywall/upsell affordances are hidden and the profile shows a
 * free-beta thank-you instead of a (dead) "manage subscription" card.
 */
export type ProfilePlanCard = "free-beta" | "premium-member" | "upsell";

export function profilePlanCard(freeMode: boolean, isPremium: boolean): ProfilePlanCard {
  if (freeMode) return "free-beta";
  return isPremium ? "premium-member" : "upsell";
}

/** Whether to show the "Premium" lock badge on a premium program. */
export function showPremiumLock(freeMode: boolean, programPremium: boolean): boolean {
  return programPremium && !freeMode;
}

/** Whether to show "Go Premium" upsells (sidebar, profile). */
export function showPremiumUpsell(freeMode: boolean): boolean {
  return !freeMode;
}
