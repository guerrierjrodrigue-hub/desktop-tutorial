import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { Journal } from "@/components/journal/journal";
import { getJournalEntries } from "@/lib/queries/journal";

export const metadata: Metadata = {
  title: "Journal",
};

export default async function JournalPage() {
  const entries = await getJournalEntries();

  return (
    <>
      <Topbar title="Journal" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <Journal initial={entries} />
      </main>
    </>
  );
}
