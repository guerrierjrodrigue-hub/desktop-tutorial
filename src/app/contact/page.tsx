import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, HelpCircle } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ContactForm } from "@/components/marketing/contact-form";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { APP_SUPPORT_EMAIL } from "@/lib/constants";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["mkt.contact.metaTitle"],
    description: dict["mkt.contact.metaDescription"],
  };
}

export default async function ContactPage() {
  const dict = await getDictionary(await getLocale());

  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-8 pt-20 text-center">
          <Reveal>
            <Badge variant="accent">{dict["mkt.contact.badge"]}</Badge>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              {dict["mkt.contact.title"]}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-muted">
              {dict["mkt.contact.subtitle"]}
            </p>
          </Reveal>
        </section>

        <section className="mx-auto grid max-w-5xl gap-5 px-6 pb-24 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <Card>
              <ContactForm dict={dict} />
            </Card>
          </Reveal>

          <Reveal delay={0.05} className="space-y-4">
            <Card className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent/12 text-accent-bright">
                <Mail className="size-4" />
              </span>
              <div>
                <h3 className="font-semibold">{dict["mkt.contact.emailTitle"]}</h3>
                <a
                  href={`mailto:${APP_SUPPORT_EMAIL}`}
                  className="text-sm text-accent-bright hover:underline"
                >
                  {APP_SUPPORT_EMAIL}
                </a>
                <p className="mt-1 text-xs text-faint">{dict["mkt.contact.replyTime"]}</p>
              </div>
            </Card>
            <Card className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-green/20 text-green-bright">
                <MessageCircle className="size-4" />
              </span>
              <div>
                <h3 className="font-semibold">{dict["mkt.contact.barnabasTitle"]}</h3>
                <p className="text-sm text-muted">{dict["mkt.contact.barnabasBody"]}</p>
              </div>
            </Card>
            <Card className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-ember/20 text-ember">
                <HelpCircle className="size-4" />
              </span>
              <div>
                <h3 className="font-semibold">{dict["mkt.contact.faqTitle"]}</h3>
                <p className="text-sm text-muted">
                  {dict["mkt.contact.faqBody"]}
                  <Link href="/help" className="text-accent-bright hover:underline">
                    {dict["mkt.footer.help"]}
                  </Link>
                  .
                </p>
              </div>
            </Card>
          </Reveal>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
