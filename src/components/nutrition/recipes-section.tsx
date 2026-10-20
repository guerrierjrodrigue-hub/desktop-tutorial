"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flame, Clock, UtensilsCrossed, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Recipe, RecipeCategory } from "@/types";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** Recipe thumbnail: a real stored photo when one exists, else a palette
 *  placeholder (dark surface with a discreet gold utensils mark) — no random
 *  colours. */
function RecipeThumb({ recipe, className }: { recipe: Recipe; className: string }) {
  if (recipe.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={recipe.imageUrl} alt="" aria-hidden="true" className={`${className} object-cover`} />;
  }
  return (
    <div
      aria-hidden="true"
      className={`${className} grid place-items-center bg-gradient-to-br from-surface-2 to-elevated`}
    >
      <UtensilsCrossed className="size-7 text-accent/70" />
    </div>
  );
}

const CATEGORIES: { key: RecipeCategory | "all"; labelKey: keyof Dictionary }[] = [
  { key: "all", labelKey: "nutrition.categoryAll" },
  { key: "weight-loss", labelKey: "nutrition.categoryWeightLoss" },
  { key: "muscle-gain", labelKey: "nutrition.categoryMuscleGain" },
  { key: "fasting", labelKey: "nutrition.categoryFasting" },
  { key: "breakfast", labelKey: "nutrition.categoryBreakfast" },
  { key: "quick-easy", labelKey: "nutrition.categoryQuickEasy" },
];

const PAGE_SIZE = 18;

export function RecipesSection({ recipes, dict }: { recipes: Recipe[]; dict: Dictionary }) {
  const [category, setCategory] = useState<RecipeCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      recipes.filter(
        (r) =>
          (category === "all" || r.category === category) &&
          (q === "" || r.name.toLowerCase().includes(q)),
      ),
    [recipes, category, q],
  );

  // Any filter change resets pagination back to the first page. Adjusting state
  // during render (the React-recommended alternative to a reset effect) keeps
  // the visible count in sync without a cascading re-render.
  const filterKey = `${category}|${q}`;
  const [shownFilterKey, setShownFilterKey] = useState(filterKey);
  if (filterKey !== shownFilterKey) {
    setShownFilterKey(filterKey);
    setVisible(PAGE_SIZE);
  }

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold">{dict["nutrition.recipesTitle"]}</h2>
          <p className="text-sm text-muted">{dict["nutrition.recipesSubtitle"]}</p>
        </div>
      </div>

      <p className="mb-4 text-xs text-faint">{dict["nutrition.recipesEstimateNote"]}</p>

      <label className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
        <Search className="size-4 shrink-0 text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict["nutrition.searchRecipesPlaceholder"]}
          aria-label={dict["nutrition.searchRecipesAria"]}
          className="w-full bg-transparent text-sm outline-none placeholder:text-faint"
        />
      </label>

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
        {shown.map((r) => (
          <Link
            key={r.id}
            href={`/nutrition/${r.id}`}
            aria-label={dict["nutrition.viewRecipe"].replace("{name}", r.name)}
            className="group rounded-[var(--radius)] outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Card className="h-full p-0 transition group-hover:border-accent/40">
              <RecipeThumb recipe={r} className="h-24 w-full rounded-t-[var(--radius)]" />
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
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted">
            {query.trim()
              ? dict["nutrition.noRecipesMatch"]
              : dict["nutrition.noRecipesInCategory"]}
          </p>
        )}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-full border border-border bg-surface-2 px-5 py-2 text-sm font-medium transition hover:border-accent/40 hover:text-foreground"
          >
            {dict["nutrition.seeMore"]}
          </button>
        </div>
      )}
    </div>
  );
}
