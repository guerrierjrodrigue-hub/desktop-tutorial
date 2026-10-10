"use client";

import { useMemo, useState } from "react";
import { Flame, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Recipe, RecipeCategory } from "@/types";
import type { Dictionary } from "@/i18n/dictionaries/en";

const CATEGORIES: { key: RecipeCategory | "all"; labelKey: keyof Dictionary }[] = [
  { key: "all", labelKey: "nutrition.categoryAll" },
  { key: "weight-loss", labelKey: "nutrition.categoryWeightLoss" },
  { key: "muscle-gain", labelKey: "nutrition.categoryMuscleGain" },
  { key: "fasting", labelKey: "nutrition.categoryFasting" },
  { key: "breakfast", labelKey: "nutrition.categoryBreakfast" },
  { key: "quick-easy", labelKey: "nutrition.categoryQuickEasy" },
];

export function RecipesSection({ recipes, dict }: { recipes: Recipe[]; dict: Dictionary }) {
  const [category, setCategory] = useState<RecipeCategory | "all">("all");

  const filtered = useMemo(
    () => (category === "all" ? recipes : recipes.filter((r) => r.category === category)),
    [recipes, category],
  );

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold">{dict["nutrition.recipesTitle"]}</h2>
          <p className="text-sm text-muted">{dict["nutrition.recipesSubtitle"]}</p>
        </div>
      </div>

      <p className="mb-4 text-xs text-faint">{dict["nutrition.recipesEstimateNote"]}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Badge
            key={c.key}
            variant={category === c.key ? "accent" : "neutral"}
            className="cursor-pointer px-3 py-1.5"
            onClick={() => setCategory(c.key)}
          >
            {dict[c.labelKey]}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <Card key={r.id} className="p-0">
            <div className="h-24 rounded-t-[var(--radius)] bg-gradient-to-br from-green-deep to-surface-2" />
            <div className="p-4">
              <h3 className="font-serif font-semibold leading-tight">{r.name}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.tags.map((t) => (
                  <Badge key={t} variant="neutral" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Flame className="size-3.5 text-ember/70" />
                  {r.calories} kcal
                </span>
                <span>P {r.proteinG}g</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {r.minutes}m
                </span>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted">{dict["nutrition.noRecipesInCategory"]}</p>
        )}
      </div>
    </div>
  );
}
