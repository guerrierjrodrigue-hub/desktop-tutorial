import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { APP_SUPPORT_EMAIL } from "@/lib/constants";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Dictionary, DictionaryKey } from "@/i18n/dictionaries/en";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["mkt.privacy.metaTitle"],
    description: dict["mkt.privacy.metaDescription"],
  };
}

/** Build a legal section from dictionary keys; splits paragraphs on blank lines
 *  and fills the {email} placeholder with the current support address. */
function section(dict: Dictionary, h: DictionaryKey, b: DictionaryKey) {
  return {
    heading: dict[h],
    body: dict[b].replace("{email}", APP_SUPPORT_EMAIL).split("\n\n"),
  };
}

export default async function PrivacyPage() {
  const dict = await getDictionary(await getLocale());

  return (
    <LegalPage
      title={dict["mkt.privacy.title"]}
      updated={dict["mkt.legal.updated"]}
      intro={dict["mkt.privacy.intro"]}
      sections={[
        section(dict, "mkt.privacy.s1.h", "mkt.privacy.s1.b"),
        section(dict, "mkt.privacy.s2.h", "mkt.privacy.s2.b"),
        section(dict, "mkt.privacy.s3.h", "mkt.privacy.s3.b"),
        section(dict, "mkt.privacy.s4.h", "mkt.privacy.s4.b"),
        section(dict, "mkt.privacy.s5.h", "mkt.privacy.s5.b"),
        section(dict, "mkt.privacy.s6.h", "mkt.privacy.s6.b"),
        section(dict, "mkt.privacy.s7.h", "mkt.privacy.s7.b"),
        section(dict, "mkt.privacy.s9.h", "mkt.privacy.s9.b"),
        section(dict, "mkt.privacy.s10.h", "mkt.privacy.s10.b"),
        section(dict, "mkt.privacy.s8.h", "mkt.privacy.s8.b"),
      ]}
    />
  );
}
