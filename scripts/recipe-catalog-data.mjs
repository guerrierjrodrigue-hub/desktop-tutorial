/**
 * Shared recipe catalog data — the single source of truth for both the
 * production seeding script (seed-recipe-catalog.mjs) and supabase/seed.sql
 * (fresh-install parity). Author names/macros/tags only: the `recipes` table
 * has no ingredients/instructions column, and recipe concepts + macro counts
 * aren't copyrightable the way written recipe instructions are, so these are
 * original entries rather than scraped from any recipe site.
 *
 * Categories: weight-loss, muscle-gain, fasting, breakfast, quick-easy.
 * At least 20 recipes per category below (exactly 20 each, on top of the 9
 * pre-existing catalog rows which are separately categorized).
 */

/** Categorizes the 9 recipes already in supabase/seed.sql / production. */
export const EXISTING_RECIPE_CATEGORIES = {
  "Warrior Protein Bowl": "muscle-gain",
  "Daniel Fast Lentil Stew": "fasting",
  "Sunrise Egg & Oats": "breakfast",
  "Grilled Salmon & Greens": "weight-loss",
  "Recovery Berry Smoothie": "quick-easy",
  "Shepherd's Chicken & Rice": "muscle-gain",
  "Overnight Protein Oats": "breakfast",
  "Mediterranean Tuna Bowl": "weight-loss",
  "Turkey Chili": "muscle-gain",
};

const weightLoss = [
  ["Zesty Lemon Herb Chicken & Asparagus", 380, 42, 12, 16, 25, ["Low carb", "High protein"]],
  ["Seared Tilapia with Cucumber Salad", 320, 34, 18, 10, 20, ["Light", "Omega-3"]],
  ["Turkey Lettuce Wraps", 310, 30, 20, 12, 15, ["Low carb", "Quick"]],
  ["Roasted Cauliflower Steak & Chickpeas", 360, 16, 45, 12, 30, ["Plant-based", "High fiber"]],
  ["Zucchini Noodle Shrimp Scampi", 340, 32, 22, 12, 20, ["Low carb", "Seafood"]],
  ["Grilled Chicken Greek Salad", 400, 38, 24, 16, 20, ["Mediterranean", "High protein"]],
  ["Baked Cod with Roasted Vegetables", 350, 36, 26, 10, 30, ["Lean", "Omega-3"]],
  ["Egg White Veggie Scramble", 280, 30, 14, 8, 12, ["Low cal", "Quick"]],
  ["Spicy Black Bean & Corn Salad", 330, 18, 48, 8, 15, ["Plant-based", "High fiber"]],
  ["Grilled Shrimp & Pineapple Skewers", 310, 30, 28, 8, 20, ["Low fat", "Tropical"]],
  ["Chicken & Vegetable Soup", 300, 28, 26, 8, 35, ["Comfort", "Low cal"]],
  ["Tuna Salad Stuffed Avocado", 400, 32, 14, 24, 10, ["High protein", "Healthy fats"]],
  ["Turkey & Spinach Stuffed Peppers", 380, 34, 28, 14, 40, ["Meal prep", "Low carb"]],
  ["Steamed Salmon with Asparagus", 420, 38, 10, 24, 20, ["Omega-3", "Low carb"]],
  ["Almond-Crusted Baked Chicken Tenders", 360, 40, 14, 16, 30, ["High protein", "Gluten-free"]],
  ["Cabbage & Turkey Stir-fry", 330, 30, 24, 12, 20, ["Low carb", "Quick"]],
  ["Lentil & Vegetable Detox Soup", 300, 18, 44, 6, 35, ["Plant-based", "High fiber"]],
  ["Grilled Portobello & Quinoa Salad", 360, 16, 46, 12, 25, ["Vegetarian", "High fiber"]],
  ["Poached Egg & Smoked Salmon Plate", 340, 28, 8, 22, 10, ["Low carb", "High protein"]],
  ["Chili-Lime Grilled Chicken Bowl", 400, 38, 30, 12, 25, ["Meal prep", "High protein"]],
].map(([name, calories, proteinG, carbsG, fatG, minutes, tags]) => ({
  name, calories, proteinG, carbsG, fatG, minutes, tags, category: "weight-loss",
}));

