import type { Metadata } from "next";
import { Flame, Beef, Wheat, Droplet } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Ring } from "@/components/ui/ring";
import { Progress } from "@/components/ui/progress";
import { FoodLogger } from "@/components/nutrition/food-logger";
import { RecipesSection } from "@/components/nutrition/recipes-section";
import { macroTargets } from "@/data/nutrition";
import { getTodayStats } from "@/lib/queries/stats";
import { getFoodLogsToday, getRecipes } from "@/lib/queries/nutrition";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "Nutrition",
  description: "Track calories, macros, and hydration. Fuel your body to honor God.",
};

export default async function NutritionPage() {
  const [todayStats, foodLogs, recipes, dict] = await Promise.all([
    getTodayStats(),
    getFoodLogsToday(),
    getRecipes(),
    getDictionary(await getLocale()),
  ]);
  const consumed = foodLogs.reduce(
    (sum, e) => ({ calories: sum.calories + e.calories, proteinG: sum.proteinG + e.proteinG }),
    { calories: 0, proteinG: 0 },
  );

  const macros = [
    { label: "Protein", icon: Beef, value: consumed.proteinG, goal: macroTargets.proteinG, color: "text-green-bright" },
    { label: "Carbs", icon: Wheat, value: 0, goal: macroTargets.carbsG, color: "text-gold" },
    { label: "Fat", icon: Droplet, value: 0, goal: macroTargets.fatG, color: "text-bronze" },
  ];

  return (
    <>
      <Topbar title="Nutrition" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <PageHeader
          title="Nutrition"
          subtitle="Fuel with intention — track calories, macros, and hydration."
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Calories ring */}
          <Card className="flex flex-col items-center justify-center">
            <CardTitle className="self-start">Calories</CardTitle>
            <Ring
              value={consumed.calories / macroTargets.calories}
              size={168}
              stroke={14}
              className="my-2"
              progressClassName="text-gold"
            >
              <div className="text-center">
                <p className="font-serif text-3xl font-semibold">
                  {macroTargets.calories - consumed.calories}
                </p>
                <p className="text-xs text-muted">kcal left</p>
              </div>
            </Ring>
            <div className="flex w-full justify-between text-sm text-muted">
              <span>{consumed.calories} eaten</span>
              <span>{macroTargets.calories} goal</span>
            </div>
          </Card>

          {/* Macros */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Macros</CardTitle>
              <Flame className="size-4 text-gold/70" />
            </CardHeader>
            <div className="space-y-5">
              {macros.map((m) => (
                <div key={m.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <m.icon className={`size-4 ${m.color}`} />
                      {m.label}
                    </span>
                    <span className="text-muted">
                      {m.value}g / {m.goal}g
                    </span>
                  </div>
                  <Progress
                    value={m.value / m.goal}
                    barClassName={
                      m.label === "Protein"
                        ? "from-green to-green-bright"
                        : m.label === "Fat"
                          ? "from-bronze to-gold-deep"
                          : "from-gold to-gold-bright"
                    }
                  />
                </div>
              ))}
            </div>

            {/* Hydration */}
            <div className="mt-6 rounded-xl border border-border bg-surface-2 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <Droplet className="size-4 text-bronze" /> Hydration
                </span>
                <span className="text-muted">
                  {(todayStats.waterMl / 1000).toFixed(1)}L /{" "}
                  {todayStats.waterGoalMl / 1000}L
                </span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-8 flex-1 rounded-md ${
                      i < Math.round((todayStats.waterMl / todayStats.waterGoalMl) * 8)
                        ? "bg-gradient-to-t from-bronze to-gold"
                        : "bg-elevated"
                    }`}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Food log */}
        <div className="mt-5">
          <FoodLogger initial={foodLogs} />
        </div>

        {/* Recipes */}
        <RecipesSection recipes={recipes} dict={dict} />
      </main>
    </>
  );
}
