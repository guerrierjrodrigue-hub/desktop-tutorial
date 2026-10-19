import { describe, it, expect } from "vitest";
import { generateRecipeDetails, type RecipeDetailsInput } from "./recipe-details";

const base = (over: Partial<RecipeDetailsInput>): RecipeDetailsInput => ({
  name: "Grilled Chicken Bowl",
  category: "muscle-gain",
  proteinG: 40,
  carbsG: 50,
  fatG: 16,
  minutes: 25,
  ...over,
});

describe("generateRecipeDetails", () => {
  it("always produces non-empty bilingual ingredients, steps, and an image", () => {
    const d = generateRecipeDetails(base({}));
    expect(d.ingredients.length).toBeGreaterThan(2);
    expect(d.ingredientsFr.length).toBe(d.ingredients.length);
    expect(d.steps.length).toBeGreaterThan(2);
    expect(d.stepsFr.length).toBe(d.steps.length);
    expect(d.imageUrl).toMatch(/^data:image\/svg\+xml,/);
  });

  it("applies correct French partitive elision", () => {
    const eggs = generateRecipeDetails(base({ name: "Egg Scramble", category: "breakfast" }));
    expect(eggs.ingredientsFr.some((l) => l.includes("d'œufs"))).toBe(true);
    // olive oil elides (silent h)
    const chicken = generateRecipeDetails(base({ name: "Chicken & Rice" }));
    expect(chicken.ingredientsFr.some((l) => l.includes("d'huile d'olive"))).toBe(true);
  });

  it("does NOT elide before aspirated-h 'haricots' or consonantal 'yaourt'", () => {
    const beans = generateRecipeDetails(base({ name: "Black Bean Bowl" }));
    const joined = beans.ingredientsFr.join(" ");
    expect(joined).toContain("de haricots");
    expect(joined).not.toContain("d'haricots");

    const yog = generateRecipeDetails(base({ name: "Cheese Crackers", category: "quick-easy" }));
    const yj = yog.ingredientsFr.join(" ");
    if (yj.includes("yaourt")) {
      expect(yj).toContain("de yaourt");
      expect(yj).not.toContain("d'yaourt");
    }
  });

  it("treats sweet dishes as sweet (fruit + cinnamon, no garlic/vegetables)", () => {
    const smoothie = generateRecipeDetails(base({ name: "Recovery Berry Smoothie", category: "quick-easy" }));
    const en = smoothie.ingredients.join(" ");
    expect(en).toContain("fruit");
    expect(en).not.toContain("garlic");
    expect(en).not.toContain("mixed vegetables");
  });

  it("is deterministic (same input -> same output)", () => {
    const a = generateRecipeDetails(base({}));
    const b = generateRecipeDetails(base({}));
    expect(a).toEqual(b);
  });

  it("scales portions up with higher macros", () => {
    const small = generateRecipeDetails(base({ proteinG: 10 }));
    const big = generateRecipeDetails(base({ proteinG: 50 }));
    const grams = (s: string) => Number(s.match(/^(\d+) g/)?.[1] ?? 0);
    expect(grams(big.ingredients[0])).toBeGreaterThan(grams(small.ingredients[0]));
  });
});
