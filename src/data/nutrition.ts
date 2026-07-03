import type { Recipe } from "@/types";

export const recipes: Recipe[] = [
  { id: "n1", name: "Warrior Protein Bowl", calories: 540, proteinG: 45, carbsG: 48, fatG: 16, minutes: 20, tags: ["High protein", "Meal prep"] },
  { id: "n2", name: "Daniel Fast Lentil Stew", calories: 380, proteinG: 22, carbsG: 55, fatG: 6, minutes: 40, tags: ["Plant-based", "Fasting"] },
  { id: "n3", name: "Sunrise Egg & Oats", calories: 420, proteinG: 28, carbsG: 44, fatG: 14, minutes: 12, tags: ["Breakfast", "Quick"] },
  { id: "n4", name: "Grilled Salmon & Greens", calories: 480, proteinG: 40, carbsG: 18, fatG: 26, minutes: 25, tags: ["Low carb", "Omega-3"] },
  { id: "n5", name: "Recovery Berry Smoothie", calories: 260, proteinG: 24, carbsG: 30, fatG: 4, minutes: 5, tags: ["Post-workout", "Quick"] },
  { id: "n6", name: "Shepherd's Chicken & Rice", calories: 610, proteinG: 46, carbsG: 62, fatG: 18, minutes: 35, tags: ["Bulk", "Family"] },
];

export const macroTargets = {
  calories: 2400,
  proteinG: 180,
  carbsG: 240,
  fatG: 70,
};
