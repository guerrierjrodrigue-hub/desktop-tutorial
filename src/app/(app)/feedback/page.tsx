import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict["meta.feedback"] };
}

export default async function FeedbackPage() {
  const dict = await getDictionary(await getLocale());

  return (
    <>
      <Topbar title={dict["nav.feedback"]} />
      <main id="contenu" className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <FeedbackForm dict={dict} />
      </main>
    </>
  );
}
