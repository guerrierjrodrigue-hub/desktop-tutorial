import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { Journal } from "@/components/journal/journal";
import { getJournalEntries } from "@/lib/queries/journal";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "Journal",
};

export default async function JournalPage() {
  const [entries, dict] = await Promise.all([
    getJournalEntries(),
    getDictionary(await getLocale()),
  ]);

  return (
    <>
      <Topbar title={dict["nav.journal"]} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <Journal initial={entries} />
      </main>
    </>
  );
}
