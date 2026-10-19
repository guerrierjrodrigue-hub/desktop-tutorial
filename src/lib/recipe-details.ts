/**
 * Pure, deterministic generator for ESTIMATED recipe details — ingredients,
 * steps, and an illustrative photo — derived from a recipe's English name,
 * category and macros.
 *
 * Why: the catalog stores only names + macro counts, so detail pages had nothing
 * to show. Rather than ship empty pages we derive plausible, clearly-estimated
 * ingredients/steps (amounts scaled from the stored macros) in both languages.
 * The UI labels all of it as an "estimation". If a recipe's `ingredients`/`steps`
 * columns are later filled with real content, callers prefer that over this.
 *
 * No I/O, no side effects — safe to import on the server and to unit-test.
 */

export interface RecipeDetailsInput {
  /** The ENGLISH recipe name — keyword matching assumes it. */
  name: string;
  category: string | null;
  proteinG: number;
  carbsG: number;
  fatG: number;
  minutes: number;
}

export interface RecipeDetails {
  ingredients: string[];
  ingredientsFr: string[];
  steps: string[];
  stepsFr: string[];
  imageUrl: string;
}

interface Food {
  en: string;
  fr: string;
  frDef: string;
}

const round5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);
const round10 = (n: number) => Math.max(10, Math.round(n / 10) * 10);

// Each food carries: en (bare English), fr (bare French, for "X g de …"), and
// frDef (French with a correct definite article/determiner, for step sentences —
// avoids wrong-gender "le dinde"). `partitif()` elides de→d'.
const PROT: Record<string, Food> = {
  salmon: { en: "salmon fillet", fr: "filet de saumon", frDef: "le filet de saumon" },
  snapper: { en: "snapper fillet", fr: "filet de vivaneau", frDef: "le filet de vivaneau" },
  tilapia: { en: "tilapia fillet", fr: "filet de tilapia", frDef: "le filet de tilapia" },
  cod: { en: "cod fillet", fr: "filet de cabillaud", frDef: "le filet de cabillaud" },
  tuna: { en: "canned tuna", fr: "thon en conserve", frDef: "le thon" },
  shrimp: { en: "shrimp", fr: "crevettes", frDef: "les crevettes" },
  fish: { en: "white fish fillet", fr: "filet de poisson blanc", frDef: "le filet de poisson" },
  chicken: { en: "chicken breast", fr: "blanc de poulet", frDef: "le blanc de poulet" },
  turkey: { en: "lean ground turkey", fr: "dinde hachée maigre", frDef: "la dinde hachée" },
  beef: { en: "lean beef", fr: "bœuf maigre", frDef: "le bœuf" },
  pork: { en: "lean pork", fr: "porc maigre", frDef: "le porc" },
  eggs: { en: "eggs", fr: "œufs", frDef: "les œufs" },
  tofu: { en: "firm tofu", fr: "tofu ferme", frDef: "le tofu" },
  lentils: { en: "dry lentils", fr: "lentilles sèches", frDef: "les lentilles" },
  chickpeas: { en: "chickpeas", fr: "pois chiches", frDef: "les pois chiches" },
  beans: { en: "black beans", fr: "haricots noirs", frDef: "les haricots" },
  splitpeas: { en: "split peas", fr: "pois cassés", frDef: "les pois cassés" },
  cottage: { en: "cottage cheese", fr: "cottage cheese", frDef: "le cottage cheese" },
  yogurt: { en: "Greek yogurt", fr: "yaourt grec", frDef: "le yaourt grec" },
  powder: { en: "protein powder", fr: "poudre protéinée", frDef: "la poudre protéinée" },
  bar: { en: "a protein bar", fr: "barre protéinée", frDef: "la barre protéinée" },
  lean: { en: "lean protein", fr: "protéine maigre", frDef: "la protéine" },
};

