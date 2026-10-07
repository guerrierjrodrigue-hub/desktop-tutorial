/**
 * Localization of DATA content (not UI chrome) for French visitors.
 *
 * Catalog rows stored in Supabase carry their own `*_fr` columns, so the
 * database is the source of truth there and `pick()` chooses the column by
 * locale with an English fallback. Demo mode has no database, so the static
 * seed data in `src/data/*` is localized here instead, keyed by the stable
 * English string. Proper nouns (Barnabas, Kingdom Athlete) are never
 * translated. Pure and server-free so it unit-tests without next/headers.
 */
import type { LocaleCode } from "@/i18n/locales";

/** Choose the French value when the locale is French and a translation exists. */
export function pick(locale: LocaleCode, en: string, fr?: string | null): string {
  return locale === "fr" && fr ? fr : en;
}

// ---------------------------------------------------------------------------
// Demo-mode dictionaries (keyed by the canonical English string).
// The live database holds the same French strings in *_fr columns.
// ---------------------------------------------------------------------------

/** Badge name + description, keyed by English name. */
export const BADGE_FR: Record<string, { name: string; description: string }> = {
  "First Steps": { name: "Premiers pas", description: "A terminé son premier entraînement" },
  "Seven-Day Fire": { name: "Feu de sept jours", description: "Série de 7 jours" },
  "Word Warrior": { name: "Guerrier de la Parole", description: "A lu les Écritures 30 jours" },
  "Iron Discipline": { name: "Discipline de fer", description: "50 entraînements enregistrés" },
  "Marathon Soul": { name: "Âme de marathonien", description: "Série de 100 jours" },
  "Prayer Pillar": { name: "Pilier de prière", description: "100 prières enregistrées" },
};

/** Challenge title + description, keyed by English title. */
export const CHALLENGE_FR: Record<string, { title: string; description: string }> = {
  "40 Days of Discipline": {
    title: "40 jours de discipline",
    description: "Fais un entraînement et une méditation chaque jour pendant 40 jours.",
  },
  "Iron Sharpens Iron": {
    title: "Le fer aiguise le fer",
    description: "Toi et 3 amis : 12 entraînements en 2 semaines.",
  },
  "Church vs. Church: 30 workouts this month": {
    title: "Église contre Église : 30 entraînements ce mois-ci",
    description: "Ton église contre les autres — enregistre 30 entraînements ce mois-ci.",
  },
  "Sabbath Rest Challenge": {
    title: "Défi du repos du sabbat",
    description: "Protège une journée complète de repos chaque semaine pendant un mois.",
  },
};

/**
 * Default/suggested habit labels, keyed by English label. Custom habits a
 * user typed themselves are not in this map and fall back to their own text.
 */
export const HABIT_LABEL_FR: Record<string, string> = {
  "Morning prayer": "Prière du matin",
  "Read Scripture": "Lire les Écritures",
  "Complete workout": "Faire l'entraînement",
  "Drink 3L water": "Boire 3 L d'eau",
  "Drink water": "Boire de l'eau",
  "Gratitude journal": "Journal de gratitude",
};

/** Translate a habit label if it's a known default; otherwise keep it as-is. */
export function localizeHabitLabel(label: string, locale: LocaleCode): string {
  return locale === "fr" ? HABIT_LABEL_FR[label] ?? label : label;
}
