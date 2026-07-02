import type { Metadata } from "next";
import { Flame, Beef, Wheat, Droplet, Clock, Plus } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Ring } from "@/components/ui/ring";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { recipes, macroTargets } from "@/data/nutrition";
import { todayStats } from "@/data/dashboard";

export const metadata: Metadata = {
  title: "Nutrition",
  description: "Track calories, macros, and hydration. Fuel your body to honor God.",
};

const consumed = { calories: 1620, proteinG: 96, carbsG: 168, fatG: 52 };

export default function NutritionPage() {
  const macros = [
    { label: "Protein", icon: Beef, value: consumed.proteinG, goal: macroTargets.proteinG, color: "text-green-bright" },
    { label: "Carbs", icon: Wheat, value: consumed.carbsG, goal: macroTargets.carbsG, color: "text-gold" },
    { label: "Fat", icon: Droplet, value: consumed.fatG, goal: macroTargets.fatG, color: "text-bronze" },
  ];

  return (
    <>
      <Topbar title="Nutrition" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <PageHeader
          title="Nutrition"
          subtitle="Fuel with intention — track calories, macros, and hydration."
        >
          <Button size="sm">
            <Plus className="size-4" /> Log food
          </Button>
        </PageHeader>

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

        {/* Recipes */}
        <div className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold">Recipes</h2>
              <p className="text-sm text-muted">
                High-protein, whole-food meals to fuel your training.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => (
              <Card key={r.id} className="p-0">
                <div className="h-24 rounded-t-[var(--radius)] bg-gradient-to-br from-green-deep to-surface-2" />
                <div className="p-4">
                  <h3 className="font-serif font-semibold leading-tight">
                    {r.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.tags.map((t) => (
                      <Badge key={t} variant="neutral" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Flame className="size-3.5 text-gold/70" />
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
          </div>
        </div>
      </main>
    </>
  );
}
