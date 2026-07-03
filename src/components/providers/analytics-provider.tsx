"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { POSTHOG_KEY, POSTHOG_HOST } from "@/lib/analytics";

/**
 * Initializes PostHog once (only when a key is present) and records a pageview
 * on every route change. Renders as a transparent pass-through, so the app is
 * unaffected when analytics is not configured.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY || posthog.__loaded) return;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // handled manually below for SPA navigation
      capture_pageleave: true,
      person_profiles: "identified_only",
    });
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    if (!POSTHOG_KEY || !posthog.__loaded) return;
    posthog.capture("$pageview", { $current_url: window.location.href });
  }, [pathname]);

  return <>{children}</>;
}
