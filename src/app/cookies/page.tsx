import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { APP_SUPPORT_EMAIL } from "@/lib/constants";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Dictionary, DictionaryKey } from "@/i18n/dictionaries/en";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["mkt.cookies.metaTitle"],
    description: dict["mkt.cookies.metaDescription"],
  };
}

function section(dict: Dictionary, h: DictionaryKey, b: DictionaryKey) {
  return {
    heading: dict[h],
    body: dict[b].replace("{email}", APP_SUPPORT_EMAIL).split("\n\n"),
  };
}

export default async function CookiesPage() {
  const dict = await getDictionary(await getLocale());

  return (
    <LegalPage
      title={dict["mkt.cookies.title"]}
      updated={dict["mkt.legal.updated"]}
      intro={dict["mkt.cookies.intro"]}
      sections={[
        section(dict, "mkt.cookies.s1.h", "mkt.cookies.s1.b"),
        section(dict, "mkt.cookies.s2.h", "mkt.cookies.s2.b"),
        section(dict, "mkt.cookies.s3.h", "mkt.cookies.s3.b"),
        section(dict, "mkt.cookies.s4.h", "mkt.cookies.s4.b"),
        section(dict, "mkt.cookies.s5.h", "mkt.cookies.s5.b"),
      ]}
    />
  );
}
