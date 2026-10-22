import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { NewRunForm } from "@/components/course/new-run-form";
import { getUserTimezone } from "@/lib/timezone";
import { getUserToday } from "@/lib/date";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict["course.new.title"] };
}

export default async function NewRunPage() {
  const locale = await getLocale();
  const [dict, tz] = await Promise.all([getDictionary(locale), getUserTimezone()]);
  const today = getUserToday(tz);

  return (
    <>
      <Topbar title={dict["course.new.title"]} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <Link
          href="/course"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {dict["course.title"]}
        </Link>
        <PageHeader title={dict["course.new.title"]} subtitle={dict["course.new.subtitle"]} />
        <NewRunForm dict={dict} today={today} />
      </main>
    </>
  );
}
