import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { RunnerOnboarding } from "@/components/course/runner-onboarding";
import { getRunnerOnboarding } from "@/lib/queries/running";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict["course.start.title"] };
}

export default async function RunnerStartPage() {
  const locale = await getLocale();
  const [dict, onboarding] = await Promise.all([getDictionary(locale), getRunnerOnboarding()]);

  return (
    <>
      <Topbar title={dict["course.start.title"]} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <Link href="/course" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground">
          <ArrowLeft className="size-4" /> {dict["course.title"]}
        </Link>
        <PageHeader title={dict["course.start.title"]} subtitle={dict["course.start.subtitle"]} />
        <RunnerOnboarding dict={dict} initialLevel={onboarding.level} initialGoal={onboarding.goalKind} />
      </main>
    </>
  );
}
