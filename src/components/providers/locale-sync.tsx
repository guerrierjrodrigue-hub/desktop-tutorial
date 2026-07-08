"use client";

import { useEffect } from "react";
import { LOCALE_COOKIE, DEFAULT_LOCALE, isLocaleCode } from "@/i18n/locales";

function readLocaleCookie(): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : DEFAULT_LOCALE;
}

/**
 * Applies the saved locale's `lang` to `<html>` on the client. Kept out of the
 * root layout's SSR path (which stays cookie-free) so marketing pages can
 * still be statically generated instead of forced dynamic on every request.
 */
export function LocaleSync() {
  useEffect(() => {
    const raw = readLocaleCookie();
    document.documentElement.lang = isLocaleCode(raw) ? raw : DEFAULT_LOCALE;
  }, []);

  return null;
}
