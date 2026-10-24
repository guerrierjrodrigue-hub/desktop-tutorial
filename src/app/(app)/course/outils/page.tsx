import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { RunningTools } from "@/components/course/running-tools";
import { ShoeManager } from "@/components/course/shoe-manager";
import { getRunShoes } from "@/lib/queries/running";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict["course.tools.title"] };
}

export default async function RunToolsPage() {
  const locale = await getLocale();
  const [dict, shoes] = await Promise.all([getDictionary(locale), getRunShoes()]);
  return (
    <>
      <Topbar title={dict["course.tools.title"]} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <Link href="/course" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground">
          <ArrowLeft className="size-4" /> {dict["course.title"]}
        </Link>
        <PageHeader title={dict["course.tools.title"]} subtitle={dict["course.tools.subtitle"]} />
        <RunningTools dict={dict} locale={locale} />
        <div className="mt-5">
          <ShoeManager dict={dict} initial={shoes} />
        </div>
      </main>
    </>
  );
}
