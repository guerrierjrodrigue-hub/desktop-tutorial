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

// ---------------------------------------------------------------------------
// Recipes (PR3). Names live in the DB `name_fr` column / the map below (demo);
// tags are a controlled vocab translated at render time.
// ---------------------------------------------------------------------------

/** Recipe tag, keyed by English tag. */
export const TAG_FR: Record<string, string> = {
  Breakfast: "Petit-déjeuner",
  Bulk: "Prise de masse",
  Comfort: "Réconfort",
  Family: "Familial",
  Fasting: "Jeûne",
  "Gluten-free": "Sans gluten",
  "Healthy fats": "Bons lipides",
  "High fiber": "Riche en fibres",
  "High protein": "Riche en protéines",
  Lean: "Maigre",
  Light: "Léger",
  "Low cal": "Peu calorique",
  "Low carb": "Pauvre en glucides",
  "Low fat": "Pauvre en lipides",
  "Meal prep": "Batch cooking",
  Mediterranean: "Méditerranéen",
  "Omega-3": "Oméga-3",
  "Plant-based": "Végétal",
  "Post-workout": "Post-entraînement",
  Quick: "Rapide",
  Seafood: "Fruits de mer",
  Snack: "Collation",
  Tropical: "Tropical",
  Vegetarian: "Végétarien",
};

/** Translate a recipe tag list; unknown tags kept as-is. */
export function localizeTags(tags: string[], locale: LocaleCode): string[] {
  if (locale !== "fr") return tags;
  return tags.map((t) => TAG_FR[t] ?? t);
}

