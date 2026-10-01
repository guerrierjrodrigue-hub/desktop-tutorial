import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocaleCode, type LocaleCode } from "@/i18n/locales";

/** The visitor's display language, read from a cookie (defaults to DEFAULT_LOCALE). */
export async function getLocale(): Promise<LocaleCode> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value && isLocaleCode(value) ? value : DEFAULT_LOCALE;
}
