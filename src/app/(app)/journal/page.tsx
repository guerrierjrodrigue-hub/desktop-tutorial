import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { Journal } from "@/components/journal/journal";
import { getJournalEntries } from "@/lib/queries/journal";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["meta.journal"],
  };
}

export default async function JournalPage() {
  const locale = await getLocale();
  const [entries, dict] = await Promise.all([
    getJournalEntries(),
    getDictionary(locale),
  ]);

  return (
    <>
      <Topbar title={dict["nav.journal"]} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <Journal initial={entries} dict={dict} locale={locale} />
      </main>
    </>
  );
}
