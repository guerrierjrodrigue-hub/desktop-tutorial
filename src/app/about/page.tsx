import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, Dumbbell, BookOpen, Users } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import type { DictionaryKey } from "@/i18n/dictionaries/en";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["mkt.about.metaTitle"],
    description: dict["mkt.about.metaDescription"],
  };
}

const pillars: {
  icon: typeof Dumbbell;
  titleKey: DictionaryKey;
  bodyKey: DictionaryKey;
}[] = [
  {
    icon: Dumbbell,
    titleKey: "mkt.about.pillar.discipline.title",
    bodyKey: "mkt.about.pillar.discipline.body",
  },
  {
    icon: BookOpen,
    titleKey: "mkt.about.pillar.grace.title",
    bodyKey: "mkt.about.pillar.grace.body",
  },
  {
    icon: Users,
    titleKey: "mkt.about.pillar.community.title",
    bodyKey: "mkt.about.pillar.community.body",
  },
  {
    icon: HeartHandshake,
    titleKey: "mkt.about.pillar.stewardship.title",
    bodyKey: "mkt.about.pillar.stewardship.body",
  },
];

export default async function AboutPage() {
  const dict = await getDictionary(await getLocale());

  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-8 pt-20 text-center">
          <Reveal>
            <Badge variant="gold">{dict["mkt.about.badge"]}</Badge>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              {dict["mkt.about.title"]}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-muted">
              {dict["mkt.about.subtitle"]}
            </p>
          </Reveal>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-10">
          <Reveal className="glass space-y-4 rounded-3xl border border-border p-8 text-sm leading-relaxed text-muted sm:p-10">
            <p>{dict["mkt.about.story1"]}</p>
            <p>{dict["mkt.about.story2"]}</p>
            <p>{dict["mkt.about.story3"]}</p>
          </Reveal>
        </section>

        {/* Mission */}
        <section id="mission" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="green">{dict["mkt.about.missionBadge"]}</Badge>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {dict["mkt.footer.missionStatement"]}
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p, i) => (
              <Reveal key={p.titleKey} delay={i * 0.05}>
                <div className="glass h-full rounded-2xl border border-border p-6">
                  <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-gold/15 to-transparent text-gold-bright ring-1 ring-gold/20">
                    <p.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold">{dict[p.titleKey]}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{dict[p.bodyKey]}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 py-20">
          <Reveal className="glass ring-gold relative overflow-hidden rounded-3xl border border-gold/20 px-8 py-14 text-center sm:px-12">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {dict["mkt.about.ctaTitle"]}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              {dict["mkt.about.ctaBody"]}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/careers">
                <Button size="lg">{dict["mkt.footer.careers"]}</Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="secondary">
                  {dict["mkt.about.ctaContact"]}
                </Button>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
