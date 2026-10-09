import type { Recipe } from "@/types";

export const recipes: Recipe[] = [
  { id: "n1", name: "Warrior Protein Bowl", calories: 540, proteinG: 45, carbsG: 48, fatG: 16, minutes: 20, tags: ["High protein", "Meal prep"], category: "muscle-gain" },
  { id: "n2", name: "Daniel Fast Lentil Stew", calories: 380, proteinG: 22, carbsG: 55, fatG: 6, minutes: 40, tags: ["Plant-based", "Fasting"], category: "fasting" },
  { id: "n3", name: "Sunrise Egg & Oats", calories: 420, proteinG: 28, carbsG: 44, fatG: 14, minutes: 12, tags: ["Breakfast", "Quick"], category: "breakfast" },
  { id: "n4", name: "Grilled Salmon & Greens", calories: 480, proteinG: 40, carbsG: 18, fatG: 26, minutes: 25, tags: ["Low carb", "Omega-3"], category: "weight-loss" },
  { id: "n5", name: "Recovery Berry Smoothie", calories: 260, proteinG: 24, carbsG: 30, fatG: 4, minutes: 5, tags: ["Post-workout", "Quick"], category: "quick-easy" },
  { id: "n6", name: "Shepherd's Chicken & Rice", calories: 610, proteinG: 46, carbsG: 62, fatG: 18, minutes: 35, tags: ["Bulk", "Family"], category: "muscle-gain" },
  { id: "n7", name: "Haitian Rice & Beans (Diri ak Pwa)", calories: 520, proteinG: 18, carbsG: 85, fatG: 10, minutes: 45, tags: ["Estimated", "Caribbean", "Plant-based"], category: "muscle-gain" },
  { id: "n8", name: "Grilled Snapper with Pikliz", calories: 380, proteinG: 42, carbsG: 8, fatG: 18, minutes: 30, tags: ["Estimated", "Caribbean", "High protein", "Low carb"], category: "weight-loss" },
  { id: "n9", name: "Haitian Legim with Lean Beef", calories: 410, proteinG: 35, carbsG: 24, fatG: 18, minutes: 60, tags: ["Estimated", "Caribbean", "Vegetables"], category: "muscle-gain" },
  { id: "n10", name: "Poulet Créole with Brown Rice", calories: 560, proteinG: 45, carbsG: 60, fatG: 14, minutes: 40, tags: ["Estimated", "Caribbean", "High protein"], category: "muscle-gain" },
  { id: "n11", name: "Pikliz (Spicy Slaw)", calories: 60, proteinG: 2, carbsG: 12, fatG: 1, minutes: 20, tags: ["Estimated", "Caribbean", "Vegetables", "Low cal"], category: "weight-loss" },
  { id: "n12", name: "Haitian Pumpkin Soup (Soup Joumou)", calories: 320, proteinG: 20, carbsG: 40, fatG: 8, minutes: 60, tags: ["Estimated", "Caribbean", "Comfort"], category: "quick-easy" },
  { id: "n13", name: "Black Bean & Plantain Power Bowl", calories: 480, proteinG: 20, carbsG: 78, fatG: 10, minutes: 25, tags: ["Estimated", "Caribbean", "Plant-based", "High fiber"], category: "muscle-gain" },
  { id: "n14", name: "Jerk Chicken & Mango Quinoa", calories: 520, proteinG: 44, carbsG: 52, fatG: 14, minutes: 35, tags: ["Estimated", "Caribbean", "High protein"], category: "muscle-gain" },
  { id: "n15", name: "Coconut Fish Stew", calories: 400, proteinG: 38, carbsG: 14, fatG: 20, minutes: 35, tags: ["Estimated", "Caribbean", "Omega-3", "Low carb"], category: "weight-loss" },
  { id: "n16", name: "Griot-Style Lean Pork with Cabbage", calories: 440, proteinG: 40, carbsG: 12, fatG: 24, minutes: 50, tags: ["Estimated", "Caribbean", "High protein", "Low carb"], category: "weight-loss" },
  { id: "n17", name: "Haitian Cornmeal (Mayi Moulen) with Beans", calories: 460, proteinG: 16, carbsG: 80, fatG: 9, minutes: 40, tags: ["Estimated", "Caribbean", "Plant-based"], category: "muscle-gain" },
  { id: "n18", name: "Caribbean Green Smoothie (Lime & Mango)", calories: 240, proteinG: 20, carbsG: 36, fatG: 3, minutes: 5, tags: ["Estimated", "Caribbean", "Post-workout", "Quick"], category: "quick-easy" },
  { id: "n19", name: "Québécois Turkey Pâté Chinois", calories: 540, proteinG: 40, carbsG: 55, fatG: 16, minutes: 45, tags: ["Estimated", "Québécois", "High protein", "Family"], category: "muscle-gain" },
  { id: "n20", name: "Maple-Dijon Salmon with Roasted Veg", calories: 460, proteinG: 38, carbsG: 22, fatG: 24, minutes: 30, tags: ["Estimated", "Québécois", "Omega-3"], category: "weight-loss" },
  { id: "n21", name: "Lighter Québec Baked Beans", calories: 380, proteinG: 20, carbsG: 58, fatG: 8, minutes: 50, tags: ["Estimated", "Québécois", "High fiber", "Plant-based"], category: "quick-easy" },
  { id: "n22", name: "Tourtière-Spiced Lean Bowl", calories: 500, proteinG: 38, carbsG: 45, fatG: 18, minutes: 35, tags: ["Estimated", "Québécois", "High protein"], category: "muscle-gain" },
  { id: "n23", name: "Oatmeal with Québec Maple & Walnuts", calories: 360, proteinG: 14, carbsG: 52, fatG: 12, minutes: 10, tags: ["Estimated", "Québécois", "Breakfast"], category: "breakfast" },
  { id: "n24", name: "Lentil Cretons-Style Spread on Rye", calories: 300, proteinG: 18, carbsG: 34, fatG: 10, minutes: 20, tags: ["Estimated", "Québécois", "Plant-based", "Breakfast"], category: "breakfast" },
];

export const macroTargets = {
  calories: 2400,
  proteinG: 180,
  carbsG: 240,
  fatG: 70,
};