const CARB: Record<string, Food> = {
  brownRice: { en: "brown rice", fr: "riz complet", frDef: "le riz complet" },
  jasmine: { en: "jasmine rice", fr: "riz jasmin", frDef: "le riz jasmin" },
  wild: { en: "wild rice", fr: "riz sauvage", frDef: "le riz sauvage" },
  rice: { en: "rice", fr: "riz", frDef: "le riz" },
  quinoa: { en: "quinoa", fr: "quinoa", frDef: "le quinoa" },
  oats: { en: "rolled oats", fr: "flocons d'avoine", frDef: "les flocons d'avoine" },
  pasta: { en: "pasta", fr: "pâtes", frDef: "les pâtes" },
  sweetPotato: { en: "sweet potato", fr: "patate douce", frDef: "la patate douce" },
  potatoes: { en: "potatoes", fr: "pommes de terre", frDef: "les pommes de terre" },
  plantain: { en: "ripe plantain", fr: "banane plantain mûre", frDef: "la banane plantain" },
  cornmeal: { en: "cornmeal", fr: "semoule de maïs", frDef: "la semoule de maïs" },
  barley: { en: "pearl barley", fr: "orge perlé", frDef: "l'orge perlé" },
  bagel: { en: "a whole-grain bagel", fr: "bagel complet", frDef: "le bagel complet" },
  bread: { en: "whole-grain bread", fr: "pain complet", frDef: "le pain complet" },
  tortilla: { en: "whole-grain tortillas", fr: "tortillas complètes", frDef: "les tortillas" },
  greens: { en: "mixed salad greens", fr: "mélange de salade", frDef: "le mélange de salade" },
  veg: { en: "mixed vegetables", fr: "légumes variés", frDef: "les légumes" },
  grains: { en: "whole grains", fr: "céréales complètes", frDef: "les céréales complètes" },
  none: { en: "", fr: "", frDef: "" },
};

/**
 * French partitive with elision: "de riz" but "d'œufs", "d'huile". Only elides
 * before a vowel sound — not the aspirated h of "haricots" nor the consonantal y
 * of "yaourt"; "huile" (silent h) is the one h-word here that does elide.
 */
function partitif(fr: string): string {
  if (/^huile/i.test(fr)) return `d'${fr}`;
  return /^[aeiouàâäéèêëîïôöùûüœæ]/i.test(fr) ? `d'${fr}` : `de ${fr}`;
}

/** Sweet dishes get fruit + cinnamon instead of vegetables + garlic. */
function isSweet(name: string, meth: string): boolean {
  return (
    meth === "blend" ||
    meth === "oats" ||
    meth === "griddle" ||
    /smoothie|pancake|muffin|parfait|yogurt|yaourt|granola|chia|fruit|banana|banane|maple|érable|apple|pomme|cinnamon|cannelle|almond butter|beurre d'amande|peanut butter|beurre de cacahuète/i.test(
      name,
    )
  );
}

function proteinFood(name: string, category: string | null): Food {
  const n = name.toLowerCase();
  const map: [RegExp, Food][] = [
    [/salmon|saumon/, PROT.salmon],
    [/snapper|vivaneau/, PROT.snapper],
    [/tilapia/, PROT.tilapia],
    [/\bcod\b|cabillaud/, PROT.cod],
    [/tuna|thon/, PROT.tuna],
    [/shrimp|crevette/, PROT.shrimp],
    [/\bfish\b|poisson/, PROT.fish],
    [/chicken|poulet/, PROT.chicken],
    [/turkey|dinde/, PROT.turkey],
    [/beef|bœuf|steak|bison/, PROT.beef],
    [/pork|porc|griot|ham|jambon/, PROT.pork],
    [/egg|œuf|oeuf|scramble|omelet|omelette|shakshuka/, PROT.eggs],
    [/tofu/, PROT.tofu],
    [/lentil|lentille/, PROT.lentils],
    [/chickpea|pois chiche|falafel|hummus|houmous/, PROT.chickpeas],
    [/black bean|haricots noirs|bean|haricot|pwa/, PROT.beans],
    [/split pea|pois cassés/, PROT.splitpeas],
    [/cottage cheese/, PROT.cottage],
    [/yogurt|yaourt|parfait/, PROT.yogurt],
    [/smoothie|shake/, PROT.powder],
    [/protein bar|barre protéinée/, PROT.bar],
  ];
  for (const [re, food] of map) if (re.test(n)) return food;
  const byCat: Record<string, Food> = {
    "muscle-gain": PROT.chicken,
    "weight-loss": PROT.fish,
    fasting: PROT.lentils,
    breakfast: PROT.eggs,
    "quick-easy": PROT.yogurt,
  };
  return (category && byCat[category]) || PROT.lean;
}

