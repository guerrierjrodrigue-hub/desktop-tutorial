import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { IntervalTimer } from "@/components/course/interval-timer";
import { getRunSession } from "@/lib/queries/running";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict["course.timer.title"] };
}

export default async function RunSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const [dict, found] = await Promise.all([getDictionary(locale), getRunSession(id, locale)]);
  if (!found) notFound();
  const { session, planTitle, planSlug } = found;

  return (
    <>
      <Topbar title={dict["course.timer.title"]} />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:px-6">
        <Link
          href={`/course/plans/${planSlug}`}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {planTitle}
        </Link>
        <PageHeader title={session.title} subtitle={dict["course.timer.title"]} />
        <IntervalTimer sessionId={session.id} segments={session.segments} dict={dict} locale={locale} />
      </main>
    </>
  );
}
