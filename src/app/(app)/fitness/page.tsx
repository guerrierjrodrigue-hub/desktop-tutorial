import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { ProgramCard } from "@/components/fitness/program-card";
import { Badge } from "@/components/ui/badge";
import { programs } from "@/data/programs";
import type { ProgramCategory } from "@/types";

export const metadata: Metadata = {
  title: "Fitness",
  description: "Guided Christian fitness programs — strength, HIIT, running, mobility, and bodyweight.",
};

const categories: { key: ProgramCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "strength", label: "Strength" },
  { key: "fat-loss", label: "Fat loss" },
  { key: "running", label: "Running" },
  { key: "hiit", label: "HIIT" },
  { key: "mobility", label: "Mobility" },
  { key: "bodyweight", label: "Bodyweight" },
];

export default function FitnessPage() {
  return (
    <>
      <Topbar title="Fitness" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <PageHeader
          title="Programs"
          subtitle="Train with intention. Every program is built around progression, form, and rest."
        />

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((c, i) => (
            <Badge
              key={c.key}
              variant={i === 0 ? "gold" : "neutral"}
              className="cursor-pointer px-3 py-1.5"
            >
              {c.label}
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