function carbBase(name: string, category: string | null): Food {
  const n = name.toLowerCase();
  const map: [RegExp, Food][] = [
    [/brown rice|riz complet|riz brun/, CARB.brownRice],
    [/jasmine rice|riz jasmin/, CARB.jasmine],
    [/wild rice|riz sauvage/, CARB.wild],
    [/rice|riz|diri/, CARB.rice],
    [/quinoa/, CARB.quinoa],
    [/oat|avoine|gruau|oatmeal/, CARB.oats],
    [/pasta|pâtes|alfredo|scampi|noodle|nouille/, CARB.pasta],
    [/sweet potato|patate douce/, CARB.sweetPotato],
    [/potato|pomme de terre|mashed|purée|tourtière|chinois|parmentier|shepherd/, CARB.potatoes],
    [/plantain|banane plantain/, CARB.plantain],
    [/cornmeal|mayi/, CARB.cornmeal],
    [/barley|orge/, CARB.barley],
    [/bagel/, CARB.bagel],
    [/toast|bread|pain|rye|sandwich|sub|bun|burger/, CARB.bread],
    [/tortilla|wrap|burrito|taco|quesadilla/, CARB.tortilla],
    [/pancake|muffin|granola|cracker|chia|banana/, CARB.none],
  ];
  for (const [re, base] of map) if (re.test(n)) return base;
  const byCat: Record<string, Food> = {
    "muscle-gain": CARB.brownRice,
    "weight-loss": CARB.greens,
    fasting: CARB.veg,
    breakfast: CARB.oats,
    "quick-easy": CARB.bread,
  };
  return (category && byCat[category]) || CARB.grains;
}

