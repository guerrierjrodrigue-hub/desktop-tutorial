import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { APP_SUPPORT_EMAIL } from "@/lib/constants";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Dictionary, DictionaryKey } from "@/i18n/dictionaries/en";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["mkt.help.metaTitle"],
    description: dict["mkt.help.metaDescription"],
  };
}

const categories: {
  titleKey: DictionaryKey;
  faqs: { q: DictionaryKey; a: DictionaryKey }[];
}[] = [
  {
    titleKey: "mkt.help.cat1.title",
    faqs: [
      { q: "mkt.help.cat1.q1", a: "mkt.help.cat1.a1" },
      { q: "mkt.help.cat1.q2", a: "mkt.help.cat1.a2" },
    ],
  },
  {
    titleKey: "mkt.help.cat2.title",
    faqs: [
      { q: "mkt.help.cat2.q1", a: "mkt.help.cat2.a1" },
      { q: "mkt.help.cat2.q2", a: "mkt.help.cat2.a2" },
    ],
  },
  {
    titleKey: "mkt.help.cat3.title",
    faqs: [
      { q: "mkt.help.cat3.q1", a: "mkt.help.cat3.a1" },
      { q: "mkt.help.cat3.q2", a: "mkt.help.cat3.a2" },
    ],
  },
  {
    titleKey: "mkt.help.cat4.title",
    faqs: [
      { q: "mkt.help.cat4.q1", a: "mkt.help.cat4.a1" },
      { q: "mkt.help.cat4.q2", a: "mkt.help.cat4.a2" },
    ],
  },
];

export default async function HelpPage() {
  const dict: Dictionary = await getDictionary(await getLocale());

  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-8 pt-20 text-center">
          <Reveal>
            <Badge variant="gold">{dict["mkt.footer.help"]}</Badge>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              {dict["mkt.help.title"]}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-muted">
              {dict["mkt.help.subtitlePre"]}
              <Link href="/contact" className="text-gold-bright hover:underline">
                {dict["mkt.help.subtitleLink"]}
              </Link>
              .
            </p>
          </Reveal>
        </section>

        <section className="mx-auto max-w-3xl space-y-10 px-6 pb-24">
          {categories.map((cat, ci) => (
            <Reveal key={cat.titleKey} delay={ci * 0.05}>
              <h2 className="mb-4 font-serif text-xl font-semibold">{dict[cat.titleKey]}</h2>
              <div className="space-y-3">
                {cat.faqs.map((f) => (
                  <div key={f.q} className="glass rounded-2xl border border-border p-5">
                    <h3 className="font-semibold">{dict[f.q]}</h3>
                    <p className="mt-2 text-sm text-muted">{dict[f.a]}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}

          <Reveal className="glass rounded-2xl border border-border p-6 text-center">
            <p className="text-sm text-muted">
              {dict["mkt.help.stuckPre"]}
              <a href={`mailto:${APP_SUPPORT_EMAIL}`} className="text-gold-bright hover:underline">
                {APP_SUPPORT_EMAIL}
              </a>
              {dict["mkt.help.stuckPost"]}
            </p>
          </Reveal>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
