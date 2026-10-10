import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { isFreeMode } from "@/lib/flags";
import type { DictionaryKey } from "@/i18n/dictionaries/en";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["mkt.nav.pricing"],
    description: dict["mkt.pricingPage.metaDescription"],
  };
}

const faqs: { q: DictionaryKey; a: DictionaryKey }[] = [
  { q: "mkt.faq.cancel.q", a: "mkt.faq.cancel.a" },
  { q: "mkt.faq.trial.q", a: "mkt.faq.trial.a" },
  { q: "mkt.faq.giving.q", a: "mkt.faq.giving.a" },
];

export default async function PricingPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pb-8 pt-20 text-center">
          <Reveal>
            <Badge variant="accent">{dict["mkt.nav.pricing"]}</Badge>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              {dict["mkt.pricing.title"]}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              {dict["mkt.pricing.subtitle"]}
            </p>
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          {isFreeMode() ? (
            // FREE-BETA MODE: paid plans are replaced by a single free banner.
            // Flip APP_FREE_MODE off to restore the real plans in the else branch.
            <Reveal className="mx-auto max-w-2xl">
              <div className="glass ring-accent rounded-3xl border border-accent/30 bg-gradient-to-b from-accent/8 to-transparent px-8 py-12 text-center sm:px-12">
                <Badge variant="premium">{dict["mkt.freeMode.footerBadge"]}</Badge>
                <h2 className="mt-5 font-serif text-2xl font-semibold leading-snug sm:text-3xl">
                  {dict["mkt.freeMode.title"]}
                </h2>
                <div className="mt-8 flex justify-center">
                  <Link href="/signup">
                    <Button size="lg">{dict["mkt.freeMode.cta"]}</Button>
                  </Link>
                </div>
              </div>
            </Reveal>
          ) : (
            // Real paid plans (active whenever APP_FREE_MODE is off).
            <>
              <PricingPlans dict={dict} locale={locale} />

              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted">
                <ShieldCheck className="size-4 text-green-bright" />
                {dict["mkt.pricingPage.secure"]}
              </p>
            </>
          )}
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 pb-24">
          <h2 className="mb-6 text-center font-serif text-2xl font-semibold">
            {dict["mkt.pricingPage.faqTitle"]}
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <div
                key={f.q}
                className="glass rounded-2xl border border-border p-5"
              >
                <h3 className="font-semibold">{dict[f.q]}</h3>
                <p className="mt-2 text-sm text-muted">{dict[f.a]}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
