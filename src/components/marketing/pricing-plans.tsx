import { Check } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { plans } from "@/data/pricing";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { LocaleCode } from "@/i18n/locales";

function formatPrice(usd: number, locale: LocaleCode) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(usd);
}

/** The three plan cards, shared by the landing page and /pricing. */
export function PricingPlans({ dict, locale }: { dict: Dictionary; locale: LocaleCode }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {plans.map((plan, i) => (
        <Reveal key={plan.plan} delay={i * 0.06}>
          <div
            className={`relative flex h-full flex-col rounded-2xl border p-7 ${
              plan.highlighted
                ? "border-gold/40 bg-gradient-to-b from-gold/8 to-transparent ring-gold"
                : "glass border-border"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="premium">{dict["mkt.pricing.mostPopular"]}</Badge>
              </span>
            )}
            <h3 className="font-serif text-xl font-semibold">{dict[plan.nameKey]}</h3>
            <p className="mt-1 text-sm text-muted">{dict[plan.descriptionKey]}</p>
            <p className="mt-5 flex items-baseline gap-1">
              <span className="font-serif text-4xl font-semibold">
                {plan.priceUsd === null
                  ? dict["mkt.pricing.free"]
                  : formatPrice(plan.priceUsd, locale)}
              </span>
              <span className="text-muted">
                {plan.plan === "monthly" && dict["mkt.pricing.perMonth"]}
                {plan.plan === "annual" && dict["mkt.pricing.perYear"]}
              </span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {plan.featureKeys.map((key) => (
                <li key={key} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold-bright" />
                  <span className="text-muted">{dict[key]}</span>
                </li>
              ))}
            </ul>
            <CheckoutButton
              plan={plan.plan}
              label={dict[plan.ctaKey]}
              className="mt-7 w-full"
              variant={plan.highlighted ? "primary" : "secondary"}
            />
          </div>
        </Reveal>
      ))}
    </div>
  );
}