function fatSource(name: string): Food {
  const n = name.toLowerCase();
  if (/avocado|avocat/.test(n)) return { en: "avocado", fr: "avocat", frDef: "l'avocat" };
  if (/peanut|cacahuète|almond butter|beurre d'amande|nut butter|oléagineux/.test(n))
    return { en: "nut butter", fr: "purée d'oléagineux", frDef: "la purée d'oléagineux" };
  if (/coconut|coco/.test(n)) return { en: "coconut milk", fr: "lait de coco", frDef: "le lait de coco" };
  if (/cheese|fromage|feta|cottage/.test(n)) return { en: "grated cheese", fr: "fromage râpé", frDef: "le fromage râpé" };
  if (/tahini/.test(n)) return { en: "tahini", fr: "tahini", frDef: "le tahini" };
  if (/almond|walnut|noix|trail mix|nut/.test(n)) return { en: "chopped nuts", fr: "noix concassées", frDef: "les noix concassées" };
  return { en: "olive oil", fr: "huile d'olive", frDef: "l'huile d'olive" };
}

function method(name: string): string {
  const n = name.toLowerCase();
  if (/smoothie|shake/.test(n)) return "blend";
  if (/soup|soupe|stew|ragoût|chili|curry|joumou|broth|bouillon/.test(n)) return "simmer";
  if (/salad|salade|slaw|pikliz|tabbouleh|taboulé|wraps?|roll-?up|parfait|cup|coupe|plate|assiette|snack|combo|crudités/.test(n))
    return "assemble";
  if (/bake|four|muffin|pie|hachis|parmentier|chinois|tourtière|casserole|gratin/.test(n)) return "bake";
  if (/pancake/.test(n)) return "griddle";
  if (/scramble|omelet|omelette|shakshuka|egg mug|brouillade/.test(n)) return "pan-eggs";
  if (/oat|avoine|gruau|oatmeal|chia|porridge/.test(n)) return "oats";
  if (/toast|bagel|sandwich|burrito|taco|quesadilla|wrap|rice cake|galette/.test(n)) return "assemble";
  if (/stir-?fry|sauté|fried rice|teriyaki/.test(n)) return "stir-fry";
  if (/grill|grillé|skewer|brochette|jerk|bbq/.test(n)) return "grill";
  if (/steam|vapeur|poach|poché/.test(n)) return "steam";
  return "cook";
}

/** A small deterministic hash → hue, for the illustrative gradient. */
function hueFromName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

/** An inline SVG "photo": a warm gradient plate, deterministic per recipe. */
function buildImage(name: string): string {
  const hue = hueFromName(name);
  const h2 = (hue + 40) % 360;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='480'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='hsl(${hue},62%,52%)'/>` +
    `<stop offset='1' stop-color='hsl(${h2},58%,38%)'/>` +
    `</linearGradient></defs>` +
    `<rect width='800' height='480' fill='url(#g)'/>` +
    `<circle cx='400' cy='240' r='130' fill='rgba(255,255,255,0.16)'/>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Generate estimated details for one recipe. */
export function generateRecipeDetails(r: RecipeDetailsInput): RecipeDetails {
  const prot = proteinFood(r.name, r.category);
  let carb = carbBase(r.name, r.category);
  let fat = fatSource(r.name);
  const meth = method(r.name);
  if (meth === "blend") carb = CARB.none;
  if (isSweet(r.name, meth) && fat.en === "olive oil") {
    fat = { en: "nut butter", fr: "purée d'oléagineux", frDef: "la purée d'oléagineux" };
  }

  const protG = round10(r.proteinG * 2.3);
  const carbG = round10(r.carbsG * 1.8);
  const fatG = round5(r.fatG * 1.2);

  const sweet = isSweet(r.name, meth);
  const ing: string[] = [];
  const ingFr: string[] = [];
  ing.push(`${protG} g ${prot.en}`);
  ingFr.push(`${protG} g ${partitif(prot.fr)}`);
  if (carb.en) {
    ing.push(`${carbG} g ${carb.en}`);
    ingFr.push(`${carbG} g ${partitif(carb.fr)}`);
  }
  if (sweet) {
    ing.push("1 cup fruit (berries or banana)");
    ingFr.push("1 tasse de fruits (fruits rouges ou banane)");
  } else {
    ing.push("2 cups mixed vegetables");
    ingFr.push("2 tasses de légumes variés");
  }
  ing.push(`${fatG} g ${fat.en}`);
  ingFr.push(`${fatG} g ${partitif(fat.fr)}`);
  if (sweet) {
    ing.push("cinnamon or a drizzle of honey to taste");
    ingFr.push("cannelle ou un filet de miel au goût");
  } else {
    ing.push("1 clove garlic, salt, pepper, and herbs to taste");
    ingFr.push("1 gousse d'ail, sel, poivre et herbes au goût");
  }

  const mins = r.minutes || 20;
  const serveEn = "Season to taste";
  const serveFr = "Assaisonne au goût";
  let steps: string[];
  let stepsFr: string[];
  switch (meth) {
    case "blend":
      steps = [
        `Add the ${prot.en} and vegetables or fruit to a blender.`,
        "Pour in liquid (water or milk) to reach the texture you like.",
        "Blend until completely smooth.",
        "Pour into a glass or bowl and serve right away.",
      ];
      stepsFr = [
        `Mets ${prot.frDef} et les fruits ou légumes dans un blender.`,
        "Ajoute du liquide (eau ou lait) pour obtenir la texture voulue.",
        "Mixe jusqu'à consistance lisse.",
        "Verse dans un verre ou un bol et sers aussitôt.",
      ];
      break;
    case "simmer":
      steps = [
        "Soften the garlic and vegetables in a pot over medium heat.",
        `Add the ${prot.en}${carb.en ? ` and ${carb.en}` : ""}, then cover with water or broth.`,
        `Simmer gently for about ${mins} minutes, stirring now and then.`,
        `${serveEn} and serve warm.`,
      ];
      stepsFr = [
        "Fais revenir l'ail et les légumes dans une casserole à feu moyen.",
        `Ajoute ${prot.frDef}${carb.frDef ? ` et ${carb.frDef}` : ""}, puis couvre d'eau ou de bouillon.`,
        `Laisse mijoter environ ${mins} minutes en remuant de temps en temps.`,
        `${serveFr} et sers chaud.`,
      ];
      break;
    case "assemble":
      steps = [
        `Prepare the ${prot.en} (drain, slice, or cook if needed).`,
        "Chop the vegetables and any fresh toppings.",
        `Combine everything${carb.en ? ` with the ${carb.en}` : ""} in a bowl or on a plate.`,
        `${serveEn}, add the ${fat.en}, and serve.`,
      ];
      stepsFr = [
        `Prépare ${prot.frDef} (égoutte, tranche ou cuis si besoin).`,
        "Coupe les légumes et les garnitures fraîches.",
        `Assemble le tout${carb.frDef ? ` avec ${carb.frDef}` : ""} dans un bol ou une assiette.`,
        `${serveFr}, ajoute ${fat.frDef} et sers.`,
      ];
      break;
    case "bake":
      steps = [
        "Heat the oven to 200°C (400°F).",
        `Season the ${prot.en} and arrange it with the vegetables${carb.en ? ` and ${carb.en}` : ""} in a dish.`,
        `Bake for about ${mins} minutes, until cooked through and golden.`,
        `${serveEn} and serve hot.`,
      ];
      stepsFr = [
        "Préchauffe le four à 200°C (400°F).",
        `Assaisonne ${prot.frDef} et dispose-le avec les légumes${carb.frDef ? ` et ${carb.frDef}` : ""} dans un plat.`,
        `Enfourne environ ${mins} minutes, jusqu'à cuisson complète et coloration dorée.`,
        `${serveFr} et sers chaud.`,
      ];
      break;
    case "griddle":
      steps = [
        `Whisk the ${prot.en} with the dry ingredients into a smooth batter.`,
        "Heat a lightly oiled pan over medium heat.",
        "Cook each pancake 2–3 minutes per side, until set and golden.",
        "Stack, add toppings, and serve warm.",
      ];
      stepsFr = [
        `Fouette ${prot.frDef} avec les ingrédients secs en une pâte lisse.`,
        "Chauffe une poêle légèrement huilée à feu moyen.",
        "Cuis chaque pancake 2 à 3 minutes par face, jusqu'à coloration dorée.",
        "Empile, ajoute les garnitures et sers tiède.",
      ];
      break;
    case "pan-eggs":
      steps = [
        "Beat the eggs and season them.",
        "Soften the vegetables in a lightly oiled pan over medium heat.",
        "Pour in the eggs and cook gently, folding until just set.",
        `${serveEn} and serve right away.`,
      ];
      stepsFr = [
        "Bats les œufs et assaisonne-les.",
        "Fais revenir les légumes dans une poêle légèrement huilée à feu moyen.",
        "Verse les œufs et cuis doucement en repliant jusqu'à prise.",
        `${serveFr} et sers aussitôt.`,
      ];
      break;
    case "oats":
      steps = [
        `Combine the ${carb.en || "oats"} with water or milk in a pot or jar.`,
        "Cook on the stove (or soak overnight) until creamy.",
        "Stir in the protein and toppings.",
        "Serve warm or chilled.",
      ];
      stepsFr = [
        `Mélange ${carb.frDef || "les flocons d'avoine"} avec de l'eau ou du lait dans une casserole ou un bocal.`,
        "Cuis sur le feu (ou laisse reposer une nuit) jusqu'à consistance crémeuse.",
        "Incorpore la protéine et les garnitures.",
        "Sers chaud ou froid.",
      ];
      break;
    case "stir-fry":
      steps = [
        `Heat a wok or large pan and sear the ${prot.en}.`,
        "Add the vegetables and stir-fry over high heat until crisp-tender.",
        `Stir in${carb.en ? ` the cooked ${carb.en} and` : ""} the sauce and toss to coat.`,
        `Serve hot after about ${mins} minutes total.`,
      ];
      stepsFr = [
        `Chauffe un wok ou une grande poêle et saisis ${prot.frDef}.`,
        "Ajoute les légumes et fais sauter à feu vif jusqu'à ce qu'ils soient croquants.",
        `Incorpore${carb.frDef ? ` ${carb.frDef} cuit et` : ""} la sauce et mélange pour enrober.`,
        `Sers chaud après environ ${mins} minutes au total.`,
      ];
      break;
    case "grill":
      steps = [
        `Season the ${prot.en} and heat the grill or a grill pan.`,
        `Grill the ${prot.en} until cooked through, turning once.`,
        `Grill or prepare the vegetables${carb.en ? ` and warm the ${carb.en}` : ""}.`,
        `Plate everything, ${serveEn.toLowerCase()}, and serve.`,
      ];
      stepsFr = [
        `Assaisonne ${prot.frDef} et chauffe le gril ou une poêle-gril.`,
        `Grille ${prot.frDef} jusqu'à cuisson complète en le retournant une fois.`,
        `Grille ou prépare les légumes${carb.frDef ? ` et réchauffe ${carb.frDef}` : ""}.`,
        `Dresse le tout, ${serveFr.toLowerCase()}, et sers.`,
      ];
      break;
    case "steam":
      steps = [
        `Steam the ${prot.en} until just cooked and tender.`,
        "Steam the vegetables until bright and crisp-tender.",
        `Prepare${carb.en ? ` the ${carb.en} and` : ""} any sauce.`,
        `Plate, ${serveEn.toLowerCase()}, and serve.`,
      ];
      stepsFr = [
        `Fais cuire ${prot.frDef} à la vapeur jusqu'à ce qu'il soit tendre.`,
        "Cuis les légumes à la vapeur jusqu'à ce qu'ils soient bien verts et croquants.",
        `Prépare${carb.frDef ? ` ${carb.frDef} et` : ""} la sauce éventuelle.`,
        `Dresse, ${serveFr.toLowerCase()}, et sers.`,
      ];
      break;
    default:
      steps = [
        `Season and cook the ${prot.en} over medium heat until done.`,
        `Prepare the vegetables${carb.en ? ` and the ${carb.en}` : ""}.`,
        "Combine everything in a bowl or on a plate.",
        `${serveEn}, add the ${fat.en}, and serve.`,
      ];
      stepsFr = [
        `Assaisonne et cuis ${prot.frDef} à feu moyen jusqu'à cuisson.`,
        `Prépare les légumes${carb.frDef ? ` et ${carb.frDef}` : ""}.`,
        "Assemble le tout dans un bol ou une assiette.",
        `${serveFr}, ajoute ${fat.frDef} et sers.`,
      ];
  }

  return { ingredients: ing, ingredientsFr: ingFr, steps, stepsFr, imageUrl: buildImage(r.name) };
}
