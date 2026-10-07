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

// ---------------------------------------------------------------------------
// Fitness programs (PR2). Controlled vocab (muscles, levels, categories) is
// translated at render time; free text (program/day/exercise names) is keyed
// by its English value so the same strings localize both the live DB (via the
// *_fr columns) and the demo catalog.
// ---------------------------------------------------------------------------

/** Program title + description, keyed by English title. */
export const PROGRAM_FR: Record<string, { title: string; description: string }> = {
  "Foundations of Strength": {
    title: "Fondations de la force",
    description:
      "Bâtis une base solide avec des mouvements polyarticulaires et une progression disciplinée. Parfait pour retrouver la régularité.",
  },
  "Lean & Disciplined": {
    title: "Affûté et discipliné",
    description:
      "Un programme de conditionnement métabolique pour perdre du gras tout en bâtissant des habitudes durables de maîtrise de soi.",
  },
  "Run Your Race": {
    title: "Cours ta course",
    description:
      "Progression du canapé au 5 km avec des intervalles rythmés par l'Écriture. De l'endurance pour le corps et la foi.",
  },
  "Mobility & Rest": {
    title: "Mobilité et repos",
    description:
      "Retrouve ton amplitude de mouvement et la tranquillité. Des flows doux associés à une prière respirée guidée.",
  },
  "Warrior HIIT": {
    title: "HIIT du guerrier",
    description:
      "Des intervalles de haute intensité pour forger la force mentale. Court, brutal, efficace.",
  },
  "Bodyweight Anywhere": {
    title: "Au poids du corps, partout",
    description:
      "Pas de salle, pas d'excuses. Une progression complète de callisthénie à faire n'importe où.",
  },
};

/** Workout-day title, keyed by English title. */
export const DAY_TITLE_FR: Record<string, string> = {
  "AMRAP Chaos": "Chaos AMRAP",
  "Breath & Stillness": "Souffle et immobilité",
  "Core & Conditioning": "Gainage et conditionnement",
  "Core Focus": "Focus gainage",
  "EMOM Grind": "Grind EMOM",
  "Finisher Ladder": "Échelle finisher",
  "Full Body Flow": "Flow corps entier",
  "Full-Body Burn": "Brûle corps entier",
  "Hip & Spine Flow": "Flow hanches et colonne",
  "Interval Run": "Course fractionnée",
  "Legs Focus": "Focus jambes",
  "Long Slow Run": "Course longue et lente",
  "Lower Body Power": "Puissance bas du corps",
  "Lower Body Release": "Relâchement bas du corps",
  "Metabolic Circuit": "Circuit métabolique",
  "Pull Focus": "Focus tirage",
  "Push Focus": "Focus poussée",
  "Shoulder & T-Spine": "Épaules et dorsales",
  "Sprint Intervals": "Fractionné sprint",
  "Tabata Assault": "Assaut Tabata",
  "Tempo Run": "Course tempo",
  "Upper Body Pull": "Haut du corps — tirage",
  "Upper Body Push": "Haut du corps — poussée",
};

/** Workout-day focus, keyed by English value. */
export const DAY_FOCUS_FR: Record<string, string> = {
  "Abs, obliques": "Abdos, obliques",
  "Aerobic endurance": "Endurance aérobie",
  Anaerobic: "Anaérobie",
  "Anaerobic power": "Puissance anaérobie",
  "Back, biceps": "Dos, biceps",
  "Cardio base": "Base cardio",
  "Chest, shoulders, triceps": "Pectoraux, épaules, triceps",
  Conditioning: "Conditionnement",
  "Core, cardio": "Gainage, cardio",
  Grit: "Mental",
  "Hamstrings, calves": "Ischio-jambiers, mollets",
  "Hips, spine": "Hanches, colonne",
  "Lactate threshold": "Seuil lactique",
  "Muscular endurance": "Endurance musculaire",
  "Quads, glutes, hamstrings": "Quadriceps, fessiers, ischio-jambiers",
  "Recovery, prayer": "Récupération, prière",
  "Shoulders, upper back": "Épaules, haut du dos",
  "Strength conditioning": "Conditionnement de force",
  "Strength endurance": "Endurance de force",
  "Whole body": "Corps entier",
};

