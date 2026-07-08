import type { LocaleCode } from "./locales";
import type { Dictionary } from "./dictionaries/en";

const loaders: Record<LocaleCode, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  fr: () => import("./dictionaries/fr").then((m) => m.default),
};

/** Loads the dictionary for a locale, falling back to English for any missing key. */
export async function getDictionary(locale: LocaleCode): Promise<Dictionary> {
  if (locale === "en") return loaders.en();
  const [en, translated] = await Promise.all([loaders.en(), loaders[locale]()]);
  return { ...en, ...translated };
}