const muscleGain = [
  ["Bulk Beef & Sweet Potato Bowl", 680, 48, 65, 22, 35, ["Bulk", "Meal prep"]],
  ["Double Chicken Burrito Bowl", 650, 50, 70, 18, 30, ["High protein", "Meal prep"]],
  ["Salmon Power Bowl with Brown Rice", 620, 42, 60, 20, 25, ["Omega-3", "Bulk"]],
  ["Steak & Roasted Potato Plate", 700, 46, 55, 28, 30, ["Bulk", "High protein"]],
  ["Peanut Butter Protein Pancakes", 580, 40, 55, 20, 20, ["Breakfast", "High protein"]],
  ["Ground Beef & Pasta Bake", 720, 44, 68, 24, 40, ["Bulk", "Family"]],
  ["Mass Gainer Oats with Banana & Peanut Butter", 600, 32, 75, 18, 10, ["Bulk", "Quick"]],
  ["BBQ Chicken & Rice Power Plate", 650, 48, 62, 16, 30, ["High protein", "Meal prep"]],
  ["Salmon Teriyaki with Jasmine Rice", 640, 40, 66, 18, 25, ["Omega-3", "Bulk"]],
  ["Turkey Meatball Sub", 600, 42, 58, 18, 35, ["High protein", "Family"]],
  ["Bison Burger & Sweet Potato Fries", 680, 44, 52, 26, 35, ["Bulk", "High protein"]],
  ["Loaded Egg & Cheese Breakfast Burrito", 620, 36, 50, 28, 15, ["Breakfast", "Bulk"]],
  ["Protein-Boosted Chicken Alfredo Pasta", 700, 46, 64, 24, 30, ["Bulk", "Comfort"]],
  ["Tuna & Rice Power Bowl", 580, 44, 60, 12, 20, ["High protein", "Meal prep"]],
  ["Beef & Broccoli Stir-fry with Rice", 640, 42, 58, 20, 25, ["Bulk", "Quick"]],
  ["Protein-Packed Shepherd's Pie", 660, 40, 55, 24, 45, ["Comfort", "Family"]],
  ["High-Protein Chicken Fried Rice", 610, 40, 62, 18, 25, ["Bulk", "Meal prep"]],
  ["Pork Tenderloin & Mashed Potatoes", 640, 42, 50, 24, 35, ["Bulk", "Family"]],
  ["Mass Building Trail Mix Bowl", 560, 28, 60, 22, 10, ["Bulk", "Quick"]],
  ["Turkey & Quinoa Stuffed Sweet Potato", 590, 38, 62, 16, 40, ["Meal prep", "High protein"]],
].map(([name, calories, proteinG, carbsG, fatG, minutes, tags]) => ({
  name, calories, proteinG, carbsG, fatG, minutes, tags, category: "muscle-gain",
}));

