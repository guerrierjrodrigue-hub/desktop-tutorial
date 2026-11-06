"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";

/**
 * Z3 Bloc G2: a one-time, NON-BLOCKING health disclaimer. Shown once per scope
 * (strength / nutrition) per device, then dismissed. It never blocks the page —
 * the content below it works whether or not the banner is visible. Dismissal is
 * stored in localStorage (per device, best-effort); the page renders correctly
 * even if storage is unavailable.
 */
export function MedicalDisclaimer({
  scope,
  dict,
}: {
  scope: "strength" | "nutrition";
  dict: Dictionary;
}) {
  const storageKey = `ka_med_disclaimer_${scope}`;
  // Start hidden so SSR and the first client paint match; reveal after mount if
  // it hasn't been dismissed yet.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(storageKey) === "1";
    } catch {
      dismissed = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(!dismissed);
  }, [storageKey]);

  if (!visible) return null;

  function dismiss() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore storage errors — dismissal is best-effort */
    }
    setVisible(false);
  }

  return (
    <div
      role="note"
      data-testid="medical-disclaimer"
      className="mb-4 flex items-start gap-3 rounded-xl border border-ember/30 bg-ember/10 px-4 py-3"
    >
      <ShieldAlert className="mt-0.5 size-5 shrink-0 text-ember" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{dict["health.disclaimer.title"]}</p>
        <p className="mt-1 text-sm text-muted">{dict["health.disclaimer.body"]}</p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={dict["health.disclaimer.dismiss"]}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted transition hover:text-foreground"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}
