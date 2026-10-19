import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Flame, Clock, Beef, Wheat, Droplet } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddToJournalButton } from "@/components/nutrition/add-to-journal-button";
import { getRecipe } from "@/lib/queries/nutrition";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const recipe = await getRecipe(id, locale);
  return { title: recipe ? recipe.name : (await getDictionary(locale))["meta.nutrition"] };
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const [recipe, dict] = await Promise.all([getRecipe(id, locale), getDictionary(locale)]);
  if (!recipe) notFound();

  const macros = [
    { label: dict["nutrition.protein"], icon: Beef, value: `${recipe.proteinG} g`, color: "text-green-bright" },
    { label: dict["nutrition.carbs"], icon: Wheat, value: `${recipe.carbsG} g`, color: "text-accent" },
    { label: dict["nutrition.fat"], icon: Droplet, value: `${recipe.fatG} g`, color: "text-ember" },
  ];

  return (
    <>
      <Topbar title={recipe.name} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        <Link
          href="/nutrition"
          className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> {dict["nutrition.backToRecipes"]}
        </Link>

        <Card className="mt-4 overflow-hidden p-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={recipe.imageUrl}
            alt=""
            aria-hidden="true"
            className="h-44 w-full object-cover sm:h-56"
          />
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              {recipe.estimatedDetails && (
                <Badge variant="neutral">{dict["nutrition.estimation"]}</Badge>
              )}
              {recipe.tags.map((t) => (
                <Badge key={t} variant="neutral" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
            <h1 className="mt-3 font-serif text-3xl font-semibold">{recipe.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <Flame className="size-4 text-ember/70" />
                {recipe.calories} kcal
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {recipe.minutes} min
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {macros.map((m) => (
                <div key={m.label} className="rounded-xl border border-border bg-surface-2 p-3 text-center">
                  <m.icon className={`mx-auto size-4 ${m.color}`} />
                  <p className="mt-1 font-serif text-lg font-semibold">{m.value}</p>
                  <p className="text-xs text-muted">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <AddToJournalButton
                name={recipe.name}
                calories={recipe.calories}
                proteinG={recipe.proteinG}
                carbsG={recipe.carbsG}
                fatG={recipe.fatG}
                dict={dict}
              />
            </div>
          </div>
        </Card>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{dict["nutrition.ingredients"]}</CardTitle>
            </CardHeader>
            <ul className="space-y-2 text-sm">
              {(recipe.ingredients ?? []).map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{dict["nutrition.steps"]}</CardTitle>
            </CardHeader>
            <ol className="space-y-3 text-sm">
              {(recipe.steps ?? []).map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent-bright">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {recipe.estimatedDetails && (
          <p className="mt-5 text-xs text-faint">{dict["nutrition.detailEstimateNote"]}</p>
        )}
      </main>
    </>
  );
}
