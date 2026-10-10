import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_SUPPORT_EMAIL } from "@/lib/constants";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["mkt.careers.metaTitle"],
    description: dict["mkt.careers.metaDescription"],
  };
}

export default async function CareersPage() {
  const dict = await getDictionary(await getLocale());

  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-8 pt-20 text-center">
          <Reveal>
            <Badge variant="accent">{dict["mkt.footer.careers"]}</Badge>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              {dict["mkt.careers.title"]}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-muted">
              {dict["mkt.careers.subtitle"]}
            </p>
          </Reveal>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <Reveal className="glass rounded-2xl border border-border p-6 text-center">
            <p className="text-sm text-muted">
              {dict["mkt.careers.helloPre"]}
              <a
                href={`mailto:${APP_SUPPORT_EMAIL}?subject=${encodeURIComponent(dict["mkt.careers.mailSubject"])}`}
                className="font-medium text-accent-bright hover:underline"
              >
                {dict["mkt.careers.helloLink"]}
              </a>
              {dict["mkt.careers.helloPost"]}
            </p>
          </Reveal>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20">
          <Reveal className="glass ring-accent relative overflow-hidden rounded-3xl border border-accent/20 px-8 py-12 text-center sm:px-12">
            <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              {dict["mkt.careers.ctaTitle"]}
            </h2>
            <div className="mt-6 flex justify-center">
              <Link href="/about">
                <Button variant="secondary">{dict["mkt.careers.ctaButton"]}</Button>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
