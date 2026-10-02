import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { FocusTimer } from "@/components/mind/focus-timer";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "Focus",
};

export default async function FocusPage() {
  const dict = await getDictionary(await getLocale());

  return (
    <>
      <Topbar title={dict["nav.focus"]} />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 sm:px-6">
        <FocusTimer />
      </main>
    </>
  );
}
