import type { Metadata } from "next";
import Link from "next/link";
import {
  Dumbbell,
  Apple,
  BookOpen,
  Sparkles,
  Trophy,
  Users,
  Check,
  Quote,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Hero } from "@/components/marketing/hero";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { programs } from "@/data/programs";
import { readingPlans } from "@/data/spiritual";
import { COACHES } from "@/data/coaches";
import { testimonials } from "@/data/testimonials";
import { APP_NAME } from "@/lib/constants";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { isFreeMode } from "@/lib/flags";
import type { Dictionary, DictionaryKey } from "@/i18n/dictionaries/en";
import type { LocaleCode } from "@/i18n/locales";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: { absolute: `${APP_NAME} — ${dict["mkt.tagline"]}` },
    description: dict["mkt.meta.homeDescription"],
  };
}

const features: { icon: typeof Dumbbell; title: DictionaryKey; body: DictionaryKey }[] = [
  { icon: Dumbbell, title: "mkt.features.programs.title", body: "mkt.features.programs.body" },
  { icon: Apple, title: "mkt.features.nutrition.title", body: "mkt.features.nutrition.body" },
  { icon: BookOpen, title: "mkt.features.scripture.title", body: "mkt.features.scripture.body" },
  { icon: Sparkles, title: "mkt.features.coach.title", body: "mkt.features.coach.body" },
  { icon: Trophy, title: "mkt.features.gamified.title", body: "mkt.features.gamified.body" },
  { icon: Users, title: "mkt.features.community.title", body: "mkt.features.community.body" },
];

// Computed from the shipped content so the numbers can never drift from reality.
const pillars: { value: number; label: DictionaryKey }[] = [
  { value: programs.length, label: "mkt.inside.programs" },
  {
    value: programs.flatMap((p) => p.schedule.flatMap((w) => w.days)).length,
    label: "mkt.inside.sessions",
  },
  { value: readingPlans.length, label: "mkt.inside.readingPlans" },
  { value: COACHES.length, label: "mkt.inside.coaches" },
];

const barnabasPoints: DictionaryKey[] = [
  "mkt.barnabas.point1",
  "mkt.barnabas.point2",
  "mkt.barnabas.point3",
  "mkt.barnabas.point4",
];

export default async function LandingPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const freeMode = isFreeMode();

  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <Hero dict={dict} freeMode={freeMode} />

        {/* Social proof: what's inside, in real numbers */}
        <section
          aria-labelledby="inside-heading"
          className="border-y border-border bg-surface/30 py-10"
        >
          <h2
            id="inside-heading"
            className="text-center text-xs font-semibold uppercase tracking-widest text-muted"
          >
            {dict["mkt.inside.heading"]}
          </h2>
          <div className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-6 px-6 sm:grid-cols-4">
            {pillars.map((p) => (
              <div key={p.label} className="text-center">
                <p className="font-serif text-3xl font-semibold text-gradient-gold">
                  {p.value.toLocaleString(locale)}
                </p>
                <p className="mt-1 text-sm text-muted">{dict[p.label]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="gold">{dict["mkt.features.badge"]}</Badge>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {dict["mkt.features.title"]}
            </h2>
            <p className="mt-4 text-muted">{dict["mkt.features.intro"]}</p>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <div className="glass group h-full rounded-2xl border border-border p-6 transition hover:border-gold/30">
                  <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-gold/15 to-transparent text-gold-bright ring-1 ring-gold/20">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold">
                    {dict[f.title]}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {dict[f.body]}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Barnabas */}
        <section id="barnabas" className="mx-auto max-w-6xl px-6 py-16">
          <div className="glass overflow-hidden rounded-3xl border border-border">
            <div className="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2">
              <Reveal>
                <Badge variant="premium">{dict["mkt.barnabas.badge"]}</Badge>
                <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  {dict["mkt.barnabas.title"]}
                </h2>
                <p className="mt-4 text-muted">{dict["mkt.barnabas.body"]}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {barnabasPoints.map((key) => (
                    <li key={key} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-green-bright" />
                      <span className="text-muted">{dict[key]}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <ChatBubble role="assistant">{dict["mkt.chat.coach1"]}</ChatBubble>
                  <ChatBubble role="user">{dict["mkt.chat.user1"]}</ChatBubble>
                  <ChatBubble role="assistant">{dict["mkt.chat.coach2"]}</ChatBubble>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Conviction */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <Reveal>
            <Quote className="mx-auto size-8 text-gold/50" />
            <p className="mt-6 font-serif text-2xl font-medium leading-snug sm:text-3xl">
              {dict["mkt.verse.full"]}
            </p>
            <p className="mt-6 text-sm text-muted">{dict["mkt.verse.fullRef"]}</p>
          </Reveal>
        </section>

        <Testimonials dict={dict} />

        <Pricing dict={dict} locale={locale} />

        {/* Final CTA */}
        <section className="mx-auto max-w-5xl px-6 py-20">
          <Reveal className="glass ring-gold relative overflow-hidden rounded-3xl border border-gold/20 px-8 py-14 text-center sm:px-12">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {dict["mkt.cta.title1"]}{" "}
              <span className="text-gradient-gold">{dict["mkt.cta.title2"]}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              {dict[freeMode ? "mkt.cta.bodyFree" : "mkt.cta.body"]}
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/signup">
                <Button size="lg">{dict["mkt.cta.button"]}</Button>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function ChatBubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "bg-surface-2 text-foreground"
            : "bg-gradient-to-br from-green-deep to-green/40 text-foreground"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/** Hidden until real member quotes are added to src/data/testimonials.ts. */
function Testimonials({ dict }: { dict: Dictionary }) {
  if (testimonials.length === 0) return null;
  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-6 py-16">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Badge variant="gold">{dict["mkt.testimonials.badge"]}</Badge>
        <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {dict["mkt.testimonials.title"]}
        </h2>
      </Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.05}>
            <figure className="glass flex h-full flex-col rounded-2xl border border-border p-6">
              <Quote className="size-5 text-gold/50" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-semibold">{t.name}</span>
                {t.context && <span className="block text-muted">{t.context}</span>}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Pricing({ dict, locale }: { dict: Dictionary; locale: LocaleCode }) {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Badge variant="gold">{dict["mkt.pricing.badge"]}</Badge>
        <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {dict["mkt.pricing.title"]}
        </h2>
        <p className="mt-4 text-muted">{dict["mkt.pricing.subtitle"]}</p>
      </Reveal>

      <div className="mt-14">
        <PricingPlans dict={dict} locale={locale} />
      </div>
    </section>
  );
}
