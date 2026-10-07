"use client";

import { useEffect } from "react";
import { TZ_COOKIE } from "@/lib/date";
import { setTimezone } from "@/app/actions/timezone";

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Detects the visitor's timezone once (Intl) and persists it (cookie +
 * profiles.timezone) when it's missing or has changed — so "today" is computed
 * in their local time. Renders nothing.
 */
export function TimezoneSync() {
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected && readCookie(TZ_COOKIE) !== detected) {
        void setTimezone(detected);
      }
    } catch {
      // Intl unavailable — leave the default in place.
    }
  }, []);

  return null;
}
