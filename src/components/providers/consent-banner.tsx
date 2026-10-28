"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CONSENT_EVENT, POSTHOG_KEY, getConsent, setConsent } from "@/lib/analytics";
import type { Dictionary } from "@/i18n/dictionaries/en";

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// Show only when analytics is configured and no choice has been made yet.
const snapshot = () => Boolean(POSTHOG_KEY) && getConsent() === "unset";

/**
 * Law 25 consent banner. Shown only when analytics is configured and the visitor
 * has not chosen yet. Default is "refuse": nothing loads until Accept is clicked.
 * The choice is stored as a preference (localStorage), not a cookie. Uses
 * useSyncExternalStore so SSR renders nothing and there is no hydration mismatch.
 */
export function ConsentBanner({ dict }: { dict: Dictionary }) {
  const visible = useSyncExternalStore(subscribe, snapshot, () => false);

  if (!visible) return null;

  function choose(value: "granted" | "denied") {
    setConsent(value);
  }

  return (
    <div
      role="dialog"
      aria-label={dict["consent.text"]}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 p-4 backdrop-blur sm:p-5"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {dict["consent.text"]}{" "}
          <Link href="/privacy" className="text-accent-bright underline-offset-2 hover:underline">
            {dict["consent.learnMore"]}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => choose("denied")}>
            {dict["consent.refuse"]}
          </Button>
          <Button type="button" size="sm" onClick={() => choose("granted")}>
            {dict["consent.accept"]}
          </Button>
        </div>
      </div>
    </div>
  );
}