/** Recipe name, keyed by English name. "Daniel Fast" → "jeûne de Daniel". */
export const RECIPE_NAME_FR: Record<string, string> = {
  "5-Minute Tuna Salad": "Salade de thon en 5 minutes",
  "Almond Butter Toast with Banana": "Toast au beurre d'amande et banane",
  "Almond-Crusted Baked Chicken Tenders": "Aiguillettes de poulet panées aux amandes",
  "Avocado & Egg Rice Cake Stack": "Galettes de riz, avocat et œuf",
  "Baked Cod with Roasted Vegetables": "Cabillaud au four et légumes rôtis",
  "Baked Falafel & Cucumber Salad": "Falafels au four et salade de concombre",
  "Banana Protein Pancakes": "Pancakes protéinés à la banane",
  "BBQ Chicken & Rice Power Plate": "Assiette énergie poulet BBQ et riz",
  "Beef & Broccoli Stir-fry with Rice": "Sauté de bœuf et brocoli au riz",
  "Bison Burger & Sweet Potato Fries": "Burger de bison et frites de patate douce",
  "Blueberry Protein Muffins": "Muffins protéinés aux myrtilles",
  "Breakfast Burrito with Black Beans": "Burrito du matin aux haricots noirs",
  "Breakfast Quinoa Bowl with Fruit": "Bol de quinoa du matin aux fruits",
  "Breakfast Tacos with Avocado": "Tacos du matin à l'avocat",
  "Bulk Beef & Sweet Potato Bowl": "Bol prise de masse bœuf et patate douce",
  "Cabbage & Turkey Stir-fry": "Sauté de chou et dinde",
  "Canned Salmon & Crackers Plate": "Assiette saumon en conserve et crackers",
  "Cheese & Whole Grain Crackers": "Fromage et crackers complets",
  "Chicken & Vegetable Soup": "Soupe de poulet et légumes",
  "Chickpea & Spinach Stew": "Ragoût de pois chiches et épinards",
  "Chili-Lime Grilled Chicken Bowl": "Bol de poulet grillé chili-citron vert",
  "Cottage Cheese & Pineapple Bowl": "Bol de cottage cheese et ananas",
  "Cottage Cheese & Tomato Bowl": "Bol de cottage cheese et tomate",
  "Daniel Fast Lentil Stew": "Ragoût de lentilles du jeûne de Daniel",
  "Daniel Fast Vegetable Curry": "Curry de légumes du jeûne de Daniel",
  "Deli Turkey Lettuce Wraps": "Wraps de laitue à la dinde de charcuterie",
  "Double Chicken Burrito Bowl": "Bol burrito double poulet",
  "Egg White Veggie Scramble": "Brouillade de blancs d'œufs aux légumes",
  "Fruit & Nut Energy Bowl": "Bol énergie fruits et noix",
  "Fruit Smoothie Bowl (No Added Sugar)": "Bol smoothie aux fruits (sans sucre ajouté)",
  "Greek Yogurt & Granola Cup": "Coupe de yaourt grec et granola",
  "Greek Yogurt Parfait with Berries": "Parfait de yaourt grec aux fruits rouges",
  "Grilled Chicken Greek Salad": "Salade grecque au poulet grillé",
  "Grilled Portobello & Quinoa Salad": "Salade de quinoa et portobello grillé",
  "Grilled Salmon & Greens": "Saumon grillé et verdure",
  "Grilled Shrimp & Pineapple Skewers": "Brochettes de crevettes grillées et ananas",
  "Ground Beef & Pasta Bake": "Gratin de bœuf haché et pâtes",
  "Ham & Egg Breakfast Sandwich": "Sandwich du matin jambon-œuf",
  "High-Protein Chicken Fried Rice": "Riz sauté au poulet riche en protéines",
  "Hummus & Veggie Snack Plate": "Assiette collation houmous et légumes",
  "Instant Oatmeal with Peanut Butter": "Flocons d'avoine express au beurre de cacahuète",
  "Lentil & Vegetable Curry": "Curry de lentilles et légumes",
  "Lentil & Vegetable Detox Soup": "Soupe détox lentilles et légumes",
  "Loaded Egg & Cheese Breakfast Burrito": "Burrito du matin garni œuf-fromage",
  "Mass Building Trail Mix Bowl": "Bol mélange énergétique prise de masse",
  "Mass Gainer Oats with Banana & Peanut Butter":
    "Avoine prise de masse banane et beurre de cacahuète",
  "Mediterranean Tuna Bowl": "Bol de thon méditerranéen",
  "Microwave Egg Mug Scramble": "Œufs brouillés au micro-ondes en mug",
  "Microwave Sweet Potato & Black Beans": "Patate douce et haricots noirs au micro-ondes",
  "Overnight Chia Pudding": "Pudding de chia (préparé la veille)",
  "Overnight Protein Oats": "Avoine protéinée (préparée la veille)",
  "Peanut Butter Banana Oatmeal": "Flocons d'avoine beurre de cacahuète et banane",
  "Peanut Butter Banana Wrap": "Wrap beurre de cacahuète et banane",
  "Peanut Butter Protein Pancakes": "Pancakes protéinés au beurre de cacahuète",
  "Poached Egg & Smoked Salmon Plate": "Assiette œuf poché et saumon fumé",
  "Pork Tenderloin & Mashed Potatoes": "Filet de porc et purée de pommes de terre",
  "Pre-cooked Shrimp Cocktail Bowl": "Bol de crevettes cocktail prêtes à l'emploi",
  "Protein Bar & Fruit Combo": "Combo barre protéinée et fruit",
  "Protein Shake & Almonds": "Shake protéiné et amandes",
  "Protein Smoothie Bowl": "Bol smoothie protéiné",
  "Protein-Boosted Chicken Alfredo Pasta": "Pâtes Alfredo au poulet enrichies en protéines",
  "Protein-Packed Shepherd's Pie": "Hachis parmentier riche en protéines",
  "Quick Chicken Caesar Wrap": "Wrap César au poulet express",
  "Quick Veggie Quesadilla": "Quesadilla aux légumes express",
  "Quinoa Tabbouleh": "Taboulé de quinoa",
  "Raw Vegetable & Nut Butter Plate": "Assiette crudités et purée d'oléagineux",
  "Recovery Berry Smoothie": "Smoothie récupération aux fruits rouges",
  "Roasted Cauliflower Steak & Chickpeas": "Steak de chou-fleur rôti et pois chiches",
  "Roasted Eggplant & Tomato Stew": "Ragoût d'aubergine et tomate rôties",
  "Roasted Root Vegetable Medley": "Mélange de légumes racines rôtis",
  "Roasted Sweet Potato & Black Bean Bowl": "Bol de patate douce rôtie et haricots noirs",
  "Roasted Vegetable & Hummus Plate": "Assiette de légumes rôtis et houmous",
  "Rotisserie Chicken & Bagged Salad": "Poulet rôti et salade en sachet",
  "Salmon Power Bowl with Brown Rice": "Bol énergie saumon et riz complet",
  "Salmon Teriyaki with Jasmine Rice": "Saumon teriyaki et riz jasmin",
  "Seared Tilapia with Cucumber Salad": "Tilapia poêlé et salade de concombre",
  "Shakshuka (Eggs in Tomato Sauce)": "Shakshuka (œufs à la sauce tomate)",
  "Shepherd's Chicken & Rice": "Poulet et riz du berger",
  "Simple Vegetable Broth Soup": "Soupe simple au bouillon de légumes",
  "Smoked Salmon Bagel": "Bagel au saumon fumé",
  "Spicy Black Bean & Corn Salad": "Salade épicée haricots noirs et maïs",
  "Spinach & Feta Egg Muffins": "Muffins aux œufs, épinards et feta",
  "Split Pea Soup": "Soupe de pois cassés",
  "Steak & Roasted Potato Plate": "Assiette steak et pommes de terre rôties",
  "Steamed Salmon with Asparagus": "Saumon vapeur et asperges",
  "Steamed Vegetable & Brown Rice Bowl": "Bol de légumes vapeur et riz complet",
  "Steamed Vegetables with Tahini Sauce": "Légumes vapeur et sauce tahini",
  "Steel-Cut Oats with Apples & Cinnamon": "Flocons d'avoine coupés aux pommes et cannelle",
  "Sunrise Egg & Oats": "Œuf et avoine du lever",
  "Trail Mix Energy Bowl": "Bol énergie mélange de randonnée",
  "Tuna & Rice Power Bowl": "Bol énergie thon et riz",
  "Tuna Salad Stuffed Avocado": "Avocat farci à la salade de thon",
  "Turkey & Cheese Roll-ups": "Roulés dinde et fromage",
  "Turkey & Quinoa Stuffed Sweet Potato": "Patate douce farcie dinde et quinoa",
  "Turkey & Spinach Stuffed Peppers": "Poivrons farcis dinde et épinards",
  "Turkey Chili": "Chili à la dinde",
  "Turkey Lettuce Wraps": "Wraps de laitue à la dinde",
  "Turkey Meatball Sub": "Sandwich de boulettes de dinde",
  "Turkey Sausage & Sweet Potato Hash": "Poêlée de saucisse de dinde et patate douce",
  "Vegetable Barley Soup": "Soupe d'orge et légumes",
  "Vegetable Fried Brown Rice": "Riz complet sauté aux légumes",
  "Vegetable Stir-fry with Tofu": "Sauté de légumes au tofu",
  "Veggie & Cheese Omelet": "Omelette aux légumes et fromage",
  "Veggie Breakfast Wrap": "Wrap du matin aux légumes",
  "Warrior Protein Bowl": "Bol protéiné du guerrier",
  "Whole Grain Avocado Toast with Egg": "Toast complet à l'avocat et œuf",
  "Wild Rice & Roasted Vegetable Pilaf": "Pilaf de riz sauvage et légumes rôtis",
  "Zesty Lemon Herb Chicken & Asparagus": "Poulet citronné aux herbes et asperges",
  "Zucchini Noodle Shrimp Scampi": "Nouilles de courgette aux crevettes scampi",
};