/** Exercise name, keyed by English name. */
export const EXERCISE_NAME_FR: Record<string, string> = {
  "Back Squat": "Squat arrière",
  "Barbell Row": "Rowing barre",
  "Barbell Shoulder Press": "Développé épaules à la barre",
  "Bench Dips": "Dips sur banc",
  "Bench Press": "Développé couché",
  "Box Breathing": "Respiration carrée",
  "Box Jump": "Saut sur box",
  "Calf Stretch Against Wall": "Étirement des mollets au mur",
  "Cat-Cow": "Chat-vache",
  "Chin-ups": "Tractions en supination",
  "Deep Squat Hold": "Maintien en squat profond",
  Dips: "Dips",
  "Dumbbell Bicep Curl": "Curl biceps haltères",
  "Dumbbell Split Squat": "Fente bulgare haltères",
  "Dynamic Back Stretch": "Étirement dynamique du dos",
  "Easy Treadmill Jog": "Footing léger sur tapis",
  "Freehand Jump Squat": "Squat sauté",
  "Goblet Squat": "Squat goblet",
  "Hamstring Stretch": "Étirement des ischio-jambiers",
  "Handstand Push-Up Progression": "Progression de pompes en équilibre",
  "Hanging Pike": "Relevé de jambes suspendu (pike)",
  "Hip & Glute Stretch": "Étirement hanches et fessiers",
  "Inverted Row": "Rowing inversé",
  "Kettlebell Pistol Squat": "Pistol squat kettlebell",
  "Kettlebell Thruster Ladder": "Échelle de thrusters kettlebell",
  "Leg Raises": "Relevés de jambes",
  "Medicine Ball Chest Pass": "Passe de poitrine au medicine ball",
  "Mountain Climbers": "Montées de genoux (mountain climbers)",
  "One-Arm Kettlebell Swing": "Swing kettlebell à un bras",
  Plank: "Planche",
  "Plank Hold": "Maintien en planche",
  "Power Clean": "Épaulé (power clean)",
  "Psalm 23 Breath Prayer": "Prière respirée du Psaume 23",
  "Pull-ups": "Tractions",
  "Push-up": "Pompe",
  "Push-Up to Side Plank": "Pompe à planche latérale",
  "Push-up Variations": "Variantes de pompes",
  "Renegade Row": "Rowing renégat",
  "Romanian Deadlift": "Soulevé de terre roumain",
  "Russian Twist": "Russian twist",
  "Shoulder Circles": "Rotations d'épaules",
  "Single-Leg Glute Bridge": "Pont fessier unijambe",
  "Spinal Stretch": "Étirement de la colonne",
  "Standing Hamstring and Calf Stretch": "Étirement debout ischios et mollets",
  "Stationary Bike Sprint": "Sprint vélo stationnaire",
  "Stationary Row Sprint": "Sprint rameur",
  "Stationary Rowing Intervals": "Intervalles au rameur",
  "Superman Hold": "Maintien superman",
  "Tempo Treadmill Run": "Course tempo sur tapis",
  Thruster: "Thruster",
  "Trail Run / Walk": "Course / marche en sentier",
  "Treadmill Cool-down Walk": "Marche de récupération sur tapis",
  "Treadmill Jog Intervals": "Intervalles de footing sur tapis",
  "Treadmill Walk Warm-up": "Marche d'échauffement sur tapis",
  "Walking Lunge": "Fente marchée",
  "World's Greatest Stretch": "Le meilleur étirement du monde",
};

/** Muscle group, keyed by English name. */
export const MUSCLE_FR: Record<string, string> = {
  Abdominals: "Abdominaux",
  Abductors: "Abducteurs",
  Adductors: "Adducteurs",
  Biceps: "Biceps",
  Calves: "Mollets",
  Chest: "Pectoraux",
  Forearms: "Avant-bras",
  Glutes: "Fessiers",
  Hamstrings: "Ischio-jambiers",
  Lats: "Grands dorsaux",
  "Lower Back": "Bas du dos",
  "Middle Back": "Milieu du dos",
  Neck: "Cou",
  "Nervous system": "Système nerveux",
  Quadriceps: "Quadriceps",
  Shoulders: "Épaules",
  Stillness: "Immobilité",
  Traps: "Trapèzes",
  Triceps: "Triceps",
};

/** Localize a program title/description (demo data) by its English title. */
export function localizeProgramText(
  title: string,
  description: string,
  locale: LocaleCode,
): { title: string; description: string } {
  const fr = locale === "fr" ? PROGRAM_FR[title] : undefined;
  return fr ?? { title, description };
}

/** Translate a muscle list; unknown muscles are kept as-is. */
export function localizeMuscles(muscles: string[], locale: LocaleCode): string[] {
  if (locale !== "fr") return muscles;
  return muscles.map((m) => MUSCLE_FR[m] ?? m);
}

/** Translate a workout-day title (demo data); unknown titles kept as-is. */
export function localizeDayTitle(title: string, locale: LocaleCode): string {
  return locale === "fr" ? DAY_TITLE_FR[title] ?? title : title;
}

/** Translate a workout-day focus (demo data); unknown values kept as-is. */
export function localizeDayFocus(focus: string, locale: LocaleCode): string {
  return locale === "fr" ? DAY_FOCUS_FR[focus] ?? focus : focus;
}

/** Translate an exercise name (demo data); unknown names kept as-is. */
export function localizeExerciseName(name: string, locale: LocaleCode): string {
  return locale === "fr" ? EXERCISE_NAME_FR[name] ?? name : name;
}