const fasting = [
  ["Daniel Fast Vegetable Curry", 340, 12, 52, 10, 35, ["Plant-based", "Fasting"]],
  ["Roasted Root Vegetable Medley", 300, 6, 50, 8, 40, ["Plant-based", "Fasting"]],
  ["Chickpea & Spinach Stew", 360, 16, 48, 10, 30, ["Plant-based", "Fasting"]],
  ["Quinoa Tabbouleh", 320, 10, 46, 10, 20, ["Plant-based", "Fasting"]],
  ["Lentil & Vegetable Curry", 350, 16, 50, 8, 35, ["Plant-based", "Fasting"]],
  ["Roasted Vegetable & Hummus Plate", 310, 12, 40, 12, 15, ["Plant-based", "Fasting"]],
  ["Vegetable Barley Soup", 290, 10, 48, 5, 40, ["Plant-based", "Fasting"]],
  ["Steamed Vegetable & Brown Rice Bowl", 330, 10, 55, 6, 30, ["Plant-based", "Fasting"]],
  ["Fruit & Nut Energy Bowl", 300, 8, 42, 12, 10, ["Plant-based", "Fasting"]],
  ["Roasted Sweet Potato & Black Bean Bowl", 360, 14, 55, 8, 35, ["Plant-based", "Fasting"]],
  ["Vegetable Stir-fry with Tofu", 340, 18, 38, 12, 20, ["Plant-based", "Fasting"]],
  ["Wild Rice & Roasted Vegetable Pilaf", 320, 9, 54, 8, 40, ["Plant-based", "Fasting"]],
  ["Simple Vegetable Broth Soup", 220, 6, 30, 4, 25, ["Plant-based", "Fasting"]],
  ["Baked Falafel & Cucumber Salad", 350, 14, 46, 12, 30, ["Plant-based", "Fasting"]],
  ["Steamed Vegetables with Tahini Sauce", 300, 8, 34, 14, 20, ["Plant-based", "Fasting"]],
  ["Fruit Smoothie Bowl (No Added Sugar)", 280, 6, 52, 6, 10, ["Plant-based", "Fasting"]],
  ["Roasted Eggplant & Tomato Stew", 290, 8, 40, 10, 35, ["Plant-based", "Fasting"]],
  ["Vegetable Fried Brown Rice", 340, 10, 58, 8, 20, ["Plant-based", "Fasting"]],
  ["Split Pea Soup", 320, 18, 48, 4, 40, ["Plant-based", "Fasting"]],
  ["Raw Vegetable & Nut Butter Plate", 280, 10, 30, 14, 10, ["Plant-based", "Fasting"]],
].map(([name, calories, proteinG, carbsG, fatG, minutes, tags]) => ({
  name, calories, proteinG, carbsG, fatG, minutes, tags, category: "fasting",
}));

const breakfast = [
  ["Greek Yogurt Parfait with Berries", 320, 22, 40, 8, 8, ["Breakfast", "Quick"]],
  ["Veggie & Cheese Omelet", 380, 28, 10, 24, 15, ["Breakfast", "High protein"]],
  ["Whole Grain Avocado Toast with Egg", 400, 20, 38, 20, 12, ["Breakfast", "Healthy fats"]],
  ["Banana Protein Pancakes", 420, 26, 48, 12, 15, ["Breakfast", "High protein"]],
  ["Cottage Cheese & Pineapple Bowl", 300, 26, 30, 6, 5, ["Breakfast", "Quick"]],
  ["Breakfast Burrito with Black Beans", 440, 26, 42, 18, 15, ["Breakfast", "Meal prep"]],
  ["Overnight Chia Pudding", 340, 14, 38, 16, 5, ["Breakfast", "Meal prep"]],
  ["Spinach & Feta Egg Muffins", 320, 24, 8, 20, 25, ["Breakfast", "Meal prep"]],
  ["Peanut Butter Banana Oatmeal", 400, 18, 55, 14, 10, ["Breakfast", "Quick"]],
  ["Smoked Salmon Bagel", 420, 26, 44, 16, 10, ["Breakfast", "Omega-3"]],
  ["Breakfast Quinoa Bowl with Fruit", 360, 14, 58, 8, 15, ["Breakfast", "Plant-based"]],
  ["Turkey Sausage & Sweet Potato Hash", 400, 28, 34, 18, 25, ["Breakfast", "High protein"]],
  ["Blueberry Protein Muffins", 300, 18, 36, 10, 20, ["Breakfast", "Meal prep"]],
  ["Veggie Breakfast Wrap", 350, 20, 38, 14, 12, ["Breakfast", "Quick"]],
  ["Almond Butter Toast with Banana", 380, 16, 46, 16, 8, ["Breakfast", "Quick"]],
  ["Shakshuka (Eggs in Tomato Sauce)", 360, 22, 24, 20, 25, ["Breakfast", "Comfort"]],
  ["Protein Smoothie Bowl", 350, 28, 40, 8, 8, ["Breakfast", "High protein"]],
  ["Ham & Egg Breakfast Sandwich", 420, 28, 36, 18, 12, ["Breakfast", "Quick"]],
  ["Steel-Cut Oats with Apples & Cinnamon", 340, 12, 58, 8, 20, ["Breakfast", "Plant-based"]],
  ["Breakfast Tacos with Avocado", 400, 24, 36, 18, 15, ["Breakfast", "Quick"]],
].map(([name, calories, proteinG, carbsG, fatG, minutes, tags]) => ({
  name, calories, proteinG, carbsG, fatG, minutes, tags, category: "breakfast",
}));

