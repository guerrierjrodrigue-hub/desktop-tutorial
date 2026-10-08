import { LOCALE_COOKIE, DEFAULT_LOCALE, isLocaleCode, type LocaleCode } from "@/i18n/locales";

/**
 * Read the display locale from the cookie on the client. For the few places
 * that can't use the server dictionary (error boundaries), so they still show
 * the right language. Falls back to DEFAULT_LOCALE.
 */
export function readClientLocale(): LocaleCode {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`),
  );
  const value = match?.[1];
  return value && isLocaleCode(value) ? value : DEFAULT_LOCALE;
}
