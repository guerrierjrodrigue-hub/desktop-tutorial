import posthog from "posthog-js";

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export function isAnalyticsConfigured(): boolean {
  return Boolean(POSTHOG_KEY);
}

// --- Consent (Quebec Law 25) ---------------------------------------------
// Analytics is off until the visitor explicitly accepts. The choice is kept in
// localStorage (a functional preference, not an analytics cookie); PostHog
// itself runs with in-memory persistence, so it never writes cookies.

export const CONSENT_KEY = "ka_analytics_consent";
export type Consent = "granted" | "denied" | "unset";
/** Fired on window when the consent choice changes, so the provider reacts. */
export const CONSENT_EVENT = "ka-analytics-consent-changed";

export function getConsent(): Consent {
  if (typeof window === "undefined") return "unset";
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}

export function setConsent(value: "granted" | "denied"): void {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // ignore (private mode / blocked storage)
  }
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  } catch {
    // ignore
  }
}

/** Product event names (keep in one place so they stay consistent). */
export const EVENTS = {
  signedUp: "signed_up",
  onboardingCompleted: "onboarding_completed",
  workoutCompleted: "workout_completed",
  runLogged: "run_logged",
  habitChecked: "habit_checked",
  shared: "shared",
} as const;

/**
 * Track a product event. Safe to call anywhere on the client — it no-ops when
 * PostHog isn't configured, hasn't loaded, or consent was not granted, so
 * callers never need to guard.
 */
export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.capture(event, props);
}
