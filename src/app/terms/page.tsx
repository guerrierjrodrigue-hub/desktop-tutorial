import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { APP_SUPPORT_EMAIL } from "@/lib/constants";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Dictionary, DictionaryKey } from "@/i18n/dictionaries/en";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["mkt.terms.metaTitle"],
    description: dict["mkt.terms.metaDescription"],
  };
}

function section(dict: Dictionary, h: DictionaryKey, b: DictionaryKey) {
  return {
    heading: dict[h],
    body: dict[b].replace("{email}", APP_SUPPORT_EMAIL).split("\n\n"),
  };
}

export default async function TermsPage() {
  const dict = await getDictionary(await getLocale());

  return (
    <LegalPage
      title={dict["mkt.terms.title"]}
      updated={dict["mkt.legal.updated"]}
      intro={dict["mkt.terms.intro"]}
      sections={[
        section(dict, "mkt.terms.s1.h", "mkt.terms.s1.b"),
        section(dict, "mkt.terms.s2.h", "mkt.terms.s2.b"),
        section(dict, "mkt.terms.s3.h", "mkt.terms.s3.b"),
        section(dict, "mkt.terms.s4.h", "mkt.terms.s4.b"),
        section(dict, "mkt.terms.s5.h", "mkt.terms.s5.b"),
        section(dict, "mkt.terms.s6.h", "mkt.terms.s6.b"),
        section(dict, "mkt.terms.s7.h", "mkt.terms.s7.b"),
        section(dict, "mkt.terms.s8.h", "mkt.terms.s8.b"),
        section(dict, "mkt.terms.s9.h", "mkt.terms.s9.b"),
      ]}
    />
  );
}
