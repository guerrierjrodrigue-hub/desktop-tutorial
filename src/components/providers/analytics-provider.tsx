"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import {
  POSTHOG_KEY, POSTHOG_HOST, CONSENT_EVENT, getConsent,
} from "@/lib/analytics";

/**
 * Loads PostHog only after the visitor has explicitly accepted analytics
 * (Quebec Law 25). PostHog runs with in-memory persistence, so it sets no
 * cookies. Pageviews are recorded on route change once loaded. When analytics
 * is not configured, or consent was declined, this is a transparent no-op.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!POSTHOG_KEY) return;

    function start() {
      if (posthog.__loaded) {
        setReady(true);
        return;
      }
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false, // handled manually below for SPA navigation
        capture_pageleave: true,
        persistence: "memory", // no cookies, no localStorage identity
        person_profiles: "identified_only",
      });
      setReady(true);
    }

    if (getConsent() === "granted") start();

    function onConsent(e: Event) {
      if ((e as CustomEvent).detail === "granted") start();
    }
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    if (!ready || !posthog.__loaded) return;
    posthog.capture("$pageview", { $current_url: window.location.href });
  }, [pathname, ready]);

  return <>{children}</>;
}
