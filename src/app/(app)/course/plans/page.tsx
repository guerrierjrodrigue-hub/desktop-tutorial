import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Route, ChevronRight } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getRunPlans } from "@/lib/queries/running";
import { formatKm } from "@/lib/running";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict["course.plans.title"] };
}

export default async function RunPlansPage() {
  const locale = await getLocale();
  const [dict, plans] = await Promise.all([getDictionary(locale), getRunPlans(locale)]);

  return (
    <>
      <Topbar title={dict["course.plans.title"]} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        <Link href="/course" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground">
          <ArrowLeft className="size-4" /> {dict["course.title"]}
        </Link>
        <PageHeader title={dict["course.plans.title"]} subtitle={dict["course.plans.subtitle"]} />

        <div className="space-y-3">
          {plans.map((p) => (
            <Link
              key={p.slug}
              href={`/course/plans/${p.slug}`}
              className="block rounded-[var(--radius)] outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <Card className="flex items-center gap-4 transition hover:border-accent/40">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-bright">
                  <Route className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-lg font-semibold leading-tight">{p.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{p.description}</p>
                  <p className="mt-1 text-xs text-faint">
                    {p.weeks} {dict["course.plans.weeks"]}
                    {p.goalDistanceM ? ` · ${dict["course.plans.goal"]}: ${formatKm(p.goalDistanceM)} km` : ""}
                  </p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-faint" />
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