/** Translate a recipe name (demo data); unknown names kept as-is. */
export function localizeRecipeName(name: string, locale: LocaleCode): string {
  return locale === "fr" ? RECIPE_NAME_FR[name] ?? name : name;
}

// ---------------------------------------------------------------------------
// Reading plans (Q3). Keyed by English title; demo + DB rows localize here.
// ---------------------------------------------------------------------------

/** Reading plan title + description, keyed by English title. */
export const READING_PLAN_FR: Record<string, { title: string; description: string }> = {
  "The Gospels in 30 Days": {
    title: "Les Évangiles en 30 jours",
    description: "Parcours la vie de Jésus, un chapitre à la fois.",
  },
  "Psalms of Strength": {
    title: "Psaumes de force",
    description: "31 jours de courage, de refuge et de louange.",
  },
  "Proverbs for Discipline": {
    title: "Proverbes pour la discipline",
    description: "Sagesse quotidienne pour une vie disciplinée.",
  },
  "Fitness & Faith": {
    title: "Forme et foi",
    description: "Lectures choisies sur la gérance du corps.",
  },
};

/** Localize a reading plan's title + description, keeping the English title in `titleEn`. */
export function localizeReadingPlan<T extends { title: string; description: string }>(
  plan: T,
  locale: LocaleCode,
): T & { titleEn: string } {
  const titleEn = plan.title;
  if (locale !== "fr") return { ...plan, titleEn };
  const fr = READING_PLAN_FR[titleEn];
  return fr ? { ...plan, titleEn, title: fr.title, description: fr.description } : { ...plan, titleEn };
}