const quickEasy = [
  ["5-Minute Tuna Salad", 320, 30, 12, 16, 5, ["Quick", "High protein"]],
  ["Microwave Egg Mug Scramble", 280, 22, 6, 18, 5, ["Quick", "High protein"]],
  ["Rotisserie Chicken & Bagged Salad", 380, 36, 14, 18, 10, ["Quick", "High protein"]],
  ["Peanut Butter Banana Wrap", 400, 16, 46, 16, 5, ["Quick", "Meal prep"]],
  ["Greek Yogurt & Granola Cup", 300, 20, 38, 8, 3, ["Quick", "Breakfast"]],
  ["Turkey & Cheese Roll-ups", 280, 28, 4, 16, 5, ["Quick", "Low carb"]],
  ["Canned Salmon & Crackers Plate", 340, 28, 24, 14, 5, ["Quick", "Omega-3"]],
  ["Hummus & Veggie Snack Plate", 300, 12, 32, 14, 8, ["Quick", "Plant-based"]],
  ["Microwave Sweet Potato & Black Beans", 360, 14, 60, 6, 10, ["Quick", "Plant-based"]],
  ["Protein Shake & Almonds", 320, 30, 18, 14, 3, ["Quick", "Post-workout"]],
  ["Deli Turkey Lettuce Wraps", 260, 26, 8, 12, 8, ["Quick", "Low carb"]],
  ["Instant Oatmeal with Peanut Butter", 380, 16, 48, 14, 5, ["Quick", "Breakfast"]],
  ["Cottage Cheese & Tomato Bowl", 260, 24, 12, 10, 5, ["Quick", "Low cal"]],
  ["Pre-cooked Shrimp Cocktail Bowl", 250, 28, 18, 6, 8, ["Quick", "Seafood"]],
  ["Cheese & Whole Grain Crackers", 320, 16, 30, 16, 3, ["Quick", "Snack"]],
  ["Quick Chicken Caesar Wrap", 400, 32, 32, 18, 10, ["Quick", "High protein"]],
  ["Trail Mix Energy Bowl", 340, 12, 34, 20, 3, ["Quick", "Snack"]],
  ["Avocado & Egg Rice Cake Stack", 300, 14, 26, 18, 8, ["Quick", "Healthy fats"]],
  ["Quick Veggie Quesadilla", 380, 18, 40, 16, 10, ["Quick", "Vegetarian"]],
  ["Protein Bar & Fruit Combo", 300, 20, 34, 10, 2, ["Quick", "Snack"]],
].map(([name, calories, proteinG, carbsG, fatG, minutes, tags]) => ({
  name, calories, proteinG, carbsG, fatG, minutes, tags, category: "quick-easy",
}));

/** 100 new original recipes — 20 per category. */
export const NEW_RECIPES = [...weightLoss, ...muscleGain, ...fasting, ...breakfast, ...quickEasy];
