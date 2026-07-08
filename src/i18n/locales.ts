export const LOCALES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "ht", label: "Haitian Creole", nativeLabel: "Kreyòl ayisyen" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "it", label: "Italian", nativeLabel: "Italiano" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
  { code: "zh", label: "Chinese", nativeLabel: "中文" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";
export const LOCALE_COOKIE = "ka_locale";

export function isLocaleCode(value: string): value is LocaleCode {
  return LOCALES.some((l) => l.code === value);
}
