import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { ProgramCard } from "@/components/fitness/program-card";
import { Badge } from "@/components/ui/badge";
import { getPrograms } from "@/lib/queries/programs";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import type { ProgramCategory } from "@/types";
import type { DictionaryKey } from "@/i18n/dictionaries/en";

export const metadata: Metadata = {
  title: "Fitness",
  description: "Guided Christian fitness programs — strength, HIIT, running, mobility, and bodyweight.",
};

const categories: { key: ProgramCategory | "all"; labelKey: DictionaryKey }[] = [
  { key: "all", labelKey: "fitness.categoryAll" },
  { key: "strength", labelKey: "fitness.categoryStrength" },
  { key: "fat-loss", labelKey: "fitness.categoryFatLoss" },
  { key: "running", labelKey: "fitness.categoryRunning" },
  { key: "hiit", labelKey: "fitness.categoryHiit" },
  { key: "mobility", labelKey: "fitness.categoryMobility" },
  { key: "bodyweight", labelKey: "fitness.categoryBodyweight" },
];

export default async function FitnessPage() {
  const [programs, dict] = await Promise.all([getPrograms(), getDictionary(await getLocale())]);
  return (
    <>
      <Topbar title="Fitness" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <PageHeader title={dict["fitness.title"]} subtitle={dict["fitness.subtitle"]} />

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((c, i) => (
            <Badge
              key={c.key}
              variant={i === 0 ? "gold" : "neutral"}
              className="cursor-pointer px-3 py-1.5"
            >
              {dict[c.labelKey]}
            </Badge>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </main>
    </>
  );
}
