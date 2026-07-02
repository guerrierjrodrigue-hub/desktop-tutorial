import type { Metadata } from "next";
import { Check, ShieldCheck } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { plans } from "@/data/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing for Kingdom Athlete. Start free, upgrade anytime.",
};

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel in a tap from your account settings — no calls, no guilt. Your access continues until the end of the billing period.",
  },
  {
    q: "What does the free trial include?",
    a: "The full Disciple experience for 7 days: every program, unlimited Barnabas coaching, nutrition tools, and reading plans. No card required to start.",
  },
  {
    q: "Is my giving to my church separate?",
    a: "Completely. Kingdom Athlete is a fitness & discipleship app; your subscription supports the product and never replaces your local church giving.",
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pb-8 pt-20 text-center">
          <Reveal>
            <Badge variant="gold">Pricing</Badge>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Invest in discipline that lasts
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Start free. Upgrade when you&apos;re ready. Cancel anytime.
            </p>
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.06}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl border p-7 ${
                    plan.highlighted
                      ? "border-gold/40 bg-gradient-to-b from-gold/8 to-transparent ring-gold"
                      : "glass border-border"
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="premium">Most popular</Badge>
                    </span>
                  )}
                  <h3 className="font-serif text-xl font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted">{plan.description}</p>
                  <p className="mt-5 flex items-baseline gap-1">
                    <span className="font-serif text-4xl font-semibold">
                      {plan.price}
                    </span>
                    <span className="text-muted">{plan.period}</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-gold-bright" />
                        <span className="text-muted">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <CheckoutButton
                    plan={plan.plan}
                    label={plan.cta}
                    className="mt-7 w-full"
                    variant={plan.highlighted ? "primary" : "secondary"}
                  />
                </div>
              </Reveal>
            ))}
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted">
            <ShieldCheck className="size-4 text-green-bright" />
            Secure payments by Stripe · 30-day money-back guarantee
          </p>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 pb-24">
          <h2 className="mb-6 text-center font-serif text-2xl font-semibold">
            Questions & answers
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <div
                key={f.q}
                className="glass rounded-2xl border border-border p-5"
              >
                <h3 className="font-semibold">{f.q}</h3>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
