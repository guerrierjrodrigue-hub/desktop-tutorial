import posthog from "posthog-js";

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export function isAnalyticsConfigured(): boolean {
  return Boolean(POSTHOG_KEY);
}

/**
 * Track a product event. Safe to call anywhere on the client — it no-ops when
 * PostHog isn't configured or hasn't loaded, so callers never need to guard.
 */
export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.capture(event, props);
}
