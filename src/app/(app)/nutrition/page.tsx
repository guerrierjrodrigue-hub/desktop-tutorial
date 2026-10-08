import type { Metadata } from "next";
import { Flame, Beef, Wheat, Droplet } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Ring } from "@/components/ui/ring";
import { Progress } from "@/components/ui/progress";
import { FoodLogger } from "@/components/nutrition/food-logger";
import { HydrationTracker } from "@/components/nutrition/hydration-tracker";
import { RecipesSection } from "@/components/nutrition/recipes-section";
import { getTodayStats } from "@/lib/queries/stats";
import { getFoodLogsToday, getRecipes } from "@/lib/queries/nutrition";
import { getCurrentUser } from "@/lib/queries/profile";
import { computeNutritionTargets } from "@/lib/nutrition-targets";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "Nutrition",
  description: "Track calories, macros, and hydration. Fuel your body to honor God.",
};

export default async function NutritionPage() {
  const locale = await getLocale();
  const [todayStats, foodLogs, recipes, user, dict] = await Promise.all([
    getTodayStats(),
    getFoodLogsToday(),
    getRecipes(locale),
    getCurrentUser(),
    getDictionary(locale),
  ]);
  const targets = computeNutritionTargets({
    weightKg: user.weightKg,
    heightCm: user.heightCm,
    birthDate: user.birthDate,
    gender: user.gender,
    trainingDays: user.trainingDays,
    goals: user.primaryGoals,
  });
  const consumed = foodLogs.reduce(
    (sum, e) => ({ calories: sum.calories + e.calories, proteinG: sum.proteinG + e.proteinG }),
    { calories: 0, proteinG: 0 },
  );

  const macros = [
    { label: "Protein", icon: Beef, value: consumed.proteinG, goal: targets.proteinG, color: "text-green-bright" },
    { label: "Carbs", icon: Wheat, value: 0, goal: targets.carbsG, color: "text-gold" },
    { label: "Fat", icon: Droplet, value: 0, goal: targets.fatG, color: "text-bronze" },
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
              value={consumed.calories / targets.calories}
              size={168}
              stroke={14}
              className="my-2"
              progressClassName="text-gold"
            >
              <div className="text-center">
                <p className="font-serif text-3xl font-semibold">
                  {targets.calories - consumed.calories}
                </p>
                <p className="text-xs text-muted">{dict["nutrition.kcalLeft"]}</p>
              </div>
            </Ring>
            <div className="flex w-full justify-between text-sm text-muted">
              <span>{consumed.calories} {dict["nutrition.eaten"]}</span>
              <span>{targets.calories} {dict["nutrition.goal"]}</span>
            </div>
            <p className="mt-3 text-center text-[11px] text-faint">
              {targets.isDefault
                ? dict["nutrition.defaultTargets"]
                : dict["nutrition.estimateDisclaimer"]}
            </p>
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
            <HydrationTracker
              initialMl={todayStats.waterMl}
              goalMl={targets.waterMl}
              dict={dict}
            />
          </Card>
        </div>

        {/* Food log */}
        <div className="mt-5">
          <FoodLogger initial={foodLogs} dict={dict} />
        </div>

        {/* Recipes */}
        <RecipesSection recipes={recipes} dict={dict} />
      </main>
    </>
  );
}
